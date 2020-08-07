import * as mat4 from "../lib/gl-matrix/mat4.js"
import * as vec4 from "../lib/gl-matrix/vec4.js"

export function length2(v)
{
	return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
}

// https://github.com/g-truc/glm/blob/master/glm/ext/matrix_projection.inl
export function project(p_obj, MVP, viewport)
{
	let	tmp = vec4.create();
    vec4.transformMat4(tmp, [p_obj[0], p_obj[1], p_obj[2], 1], MVP);

	for(let i in [0,1,2])	tmp[i] /= tmp[3];

//	for(let i in [0,1]) 	// --> not working!!!???
	for(let i=0 ; i<2 ; i++)
	{
		tmp[i] = (0.5*tmp[i] + 0.5) * viewport[i+2] + viewport[i];
	}

	return tmp;
}

// https://github.com/g-truc/glm/blob/master/glm/ext/matrix_projection.inl
export function unproject(p_win, MVP, viewport)
{
	let	MVP_inv = mat4.create();
	mat4.invert(MVP_inv, MVP);

	let	tmp = mat4.clone([p_win[0], p_win[1], p_win[2], 1.0]);

//	for(let i in [0,1]) --> not working!!!???
	for(let i=0 ; i<2 ; i++)
		tmp[i] = 2.0*(tmp[i] - viewport[i])/viewport[i+2] - 1.0;

	let p_obj = vec4.create();
    vec4.transformMat4(p_obj, tmp, MVP_inv);

	for(let i in [0,1,2]) p_obj[i] /= p_obj[3];

	return p_obj;
}

export function unproject_vector(vec_win, MVP, viewport)
{
	let	org_win = project([0,0,0], MVP, viewport);
	let	vec = unproject([org_win[0]+vec_win[0], org_win[1]+vec_win[1], org_win[2]+vec_win[2]],
						MVP, viewport);
	return vec;
}


