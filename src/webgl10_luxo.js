"use strict";
let src_vert_axes = 
`
    attribute vec4 aPosition;
    attribute vec4 aColor;
    uniform mat4 VP;
    varying vec4 vColor;
    void main()
    {
        gl_Position = VP * aPosition;
        gl_PointSize = 10.0;
        vColor = aColor;
    }
`;
let src_frag_axes =
`
    #ifdef GL_ES
    precision mediump float;
    #endif
    varying vec4 vColor;
    void main()
    {
        gl_FragColor = vColor;
    }
`;
let src_vert_lighting =
`
     // eye coordinate system
    attribute vec4 aPosition;
    attribute vec3 aNormal;
    uniform mat4 MVP;
    uniform mat4 MV;
    uniform mat4 matNormal;
    varying vec3 vNormal;
    varying vec4 vPosWorld;
    void main()
    {
        vPosWorld = MV*aPosition;
        vNormal = normalize((matNormal*vec4(aNormal,0)).xyz);
        gl_Position = MVP*aPosition;
    }
`;
let src_frag_lighting =
`
     // eye coordinate system
     #ifdef GL_ES
     precision mediump float;
     #endif
    varying vec4 vPosWorld;
    varying vec3 vNormal;
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
    uniform TLight      lights[2];
    void main()
    {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(-vPosWorld.xyz);
         gl_FragColor = vec4(0,0,0,1);
         for(int i=0 ; i<2 ; i++)
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
            gl_FragColor.rgb += ambient + diffuse + specular;
         }
    }
`;

let list_mats = [];

let shader_model;
let shader_axes;

let lights = [];
let walls;

let luxo;
let axes;

let angle = 0;
let M;
let V;
let P;

let g_last = Date.now();


function init_shader(gl, src_vert, src_frag, attrib_names)
{
    initShaders(gl, src_vert, src_frag);
    let h_prog = gl.program;
    let	attribs = {};
    for(let attrib of attrib_names)
    {
        attribs[attrib] = gl.getAttribLocation(h_prog, attrib);
    }
    return {h_prog:h_prog, attribs:attribs};
}

function init_materials(gl)
{
    list_mats["brass"] = {ambient:[0.329412,0.223529,0.027451],	diffuse:[0.780392,0.568627,0.113725],	specular:[0.992157,0.941176,0.807843],			shininess:0.21794872};
    list_mats["bronze"] = {ambient:[0.2125,0.1275,0.054],			diffuse:[0.714,0.4284,0.18144],			specular:[0.393548,0.271906,0.166721],			shininess:0.2};
    list_mats["chrome"] = {ambient:[0.25,0.25,0.25],				diffuse:[0.4,0.4,0.4],					specular:[0.774597,0.774597,0.774597],			shininess:0.6};
    list_mats["copper"] = {ambient:[0.19125,0.0735,0.0225],		diffuse:[0.7038,0.27048,0.0828],		specular:[0.256777,0.137622,0.086014],			shininess:0.1};
    list_mats["gold"] = {ambient:[0.24725,0.1995,0.0745],		diffuse:[0.75164,0.60648,0.22648],		specular:[0.628281,0.555802,0.366065],			shininess:0.4};
    list_mats["silver"] = {ambient:[0.19225,0.19225,0.19225],		diffuse:[0.50754,0.50754,0.50754],		specular:[0.508273,0.508273,0.508273],			shininess:0.4};
}

function init_lights(gl)
{
    let l;
    l = {
        position:[0, .9, 0, 1], 
        direction:[0,-1,0,0],
        cutoff_angle:180,
        ambient: new Vector4([.1, .1, .1, 1.0]), 
        diffuse: new Vector4([.5, .5, .5, 1.0]), 
        specular:new Vector4([.5, .5, .5, 1.0]),
        position_transformed:null
        };
    l.position = V.multiplyVector4(new Vector4(l.position));
    l.direction = V.multiplyVector4(new Vector4(l.direction));
    lights["ceiling"] = l;

    l = {
        position:[0, 0, 0, 1], 
        direction:[0,-1,0,0],
        cutoff_angle:30,
        ambient: new Vector4([0.5, 0.5, 0.5, 1.0]), 
        diffuse: new Vector4([1.0, 1.0, 1.0, 1.0]), 
        specular:new Vector4([1.0, 1.0, 1.0, 1.0]),
        position_transformed:null
        };
    lights["luxo"] = l;
};


