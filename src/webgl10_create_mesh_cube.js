"use strict";
function create_mesh_cube(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
	let verts = new Float32Array([
		 1, 1, 1,    1, 0, 0,  // v0 White
		 1,-1, 1,    1, 0, 0,  // v3 Yellow
		 1,-1,-1,    1, 0, 0,  // v4 Green
		
		 1, 1, 1,    1, 0, 0,  // v0 White
		 1,-1,-1,    1, 0, 0,  // v4 Green
		 1, 1,-1,    1, 0, 0,  // v5 Cyan
		
		 1, 1, 1,    0, 1, 0,  // v0 White
		 1, 1,-1,    0, 1, 0,  // v5 Cyan
		-1, 1,-1,    0, 1, 0,  // v6 Blue
		
		 1, 1, 1,    0, 1, 0,  // v0 White
		-1, 1,-1,    0, 1, 0,  // v6 Blue
		-1, 1, 1,    0, 1, 0,  // v1 Magenta
		
		 1, 1, 1,    0, 0, 1,  // v0 White
		-1, 1, 1,    0, 0, 1,  // v1 Magenta
		-1,-1, 1,    0, 0, 1,  // v2 Red
		
		 1, 1, 1,    0, 0, 1,  // v0 White
		-1,-1, 1,    0, 0, 1,  // v2 Red
		 1,-1, 1,    0, 0, 1,  // v3 Yellow
		
		-1,-1,-1,   -1, 0, 0,  // v7 Black
		-1,-1, 1,   -1, 0, 0,  // v2 Red
		-1, 1, 1,   -1, 0, 0,  // v1 Magenta
		
		-1,-1,-1,   -1, 0, 0,  // v7 Black
		-1, 1, 1,   -1, 0, 0,  // v1 Magenta
		-1, 1,-1,   -1, 0, 0,  // v6 Blue
		
		-1,-1,-1,    0, 0,-1,  // v7 Black
		-1, 1,-1,    0, 0,-1,  // v6 Blue
		 1, 1,-1,    0, 0,-1,  // v5 Cyan
		
		-1,-1,-1,    0, 0,-1,  // v7 Black
		 1, 1,-1,    0, 0,-1,  // v5 Cyan
		 1,-1,-1,    0, 0,-1,  // v4 Green
		
		-1,-1,-1,    0,-1, 0,  // v7 Black
		 1,-1,-1,    0,-1, 0,  // v4 Green
		 1,-1, 1,    0,-1, 0,  // v3 Yellow
		
		-1,-1,-1,    0,-1, 0,  // v7 Black
		 1,-1, 1,    0,-1, 0,  // v3 Yellow
		-1,-1, 1,    0,-1, 0,  // v2 Red
	]);
	let vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
	let FSIZE = verts.BYTES_PER_ELEMENT;
	let attribs = [];
	attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs["aNormal"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return new Mesh(gl, "drawArrays", gl.TRIANGLES, 36, attribs, -1, null);
}


