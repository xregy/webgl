"use strict";

let g_last = Date.now();
const ANGLE_STEP_LIGHT = 30.0;
const ANGLE_STEP_MESH = 30.0;

const loc_aPosition = 3;
const loc_aTexCoord = 8;

const src_vert = `#version 300 es
layout(location=${loc_aPosition}) in vec4	aPosition;
layout(location=${loc_aTexCoord}) in vec2	aTexCoord;
out vec2	vTexCoord;
uniform mat4	MVP;
void main()
{
	gl_Position = MVP*aPosition;
	vTexCoord = aTexCoord;
}`;
const src_frag = `#version 300 es
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D tex;
in vec2	vTexCoord;
out vec4 fColor;
void main()
{
	fColor = texture(tex, vTexCoord);
}`;

function main()
{
	let canvas = document.getElementById('webgl');
	let gl = canvas.getContext('webgl2');

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.9, 0.9, 0.9, 1.0);

	let V = new Matrix4();
	V.setLookAt(20, 20, 20, 0, 0, 0, 0, 1, 0);

	let P = new Matrix4();
//	P.setPerspective(60, 1, 1, 100); 
	P.setOrtho(-15, 15, -15, 15, 1, 100);

    let uniform_vars = ["MVP", "tex"];

	let shader = new Shader(gl, src_vert, src_frag, uniform_vars);

	let mesh = new Mesh(gl);

	mesh.M.setTranslate(0, -14, 0);

	let axes = new Axes(gl,10);

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

	let manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	let tex;



//	let url = 'https://threejs.org/examples/models/obj/cerberus/Cerberus.obj';
//	let url = 'https://threejs.org/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb';
	let url = 'https://threejs.org/examples/models/gltf/Nefertiti/Nefertiti.glb';
//	let url = 'https://threejs.org/examples/models/gltf/Monster/glTF/Monster.gltf';
//	let url = 'https://xregy.github.io/webgl/resources/monkey_sub2_smooth.obj'; 

	let loader = new THREE.GLTFLoader( manager );
	loader.load(url,
		function ( object )
		{
			document.getElementById("output").innerHTML = 'Successfully loaded.';
			for(let obj of object.scene.children)
			{
				if(obj.type == "Mesh")
				{
					mesh.init_from_THREE_geometry(gl, obj.geometry, loc_aPosition, null, loc_aTexCoord);
					tex = new Texture(gl, obj.material.map.image, false);
				}
			}
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


	let tick = function() {   // start drawing
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		axes.render(gl, V, P);
		mesh.render(gl, shader, null, null, V, P, {"tex":tex});
		requestAnimationFrame(tick, canvas);
	};


}


