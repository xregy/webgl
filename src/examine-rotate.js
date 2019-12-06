"use strict";

const loc_aPosition = 2;
const loc_aNormal = 1;
const numLights = 1;

function main()
{
	let canvas = document.getElementById('webgl');
	let gl = canvas.getContext("webgl2");

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.9, 0.9, 0.9, 1.0);

	let V = new Matrix4();
	V.setLookAt(6, 6, 6, 0, 0, 0, 0, 1, 0);

	let P = new Matrix4();
	P.setPerspective(60, 1, 1, 100); 

    let uniform_vars = ["MVP", "MV", "matNormal"];
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[0]"));
    Array.prototype.push.apply(uniform_vars, Material.generate_uniform_names("material"));

	let shader = new Shader(gl, src_vert_Phong_Gouraud, src_frag_Phong_Gouraud, uniform_vars);

	let light = new Light
	(
		gl,
		[2.5, 2.5, 2.5, 1.0],
		[0.1, 0.1, 0.1, 1.0],
		[1.0, 1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0, 1.0],
		false
	);
	light.turn_on(true);

	// initializes the meshes
	let id = 0;
	let cube = create_mesh_cube(gl, loc_aPosition, loc_aNormal);
	let ball = create_mesh_sphere(gl, 20, loc_aPosition, loc_aNormal);
	let monkey = new Mesh(gl);			
	monkey.init_from_json_js(gl, __js_monkey_smooth, loc_aPosition, loc_aNormal);

	monkey.id = ++id;
	cube.id = ++id;
	ball.id = ++id;

	monkey.name = "monkey";
	cube.name = "cube";
	ball.name = "ball";

	let list_meshes = [monkey, cube, ball];	

	cube.M.setTranslate(2.5,2.5,0);
	ball.M.setTranslate(2.5,0,2.5);
	monkey.M.setTranslate(0,2.5,2.5);

	let list_materials = {
		"cube":__js_materials["silver"], 
		"ball":__js_materials["copper"],
		"monkey":__js_materials["gold"], 
		};

	let axes = new Axes(gl,4);

	let lastX;
	let lastY;
	let angle = [0,0];
	let dragging = false;

	canvas.onmousedown = function(ev) 
	{
		let x = ev.clientX, y = ev.clientY;
		let bb = ev.target.getBoundingClientRect();
		if (bb.left <= x && x < bb.right && bb.top <= y && y < bb.bottom)
		{
			lastX = x;
			lastY = y;
			dragging = true;
		}
	}
	canvas.onmouseup = function(ev) { dragging = false; };

	canvas.onmousemove = function(ev)
	{
		let x = ev.clientX;
		let y = ev.clientY;
		if(dragging)
		{
			let offset = [x - lastX, y - lastY];
			if(offset[0] != 0 || offset[1] != 0) // For some reason, the offset becomes zero sometimes...
			{
				let	VP = new Matrix4(P);
				VP.multiply(V);
				let	axis = unproject_vector([offset[1], offset[0], 0], VP, 
					gl.getParameter(gl.VIEWPORT));
				V.rotate(length2(offset), axis[0], axis[1], axis[2]);
			}
		}
		lastX = x;
		lastY = y;
	}

	let tick = function()
	{
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		axes.render(gl, V, P);
		light.render(gl, V, P);
		for(let mesh of list_meshes)
			mesh.render(gl, shader, [light], list_materials[mesh.name], V, P);
		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick();
}

