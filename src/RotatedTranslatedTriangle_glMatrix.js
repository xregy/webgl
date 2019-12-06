"use strict";

const loc_aPosition = 2;

const src_vert =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
uniform mat4 uM;
void main()
{
  gl_Position = uM * aPosition;
}
`;

const src_frag =
`#version 300 es
precision mediump float;
out vec4 fColor;
void main()
{
  fColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

function main() {
    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    initShaders(gl, src_vert, src_frag);
    
    const vao = initVertexBuffers(gl);
    
    let modelMatrix = mat4.create();
    
    // Calculate a model matrix
    const ANGLE = 60.0; // The rotation angle
    const Tx = 0.5;     // Translation distance
    mat4.rotate(modelMatrix, modelMatrix, ANGLE*Math.PI/180.0, [0,0,1]);	// Set rotation matrix
    mat4.translate(modelMatrix, modelMatrix, [Tx, 0, 0]);        // Multiply modelMatrix by the calculated translation matrix
    
    // Pass the model matrix to the vertex shader
    const loc_uM = gl.getUniformLocation(gl.program, 'uM');
    gl.uniformMatrix4fv(loc_uM, false, modelMatrix);
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertices = new Float32Array([ 0, 0.3,   -0.3, -0.3,   0.3, -0.3 ]);
    
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.bindVertexArray(null);

    return vao;
}