function main()
{
    let canvas = document.getElementById('webgl');
    let gl = getWebGLContext(canvas);

    gl.enable(gl.DEPTH_TEST);
    
    shader_axes = init_shader(gl, src_vert_axes, src_frag_axes, ["aPosition", "aColor"]);
    
    axes = init_vbo_axes(gl);
    walls = init_vbo_walls(gl);
    luxo = init_vbo_luxo(gl);
    
    
    init_xforms(gl);
    
    shader_model = init_shader(gl, src_vert_lighting, src_frag_lighting, ["aPosition", "aNormal"]);
    
    init_materials(gl);
    init_lights(gl);
    
    for(let name of ["x", "z", "shoulder-1", "shoulder-2", "elbow", "lower", "upper", "head-1", "head-2", "cutoff"])
    {
        init_slider(gl, name);
    }
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    
    refresh_scene(gl);
}

function init_slider(gl, name)
{
    document.getElementById(name).onchange = function(ev) { refresh_scene(gl); };
    document.getElementById(name).oninput = function(ev) { refresh_scene(gl); };
}


function refresh_scene(gl)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(let name of ["x", "z", "lower", "upper"])
    {
        let e_slider = document.getElementById(name);
        let e_span = document.getElementById(name + "-value");
        e_span.innerHTML = e_slider.value*0.01;
    }
    for(let name of ["shoulder-1", "shoulder-2", "elbow", "head-1", "head-2", "cutoff"])
    {
        let e_slider = document.getElementById(name);
        let e_span = document.getElementById(name + "-value");
        e_span.innerHTML = e_slider.value;
    }


    update_luxo_xforms(gl);

    render_object(gl, shader_axes, axes);

    render_walls(gl, shader_model, walls);
    
    render_luxo(gl, shader_model);
}

function render_object(gl, shader, object, mat_name=null, mtrx_model=new Matrix4())
{
    gl.useProgram(shader.h_prog);
    set_uniforms(gl, shader.h_prog, mat_name, mtrx_model);
    
    for(let attrib_name in object.attribs)
    {
        let	attrib = object.attribs[attrib_name];
        gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
        gl.vertexAttribPointer(shader.attribs[attrib_name], attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(shader.attribs[attrib_name]);
    }
    if(object.drawcall == "drawArrays")
    {
        gl.drawArrays(object.type, 0, object.n);
    }
    else if(object.drawcall == "drawElements")
    {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.buf_index);
        gl.drawElements(object.type, object.n, object.type_index, 0);
    }
    
    for(let attrib_name in object.attribs)
    {
        gl.disableVertexAttribArray(shader.attribs[attrib_name]);
    }
    
    gl.useProgram(null);
}

function set_uniforms(gl, h_prog, mat_name, mtrx_model)
{
    set_xforms(gl, h_prog, mtrx_model);
    set_lights(gl, h_prog);
    if(mat_name != null)    set_material(gl, h_prog, mat_name);
}


function init_xforms(gl)
{
    V = new Matrix4();
    P = new Matrix4();
    V.setLookAt(0, 0, 3, 0, 0, 0, 0, 1, 0);
    P.setPerspective(60, 1, 1, 5); 
}

function set_xforms(gl, h_prog, mtrx_model)
{
    M = new Matrix4(mtrx_model);
    let N = new Matrix4();

    let VP = new Matrix4(P); VP.multiply(V);
    let MV = new Matrix4(V); MV.multiply(M);
    let MVP = new Matrix4(P); MVP.multiply(V); MVP.multiply(M);
    N.setInverseOf(MV);
    N.transpose();

    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "VP"), false, VP.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MV"), false, MV.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, MVP.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "matNormal"), false, N.elements);

}

