import {Shader} from "../modules/class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import * as vec4 from "../lib/gl-matrix/vec4.js"
import {toRadian} from "../lib/gl-matrix/common.js"

"use strict";

function init_lights({gl, V})
{
    let lights = {
        ceiling:{
            position:[0, .9, 0, 1], 
            direction:[0,-1,0,0],
            cutoff_angle:180,
            ambient: [.1, .1, .1, 1.0], 
            diffuse: [.5, .5, .5, 1.0], 
            specular:[.5, .5, .5, 1.0],
            position_transformed:null
        },
        luxo:{
            position:[0, 0, 0, 1], 
            direction:[0,-1,0,0],
            cutoff_angle:30,
            ambient: [0.5, 0.5, 0.5, 1.0], 
            diffuse: [1.0, 1.0, 1.0, 1.0], 
            specular: [1.0, 1.0, 1.0, 1.0],
            position_transformed:null
        }
    };

    vec4.transformMat4(lights.ceiling.position, lights.ceiling.position, V);
    vec4.transformMat4(lights.ceiling.direction, lights.ceiling.direction, V);

    return lights;
};


function main()
{
    const loc_aPosition = 4;
    const loc_aColor = 1;
    const loc_aNormal = 8;
    const numLights = 2;

    let src_vert_axes = 
    `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aColor}) in vec4 aColor;
    uniform mat4 VP;
    out vec4 vColor;
    void main()
    {
        gl_Position = VP * aPosition;
        gl_PointSize = 10.0;
        vColor = aColor;
    }
    `;
    let src_frag_axes =
    `#version 300 es
    precision mediump float;
    in vec4 vColor;
    out vec4 fColor;
    void main()
    {
        fColor = vColor;
    }
    `;
    let src_vert_lighting =
    `#version 300 es
     // eye coordinate system
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aNormal}) in vec3 aNormal;
    uniform mat4 MVP;
    uniform mat4 MV;
    uniform mat4 matNormal;
    out vec3 vNormal;
    out vec4 vPosWorld;
    void main()
    {
        vPosWorld = MV*aPosition;
        vNormal = normalize((matNormal*vec4(aNormal,0)).xyz);
        gl_Position = MVP*aPosition;
    }
    `;
    let src_frag_lighting =
    `#version 300 es
     // eye coordinate system
     #ifdef GL_ES
     precision mediump float;
     #endif
    in vec4 vPosWorld;
    in vec3 vNormal;
    out vec4 fColor;
    struct TMaterial
    {
        vec3    ambient;
        vec3    diffuse;
        vec3    specular;
        vec3    emission;
        float   shininess;
    };
    struct TLight
    {
        vec4    position;
        vec4    direction;
        float   cutoff_angle; // cosine of the cut-off angle
        vec4    ambient;
        vec4    diffuse;
        vec4    specular;
    };
    uniform TMaterial   material;
    uniform TLight      lights[${numLights}];
    void main()
    {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(-vPosWorld.xyz);
         fColor = vec4(0,0,0,1);
         for(int i=0 ; i<${numLights} ; i++)
         {
            vec3    l = normalize((lights[i].position - vPosWorld).xyz);
            vec3    r = reflect(-l, n);
            float   l_dot_n = max(dot(l, n), 0.0);
            vec3    ambient = lights[i].ambient.rgb * material.ambient;
            vec3    diffuse = lights[i].diffuse.rgb * material.diffuse * l_dot_n;
            vec3    specular = vec3(0.0);
            if(l_dot_n > 0.0)
            {
                specular = lights[i].specular.rgb * material.specular * pow(max(dot(r, v), 0.0), material.shininess);
            }
            if(dot(-l,lights[i].direction.xyz) < lights[i].cutoff_angle)
            {
                diffuse = vec3(0);
                specular = vec3(0);
            }
            fColor.rgb += ambient + diffuse + specular;
         }
    }
    `;
    

    let canvas = document.getElementById('webgl');
    let gl = canvas.getContext("webgl2");

    gl.enable(gl.DEPTH_TEST);

    let shaders = {};
    
    shaders.axes = new Shader(gl, src_vert_axes, src_frag_axes, ["VP"]);
    

    let objects = {};
    objects.axes = init_vbo_axes({gl, loc_aPosition, loc_aColor});
    objects.walls = init_vbo_walls({gl, loc_aPosition, loc_aNormal});
    objects.luxo = init_vbo_luxo({gl, loc_aPosition, loc_aNormal});
    
    let {V,P} = init_xforms(gl);

    let uniform_vars = ["VP", "MV", "MVP", "matNormal"];
    for(let i=0 ; i<numLights ; i++)
    {
        uniform_vars.push(`lights[${i}].position`);
        uniform_vars.push(`lights[${i}].direction`);
        uniform_vars.push(`lights[${i}].cutoff_angle`);
        uniform_vars.push(`lights[${i}].ambient`);
        uniform_vars.push(`lights[${i}].diffuse`);
        uniform_vars.push(`lights[${i}].specular`);
    }
    uniform_vars.push("material.ambient");
    uniform_vars.push("material.diffuse");
    uniform_vars.push("material.specular");
    uniform_vars.push("material.shininess");
   
    shaders.model = new Shader(gl, src_vert_lighting, src_frag_lighting, uniform_vars);
    
    let lights = init_lights({gl, V});

    for(let name of ["x", "z", "shoulder-1", "shoulder-2", "elbow", 
                    "lower", "upper", "head-1", "head-2", "cutoff"])
    {
        document.getElementById(name).onchange 
            = document.getElementById(name).oninput 
            = (ev) => refresh_scene({gl, shaders, objects, lights, matrices:{M:null, V, P}}); 
    }

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    refresh_scene({gl, shaders, objects, lights, matrices:{M:null, V, P}});
}

