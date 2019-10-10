"use strict";
const loc_aPosition = 3;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
uniform mat4 matrices[3];
void main() {
    gl_Position = matrices[2] * matrices[1] * matrices[0] * aPosition;
}`;

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
    
    let {vao, n} = initVAO(gl);
    
    let matRotate = new Matrix4();
    let matTranslate = new Matrix4();
    let matScale = new Matrix4();
    
    const loc_uMatRotate = gl.getUniformLocation(gl.program, 'matrices[2]');
    const loc_uMatTranslate = gl.getUniformLocation(gl.program, 'matrices[1]');
    const loc_uMatScale = gl.getUniformLocation(gl.program, 'matrices[0]');

    gl.clearColor(0, 0, 0, 1);


    let tick = function() {
        render(gl, vao, n, loc_uMatRotate, loc_uMatTranslate, loc_uMatScale,
            matRotate, matTranslate, matScale);
        requestAnimationFrame(tick, canvas);
    };
    
    tick();
}

function render(gl, vao, n, loc_uMatRotate, loc_uMatTranslate, loc_uMatScale,
                matRotate, matTranslate, matScale)
{
    const ANGULAR_VELOCITY = 60.0;

    let now = Date.now();
    
    matRotate.setRotate( (now*0.001*ANGULAR_VELOCITY)%360, 0, 0, 1);
    matTranslate.setTranslate(0.2*(0.5**Math.sin(0.001*now) + 1), 0, 0);
    let s = 0.5*Math.sin(0.001*now) + 1;
    matScale.setScale(s,s,s);
    
    gl.uniformMatrix4fv(loc_uMatRotate, false, matRotate.elements);
    gl.uniformMatrix4fv(loc_uMatTranslate, false, matTranslate.elements);
    gl.uniformMatrix4fv(loc_uMatScale, false, matScale.elements);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.bindVertexArray(null);
    
}

function initVAO(gl) {
    const vertices = new Float32Array([
        0, 0.1,   -0.1, -0.1,   0.1, -0.1
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

