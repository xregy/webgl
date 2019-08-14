class Shader
{
	constructor(gl, src_vert, src_frag, attrib_names)
	{
		this.init(gl, src_vert, src_frag, attrib_names);
	}
	init(gl, src_vert, src_frag, attribs)
	{
		initShaders(gl, src_vert, src_frag);
		this.h_prog = gl.program;
		this.attribs = attribs;
	}
}


