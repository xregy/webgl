import {Shader} from "./class_shader.mjs"

export class Light
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
			Light.shader = new Shader(gl, Light.src_shader_vert, Light.src_shader_frag);
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
		gl.vertexAttrib4fv(Light.loc_aPosition, this.M.multiplyVector4(this.position).elements);
		if(this.enabled)	gl.vertexAttrib3f(Light.loc_aColor, 1, 1, 1);
		else				gl.vertexAttrib3f(Light.loc_aColor, .1, .1, .1);
		gl.drawArrays(gl.POINTS, 0, 1);
		gl.useProgram(null);
	}
}

Light.loc_aPosition = 3;
Light.loc_aColor = 8;

Light.src_shader_vert = 
`#version 300 es
	layout(location=${Light.loc_aPosition}) in vec4 aPosition;
	layout(location=${Light.loc_aColor}) in vec4 aColor;
	uniform mat4 MVP;
	out vec4 vColor;
	void main()
	{
		gl_Position = MVP * vec4(aPosition.xyz, 1);
		gl_PointSize = 10.0;
		vColor = aColor;
	}
`;
Light.src_shader_frag = 
`#version 300 es
	#ifdef GL_ES
	precision mediump float;
	#endif
	in vec4 vColor;
    out vec4 fColor;
	void main()
	{
		fColor = vColor;
	}
`;


Light.shader = null;
Light.generate_uniform_names = function(light_name)
    {
        let uniform_names = [];
        uniform_names.push(light_name + '.position');
        uniform_names.push(light_name + '.ambient');
        uniform_names.push(light_name + '.diffuse');
        uniform_names.push(light_name + '.specular');
        uniform_names.push(light_name + '.enabled');
        uniform_names.push(light_name + '.direction');
        uniform_names.push(light_name + '.cutoff_angle');
        return uniform_names;
    }

