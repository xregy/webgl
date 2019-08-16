"use strict";
function main()
{
    let canvas = document.getElementById('webgl');
    let gl = getWebGLContext(canvas);
    initShaders(gl, document.getElementById("shader-vert").text, document.getElementById("shader-frag").text);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);


	init_vbo(gl);

	let	w = canvas.width;
	let	h = canvas.height;

    let loc_MVP = gl.getUniformLocation(gl.program, 'uMVP');
	let	MVP = new Matrix4();

    gl.clear(gl.COLOR_BUFFER_BIT);

	gl.viewport(0, 0, w/2, h);
	MVP.setOrtho(-1,1,-1,1,0,2);
	MVP.lookAt(1,.1,1, 0,0,0, 0,1,0);
	gl.uniformMatrix4fv(loc_MVP, false, MVP.elements);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

	gl.viewport(w/2, 0, w/2, h);
	MVP.setOrtho(-1,1,-1,1,0,2);
	MVP.lookAt(1,.3,-1, 0,0,0, 0,1,0);
	gl.uniformMatrix4fv(loc_MVP, false, MVP.elements);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

}

function init_vbo(gl, n)
{
    let attribs = new Float32Array([
		-.5, -.5, 0, 1, 0, 0,
		 .5, -.5, 0, 0, 1, 0,
		 .5,  .5, 0, 0, 0, 1,
		-.5,  .5, 0, 1, 1, 1,
			]);

    let vbo = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, attribs, gl.STATIC_DRAW);
    
    let FSIZE = attribs.BYTES_PER_ELEMENT;

    let loc_Position = gl.getAttribLocation(gl.program, 'aPosition');
	gl.vertexAttribPointer(loc_Position, 3, gl.FLOAT, false, FSIZE*6, 0);
	gl.enableVertexAttribArray(loc_Position);

    let loc_Color = gl.getAttribLocation(gl.program, 'aColor');
	gl.vertexAttribPointer(loc_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
	gl.enableVertexAttribArray(loc_Color);

	return;
}
