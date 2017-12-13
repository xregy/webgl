function init_shader(gl, src_vert, src_frag, attrib_names)
{
	initShaders(gl, src_vert, src_frag);
	h_prog = gl.program;
	var	attribs = {};
	for(let attrib of attrib_names)
	{
		attribs[attrib] = gl.getAttribLocation(h_prog, attrib);
	}
	return {h_prog:h_prog, attribs:attribs};
}

function main()
{
	var canvas = document.getElementById('webgl');
	var gl = canvas.getContext("webgl2");

	var	shader_red = init_shader(gl,
								document.getElementById('shader-vert').text,
								document.getElementById('shader-frag-red').text,
								['x', 'y']);
	var	shader_blue = init_shader(gl,
								document.getElementById('shader-vert').text,
								document.getElementById('shader-frag-blue').text,
								['x', 'y']);

	var	obj_red = init_triangle_red(gl, shader_red);
	var	obj_blue = init_triangle_blue(gl, shader_blue);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

	render_object(gl, shader_red, obj_red);
	render_object(gl, shader_blue, obj_blue);
}

function render_object(gl, shader, object)
{
    gl.useProgram(shader.h_prog);
	gl.bindVertexArray(object.vao);
	if(object.drawcall == 'drawElements')
	{
		gl.drawElements(object.type, object.n, object.index.type, 0);
	}
	else if(object.drawcall == 'drawArrays')
	{
		gl.drawArrays(object.type, 0, object.n);
	}
	gl.bindVertexArray(null);
    gl.useProgram(null);
}

function init_triangle_red(gl, shader)
{
	var positions_x = new Float32Array([ -0.90, 0.85, -0.90, ]);
	var positions_y = new Float32Array([ -0.90, -0.90, 0.85, ]);

	vao = gl.createVertexArray();
	gl.bindVertexArray(vao); 

	var	buf_x = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_x);
	gl.bufferData(gl.ARRAY_BUFFER, positions_x, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shader.attribs['x'], 1, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enableVertexAttribArray(shader.attribs['x']);


	var	buf_y = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_y);
	gl.bufferData(gl.ARRAY_BUFFER, positions_y, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shader.attribs['y'], 1, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enableVertexAttribArray(shader.attribs['y']);

	gl.bindVertexArray(null); 
	gl.disableVertexAttribArray(shader.attribs['x']);
	gl.disableVertexAttribArray(shader.attribs['y']);

    return {vao:vao, n:3, drawcall:'drawArrays', type:gl.TRIANGLES};
}

function init_triangle_blue(gl, shader)
{
	var positions_x = new Float32Array([ 0.90, 0.90, -0.85, ]);
	var positions_y = new Float32Array([ -0.85, 0.90, 0.90 ]);
	var	indices = new Uint16Array([0,1,2]);

	vao = gl.createVertexArray();
	gl.bindVertexArray(vao); 

	var	buf_x = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_x);
	gl.bufferData(gl.ARRAY_BUFFER, positions_x, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shader.attribs['x'], 1, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enableVertexAttribArray(shader.attribs['x']);


	var	buf_y = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_y);
	gl.bufferData(gl.ARRAY_BUFFER, positions_y, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shader.attribs['y'], 1, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enableVertexAttribArray(shader.attribs['y']);

	var	buf_idx = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_idx);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	gl.bindVertexArray(null); 
	gl.disableVertexAttribArray(shader.attribs['x']);
	gl.disableVertexAttribArray(shader.attribs['y']);

    return {vao:vao, n:3, drawcall:'drawElements', index:{buffer:buf_idx, type:gl.UNSIGNED_SHORT}, type:gl.TRIANGLES};
}
