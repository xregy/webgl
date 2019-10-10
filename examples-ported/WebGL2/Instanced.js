"use strict";
const loc_aPosition = 3;
const VSHADER_SOURCE =
`#version 300 es
#define M_PI 3.1415926535897932384626433832795
layout(location=${loc_aPosition}) in vec4 aPosition;
uniform float uN;
void main() {
    float angle = 2.0*M_PI*float(gl_InstanceID)/uN;
    float c = cos(angle);
    float s = sin(angle);
    mat4 R = mat4(c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    gl_Position = R*aPosition;
}`;

// Fragment shader program
const FSHADER_SOURCE =
`#version 300 es
precision mediump float;
out vec4 fColor;
void main() {
    fColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

function main() {
    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    let loc_uN;
    loc_uN = gl.getUniformLocation(gl.program, 'uN');

    let {vao, n} = initVertexBuffers(gl);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    const N = 10;
    gl.uniform1f(loc_uN, N);

    gl.bindVertexArray(vao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, n, N);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
    const vertices = new Float32Array([
        0, 0, -0.1, -0.5, 0.1, -0.5
    ]);
    const n = 3; // The number of vertices
    
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.bindVertexArray(null);
    
    return {vao, n};
}
