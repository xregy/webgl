var g_last = Date.now();
var ANGLE_STEP_LIGHT = 30.0;
var ANGLE_STEP_MESH = 30.0;
function main()
{
	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.2, 0.2, 0.2, 1.0);

	var V = new Matrix4();
	V.setLookAt(3, 2, 3, 0, 0, 0, 0, 1, 0);

	var P = new Matrix4();
	P.setPerspective(60, 1, 1, 100); 

	var list_shaders = [];

	// initializes shaders (reflection models)
	for(let model of ["Blinn-Gouraud", "Phong-Gouraud", "Blinn-Phong", "Phong-Phong"])
	{
		list_shaders[model] = new Shader(gl, 
			document.getElementById("vert-" + model).text,
			document.getElementById("frag-" + model).text,
			["aPosition", "aNormal"]);
	}

	// initializes the material combobox
	var combo_mat = document.getElementById("materials");
	for(matname in __js_materials)
	{
		var opt = document.createElement("option");
		opt.value = matname;
		opt.text = matname;
		combo_mat.add(opt, null);
	}
	combo_mat.selectedIndex = 10;

	// initializes two lights
	var list_lights = 
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
	var list_meshes = [];
	var monkey = new Mesh(gl);
	monkey.init_from_json_js(gl, __js_monkey);
	var monkey_smooth = new Mesh(gl);
	monkey_smooth.init_from_json_js(gl, __js_monkey_smooth);
	var monkey_sub2_smooth = new Mesh(gl);
	monkey_sub2_smooth.init_from_json_js(gl, __js_monkey_sub2_smooth);
	var cube = create_mesh_cube(gl);
	var ball = create_mesh_sphere(gl, 20);
	list_meshes["cube"] = cube;
	list_meshes["sphere"] = ball;
	list_meshes["monkey"] = monkey;
	list_meshes["monkey (smooth)"] = monkey_smooth;
	list_meshes["monkey (subdivided 2 steps, smooth)"] = monkey_sub2_smooth;

	var axes = new Axes(gl);

	var tick = function()
	{
		var now = Date.now();
		var elapsed = now - g_last;
		g_last = now;

		list_lights[0].M.rotate(( (ANGLE_STEP_LIGHT * elapsed) / 1000.0) % 360.0, 0, 1, 0);
		if(document.getElementById("mesh-rotating").checked)
			list_meshes[document.getElementById("objects").value].M.rotate(
				-((ANGLE_STEP_MESH * elapsed) / 1000.0) % 360.0, 0, 1, 0);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		axes.render(gl, V, P);

		for(var i=0 ; i<list_lights.length ; i++)
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


