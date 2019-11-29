"use strict";

let g_last = Date.now();
let ANGLE_STEP_LIGHT = 30.0;
let ANGLE_STEP_MESH = 30.0;

const loc_aPosition = 3;
const loc_aTexCoord = 8;

// Vertex shader program
let VSHADER_SOURCE =
`#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aTexCoord}) in vec2 aTexCoord;
    out vec2 vTexCoord;
    void main() {
        gl_Position = aPosition;
        vTexCoord = aTexCoord;
    }
`;

// Fragment shader program
let FSHADER_SOURCE = `#version 300 es
precision mediump float;
uniform sampler2D uSampler;
in vec2 vTexCoord;
out vec4 fColor;
void main() {
    fColor = texture(uSampler, vTexCoord);
}
`;

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


	let shader = new Shader(gl, 
			document.getElementById("vert-Phong-Phong").text,
			document.getElementById("frag-Phong-Phong").text,
			{aPosition:2, aNormal:4, aTexCoord:6});

    let shader_quad = new Shader(gl, 
            VSHADER_SOURCE, FSHADER_SOURCE);

    shader_quad.loc_uSampler = gl.getUniformLocation(shader_quad.h_prog, 'uSampler');

	let lights = 
	[
		new Light
		(
			gl,
			[20, 20, 20, 1.0],		// position
			[0.1, 0.1, 0.1, 1.0],	// ambient
			[1.0, 1.0, 1.0, 1.0],	// diffusive
			[1.0, 1.0, 1.0, 1.0],	// specular
			true
		),
		new Light
		(
			gl,
			[-20, 20, 20, 0.0],		// position
			[0.1, 0.1, 0.1, 1.0],	// ambient
			[1.0, 1.0, 1.0, 1.0],	// diffusive
			[1.0, 1.0, 1.0, 1.0],	// specular
			true
		),
	];

    let quad = init_quad(gl);


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

	let tex_color, tex_normal;


//	let resources_loaded = false;

	let url = 'https://threejs.org/examples/models/gltf/Nefertiti/Nefertiti.glb';

	let loader = new THREE.GLTFLoader( manager );
	loader.load(url,
		function ( object )
		{
			document.getElementById("output").innerHTML = 'Successfully loaded.';
			for(let obj of object.scene.children)
			{
				if(obj.type == "Mesh")
				{
					mesh.init_from_THREE_geometry(gl, obj.geometry);
					tex_color = new Texture(gl, obj.material.map.image, false);
					tex_normal = new Texture(gl, obj.material.normalMap.image, false);
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
        gl.viewport(0, 0, 512, 512);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		axes.render(gl, V, P);
		for(let light of lights) light.render(gl, V, P);
		gl.useProgram(shader.h_prog);
		gl.uniform1i(gl.getUniformLocation(shader.h_prog, "use_normal_map"), document.getElementById("normalmap").checked?1:0);
		gl.uniform1i(gl.getUniformLocation(shader.h_prog, "use_color_map"), document.getElementById("colormap").checked?1:0);
		mesh.render(gl, shader, lights, __js_materials["silver"], V, P, {"tex_color":tex_color, "tex_normal":tex_normal});

        // render the color map in the lower-right area
        gl.viewport(512, 0, 256, 256);
		gl.useProgram(shader_quad.h_prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(shader_quad.loc_aSampler, 0);
        gl.bindTexture(gl.TEXTURE_2D, tex_color.texid);
        gl.bindVertexArray(quad);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle
        gl.bindVertexArray(null);

        // render the normal map in the upper-right area
        gl.viewport(512, 256, 256, 256);
		gl.useProgram(shader_quad.h_prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(shader_quad.loc_aSampler, 0);
        gl.bindTexture(gl.TEXTURE_2D, tex_normal.texid);
        gl.bindVertexArray(quad);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle
        gl.bindVertexArray(null);


		requestAnimationFrame(tick, canvas);
	};

}

function init_quad(gl)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let verticesTexCoords = new Float32Array([
      // Vertex coordinates, texture coordinate
      -1,  1,   0.0, 1.0,
      -1, -1,   0.0, 0.0,
       1,  1,   1.0, 1.0,
       1, -1,   1.0, 0.0,
    ]);
    
    // Create the buffer object
    let vertexTexCoordBuffer = gl.createBuffer();
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    
    let FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    let a_Position = loc_aPosition;
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object
    
    let a_TexCoord = loc_aTexCoord;
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object

    gl.bindVertexArray(null);
    return vao;
}

function length2(v)
{
	return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
}

// https://github.com/g-truc/glm/blob/master/glm/ext/matrix_projection.inl
function project(p_obj, MVP, viewport)
{
	let	tmp = MVP.multiplyVector4(new Vector4([p_obj[0], p_obj[1], p_obj[2], 1]));

	for(let i in [0,1,2])	tmp.elements[i] /= tmp.elements[3];

//	for(let i in [0,1]) 	// --> not working!!!???
	for(let i=0 ; i<2 ; i++)
	{
		tmp.elements[i] = (0.5*tmp.elements[i] + 0.5) * viewport[i+2] + viewport[i];
	}

	return tmp.elements;
}

// https://github.com/g-truc/glm/blob/master/glm/ext/matrix_projection.inl
function unproject(p_win, MVP, viewport)
{
	let	MVP_inv = new Matrix4();
	MVP_inv.setInverseOf(MVP);

	let	tmp = new Vector4([p_win[0], p_win[1], p_win[2], 1.0]);

//	for(let i in [0,1]) --> not working!!!???
	for(let i=0 ; i<2 ; i++)
		tmp.elements[i] = 2.0*(tmp.elements[i] - viewport[i])/viewport[i+2] - 1.0;

	let p_obj = MVP_inv.multiplyVector4(tmp);

	for(let i in [0,1,2]) p_obj.elements[i] /= p_obj.elements[3];

	return p_obj.elements;
}

function unproject_vector(vec_win, MVP, viewport)
{
	let	org_win = project([0,0,0], MVP, viewport);
	let	vec = unproject([org_win[0]+vec_win[0], org_win[1]+vec_win[1], org_win[2]+vec_win[2]],
						MVP, viewport);
	return vec;
}


