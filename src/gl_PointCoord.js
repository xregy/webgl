"use strict";
const SRC_VERT = `#version 300 es
layout(location=7) in vec4 aPosition;
void main() 
{
	gl_Position = aPosition;
	gl_PointSize = 100.0;
}
`;
const SRC_FRAG = `#version 300 es
precision mediump float;
out vec4 fColor;
void main() 
{
	if(length(gl_PointCoord - vec2(.5,.5)) <= 0.4)    fColor = vec4(1,0,0,1);
	else discard;
}
`;

function main()
{
	let canvas = document.getElementById('webgl');
	let gl = canvas.getContext("webgl2");

	initShaders(gl, SRC_VERT, SRC_FRAG);

	let vao = initVertexBuffers(gl);

	gl.clearColor(0.2, 0.2, 0.2, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(vao);
	gl.drawArrays(gl.POINTS, 0, 3);
    gl.bindVertexArray(null);
}

function initVertexBuffers(gl)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

	let vertices = new Float32Array([
	 .9,  .2,
	-.3, -.7,
	0.0, 0.5
	]);

	let vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	let locPosition = gl.getAttribLocation(gl.program, 'aPosition');
	gl.vertexAttribPointer(locPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(locPosition);

    gl.bindVertexArray(null);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vao;
}
