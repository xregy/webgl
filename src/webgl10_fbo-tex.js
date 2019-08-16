"use strict";

function init_shader(gl, src_vert, src_frag, attrib_names)
{
	initShaders(gl, src_vert, src_frag);
	let h_prog = gl.program;
	var	attribs = {};
	for(let attrib of attrib_names)
	{
		attribs[attrib] = gl.getAttribLocation(h_prog, attrib);
	}
	return {h_prog:h_prog, attribs:attribs};
}


function main()
{
	let canvas = document.getElementById('webgl');
	let gl = getWebGLContext(canvas);
	
	const FBO_WIDTH = 256;
	const FBO_HEIGHT = 256;
	
	let triangles = init_triangles(gl);
	let quad = init_quad(gl);
	let fbo = init_fbo(gl, FBO_WIDTH, FBO_HEIGHT);
	
	gl.enable(gl.DEPTH_TEST);
	
	let MVP = new Matrix4();
	MVP.setOrtho(-1,1,-1,1,-1,1);
	
	let shader_simple = init_shader(gl,
		document.getElementById("shader-vert-simple").text,
		document.getElementById("shader-frag-simple").text,
		["aPosition", "aColor"]);
	
	let shader_tex = init_shader(gl,
		document.getElementById("shader-vert-tex").text,
		document.getElementById("shader-frag-tex").text,
		["aPosition", "aTexcoord"]);
	
	shader_simple.set_uniforms = function(gl) {
			gl.uniformMatrix4fv(gl.getUniformLocation(this.h_prog, "MVP"), false, MVP.elements);
	    }
	shader_tex.set_uniforms = function(gl) {
			gl.uniform1i(gl.getUniformLocation(this.h_prog, "tex"), fbo.tex);
	    }

	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);	// from now on, we render to the FBO
	gl.viewport(0, 0, FBO_WIDTH, FBO_HEIGHT);
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	render_object(gl, shader_simple, triangles);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);	// From now on, we render to the canvas

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(.5, .5, .5, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.bindTexture(gl.TEXTURE_2D, fbo.tex);
	render_object(gl, shader_tex, quad);

}

function render_object(gl, shader, object)
{
	gl.useProgram(shader.h_prog);
	shader.set_uniforms(gl);

	for(let attrib_name in shader.attribs)
	{
		let attrib = object.attribs[attrib_name];
		gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
		gl.vertexAttribPointer(shader.attribs[attrib_name], attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.enableVertexAttribArray(shader.attribs[attrib_name]);
	}
	if(object.drawcall == "drawArrays")
	{
		gl.drawArrays(object.type, 0, object.n);
	}
	else if(object.drawcall == "drawElements")
	{
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.buf_index);
		gl.drawElements(object.type, object.n, object.type_index, 0);
	}
	for(let attrib_name in shader.attribs)
	{
		gl.disableVertexAttribArray(shader.attribs[attrib_name]);
	}
	gl.useProgram(null);
}

function init_triangles(gl)
{
	let verts = new Float32Array([
		 -0.50, -0.50,  0.1, 0, 0, 1 ,
		  0.90, -0.50,  0.1, 0, 0, 1 ,
		  0.20,  0.90,  0.1, 0, 0, 1 ,

		 -0.70, -0.70,  0.0, 0, 1, 0 ,
		  0.70, -0.70,  0.0, 0, 1, 0 ,
		  0.00,  0.70,  0.0, 0, 1, 0 ,

		 -0.90, -0.90, -0.1, 1, 0, 0 ,
		  0.50, -0.90, -0.1, 1, 0, 0 ,
		 -0.20,  0.50, -0.1, 1, 0, 0 ,
	]);

	let buf = gl.createBuffer();
    
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	let FSIZE = verts.BYTES_PER_ELEMENT;
	let attribs = [];
	attribs["aPosition"] = {buffer:buf, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs["aColor"] = {buffer:buf, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return {n:9, drawcall:"drawArrays", type:gl.TRIANGLES, attribs:attribs};
}

function init_quad(gl)
{
	let verts = new Float32Array([
		 -0.90,  0.00, 0, 0 , 
		  0.00, -0.90, 1, 0 ,
		  0.00,  0.90, 0, 1 ,
		  0.90,  0.00, 1, 1 ,
	]);
	let buf = gl.createBuffer();
    
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	let FSIZE = verts.BYTES_PER_ELEMENT;
	let attribs = [];
	attribs["aPosition"] = {buffer:buf, size:2, type:gl.FLOAT, normalized:false, stride:FSIZE*4, offset:0};
	attribs["aTexcoord"] = {buffer:buf, size:2, type:gl.FLOAT, normalized:false, stride:FSIZE*4, offset:FSIZE*2};

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return {n:4, drawcall:"drawArrays", type:gl.TRIANGLE_STRIP, attribs:attribs};
}


function init_fbo(gl, width, height)
{
	let fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

	let tex_color = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex_color);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.bindTexture(gl.TEXTURE_2D, null); // Just to verify that the texture needs not be bound to be attached to a FBO
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex_color, 0);

	let rbo_depth = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, rbo_depth);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);	// Just to verify that the RBO needs not be bound to be attached to a FBO
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo_depth);

	return {fbo:fbo, tex:tex_color, rbo:rbo_depth};
}