function set_lights(gl, h_prog)
{
    let l;
    l = lights["ceiling"];
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[0].position"), l.position.elements);
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[0].direction"), l.direction.elements);
    gl.uniform1f(gl.getUniformLocation(h_prog, "lights[0].cutoff_angle"), Math.cos(l.cutoff_angle*Math.PI/180.0));
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[0].ambient"), l.ambient.elements);
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[0].diffuse"), l.diffuse.elements);
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[0].specular"), l.specular.elements);

    l = lights["luxo"];
    let m = new Matrix4(V);
    m.multiply(luxo["head"].M);
    let pos = m.multiplyVector4(new Vector4(l.position));
    let dir = m.multiplyVector4(new Vector4(l.direction));
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[1].position"), pos.elements);
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[1].direction"), dir.elements);
    gl.uniform1f(gl.getUniformLocation(h_prog, "lights[1].cutoff_angle"), Math.cos(document.getElementById("cutoff").value*Math.PI/180.0));
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[1].ambient"), l.ambient.elements);
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[1].diffuse"), l.diffuse.elements);
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[1].specular"), l.specular.elements);
}

function set_material(gl, h_prog, mat_name)
{
    let	mat = list_mats[mat_name];
    gl.uniform3fv(gl.getUniformLocation(h_prog, "material.ambient"), (new Vector3(mat.ambient)).elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "material.diffuse"), (new Vector3(mat.diffuse)).elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "material.specular"), (new Vector3(mat.specular)).elements);
    gl.uniform1f(gl.getUniformLocation(h_prog, "material.shininess"), mat.shininess*128.0);
}
function init_vbo_axes(gl)
{
    let vertices = new Float32Array([
      // Vertex coordinates and color
      0,0,0, 1,0,0,
      2,0,0, 1,0,0,

      0,0,0, 0,1,0,
      0,2,0, 0,1,0,

      0,0,0, 0,0,1,
      0,0,2, 0,0,1,
    ]);

    let vbo = gl.createBuffer();  
   
    // Write the vertex information and enable it
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    let SZ = vertices.BYTES_PER_ELEMENT;
    
    let	attribs = [];
    attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:SZ*6, offset:0};
    attribs["aColor"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:SZ*6, offset:SZ*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
   
    return {n:6, drawcall:"drawArrays", type:gl.LINES, attribs:attribs};
}




const ROOM_WIDTH_HALF = 1;

function init_vbo_walls(gl)
{
    let verts = new Float32Array(
                [-ROOM_WIDTH_HALF, -ROOM_WIDTH_HALF, 0, 0, 1,
                  ROOM_WIDTH_HALF, -ROOM_WIDTH_HALF, 0, 0, 1,
                  ROOM_WIDTH_HALF,  ROOM_WIDTH_HALF, 0, 0, 1,
                 -ROOM_WIDTH_HALF,  ROOM_WIDTH_HALF, 0, 0, 1]
            );

    let vbo = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    let SZ = verts.BYTES_PER_ELEMENT;
    let	attribs = [];
    attribs["aPosition"] = {buffer:vbo, size:2, type:gl.FLOAT, normalized:false, stride:SZ*5, offset:0};
    attribs["aNormal"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:SZ*5, offset:SZ*2};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let walls = [];

    let m;

    m = new Matrix4();
    m.setTranslate(0, 0, -1);
    walls["back"] = {M:m, material:"gold"};

    m = new Matrix4();
    m.setTranslate(-1, 0, 0);
    m.rotate(90, 0, 1, 0);
    walls["left"] = {M:m, material:"silver"};

    m = new Matrix4();
    m.setTranslate(1, 0, 0);
    m.rotate(-90, 0, 1, 0);
    walls["right"] = {M:m, material:"chrome"};

    m = new Matrix4();
    m.setTranslate(0, 1, 0);
    m.rotate(90, 1, 0, 0);
    walls["top"] = {M:m, material:"bronze"};

    m = new Matrix4();
    m.setTranslate(0, -1, 0);
    m.rotate(-90, 1, 0, 0);
    walls["bottom"] = {M:m, material:"copper"};

    return {walls:walls, object:{n:4, drawcall:"drawArrays", type:gl.TRIANGLE_FAN, attribs:attribs}};
}

function render_walls(gl, shader, walls)
{
    for(let wallname in walls.walls)
    {
        let wall = walls.walls[wallname];
        render_object(gl, shader, walls.object, wall.material, wall.M);
    }
}

function animate(angle) 
{
    const ANGLE_STEP = 30.0;

    // Calculate the elapsed time
    let now = Date.now();
    let elapsed = now - g_last;
    g_last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}