function refresh_scene({gl, shaders, objects, lights, matrices})
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(let name of ["x", "z", "lower", "upper"])
    {
        let e_slider = document.getElementById(name);
        let e_span = document.getElementById(name + "-value");
        e_span.innerHTML = (e_slider.value*0.01).toFixed(2);
    }
    for(let name of ["shoulder-1", "shoulder-2", "elbow", "head-1", "head-2", "cutoff"])
    {
        let e_slider = document.getElementById(name);
        let e_span = document.getElementById(name + "-value");
        e_span.innerHTML = e_slider.value;
    }


    update_luxo_xforms({gl, luxo:objects.luxo});

    render_object({gl, shader:shaders.axes, objects, lights, matrices, object:objects.axes});

    render_walls({gl, shader:shaders.model, objects, lights, matrices, walls:objects.walls});
    
    render_luxo({gl, shader:shaders.model, objects, lights, matrices, luxo:objects.luxo});
}

function render_object({gl, shader, objects, object, lights, matrices, material})
{
    if(!matrices.M) matrices.M = mat4.create();
    gl.useProgram(shader.h_prog);
    gl.bindVertexArray(object.vao);
    set_uniforms({gl, shader, objects, lights, matrices, material});
    
    if(object.drawcall == "drawArrays")         gl.drawArrays(object.type, 0, object.n);
    else if(object.drawcall == "drawElements")  gl.drawElements(object.type, object.n, object.type_index, 0);
   
    gl.bindVertexArray(null);
    gl.useProgram(null);
}

function set_uniforms({gl, shader, objects, lights, matrices, material})
{
    set_xforms({gl, shader, matrices});
    set_lights({gl, shader, objects, lights, matrices});
    if(material != null)    set_material(gl, shader, material);
}


