import {Shader} from "../modules/class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"

"use strict";

function main() {
    const loc_aPosition = 3;

    const src_vert =
    `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    uniform mat4 matrices[3];
    void main() {
        gl_Position = matrices[2] * matrices[1] * matrices[0] * aPosition;
    }`;
    
    const src_frag =
    `#version 300 es
    precision mediump float;
    out vec4 fColor;
    void main() {
        fColor = vec4(1.0, 0.0, 0.0, 1.0);
    }`;


    const canvas = document.getElementById('webgl');
    
    const gl = canvas.getContext('webgl2');
    
    const prog = new Shader(gl, src_vert, src_frag);
    gl.useProgram(prog.h_prog);
    
    const {vao, n} = initVAO(gl, loc_aPosition);
    
    const matRotate = mat4.create();
    const matTranslate = mat4.create();
    const matScale = mat4.create();
    
    const loc_uMatRotate = gl.getUniformLocation(prog.h_prog, 'matrices[2]');
    const loc_uMatTranslate = gl.getUniformLocation(prog.h_prog, 'matrices[1]');
    const loc_uMatScale = gl.getUniformLocation(prog.h_prog, 'matrices[0]');

    gl.clearColor(0, 0, 0, 1);

    function tick() {
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
    
    mat4.fromRotation(matRotate, toRadian( (now*0.001*ANGULAR_VELOCITY)%360), [0, 0, 1]);
    mat4.fromTranslation(matTranslate, [0.2*(0.5**Math.sin(0.001*now) + 1), 0, 0]);
    let s = 0.5*Math.sin(0.001*now) + 1;
    mat4.fromScaling(matScale, [s,s,s]);
    
    gl.uniformMatrix4fv(loc_uMatRotate, false, matRotate);
    gl.uniformMatrix4fv(loc_uMatTranslate, false, matTranslate);
    gl.uniformMatrix4fv(loc_uMatScale, false, matScale);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.bindVertexArray(null);
    
}

function initVAO(gl, loc_aPosition) {
    const vertices = new Float32Array([
        0, 0.1,   -0.1, -0.1,   0.1, -0.1
    ]);
    const n = 3; // The number of vertices
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.bindVertexArray(null);
    
    return {vao, n};
}

main();

