function main()
{
	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
    if (!gl)  
    {
        console.log('Failed to get the rendering context for WebGL'); 
        return;
    }

	var positions_x = [
        new Float32Array([
			-0.90, // Triangle 1
			0.85,
			-0.90,
            ]),
        new Float32Array([
			0.90, // Triangle 2
			0.90,
			-0.85,
            ])
        ];

	var positions_y = [
        new Float32Array([
			-0.90, // Triangle 1
			-0.90,
			0.85,
            ]),
        new Float32Array([
			-0.85, // Triangle 2
			0.90,
			0.90
            ])
        ];

	var id_vert = ['shader-vert', "shader-vert"];
	var id_frag = ["shader-frag-red", "shader-frag-blue"];
    var h_prog = Array([null, null]);
	var	vbo_x = Array([null, null]);
	var	vbo_y = Array([null, null]);

	for(var i=0 ; i<2 ; i++)
	{
		var src_vert = document.getElementById(id_vert[i]).text;
		var src_frag = document.getElementById(id_frag[i]).text;

	    if (!initShaders(gl, src_vert, src_frag))
		{
        	console.log('Failed to intialize shaders.');
        	return;
		}
    	h_prog[i] = gl.program;

	    vbo_x[i] = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_x[i]);
	    gl.bufferData(gl.ARRAY_BUFFER, positions_x[i], gl.STATIC_DRAW);

	    vbo_y[i] = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_y[i]);
	    gl.bufferData(gl.ARRAY_BUFFER, positions_y[i], gl.STATIC_DRAW);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
//-----------------------------------------------------

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

	for(var i=0 ; i<2 ; i++)
	{
	    gl.useProgram(h_prog[i]);

	    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_x[i]);
		var loc_x = gl.getAttribLocation(h_prog[i], 'x');
	    gl.vertexAttribPointer(loc_x, 1, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	    gl.enableVertexAttribArray(loc_x);

	    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_y[i]);
	    var loc_y = gl.getAttribLocation(h_prog[i], 'y');
	    gl.vertexAttribPointer(loc_y, 1, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	    gl.enableVertexAttribArray(loc_y);

		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
}