function init_xforms(gl)
{
    let V = mat4.create();
    let P = mat4.create();

    mat4.lookAt(V, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(P, toRadian(60), 1, 1, 5); 
//    V.setLookAt(0, 0, 3, 0, 0, 0, 0, 1, 0);
//    P.setPerspective(60, 1, 1, 5); 
    return {V, P};
}

let set_xforms = (function()
{
    let M = mat4.create();
    let N = mat4.create();
    let VP = mat4.create();
    let MV = mat4.create();
    let MVP = mat4.create();


    return function ({gl, shader, matrices})
    {
        mat4.copy(M, matrices.M);
        mat4.copy(VP, matrices.P);
        mat4.multiply(VP, VP, matrices.V);
    
        mat4.copy(MV, matrices.V);  
        mat4.multiply(MV, MV, M);
    
        mat4.copy(MVP, matrices.P); 
        mat4.multiply(MVP, MVP, matrices.V); 
        mat4.multiply(MVP, MVP, M);
    
        mat4.invert(N, MV);
        mat4.transpose(N, N);
    
    
        gl.uniformMatrix4fv(shader.loc_uniforms["VP"], false, VP);
        gl.uniformMatrix4fv(shader.loc_uniforms["MV"], false, MV);
        gl.uniformMatrix4fv(shader.loc_uniforms["MVP"], false, MVP);
        gl.uniformMatrix4fv(shader.loc_uniforms["matNormal"], false, N);
    
    }
}());


let set_lights = (function()
{
    const m = mat4.create();
    const v = vec4.create();

    return function({gl, shader, objects, lights, matrices})
    {
        let l;
        l = lights.ceiling;
        gl.uniform4fv(shader.loc_uniforms["lights[0].position"], l.position);
        gl.uniform4fv(shader.loc_uniforms["lights[0].direction"], l.direction);
        gl.uniform1f(shader.loc_uniforms["lights[0].cutoff_angle"], Math.cos(l.cutoff_angle*Math.PI/180.0));
        gl.uniform4fv(shader.loc_uniforms["lights[0].ambient"], l.ambient);
        gl.uniform4fv(shader.loc_uniforms["lights[0].diffuse"], l.diffuse);
        gl.uniform4fv(shader.loc_uniforms["lights[0].specular"], l.specular);
    
        l = lights.luxo;
        mat4.copy(m, matrices.V);
        mat4.multiply(m, m, objects.luxo["head"].M);
        for(let i=0 ; i<4 ; i++)    v[i] = l.position[i];
        let pos = vec4.create();
        vec4.transformMat4(pos, v, m);
        for(let i=0 ; i<4 ; i++)    v[i] = l.direction[i];
        let dir = vec4.create();
        vec4.transformMat4(dir, v, m);
        gl.uniform4fv(shader.loc_uniforms["lights[1].position"], pos);
        gl.uniform4fv(shader.loc_uniforms["lights[1].direction"], dir);
        gl.uniform1f(shader.loc_uniforms["lights[1].cutoff_angle"], Math.cos(document.getElementById("cutoff").value*Math.PI/180.0));
        gl.uniform4fv(shader.loc_uniforms["lights[1].ambient"], l.ambient);
        gl.uniform4fv(shader.loc_uniforms["lights[1].diffuse"], l.diffuse);
        gl.uniform4fv(shader.loc_uniforms["lights[1].specular"], l.specular);
    }
}());

let set_material = (function()
{
    const list_mats = 
    {
        brass:{ ambient:[0.329412,0.223529,0.027451],
                diffuse:[0.780392,0.568627,0.113725],
                specular:[0.992157,0.941176,0.807843],
                shininess:0.21794872},
        bronze:{ambient:[0.2125,0.1275,0.054],
                diffuse:[0.714,0.4284,0.18144],
                specular:[0.393548,0.271906,0.166721],
                shininess:0.2},
        chrome:{ambient:[0.25,0.25,0.25],
                diffuse:[0.4,0.4,0.4],
                specular:[0.774597,0.774597,0.774597],
                shininess:0.6},
        copper:{ambient:[0.19125,0.0735,0.0225],
                diffuse:[0.7038,0.27048,0.0828],
                specular:[0.256777,0.137622,0.086014],
                shininess:0.1},
        gold:{  ambient:[0.24725,0.1995,0.0745],
                diffuse:[0.75164,0.60648,0.22648],
                specular:[0.628281,0.555802,0.366065],
                shininess:0.4},
        silver:{ambient:[0.19225,0.19225,0.19225],
                diffuse:[0.50754,0.50754,0.50754],
                specular:[0.508273,0.508273,0.508273],
                shininess:0.4}
    };

    return function (gl, shader, material)
    {
        let	mat = list_mats[material];
        gl.uniform3f(shader.loc_uniforms["material.ambient"], 
            mat.ambient[0], mat.ambient[1], mat.ambient[2]);
        gl.uniform3f(shader.loc_uniforms["material.diffuse"], 
            mat.diffuse[0], mat.diffuse[1], mat.diffuse[2]);
        gl.uniform3f(shader.loc_uniforms["material.specular"], 
            mat.specular[0], mat.specular[1], mat.specular[2]);
        gl.uniform1f(shader.loc_uniforms["material.shininess"], mat.shininess*128.0);
    }
}());

function init_vbo_axes({gl, loc_aPosition, loc_aColor})
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vertices = new Float32Array([
      // Vertex coordinates and color
      0,0,0, 1,0,0,
      2,0,0, 1,0,0,

      0,0,0, 0,1,0,
      0,2,0, 0,1,0,

      0,0,0, 0,0,1,
      0,0,2, 0,0,1,
    ]);

    const vbo = gl.createBuffer();  
   
    // Write the vertex information and enable it
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const SZ = vertices.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, SZ*6, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, SZ*6, SZ*3);
    gl.enableVertexAttribArray(loc_aColor);

    gl.bindVertexArray(null);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
   
    return {vao:vao, n:6, drawcall:"drawArrays", type:gl.LINES};
}

