// RoundedPoints.js (c) 2012 matsuda
// Vertex shader program
const loc_aPosition = 3;
const VSHADER_SOURCE = `#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
void main() {
  gl_Position = aPosition;
  gl_PointSize = 10.0;
}`;

// Fragment shader program
const FSHADER_SOURCE = `#version 300 es
precision mediump float;
out vec4 fColor;
void main() {    // Center coordinate is (0.5, 0.5)
  float d = distance(gl_PointCoord, vec2(0.5, 0.5));
  if(d < 0.5) {  // Radius is 0.5
    fColor = vec4(1.0, 0.0, 0.0, 1.0);
  } else { discard; }
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

  // Set the vertex information
  const {vao,n} = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw three points
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.POINTS, 0, n);
  gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
  const vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  const n = 3; // The number of vertices

  // Create a buffer object
  const vertexBuffer = gl.createBuffer();  
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

    const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  // Bind the vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
 
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(loc_aPosition);

  gl.bindVertexArray(null);

  return {vao,n};
}
