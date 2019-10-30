// MultiJointModel.js (c) 2012 matsuda and itami
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const loc_aNormal = 5;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aNormal}) in vec4 aNormal;
uniform mat4 uMvpMatrix;
uniform mat4 uNormalMatrix;
out vec4 vColor;
void main() {
    gl_Position = uMvpMatrix * aPosition;
    // Shading calculation to make the arm look three-dimensional
    vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7)); // Light direction
    vec4 color = vec4(1.0, 0.4, 0.0, 1.0);  // Robot color
    vec3 normal = normalize((uNormalMatrix * aNormal).xyz);
    float nDotL = max(dot(normal, lightDirection), 0.0);
    vColor = vec4(color.rgb * nDotL + vec3(0.1), color.a);
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
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  const loc_uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix');
  const loc_uNormalMatrix = gl.getUniformLocation(gl.program, 'uNormalMatrix');
  if (!loc_uMvpMatrix || !loc_uNormalMatrix) {
    console.log('Failed to get the storage location');
    return;
  }

  // Calculate the view projection matrix
  let viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Register the event handler to be called on key press
  document.onkeydown = function(ev){ keydown(ev, gl, vao, n, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix); };

　draw(gl, vao, n, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix); // Draw the robot arm
}

const ANGLE_STEP = 3.0;     // The increments of rotation angle (degrees)
let g_arm1Angle = 90.0;   // The rotation angle of arm1 (degrees)
let g_joint1Angle = 45.0; // The rotation angle of joint1 (degrees)
let g_joint2Angle = 0.0;  // The rotation angle of joint2 (degrees)
let g_joint3Angle = 0.0;  // The rotation angle of joint3 (degrees)

function keydown(ev, gl, vao, n, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix) {
  switch (ev.keyCode) {
    case 40: // Up arrow key -> the positive rotation of joint1 around the z-axis
      if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
      break;
    case 38: // Down arrow key -> the negative rotation of joint1 around the z-axis
      if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
      break;
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
      break;
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
      break;
    case 90: // 'ｚ'key -> the positive rotation of joint2
      g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
      break; 
    case 88: // 'x'key -> the negative rotation of joint2
      g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
      break;
    case 86: // 'v'key -> the positive rotation of joint3
      if (g_joint3Angle < 60.0)  g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
      break;
    case 67: // 'c'key -> the nagative rotation of joint3
      if (g_joint3Angle > -60.0) g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
      break;
    default: return; // Skip drawing at no effective action
  }
  // Draw the robot arm
  draw(gl, vao, n, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix);
}

function initVertexBuffers(gl) {
  // Coordinates（Cube which length of one side is 1 with the origin on the center of the bottom)
  const vertices = new Float32Array([
    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
    0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
    0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
   -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
   -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
    0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
  ]);

  // Normal
  const normals = new Float32Array([
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
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

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
  // Write the vertex property to buffers (coordinates and normals)
  if (!initArrayBuffer(gl, loc_aPosition, vertices, gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, loc_aNormal, normals, gl.FLOAT, 3)) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
  return {vao, n:indices.length};
}

function initArrayBuffer(gl, loc_attrib, data, type, num) {
  // Create a buffer object
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  gl.vertexAttribPointer(loc_attrib, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(loc_attrib);

  return true;
}

// Coordinate transformation matrix
let g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

function draw(gl, vao, n, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix) {
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw a base
  const baseHeight = 2.0;
  g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
  drawBox(gl, vao, n, 10.0, baseHeight, 10.0, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix);
 
  // Arm1
  const arm1Length = 10.0;
  g_modelMatrix.translate(0.0, baseHeight, 0.0);     // Move onto the base
  g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);  // Rotate around the y-axis
  drawBox(gl, vao, n, 3.0, arm1Length, 3.0, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix); // Draw

  // Arm2
  const arm2Length = 10.0;
  g_modelMatrix.translate(0.0, arm1Length, 0.0);       // Move to joint1
  g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);  // Rotate around the z-axis
  drawBox(gl, vao, n, 4.0, arm2Length, 4.0, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix); // Draw

  // A palm
  const palmLength = 2.0;
  g_modelMatrix.translate(0.0, arm2Length, 0.0);       // Move to palm
  g_modelMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0);  // Rotate around the y-axis
  drawBox(gl, vao, n, 2.0, palmLength, 6.0, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix);  // Draw

  // Move to the center of the tip of the palm
  g_modelMatrix.translate(0.0, palmLength, 0.0);

  // Draw finger1
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.0, 0.0, 2.0);
    g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0);  // Rotate around the x-axis
    drawBox(gl, vao, n, 1.0, 2.0, 1.0, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix);
  g_modelMatrix = popMatrix();

  // Draw finger2
  g_modelMatrix.translate(0.0, 0.0, -2.0);
  g_modelMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  drawBox(gl, vao, n, 1.0, 2.0, 1.0, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix);
}

let g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  let m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

let g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals

// Draw rectangular solid
function drawBox(gl, vao, n, width, height, depth, viewProjMatrix, loc_uMvpMatrix, loc_uNormalMatrix) {
  pushMatrix(g_modelMatrix);   // Save the model matrix
    // Scale a cube and draw
    g_modelMatrix.scale(width, height, depth);
    // Calculate the model view project matrix and pass it to uMvpMatrix
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(loc_uMvpMatrix, false, g_mvpMatrix.elements);
    // Calculate the normal transformation matrix and pass it to uNormalMatrix
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(loc_uNormalMatrix, false, g_normalMatrix.elements);
    gl.bindVertexArray(vao);
    // Draw
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    gl.bindVertexArray(null);
  g_modelMatrix = popMatrix();   // Retrieve the model matrix
}
