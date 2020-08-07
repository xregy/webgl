import * as mat4 from "../lib/gl-matrix/mat4.js"
import {Shader} from "../modules/class_shader.mjs"

"use strict"

function main()
{
    const loc_aPosition = 2;
    const loc_aColor0 = 9;
    const loc_aColor1 = 5;
    const loc_aTexCoord = 8;
    const tex_unit = 3;

    const src_vert = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aColor0}) in vec4    aColor0;
    layout(location=${loc_aColor1}) in vec4    aColor1;
    out vec4    vColor0;
    out vec4    vColor1;
    uniform mat4    MVP;
    void main()
    {
    	gl_Position = MVP*aPosition;
    	vColor0 = aColor0;
    	vColor1 = aColor1;
    }`;
    const src_frag = `#version 300 es
    //			#extension GL_EXT_draw_buffers : require 
    precision mediump float;
    in vec4    vColor0;
    in vec4    vColor1;
    layout(location=0) out vec4 fColor0;
    layout(location=1) out vec4 fColor1;
    void main()
    {
    	fColor0 = vColor0;
    	fColor1 = vColor1;
    }`;
    const src_vert_tex = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aTexCoord}) in vec2 aTexCoord;
    out vec2 vTexCoord;
    uniform mat4    MVP;
    void main()
    {
    	gl_Position = MVP*aPosition;
    	vTexCoord = aTexCoord;
    }`;
    const src_frag_tex = `#version 300 es
    precision mediump float;
    in vec2 vTexCoord;
    out vec4 fColor;
    uniform sampler2D tex;
    void main()
    {
    	fColor = texture(tex, vTexCoord);
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    const FBO_WIDTH = 256;
    const FBO_HEIGHT = 256;
    
    const triangles = init_triangles(gl, loc_aPosition, loc_aColor0, loc_aColor1);
    const quad = init_quad(gl, loc_aPosition, loc_aTexCoord);
    const fbo = init_fbo(gl, FBO_WIDTH, FBO_HEIGHT);
    
    gl.enable(gl.DEPTH_TEST);
    
    const P = mat4.create();
    mat4.ortho(P, -1,1,-1,1,-1,1);
    
    const shader_simple = new Shader(gl, src_vert, src_frag, ["MVP"]);
    
    const shader_tex = new Shader(gl, src_vert_tex, src_frag_tex, ["MVP", "tex"]);
    
    shader_simple.set_uniforms = function(gl) {
    	gl.uniformMatrix4fv(shader_simple.loc_uniforms["MVP"], false, MVP);
    };
    
    
    
    shader_tex.set_uniforms = function(gl) {
    	gl.uniformMatrix4fv(shader_tex.loc_uniforms["MVP"], false, MVP);
    	gl.uniform1i(shader_tex.loc_uniforms["tex"], tex_unit);
    };
    
    const MVP = mat4.create();
    mat4.copy(MVP, P);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    gl.viewport(0, 0, FBO_WIDTH, FBO_HEIGHT);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    render_object(gl, shader_simple, triangles);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.5, .5, .5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.activeTexture(gl.TEXTURE0 + tex_unit);
    
    mat4.copy(MVP, P);
    mat4.translate(MVP, MVP, [-.5,.5,0]);
    gl.bindTexture(gl.TEXTURE_2D, fbo.color[0]);
    render_object(gl, shader_tex, quad);
    
    mat4.copy(MVP, P);
    mat4.translate(MVP, MVP, [.5,-.5,0]);
    gl.bindTexture(gl.TEXTURE_2D, fbo.color[1]);
    render_object(gl, shader_tex, quad);
}

function render_object(gl, shader, object)
{
    gl.useProgram(shader.h_prog);
    gl.bindVertexArray(object.vao);
    
    shader.set_uniforms(gl);
    
    if(object.drawcall == "drawArrays") gl.drawArrays(object.type, 0, object.n);
    else if(object.drawcall == "drawElements") gl.drawElements(object.type, object.n, object.type_index, 0);
    
    gl.bindVertexArray(null);
    
    gl.useProgram(null);
}

function init_triangles(gl, loc_aPosition, loc_aColor0, loc_aColor1)
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const verts = new Float32Array([
//               aPosition            aColor0        aColor1
         -0.50, -0.50,  0.1, 1.0,    0, 0, 1, 1,    1, 1, 0, 1 ,
          0.90, -0.50,  0.1, 1.0,    0, 0, 1, 1,    1, 1, 0, 1 ,
          0.20,  0.90,  0.1, 1.0,    0, 0, 1, 1,    1, 1, 0, 1 ,
        
         -0.70, -0.70,  0.0, 1.0,    0, 1, 0, 1,    1, 0, 1, 1 ,
          0.70, -0.70,  0.0, 1.0,    0, 1, 0, 1,    1, 0, 1, 1 ,
          0.00,  0.70,  0.0, 1.0,    0, 1, 0, 1,    1, 0, 1, 1 ,
        
         -0.90, -0.90, -0.1, 1.0,    1, 0, 0, 1,    0, 1, 1, 1 ,
          0.50, -0.90, -0.1, 1.0,    1, 0, 0, 1,    0, 1, 1, 1 ,
         -0.20,  0.50, -0.1, 1.0,    1, 0, 0, 1,    0, 1, 1, 1 ,
    ]);
    
    const buf = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    const SZ = verts.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 4, gl.FLOAT, false, SZ*12, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.vertexAttribPointer(loc_aColor0, 4, gl.FLOAT, false, SZ*12, SZ*4);
    gl.enableVertexAttribArray(loc_aColor0);

    gl.vertexAttribPointer(loc_aColor1, 4, gl.FLOAT, false, SZ*12, SZ*8);
    gl.enableVertexAttribArray(loc_aColor1);

    gl.bindVertexArray(null);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return {vao:vao, n:9, drawcall:"drawArrays", type:gl.TRIANGLES};
}

function init_quad(gl, loc_aPosition, loc_aTexCoord)
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const verts = new Float32Array([
         -0.45, -0.45, 0, 0 , 
          0.45, -0.45, 1, 0 ,
          0.45,  0.45, 1, 1 ,
         -0.45,  0.45, 0, 1 ,
    ]);
    const buf = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    const SZ = verts.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, SZ*4, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aTexCoord, 2, gl.FLOAT, false, SZ*4, SZ*2);
    gl.enableVertexAttribArray(loc_aTexCoord);
    
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return {vao:vao, n:4, drawcall:"drawArrays", type:gl.TRIANGLE_FAN};

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
    
    const rbo_depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo_depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fbo_width, fbo_height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo_depth);
    
    return {fbo:fbo, color:[tex_color0, tex_color1], depth:rbo_depth};
}

main();

