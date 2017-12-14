function main()
{
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext("webgl2");
	initShaders(gl, document.getElementById("shader-vert").text, document.getElementById("shader-frag").text);

    var vertices = new Float32Array([
                        -0.9,-0.9, 1,0,0,
                         0.9,-0.9, 0,1,0,
                         0.9, 0.9, 0,0,1,
                        -0.9, 0.9, 1,1,1]);
	var FSIZE = vertices.BYTES_PER_ELEMENT;


    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	var	loc_aPosition = 3;
	var	loc_aColor = 8;
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 5*FSIZE, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, 5*FSIZE, 2*FSIZE);
    gl.enableVertexAttribArray(loc_aColor);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(gl.program);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

}
