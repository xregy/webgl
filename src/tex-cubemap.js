"use strict"
function main()
{
	let canvas = document.getElementById('webgl');
	let gl = getWebGLContext(canvas);

	gl.cullFace(gl.BACK);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	let shader_room = new Shader(gl,
		document.getElementById("vert-room").text,
		document.getElementById("frag-room").text,
		["aPosition"]);

	let shader_cubemap = new Shader(gl,
		document.getElementById("vert-cubemap").text,
		document.getElementById("frag-cubemap").text,
		["aPosition", "aNormal"]);

	let room = create_mesh_room_cubemap(gl);
	room.M.setScale(2.0, 2.0, 2.0);

	let monkey = new Mesh(gl);
	monkey.init_from_json_js(gl, __js_monkey_sub2_smooth);

	gl.clearColor(0.5, 0.5, 0.5, 1.0);

	let P = new Matrix4();
	P.setPerspective(30, 1, 1, 20);
	let V = new Matrix4();
	V.translate(0, 0, -10);

	let tex_cubemap;
	const TEX_UNIT = 3;
	gl.activeTexture(gl.TEXTURE0 + TEX_UNIT);

	gl.useProgram(shader_room.h_prog);
	gl.uniform1i(gl.getUniformLocation(shader_room.h_prog, "sampler_cubemap"), TEX_UNIT);
	gl.useProgram(shader_cubemap.h_prog);
	gl.uniform1i(gl.getUniformLocation(shader_cubemap.h_prog, "sampler_cubemap"), TEX_UNIT);

	let img_cubemap =
	{
		posx:new Image(),
		negx:new Image(),
		posy:new Image(),
		negy:new Image(),
		posz:new Image(),
		negz:new Image(),
	};

	const	TOTAL_IMAGES = 6;
	let	images_loaded = 0;

	let tick_init = function() {
		if(images_loaded == TOTAL_IMAGES)
		{
			tex_cubemap = new TextureCubemap(gl, img_cubemap);
			requestAnimationFrame(tick, canvas); // Request that the browser calls tick
		}
		else
		{
			requestAnimationFrame(tick_init, canvas); // Request that the browser calls tick
		}
	};


	let t_last = Date.now();
	const ANGLE_STEP = 45;

	let tick = function() {
		let now = Date.now();
		let elapsed = now - t_last;
		t_last = now;

		monkey.M.rotate(( (ANGLE_STEP * elapsed) / 1000.0) % 360.0, 0, 1, 0);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		room.render(gl, shader_room, null, null, V, P);
		monkey.render(gl, shader_cubemap, null, null, V, P);
		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};

	for(let face of ["posx", "negx", "posy", "negy", "posz", "negz"])
	{
		img_cubemap[face].onload = function() { images_loaded++; };
		img_cubemap[face].src = "../resources/SwedishRoyalCastle/" + face + ".jpg";
	}
	
	tick_init();

}


function create_mesh_room_cubemap(gl)
{
	// Create a cube
	//    v6----- v5
	//   /|      /|
	//  v1------v0|
	//  | |     | |
	//  | |v7---|-|v4
	//  |/      |/
	//  v2------v3
	var verts = new Float32Array([
	// Note the triangles are facing inside.
		 1, 1, 1,	// v0
		 1,-1,-1,	// v4
		 1,-1, 1,	// v3
		
		 1, 1, 1,	// v0
		 1, 1,-1,	// v5
		 1,-1,-1,	// v4
		
		 1, 1, 1,	// v0
		-1, 1,-1,	// v6
		 1, 1,-1,	// v5
		
		 1, 1, 1,	// v0
		-1, 1, 1,	// v1
		-1, 1,-1,	// v6
		
		 1, 1, 1,	// v0
		-1,-1, 1,	// v2
		-1, 1, 1,	// v1
		
		 1, 1, 1,	// v0
		 1,-1, 1,	// v3
		-1,-1, 1,	// v2
		
		-1,-1,-1,	// v7
		-1, 1, 1,	// v1
		-1,-1, 1,	// v2
		
		-1,-1,-1,	// v7
		-1, 1,-1,	// v6
		-1, 1, 1,	// v1
		
		-1,-1,-1,	// v7
		 1, 1,-1,	// v5
		-1, 1,-1,	// v6
		
		-1,-1,-1,	// v7
		 1,-1,-1,	// v4
		 1, 1,-1,	// v5
		
		-1,-1,-1,	// v7
		 1,-1, 1,	// v3
		 1,-1,-1,	// v4
		
		-1,-1,-1,	// v7
		-1,-1, 1,	// v2
		 1,-1, 1,	// v3
	]);
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
	var attribs = [];
	attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return new Mesh(gl, "drawArrays", gl.TRIANGLES, 36, attribs, -1, null);
}




