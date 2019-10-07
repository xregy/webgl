// LookAtRotatedTriangles_modelViewMatrix.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const loc_aColor = 7;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
uniform mat4 uModelViewMatrix;
out vec4 vColor;
void main() {
  gl_Position = uModelViewMatrix * aPosition;
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
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Get the storage location of uModelViewMatrix 
  const loc_uModelViewMatrix = gl.getUniformLocation(gl.program, 'uModelViewMatrix');
  if(!loc_uModelViewMatrix) { 
    console.log('Failed to get the storage location of uModelViewMatrix');
    return;
  }

  // Set the matrix to be used for to set the camera view
  let viewMatrix = new Matrix4();
  viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);

  // Calculate matrix for rotate
  let modelMatrix = new Matrix4();
  modelMatrix.setRotate(-10, 0, 0, 1);

  // Multiply model matrix to view matrix
  let modelViewMatrix = viewMatrix.multiply(modelMatrix);

  // Pass the model view projection matrix
  gl.uniformMatrix4fv(loc_uModelViewMatrix, false, modelViewMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(vao);
  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
  const verticesColors = new Float32Array([
    // Vertex coordinates and color
     0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // The back green one
    -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
     0.5, -0.5,  -0.4,  1.0,  0.4,  0.4, 
   
     0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
     0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

     0.0,  0.5,   0.0,  0.4,  0.4,  1.4,  // The front blue one 
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
     0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
  ]);
  const n = 9;

  // Create a buffer object
  let vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  const FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to aPosition and enable the assignment
  gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(loc_aPosition);
  // Assign the buffer object to aColor and enable the assignment
  gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(loc_aColor);

  gl.bindVertexArray(null);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return {vao,n};
}
