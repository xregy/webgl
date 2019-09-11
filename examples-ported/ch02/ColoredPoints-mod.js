// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
uniform float uPointSize;
void main() {
    gl_Position = aPosition;
    gl_PointSize = uPointSize;
}`;

// Fragment shader program
const FSHADER_SOURCE =
`#version 300 es
precision mediump float;
uniform vec4 uFragColor;
out vec4 fColor;
void main() {
    fColor = uFragColor;
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

  // Get the storage location of u_FragColor
  const loc_uFragColor = gl.getUniformLocation(gl.program, 'uFragColor');
  if (!loc_uFragColor) {
    console.log('Failed to get the storage location of uFragColor');
    return;
  }
  const loc_uPointSize = gl.getUniformLocation(gl.program, 'uPointSize');
  if (!loc_uPointSize) {
    console.log('Failed to get the storage location of uPointSize');
    return;
  }


  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev, gl, canvas, loc_aPosition, loc_uFragColor, loc_uPointSize) };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

let g_points = [];  // The array for the position of a mouse press
let g_colors = [];  // The array to store the color of a point
function click(ev, gl, canvas, loc_aPosition, loc_uFragColor, loc_uPointSize) {
  let x = ev.clientX; // x coordinate of a mouse pointer
  let y = ev.clientY; // y coordinate of a mouse pointer
  let rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);


  // Store the coordinates to g_points array
  g_points.push([x, y]);
  // Store the coordinates to g_points array
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  let len = g_points.length;
  for(let i = 0; i < len; i++) {
    let xy = g_points[i];
    let rgba = g_colors[i];
    let distance = Math.sqrt(xy[0]**2 + xy[1]**2);

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(loc_aPosition, xy[0], xy[1], 0.0);
    // Pass the color of a point to uFragColor variable
    gl.uniform4f(loc_uFragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(loc_uPointSize, distance*20);
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
