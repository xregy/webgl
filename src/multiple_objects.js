"use strict";
const loc_aPosition = 4;
const loc_aColor = 8;
const src_vert = `#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
out vec4 vColor;
uniform	mat4 uMVP;
void main()
{
	gl_Position = uMVP*aPosition;
	vColor = aColor;
}`;
const src_frag = `#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 fColor;
void main()
{
	fColor = vColor;
}`;

function init_shader(gl, src_vert, src_frag, uniform_vars)
{
    initShaders(gl, src_vert, src_frag);
    let shader = {}
    shader.h_prog = gl.program;
    shader.loc_uniforms = {}
    for(let uniform of uniform_vars)
    {
        shader.loc_uniforms[uniform] = gl.getUniformLocation(shader.h_prog, uniform);
    }
    return shader;
}

function main()
{
	var canvas = document.getElementById('webgl');
	var gl = canvas.getContext("webgl2");

	let shader = init_shader(gl, src_vert, src_frag, ["uMVP"]);
	var MVP = new Matrix4();
	shader.set_uniforms = function(gl)
	{
		gl.uniformMatrix4fv(shader.loc_uniforms["uMVP"], false, MVP.elements);
	}
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	
	var objs = [];
	for(var i=3 ; i<=6 ; i++) objs.push(init_vbo_polygon(gl, i));
	
	var positions = [	[-.5,-.5], [.5,-.5], [.5,.5], [-.5,.5]	];
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	for(var i=0 ; i<4 ; i++)
	{
		MVP.setTranslate(positions[i][0], positions[i][1], 0);
		draw_obj(gl, shader, objs[i]);
	}
}

function draw_obj(gl, shader, obj)
{
	gl.useProgram(shader.h_prog);
    gl.bindVertexArray(obj.vao);
	shader.set_uniforms(gl);

	gl.drawArrays(obj.type, 0, obj.n);

    gl.bindVertexArray(null);
	gl.useProgram(null);
}

function init_vbo_polygon(gl, n)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

	var STRIDE = 2+3;
	var RADIUS = 0.4;
	var attribs = new Float32Array((n+2)*STRIDE);

	attribs[0] = 0;
	attribs[1] = 0;
	attribs[2] = 1;
	attribs[3] = 1;
	attribs[4] = 1;
	for(var i=0 ; i<=n ; i++)
	{
		attribs[(i+1)*STRIDE + 0] = RADIUS*Math.cos(i*2*Math.PI/n);
		attribs[(i+1)*STRIDE + 1] = RADIUS*Math.sin(i*2*Math.PI/n);
		attribs[(i+1)*STRIDE + 2] = Math.cos(i*2*Math.PI/n);
		attribs[(i+1)*STRIDE + 3] = Math.sin(i*2*Math.PI/n);
		attribs[(i+1)*STRIDE + 4] = 1;
	}

	var vbo = gl.createBuffer();
    
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, attribs, gl.STATIC_DRAW);
	
	var SZ = attribs.BYTES_PER_ELEMENT;

	gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, SZ*5, 0);
	gl.enableVertexAttribArray(loc_aPosition);

	gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, SZ*5, SZ*2);
	gl.enableVertexAttribArray(loc_aColor);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return {vao:vao, type:gl.TRIANGLE_FAN, n:n+2};
}
