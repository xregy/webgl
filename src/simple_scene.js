import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"

"use strict";

function main() {

    const loc_aPosition = 3;
    const loc_aNormal = 5;

    const src_vert =
    `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aNormal}) in vec3 aNormal;
    uniform mat4 uMVP;
    uniform mat4 uN;
    out vec3 vNormal;
    void main() {
        gl_Position = uMVP * aPosition;
        vNormal = (uN * vec4(aNormal,0)).xyz;
    }`;
    
    const src_frag =
    `#version 300 es
    precision mediump float;
    in vec3 vNormal;
    out vec4 fColor;
    struct TMaterial
    {
        vec3    ambient;
        vec3    diffuse;
    };
    struct TLight
    {
        vec4    position;
        vec3    ambient;
        vec3    diffuse;
    };
    uniform TMaterial   material;
    uniform TLight      light;
    void main()
    {
        vec3    n = normalize(vNormal);
        vec3    l = normalize(light.position.xyz);

        float   l_dot_n = max(dot(l, n), 0.0);
        vec3    ambient = light.ambient * material.ambient;
        vec3    diffuse = light.diffuse * material.diffuse * l_dot_n;

        fColor = vec4(ambient + diffuse, 1);
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

    // uniform locations
    const loc_uMVP = gl.getUniformLocation(h_prog, "uMVP");
    const loc_uN = gl.getUniformLocation(h_prog, "uN");
    const loc_light = {
                    position:gl.getUniformLocation(h_prog, "light.position"),
                    ambient:gl.getUniformLocation(h_prog, "light.ambient"),
                    diffuse:gl.getUniformLocation(h_prog, "light.diffuse"),
                };
    const loc_material = {
                    ambient:gl.getUniformLocation(h_prog, "material.ambient"),
                    diffuse:gl.getUniformLocation(h_prog, "material.diffuse"),
                };
    
    // initialize VAOs
    const cube = initCube({gl, loc_aPosition, loc_aNormal});
    const plane = initPlane({gl, loc_aPosition, loc_aNormal});
    
    // initialize WebGL states
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    
    // matrices
    let M = mat4.create();
    let V = mat4.create();
    let P = mat4.create();
    let N = mat4.create();
    let MVP = mat4.create();
    let VP = mat4.create();

    // set up a light
    const   light = {position:new Float32Array([5, 5, 1, 1]),
                    ambient:new Float32Array([.3, .3, .3]),
                    diffuse:new Float32Array([1, 1, 1])};

    gl.uniform4fv(loc_light.position, light.position);
    gl.uniform3fv(loc_light.ambient, light.ambient);
    gl.uniform3fv(loc_light.diffuse, light.diffuse);

    // set up materials
    cube.material = {diffuse:new Float32Array([1, .5, .5]),
                    ambient:new Float32Array([1, .5, .5])};

    plane.material = {diffuse:new Float32Array([.5, 1, 1]),
                    ambient:new Float32Array([.5, 1, 1])};

    // set up projection 
    mat4.perspective(P, toRadian(50), 1, 1, 100);

    // set up view transformation
    mat4.rotate(V, V, toRadian(10), [1, 0, 0]);
    mat4.rotate(V, V, toRadian(-40), [0, 1, 0]);
    mat4.translate(V, V, [-3, -1.5, -4]);

    mat4.multiply(VP, P, V);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // render the plane
    gl.uniform3fv(loc_material.ambient, plane.material.ambient);
    gl.uniform3fv(loc_material.diffuse, plane.material.diffuse);

    mat4.fromScaling(M, [5, 5, 5]);
    mat4.rotate(M, M, toRadian(-90), [1, 0, 0]);

    mat4.multiply(MVP, VP, M);

    mat4.multiply(N, V, M);
    mat4.invert(N, N);
    mat4.transpose(N, N);

    gl.uniformMatrix4fv(loc_uMVP, false, MVP);
    gl.uniformMatrix4fv(loc_uN, false, N);

    gl.bindVertexArray(plane.vao);
    gl.drawElements(gl.TRIANGLES, plane.n, gl.UNSIGNED_BYTE, 0);
    gl.bindVertexArray(null);

    // render the cube
    gl.uniform3fv(loc_material.ambient, cube.material.ambient);
    gl.uniform3fv(loc_material.diffuse, cube.material.diffuse);

    mat4.fromTranslation(M, [0, 0.5, 0]);
    mat4.multiply(MVP, VP, M);
    mat4.multiply(N, V, M);
    mat4.invert(N, N);
    mat4.transpose(N, N);
    gl.uniformMatrix4fv(loc_uMVP, false, MVP);
    gl.uniformMatrix4fv(loc_uN, false, N);

    gl.bindVertexArray(cube.vao);
    gl.drawElements(gl.TRIANGLES, cube.n, gl.UNSIGNED_BYTE, 0);
    gl.bindVertexArray(null);
}


function initCube({gl, loc_aPosition, loc_aNormal}) {
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
    
    if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, loc_aNormal))
      return -1;
    
    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    
    gl.bindVertexArray(null);
    
    return {vao, n:indices.length};
}

function initPlane({gl, loc_aPosition, loc_aNormal}) {

    const vertices = new Float32Array([   // Vertex coordinates
       .5, .5, 0,   -.5, .5, 0,  -.5, -.5, 0,  .5, -.5, 0  // v0-v5-v6-v1 up
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
