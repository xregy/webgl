"use strict";
// RotatedTranslatedTriangle.js (c) 2012 matsuda
// Vertex shader program

"use strict";
let loc_aPosition = 3;
let VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
uniform mat4 uModelMatrix;
void main() {
    gl_Position = uModelMatrix * aPosition;
}`;

// Fragment shader program
let FSHADER_SOURCE =
`#version 300 es
precision mediump float;
out vec4 fColor;
void main() {
    fColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

function main() {
    let canvas = document.getElementById('webgl');
    let gl = canvas.getContext("webgl2");
    
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    
    let vao = initVertexBuffers(gl);
    
    let modelMatrix = mat4.create();
    
    // Calculate a model matrix
    let ANGLE = 60.0; // The rotation angle
    let Tx = 0.5;     // Translation distance
    mat4.rotate(modelMatrix, modelMatrix, ANGLE*Math.PI/180.0, [0,0,1]);	// Set rotation matrix
    mat4.translate(modelMatrix, modelMatrix, [Tx, 0, 0]);        // Multiply modelMatrix by the calculated translation matrix
    
    // Pass the model matrix to the vertex shader
    let loc_uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix');
    gl.uniformMatrix4fv(loc_uModelMatrix, false, modelMatrix);
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let vertices = new Float32Array([ 0, 0.3,   -0.3, -0.3,   0.3, -0.3 ]);
    
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.bindVertexArray(null);

    return vao;
}

