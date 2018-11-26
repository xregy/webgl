"use strict";

let g_last = Date.now();
let ANGLE_STEP_LIGHT = 30.0;
let ANGLE_STEP_MESH = 30.0;
function main()
{
	let canvas = document.getElementById('webgl');
	let gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.2,0.2,0.2,1);

	let V = new Matrix4();
	V.setLookAt(2, -3, 1, 0, 0, 0, 0, 0, 1);

	let P = new Matrix4();
	P.setPerspective(50, 1, 1, 100); 

	let axes = new Axes(gl);

	let shader = new Shader(gl, 
			document.getElementById("vert-Blinn-Gouraud").text,
			document.getElementById("frag-Blinn-Gouraud").text,
			["aPosition", "aNormal"]);

	let light = new Light
	(
		gl,
		[2.5, -2.5, 2.5, 1.0],
		[0.1, 0.1, 0.1, 1.0],
		[1.0, 1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0, 1.0],
		false
	);
	light.turn_on(true);

	let monkey = new Mesh(gl);

	let manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	let loader = new THREE.PLYLoader( manager );
	loader.load( 'https://xregy.github.io/webgl/resources/monkey_sub2_smooth.ply', 
		function ( object )
		{
			document.getElementById("output").innerHTML = 'Successfully loaded.';
			monkey.init_from_THREE_geometry(gl, object);
			let tick = function() {   // start drawing
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
				axes.render(gl, V, P);
				monkey.render(gl, shader, [light], __js_materials["gold"], V, P);
				requestAnimationFrame(tick, canvas);
			};
			tick();
		},
		// called when loading is in progresses
		function ( xhr )
		{
			document.getElementById("output").innerHTML = ( xhr.loaded / xhr.total * 100 ) + '% loaded.';
		},
		// called when loading has errors
		function ( error )
		{
			document.getElementById("output").innerHTML = 'An error happened: ' + error;
		}

	);
}


