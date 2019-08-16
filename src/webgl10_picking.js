"use strict";
let g_last = Date.now();
let ANGLE_STEP_LIGHT = 30.0;
let ANGLE_STEP_MESH = 30.0;
function main()
{
	let canvas = document.getElementById('webgl');
	let gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.9, 0.9, 0.9, 1.0);

	let V = new Matrix4();
	V.setLookAt(6, 6, 6, 0, 0, 0, 0, 1, 0);

	let P = new Matrix4();
	P.setPerspective(60, 1, 1, 100); 

	let shader = new Shader(gl, 
			document.getElementById("vert-Blinn-Gouraud").text,
			document.getElementById("frag-Blinn-Gouraud").text,
			["aPosition", "aNormal"]);

	let light = new Light
	(
		gl,
		[3, 3, 3, 1.0],
		[0.1, 0.1, 0.1, 1.0],
		[1.0, 1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0, 1.0],
		false
	);
	light.turn_on(true);

	// initializes the meshes
	let id = 0;
	let cube = create_mesh_cube(gl);
	let ball = create_mesh_sphere(gl, 20);
	let monkey = new Mesh(gl);			monkey.init_from_json_js(gl, __js_monkey_smooth);

	monkey.id = ++id;
	cube.id = ++id;
	ball.id = ++id;

	monkey.name = "monkey";
	cube.name = "cube";
	ball.name = "ball";

	let list_meshes = [monkey, cube, ball];	// the order should be consistent

	cube.M.setTranslate(2.5,2.5,0);
	ball.M.setTranslate(2.5,0,2.5);
	monkey.M.setTranslate(0,2.5,2.5);

	let list_materials = {
		"cube":__js_materials["silver"], 
		"ball":__js_materials["copper"],
		"monkey":__js_materials["gold"], 
		};

	canvas.onmousedown = function(ev) 
	{
		let x = ev.clientX, y = ev.clientY;
		let bb = ev.target.getBoundingClientRect();
		if (bb.left <= x && x < bb.right && bb.top <= y && y < bb.bottom)
		{
			let id = get_id(gl, list_meshes, {x:x-bb.left, y:bb.bottom-y}, V, P);
			if(id > 0)
				document.getElementById("output").innerHTML = "The " + list_meshes[id-1].name + " is selected.";
			else
				document.getElementById("output").innerHTML = "Nothing is selected.";
			render_scene(gl, list_meshes, shader, [light], list_materials, V, P);
		}
	}
	let tick = function()
	{
		render_scene(gl, list_meshes, shader, [light], list_materials, V, P);
		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick();
}

function render_scene(gl, meshes, shader, lights, materials, V, P)
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	for(let light of lights)	light.render(gl, V, P);
	for(let mesh of meshes)	mesh.render(gl, shader, lights, materials[mesh.name], V, P);
}

function get_id(gl, meshes, pos, V, P)
{
	for(let mesh of meshes) mesh.render_id(gl, V, P);

	let pixels = new Uint8Array(4); 

	gl.readPixels(pos.x, pos.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

	return pixels[0];
}

