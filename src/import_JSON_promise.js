"use strict";

function main()
{
	let canvas = document.getElementById('webgl');
	let gl = canvas.getContext("webgl2");

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.2,0.2,0.2,1);

	let V = new Matrix4();
	V.setLookAt(2, 1, 3, 0, 0, 0, 0, 1, 0);

	let P = new Matrix4();
	P.setPerspective(50, 1, 1, 100); 

	let axes = new Axes(gl);

	let shader = new Shader(gl, 
			document.getElementById("vert-Blinn-Gouraud").text,
			document.getElementById("frag-Blinn-Gouraud").text);

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

	let monkey = new Mesh(gl);

    function tick() {   // Start drawing
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        axes.render(gl, V, P);
        monkey.render(gl, shader, [light], __js_materials["gold"], V, P);
        requestAnimationFrame(tick, canvas);
    };

    fetch('../resources/monkey_sub2_smooth.json')
    .then(function(response) {
        if(response.ok) return response.json();
        else    throw new Error(`Error while loading ${response.url}.`);
    })
    .then(function(json) {
        monkey.init_from_json_js(gl, json);
        tick();
    })
    .catch(err => console.log(err.message));

}

