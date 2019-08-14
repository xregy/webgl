"use strict";
// RotatedTranslatedTriangle.js (c) 2012 matsuda
// Vertex shader program
let VSHADER_SOURCE =
`#version 300 es
    layout(location=4) in vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    void main()
    {
      gl_Position = u_ModelMatrix * a_Position;
    }
`;

// Fragment shader program
let FSHADER_SOURCE =
`#version 300 es
    precision mediump float;
    out vec4 fColor;
    void main()
    {
      fColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;

function main() {
    let canvas = document.getElementById('webgl');
    let gl = canvas.getContext("webgl2");
    
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    
    let vao = initVertexBuffers(gl);
    
    // Create Matrix4 object for model transformation
    let modelMatrix = new J3DIMatrix4();
    
    // Calculate a model matrix
    let ANGLE = 60.0; // The rotation angle
    let Tx = 0.5;     // Translation distance
    modelMatrix.rotate(ANGLE, 0, 0, 1); // Set rotation matrix
    modelMatrix.translate(Tx, 0, 0);        // Multiply modelMatrix by the calculated translation matrix
    
    // Pass the model matrix to the vertex shader
    let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_xformMatrix');
      return;
    }
    modelMatrix.setUniform(gl, u_ModelMatrix, false);
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let vertices = new Float32Array([ 0, 0.3,   -0.3, -0.3,   0.3, -0.3 ]);
    
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    let a_Position = 4;
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindVertexArray(null);
    
    return vao;
}

