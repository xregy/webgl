"use strict";

const loc_aPosition = 2;
const loc_aNormal = 8;
const numLights = 1;

function main()
{
	let canvas = document.getElementById('webgl');
	let gl = canvas.getContext("webgl2");

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.2,0.2,0.2,1);

	let V = new Matrix4();
	V.setLookAt(2, -3, 1, 0, 0, 0, 0, 0, 1);

	let P = new Matrix4();
	P.setPerspective(50, 1, 1, 100); 

	let axes = new Axes(gl);

    let uniform_vars = ["MVP", "MV", "matNormal"];
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[0]"));
    Array.prototype.push.apply(uniform_vars, Material.generate_uniform_names("material"));

	let shader = new Shader(gl, src_vert_Phong_Gouraud, src_frag_Phong_Gouraud, uniform_vars);

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

	let loader = new THREE.STLLoader( manager );
	loader.load( '../resources/monkey_sub2_smooth.stl', 
		function ( object )
		{
			document.getElementById("output").innerHTML = 'Successfully loaded.';
			monkey.init_from_THREE_geometry(gl, object, loc_aPosition, loc_aNormal);
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


