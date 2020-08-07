import * as mat4 from "../lib/gl-matrix/mat4.js"
import {Shader} from "../modules/class_shader.mjs"

"use strict";

function main()
{
    const loc_aPosition = 3;
    const loc_aColor = 8;
    const loc_aTexCoord = 9;
    const src_vert_simple = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aColor}) in vec4 aColor;
    out vec4 vColor;
    uniform mat4    MVP;
    void main()
    {
        gl_Position = MVP*aPosition;
        vColor = aColor;
    }`;
    const src_frag_simple = `#version 300 es
    precision mediump float;
    in vec4 vColor;
    out vec4 fColor;
    void main()
    {
        fColor = vColor;
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
    
    const triangles = init_triangles(gl, loc_aPosition, loc_aColor);
    const quad = init_quad(gl, loc_aPosition, loc_aTexCoord);
    const fbo = init_fbo(gl, FBO_WIDTH, FBO_HEIGHT);
    
    gl.enable(gl.DEPTH_TEST);
    
    const MVP = mat4.create();
    mat4.ortho(MVP, -1,1,-1,1,-1,1);
    
    const shader_simple = new Shader(gl, src_vert_simple, src_frag_simple, ["MVP"]);
    
    const shader_tex = new Shader(gl, src_vert_tex, src_frag_tex, ["tex"]);
    
    shader_simple.set_uniforms = function(gl) {
    		gl.uniformMatrix4fv(shader_simple.loc_uniforms["MVP"], false, MVP);
        }
    shader_tex.set_uniforms = function(gl) {
    		gl.uniform1i(shader_tex.loc_uniforms["tex"], fbo.tex);
        }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);	// from now on, we render to the FBO
    gl.viewport(0, 0, FBO_WIDTH, FBO_HEIGHT);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    render_object(gl, shader_simple, triangles);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);	// From now on, we render to the canvas
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.5, .5, .5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, fbo.tex);
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

function init_triangles(gl, loc_aPosition, loc_aColor)
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    const verts = new Float32Array([
         -0.50, -0.50,  0.1, 0, 0, 1 ,
          0.90, -0.50,  0.1, 0, 0, 1 ,
          0.20,  0.90,  0.1, 0, 0, 1 ,
        
         -0.70, -0.70,  0.0, 0, 1, 0 ,
          0.70, -0.70,  0.0, 0, 1, 0 ,
          0.00,  0.70,  0.0, 0, 1, 0 ,
        
         -0.90, -0.90, -0.1, 1, 0, 0 ,
          0.50, -0.90, -0.1, 1, 0, 0 ,
         -0.20,  0.50, -0.1, 1, 0, 0 ,
    ]);
    
    const buf = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    const SZ = verts.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, SZ*6, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, SZ*6, SZ*3);
    gl.enableVertexAttribArray(loc_aColor);
    
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return {vao:vao, n:9, drawcall:"drawArrays", type:gl.TRIANGLES};
}

function init_quad(gl, loc_aPosition, loc_aTexCoord)
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const verts = new Float32Array([
         -0.90,  0.00, 0, 0 , 
          0.00, -0.90, 1, 0 ,
          0.00,  0.90, 0, 1 ,
          0.90,  0.00, 1, 1 ,
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
    
    return {vao:vao, n:4, drawcall:"drawArrays", type:gl.TRIANGLE_STRIP};
}


function init_fbo(gl, width, height)
{
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    
    const tex_color = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex_color);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, null); // Just to verify that the texture needs not be bound to be attached to a FBO
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex_color, 0);
    
    const rbo_depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo_depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);	// Just to verify that the RBO needs not be bound to be attached to a FBO
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo_depth);
    
    return {fbo:fbo, tex:tex_color, rbo:rbo_depth};
}

main();
