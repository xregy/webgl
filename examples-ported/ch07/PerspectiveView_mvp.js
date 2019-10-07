// PerspectiveView_mvp.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const loc_aColor = 7;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
out vec4 vColor;
void main() {
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
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

  // Get the storage locations of uModelMatrix, uViewMatrix, and uProjMatrix
  const loc_uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix');
  const loc_uViewMatrix = gl.getUniformLocation(gl.program, 'uViewMatrix');
  const loc_uProjMatrix = gl.getUniformLocation(gl.program, 'uProjMatrix');
  if (!loc_uModelMatrix || !loc_uViewMatrix || !loc_uProjMatrix) { 
    console.log('Failed to Get the storage locations of uModelMatrix, uViewMatrix, and/or uProjMatrix');
    return;
  }

  let modelMatrix = new Matrix4(); // The model matrix
  let viewMatrix = new Matrix4();  // The view matrix
  let projMatrix = new Matrix4();  // The projection matrix

  // Calculate the view matrix and the projection matrix
  modelMatrix.setTranslate(0.75, 0, 0);  // Translate 0.75 units along the positive x-axis
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  // Pass the model, view, and projection matrix to the uniform variable respectively
  gl.uniformMatrix4fv(loc_uModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(loc_uViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(loc_uProjMatrix, false, projMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, n);   // Draw the triangles

  // Prepare the model matrix for another pair of triangles
  modelMatrix.setTranslate(-0.75, 0, 0); // Translate 0.75 units along the negative x-axis
  // Modify only the model matrix
  gl.uniformMatrix4fv(loc_uModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 0, n);   // Draw the triangles
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
  const verticesColors = new Float32Array([
    // Vertex coordinates and color
     0.0,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
    -0.5, -1.0,  -4.0,  0.4,  1.0,  0.4,
     0.5, -1.0,  -4.0,  1.0,  0.4,  0.4, 

     0.0,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
    -0.5, -1.0,  -2.0,  1.0,  1.0,  0.4,
     0.5, -1.0,  -2.0,  1.0,  0.4,  0.4, 

     0.0,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
    -0.5, -1.0,   0.0,  0.4,  0.4,  1.0,
     0.5, -1.0,   0.0,  1.0,  0.4,  0.4, 
  ]);
  const n = 9;

  // Create a buffer object
  const vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

  // Write the vertex information and enable it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  const FSIZE = verticesColors.BYTES_PER_ELEMENT;

  // Assign the buffer object to aPosition and enable the assignment
  gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(loc_aPosition);

  // Assign the buffer object to aColor and enable the assignment
  gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(loc_aColor);

  return {vao, n};
}
