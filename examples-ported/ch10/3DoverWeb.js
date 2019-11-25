// 3DoverWeb.js (c) 2012 matsuda
// Vertex shader program
const loc_aPosition = 3;
const loc_aColor = 8;
const VSHADER_SOURCE = `#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
uniform mat4 uMvpMatrix;
uniform bool uClicked; // Mouse is pressed
out vec4 vColor;
void main() {
  gl_Position = uMvpMatrix * aPosition;
  if (uClicked) { //  Draw in red if mouse is pressed
    vColor = vec4(1.0, 0.0, 0.0, 1.0);
  } else {
    vColor = vec4(aColor.rgb, 1.0);
  }
}`;

// Fragment shader program
const FSHADER_SOURCE = `#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 fColor;
void main() {
  fColor = vColor;
}`;

const ANGLE_STEP = 20.0; // Rotation angle (degrees/second)

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

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  const loc_uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix');
  const loc_uClicked = gl.getUniformLocation(gl.program, 'uClicked');
  if (!loc_uMvpMatrix || !loc_uClicked) { 
    console.log('Failed to get the storage location');
    return;
  }

  // Calculate the view projection matrix
  let viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  gl.uniform1i(loc_uClicked, 0); // Pass false to uClicked

  let currentAngle = 0.0; // Current rotation angle
  // Register the event handler
  canvas.onmousedown = function(ev) {   // Mouse is pressed
    let x = ev.clientX, y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      // If pressed position is inside <canvas>, check if it is above object
      let x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
      check(gl, vao, n, x_in_canvas, y_in_canvas, currentAngle, loc_uClicked, viewProjMatrix, loc_uMvpMatrix);
    }
  }

  let tick = function() {   // Start drawing
    currentAngle = animate(currentAngle);
    draw(gl, vao, n, currentAngle, viewProjMatrix, loc_uMvpMatrix);
    requestAnimationFrame(tick, canvas);
  };
  tick();
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
  const vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  const colors = new Float32Array([   // Colors
    0.2, 0.58, 0.82,   0.2, 0.58, 0.82,   0.2,  0.58, 0.82,  0.2,  0.58, 0.82, // v0-v1-v2-v3 front
    0.5,  0.41, 0.69,  0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
    0.0,  0.32, 0.61,  0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v0-v5-v6-v1 up
    0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v1-v6-v7-v2 left
    0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
   ]);

  // Indices of the vertices
  const indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Write the vertex property to buffers (coordinates and normals)
  if (!initArrayBuffer(gl, vertices, gl.FLOAT, 3, loc_aPosition)) return -1; // Coordinates
  if (!initArrayBuffer(gl, colors, gl.FLOAT, 3, loc_aColor)) return -1;      // Color Information

  // Create a buffer object
  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    return -1;
  }
  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);

  return {vao, n:indices.length};
}

function check(gl, vao, n, x, y, currentAngle, loc_uClicked, viewProjMatrix, loc_uMvpMatrix) {
  let picked = false;
  gl.uniform1i(loc_uClicked, 1);  // Pass true to uClicked(Draw cube with red)
  draw(gl, vao, n, currentAngle, viewProjMatrix, loc_uMvpMatrix);
  // Read pixel at the clicked position
  let pixels = new Uint8Array(4); // Array for storing the pixel value
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  if (pixels[0] == 255) // If red = 255, clicked on cube
    picked = true;

  gl.uniform1i(loc_uClicked, 0);  // Pass false to uClicked(Draw cube with specified color)
  draw(gl, vao, n, currentAngle, viewProjMatrix, loc_uMvpMatrix);
  if (picked) alert('The cube was selected! ');
}

let g_MvpMatrix = new Matrix4(); // Model view projection matrix
function draw(gl, vao, n, currentAngle, viewProjMatrix, loc_uMvpMatrix) {
  // Caliculate The model view projection matrix and pass it to uMvpMatrix
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // Rotate appropriately
  g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
  g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
  gl.uniformMatrix4fv(loc_uMvpMatrix, false, g_MvpMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers (color and depth)
  gl.bindVertexArray(vao);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw
  gl.bindVertexArray(null);
}

let last = Date.now(); // Last time that this function was called
function animate(angle) {
  let now = Date.now();   // Calculate the elapsed time
  let elapsed = now - last;
  last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}

function initArrayBuffer (gl, data, type, num, loc_attrib) {
  // Create a buffer object
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  gl.vertexAttribPointer(loc_attrib, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(loc_attrib);
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}
