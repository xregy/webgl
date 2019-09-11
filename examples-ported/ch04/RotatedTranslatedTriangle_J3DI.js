// RotatedTranslatedTriangle.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
uniform mat4 uModelMatrix;
void main() {
    gl_Position = uModelMatrix * aPosition;
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
    const gl = canvas.getContext("webgl2");
    
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    
    let {vao, n} = initVertexBuffers(gl);
    
    // Create Matrix4 object for model transformation
    let modelMatrix = new J3DIMatrix4();
    
    // Calculate a model matrix
    const ANGLE = 60.0; // The rotation angle
    const Tx = 0.5;     // Translation distance
    modelMatrix.rotate(ANGLE, 0, 0, 1); // Set rotation matrix
    modelMatrix.translate(Tx, 0, 0);        // Multiply modelMatrix by the calculated translation matrix
    
    // Pass the model matrix to the vertex shader
    const loc_uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix');
    if (!loc_uModelMatrix) {
      console.log('Failed to get the storage location of uModelMatrix');
      return;
    }
    modelMatrix.setUniform(gl, loc_uModelMatrix, false);
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertices = new Float32Array([ 0, 0.3,   -0.3, -0.3,   0.3, -0.3 ]);
    const n = 3;
    
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.bindVertexArray(null);
    
    return {vao, n};
}