const ROOM_WIDTH_HALF = 1;

function init_vbo_walls({gl, loc_aPosition, loc_aNormal})
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const verts = new Float32Array(
                [-ROOM_WIDTH_HALF, -ROOM_WIDTH_HALF, 0, 0, 1,
                  ROOM_WIDTH_HALF, -ROOM_WIDTH_HALF, 0, 0, 1,
                  ROOM_WIDTH_HALF,  ROOM_WIDTH_HALF, 0, 0, 1,
                 -ROOM_WIDTH_HALF,  ROOM_WIDTH_HALF, 0, 0, 1]
            );

    const vbo = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const SZ = verts.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, SZ*5, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.vertexAttribPointer(loc_aNormal, 3, gl.FLOAT, false, SZ*5, SZ*2);
    gl.enableVertexAttribArray(loc_aNormal);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let walls = {};

    let m;

    m = mat4.create();
    mat4.fromTranslation(m, [0, 0, -1]);
    walls["back"] = {M:m, material:"gold"};

    m = mat4.create();
    mat4.fromTranslation(m, [-1, 0, 0]);
    mat4.rotate(m, m, toRadian(90), [0, 1, 0]);
    walls["left"] = {M:m, material:"silver"};

    m = mat4.create();
    mat4.fromTranslation(m, [1, 0, 0]);
    mat4.rotate(m, m, toRadian(-90), [0, 1, 0]);
    walls["right"] = {M:m, material:"chrome"};

    m = mat4.create();
    mat4.fromTranslation(m, [0, 1, 0]);
    mat4.rotate(m, m, toRadian(90), [1, 0, 0]);
    walls["top"] = {M:m, material:"bronze"};

    m = mat4.create();
    mat4.fromTranslation(m, [0, -1, 0]);
    mat4.rotate(m, m, toRadian(-90), [1, 0, 0]);
    walls["bottom"] = {M:m, material:"copper"};

    return {walls:walls, object:{vao:vao, n:4, drawcall:"drawArrays", type:gl.TRIANGLE_FAN}};
}

function render_walls({gl, shader, objects, lights, matrices, walls})
{
    for(let wallname in walls.walls)
    {
        let wall = walls.walls[wallname];
        render_object({gl, shader, objects, lights, 
                    matrices:{M:wall.M, V:matrices.V, P:matrices.P}, 
                    object:walls.object, material:wall.material});
    }
}

