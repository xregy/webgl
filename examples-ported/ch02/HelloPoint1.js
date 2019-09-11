// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const VSHADER_SOURCE = 
`#version 300 es
void main() {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0); // Set the vertex coordinates of the point
    gl_PointSize = 10.0;                    // Set the point size
}
`;

// Fragment shader program
const FSHADER_SOURCE =
`#version 300 es
precision mediump float;
out vec4 fColor;
void main() {
    fColor = vec4(1.0, 0.0, 0.0, 1.0);  // Set the fragment color
}
`;

function main() {
  // Retrieve <canvas> element
  const canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw a point
  gl.drawArrays(gl.POINTS, 0, 1);
}
