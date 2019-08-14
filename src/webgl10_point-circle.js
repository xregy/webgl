"use strict"
const SRC_VERT = `
attribute vec4 aPosition;
attribute vec2 aCoords;
varying vec2 vCoords;
void main() {
	gl_Position = aPosition;
	vCoords = aCoords;
}
`;
const SRC_FRAG = `
precision mediump float;
varying vec2 vCoords;
void main() {
	if(length(vCoords) < 0.5)    gl_FragColor = vec4(1,0,0,1);
	else gl_FragColor = vec4(0,0,0,1);
}
`;

function main()
{
	let canvas = document.getElementById('webgl');
	let gl = getWebGLContext(canvas);
	initShaders(gl, SRC_VERT, SRC_FRAG);
	initVertexBuffers(gl);
	gl.clearColor(0.5, 0.5, 0.5, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function initVertexBuffers(gl)
{
	let vertices = new Float32Array([
	-0.9,  0.9, -1,  1,
	-0.9, -0.9, -1, -1,
	 0.9,  0.9,  1,  1,
	 0.9, -0.9,  1, -1
	]);

	let vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	let a_Position = gl.getAttribLocation(gl.program, 'aPosition');
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4*4, 0);
	gl.enableVertexAttribArray(a_Position);

	let a_coords = gl.getAttribLocation(gl.program, 'aCoords');
	gl.vertexAttribPointer(a_coords, 2, gl.FLOAT, false, 4*4, 4*2);

	gl.enableVertexAttribArray(a_coords);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
