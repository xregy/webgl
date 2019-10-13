"use strict";
const loc_aPosition = 3;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
uniform matrices
{
    mat4 uMat[3];
};
void main() {
    gl_Position = uMat[0] * uMat[1] * uMat[2] * aPosition;
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
    
    let matR = new Matrix4();
    let matT = new Matrix4();
    let matS = new Matrix4();

    let {ubo,buffer} = initUBO(gl, matR, matT, matS);

    gl.clearColor(0, 0, 0, 1);

    let tick = function() {
        render(gl, vao, n, ubo, buffer, matR, matT, matS);
        requestAnimationFrame(tick, canvas);
    };
    
    tick();
}

function render(gl, vao, n, ubo, buffer, matR, matT, matS)
{
    const ANGULAR_VELOCITY = 60.0;

    let now = Date.now();
    
    matR.setRotate( (now*0.001*ANGULAR_VELOCITY)%360, 0, 0, 1);
    matT.setTranslate(0.2*(0.5**Math.sin(0.001*now) + 1), 0, 0);
    let s = 0.5*Math.sin(0.001*now) + 1;
    matS.setScale(s,s,s);
    
    gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, buffer); // Update three uniforms all at once.
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    
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

function initUBO(gl, matR, matT, matS) {

    const binding_matrices = 7;

    console.log('MAX_UNIFORM_BUFFER_BINDINGS=' + gl.MAX_UNIFORM_BUFFER_BINDINGS);

    let idx_uniform_block = gl.getUniformBlockIndex(gl.program, 'matrices');   // uniform block index
    gl.uniformBlockBinding(gl.program, idx_uniform_block, binding_matrices);

    let ubo = gl.createBuffer();
    gl.bindBufferBase(gl.UNIFORM_BUFFER, binding_matrices, ubo);

    let FSIZE = 4;

    let buffer = new ArrayBuffer(FSIZE*16*3);

    // We re-assign the `elements' properties of Matrix4 objects
    // to the `DataView' in the buffer.
    // Old `Float32Array' objects referenced by `elements' will be garbage-collected later.
    // From now on, all the matrix operations will modify data in `buffer'.
    matR.elements = new Float32Array(buffer, 0, 16);
    matT.elements = new Float32Array(buffer, FSIZE*16, 16);
    matS.elements = new Float32Array(buffer, FSIZE*16*2, 16);

    gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, FSIZE*16*3, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    return {ubo,buffer};
}

