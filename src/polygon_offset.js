// ColoredCube.js (c) 2012 matsuda
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const loc_aColor = 7;
const VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
uniform mat4 uMVP;
out vec4 vColor;
void main() {
    gl_Position = uMVP * aPosition;
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
    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext('webgl2');
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    
    const cube = initFaces(gl);
    const edges = initEdges(gl);
    const axes = initAxes(gl);
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.polygonOffset(1.0, 1.0);
    
    const loc_uMVP = gl.getUniformLocation(gl.program, 'uMVP');
    
    let MVP = new Matrix4();

    document.getElementById("distance").oninput = function(ev) {refresh(gl, cube, edges, axes, MVP, loc_uMVP);};
    document.getElementById("azimuth").oninput = function(ev) {refresh(gl, cube, edges, axes, MVP, loc_uMVP);};
    document.getElementById("altitude").oninput = function(ev) {refresh(gl, cube, edges, axes, MVP, loc_uMVP);};
    document.getElementById("polygonoffset").oninput = function(ev) {refresh(gl, cube, edges, axes, MVP, loc_uMVP);};

    refresh(gl, cube, edges, axes, MVP, loc_uMVP);
    
}


function refresh(gl, cube, edges, axes, MVP, loc_uMVP)
{
    let distance = 0.1*parseFloat(document.getElementById("distance").value);
    let azimuth = parseInt(document.getElementById("azimuth").value);
    let altitude = parseInt(document.getElementById("altitude").value);

    if(document.getElementById("polygonoffset").checked)
    {
        gl.enable(gl.POLYGON_OFFSET_FILL);
    }
    else
    {
        gl.disable(gl.POLYGON_OFFSET_FILL);
    }

    MVP.setPerspective(30, 1, 1, 100);

    MVP.translate(0, 0, -distance);
    MVP.rotate(altitude, 1, 0, 0);
    MVP.rotate(azimuth, 0, 1, 0);

    gl.uniformMatrix4fv(loc_uMVP, false, MVP.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindVertexArray(cube.vao);
    gl.drawElements(gl.TRIANGLES, cube.n, gl.UNSIGNED_BYTE, 0);
    gl.bindVertexArray(null);

    gl.bindVertexArray(edges.vao);
    gl.drawElements(gl.LINES, edges.n, gl.UNSIGNED_BYTE, 0);
    gl.bindVertexArray(null);


    gl.bindVertexArray(axes.vao);
    gl.drawArrays(gl.LINES, 0, axes.n);
    gl.bindVertexArray(null);

}

function initAxes(gl)
{
    const vertices = new Float32Array([
        0, 0, 0, 1, 0, 0,
        2, 0, 0, 1, 0, 0,
        0, 0, 0, 0, 1, 0,
        0, 2, 0, 0, 1, 0,
        0, 0, 0, 0, 0, 1,
        0, 0, 2, 0, 0, 1
    ]);
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    const vbo = gl.createBuffer();   // Create a buffer object

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const SZ = vertices.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, SZ*6, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, SZ*6, SZ*3);
    gl.enableVertexAttribArray(loc_aColor);
 
    gl.bindVertexArray(null);
    
    return {vao, n:6};

}

function initFaces(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  const verticesColors = new Float32Array([
    // Vertex coordinates and color
     1.0,  1.0,  1.0,     0.5,  0.5,  0.5,  // v0 White
    -1.0,  1.0,  1.0,     0.5,  0.5,  0.5,  // v1 Magenta
    -1.0, -1.0,  1.0,     0.5,  0.5,  0.5,  // v2 Red
     1.0, -1.0,  1.0,     0.5,  0.5,  0.5,  // v3 Yellow
     1.0, -1.0, -1.0,     0.5,  0.5,  0.5,  // v4 Green
     1.0,  1.0, -1.0,     0.5,  0.5,  0.5,  // v5 Cyan
    -1.0,  1.0, -1.0,     0.5,  0.5,  0.5,  // v6 Blue
    -1.0, -1.0, -1.0,     0.5,  0.5,  0.5   // v7 Black
  ]);

  // Indices of the vertices
  const indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    0, 3, 4,   0, 4, 5,    // right
    0, 5, 6,   0, 6, 1,    // up
    1, 6, 7,   1, 7, 2,    // left
    7, 4, 3,   7, 3, 2,    // down
    4, 7, 6,   4, 6, 5     // back
 ]);

  // Create a buffer object
  const vertexColorBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  if (!vertexColorBuffer || !indexBuffer) {
    return {vao:null, n:-1};
  }

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  const FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to aPosition and enable the assignment
  gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(loc_aPosition);
  // Assign the buffer object to aColor and enable the assignment
  gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(loc_aColor);

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return {vao, n:indices.length};

}

function initEdges(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  const verticesColors = new Float32Array([
    // Vertex coordinates and color
     1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0
    -1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v1
    -1.0, -1.0,  1.0,     1.0,  1.0,  1.0,  // v2
     1.0, -1.0,  1.0,     1.0,  1.0,  1.0,  // v3
     1.0, -1.0, -1.0,     1.0,  1.0,  1.0,  // v4
     1.0,  1.0, -1.0,     1.0,  1.0,  1.0,  // v5
    -1.0,  1.0, -1.0,     1.0,  1.0,  1.0,  // v6
    -1.0, -1.0, -1.0,     1.0,  1.0,  1.0   // v7
  ]);

  // Indices of the vertices
  const indices = new Uint8Array([
    0,1, 1,2, 2,3, 3,0,
    5,4, 4,7, 7,6, 6,5,
    1,6, 0,5, 3,4, 2,7
 ]);

  // Create a buffer object
  const vertexColorBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  if (!vertexColorBuffer || !indexBuffer) {
    return {vao:null, n:-1};
  }

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  const FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to aPosition and enable the assignment
  gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(loc_aPosition);
  // Assign the buffer object to aColor and enable the assignment
  gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(loc_aColor);

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return {vao, n:indices.length};
}

function initArrayBuffer(gl, data, num, type, loc_attribute) {
    const buffer = gl.createBuffer();   // Create a buffer object
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    gl.vertexAttribPointer(loc_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(loc_attribute);
    
    return true;
}
