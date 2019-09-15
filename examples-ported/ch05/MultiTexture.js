// MultiTexture.js (c) 2012 matsuda and kanda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const loc_aTexCoord = 7;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aTexCoord}) in vec2 aTexCoord;
out vec2 vTexCoord;
void main() {
  gl_Position = aPosition;
  vTexCoord = aTexCoord;
}`;

// Fragment shader program
const FSHADER_SOURCE =
`#version 300 es
precision mediump float;
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
in vec2 vTexCoord;
out vec4 fColor;
void main() {
  vec4 color0 = texture(uSampler0, vTexCoord);
  vec4 color1 = texture(uSampler1, vTexCoord);
  fColor = color0 * color1;
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
  let {vao, n} = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Set texture
  if (!initTextures(gl, vao, n)) {
    console.log('Failed to intialize the texture.');
    return;
  }
}

function initVertexBuffers(gl) {
  const verticesTexCoords = new Float32Array([
    // Vertex coordinate, Texture coordinate
    -0.5,  0.5,   0.0, 1.0,
    -0.5, -0.5,   0.0, 0.0,
     0.5,  0.5,   1.0, 1.0,
     0.5, -0.5,   1.0, 0.0,
  ]);
  const n = 4; // The number of vertices

  let vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  // Create a buffer object
  let vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write the positions of vertices to a vertex shader
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

  gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(loc_aPosition);  // Enable the assignment of the buffer object

  gl.vertexAttribPointer(loc_aTexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(loc_aTexCoord);  // Enable the buffer assignment

  gl.bindVertexArray(null);

  return {vao,n};
}

function initTextures(gl, vao, n) {
  // Create a texture object
  let texture0 = gl.createTexture(); 
  let texture1 = gl.createTexture();
  if (!texture0 || !texture1) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of uSampler0 and uSampler1
  let loc_uSampler0 = gl.getUniformLocation(gl.program, 'uSampler0');
  let loc_uSampler1 = gl.getUniformLocation(gl.program, 'uSampler1');
  if (!loc_uSampler0 || !loc_uSampler1) {
    console.log('Failed to get the storage location of uSampler');
    return false;
  }

  // Create the image object
  let image0 = new Image();
  let image1 = new Image();
  if (!image0 || !image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called when image loading is completed
  image0.onload = function(){ loadTexture(gl, vao, n, texture0, loc_uSampler0, image0, 0); };
  image1.onload = function(){ loadTexture(gl, vao, n, texture1, loc_uSampler1, image1, 1); };
  // Tell the browser to load an Image
  image0.src = '../resources/sky.jpg';
  image1.src = '../resources/circle.gif';

  return true;
}
// Specify whether the texture unit is ready to use
let g_texUnit0 = false, g_texUnit1 = false; 
function loadTexture(gl, vao, n, texture, loc_uSampler, image, texUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
  // Make the texture unit active
  if (texUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
    g_texUnit0 = true;
  } else {
    gl.activeTexture(gl.TEXTURE1);
    g_texUnit1 = true;
  }
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);   

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(loc_uSampler, texUnit);   // Pass the texure unit to uSampler
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (g_texUnit0 && g_texUnit1) {
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);   // Draw the rectangle
    gl.bindVertexArray(null);
  }
}
