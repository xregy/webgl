// Zfighting.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const loc_aColor = 7;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
uniform mat4 uViewProjMatrix;
out vec4 vColor;
void main() {
  gl_Position = uViewProjMatrix * aPosition;
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

  //Set clear color and enable the hidden surface removal function
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uViewProjMatrix
  const loc_uViewProjMatrix = gl.getUniformLocation(gl.program, 'uViewProjMatrix');
  if (!loc_uViewProjMatrix) { 
    console.log('Failed to get the storage locations of uViewProjMatrix');
    return;
  }

  let viewProjMatrix = new Matrix4();
  // Set the eye point, look-at point, and up vector.
  viewProjMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  viewProjMatrix.lookAt(3.06, 2.5, 10.0, 0, 0, -2, 0, 1, 0);

  // Pass the view projection matrix to uViewProjMatrix
  gl.uniformMatrix4fv(loc_uViewProjMatrix, false, viewProjMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Enable the polygon offset function
  gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.bindVertexArray(vao);
  // Draw the triangles
  gl.drawArrays(gl.TRIANGLES, 0, n/2);   // The green triangle
    gl.polygonOffset(1.0, 1.0);          // Set the polygon offset
  gl.drawArrays(gl.TRIANGLES, n/2, n/2); // The yellow triangle
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
  const verticesColors = new Float32Array([
    // Vertex coordinates and color
     0.0,  2.5,  -5.0,  0.4,  1.0,  0.4, // The green triangle
    -2.5, -2.5,  -5.0,  0.4,  1.0,  0.4,
     2.5, -2.5,  -5.0,  1.0,  0.4,  0.4, 

     0.0,  3.0,  -5.0,  1.0,  0.4,  0.4, // The yellow triagle
    -3.0, -3.0,  -5.0,  1.0,  1.0,  0.4,
     3.0, -3.0,  -5.0,  1.0,  1.0,  0.4, 
  ]);
  const n = 6;

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

  gl.bindVertexArray(null);

  return {vao,n};
}
