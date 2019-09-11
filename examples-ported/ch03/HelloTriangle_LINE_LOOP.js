// HelloTriangle_LINE_LOOP.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
void main() {
    gl_Position = aPosition;
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

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(vao);
  // Draw the rectangle
  gl.drawArrays(gl.LINE_LOOP, 0, n);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
  const vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  const n = 3; // The number of vertices

  // Create a buffer object
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  let vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
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
