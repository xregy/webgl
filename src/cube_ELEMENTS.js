import {Shader} from "../modules/class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"

"use strict";

function main() {
    const loc_aPosition = 3;
    const loc_aColor = 8;
    const src_vert = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aColor}) in vec4 aColor;
    uniform mat4 uMVP;
    out vec4 vColor;
    void main()
    {
        gl_Position = uMVP * aPosition;
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
    const gl = canvas.getContext("webgl2");

    const prog = new Shader(gl, src_vert, src_frag);
    gl.useProgram(prog.h_prog);

    const vao = initVertexBuffers({gl, loc_aPosition, loc_aColor});
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,1);
    
    const loc_MVP = gl.getUniformLocation(prog.h_prog, 'uMVP');

    const P = mat4.create();
    const V = mat4.create();
    const MVP = mat4.create();
    mat4.perspective(P, toRadian(30), 1, 1, 100);
    mat4.lookAt(V, [3, 3, 7], [0, 0, 0], [0, 1, 0]);
    mat4.multiply(MVP, P, V);
    gl.uniformMatrix4fv(loc_MVP, false, MVP);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(prog.h_prog);
    
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, 3*2*6, gl.UNSIGNED_BYTE, 0);
    gl.bindVertexArray(null);
}

function initVertexBuffers({gl, loc_aPosition, loc_aColor}) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    const verticesColors = new Float32Array([
         1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
        -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
         1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
         1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
         1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
        -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
    ]);
    
    // Indices of the vertices
    const indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        0, 3, 4,   0, 4, 5,    // right
        0, 5, 6,   0, 6, 1,    // up
        1, 6, 7,   1, 7, 2,    // left
        7, 4, 3,   7, 3, 2,    // down
        4, 7, 6,   4, 6, 5     // back
    ]);
    
    // Create a buffer object
    const vbo = gl.createBuffer();
    const ibo = gl.createBuffer();
    
    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    
    const FSIZE = verticesColors.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(loc_aColor);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return vao;
}

main();
