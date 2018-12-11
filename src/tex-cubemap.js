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

	let tex_cubemap = gl.createTexture();
	const TEX_UNIT = 3;
	gl.activeTexture(gl.TEXTURE0 + TEX_UNIT);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex_cubemap);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	let img_cubemap =
	{
		posx:{image:new Image(), target:gl.TEXTURE_CUBE_MAP_POSITIVE_X},
		negx:{image:new Image(), target:gl.TEXTURE_CUBE_MAP_NEGATIVE_X},
		posy:{image:new Image(), target:gl.TEXTURE_CUBE_MAP_POSITIVE_Y},
		negy:{image:new Image(), target:gl.TEXTURE_CUBE_MAP_NEGATIVE_Y},
		posz:{image:new Image(), target:gl.TEXTURE_CUBE_MAP_POSITIVE_Z},
		negz:{image:new Image(), target:gl.TEXTURE_CUBE_MAP_NEGATIVE_Z},
	};
	let faces = ["posx", "negx", "posy", "negy", "posz", "negz"];

	const	TOTAL_IMAGES = 6;
	let	images_loaded = 0;

	let tick_init = function() {
		if(images_loaded == TOTAL_IMAGES)
		{
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

		gl.useProgram(shader_room.h_prog);
		gl.uniform1i(gl.getUniformLocation(shader_room.h_prog, "sampler_cubemap"), TEX_UNIT);
		room.render(gl, shader_room, null, null, V, P);

		gl.useProgram(shader_cubemap.h_prog);
		gl.uniform1i(gl.getUniformLocation(shader_cubemap.h_prog, "sampler_cubemap"), TEX_UNIT);
		monkey.render(gl, shader_cubemap, null, null, V, P);

		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};

	for(let face of faces)
	{
		img_cubemap[face].image.onload = function()
		{
			gl.texImage2D(img_cubemap[face].target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_cubemap[face].image);
			images_loaded++;
		};
	}

	for(let face of faces)
	{
		img_cubemap[face].image.src = "../resources/SwedishRoyalCastle/" + face + ".jpg";
	}
	
	tick_init();

}


function render_object(gl, shader, object)
{
	gl.useProgram(shader.h_prog);
	shader.set_uniforms(gl);

	for(let attrib_name in shader.attribs)
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


function init_tex_cubemap_face(gl, tex, img)
{
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




