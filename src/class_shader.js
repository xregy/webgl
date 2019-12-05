class Shader
{
	constructor(gl, src_vert, src_frag, uniform_vars=undefined)
	{
		initShaders(gl, src_vert, src_frag);
		this.h_prog = gl.program;
        if(uniform_vars)
        {
            this.loc_uniforms = {};
            for(let uniform of uniform_vars)
            {
                this.loc_uniforms[uniform] = gl.getUniformLocation(this.h_prog, uniform);
            }
        }
	}
}


