"use strict";
function main()
{
	let canvas = document.getElementById('webgl');
	let gl = canvas.getContext('webgl2');

	gl.cullFace(gl.BACK);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	let shader_room = new Shader(gl,
		document.getElementById("vert-room").text,
		document.getElementById("frag-room").text);

	let shader_cubemap = new Shader(gl,
		document.getElementById("vert-cubemap").text,
		document.getElementById("frag-cubemap").text);

	let room = create_mesh_room_cubemap(gl);
	room.M.setScale(2.0, 2.0, 2.0);

	let monkey = new Mesh(gl);
	monkey.init_from_json_js(gl, __js_monkey_sub2_smooth);

	gl.clearColor(0.5, 0.5, 0.5, 1.0);

	let P = new Matrix4();
	P.setPerspective(30, 1, 1, 20);
	let V = new Matrix4();
	V.translate(0, 0, -10);

	let tex_cubemap;
	const TEX_UNIT = 3;
	gl.activeTexture(gl.TEXTURE0 + TEX_UNIT);

	gl.useProgram(shader_room.h_prog);
	gl.uniform1i(gl.getUniformLocation(shader_room.h_prog, "sampler_cubemap"), TEX_UNIT);
	gl.useProgram(shader_cubemap.h_prog);
	gl.uniform1i(gl.getUniformLocation(shader_cubemap.h_prog, "sampler_cubemap"), TEX_UNIT);

    const faces = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz'];
    let img_cubemap = {};
    faces.forEach(face => img_cubemap[face] = new Image());

    function load_image(image, src)
    {
        return new Promise(function(resolve, reject) {
            image.crossOrigin = '';	// https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
            image.onload = function() {
                resolve(image);
            }
            image.onerror = () => reject(new Error(`Error while loading ${src}.`));
        	image.src = src;
        });
    }
    
    Promise.all(faces.map(face => load_image(img_cubemap[face], `../resources/SwedishRoyalCastle/${face}.jpg`))
    ).then(
        function(images) {
            tex_cubemap = new TextureCubemap(gl, 
                {
                    posx:images[0],
                    negx:images[1],
                    posy:images[2],
                    negy:images[3],
                    posz:images[4],
                    negz:images[5]
                }
                );
            tick();
        }

    ).catch(
        err => document.getElementById("output").innerHTML = 'An error happened: ' + err.message
    );



    let t_last = Date.now();
    const ANGLE_STEP = 45;
    
    let tick = function() {
        let now = Date.now();
        let elapsed = now - t_last;
        t_last = now;
        
        monkey.M.rotate(( (ANGLE_STEP * elapsed) / 1000.0) % 360.0, 0, 1, 0);
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        room.render(gl, shader_room, null, null, V, P);
        monkey.render(gl, shader_cubemap, null, null, V, P);
        requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    };
}


function create_mesh_room_cubemap(gl)
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
	// Create a cube
	//    v6----- v5
	//   /|      /|
	//  v1------v0|
	//  | |     | |
	//  | |v7---|-|v4
	//  |/      |/
	//  v2------v3
	let verts = new Float32Array([
	// Note the triangles are facing inside.
		 1, 1, 1,	// v0
		 1,-1,-1,	// v4
		 1,-1, 1,	// v3
		
		 1, 1, 1,	// v0
		 1, 1,-1,	// v5
		 1,-1,-1,	// v4
		
		 1, 1, 1,	// v0
		-1, 1,-1,	// v6
		 1, 1,-1,	// v5
		
		 1, 1, 1,	// v0
		-1, 1, 1,	// v1
		-1, 1,-1,	// v6
		
		 1, 1, 1,	// v0
		-1,-1, 1,	// v2
		-1, 1, 1,	// v1
		
		 1, 1, 1,	// v0
		 1,-1, 1,	// v3
		-1,-1, 1,	// v2
		
		-1,-1,-1,	// v7
		-1, 1, 1,	// v1
		-1,-1, 1,	// v2
		
		-1,-1,-1,	// v7
		-1, 1,-1,	// v6
		-1, 1, 1,	// v1
		
		-1,-1,-1,	// v7
		 1, 1,-1,	// v5
		-1, 1,-1,	// v6
		
		-1,-1,-1,	// v7
		 1,-1,-1,	// v4
		 1, 1,-1,	// v5
		
		-1,-1,-1,	// v7
		 1,-1, 1,	// v3
		 1,-1,-1,	// v4
		
		-1,-1,-1,	// v7
		-1,-1, 1,	// v2
		 1,-1, 1,	// v3
	]);
	let vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    let loc_aPosition = 7;
    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);
 
    gl.bindVertexArray(null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return new Mesh(gl, vao, "drawArrays", gl.TRIANGLES, 36, null);
}




