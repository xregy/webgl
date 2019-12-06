"use strict"
const loc_aPosition = 3;
const loc_aCoords = 4;
const src_vert = 
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aCoords}) in vec2 aCoords;
out vec2 vCoords;
void main() {
	gl_Position = aPosition;
	vCoords = aCoords;
}
`;
const src_frag = `#version 300 es
precision mediump float;
in vec2 vCoords;
out vec4 fColor;
void main() {
	if(length(vCoords) < 0.5)    fColor = vec4(1,0,0,1);
	else fColor = vec4(0,0,0,1);
}
`;

function main()
{
    let canvas = document.getElementById('webgl');
    let gl = canvas.getContext('webgl2');
    initShaders(gl, src_vert, src_frag);
    let vao = initVertexBuffers(gl);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let vertices = new Float32Array([
    -0.9,  0.9, -1,  1,
    -0.9, -0.9, -1, -1,
     0.9,  0.9,  1,  1,
     0.9, -0.9,  1, -1
    ]);
    
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 4*4, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aCoords, 2, gl.FLOAT, false, 4*4, 4*2);
    gl.enableVertexAttribArray(loc_aCoords);
    
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vao;
}
