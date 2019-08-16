class Shader
{
	constructor(gl, src_vert, src_frag)
	{
		initShaders(gl, src_vert, src_frag);
		this.h_prog = gl.program;
	}
}


