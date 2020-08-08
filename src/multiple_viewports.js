import {Shader} from "../modules/class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"

"use strict";

function main()
{
    const loc_aPosition = 3;
    const loc_aColor = 7;

    const src_vert = 
    `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aColor}) in vec4 aColor;
    out vec4 vColor;
    uniform mat4 uMVP;
    void main()
    {
        gl_Position = uMVP*aPosition;
        vColor = aColor;
    }`;
    const src_frag =
    `#version 300 es
    precision mediump float;
    in vec4 vColor;
    out vec4 fColor;
    void main()
    {
        fColor = vColor;
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");

    const prog = new Shader(gl, src_vert, src_frag);
    gl.useProgram(prog.h_prog);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const {vao,n} = init_vbo(gl, loc_aPosition, loc_aColor);
    
    const w = canvas.width;
    const h = canvas.height;
    
    const loc_MVP = gl.getUniformLocation(prog.h_prog, 'uMVP');
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.viewport(0, 0, w/2, h);

    const P = mat4.create();
    const V = mat4.create();
    const MVP = mat4.create();
    mat4.ortho(P, -1,1,-1,1,0,2);
    mat4.lookAt(V, [1,.1,1], [0,0,0], [0,1,0]);
    mat4.multiply(MVP, P, V);
    gl.uniformMatrix4fv(loc_MVP, false, MVP);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    gl.bindVertexArray(null);
    
    gl.viewport(w/2, 0, w/2, h);
    mat4.ortho(P, -1,1,-1,1,0,2);
    mat4.lookAt(V, [1,.3,-1], [0,0,0], [0,1,0]);
    mat4.multiply(MVP, P, V);
    gl.uniformMatrix4fv(loc_MVP, false, MVP);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    gl.bindVertexArray(null);
}

function init_vbo(gl, loc_aPosition, loc_aColor)
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const attribs = new Float32Array([
        -.5, -.5, 0, 1, 0, 0,
         .5, -.5, 0, 0, 1, 0,
         .5,  .5, 0, 0, 0, 1,
        -.5,  .5, 0, 1, 1, 1,
        ]);

    const vbo = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, attribs, gl.STATIC_DRAW);
    
    const FSIZE = attribs.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, FSIZE*6, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
    gl.enableVertexAttribArray(loc_aColor);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {vao,n:4};
}

main();

