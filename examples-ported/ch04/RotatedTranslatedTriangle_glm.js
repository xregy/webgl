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
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  let gl = canvas.getContext('webgl2');
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
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

//  var glm = require('../lib/glm-js.min.js');
  // Create Matrix4 object for model transformation
  var modelMatrix = new glm.mat4();

  // Calculate a model matrix
  var ANGLE = 60.0; // The rotation angle
  var Tx = 0.5;     // Translation distance
  modelMatrix.rotate(ANGLE, 0, 0, 1); // Set rotation matrix
  modelMatrix.translate(Tx, 0, 0);        // Multiply modelMatrix by the calculated translation matrix

  // Pass the model matrix to the vertex shader
  var loc_uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix');
  if (!loc_uModelMatrix) {
    console.log('Failed to get the storage location of u_xformMatrix');
    return;
  }
  modelMatrix.setUniform(gl, loc_uModelMatrix, false);

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    0, 0.3,   -0.3, -0.3,   0.3, -0.3
  ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to aPosition variable
  gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to aPosition variable
  gl.enableVertexAttribArray(loc_aPosition);

  return n;
}

