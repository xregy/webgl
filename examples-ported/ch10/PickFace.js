// PickFace.js (c) 2012 matsuda and kanda
// Vertex shader program
const loc_aPosition = 5;
const loc_aColor = 2;
const loc_aFace = 1;
const VSHADER_SOURCE = `#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
layout(location=${loc_aFace}) in float aFace;   // Surface number (Cannot use int for attribute variable)
uniform mat4 uMvpMatrix;
uniform int uPickedFace; // Surface number of selected face
out vec4 vColor;
void main() {
  gl_Position = uMvpMatrix * aPosition;
  int face = int(aFace); // Convert to int
  vec3 color = (face == uPickedFace) ? vec3(1.0) : aColor.rgb;
  if(uPickedFace == 0) { // In case of 0, insert the face number into alpha
    vColor = vec4(color, aFace/255.0);
  } else {
    vColor = vec4(color, aColor.a);
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
  const {vao, n} = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  const loc_uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix');
  const loc_uPickedFace = gl.getUniformLocation(gl.program, 'uPickedFace');
  if (!loc_uMvpMatrix || !loc_uPickedFace) { 
    console.log('Failed to get the storage location of uniform variable');
    return;
  }

  // Calculate the view projection matrix
  let viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Initialize selected surface
  gl.uniform1i(loc_uPickedFace, -1);

  let currentAngle = 0.0; // Current rotation angle
  // Register the event handler
  canvas.onmousedown = function(ev) {   // Mouse is pressed
    let x = ev.clientX, y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      // If Clicked position is inside the <canvas>, update the selected surface
      let x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
      let face = checkFace(gl, vao, n, x_in_canvas, y_in_canvas, currentAngle, loc_uPickedFace, viewProjMatrix, loc_uMvpMatrix);
      gl.uniform1i(loc_uPickedFace, face); // Pass the surface number to uPickedFace
      draw(gl, vao, n, currentAngle, viewProjMatrix, loc_uMvpMatrix);
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
    0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v0-v1-v2-v3 front
    0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
    0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v0-v5-v6-v1 up
    0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v1-v6-v7-v2 left
    0.27, 0.58, 0.82,  0.27, 0.58, 0.82,  0.27, 0.58, 0.82,  0.27, 0.58, 0.82, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
   ]);

  const faces = new Uint8Array([   // Faces
    1, 1, 1, 1,     // v0-v1-v2-v3 front
    2, 2, 2, 2,     // v0-v3-v4-v5 right
    3, 3, 3, 3,     // v0-v5-v6-v1 up
    4, 4, 4, 4,     // v1-v6-v7-v2 left
    5, 5, 5, 5,     // v7-v4-v3-v2 down
    6, 6, 6, 6,     // v4-v7-v6-v5 back
  ]);

  const indices = new Uint8Array([   // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

  // Create a buffer object
  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    return -1;
  }

  // Write vertex information to buffer object
  if (!initArrayBuffer(gl, vertices, gl.FLOAT, 3, loc_aPosition)) return -1; // Coordinates Information
  if (!initArrayBuffer(gl, colors, gl.FLOAT, 3, loc_aColor)) return -1;      // Color Information
  if (!initArrayBuffer(gl, faces, gl.UNSIGNED_BYTE, 1, loc_aFace)) return -1;// Surface Information


  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return {vao, n:indices.length};
}

function checkFace(gl, vao, n, x, y, currentAngle, loc_uPickedFace, viewProjMatrix, loc_uMvpMatrix) {
  const pixels = new Uint8Array(4); // Array for storing the pixel value
  gl.uniform1i(loc_uPickedFace, 0);  // Draw by writing surface number into alpha value
  draw(gl, vao, n, currentAngle, viewProjMatrix, loc_uMvpMatrix);
  // Read the pixel value of the clicked position. pixels[3] is the surface number
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  return pixels[3];
}

let g_MvpMatrix = new Matrix4(); // Model view projection matrix
function draw(gl, vao, n, currentAngle, viewProjMatrix, loc_uMvpMatrix) {
  // Caliculate The model view projection matrix and pass it to uMvpMatrix
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // Rotate appropriately
  g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
  g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
  gl.uniformMatrix4fv(loc_uMvpMatrix, false, g_MvpMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers
  gl.bindVertexArray(vao);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw
  gl.bindVertexArray(null);
}

let last = Date.now();  // Last time that this function was called
function animate(angle) {
  let now = Date.now(); // Calculate the elapsed time
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
  // Enable the assignment to a_attribute variable
  gl.enableVertexAttribArray(loc_attrib);

  return true;
}