function init_vbo_luxo(gl) {
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
   
    let vbo_cube = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_cube);
    gl.bufferData(gl.ARRAY_BUFFER, verts_cube, gl.STATIC_DRAW);

    let SZ = verts_cube.BYTES_PER_ELEMENT;
    let	attribs_cube = [];
    attribs_cube["aPosition"] = {buffer:vbo_cube, size:3, type:gl.FLOAT, normalized:false, stride:SZ*6, offset:0};
    attribs_cube["aNormal"] = {buffer:vbo_cube, size:3, type:gl.FLOAT, normalized:false, stride:SZ*6, offset:SZ*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

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
        angle = (parseFloat(i)*2.0*Math.PI)/parseFloat(steps);
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
    let verts_head = new Float32Array(array_verts_head);

    let vbo_head = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_head);
    gl.bufferData(gl.ARRAY_BUFFER, verts_head, gl.STATIC_DRAW);

    SZ = verts_head.BYTES_PER_ELEMENT;
    let	attribs_head = [];
    attribs_head["aPosition"] = {buffer:vbo_head, size:3, type:gl.FLOAT, normalized:false, stride:SZ*6, offset:0};
    attribs_head["aNormal"] = {buffer:vbo_head, size:3, type:gl.FLOAT, normalized:false, stride:SZ*6, offset:SZ*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    let luxo = [];

    luxo["base"] = {n:36, drawcall:"drawArrays", type:gl.TRIANGLES, attribs:attribs_cube, material:"gold"};
    luxo["lower"] = {n:36, drawcall:"drawArrays", type:gl.TRIANGLES, attribs:attribs_cube, material:"silver"};
    luxo["upper"] = {n:36, drawcall:"drawArrays", type:gl.TRIANGLES, attribs:attribs_cube, material:"copper"};
    luxo["head"] = {n:(steps+1)*2, drawcall:"drawArrays", type:gl.TRIANGLE_STRIP, attribs:attribs_head, material:"chrome"};

    luxo.base.M = new Matrix4();
    luxo.lower.M = new Matrix4();
    luxo.upper.M = new Matrix4();
    luxo.head.M = new Matrix4();

    return luxo;
}

function update_luxo_xforms(gl)
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
    m.setIdentity();
    const BASE_WIDTH =.4;
    const BASE_HEIGHT = .1;
    m.setTranslate(x, BASE_HEIGHT*.5-ROOM_WIDTH_HALF, z);
    m.scale(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);


    m = luxo.lower.M;
    m.setIdentity();
    const WIDTH_LOWER = .1;
    m.setTranslate(x, BASE_HEIGHT-ROOM_WIDTH_HALF, z);
    m.rotate(shoulder_2, 0, 1, 0);
    m.rotate(shoulder_1, 0, 0, 1);
    m.translate((lower-WIDTH_LOWER)*.5, 0, 0);
    m.scale(lower, WIDTH_LOWER, WIDTH_LOWER);

    m = luxo.upper.M;
    m.setIdentity();
    const WIDTH_UPPER = .1;
    m.setTranslate(x, BASE_HEIGHT-ROOM_WIDTH_HALF, z);
    m.rotate(shoulder_2, 0, 1, 0);
    m.rotate(shoulder_1, 0, 0, 1);
    m.translate(lower-WIDTH_LOWER, 0, 0);
    m.rotate(elbow, 0, 0, 1);
    m.translate((upper-WIDTH_UPPER)*.5, 0, 0);
    m.scale(upper, WIDTH_UPPER, WIDTH_UPPER);

    m = luxo.head.M;
    m.setIdentity();
    m.setTranslate(x, BASE_HEIGHT-ROOM_WIDTH_HALF, z);
    m.rotate(shoulder_2, 0, 1, 0);
    m.rotate(shoulder_1, 0, 0, 1);
    m.translate(lower-WIDTH_LOWER, 0, 0);
    m.rotate(elbow, 0, 0, 1);
    m.translate(upper-WIDTH_UPPER*.5, 0, 0);
    m.rotate(head_2, 1, 0, 0);
    m.rotate(head_1, 0, 0, 1);
}

function render_luxo(gl, shader)
{
    for(let partname in luxo)
    {
        let part = luxo[partname];
        render_object(gl, shader, part, part.material, part.M);
    }
}


