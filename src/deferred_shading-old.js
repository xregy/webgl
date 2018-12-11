"use strict"
function init_shader(gl, src_vert, src_frag, attrib_names)
{
	initShaders(gl, src_vert, src_frag);
	let h_prog = gl.program;
	let attribs = {};
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
    let ext = gl.getExtension('WEBGL_draw_buffers');
	if(ext == null)
	{
		console.log('WEBGL_draw_buffers extension not supported.');
		return;
	}

    
    const FBO_WIDTH = canvas.width/2;
    const FBO_HEIGHT = canvas.height/2;

    let quad = init_quad(gl);
    let fbo = init_fbo(gl, ext, FBO_HEIGHT, FBO_HEIGHT);

    gl.enable(gl.DEPTH_TEST);

	let	P = new Matrix4();
	let	V = new Matrix4();
	let	MVP;
	let	MV;
	let	N;
    let tex_unit_position = 3;
    let tex_unit_normal = 2;
    let tex_unit_diffuse = 1;

	P.setPerspective(50, 1, 1, 20); 
	V.setLookAt(0,3,7,0,0,0,0,1,0);

    let shader_preproc = init_shader(gl,
        document.getElementById("shader-vert-preproc").text,
        document.getElementById("shader-frag-preproc").text,
        ["aPosition", "aNormal"]);

	let shader_shading = init_shader(gl,
        document.getElementById("vert-Phong-Phong").text,
        document.getElementById("frag-Phong-Phong").text,
        ["aPosition", "aTexcoord"]);

	let shader_tex = init_shader(gl,
        document.getElementById("vert-tex").text,
        document.getElementById("frag-tex").text,
        ["aPosition", "aTexcoord"]);


    shader_preproc.set_uniforms = function(gl) {
            gl.uniformMatrix4fv(gl.getUniformLocation(this.h_prog, "MVP"), false, MVP.elements);
            gl.uniformMatrix4fv(gl.getUniformLocation(this.h_prog, "MV"), false, MV.elements);
            gl.uniformMatrix4fv(gl.getUniformLocation(this.h_prog, "N"), false, N.elements);
            gl.uniform4fv(gl.getUniformLocation(this.h_prog, "diffuse"), diffuse.elements);
        }

    shader_shading.set_uniforms = function(gl) {
            gl.uniform1i(gl.getUniformLocation(this.h_prog, "tex_position"), tex_unit_position);
            gl.uniform1i(gl.getUniformLocation(this.h_prog, "tex_normal"), tex_unit_normal);
            gl.uniform1i(gl.getUniformLocation(this.h_prog, "tex_diffuse"), tex_unit_diffuse);
            let light_position = V.multiplyVector4(new Vector4([1,1,1,0]));
            gl.uniform4fv(gl.getUniformLocation(this.h_prog, "light_position"), light_position.elements);
        }

	shader_tex.set_uniforms = function(gl) {
            gl.uniform1i(gl.getUniformLocation(this.h_prog, "tex"), 0);
        }
	

	let	monkey = parse_json(gl, __js_monkey_sub2_smooth);
//	let	torus = parse_json(gl, __js_torus);
	let	sphere = parse_json(gl, __js_sphere);

	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
	ext.drawBuffersWEBGL([
			ext.COLOR_ATTACHMENT0_WEBGL, 
			ext.COLOR_ATTACHMENT1_WEBGL, 
			ext.COLOR_ATTACHMENT2_WEBGL, 
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
	let	diffuse = new Vector4([1,0,0,1]);
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

	gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fbo.color[0]);
	render_object(gl, shader_tex, quad);

	gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fbo.color[1]);
	render_object(gl, shader_tex, quad);

	gl.viewport(0, 0, canvas.width/2, canvas.height/2);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fbo.color[2]);
	render_object(gl, shader_tex, quad);

//	console.log(V);
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
	shader.set_uniforms(gl);

	for(let attrib_name in object.attribs)
	{
		let	attrib = object.attribs[attrib_name];
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

	for(let attrib_name in object.attribs)
	{
		gl.disableVertexAttribArray(shader.attribs[attrib_name]);
	}

    gl.useProgram(null);
}


function init_quad(gl)
{
    let verts = new Float32Array([
		 -1, -1, 0, 0 , 
		  1, -1, 1, 0 ,
		  1,  1, 1, 1 ,
		 -1,  1, 0, 1 ,
          ]);
    let buf = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	let FSIZE = verts.BYTES_PER_ELEMENT;
	let	attribs = [];
	attribs["aPosition"] = {buffer:buf, size:2, type:gl.FLOAT, normalized:false, stride:FSIZE*4, offset:0};
	attribs["aTexcoord"] = {buffer:buf, size:2, type:gl.FLOAT, normalized:false, stride:FSIZE*4, offset:FSIZE*2};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return {n:4, drawcall:"drawArrays", type:gl.TRIANGLE_FAN, attribs:attribs};

}

function get_framebuffer_status(gl)
{
    let	status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(status == gl.FRAMEBUFFER_COMPLETE)	return 'FRAMEBUFFER_COMPLETE';
    else if(status == gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT) return 'gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT';
    else if(status == gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT) return 'gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT';
    else if(status == gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS) return 'gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS';
    else if(status == gl.FRAMEBUFFER_UNSUPPORTED) return 'gl.FRAMEBUFFER_UNSUPPORTED';
}


function init_fbo(gl, ext, fbo_width, fbo_height)
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
	gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT1_WEBGL, gl.TEXTURE_2D, tex_color1, 0);

	let tex_color2 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex_color2);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fbo_width, fbo_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT2_WEBGL, gl.TEXTURE_2D, tex_color2, 0);

	let rbo_depth = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, rbo_depth);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fbo_width, fbo_height);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo_depth);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {fbo:fbo, color:[tex_color0, tex_color1, tex_color2], depth:rbo_depth};
}
function parse_json(gl, obj)
{
	let	attributes = obj.data.attributes;

	let	buf_position = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes.position.array), gl.STATIC_DRAW);

	let	buf_normal = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes.normal.array), gl.STATIC_DRAW);

	let	buf_index = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.data.index.array), gl.STATIC_DRAW);

	let	attribs = [];
	attribs["aPosition"] = {buffer:buf_position, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	attribs["aNormal"] = {buffer:buf_normal, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};

    return {n:obj.data.index.array.length, drawcall:"drawElements", buf_index:buf_index, type_index:gl.UNSIGNED_SHORT, type:gl.TRIANGLES, attribs:attribs};
}


