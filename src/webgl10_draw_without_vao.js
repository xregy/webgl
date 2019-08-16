function init_shader(gl, src_vert, src_frag, attrib_names)
{
	initShaders(gl, src_vert, src_frag);
	h_prog = gl.program;
	var attribs = {};
	for(let attrib of attrib_names)
	{
		attribs[attrib] = gl.getAttribLocation(h_prog, attrib);
	}
	return {h_prog:h_prog, attribs:attribs};
}

function main()
{
	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	
	var shader_red = init_shader(gl,
		document.getElementById('shader-vert').text,
		document.getElementById('shader-frag-red').text,
		['x', 'y']);
	var shader_blue = init_shader(gl,
		document.getElementById('shader-vert').text,
		document.getElementById('shader-frag-blue').text,
		['x', 'y']);
	var obj_red = init_triangle_red(gl);
	var obj_blue = init_triangle_blue(gl);


	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	render_object(gl, shader_red, obj_red);
	render_object(gl, shader_blue, obj_blue);
}
function render_object(gl, shader, object)
{
	gl.useProgram(shader.h_prog);
	
	for(var attrib_name in object.attribs)
	{
		var attrib = object.attribs[attrib_name];
		gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
		gl.vertexAttribPointer(shader.attribs[attrib_name], attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.enableVertexAttribArray(shader.attribs[attrib_name]);
	}
	if(object.drawcall == 'drawElements')
	{
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.index.buffer);
		gl.drawElements(object.type, object.n, object.index.type, 0);
	}
	else if(object.drawcall == 'drawArrays')
	{
		gl.drawArrays(object.type, 0, object.n);
	}
	
	for(var attrib_name in object.attribs)
	{
		gl.disableVertexAttribArray(shader.attribs[attrib_name]);
	}
	
	gl.useProgram(null);
}

function init_triangle_red(gl)
{
	var positions_x = new Float32Array([ -0.90, 0.85, -0.90, ]);
	var positions_y = new Float32Array([ -0.90, -0.90, 0.85, ]);
	
	var buf_x = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_x);
	gl.bufferData(gl.ARRAY_BUFFER, positions_x, gl.STATIC_DRAW);
	
	var buf_y = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_y);
	gl.bufferData(gl.ARRAY_BUFFER, positions_y, gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	var attribs = [];
	attribs["x"] = {buffer:buf_x, size:1, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	attribs["y"] = {buffer:buf_y, size:1, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	
	return {n:3, drawcall:'drawArrays', type:gl.TRIANGLES, attribs:attribs};
}

function init_triangle_blue(gl)
{
	var positions_x = new Float32Array([ 0.90, 0.90, -0.85, ]);
	var positions_y = new Float32Array([ -0.85, 0.90, 0.90 ]);
	var indices = new Uint16Array([0,1,2]);
	
	var buf_x = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_x);
	gl.bufferData(gl.ARRAY_BUFFER, positions_x, gl.STATIC_DRAW);
	
	var buf_y = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_y);
	gl.bufferData(gl.ARRAY_BUFFER, positions_y, gl.STATIC_DRAW);
	
	var buf_idx = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_idx);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	var attribs = [];
	attribs["x"] = {buffer:buf_x, size:1, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	attribs["y"] = {buffer:buf_y, size:1, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	
	return {n:3, drawcall:'drawElements', index:{buffer:buf_idx, type:gl.UNSIGNED_SHORT}, type:gl.TRIANGLES, attribs:attribs};
}
