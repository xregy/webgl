function create_mesh_patch_quad(gl, N)
{
	let scale = 4.0;

	let	texcoord = [];
	for(let row=0 ; row<=N ; row++)
	{
		for(let col=0 ; col<=N ; col++)
		{
			texcoord.push(row/N);
			texcoord.push(col/N);
		}
	}


	let indices = [];
	for(let row=0 ; row<N ; row++)
	{
		for(let col=0 ; col<N ; col++)
		{
			indices.push(row + col*(N+1));
			indices.push(row + (col+1)*(N+1));
			indices.push(row + col*(N+1) + 1);

			indices.push(row + col*(N+1) + 1);
			indices.push(row + (col+1)*(N+1));
			indices.push((row+1) + (col+1)*(N+1));
		}
	}

	var buf_texcoord = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_texcoord);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoord), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	var attribs = [];
	attribs["aTexCoord"] = {buffer:buf_texcoord, size:2, type:gl.FLOAT, normalized:false, stride:0, offset:0};

	var buf_index = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
	return new Mesh(gl, "drawElements", gl.TRIANGLES, indices.length, attribs, buf_index, gl.UNSIGNED_SHORT); 

}

