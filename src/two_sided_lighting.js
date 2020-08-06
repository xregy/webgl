import * as vec4 from "../lib/gl-matrix/vec4.js"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"
import {Light} from "../modules/class_light.mjs"
import {Material, __js_materials} from "../modules/class_material.mjs"
import {Shader} from "../modules/class_shader.mjs"
import {Axes} from "../modules/class_axes.mjs"
import {Mesh} from "../modules/class_mesh.mjs"

"use strict"

function main()
{
    const loc_aPosition = 3;
    const loc_aNormal = 9;
    const numLights = 0;

    const src_vert = `#version 300 es
    layout(location=${loc_aPosition}) in vec4	aPosition;
    layout(location=${loc_aNormal}) in vec3	aNormal;
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
    }`;
    const src_frag = `#version 300 es
    precision mediump float;
    in vec4 vPosEye;
    in vec3	vNormal;
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
    uniform TMaterial	material_front;
    uniform TMaterial	material_back;
    uniform TLight		light[1];
    void main()
    {
    	vec3	n = normalize(vNormal);
    	TMaterial	material;
    	if(gl_FrontFacing)
    	{
    		material = material_front;
    	}
    	else
    	{
    		material = material_back;
    		n = -n;
    	}
    	vec3	l;
    	vec3	v = normalize(-vPosEye.xyz);
    	fColor = vec4(0.0);
    	if(light[0].enabled)
    	{
    		if(light[0].position.w == 1.0)
    			l = normalize((light[0].position - vPosEye).xyz);
    		else
    			l = normalize((light[0].position).xyz);
    		vec3	r = reflect(-l, n);
    		float	l_dot_n = max(dot(l, n), 0.0);
    		vec3	ambient = light[0].ambient * material.ambient;
    		vec3	diffuse = light[0].diffuse * material.diffuse * l_dot_n;
    		vec3	specular = vec3(0.0);
    		if(l_dot_n > 0.0)
    		{
    			specular = light[0].specular * material.specular * pow(max(dot(r, v), 0.0), material.shininess);
    		}
    		fColor += vec4(ambient + diffuse + specular, 1);
    	}
    	
    	fColor.w = 1.0;
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    
    const V = mat4.create();
    mat4.lookAt(V, [3, 2, 3], [0, 0, 0], [0, 1, 0]);
    
    const P = mat4.create();
    mat4.perspective(P, toRadian(60), 1, 1, 100); 
 
    const light = new Light(gl,
        [0, .5, .5, 1], 
        [0.2, 0.2, 0.2, 1.0], 
        [1.0, 1.0, 1.0, 1.0], 
        [1.0, 1.0, 1.0, 1.0],
        true
    );
    
    const uniform_vars = ["MVP", "MV", "matNormal"];
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[0]"));
    Array.prototype.push.apply(uniform_vars, Material.generate_uniform_names("material_front"));
    Array.prototype.push.apply(uniform_vars, Material.generate_uniform_names("material_back"));
    
    const shader = new Shader(gl, src_vert, src_frag, uniform_vars);
    
    const quad = create_mesh_quad(gl, loc_aPosition, loc_aNormal);
    const axes = new Axes(gl);
    
    
    let t_last = Date.now();
    const ANGLE_STEP = 30.0;
    
    function tick() {
        let now = Date.now();
        let elapsed = now - t_last;
        t_last = now;
        
        mat4.rotate(quad.M, quad.M, toRadian((ANGLE_STEP * elapsed) / 1000.0), [0, 1, 0]);
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        axes.render(gl, V, P);
        
        light.render(gl, V, P);
        
        gl.useProgram(shader.h_prog);
        
        set_uniform_material(gl, shader, "material_front", __js_materials["gold"]);
        set_uniform_material(gl, shader, "material_back", __js_materials["silver"]);
        
        quad.render(gl, shader, [light], null, V, P);
        
        gl.useProgram(null);
        
        requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    };
    tick();
}

function set_uniform_material(gl, shader, vname, mat)
{
    gl.uniform3fv(shader.loc_uniforms[vname + ".ambient"], mat.ambient);
    gl.uniform3fv(shader.loc_uniforms[vname + ".diffuse"], mat.diffusive);
    gl.uniform3fv(shader.loc_uniforms[vname + ".specular"], mat.specular);
    gl.uniform1f(shader.loc_uniforms[vname + ".shininess"], mat.shininess*128.0);
}


function create_mesh_quad(gl, loc_aPosition, loc_aNormal)
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const verts = new Float32Array([
        -1,-1, 0,    0, 0, 1,
         1,-1, 0,    0, 0, 1,
         1, 1, 0,    0, 0, 1,
        -1, 1, 0,    0, 0, 1,
    ]);
    
    const vbo = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    const SZ = verts.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, SZ*6, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aNormal, 3, gl.FLOAT, false, SZ*6, SZ*3);
    gl.enableVertexAttribArray(loc_aNormal);
    
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return new Mesh({gl, vao, draw_call:"drawArrays", draw_mode:gl.TRIANGLE_FAN, n:4, loc_aPosition});
}



main();
