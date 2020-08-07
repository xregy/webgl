import * as mat4 from "../lib/gl-matrix/mat4.js"
import {Shader} from "../modules/class_shader.mjs"
import {toRadian} from "../lib/gl-matrix/common.js"
import {Mesh} from "../modules/class_mesh.mjs"

"use strict";

function main() 
{
    const loc_aPosition = 2;
    const loc_aNormal = 8;
    const loc_aTexCoord = 9;
    const numLights = 0;

    const src_vert_preproc = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aNormal}) in vec4 aNormal;
    uniform mat4    MVP;
    uniform mat4	MV;
    uniform mat4	matNormal;
    out vec4	vPosition;
    out	vec3	vNormal;
    void main()
    {
    	gl_Position = MVP*aPosition;
    	vPosition = MV*aPosition;
    	vNormal = normalize((matNormal*vec4(aNormal.xyz, 0)).xyz);
    }`;
    const src_frag_preproc = `#version 300 es
    #ifdef GL_ES
    precision mediump float;
    #endif
    in vec4	vPosition;
    in	vec3	vNormal;
    uniform vec4	diffuse;
    layout(location=0) out vec4 fPosition;
    layout(location=1) out vec4 fNormal;
    layout(location=2) out vec4 fDiffuse;
    void main()
    {
    	fPosition = vPosition;
    	fNormal = vec4(normalize(vNormal),1);
    	fDiffuse = diffuse;
    }`;
    const src_vert_tex = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aTexCoord}) in vec2 aTexCoord;
    out vec2 vTexCoord;
    void main()
    {
    	gl_Position = aPosition;
    	vTexCoord = aTexCoord;
    }`;
    const src_frag_tex = `#version 300 es
    #ifdef GL_ES
    precision mediump float;
    #endif
    in vec2 vTexCoord;
    out vec4 fColor;
    uniform sampler2D tex;
    void main()
    {
    	fColor = texture(tex, vTexCoord);
    }`;
    const src_vert_shading = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aTexCoord}) in vec2 aTexCoord;
    out vec2 vTexCoord;
    void main()
    {
    	gl_Position = aPosition;
    	vTexCoord = aTexCoord;
    }`;
    const src_frag_shading = `#version 300 es
    #ifdef GL_ES
    precision mediump float;
    #endif
    in vec2 vTexCoord;
    out vec4 fColor;
    uniform sampler2D	tex_position;
    uniform sampler2D	tex_normal;
    uniform sampler2D	tex_diffuse;
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
    	vec3	ambient;
    	vec3	diffuse;
    	vec3	specular;
    };
    TLight		light;
    TMaterial	material;
    uniform vec4	light_position;
    void main()
    {
    	vec3	n = texture(tex_normal, vTexCoord).xyz;
    	vec4	p = texture(tex_position, vTexCoord);
    	
    	material.diffuse = texture(tex_diffuse, vTexCoord).rgb;
    	material.shininess = 12.8;
    	material.specular = vec3(.7);
    	material.ambient = vec3(.1);
    
    	light.ambient = vec3(.1);
    	light.diffuse = vec3(1);
    	light.specular = vec3(1);
    
    	vec3	l;
    	if(light_position.w == 1.0)
    		l = normalize((light_position - p).xyz);
    	else
    		l = normalize((light_position).xyz);
    	vec3	v = normalize(-p.xyz);
    
    	vec3	r = reflect(-l, n);
    	float	l_dot_n = max(dot(l, n), 0.0);
    
    	vec3	ambient = light.ambient * material.ambient;
    	vec3	diffuse = light.diffuse * material.diffuse.rgb * l_dot_n;
    	vec3	specular = vec3(0.0);
    	if(l_dot_n > 0.0)
    	{
    		specular = light.specular * material.specular * pow(max(dot(r, v), 0.0), material.shininess);
    	}
    	fColor = vec4(ambient + diffuse + specular, 1);
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    const FBO_WIDTH = canvas.width/2;
    const FBO_HEIGHT = canvas.height/2;
    
    const quad = init_quad(gl, loc_aPosition, loc_aTexCoord);
    const fbo = init_fbo(gl, FBO_HEIGHT, FBO_HEIGHT);
    
    gl.enable(gl.DEPTH_TEST);
    
    const P = mat4.create();
    const V = mat4.create();
    
    const tex_unit_position = 3;
    const tex_unit_normal = 2;
    const tex_unit_diffuse = 1;
    
    mat4.perspective(P, toRadian(50), 1, 1, 20); 
    mat4.lookAt(V, [0,3,7],[0,0,0],[0,1,0]);
    
    const shader_preproc = new Shader(gl, src_vert_preproc, src_frag_preproc,
        ["MVP", "MV", "matNormal", "diffuse"]);
    
    const shader_shading = new Shader(gl, src_vert_shading, src_frag_shading,
        ["tex_position", "tex_normal", "tex_diffuse", "light_position"]);
    
    
    const shader_tex = new Shader(gl, src_vert_tex, src_frag_tex, ["tex"]);
    
    shader_preproc.set_uniforms = function(gl, diffuse) {
    		gl.uniformMatrix4fv(this.loc_uniforms["MVP"], false, MVP);
    		gl.uniformMatrix4fv(this.loc_uniforms["MV"], false, MV);
    		gl.uniformMatrix4fv(this.loc_uniforms["matNormal"], false, MV);
    		gl.uniform4f(this.loc_uniforms["diffuse"], diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
    };
    
    shader_shading.set_uniforms = function(gl) {
    		gl.uniform1i(this.loc_uniforms["tex_position"], tex_unit_position);
    		gl.uniform1i(this.loc_uniforms["tex_normal"], tex_unit_normal);
    		gl.uniform1i(this.loc_uniforms["tex_diffuse"], tex_unit_diffuse);
    		gl.uniform4f(this.loc_uniforms["light_position"], 1, 1, 1, 0);
    };
    
    shader_tex.set_uniforms = function(gl) {
    	gl.uniform1i(this.loc_uniforms["tex"], 0);
    };
    
    
    const monkey = new Mesh({gl, loc_aPosition});
    monkey.init_from_json_js(gl, __js_monkey_sub2_smooth, loc_aPosition, loc_aNormal);
    const sphere = new Mesh({gl, loc_aPosition});
    sphere.init_from_json_js(gl, __js_sphere, loc_aPosition, loc_aNormal);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
    gl.drawBuffers([
        gl.COLOR_ATTACHMENT0, 
        gl.COLOR_ATTACHMENT1, 
        gl.COLOR_ATTACHMENT2, 
        ]);
    gl.viewport(0, 0, FBO_HEIGHT, FBO_HEIGHT);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    const MV = mat4.create();
    const MVP = mat4.create();

    mat4.copy(MV, V);
    mat4.translate(MV, MV, [-1.5,0,0]);
    mat4.copy(MVP, P);
    mat4.multiply(MVP, MVP, MV);
    render_object(gl, shader_preproc, monkey, [1,0,0,1]);
    
    mat4.copy(MV, V);
    mat4.translate(MV, MV, [1.5,0,0]);
    mat4.copy(MVP, P);
    mat4.multiply(MVP, MVP, MV);
    render_object(gl, shader_preproc, sphere, [0,0,1,1]);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // upper left quad
    gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbo.color[0]);
    render_quad(gl, shader_tex, quad);
    
    // upper right quad
    gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbo.color[1]);
    render_quad(gl, shader_tex, quad);
    
    // lower left quad
    gl.viewport(0, 0, canvas.width/2, canvas.height/2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbo.color[2]);
    render_quad(gl, shader_tex, quad);
    
    // lower right quad
    gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2);
    gl.activeTexture(gl.TEXTURE0 + tex_unit_position);
    gl.bindTexture(gl.TEXTURE_2D, fbo.color[0]);
    gl.activeTexture(gl.TEXTURE0 + tex_unit_normal);
    gl.bindTexture(gl.TEXTURE_2D, fbo.color[1]);
    gl.activeTexture(gl.TEXTURE0 + tex_unit_diffuse);
    gl.bindTexture(gl.TEXTURE_2D, fbo.color[2]);
    render_quad(gl, shader_shading, quad);
}


