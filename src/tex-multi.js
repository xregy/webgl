"use strict";
const loc_aPosition = 3;
const loc_aTexCoord0 = 5;
const loc_aTexCoord1 = 6;
const SRC_VERT_SHADER = 
`#version 300 es
layout(location=${loc_aPosition}) in vec2 aPosition;
layout(location=${loc_aTexCoord0}) in vec2 aTexCoord0;
layout(location=${loc_aTexCoord1}) in vec2 aTexCoord1;
out vec2 vTexCoord0;
out vec2 vTexCoord1;
uniform mat4 MVP;
void main()
{
    gl_Position = MVP * vec4(aPosition, 0, 1);
    vTexCoord0 = aTexCoord0;
    vTexCoord1 = aTexCoord1;
}
`;

const SRC_FRAG_SHADER =
`#version 300 es
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
in vec2 vTexCoord0;
in vec2 vTexCoord1;
out vec4 fColor;
void main()
{
    vec4 color0 = texture(uSampler0, vTexCoord0);
    vec4 color1 = texture(uSampler1, vTexCoord1);
    fColor = mix(color0, color1, 0.5);
}
`;

function main()
{
	let canvas = document.getElementById('webgl');
	let gl = canvas.getContext('webgl2');

	let shader = 
    {
        h_prog:init_shader(gl, SRC_VERT_SHADER, SRC_FRAG_SHADER)
    };
	let obj = initVBO(gl);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	let textures = [{texture:null, unit:3, image:new Image(), loaded:false},
					{texture:null, unit:5, image:new Image(), loaded:false}];

	let MVP = new Matrix4();

	let tick_init = function() {
		if(textures[0].loaded && textures[1].loaded)
		{
			requestAnimationFrame(tick, canvas); // Request that the browser calls tick
		}
		else
		{
			requestAnimationFrame(tick_init, canvas); // Request that the browser calls tick
		}
	};

	shader.set_uniforms = function(gl) 
	{
		for(let i in textures)
		{
			gl.activeTexture(gl.TEXTURE0 + textures[i].unit);
			gl.bindTexture(gl.TEXTURE_2D, textures[i].texture);
			gl.uniform1i(gl.getUniformLocation(shader.h_prog, "uSampler" + i), textures[i].unit);
		}
		gl.uniformMatrix4fv(gl.getUniformLocation(shader.h_prog, "MVP"), false, MVP.elements);
	};

	let t_last = Date.now();
	const ANGLE_STEP = 45;

	let tick = function() {
		let now = Date.now();
		let elapsed = now - t_last;
		t_last = now;

		MVP.rotate(( (ANGLE_STEP * elapsed) / 1000.0) % 360.0, 0, 0, 1);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		render_object(gl, shader, obj);
		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};

	for(let tex of textures)
	{
		tex.image.onload = function()
		{
			init_texture(gl, tex);
			tex.loaded = true;
		};
	}
	textures[0].image.src = '../resources/sky.jpg';
	textures[1].image.src = '../resources/circle.gif';

	tick_init();

}

function init_shader(gl, src_vert, src_frag)
{
	initShaders(gl, src_vert, src_frag);
	let h_prog = gl.program;
	return h_prog;
}


function render_object(gl, shader, object)
{
    gl.useProgram(shader.h_prog);
    shader.set_uniforms(gl);
    gl.bindVertexArray(object.vao);
    
    if(object.drawcall == "drawArrays") gl.drawArrays(object.type, 0, object.n);
    else if(object.drawcall == "drawElements") gl.drawElements(object.type, object.n, object.type_index, 0);
    
    gl.bindVertexArray(null);
    gl.useProgram(null);
}


function initVBO(gl)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    let verts = new Float32Array([
    	-0.5,  0.5,   0, 1,  -1,  2,
    	-0.5, -0.5,   0, 0,  -1, -1,
    	 0.5,  0.5,   1, 1,   2,  2,
    	 0.5, -0.5,   1, 0,   2, -1
    ]);
    let buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    let SZ = verts.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, SZ*6, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aTexCoord0, 2, gl.FLOAT, false, SZ*6, SZ*2);
    gl.enableVertexAttribArray(loc_aTexCoord0);
    
    gl.vertexAttribPointer(loc_aTexCoord1, 2, gl.FLOAT, false, SZ*6, SZ*4);
    gl.enableVertexAttribArray(loc_aTexCoord1);
    
    gl.bindVertexArray(null);
    
    return {vao:vao, n:4, drawcall:"drawArrays", type:gl.TRIANGLE_STRIP};
}


function init_texture(gl, tex)
{
	tex.texture = gl.createTexture(); 
	gl.bindTexture(gl.TEXTURE_2D, tex.texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
	return true;
}


