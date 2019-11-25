// Fog.js (c) 2012 matsuda and ohnishi
// Vertex shader program
const loc_aPosition = 3;
const loc_aColor = 8;
const VSHADER_SOURCE = `#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
uniform mat4 uMvpMatrix;
uniform mat4 uModelMatrix;
uniform vec4 uEye;     // Position of eye point (world coordinates)
out vec4 vColor;
out float vDist;
void main() {
  gl_Position = uMvpMatrix * aPosition;
  vColor = aColor;
  // Calculate the distance to each vertex from eye point
  vDist = distance(uModelMatrix * aPosition, uEye);
}`;

// Fragment shader program
const FSHADER_SOURCE = `#version 300 es
#ifdef GL_ES
precision mediump float;
#endif
uniform vec3 uFogColor; // Color of Fog
uniform vec2 uFogDist;  // Distance of Fog (starting point, end point)
in vec4 vColor;
in float vDist;
out vec4 fColor;
void main() {
  // Calculation of fog factor (factor becomes smaller as it goes further away from eye point)
  float fogFactor = clamp((uFogDist.y - vDist) / (uFogDist.y - uFogDist.x), 0.0, 1.0);
  // Stronger fog as it gets further: uFogColor * (1 - fogFactor) + vColor * fogFactor
  vec3 color = mix(uFogColor, vec3(vColor), fogFactor);
  fColor = vec4(color, vColor.a);
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
  if (n < 1) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Color of Fog
  const fogColor = new Float32Array([0.137, 0.231, 0.423]);
  // Distance of fog [where fog starts, where fog completely covers object]
  const fogDist = new Float32Array([55, 80]);
  // Position of eye point (world coordinates)
  const eye = new Float32Array([25, 65, 35, 1.0]);

  // Get the storage locations of uniform variables
  const loc_uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix');
  const loc_uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix');
  const loc_uEye = gl.getUniformLocation(gl.program, 'uEye');
  const loc_uFogColor = gl.getUniformLocation(gl.program, 'uFogColor');
  const loc_uFogDist = gl.getUniformLocation(gl.program, 'uFogDist');
  if (!loc_uMvpMatrix || !loc_uModelMatrix || !loc_uEye || !loc_uFogColor || !loc_uFogDist) {
    console.log('Failed to get the storage location');
    return;
  }
	
  // Pass fog color, distances, and eye point to uniform variable
  gl.uniform3fv(loc_uFogColor, fogColor); // Colors
  gl.uniform2fv(loc_uFogDist, fogDist);   // Starting point and end point
  gl.uniform4fv(loc_uEye, eye);           // Eye point

  // Set clear color and enable hidden surface removal
  gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1.0); // Color of Fog
  gl.enable(gl.DEPTH_TEST);

  // Pass the model matrix to uModelMatrix
  let modelMatrix = new Matrix4();
  modelMatrix.setScale(10, 10, 10);
  gl.uniformMatrix4fv(loc_uModelMatrix, false, modelMatrix.elements);

  // Pass the model view projection matrix to uMvpMatrix
  let mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 1000);
  mvpMatrix.lookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  gl.uniformMatrix4fv(loc_uMvpMatrix, false, mvpMatrix.elements);
  document.onkeydown = function(ev){ keydown(ev, gl, vao, n, loc_uFogDist, fogDist); };

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Draw
  gl.bindVertexArray(vao);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  gl.bindVertexArray(null);

  let modelViewMatrix = new Matrix4();
  modelViewMatrix.setLookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0);
  modelViewMatrix.multiply(modelMatrix);
  modelViewMatrix.multiplyVector4(new Vector4([1, 1, 1, 1]));
  mvpMatrix.multiplyVector4(new Vector4([1, 1, 1, 1]));
  modelViewMatrix.multiplyVector4(new Vector4([-1, 1, 1, 1]));
  mvpMatrix.multiplyVector4(new Vector4([-1, 1, 1, 1]));
}

function keydown(ev, gl, vao, n, loc_uFogDist, fogDist) {
  switch (ev.keyCode) {
    case 38: // Up arrow key -> Increase the maximum distance of fog
      fogDist[1]  += 1;
      break;
    case 40: // Down arrow key -> Decrease the maximum distance of fog
      if (fogDist[1] > fogDist[0]) fogDist[1] -= 1;
      break;
    default: return;
  }
  gl.uniform2fv(loc_uFogDist, fogDist);   // Pass the distance of fog
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Draw
  gl.bindVertexArray(vao);
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

  const vertices = new Float32Array([   // Vertex coordinates
     1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,    // v0-v1-v2-v3 front
     1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,    // v0-v3-v4-v5 right
     1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,    // v0-v5-v6-v1 up
    -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,    // v1-v6-v7-v2 left
    -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,    // v7-v4-v3-v2 down
     1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1     // v4-v7-v6-v5 back
  ]);

  const colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
  ]);

  const indices = new Uint8Array([       // Indices of the vertices
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
  if (!indexBuffer) 
    return -1;

  // Write the vertex property to buffers (coordinates and normals)
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, loc_aPosition)) return -1;
  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, loc_aColor)) return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

  return {vao, n:indices.length};
}

function initArrayBuffer (gl, data, num, type, loc_attrib) {
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
