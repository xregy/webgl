// PointLightedCube_perFragment.js (c) 2012 matsuda and kanda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const loc_aNormal = 5;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aNormal}) in vec4 aNormal;
uniform mat4 uMvpMatrix;
uniform mat4 uModelMatrix;    // Model matrix
uniform mat4 uNormalMatrix;   // Transformation matrix of the normal
out vec4 vColor;
out vec3 vNormal;
out vec3 vPosition;
void main() {
  vec4 color = vec4(1.0, 1.0, 1.0, 1.0); // Sphere color
  gl_Position = uMvpMatrix * aPosition;
  // Calculate the vertex position in the world coordinate
  vPosition = vec3(uModelMatrix * aPosition);
  vNormal = normalize(vec3(uNormalMatrix * aNormal));
  vColor = color;
}`;

// Fragment shader program
const FSHADER_SOURCE =
`#version 300 es
precision mediump float;
uniform vec3 uLightColor;     // Light color
uniform vec3 uLightPosition;  // Position of the light source
uniform vec3 uAmbientLight;   // Ambient light color
in vec3 vNormal;
in vec3 vPosition;
in vec4 vColor;
out vec4 fColor;
void main() {
    // Normalize the normal because it is interpolated and not 1.0 in length any more
    vec3 normal = normalize(vNormal);
    // Calculate the light direction and make its length 1.
    vec3 lightDirection = normalize(uLightPosition - vPosition);
    // The dot product of the light direction and the orientation of a surface (the normal)
    float nDotL = max(dot(lightDirection, normal), 0.0);
    // Calculate the final color from diffuse reflection and ambient reflection
    vec3 diffuse = uLightColor * vColor.rgb * nDotL;
    vec3 ambient = uAmbientLight * vColor.rgb;
    fColor = vec4(diffuse + ambient, vColor.a);
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

  // 
  const {vao,n} = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  const loc_uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix');
  const loc_uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix');
  const loc_uNormalMatrix = gl.getUniformLocation(gl.program, 'uNormalMatrix');
  const loc_uLightColor = gl.getUniformLocation(gl.program, 'uLightColor');
  const loc_uLightPosition = gl.getUniformLocation(gl.program, 'uLightPosition');
  const loc_uAmbientLight = gl.getUniformLocation(gl.program, 'uAmbientLight');
  if (!loc_uModelMatrix || !loc_uMvpMatrix || !loc_uNormalMatrix || !loc_uLightColor || !loc_uLightPosition　|| !loc_uAmbientLight) { 
    console.log('Failed to get the storage location');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(loc_uLightColor, 0.8, 0.8, 0.8);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(loc_uLightPosition, 5.0, 8.0, 7.0);
  // Set the ambient light
  gl.uniform3f(loc_uAmbientLight, 0.2, 0.2, 0.2);

  let modelMatrix = new Matrix4();  // Model matrix
  let mvpMatrix = new Matrix4();    // Model view projection matrix
  let normalMatrix = new Matrix4(); // Transformation matrix for normals

  // Calculate the model matrix
  modelMatrix.setRotate(90, 0, 1, 0); // Rotate around the y-axis
  // Calculate the view projection matrix
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  mvpMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();

  // Pass the model matrix to uModelMatrix
  gl.uniformMatrix4fv(loc_uModelMatrix, false, modelMatrix.elements);

  // Pass the model view projection matrix to umvpMatrix
  gl.uniformMatrix4fv(loc_uMvpMatrix, false, mvpMatrix.elements);

  // Pass the transformation matrix for normals to uNormalMatrix
  gl.uniformMatrix4fv(loc_uNormalMatrix, false, normalMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindVertexArray(vao);
  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) { // Create a sphere
  const SPHERE_DIV = 13;

  let i, ai, si, ci;
  let j, aj, sj, cj;
  let p1, p2;

  let positions = [];
  let indices = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj);  // X
      positions.push(cj);       // Y
      positions.push(ci * sj);  // Z
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV+1) + i;
      p2 = p1 + (SPHERE_DIV+1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

  // Write the vertex property to buffers (coordinates and normals)
  // Same data can be used for vertex and normal
  // In order to make it intelligible, another buffer is prepared separately
  if (!initArrayBuffer(gl, loc_aPosition, new Float32Array(positions), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, loc_aNormal, new Float32Array(positions), gl.FLOAT, 3))  return -1;
  
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindVertexArray(null);
  return {vao,n:indices.length};
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
