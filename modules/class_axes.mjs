import {Shader} from "./class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"

export class Axes
{
	constructor(gl, length=2)
	{
		this.MVP = mat4.create();
		if(!Axes.shader)
			Axes.shader = new Shader(gl, Axes.src_shader_vert, Axes.src_shader_frag,);
		this.init_vbo(gl,length);
//        console.log(Axes.src_shader_vert);
//        console.log(Axes.src_shader_frag);
	}
	init_vbo(gl,l)
	{
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

		const vertices = new Float32Array([
			0,0,0, 1,0,0,
			l,0,0, 1,0,0,
			0,0,0, 0,1,0,
			0,l,0, 0,1,0,
			0,0,0, 0,0,1,
			0,0,l, 0,0,1,
		]);
		const vbo = gl.createBuffer();  
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		const SZ = vertices.BYTES_PER_ELEMENT;

        gl.vertexAttribPointer(Axes.loc_aPosition, 3, gl.FLOAT, false, SZ*6, 0);
        gl.enableVertexAttribArray(Axes.loc_aPosition);

        gl.vertexAttribPointer(Axes.loc_aColor, 3, gl.FLOAT, false, SZ*6, SZ*3);
        gl.enableVertexAttribArray(Axes.loc_aColor);

//		this.attribs = [];
//
//		this.attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
//		this.attribs["aColor"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

        gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	set_uniform_matrices(gl, h_prog, V, P)
	{
        mat4.copy(this.MVP, P);
        mat4.multiply(this.MVP, this.MVP, V);
        gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, this.MVP);
//		this.MVP.set(P);
//		this.MVP.multiply(V);
//		gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, this.MVP.elements);
	}
	render(gl, V, P)
	{
		gl.useProgram(Axes.shader.h_prog);
        gl.bindVertexArray(this.vao);
		this.set_uniform_matrices(gl, Axes.shader.h_prog, V, P);
//		for(var attrib_name in this.attribs)
//		{
//			var attrib = this.attribs[attrib_name];
//			gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
//			gl.vertexAttribPointer(Axes.shader.attribs[attrib_name], attrib.size, attrib.type, 
//				attrib.normalized, attrib.stride, attrib.offset);
//			gl.bindBuffer(gl.ARRAY_BUFFER, null);
//			gl.enableVertexAttribArray(Axes.shader.attribs[attrib_name]);
//		}
		gl.drawArrays(gl.LINES, 0, 6);
//		for(var attrib_name in this.attribs)
//		{
//			gl.disableVertexAttribArray(Axes.shader.attribs[attrib_name]);
//		}
        gl.bindVertexArray(null);
		gl.useProgram(null);
	}
}
Axes.loc_aPosition = 5;
Axes.loc_aColor = 9;

Axes.src_shader_vert = 
`#version 300 es
layout(location=${Axes.loc_aPosition}) in vec4 aPosition;
layout(location=${Axes.loc_aColor}) in vec4 aColor;
uniform mat4 MVP;
out vec4 vColor;
void main()
{
    gl_Position = MVP * aPosition;
    vColor = aColor;
}
`;
Axes.src_shader_frag = 
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

Axes.shader = null;

