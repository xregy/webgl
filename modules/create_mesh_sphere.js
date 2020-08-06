import {Mesh} from "./class_mesh.mjs"

// http://rodger.global-linguist.com/webgl/ch08/PointLightedSphere.js
export function create_mesh_sphere(gl, SPHERE_DIV, loc_aPosition=0, loc_aNormal=1) 
{ // Create a sphere
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    let i, ai, si, ci;
    let j, aj, sj, cj;
    let p1, p2;
    
    let positions = [];
    let indices = [];
    
    // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++)
    {
    	aj = j * Math.PI / SPHERE_DIV;
    	sj = Math.sin(aj);
    	cj = Math.cos(aj);
    	for (i = 0; i <= SPHERE_DIV; i++)
    	{
    		ai = i * 2 * Math.PI / SPHERE_DIV;
    		si = Math.sin(ai);
    		ci = Math.cos(ai);
    		
    		positions.push(si * sj);  // X
    		positions.push(cj);       // Y
    		positions.push(ci * sj);  // Z
    	}
    }
    
    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++)
    {
    	for (i = 0; i < SPHERE_DIV; i++)
    	{
    		p1 = j * (SPHERE_DIV+1) + i;
    		p2 = p1 + (SPHERE_DIV+1);
    		
    		indices.push(p1);
    		indices.push(p2);
    		indices.push(p1 + 1);
    		
    		indices.push(p1 + 1);
    		indices.push(p2);
    		indices.push(p2 + 1);
    	}
    }
    
    const buf_position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    const buf_normal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aNormal);
    
    const buf_index = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    
    return new Mesh({gl, vao, draw_call:"drawElements", draw_mode:gl.TRIANGLES, n:indices.length, index_buffer_type:gl.UNSIGNED_SHORT, loc_aPosition});
}


