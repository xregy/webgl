import {Shader} from "../modules/class_shader.mjs"

"use strict";


function main()
{
    const loc_aPosition = 3;
    const loc_aColor = 8;
    
    const src_vert = 
    `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aColor}) in vec3 aColor;
    out vec3 vColor;
    void main()
    {
        gl_Position = aPosition;
        vColor = aColor;
    }`;
    const src_frag = 
    `#version 300 es
    precision mediump float;
    in vec3	 vColor;
    out vec4 fColor;
    void main()
    {
        fColor = vec4(vColor,1);
    }`;
 
    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    const prog = new Shader(gl, src_vert, src_frag);
    
    const vertices = new Float32Array([
                        -0.9,-0.9, 1,0,0,
                         0.9,-0.9, 0,1,0,
                         0.9, 0.9, 0,0,1,
                        -0.9, 0.9, 1,1,1]);
    const FSIZE = vertices.BYTES_PER_ELEMENT;
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 5*FSIZE, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, 5*FSIZE, 2*FSIZE);
    gl.enableVertexAttribArray(loc_aColor);
    
    gl.bindVertexArray(null);
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog.h_prog);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);
}


main();
