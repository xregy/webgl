// HelloPint2.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const VSHADER_SOURCE = 
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
void main() {
    gl_Position = aPosition;
    gl_PointSize = 10.0;
}
`;

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

  // Pass vertex position to attribute variable
  gl.vertexAttrib3f(loc_aPosition, 0.0, 0.0, 0.0);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
    
  // Draw
  gl.drawArrays(gl.POINTS, 0, 1);
}
