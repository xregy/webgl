var g_last = Date.now();
var ANGLE_STEP_LIGHT = 30.0;
var ANGLE_STEP_MESH = 30.0;
function main()
{
	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.9, 0.9, 0.9, 1.0);

	var V = new Matrix4();
	V.setLookAt(6, 6, 6, 0, 0, 0, 0, 1, 0);

	var P = new Matrix4();
	P.setPerspective(60, 1, 1, 100); 

	shader = new Shader(gl, 
			document.getElementById("vert-Blinn-Gouraud").text,
			document.getElementById("frag-Blinn-Gouraud").text,
			["aPosition", "aNormal"]);


	light = new Light
	(
		gl,
		[0, 1.5, 1.5, 1.0],
		[0.1, 0.1, 0.1, 1.0],
		[1.0, 1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0, 1.0],
		false
	);
	light.turn_on(true);

	// initializes the meshes
	var list_meshes = [];
	var id = 0;
	var cube = create_mesh_cube(gl);
	var ball = create_mesh_sphere(gl, 20);
	var monkey = new Mesh(gl);			monkey.init_from_json_js(gl, __js_monkey_smooth);

	monkey.id = ++id;
	cube.id = ++id;
	ball.id = ++id;

	monkey.name = "monkey";
	cube.name = "cube";
	ball.name = "ball";

	list_meshes = [monkey, cube, ball];	// the order should be consistent

	cube.M.setTranslate(2.5,2.5,0);
	ball.M.setTranslate(2.5,0,2.5);
	monkey.M.setTranslate(0,2.5,2.5);

	canvas.onmousedown = function(ev) 
	{
		var x = ev.clientX, y = ev.clientY;
		var bb = ev.target.getBoundingClientRect();
		if (bb.left <= x && x < bb.right && bb.top <= y && y < bb.bottom)
		{
			var id = get_id(gl, list_meshes, {x:x-bb.left, y:bb.bottom-y}, V, P);
			if(id > 0)
				document.getElementById("output").innerHTML = "The " + list_meshes[id-1].name + " is selected.";
			else
				document.getElementById("output").innerHTML = "Nothing is selected.";
		}
	}

	var tick = function()
	{
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		monkey.render(gl, shader, [light], __js_materials["gold"], V, P);
		cube.render(gl, shader, [light], __js_materials["silver"], V, P);
		ball.render(gl, shader, [light], __js_materials["copper"], V, P);

		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick();
}

function get_id(gl, list_meshes, pos, V, P)
{
	for(var i=0 ; i<list_meshes.length ; i++)
	{
		list_meshes[i].render_for_picking(gl, V, P);
	}
	var pixels = new Uint8Array(4); 
	gl.readPixels(pos.x, pos.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

	return pixels[0];
}

