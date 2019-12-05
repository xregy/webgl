// LookAtBlendedTriangles.js (c) 2012 matsuda and ohnishi
// LookAtTrianglesWithKey_ViewVolume.js is the original
// Vertex shader program
const loc_aPosition = 3;
const loc_aColor = 2;
const VSHADER_SOURCE = `#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
out vec4 vColor;
void main() {
  gl_Position = uProjMatrix * uViewMatrix * aPosition;
  vColor = aColor;
}`;

// Fragment shader program
const FSHADER_SOURCE = `#version 300 es
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
  const {vao,n} = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);
  // Enable alpha blending
  gl.enable (gl.BLEND);
  // Set blending function
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // get the storage locations of uViewMatrix and uProjMatrix
  const loc_uViewMatrix = gl.getUniformLocation(gl.program, 'uViewMatrix');
  const loc_uProjMatrix = gl.getUniformLocation(gl.program, 'uProjMatrix');
  if (!loc_uViewMatrix || !loc_uProjMatrix) { 
    console.log('Failed to get the storage location of uViewMatrix and/or uProjMatrix');
    return;
  }

  // Create the view projection matrix
  let viewMatrix = new Matrix4();
  // Register the event handler to be called on key press
  window.onkeydown = function(ev){ keydown(ev, gl, vao, n, loc_uViewMatrix, viewMatrix); };

  // Create Projection matrix and set to uProjMatrix
  let projMatrix = new Matrix4();
  projMatrix.setOrtho(-1, 1, -1, 1, 0, 2);
  gl.uniformMatrix4fv(loc_uProjMatrix, false, projMatrix.elements);

  // Draw
  draw(gl, vao, n, loc_uViewMatrix, viewMatrix);
}

function initVertexBuffers(gl) {
  const verticesColors = new Float32Array([
    // Vertex coordinates and color(RGBA)
    0.0,  0.5,  -0.4,  0.4,  1.0,  0.4,  0.4, // The back green one
   -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,  0.4,
    0.5, -0.5,  -0.4,  1.0,  0.4,  0.4,  0.4, 
   
    0.5,  0.4,  -0.2,  1.0,  0.4,  0.4,  0.4, // The middle yerrow one
   -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,  0.4,
    0.0, -0.6,  -0.2,  1.0,  1.0,  0.4,  0.4, 

    0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  0.4,  // The front blue one 
   -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,  0.4,
    0.5, -0.5,   0.0,  1.0,  0.4,  0.4,  0.4, 
  ]);
  const n = 9;

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
  // Create a buffer object
  const vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write the vertex information and enable it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  const FSIZE = verticesColors.BYTES_PER_ELEMENT;

  gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, FSIZE * 7, 0);
  gl.enableVertexAttribArray(loc_aPosition);

  gl.vertexAttribPointer(loc_aColor, 4, gl.FLOAT, false, FSIZE * 7, FSIZE * 3);
  gl.enableVertexAttribArray(loc_aColor);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(vao);

  return {vao,n};
}

function keydown(ev, gl, vao, n, loc_uViewMatrix, viewMatrix) {
    if(ev.keyCode == 39) { // The right arrow key was pressed
      g_EyeX += 0.01;
    } else 
    if (ev.keyCode == 37) { // The left arrow key was pressed
      g_EyeX -= 0.01;
    } else return;
    draw(gl, vao, n, loc_uViewMatrix, viewMatrix);    
}

// Eye position
let g_EyeX = 0.20, g_EyeY = 0.25, g_EyeZ = 0.25;
function draw(gl, vao, n, loc_uViewMatrix, viewMatrix) {
  // Set the matrix to be used for to set the camera view
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, 0, 0, 0, 0, 1, 0);

  // Pass the view projection matrix
  gl.uniformMatrix4fv(loc_uViewMatrix, false, viewMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw the rectangle
    gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.bindVertexArray(null);
}
