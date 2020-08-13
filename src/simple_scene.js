//import {Shader} from "../modules/class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"

"use strict";

function main() {

    const loc_aPosition = 3;
    const loc_aNormal = 5;
    const loc_aColor = 7;
    const src_vert =
    `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aColor}) in vec4 aColor;
    layout(location=${loc_aNormal}) in vec4 aNormal;
    uniform mat4 uMVP;
    out vec4 vColor;
    out vec4 vNormal;
    void main() {
        gl_Position = uMVP * aPosition;
        vColor = aColor;
        vNormal = aNormal;
    }`;
    
    const src_frag =
    `#version 300 es
    precision mediump float;
    in vec4 vColor;
    in vec4 vNormal;
    out vec4 fColor;
    void main() {
//        fColor = vColor;
        fColor = vNormal;
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext('webgl2');

    // Compiling & linking shaders
    const h_prog = gl.createProgram();

    const h_vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(h_vert, src_vert);
    gl.compileShader(h_vert);
    gl.attachShader(h_prog, h_vert);

    const h_frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(h_frag, src_frag);
    gl.compileShader(h_frag);
    gl.attachShader(h_prog, h_frag);

    gl.linkProgram(h_prog);

    gl.useProgram(h_prog);

    const loc_uMVP = gl.getUniformLocation(h_prog, "uMVP");
    
    const cube = initCube({gl, loc_aPosition, loc_aNormal, loc_aColor});
    const plane = initPlane({gl, loc_aPosition, loc_aNormal, loc_aColor});
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    let MVP = mat4.create();
    let VP = mat4.create();

    mat4.perspective(VP, toRadian(50), 1, 1, 100);
//    mat4.perspective(VP, toRadian(60), 1, 1, 100);

    mat4.rotate(VP, VP, toRadian(10), [1, 0, 0]);
    mat4.rotate(VP, VP, toRadian(-40), [0, 1, 0]);
    mat4.translate(VP, VP, [-3, -1.5, -4]);

    mat4.copy(MVP, VP);
    mat4.scale(MVP, MVP, [5, 5, 5]);
    mat4.rotate(MVP, MVP, toRadian(90), [1, 0, 0]);
    gl.uniformMatrix4fv(loc_uMVP, false, MVP);

    gl.bindVertexArray(plane.vao);
    gl.drawElements(gl.TRIANGLES, plane.n, gl.UNSIGNED_BYTE, 0);
    gl.bindVertexArray(null);

    mat4.copy(MVP, VP);
    mat4.translate(MVP, MVP, [0, 0.5, 0]);
    gl.uniformMatrix4fv(loc_uMVP, false, MVP);

    gl.bindVertexArray(cube.vao);
    gl.drawElements(gl.TRIANGLES, cube.n, gl.UNSIGNED_BYTE, 0);
    gl.bindVertexArray(null);
}


function initCube({gl, loc_aPosition, loc_aNormal, loc_aColor}) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

    const vertices = new Float32Array([   // Vertex coordinates
       .5, .5, .5,  -.5, .5, .5,  -.5,-.5, .5,   .5,-.5, .5,  // v0-v1-v2-v3 front
       .5, .5, .5,   .5,-.5, .5,   .5,-.5,-.5,   .5, .5,-.5,  // v0-v3-v4-v5 right
       .5, .5, .5,   .5, .5,-.5,  -.5, .5,-.5,  -.5, .5, .5,  // v0-v5-v6-v1 up
      -.5, .5, .5,  -.5, .5,-.5,  -.5,-.5,-.5,  -.5,-.5, .5,  // v1-v6-v7-v2 left
      -.5,-.5,-.5,   .5,-.5,-.5,   .5,-.5, .5,  -.5,-.5, .5,  // v7-v4-v3-v2 down
       .5,-.5,-.5,  -.5,-.5,-.5,  -.5, .5,-.5,   .5, .5,-.5   // v4-v7-v6-v5 back
    ]);
    
    const colors = new Float32Array([     // Colors
      0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
      0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
      1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
      1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
      1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
      0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
    ]);

    const normals = new Float32Array([     // normals
         0, 0, 1,    0, 0, 1,    0, 0, 1,    0, 0, 1,
         1, 0, 0,    1, 0, 0,    1, 0, 0,    1, 0, 0,
         0, 1, 0,    0, 1, 0,    0, 1, 0,    0, 1, 0,
        -1, 0, 0,   -1, 0, 0,   -1, 0, 0,   -1, 0, 0,
         0,-1, 0,    0,-1, 0,    0,-1, 0,    0,-1, 0,
         0, 0,-1,    0, 0,-1,    0, 0,-1,    0, 0,-1
    ]);
    
    const indices = new Uint8Array([       // Indices of the vertices
       0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ]);

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    // Create a buffer object
    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) 
      return -1;
    
    // Write the vertex coordinates and color to the buffer object
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, loc_aPosition))
      return -1;
    
    if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, loc_aColor))
      return -1;

    if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, loc_aNormal))
      return -1;
    
    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    
    gl.bindVertexArray(null);
    
    return {vao, n:indices.length};
}

function initPlane({gl, loc_aPosition, loc_aNormal, loc_aColor}) {

    const vertices = new Float32Array([   // Vertex coordinates
//       .5, 0, .5,   .5, 0,-.5,  -.5, 0,-.5,  -.5, 0, .5,  // v0-v5-v6-v1 up
       .5, .5, 0,   .5, -.5, 0,  -.5, -.5, 0,  -.5, .5, 0  // v0-v5-v6-v1 up
    ]);
    
    const colors = new Float32Array([     // Colors
      .5, 1, 1, .5, 1, 1, .5, 1, 1, .5, 1, 1
    ]);

    const normals = new Float32Array([     // Normals
        0, 0, 1,    0, 0, 1,    0, 0, 1,    0, 0, 1
    ]);
    
    const indices = new Uint8Array([       // Indices of the vertices
       0, 1, 2,   0, 2, 3,    // front
    ]);

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    // Create a buffer object
    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) 
      return -1;
    
    // Write the vertex coordinates and color to the buffer object
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, loc_aPosition))
      return -1;
    
    if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, loc_aColor))
      return -1;
    
    if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, loc_aNormal))
      return -1;

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    
    gl.bindVertexArray(null);
    
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

main();
