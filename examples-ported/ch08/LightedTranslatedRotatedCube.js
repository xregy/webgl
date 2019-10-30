// LightedTranslatedRotatedCube.js (c) 2012 matsuda
// Vertex shader program
const loc_aPosition = 3;
const loc_aColor = 7;
const loc_aNormal = 5;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
layout(location=${loc_aNormal}) in vec4 aNormal;
uniform mat4 uMvpMatrix;
uniform mat4 uNormalMatrix;   // Transformation matrix of the normal
uniform vec3 uLightColor;     // Light color
uniform vec3 uLightDirection; // Light direction (in the world coordinate, normalized)
uniform vec3 uAmbientLight;   // Ambient light color
out vec4 vColor;
void main() {
    gl_Position = uMvpMatrix * aPosition;
    // Recalculate the normal based on the model matrix and make its length 1.
    vec3 normal = normalize(vec3(uNormalMatrix * aNormal));
    // Calculate the dot product of the light direction and the orientation of a surface (the normal)
    float nDotL = max(dot(uLightDirection, normal), 0.0);
    // Calculate the color due to diffuse reflection
    vec3 diffuse = uLightColor * aColor.rgb * nDotL;
    // Calculate the color due to ambient reflection
    vec3 ambient = uAmbientLight * aColor.rgb;
    // Add the surface colors due to diffuse reflection and ambient reflection
    vColor = vec4(diffuse + ambient, aColor.a);
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

  // 
  const {vao, n} = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  const loc_uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix');
  const loc_uNormalMatrix = gl.getUniformLocation(gl.program, 'uNormalMatrix');
  const loc_uLightColor = gl.getUniformLocation(gl.program, 'uLightColor');
  const loc_uLightDirection = gl.getUniformLocation(gl.program, 'uLightDirection');
  const loc_uAmbientLight = gl.getUniformLocation(gl.program, 'uAmbientLight');
  if (!loc_uMvpMatrix || !loc_uNormalMatrix || !loc_uLightColor || !loc_uLightDirection || !loc_uAmbientLight) { 
    console.log('Failed to get the storage location');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(loc_uLightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  let lightDirection = new Vector3([0.0, 3.0, 4.0]);
  lightDirection.normalize();     // Normalize
  gl.uniform3fv(loc_uLightDirection, lightDirection.elements);
  // Set the ambient light
  gl.uniform3f(loc_uAmbientLight, 0.2, 0.2, 0.2);

  let modelMatrix = new Matrix4();  // Model matrix
  let mvpMatrix = new Matrix4();    // Model view projection matrix
  let normalMatrix = new Matrix4(); // Transformation matrix for normals

  // Calculate the model matrix
  modelMatrix.setTranslate(0, 0.9, 0); // Translate to the y-axis direction
  modelMatrix.rotate(90, 0, 0, 1);     // Rotate 90 degree around the z-axis
  // Calculate the view projection matrix
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  // Pass the model view projection matrix to uMvpMatrix
  gl.uniformMatrix4fv(loc_uMvpMatrix, false, mvpMatrix.elements);

  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to uNormalMatrix
  gl.uniformMatrix4fv(loc_uNormalMatrix, false, normalMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindVertexArray(vao);
  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    gl.bindVertexArray(null);
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
  // Coordinates
  const vertices = new Float32Array([
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
  ]);

  // Colors
  const colors = new Float32Array([
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
 ]);

  // Normal
  const normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
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

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, loc_aPosition, vertices, 3)) return -1;
  if (!initArrayBuffer(gl, loc_aColor, colors, 3)) return -1;
  if (!initArrayBuffer(gl, loc_aNormal, normals, 3)) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);

  return {vao, n:indices.length};
}

function initArrayBuffer(gl, loc_attrib, data, num) {
  // Create a buffer object
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  gl.vertexAttribPointer(loc_attrib, num, gl.FLOAT, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(loc_attrib);

  return true;
}
