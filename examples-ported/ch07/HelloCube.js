// HelloCube.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const loc_aColor = 7;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
uniform mat4 uMvpMatrix;
out vec4 vColor;
void main() {
  gl_Position = uMvpMatrix * aPosition;
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

  // Set the vertex coordinates and color
  const {vao,n} = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set clear color and enable hidden surface removal
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage location of uMvpMatrix
  const loc_uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix');
  if (!loc_uMvpMatrix) { 
    console.log('Failed to get the storage location of uMvpMatrix');
    return;
  }

  // Set the eye point and the viewing volume
  let mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);

  // Pass the model view projection matrix to uMvpMatrix
  gl.uniformMatrix4fv(loc_uMvpMatrix, false, mvpMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindVertexArray(vao);
  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  const verticesColors = new Float32Array([
    // Vertex coordinates and color
     1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
    -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
    -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
     1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
     1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
     1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
    -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
    -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
  ]);

  // Indices of the vertices
  const indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    0, 3, 4,   0, 4, 5,    // right
    0, 5, 6,   0, 6, 1,    // up
    1, 6, 7,   1, 7, 2,    // left
    7, 4, 3,   7, 3, 2,    // down
    4, 7, 6,   4, 6, 5     // back
 ]);

  // Create a buffer object
  const vertexColorBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  if (!vertexColorBuffer || !indexBuffer) {
    return {vao:null, n:-1};
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

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return {vao, n:indices.length};

}
