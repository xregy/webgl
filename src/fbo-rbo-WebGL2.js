import * as mat4 from "../lib/gl-matrix/mat4.js"
import {Shader} from "../modules/class_shader.mjs"

"use strict";

function main()
{
    const loc_aPosition = 2;
    const loc_aColor = 4;
    const src_vert = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aColor}) in vec4 aColor;
    out vec4 vColor;
    uniform mat4    MVP;
    void main()
    {
    	gl_Position = MVP*aPosition;
    	vColor = aColor;
    }`;
    const src_frag = `#version 300 es
    precision mediump float;
    in vec4 vColor;
    out vec4 fColor;
    void main()
    {
    	fColor = vColor;
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2", { antialias: false });
    
    const FBO_WIDTH = 256;
    const FBO_HEIGHT = 256;
    
    const triangles = init_triangles(gl, loc_aPosition, loc_aColor);
    const fbo = init_fbo(gl, FBO_WIDTH, FBO_HEIGHT);
    
    gl.enable(gl.DEPTH_TEST);
    
    const MVP = mat4.create();
    mat4.ortho(MVP, -1,1,-1,1,-1,1);
    
    const shader_simple = new Shader(gl, src_vert, src_frag, ["MVP"]);
    
    shader_simple.set_uniforms = function(gl) {
    	gl.uniformMatrix4fv(shader_simple.loc_uniforms["MVP"], false, MVP);
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
    gl.viewport(0, 0, FBO_WIDTH, FBO_HEIGHT);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    render_object(gl, shader_simple, triangles);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.5, .5, .5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo.fbo);
    
    const RECT_WIDTH	= 300;
    const RECT_HEIGHT	= 300;
    const SCALE_RECT_X	= 0.5;
    const SCALE_RECT_Y	= 1.5;
    const OFFSET_SRC_X	= 0;
    const OFFSET_SRC_Y	= 0;
    const OFFSET_DST_X	= 100;
    const OFFSET_DST_Y	= 10;
    gl.blitFramebuffer(OFFSET_SRC_X, OFFSET_SRC_Y, RECT_WIDTH, RECT_HEIGHT, OFFSET_DST_X, OFFSET_DST_Y,
    					OFFSET_DST_X + SCALE_RECT_X*RECT_WIDTH, OFFSET_DST_Y + SCALE_RECT_Y*RECT_HEIGHT,
    					gl.COLOR_BUFFER_BIT, gl.LINEAR);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
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


function init_fbo(gl, fbo_width, fbo_height)
{
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    
    const rbo_color = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo_color);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, fbo_width, fbo_height);	// gl.RGBA8 is not available for WebGL 1.
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbo_color);
    
    const rbo_depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo_depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fbo_width, fbo_height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo_depth);
    
    return {fbo:fbo, rbo:{color:rbo_color, depth:rbo_depth}};
}

main();