function render_object(gl, shader, object, diffuse)
{
	gl.useProgram(shader.h_prog);
    gl.bindVertexArray(object.vao);
	shader.set_uniforms(gl, diffuse);

    gl.drawElements(object.draw_mode, object.n, object.index_buffer_type, 0);

    gl.bindVertexArray(null);
	gl.useProgram(null);
}

function render_quad(gl, shader, quad)
{
	gl.useProgram(shader.h_prog);
    gl.bindVertexArray(quad);
	shader.set_uniforms(gl);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);
	gl.useProgram(null);
}



function init_quad(gl, loc_aPosition, loc_aTexCoord)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let verts = new Float32Array([
         -1, -1, 0, 0 , 
          1, -1, 1, 0 ,
          1,  1, 1, 1 ,
         -1,  1, 0, 1 ,
    ]);
    let buf = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    let SZ = verts.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, SZ*4, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aTexCoord, 2, gl.FLOAT, false, SZ*4, SZ*2);
    gl.enableVertexAttribArray(loc_aTexCoord);
    
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return vao;
}

function init_fbo(gl, fbo_width, fbo_height)
{
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    
    const tex_color0 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex_color0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fbo_width, fbo_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex_color0, 0);
    
    
    const tex_color1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex_color1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fbo_width, fbo_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, tex_color1, 0);
    
    const tex_color2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex_color2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fbo_width, fbo_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, tex_color2, 0);
    
    const rbo_depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo_depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fbo_width, fbo_height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo_depth);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    return {fbo:fbo, color:[tex_color0, tex_color1, tex_color2], depth:rbo_depth};
}

main();

