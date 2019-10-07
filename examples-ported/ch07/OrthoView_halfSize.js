// OrthoView_halfSize.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const loc_aColor = 7;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
uniform mat4 uProjMatrix;
out vec4 vColor;
void main() {
  gl_Position = uProjMatrix * aPosition;
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
  // Retrieve the nearFar element
  const nf = document.getElementById('nearFar');

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
  const {vao,n} =  initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // get the storage location of uProjMatrix
  const loc_uProjMatrix = gl.getUniformLocation(gl.program, 'uProjMatrix');
  if (!loc_uProjMatrix) { 
    console.log('Failed to get the storage location of uProjMatrix');
    return;
  }

  // Create the matrix to set the eye point, and the line of sight
  let projMatrix = new Matrix4();
  // Register the event handler to be called on key press
  document.onkeydown = function(ev){ keydown(ev, gl, vao, n, loc_uProjMatrix, projMatrix, nf); };

  draw(gl, vao, n, loc_uProjMatrix, projMatrix, nf);   // Draw
}

function initVertexBuffers(gl) {
  const verticesColors = new Float32Array([
    // Vertex coordinates and color
     0.0,  0.6,  -0.4,  0.4,  1.0,  0.4, // The back green one
    -0.5, -0.4,  -0.4,  0.4,  1.0,  0.4,
     0.5, -0.4,  -0.4,  1.0,  0.4,  0.4, 
   
     0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
     0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

     0.0,  0.5,   0.0,  0.4,  0.4,  1.0, // The front blue one 
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
     0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
  ]);
  const n = 9;

  // Create a buffer object
  let vertexColorbuffer = gl.createBuffer();  
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

    gl.bindVertexArray(vao);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return {vao,n};
}

// The distances to the near and far clipping plane (hundredfold of the real value)
let g_near = 0.0, g_far = 0.5;
function keydown(ev, gl, vao, n, loc_uProjMatrix, projMatrix, nf) {
  switch(ev.keyCode){
    case 39: g_near += 0.01; break;  // The right arrow key was pressed
    case 37: g_near -= 0.01; break;  // The left arrow key was pressed
    case 38: g_far += 0.01;  break;  // The up arrow key was pressed
    case 40: g_far -= 0.01;  break;  // The down arrow key was pressed
    default: return; // Prevent the unnecessary drawing
  }
 
  draw(gl, vao, n, loc_uProjMatrix, projMatrix, nf);    
}

function draw(gl, vao, n, loc_uProjMatrix, projMatrix, nf) {
  // Specify the viewing volume
  projMatrix.setOrtho(-0.5, 0.5, -0.5, 0.5, g_near, g_far);

  // Pass the projection matrix to uProjMatrix
  gl.uniformMatrix4fv(loc_uProjMatrix, false, projMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);       // Clear <canvas>

  // Display the current near and far values
  nf.innerHTML = 'near: ' + Math.round(g_near * 100)/100 + ', far: ' + Math.round(g_far*100)/100;
    gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, n);   // Draw the triangles
    gl.bindVertexArray(null);
}
