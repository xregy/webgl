"use strict";
const loc_aPosition = 3;
const loc_aTexCoord = 8;
let VSHADER_SOURCE =
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aTexCoord}) in vec2 aTexCoord;
out vec2 vTexCoord;
void main() {
  gl_Position = aPosition;
  vTexCoord = aTexCoord;
}
`;

// Fragment shader program
let FSHADER_SOURCE =
`#version 300 es
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D uSampler;
in vec2 vTexCoord;
out vec4 fColor;
void main() 
{
  fColor = texture(uSampler, vTexCoord);
}
`;

function main() {
    let canvas = document.getElementById('webgl');
    let gl = canvas.getContext("webgl2");
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    let vao = initVertexBuffers(gl);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    initTextures(gl);

    gl.bindVertexArray(vao);
    gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl) {
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let verticesTexCoords = new Float32Array([
      // Vertex coordinates, texture coordinate
      -0.5,  0.5,   0.0, 1.0,
      -0.5, -0.5,   0.0, 0.0,
       0.5,  0.5,   1.0, 1.0,
       0.5, -0.5,   1.0, 0.0,
    ]);
    
    let vertexTexCoordBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    
    let FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    
    let a_Position = loc_aPosition;
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object
    
    let a_TexCoord = loc_aTexCoord;
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object

    gl.bindVertexArray(null);

    return vao;
}

function initTextures(gl)
{
    let texture = gl.createTexture();
    let loc_uSampler = gl.getUniformLocation(gl.program, 'uSampler');
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 2, 2, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([255,0,0,   0,255,0,    0,0,255,   255,0,255]));
    
    gl.uniform1i(loc_uSampler, 0);
    
    return;
}


