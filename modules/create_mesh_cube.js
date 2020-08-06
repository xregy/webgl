import {Mesh} from "./class_mesh.mjs"

export function create_mesh_cube(gl, loc_aPosition=0, loc_aNormal=1) 
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    const verts = new Float32Array([
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
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    const SZ = verts.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, SZ*6, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aNormal, 3, gl.FLOAT, false, SZ*6, SZ*3);
    gl.enableVertexAttribArray(loc_aNormal);
    
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return new Mesh({gl, vao, draw_call:"drawArrays", draw_mode:gl.TRIANGLES, n:36, loc_aPosition});
}


