// PerspectiveView.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const loc_aColor = 7;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
out vec4 vColor;
void main() {
  gl_Position = uProjMatrix * uViewMatrix * aPosition;
  vColor = aColor;
}`;

// Fragment shader program
const FSHADER_SOURCE =
`#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 fColor;
void main() {
  fColor = vColor;
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

  // Set the vertex coordinates and color (the blue triangle is in the front)
  const {vao, n} = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // get the storage locations of uViewMatrix and uProjMatrix
  const loc_uViewMatrix = gl.getUniformLocation(gl.program, 'uViewMatrix');
  const loc_uProjMatrix = gl.getUniformLocation(gl.program, 'uProjMatrix');
  if (!loc_uViewMatrix || !loc_uProjMatrix) { 
    console.log('Failed to get the storage location of uViewMatrix and/or uProjMatrix');
    return;
  }

  let viewMatrix = new Matrix4();　// The view matrix
  let projMatrix = new Matrix4();  // The projection matrix

  // calculate the view matrix and projection matrix
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  // Pass the view and projection matrix to loc_uViewMatrix, loc_uProjMatrix
  gl.uniformMatrix4fv(loc_uViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(loc_uProjMatrix, false, projMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(vao);
  // Draw the triangles
  gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
  const verticesColors = new Float32Array([
    // Three triangles on the right side
    0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
    0.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
    1.25, -1.0,  -4.0,  1.0,  0.4,  0.4, 

    0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
    0.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
    1.25, -1.0,  -2.0,  1.0,  0.4,  0.4, 

    0.75,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
    0.25, -1.0,   0.0,  0.4,  0.4,  1.0,
    1.25, -1.0,   0.0,  1.0,  0.4,  0.4, 

    // Three triangles on the left side
   -0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
   -1.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
   -0.25, -1.0,  -4.0,  1.0,  0.4,  0.4, 

   -0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
   -1.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
   -0.25, -1.0,  -2.0,  1.0,  0.4,  0.4, 

   -0.75,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
   -1.25, -1.0,   0.0,  0.4,  0.4,  1.0,
   -0.25, -1.0,   0.0,  1.0,  0.4,  0.4, 
  ]);
  const n = 18; // Three vertices per triangle * 6

  // Create a buffer object
  const vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  const FSIZE = verticesColors.BYTES_PER_ELEMENT;

  // Assign the buffer object to aPosition and enable the assignment
  gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(loc_aPosition);

  // Assign the buffer object to aColor and enable the assignment
  gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(loc_aColor);

  return {vao,n};
}
