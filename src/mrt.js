"use strict"
function init_shader(gl, src_vert, src_frag)
{
	initShaders(gl, src_vert, src_frag);
	return gl.program;
}

function main()
{
	let canvas = document.getElementById('webgl');
	let gl = canvas.getContext("webgl2");
	
	const FBO_WIDTH = 256;
	const FBO_HEIGHT = 256;
	
	let triangles = init_triangles(gl);
	let quad = init_quad(gl);
	let fbo = init_fbo(gl, FBO_WIDTH, FBO_HEIGHT);
	
	gl.enable(gl.DEPTH_TEST);
	
	let P = new Matrix4();
	P.setOrtho(-1,1,-1,1,-1,1);
	
	let shader_simple = {h_prog:init_shader(gl,
		document.getElementById("shader-vert-simple").text,
		document.getElementById("shader-frag-simple").text)};

//    console.log(shader_simple);
	
	let shader_tex = {h_prog:init_shader(gl,
		document.getElementById("shader-vert-tex").text,
		document.getElementById("shader-frag-tex").text)};
	
	shader_simple.set_uniforms = function(gl) {
		gl.uniformMatrix4fv(gl.getUniformLocation(this.h_prog, "MVP"), false, MVP.elements);
	};

	
	let tex_unit = 3;
	
	shader_tex.set_uniforms = function(gl) {
		gl.uniformMatrix4fv(gl.getUniformLocation(this.h_prog, "MVP"), false, MVP.elements);
		gl.uniform1i(gl.getUniformLocation(this.h_prog, "tex"), tex_unit);
	};
	
	let MVP;
	MVP = new Matrix4(P);
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
	gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
	gl.viewport(0, 0, FBO_WIDTH, FBO_HEIGHT);
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	render_object(gl, shader_simple, triangles);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(.5, .5, .5, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.activeTexture(gl.TEXTURE0 + tex_unit);
	
	MVP = new Matrix4(P);
	MVP.translate(-.5,.5,0);
	gl.bindTexture(gl.TEXTURE_2D, fbo.color[0]);
	render_object(gl, shader_tex, quad);
	
	MVP = new Matrix4(P);
	MVP.translate(.5,-.5,0);
	gl.bindTexture(gl.TEXTURE_2D, fbo.color[1]);
	render_object(gl, shader_tex, quad);
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

function init_triangles(gl)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

	let verts = new Float32Array([
//		          aPosition            aColor0        aColor1
		 -0.50, -0.50,  0.1, 1.0,    0, 0, 1, 1,    1, 1, 0, 1 ,
		  0.90, -0.50,  0.1, 1.0,    0, 0, 1, 1,    1, 1, 0, 1 ,
		  0.20,  0.90,  0.1, 1.0,    0, 0, 1, 1,    1, 1, 0, 1 ,

		 -0.70, -0.70,  0.0, 1.0,    0, 1, 0, 1,    1, 0, 1, 1 ,
		  0.70, -0.70,  0.0, 1.0,    0, 1, 0, 1,    1, 0, 1, 1 ,
		  0.00,  0.70,  0.0, 1.0,    0, 1, 0, 1,    1, 0, 1, 1 ,

		 -0.90, -0.90, -0.1, 1.0,    1, 0, 0, 1,    0, 1, 1, 1 ,
		  0.50, -0.90, -0.1, 1.0,    1, 0, 0, 1,    0, 1, 1, 1 ,
		 -0.20,  0.50, -0.1, 1.0,    1, 0, 0, 1,    0, 1, 1, 1 ,
	]);

	let buf = gl.createBuffer();
    
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	let SZ = verts.BYTES_PER_ELEMENT;

    let loc_aPosition = 3;
    gl.vertexAttribPointer(loc_aPosition, 4, gl.FLOAT, false, SZ*12, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    let loc_aColor0 = 7;
    gl.vertexAttribPointer(loc_aColor0, 4, gl.FLOAT, false, SZ*12, SZ*4);
    gl.enableVertexAttribArray(loc_aColor0);

    let loc_aColor1 = 9;
    gl.vertexAttribPointer(loc_aColor1, 4, gl.FLOAT, false, SZ*12, SZ*8);
    gl.enableVertexAttribArray(loc_aColor1);

    gl.bindVertexArray(null);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return {vao:vao, n:9, drawcall:"drawArrays", type:gl.TRIANGLES};
}

function init_quad(gl)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

	let verts = new Float32Array([
		 -0.45, -0.45, 0, 0 , 
		  0.45, -0.45, 1, 0 ,
		  0.45,  0.45, 1, 1 ,
		 -0.45,  0.45, 0, 1 ,
          ]);
	let buf = gl.createBuffer();
    
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	let SZ = verts.BYTES_PER_ELEMENT;

    let loc_aPosition = 2;
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, SZ*4, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    let loc_aTexCoord = 5;
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

	let rbo_depth = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, rbo_depth);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fbo_width, fbo_height);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo_depth);

	return {fbo:fbo, color:[tex_color0, tex_color1], depth:rbo_depth};
}
