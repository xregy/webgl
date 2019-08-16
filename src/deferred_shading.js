"use strict";

function init_shader(gl, src_vert, src_frag)
{
	initShaders(gl, src_vert, src_frag);
	return gl.program;
}

function main() 
{
	let canvas = document.getElementById('webgl');
	let gl = canvas.getContext("webgl2");

	const FBO_WIDTH = canvas.width/2;
	const FBO_HEIGHT = canvas.height/2;

	let quad = init_quad(gl);
	let fbo = init_fbo(gl, FBO_HEIGHT, FBO_HEIGHT);

	gl.enable(gl.DEPTH_TEST);

	let	P = new Matrix4();
	let	V = new Matrix4();
	let	MVP;
	let	MV;
	let	N;

	const tex_unit_position = 3;
	const tex_unit_normal = 2;
	const tex_unit_diffuse = 1;

	P.setPerspective(50, 1, 1, 20); 
	V.setLookAt(0,3,7,0,0,0,0,1,0);

	let shader_preproc = {h_prog:init_shader(gl,
		document.getElementById("shader-vert-preproc").text,
		document.getElementById("shader-frag-preproc").text)};

	let shader_shading = {h_prog:init_shader(gl,
		document.getElementById("vert-Phong-Phong").text,
		document.getElementById("frag-Phong-Phong").text)};

	let shader_tex = {h_prog:init_shader(gl,
		document.getElementById("vert-tex").text,
		document.getElementById("frag-tex").text)};

	shader_preproc.set_uniforms = function(gl) {
			gl.uniformMatrix4fv(gl.getUniformLocation(this.h_prog, "MVP"), false, MVP.elements);
			gl.uniformMatrix4fv(gl.getUniformLocation(this.h_prog, "MV"), false, MV.elements);
			gl.uniformMatrix4fv(gl.getUniformLocation(this.h_prog, "N"), false, N.elements);
			gl.uniform4fv(gl.getUniformLocation(this.h_prog, "diffuse"), diffuse.elements);
	};

	shader_shading.set_uniforms = function(gl) {
			gl.uniform1i(gl.getUniformLocation(this.h_prog, "tex_position"), tex_unit_position);
			gl.uniform1i(gl.getUniformLocation(this.h_prog, "tex_normal"), tex_unit_normal);
			gl.uniform1i(gl.getUniformLocation(this.h_prog, "tex_diffuse"), tex_unit_diffuse);
			let light_position = V.multiplyVector4(new Vector4([1,1,1,0]));
			gl.uniform4fv(gl.getUniformLocation(this.h_prog, "light_position"), light_position.elements);
	};

	shader_tex.set_uniforms = function(gl) {
		gl.uniform1i(gl.getUniformLocation(this.h_prog, "tex"), 0);
	};
	

	let	monkey = parse_json(gl, __js_monkey_sub2_smooth);
	let	sphere = parse_json(gl, __js_sphere);

	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
	gl.drawBuffers([
			gl.COLOR_ATTACHMENT0, 
			gl.COLOR_ATTACHMENT1, 
			gl.COLOR_ATTACHMENT2, 
			]);
	gl.viewport(0, 0, FBO_HEIGHT, FBO_HEIGHT);
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	MV = new Matrix4(V);
	MV.translate(-1.5,0,0);
	N = new Matrix4();
	N.setInverseOf(MV);
	N.transpose();
	MVP = new Matrix4(P);
	MVP.multiply(MV);
	let diffuse = new Vector4([1,0,0,1]);
	render_object(gl, shader_preproc, monkey);
	
	MV = new Matrix4(V);
	MV.translate(1.5,0,0);
	N = new Matrix4();
	N.setInverseOf(MV);
	N.transpose();
	MVP = new Matrix4(P);
	MVP.multiply(MV);
	diffuse = new Vector4([0,0,1,1]);
	render_object(gl, shader_preproc, sphere);
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// upper left quad
	gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fbo.color[0]);
	render_object(gl, shader_tex, quad);

	// upper right quad
	gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fbo.color[1]);
	render_object(gl, shader_tex, quad);

	// lower left quad
	gl.viewport(0, 0, canvas.width/2, canvas.height/2);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fbo.color[2]);
	render_object(gl, shader_tex, quad);

	// lower right quad
	gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2);
	gl.activeTexture(gl.TEXTURE0 + tex_unit_position);
	gl.bindTexture(gl.TEXTURE_2D, fbo.color[0]);
	gl.activeTexture(gl.TEXTURE0 + tex_unit_normal);
	gl.bindTexture(gl.TEXTURE_2D, fbo.color[1]);
	gl.activeTexture(gl.TEXTURE0 + tex_unit_diffuse);
	gl.bindTexture(gl.TEXTURE_2D, fbo.color[2]);
	render_object(gl, shader_shading, quad);
}


function render_object(gl, shader, object)
{
	gl.useProgram(shader.h_prog);
    gl.bindVertexArray(object.vao);
	shader.set_uniforms(gl);

	if(object.drawcall == "drawArrays") gl.drawArrays(object.type, 0, object.n);
	else if(object.drawcall == "drawElements") gl.drawElements(object.type, object.n, object.type_index, 0);

    gl.bindVertexArray(null);
	gl.useProgram(null);
}


function init_quad(gl)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

	let verts = new Float32Array([
		 -1, -1, 0, 0 , 
		  1, -1, 1, 0 ,
		  1,  1, 1, 1 ,
		 -1,  1, 0, 1 ,
	]);
	let buf = gl.createBuffer();
    
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	let SZ = verts.BYTES_PER_ELEMENT;

    let loc_aPosition = 6;
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, SZ*4, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    let loc_aTexCoord = 9;
    gl.vertexAttribPointer(loc_aTexCoord, 2, gl.FLOAT, false, SZ*4, SZ*2);
    gl.enableVertexAttribArray(loc_aTexCoord);

    gl.bindVertexArray(null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return {vao:vao, n:4, drawcall:"drawArrays", type:gl.TRIANGLE_FAN};
}

function init_fbo(gl, fbo_width, fbo_height)
{
	let fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

	let tex_color0 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex_color0);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fbo_width, fbo_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex_color0, 0);


	let tex_color1 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex_color1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fbo_width, fbo_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, tex_color1, 0);

	let tex_color2 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex_color2);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fbo_width, fbo_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, tex_color2, 0);

	let rbo_depth = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, rbo_depth);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fbo_width, fbo_height);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo_depth);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	return {fbo:fbo, color:[tex_color0, tex_color1, tex_color2], depth:rbo_depth};
}
function parse_json(gl, obj)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

	let	attributes = obj.data.attributes;

	let	buf_position = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes.position.array), gl.STATIC_DRAW);
    let loc_aPosition = 3;
    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);


	let	buf_normal = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes.normal.array), gl.STATIC_DRAW);
    let loc_aNormal = 7;
    gl.vertexAttribPointer(loc_aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aNormal);


	let	buf_index = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.data.index.array), gl.STATIC_DRAW);

    gl.bindVertexArray(null);

	return {vao:vao, n:obj.data.index.array.length, drawcall:"drawElements", buf_index:buf_index, type_index:gl.UNSIGNED_SHORT, type:gl.TRIANGLES};
}


