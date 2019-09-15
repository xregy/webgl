"use strict";
const loc_aPosition = 3;
const loc_aColor = 7;
const src_vert =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
void main() 
{
    gl_Position = aPosition;
    gl_PointSize = 100.0;
}`;

const src_frag =
`#version 300 es
precision mediump float;
out vec4 fColor;
void main() {
    if(length(gl_PointCoord - vec2(.5,.5)) <= 0.5)    fColor = vec4(1,1,1,1);
    else discard;
}`;

// gl_PointCoord.js 
// Vertex shader program
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
  if (!initShaders(gl, src_vert, src_frag)) {
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
  gl.clearColor(1, 0, 0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(vao);
  gl.drawArrays(gl.POINTS, 0, n);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
  const vertices = new Float32Array([
    -0.5,  0.5,
    -0.5, -0.5,
     0.5,  0.5,
     0.5, -0.5,
  ]);
  const n = 4; // The number of vertices

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

  gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(loc_aPosition);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindVertexArray(null);

  return {vao, n};
}