function init_vbo_luxo({gl, loc_aPosition, loc_aNormal}) {
    let vao_cube = gl.createVertexArray();
    gl.bindVertexArray(vao_cube);
    let x = .5;
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    let verts_cube = new Float32Array([
         x, x, x,    1, 0, 0,  // v0 White
         x,-x, x,    1, 0, 0,  // v3 Yellow
         x,-x,-x,    1, 0, 0,  // v4 Green

         x, x, x,    1, 0, 0,  // v0 White
         x,-x,-x,    1, 0, 0,  // v4 Green
         x, x,-x,    1, 0, 0,  // v5 Cyan

         x, x, x,    0, 1, 0,  // v0 White
         x, x,-x,    0, 1, 0,  // v5 Cyan
        -x, x,-x,    0, 1, 0,  // v6 Blue

         x, x, x,    0, 1, 0,  // v0 White
        -x, x,-x,    0, 1, 0,  // v6 Blue
        -x, x, x,    0, 1, 0,  // v1 Magenta

         x, x, x,    0, 0, 1,  // v0 White
        -x, x, x,    0, 0, 1,  // v1 Magenta
        -x,-x, x,    0, 0, 1,  // v2 Red

         x, x, x,    0, 0, 1,  // v0 White
        -x,-x, x,    0, 0, 1,  // v2 Red
         x,-x, x,    0, 0, 1,  // v3 Yellow

        -x,-x,-x,   -1, 0, 0,  // v7 Black
        -x,-x, x,   -1, 0, 0,  // v2 Red
        -x, x, x,   -1, 0, 0,  // v1 Magenta

        -x,-x,-x,   -1, 0, 0,  // v7 Black
        -x, x, x,   -1, 0, 0,  // v1 Magenta
        -x, x,-x,   -1, 0, 0,  // v6 Blue

        -x,-x,-x,    0, 0,-1,  // v7 Black
        -x, x,-x,    0, 0,-1,  // v6 Blue
         x, x,-x,    0, 0,-1,  // v5 Cyan

        -x,-x,-x,    0, 0,-1,  // v7 Black
         x, x,-x,    0, 0,-1,  // v5 Cyan
         x,-x,-x,    0, 0,-1,  // v4 Green

        -x,-x,-x,    0,-1, 0,  // v7 Black
         x,-x,-x,    0,-1, 0,  // v4 Green
         x,-x, x,    0,-1, 0,  // v3 Yellow

        -x,-x,-x,    0,-1, 0,  // v7 Black
         x,-x, x,    0,-1, 0,  // v3 Yellow
        -x,-x, x,    0,-1, 0,  // v2 Red

    ]);
   
    const vbo_cube = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_cube);
    gl.bufferData(gl.ARRAY_BUFFER, verts_cube, gl.STATIC_DRAW);

    let sz = verts_cube.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, sz*6, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.vertexAttribPointer(loc_aNormal, 3, gl.FLOAT, false, sz*6, sz*3);
    gl.enableVertexAttribArray(loc_aNormal);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    ///////////////////////////////////////////////////////////////////////

    const vao_cone = gl.createVertexArray();
    gl.bindVertexArray(vao_cone);

    const RADIUS_SMALL = .1;
    const RADIUS_LARGE = .2;
    const HEIGHT = .2
    let array_verts_head = [];
    const steps = 24;

    let normalize_vec3 = v =>
    {
        let	len = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
        return [v[0]/len, v[1]/len, v[2]/len];
    }


    for(let i=0 ; i<=steps ; i++)
    {
        let angle = (parseFloat(i)*2.0*Math.PI)/parseFloat(steps);
        let n  = normalize_vec3([
                        Math.sin(angle), 
                        parseFloat(RADIUS_LARGE-RADIUS_SMALL)/parseFloat(HEIGHT),
                        Math.cos(angle)
                        ]);

        array_verts_head.push(RADIUS_SMALL*Math.sin(angle));
        array_verts_head.push(0);
        array_verts_head.push(RADIUS_SMALL*Math.cos(angle));

        array_verts_head.push(parseFloat(n[0]));
        array_verts_head.push(parseFloat(n[1]));
        array_verts_head.push(parseFloat(n[2]));

        array_verts_head.push(RADIUS_LARGE*Math.sin(angle));
        array_verts_head.push(-HEIGHT);
        array_verts_head.push(RADIUS_LARGE*Math.cos(angle));

        array_verts_head.push(parseFloat(n[0]));
        array_verts_head.push(parseFloat(n[1]));
        array_verts_head.push(parseFloat(n[2]));
    }
    const verts_head = new Float32Array(array_verts_head);

    const vbo_head = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_head);
    gl.bufferData(gl.ARRAY_BUFFER, verts_head, gl.STATIC_DRAW);

    sz = verts_head.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, sz*6, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.vertexAttribPointer(loc_aNormal, 3, gl.FLOAT, false, sz*6, sz*3);
    gl.enableVertexAttribArray(loc_aNormal);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    let luxo = {};

    luxo["base"] = {vao:vao_cube, n:36, drawcall:"drawArrays", type:gl.TRIANGLES, material:"gold"};
    luxo["lower"] = {vao:vao_cube, n:36, drawcall:"drawArrays", type:gl.TRIANGLES, material:"silver"};
    luxo["upper"] = {vao:vao_cube, n:36, drawcall:"drawArrays", type:gl.TRIANGLES, material:"copper"};
    luxo["head"] = {vao:vao_cone, n:(steps+1)*2, drawcall:"drawArrays", type:gl.TRIANGLE_STRIP, material:"chrome"};

    luxo.base.M = mat4.create();
    luxo.lower.M = mat4.create();
    luxo.upper.M = mat4.create();
    luxo.head.M = mat4.create();

    return luxo;
}

