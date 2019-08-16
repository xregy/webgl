class Axes
{
	constructor(gl, length=2)
	{
		this.MVP = new Matrix4();
		if(!Axes.shader)
			Axes.shader = new Shader(gl, Axes.src_shader_vert, Axes.src_shader_frag, ["aPosition", "aColor"]);
		this.init_vbo(gl,length);
	}
	init_vbo(gl,l)
	{
		var vertices = new Float32Array([
			0,0,0, 1,0,0,
			l,0,0, 1,0,0,
			0,0,0, 0,1,0,
			0,l,0, 0,1,0,
			0,0,0, 0,0,1,
			0,0,l, 0,0,1,
		]);
		var vbo = gl.createBuffer();  
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		var FSIZE = vertices.BYTES_PER_ELEMENT;
		this.attribs = [];
		this.attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
		this.attribs["aColor"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	set_uniform_matrices(gl, h_prog, V, P)
	{
		this.MVP.set(P);
		this.MVP.multiply(V);
		gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, this.MVP.elements);
	}
	render(gl, V, P)
	{
		gl.useProgram(Axes.shader.h_prog);
		this.set_uniform_matrices(gl, Axes.shader.h_prog, V, P);
		for(var attrib_name in this.attribs)
		{
			var attrib = this.attribs[attrib_name];
			gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
			gl.vertexAttribPointer(Axes.shader.attribs[attrib_name], attrib.size, attrib.type, 
				attrib.normalized, attrib.stride, attrib.offset);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.enableVertexAttribArray(Axes.shader.attribs[attrib_name]);
		}
		gl.drawArrays(gl.LINES, 0, 6);
		for(var attrib_name in this.attribs)
		{
			gl.disableVertexAttribArray(Axes.shader.attribs[attrib_name]);
		}
		gl.useProgram(null);
	}
}

Axes.src_shader_vert = 
`
	attribute vec4 aPosition;
	attribute vec4 aColor;
	uniform mat4 MVP;
	varying vec4 vColor;
	void main()
	{
		gl_Position = MVP * aPosition;
		vColor = aColor;
	}
`;
Axes.src_shader_frag = 
`
	#ifdef GL_ES
	precision mediump float;
	#endif
	varying vec4 vColor;
	void main()
	{
		gl_FragColor = vColor;
	}
`;

Axes.shader = null;

