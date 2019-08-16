"use strict"

function main()
{
	let canvas = document.getElementById('webgl');
	let gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.5, 0.5, 0.5, 1.0);

	let V = new Matrix4();
	V.setLookAt(3, 2, 3, 0, 0, 0, 0, 1, 0);

	let P = new Matrix4();
	P.setPerspective(60, 1, 1, 100); 

	let light = new Light(gl,
		[0, .5, .5, 1], 
		[0.2, 0.2, 0.2, 1.0], 
		[1.0, 1.0, 1.0, 1.0], 
		[1.0, 1.0, 1.0, 1.0],
		true
	);

	let shader = new Shader(gl,
						document.getElementById("vert-Phong-Phong").text,
						document.getElementById("frag-Phong-Phong").text,
						["aPosition", "aNormal"]);

	let quad = create_mesh_quad(gl);
	let axes = new Axes(gl);


	let t_last = Date.now();
	const ANGLE_STEP = 30.0;

	var tick = function() {
		let now = Date.now();
		let elapsed = now - t_last;
		t_last = now;

		quad.M.rotate((ANGLE_STEP * elapsed) / 1000.0, 0, 1, 0);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		axes.render(gl, V, P);

		light.render(gl, V, P);

		gl.useProgram(shader.h_prog);

		set_uniform_material(gl, shader.h_prog, "material_front", __js_materials["gold"]);
		set_uniform_material(gl, shader.h_prog, "material_back", __js_materials["silver"]);

		quad.render(gl, shader, [light], null, V, P);

		gl.useProgram(null);
	
		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick();
}

function set_uniform_material(gl, h_prog, vname, mat)
{
	gl.uniform3fv(gl.getUniformLocation(h_prog, vname + ".ambient"), mat.ambient.elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, vname + ".diffuse"), mat.diffusive.elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, vname + ".specular"), mat.specular.elements);
	gl.uniform1f(gl.getUniformLocation(h_prog, vname + ".shininess"), mat.shininess*128.0);
}


function create_mesh_quad(gl)
{
	let verts = new Float32Array([
		-1,-1, 0,    0, 0, 1,
		 1,-1, 0,    0, 0, 1,
		 1, 1, 0,    0, 0, 1,
		-1, 1, 0,    0, 0, 1,
	]);
	
	let vbo = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	let FSIZE = verts.BYTES_PER_ELEMENT;
	let	attribs = [];
	attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs["aNormal"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return new Mesh(gl, "drawArrays", gl.TRIANGLE_FAN, 4, attribs, -1, null);
}



