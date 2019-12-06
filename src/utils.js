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


