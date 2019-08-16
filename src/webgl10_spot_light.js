"use strict";
function main()
{
    let canvas = document.getElementById('webgl');
    let gl = getWebGLContext(canvas);
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    let V = new Matrix4();
    V.setLookAt(3, 3, 3, 0, 0, 0, 0, 1, 0);
    
    let P = new Matrix4();
    P.setPerspective(60, 1, 1, 100); 
    
    let list_shaders = [];
    
    // initializes shaders (reflection models)
    for(let model of ["Blinn-Gouraud", "Phong-Gouraud", "Blinn-Phong", "Phong-Phong"])
    {
        list_shaders[model] = new Shader(gl, 
            document.getElementById("vert-" + model + "-spot").text,
            document.getElementById("frag-" + model + "-spot").text,
            ["aPosition", "aNormal"]);
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
    
    let light = new Light
    	(
    		gl,
    		[0.0, 0.0, 1.5, 1.0],		// position
    		[0.1, 0.1, 0.1, 1.0],	// ambient
    		[1.0, 1.0, 1.0, 1.0],	// diffusive
    		[1.0, 1.0, 1.0, 1.0],	// specular
    		true,
    		parseInt(document.getElementById("cutoff-angle").value),
    		[0.0, 0.0, -1.0, 0.0]
    	);
    
    document.getElementById("cutoff-angle").onchange = function(ev) 
    	{light.cutoff_angle = parseInt(document.getElementById("cutoff-angle").value)};
    
    // initializes the meshes
    let list_meshes = [];
    let monkey = new Mesh(gl);
    monkey.init_from_json_js(gl, __js_monkey);
    let monkey_smooth = new Mesh(gl);
    monkey_smooth.init_from_json_js(gl, __js_monkey_smooth);
    let monkey_sub2_smooth = new Mesh(gl);
    monkey_sub2_smooth.init_from_json_js(gl, __js_monkey_sub2_smooth);
    let cube = create_mesh_cube(gl);
    let ball = create_mesh_sphere(gl, 20);
    list_meshes["cube"] = cube;
    list_meshes["sphere"] = ball;
    list_meshes["monkey"] = monkey;
    list_meshes["monkey (smooth)"] = monkey_smooth;
    list_meshes["monkey (subdivided 2 steps, smooth)"] = monkey_sub2_smooth;
    
    let axes = new Axes(gl);
    
    let t_last = Date.now();
    const ANGLE_STEP_LIGHT = 30.0;
    
    let tick = function()
    {
    	let now = Date.now();
    	let elapsed = now - t_last;
    	t_last = now;
    
    	light.M.rotate(( (ANGLE_STEP_LIGHT * elapsed) / 1000.0) % 360.0, 0, 1, 0);
    	for(let i=0 ; i<3 ; i++)
    		light.direction.elements[i] = -light.position.elements[i];
    
    	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    	axes.render(gl, V, P);
    
    	light.render(gl, V, P);
    
    	list_meshes[document.getElementById("objects").value].render(gl, 
    		list_shaders[document.getElementById("shading-models").value],
    		[light],
    		__js_materials[document.getElementById("materials").value], V, P);
    
    	requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    };
    tick();
}