function update_luxo_xforms({gl, luxo})
{
    let x = document.getElementById("x").value*0.01;
    let z = document.getElementById("z").value*0.01;
    let shoulder_1 = document.getElementById("shoulder-1").value;
    let shoulder_2 = document.getElementById("shoulder-2").value;
    let lower = document.getElementById("lower").value*0.01;
    let elbow = document.getElementById("elbow").value;
    let upper = document.getElementById("upper").value*0.01;
    let head_1 = document.getElementById("head-1").value;
    let head_2 = document.getElementById("head-2").value;

    let m;

    m = luxo.base.M;
    const BASE_WIDTH =.4;
    const BASE_HEIGHT = .1;
    mat4.fromTranslation(m, [x, BASE_HEIGHT*.5-ROOM_WIDTH_HALF, z]);
    mat4.scale(m, m, [BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH]);


    m = luxo.lower.M;
    const WIDTH_LOWER = .1;
    mat4.fromTranslation(m, [x, BASE_HEIGHT-ROOM_WIDTH_HALF, z]);
    mat4.rotate(m, m, toRadian(shoulder_2), [0, 1, 0]);
    mat4.rotate(m, m, toRadian(shoulder_1), [0, 0, 1]);
    mat4.translate(m, m, [(lower-WIDTH_LOWER)*.5, 0, 0]);
    mat4.scale(m, m, [lower, WIDTH_LOWER, WIDTH_LOWER]);

    m = luxo.upper.M;
    const WIDTH_UPPER = .1;
    mat4.fromTranslation(m, [x, BASE_HEIGHT-ROOM_WIDTH_HALF, z]);
    mat4.rotate(m, m, toRadian(shoulder_2), [0, 1, 0]);
    mat4.rotate(m, m, toRadian(shoulder_1), [0, 0, 1]);
    mat4.translate(m, m, [lower-WIDTH_LOWER, 0, 0]);
    mat4.rotate(m, m, toRadian(elbow), [0, 0, 1]);
    mat4.translate(m, m, [(upper-WIDTH_UPPER)*.5, 0, 0]);
    mat4.scale(m, m, [upper, WIDTH_UPPER, WIDTH_UPPER]);

    m = luxo.head.M;
    mat4.fromTranslation(m, [x, BASE_HEIGHT-ROOM_WIDTH_HALF, z]);
    mat4.rotate(m, m, toRadian(shoulder_2), [0, 1, 0]);
    mat4.rotate(m, m, toRadian(shoulder_1), [0, 0, 1]);
    mat4.translate(m, m, [lower-WIDTH_LOWER, 0, 0]);
    mat4.rotate(m, m, toRadian(elbow), [0, 0, 1]);
    mat4.translate(m, m, [upper-WIDTH_UPPER*.5, 0, 0]);
    mat4.rotate(m, m, toRadian(head_2), [1, 0, 0]);
    mat4.rotate(m, m, toRadian(head_1), [0, 0, 1]);
}

function render_luxo({gl, shader, objects, lights, matrices, luxo})
{
    for(let partname in luxo)
    {
        let part = luxo[partname];
        render_object({gl, shader, objects, lights, matrices:{M:part.M, V:matrices.V, P:matrices.P}, object:part, material:part.material});
    }
}

main();
