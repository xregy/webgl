// RotatedTriangle.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
uniform float uCosB, uSinB;
void main() {
    gl_Position.x = aPosition.x * uCosB - aPosition.y * uSinB;
    gl_Position.y = aPosition.x * uSinB + aPosition.y * uCosB;
    gl_Position.z = aPosition.z;
    gl_Position.w = 1.0;
}`;

// Fragment shader program
const FSHADER_SOURCE =
`#version 300 es
precision mediump float;
out vec4 fColor;
void main() {
    fColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

// The rotation angle
const ANGLE = 90.0; 

function main() {
  // Retrieve <canvas> element
  const canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices to a vertex shader
  let {vao, n} = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // // Pass the data required to rotate the shape to the vertex shader
  let radian = Math.PI * ANGLE / 180.0; // Convert to radians
  let cosB = Math.cos(radian);
  let sinB = Math.sin(radian);

  const loc_uCosB = gl.getUniformLocation(gl.program, 'uCosB');
  const loc_uSinB = gl.getUniformLocation(gl.program, 'uSinB');
  if (!loc_uCosB || !loc_uSinB) {
    console.log('Failed to get the storage location of uCosB or uSinB');
    return;
  }
  gl.uniform1f(loc_uCosB, cosB);
  gl.uniform1f(loc_uSinB, sinB);

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(vao);
  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
  const vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  const n = 3; // The number of vertices

  let vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  // Create a buffer object
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to aPosition variable
  gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to aPosition variable
  gl.enableVertexAttribArray(loc_aPosition);

  gl.bindVertexArray(null);

  return {vao, n};
}
