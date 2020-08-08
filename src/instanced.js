import {Shader} from "../modules/class_shader.mjs"

"use strict"

function main() {
    const loc_aPosition = 3;
    const loc_aColor = 8;
    const loc_aScale = 7;

    const src_vert =
    `#version 300 es
    #define M_PI 3.1415926535897932384626433832795
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aColor}) in vec4 aColor;
    layout(location=${loc_aScale}) in float aScale;
    uniform float uN;
    out vec4 vColor;
    void main() {
        float angle = 2.0*M_PI*float(gl_InstanceID)/uN;
        float c = cos(angle);
        float s = sin(angle);
        mat4 R = mat4(c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        gl_Position = R*vec4(aScale*aPosition.xyz, 1);
        vColor = aColor;
    }`;
    
    const src_frag =
    `#version 300 es
    precision mediump float;
    in vec4 vColor;
    out vec4 fColor;
    void main() {
        fColor = vColor;
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext('webgl2');
    const prog = new Shader(gl, src_vert, src_frag);
    gl.useProgram(prog.h_prog);

    const loc_uN = gl.getUniformLocation(prog.h_prog, 'uN');

    let {vao, n} = initVAO(gl, loc_aPosition, loc_aScale, loc_aColor);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    const N = 6;
    gl.uniform1f(loc_uN, N);

    gl.bindVertexArray(vao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, n, N);
    gl.bindVertexArray(null);
}

function initVAO(gl, loc_aPosition, loc_aScale, loc_aColor) {
    const vertices = new Float32Array([
        0, 0, -0.1, -0.5, 0.1, -0.5,
        1.5,
        1.0,
        0.5,
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
        0, 1, 1,
        1, 0, 1,
        1, 1, 0
    ]);
    const n = 3; // The number of vertices
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const FSIZE = vertices.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    gl.vertexAttribDivisor(loc_aPosition, 0);


    gl.vertexAttribPointer(loc_aScale, 1, gl.FLOAT, false, 0, FSIZE*(6));
    gl.enableVertexAttribArray(loc_aScale);
    gl.vertexAttribDivisor(loc_aScale, 2);

    gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, 0, FSIZE*(6+3));
    gl.enableVertexAttribArray(loc_aColor);
    gl.vertexAttribDivisor(loc_aColor, 1);
    
    gl.bindVertexArray(null);
    
    return {vao, n};
}

main();
