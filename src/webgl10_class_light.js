class Light
{
	constructor(gl, position, ambient, diffusive, specular, enabled, cutoff_angle = 180, direction = [0,0,0])
	{
		this.position = new Vector4(position);
		this.ambient = new Vector3(ambient);
		this.diffusive = new Vector3(diffusive);
		this.specular = new Vector3(specular);
		this.enabled = enabled;
		this.M = new Matrix4();
		this.MVP = new Matrix4();
		this.direction = new Vector4([direction[0], direction[1], direction[2], 0.0]);
		this.cutoff_angle = cutoff_angle;

		if(!Light.shader)
			Light.shader = new Shader(gl, Light.src_shader_vert, Light.src_shader_frag, ["aPosition", "aColor"]);
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
		gl.useProgram(Light.shader.h_prog);
		this.MVP.set(P); this.MVP.multiply(V);
		gl.uniformMatrix4fv(gl.getUniformLocation(Light.shader.h_prog, "MVP"), false, this.MVP.elements);
		gl.vertexAttrib4fv(Light.shader.attribs["aPosition"], this.M.multiplyVector4(this.position).elements);
		if(this.enabled)	gl.vertexAttrib3f(Light.shader.attribs["aColor"], 1, 1, 1);
		else				gl.vertexAttrib3f(Light.shader.attribs["aColor"], .1, .1, .1);
		gl.drawArrays(gl.POINTS, 0, 1);
		gl.useProgram(null);
	}
}

Light.src_shader_vert = 
`
	attribute vec4 aPosition;
	attribute vec4 aColor;
	uniform mat4 MVP;
	varying vec4 vColor;
	void main()
	{
		gl_Position = MVP * vec4(aPosition.xyz, 1);
		gl_PointSize = 10.0;
		vColor = aColor;
	}
`;
Light.src_shader_frag = 
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


Light.shader = null;
