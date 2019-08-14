"use strict"
const SRC_VERT = `
attribute vec4 aPosition;
void main() 
{
	gl_Position = aPosition;
	gl_PointSize = 100.0;
}
`;
const SRC_FRAG = `
precision mediump float;
void main() 
{
	if(length(gl_PointCoord - vec2(.5,.5)) <= 0.4)    gl_FragColor = vec4(1,0,0,1);
	else discard;
}
`;

function main()
{
	let canvas = document.getElementById('webgl');
	let gl = getWebGLContext(canvas);

	initShaders(gl, SRC_VERT, SRC_FRAG);

	initVertexBuffers(gl);

	gl.clearColor(0.2, 0.2, 0.2, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.POINTS, 0, 3);
}

function initVertexBuffers(gl)
{
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

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
