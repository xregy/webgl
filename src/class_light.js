class Light
{
	constructor(gl, position, ambient, diffusive, specular, enabled)
	{
		this.position = new Vector4(position);
		this.ambient = new Vector3(ambient);
		this.diffusive = new Vector3(diffusive);
		this.specular = new Vector3(specular);
		this.enabled = enabled;
		this.M = new Matrix4();
		var src_shader_vert = 
			  'attribute vec4 aPosition;\n'
			+ 'attribute vec4 aColor;\n'
			+ 'uniform mat4 MVP;\n'
			+ 'varying vec4 vColor;\n'
			+ 'void main()\n'
			+ '{\n'
			+ '	gl_Position = MVP * vec4(aPosition.xyz, 1);\n'
			+ '	gl_PointSize = 10.0;\n'
			+ '	vColor = aColor;\n'
			+ '}\n';
		var src_shader_frag = '#ifdef GL_ES\n'
			+ 'precision mediump float;\n'
			+ '#endif\n'
			+ 'varying vec4 vColor;\n'
			+ 'void main()\n'
			+ '{\n'
			+ '	gl_FragColor = vColor;\n'
			+ '}\n';
		this.MVP = new Matrix4();
		this.shader = new Shader(gl, src_shader_vert, src_shader_frag, ["aPosition", "aColor"]);
	}
	set_type(positional)
	{
		if(positional)	this.position.elements[3] = 1.0;
		else			this.position.elements[3] = 0.0;
	}
	turn_on(enabled)
	{
		this.enabled = enabled;
	}
	render(gl, V, P)
	{
		gl.useProgram(this.shader.h_prog);
		this.MVP = new Matrix4(P); this.MVP.multiply(V);
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shader.h_prog, "MVP"), false, this.MVP.elements);
		gl.vertexAttrib4fv(this.shader.attribs["aPosition"], this.M.multiplyVector4(this.position).elements);
		if(this.enabled)	gl.vertexAttrib3f(this.shader.attribs["aColor"], 1, 1, 1);
		else				gl.vertexAttrib3f(this.shader.attribs["aColor"], .1, .1, .1);
		gl.drawArrays(gl.POINTS, 0, 1);
		gl.useProgram(null);
	}
}


