import {Shader} from "../modules/class_shader.mjs"

"use strict";
function main()
{
    const loc_aPosition = 7;

    const src_vert = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    void main() 
    {
    	gl_Position = aPosition;
    	gl_PointSize = 100.0;
    }
    `;
    const src_frag = `#version 300 es
    precision mediump float;
    out vec4 fColor;
    void main() 
    {
    	if(length(gl_PointCoord - vec2(.5,.5)) <= 0.4)    fColor = vec4(1,0,0,1);
    	else discard;
    }
    `;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    const prog = new Shader(gl, src_vert, src_frag);
    
    const vao = initVertexBuffers({gl, loc_aPosition});
    
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog.h_prog);
    
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.POINTS, 0, 3);
    gl.bindVertexArray(null);
}

function initVertexBuffers({gl, loc_aPosition})
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    const vertices = new Float32Array([
     .9,  .2,
    -.3, -.7,
    0.0, 0.5
    ]);
    
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.bindVertexArray(null);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return vao;
}

main();
