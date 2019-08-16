"use strict";
function main()
{
    let canvas = document.getElementById('webgl');
    let gl = canvas.getContext("webgl2");

    initShaders(gl, document.getElementById("shader-vert").text, document.getElementById("shader-frag").text);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

	let vao = init_vbo(gl);

	let	w = canvas.width;
	let	h = canvas.height;

    let loc_MVP = gl.getUniformLocation(gl.program, 'uMVP');
	let	MVP = new Matrix4();

    gl.clear(gl.COLOR_BUFFER_BIT);

	gl.viewport(0, 0, w/2, h);
	MVP.setOrtho(-1,1,-1,1,0,2);
	MVP.lookAt(1,.1,1, 0,0,0, 0,1,0);
	gl.uniformMatrix4fv(loc_MVP, false, MVP.elements);
    gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);

	gl.viewport(w/2, 0, w/2, h);
	MVP.setOrtho(-1,1,-1,1,0,2);
	MVP.lookAt(1,.3,-1, 0,0,0, 0,1,0);
	gl.uniformMatrix4fv(loc_MVP, false, MVP.elements);
    gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);

}

function init_vbo(gl, n)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

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

    let loc_Position = 3;
	gl.vertexAttribPointer(loc_Position, 3, gl.FLOAT, false, FSIZE*6, 0);
	gl.enableVertexAttribArray(loc_Position);

    let loc_Color = 7;
	gl.vertexAttribPointer(loc_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
	gl.enableVertexAttribArray(loc_Color);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return vao;
}
