import * as THREE from "https://threejs.org/build/three.module.js"
import {GLTFLoader} from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"
import {Shader} from "../modules/class_shader.mjs"
import {Mesh} from "../modules/class_mesh.mjs"
import {Axes} from "../modules/class_axes.mjs"
import {Texture} from "../modules/class_texture.mjs"
import {length2, unproject_vector} from "../modules/utils.js"
import {Light} from "../modules/class_light.mjs"
import {Material, __js_materials} from "../modules/class_material.mjs"

"use strict";

function main()
{
    const loc_aPosition = 3;
    const loc_aTexCoord = 8;
    const loc_aNormal = 6;
    const numLights = 2;
    
    const src_vert_shading = `#version 300 es
    layout(location=${loc_aPosition}) in vec4	aPosition;
    layout(location=${loc_aNormal}) in vec3	aNormal;
    layout(location=${loc_aTexCoord}) in vec2	aTexCoord;
    out vec2	vTexCoord;
    uniform mat4	MVP;
    uniform mat4	MV;
    uniform mat4	matNormal;
    out vec3	vNormal;
    out vec4	vPosEye;
    void main()
    {
    	vPosEye = MV*aPosition;
    	vNormal = normalize((matNormal*vec4(aNormal,0)).xyz);
    	gl_Position = MVP*aPosition;
    	vTexCoord = aTexCoord;
    }`;
    const src_frag_shading = `#version 300 es
    precision mediump float;
    uniform sampler2D tex_color;
    uniform highp mat4	matNormal;
    uniform sampler2D tex_normal;
    uniform bool	use_normal_map;
    uniform bool	use_color_map;
    in vec4 vPosEye;
    in vec3	vNormal;
    in vec2	vTexCoord;
    out vec4 fColor;
    struct TMaterial
    {
    	vec3	ambient;
    	vec3	diffuse;
    	vec3	specular;
    	vec3	emission;
    	float	shininess;
    };
    struct TLight
    {
    	vec4	position;
    	vec3	ambient;
    	vec3	diffuse;
    	vec3	specular;
    	bool	enabled;
    };
    uniform TMaterial	material;
    uniform TLight		light[${numLights}];
    void main()
    {
    	vec3	n;
    	if(use_normal_map)
    		n = normalize((matNormal*vec4(texture(tex_normal, vTexCoord).xyz - 0.5,0)).xyz);
    	else
    		n = normalize(vNormal);
    	vec3	l;
    	vec3	v = normalize(-vPosEye.xyz);
    	TMaterial m;
    	if(use_color_map)
    	{
    		m.diffuse = texture(tex_color, vTexCoord).rgb;
    		m.ambient = material.diffuse;
    		m.specular = vec3(1,1,1);
    		m.shininess = 128.0;
    	}
    	else
    	{
    		m = material;
    	}
    	fColor = vec4(0.0);
    	for(int i=0 ; i<${numLights} ; i++)
    	{
    		if(light[i].enabled)
    		{
    			if(light[i].position.w == 1.0)
    				l = normalize((light[i].position - vPosEye).xyz);
    			else
    				l = normalize((light[i].position).xyz);
    			vec3	r = reflect(-l, n);
    			float	l_dot_n = max(dot(l, n), 0.0);
    			vec3	ambient = light[i].ambient * m.ambient;
    			vec3	diffuse = light[i].diffuse * m.diffuse * l_dot_n;
    			vec3	specular = vec3(0.0);
    			if(l_dot_n > 0.0)
    			{
    				specular = light[i].specular * m.specular * pow(max(dot(r, v), 0.0), m.shininess);
    			}
    			fColor += vec4(ambient + diffuse + specular, 1);
    		}
    	}
    	fColor.w = 1.0;
    }`;
    
    const src_vert_quad = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aTexCoord}) in vec2 aTexCoord;
    out vec2 vTexCoord;
    void main() {
        gl_Position = aPosition;
        vTexCoord = aTexCoord;
    }`;
    
    const src_frag_quad = `#version 300 es
    precision mediump float;
    uniform sampler2D uSampler;
    in vec2 vTexCoord;
    out vec4 fColor;
    void main() {
        fColor = texture(uSampler, vTexCoord);
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext('webgl2');
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    const V = mat4.create();
    mat4.lookAt(V, [20, 20, 20], [0, 0, 0], [0, 1, 0]);
    
    const P = mat4.create();
    mat4.ortho(P, -15, 15, -15, 15, 1, 100);
    
    const uniform_vars = ["MVP", "MV", "matNormal", "tex_normal", 
                            "use_normal_map", "use_color_map"];
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[0]"));
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[1]"));
    Array.prototype.push.apply(uniform_vars, Material.generate_uniform_names("material"));
    
    const shader = new Shader(gl, src_vert_shading, src_frag_shading, uniform_vars);
    
    const shader_quad = new Shader(gl, src_vert_quad, src_frag_quad, ["uSampler"]);
    
    const lights = 
    [
        new Light
        (
            gl,
            [20, 20, 20, 1.0],		// position
            [0.1, 0.1, 0.1, 1.0],	// ambient
            [1.0, 1.0, 1.0, 1.0],	// diffusive
            [1.0, 1.0, 1.0, 1.0],	// specular
            true
        ),
        new Light
        (
            gl,
            [-20, 20, 20, 0.0],		// position
            [0.1, 0.1, 0.1, 1.0],	// ambient
            [1.0, 1.0, 1.0, 1.0],	// diffusive
            [1.0, 1.0, 1.0, 1.0],	// specular
            true
        ),
    ];
    
    let quad = init_quad(gl, loc_aPosition, loc_aTexCoord);
    
    let mesh = new Mesh({gl, loc_aPosition});
    
    mat4.fromTranslation(mesh.M, [0, -14, 0]);
    
    let axes = new Axes(gl,10);
    
    let lastX;
    let lastY;
    let angle = [0,0];
    let dragging = false;
    
    canvas.onmousedown = function(ev) 
    {
        let x = ev.clientX, y = ev.clientY;
        let bb = ev.target.getBoundingClientRect();
        if (bb.left <= x && x < bb.right && bb.top <= y && y < bb.bottom)
        {
            lastX = x;
            lastY = y;
            dragging = true;
        }
    }
    canvas.onmouseup = function(ev) { dragging = false; };
    
    const VP = mat4.create();
    canvas.onmousemove = function(ev)
    {
        let x = ev.clientX;
        let y = ev.clientY;
        if(dragging)
        {
            let offset = [x - lastX, y - lastY];
            if(offset[0] != 0 || offset[1] != 0) // For some reason, the offset becomes zero sometimes...
            {
                mat4.copy(VP, P);
                mat4.multiply(VP, VP, V);
                let axis = unproject_vector([offset[1], offset[0], 0], VP, 
                    gl.getParameter(gl.VIEWPORT));
                mat4.rotate(V, V, toRadian(length2(offset)), [axis[0], axis[1], axis[2]]);
            }
        }
        lastX = x;
        lastY = y;
    }
    
   

//    canvas.onmousedown = function(ev) 
//    {
//    	let x = ev.clientX, y = ev.clientY;
//    	let bb = ev.target.getBoundingClientRect();
//    	if (bb.left <= x && x < bb.right && bb.top <= y && y < bb.bottom)
//    	{
//    		lastX = x;
//    		lastY = y;
//    		dragging = true;
//    	}
//    }
//    canvas.onmouseup = function(ev) { dragging = false; };
//    
//    canvas.onmousemove = function(ev)
//    {
//    	let x = ev.clientX;
//    	let y = ev.clientY;
//    	if(dragging)
//    	{
//    		let offset = [x - lastX, y - lastY];
//    		if(offset[0] != 0 || offset[1] != 0) // For some reason, the offset becomes zero sometimes...
//    		{
//    			let	VP = new Matrix4(P);
//    			VP.multiply(V);
//    			let	axis = unproject_vector([offset[1], offset[0], 0], VP, 
//    				gl.getParameter(gl.VIEWPORT));
//    			V.rotate(length2(offset), axis[0], axis[1], axis[2]);
//    		}
//    	}
//    	lastX = x;
//    	lastY = y;
//    }
    
    const manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
    };
    
    let tex_color, tex_normal;
    
    const url = 'https://threejs.org/examples/models/gltf/Nefertiti/Nefertiti.glb';
    
    const loader = new GLTFLoader( manager );
    loader.load(url,
        function ( object )
        {
            document.getElementById("output").innerHTML = 'Successfully loaded.';
            for(let obj of object.scene.children)
            {
                if(obj.type == "Mesh")
                {
                    mesh.init_from_THREE_geometry(gl, obj.geometry, loc_aPosition, loc_aNormal, loc_aTexCoord);
                    tex_color = new Texture(gl, obj.material.map.image, false);
                    tex_normal = new Texture(gl, obj.material.normalMap.image, false);
                }
            }
            tick();
        },
        // called when loading is in progresses
        function ( xhr )
        {
            document.getElementById("output").innerHTML = ( xhr.loaded / xhr.total * 100 ) + '% loaded.';
        },
        // called when loading has errors
        function ( error )
        {
            document.getElementById("output").innerHTML = 'An error happened: ' + error;
        }
    
    );
    
    function tick() {   // start drawing
        gl.viewport(0, 0, 512, 512);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        axes.render(gl, V, P);
        for(let light of lights) light.render(gl, V, P);
        gl.useProgram(shader.h_prog);
        gl.uniform1i(gl.getUniformLocation(shader.h_prog, "use_normal_map"), document.getElementById("normalmap").checked?1:0);
        gl.uniform1i(gl.getUniformLocation(shader.h_prog, "use_color_map"), document.getElementById("colormap").checked?1:0);
        mesh.render(gl, shader, lights, __js_materials["silver"], V, P, {"tex_color":tex_color, "tex_normal":tex_normal});
        
        // render the color map in the lower-right area
        gl.viewport(512, 0, 256, 256);
        gl.useProgram(shader_quad.h_prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(shader_quad.loc_aSampler, 0);
        gl.bindTexture(gl.TEXTURE_2D, tex_color.texid);
        gl.bindVertexArray(quad);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle
        gl.bindVertexArray(null);
        
        // render the normal map in the upper-right area
        gl.viewport(512, 256, 256, 256);
        gl.useProgram(shader_quad.h_prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(shader_quad.loc_aSampler, 0);
        gl.bindTexture(gl.TEXTURE_2D, tex_normal.texid);
        gl.bindVertexArray(quad);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle
        gl.bindVertexArray(null);
        
        requestAnimationFrame(tick, canvas);
    };

}

function init_quad(gl, loc_aPosition, loc_aTexCoord)
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const verticesTexCoords = new Float32Array([
      // Vertex coordinates, texture coordinate
      -1,  1,   0.0, 1.0,
      -1, -1,   0.0, 0.0,
       1,  1,   1.0, 1.0,
       1, -1,   1.0, 0.0,
    ]);
    
    // Create the buffer object
    const vertexTexCoordBuffer = gl.createBuffer();
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    
    const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(loc_aPosition);  // Enable the assignment of the buffer object
    
    gl.vertexAttribPointer(loc_aTexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(loc_aTexCoord);  // Enable the assignment of the buffer object

    gl.bindVertexArray(null);
    return vao;
}

main();

