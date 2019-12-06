"use strict";

const loc_aPosition = 3;
const loc_aNormal = 9;
const numLights = 2;

function main()
{
	let canvas = document.getElementById('webgl');
	let gl = canvas.getContext("webgl2");

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.2, 0.2, 0.2, 1.0);

	let V = new Matrix4();
	V.setLookAt(3, 2, 3, 0, 0, 0, 0, 1, 0);

	let P = new Matrix4();
	P.setPerspective(60, 1, 1, 100); 

	let list_shaders = [];

    let uniform_vars = ["MVP", "MV", "matNormal"];
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[0]"));
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[1]"));
    Array.prototype.push.apply(uniform_vars, Material.generate_uniform_names("material"));

    let list_shader_source = 
    {
        "vert-Phong-Gouraud":src_vert_Phong_Gouraud,
        "frag-Phong-Gouraud":src_frag_Phong_Gouraud,
        "vert-Blinn-Gouraud":src_vert_Blinn_Gouraud,
        "frag-Blinn-Gouraud":src_frag_Blinn_Gouraud,
        "vert-Blinn-Phong":src_vert_Blinn_Phong,
        "frag-Blinn-Phong":src_frag_Blinn_Phong,
        "vert-Phong-Phong":src_vert_Phong_Phong,
        "frag-Phong-Phong":src_frag_Phong_Phong,
    };


	// initializes shaders (reflection models)
	for(let model of [
    "Phong-Gouraud", 
    "Blinn-Gouraud", 
    "Blinn-Phong", "Phong-Phong"])
	{
		list_shaders[model] = new Shader(gl, 
            list_shader_source["vert-" + model],
            list_shader_source["frag-" + model],
            uniform_vars);
	}

	// initializes the material combobox
	let combo_mat = document.getElementById("materials");
	for(let matname in __js_materials)
	{
		let opt = document.createElement("option");
		opt.value = matname;
		opt.text = matname;
		combo_mat.add(opt, null);
	}
	combo_mat.selectedIndex = 10;

	// initializes two lights
	let list_lights = 
	[
		new Light
		(
			gl,
			[1.5, 1.5, 0, 1.0],		// position
			[0.1, 0.1, 0.1, 1.0],	// ambient
			[1.0, 1.0, 1.0, 1.0],	// diffusive
			[1.0, 1.0, 1.0, 1.0],	// specular
			false
		),
		new Light
		(
			gl,
			[0, 1.5, 1.5, 1.0],
			[0.1, 0.1, 0.1, 1.0],
			[1.0, 1.0, 1.0, 1.0],
			[1.0, 1.0, 1.0, 1.0],
			false
		)
	];

	// initializes the meshes
	let list_meshes = [];
	let monkey = new Mesh(gl);
	monkey.init_from_json_js(gl, __js_monkey, loc_aPosition, loc_aNormal);
	let monkey_smooth = new Mesh(gl);
	monkey_smooth.init_from_json_js(gl, __js_monkey_smooth, loc_aPosition, loc_aNormal);
	let monkey_sub2_smooth = new Mesh(gl);
	monkey_sub2_smooth.init_from_json_js(gl, __js_monkey_sub2_smooth, loc_aPosition, loc_aNormal);
	let cube = create_mesh_cube(gl, loc_aPosition, loc_aNormal);
	let ball = create_mesh_sphere(gl, 20, loc_aPosition, loc_aNormal);
	list_meshes["cube"] = cube;
	list_meshes["sphere"] = ball;
	list_meshes["monkey"] = monkey;
	list_meshes["monkey (smooth)"] = monkey_smooth;
	list_meshes["monkey (subdivided 2 steps, smooth)"] = monkey_sub2_smooth;

	let axes = new Axes(gl);

	let t_last = Date.now();

	const ANGLE_STEP_LIGHT = 30.0;
	const ANGLE_STEP_MESH = 30.0;

	let tick = function()
	{
		let now = Date.now();
		let elapsed = now - t_last;
		t_last = now;

		list_lights[0].M.rotate(( (ANGLE_STEP_LIGHT * elapsed) / 1000.0) % 360.0, 0, 1, 0);
		if(document.getElementById("mesh-rotating").checked)
			list_meshes[document.getElementById("objects").value].M.rotate(
				-((ANGLE_STEP_MESH * elapsed) / 1000.0) % 360.0, 0, 1, 0);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		axes.render(gl, V, P);

		for(let i in list_lights)
		{
			// for light state and render it
			list_lights[i].turn_on(document.getElementById('light' + i).checked);
			list_lights[i].set_type(document.getElementById('light' + i + "-type").value == "positional");
			list_lights[i].render(gl, V, P);
		}
		// render the selected mesh using the selected shader
		list_meshes[document.getElementById("objects").value].render(gl, 
			list_shaders[document.getElementById("shading-models").value],
			list_lights,
			__js_materials[document.getElementById("materials").value], V, P);

		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick();
}


