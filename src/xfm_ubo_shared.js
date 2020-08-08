import {Shader} from "../modules/class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"

"use strict";

function main() {
    const loc_aPosition = 3;
    const binding_matrices = 8;

    const src_vert =
    [
    `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    uniform matrices
    {
        mat4 uMat[3];
    };
    void main() {
        gl_Position = uMat[0] * uMat[1] * uMat[2] * aPosition;
    }`,
    `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    uniform matrices
    {
        mat4 uMat[3];
    };
    void main() {
        gl_Position = uMat[0] * uMat[1] * uMat[2] * vec4(0.5*aPosition.xyz, 1);
    }`];
 
    const src_frag = 
    [
    `#version 300 es
    precision mediump float;
    out vec4 fColor;
    void main() {
        fColor = vec4(1.0, 0.0, 0.0, 1.0);
    }`,
    `#version 300 es
    precision mediump float;
    out vec4 fColor;
    void main() {
        fColor = vec4(0.0, 0.0, 1.0, 1.0);
    }`];

    const canvas = document.getElementById('webgl');
    
    const gl = canvas.getContext('webgl2');

    let progs = [];
    for(let i=0 ; i<2 ; i++)
    {
        progs[i] = new Shader(gl, src_vert[i], src_frag[i]);
    }
    
    const {vao, n} = initVAO(gl, loc_aPosition);
    
    let {ubo, buffer, matR, matT, matS} = initUBO(gl, progs, binding_matrices);

    gl.clearColor(0, 0, 0, 1);

    let tick = function() {
        render(gl, progs, vao, n, ubo, buffer, matR, matT, matS);
        requestAnimationFrame(tick, canvas);
    };
    
    tick();
}

function render(gl, progs, vao, n, ubo, buffer, matR, matT, matS)
{
    const ANGULAR_VELOCITY = 60.0;

    let now = Date.now();
    
    mat4.fromRotation(matR, toRadian( (now*0.001*ANGULAR_VELOCITY)%360), [0, 0, 1]);
    mat4.fromTranslation(matT, [0.2*(0.5**Math.sin(0.001*now) + 1), 0, 0]);
    const s = 0.5*Math.sin(0.001*now) + 1;
    mat4.fromScaling(matS, [s,s,s]);

    gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, buffer); // Update three uniforms all at once.
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    for(let i=0 ; i<2 ; i++)
    {
        gl.useProgram(progs[i].h_prog);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, n);
        gl.bindVertexArray(null);
        gl.useProgram(null);
    }
}

function initVAO(gl, loc_aPosition) {
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

function initUBO(gl, progs, binding_matrices) {

    const ubo = gl.createBuffer();

    gl.bindBufferBase(gl.UNIFORM_BUFFER, binding_matrices, ubo);

    for(let i=0 ; i<2 ; i++)
    {
        let idx_uniform_block = gl.getUniformBlockIndex(progs[i].h_prog, 'matrices');   // uniform block index
        gl.uniformBlockBinding(progs[i].h_prog, idx_uniform_block, binding_matrices);
    }

    const FSIZE = 4;

    const buffer = new ArrayBuffer(FSIZE*16*3);

    // We re-assign the matrices
    // to the `DataView' in the buffer.
    // Old `Float32Array' objects referenced by `elements' will be garbage-collected later.
    // From now on, all the matrix operations will modify data in `buffer'.
    let matR = new Float32Array(buffer, 0, 16);
    let matT = new Float32Array(buffer, FSIZE*16, 16);
    let matS = new Float32Array(buffer, FSIZE*16*2, 16);

    gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, FSIZE*16*3, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    return {ubo, buffer, matR, matT, matS};
}

main();

