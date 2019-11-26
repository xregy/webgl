"use strict";

const loc_aPosition = 3;
const loc_aNormal = 9;
let list_shader_source = {}
list_shader_source["vert-Blinn-Gouraud"] = `#version 300 es
layout(location=${loc_aPosition}) in vec4	aPosition;
layout(location=${loc_aNormal}) in vec3	aNormal;
uniform mat4	MVP;
uniform mat4	MV;
uniform mat4	matNormal;
struct TMaterial
{
	vec3	ambient;
	vec3	diffuse;
	vec3	specular;
	vec3	emission;
	float	shininess;
};
struct TLight
{
	vec4	position;
	vec3	ambient;
	vec3	diffuse;
	vec3	specular;
	bool	enabled;
};
uniform TMaterial	material;
uniform TLight		light[2];
out vec3		vColor;
void main()
{
	vec3	n = normalize(mat3(matNormal)*aNormal);
	vec4	vPosEye = MV*aPosition;
	vec3	l;
	vec3	v = normalize(-vPosEye.xyz);
	vColor = vec3(0.0);
	for(int i=0 ; i<2 ; i++)
	{
		if(light[i].enabled)
		{
			if(light[i].position.w == 1.0)
				l = normalize((light[i].position - vPosEye).xyz);
			else
				l = normalize((light[i].position).xyz);
			vec3	h = normalize(l + v);
			float	l_dot_n = max(dot(l, n), 0.0);
			vec3	ambient = light[i].ambient * material.ambient;
			vec3	diffuse = light[i].diffuse * material.diffuse * l_dot_n;
			vec3	specular = vec3(0.0);
			if(l_dot_n > 0.0)
			{
				specular = light[i].specular * material.specular * pow(max(dot(h, n), 0.0), material.shininess);
			}
			vColor += ambient + diffuse + specular;
		}
	}
	gl_Position = MVP*aPosition;
}`;
list_shader_source["frag-Blinn-Gouraud"] = `#version 300 es
precision mediump float;
in vec3	vColor;
out vec4 fColor;
void main()
{
	fColor = vec4(vColor, 1);
}`;
list_shader_source["vert-Phong-Gouraud"] = `#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aNormal}) in vec3 aNormal;
uniform mat4	MVP;
uniform mat4	MV;
uniform mat4	matNormal;
struct TMaterial
{
	vec3	ambient;
	vec3	diffuse;
	vec3	specular;
	vec3	emission;
	float	shininess;
};
struct TLight
{
	vec4	position;
	vec3	ambient;
	vec3	diffuse;
	vec3	specular;
	bool	enabled;
};
uniform TMaterial	material;
uniform TLight		light[2];
out vec3	vColor;
void main()
{
	vec3	n = normalize(mat3(matNormal)*aNormal);	// n is the normal vector in eye coordinate system
	vec4	vPosEye = MV*aPosition;	// vPosEye is the vertex position in eye coordinate system
	vec3	l;
	vec3	v = normalize(-vPosEye.xyz);
	vColor = vec3(0.0);
	for(int i=0 ; i<2 ; i++)
	{
		if(light[i].enabled)
		{
			if(light[i].position.w == 1.0)
				l = normalize((light[i].position - vPosEye).xyz);
			else
				l = normalize((light[i].position).xyz);
			vec3	r = reflect(-l, n);
			float	l_dot_n = max(dot(l, n), 0.0);
			vec3	ambient = light[i].ambient * material.ambient;
			vec3	diffuse = light[i].diffuse * material.diffuse * l_dot_n;
			vec3	specular = vec3(0.0);
			if(l_dot_n > 0.0)
			{
				specular = light[i].specular * material.specular * pow(max(dot(r, v), 0.0), material.shininess);
			}
			vColor += ambient + diffuse + specular;
		}
	}
	gl_Position = MVP*aPosition;
}`;
list_shader_source["frag-Phong-Gouraud"] = `#version 300 es
precision mediump float;
in vec3	vColor;
out vec4 fColor;
void main()
{
	fColor = vec4(vColor, 1);
}`;
list_shader_source["vert-Blinn-Phong"] = `#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aNormal}) in vec3 aNormal;
uniform mat4	MVP;
uniform mat4	MV;
uniform mat4	matNormal;
out vec3	vNormal;
out vec4	vPosEye;
void main()
{
	vPosEye = MV*aPosition;
	vNormal = normalize(mat3(matNormal)*aNormal);
	gl_Position = MVP*aPosition;
}`;
source["frag-Blinn-Phong"] = `#version 300 es
precision mediump float;
in vec4	vPosEye;
in vec3	vNormal;
out vec4 fColor;
struct TMaterial
{
	vec3	ambient;
	vec3	diffuse;
	vec3	specular;
	vec3	emission;
	float	shininess;
};
struct TLight
{
	vec4	position;
	vec3	ambient;
	vec3	diffuse;
	vec3	specular;
	bool	enabled;
};
uniform TMaterial	material;
uniform TLight		light[2];
void main()
{
	vec3	n = normalize(vNormal);
	vec3	l;
	vec3	v = normalize(-vPosEye.xyz);
	fColor = vec4(0.0);
	for(int i=0 ; i<2 ; i++)
	{
		if(light[i].enabled)
		{
			if(light[i].position.w == 1.0)
				l = normalize((light[i].position - vPosEye).xyz);		// positional light
			else
				l = normalize((light[i].position).xyz);	// directional light
			float	l_dot_n = max(dot(l, n), 0.0);
			vec3	ambient = light[i].ambient * material.ambient;
			vec3	diffuse = light[i].diffuse * material.diffuse * l_dot_n;
			vec3	specular = vec3(0.0);
			if(l_dot_n > 0.0)
			{
				vec3	h = normalize(l + v);
				specular = light[i].specular * material.specular * pow(max(dot(h, n), 0.0), material.shininess);
			}
			fColor += vec4(ambient + diffuse + specular, 1);
		}
	}
	fColor.w = 1.0;
}`;
list_shader_source["vert-Phong-Phong"] = `#version 300 es
layout(location=${loc_aPosition}) in vec4	aPosition;
layout(location=${loc_aNormal}) in vec3	aNormal;
uniform mat4	MVP;
uniform mat4	MV;
uniform mat4	matNormal;
out vec3	vNormal;
out vec4	vPosEye;
void main()
{
	vPosEye = MV*aPosition;
	vNormal = normalize((matNormal*vec4(aNormal,0)).xyz);
	gl_Position = MVP*aPosition;
}`;
list_shader_source["frag-Phong-Phong"] = `#version 300 es
precision mediump float;
in vec4 vPosEye;
in vec3	vNormal;
out vec4 fColor;
struct TMaterial
{
	vec3	ambient;
	vec3	diffuse;
	vec3	specular;
	vec3	emission;
	float	shininess;
};
struct TLight
{
	vec4	position;
	vec3	ambient;
	vec3	diffuse;
	vec3	specular;
	bool	enabled;
};
uniform TMaterial	material;
uniform TLight		light[2];
void main()
{
	vec3	n = normalize(vNormal);
	vec3	l;
	vec3	v = normalize(-vPosEye.xyz);
	fColor = vec4(0.0);
	for(int i=0 ; i<2 ; i++)
	{
		if(light[i].enabled)
		{
			if(light[i].position.w == 1.0)
				l = normalize((light[i].position - vPosEye).xyz);
			else
				l = normalize((light[i].position).xyz);
			vec3	r = reflect(-l, n);
			float	l_dot_n = max(dot(l, n), 0.0);
			vec3	ambient = light[i].ambient * material.ambient;
			vec3	diffuse = light[i].diffuse * material.diffuse * l_dot_n;
			vec3	specular = vec3(0.0);
			if(l_dot_n > 0.0)
			{
				specular = light[i].specular * material.specular * pow(max(dot(r, v), 0.0), material.shininess);
			}
			fColor += vec4(ambient + diffuse + specular, 1);
		}
	}
	fColor.w = 1.0;
}`;

function main()
{
    console.log(list_shader_source);
	let canvas = document.getElementById('webgl');
	let gl = canvas.getContext("webgl2");

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.2, 0.2, 0.2, 1.0);

	let V = new Matrix4();
	V.setLookAt(3, 2, 3, 0, 0, 0, 0, 1, 0);

	let P = new Matrix4();
	P.setPerspective(60, 1, 1, 100); 

	let list_shaders = [];

	// initializes shaders (reflection models)
	for(let model of ["Blinn-Gouraud", "Phong-Gouraud", "Blinn-Phong", "Phong-Phong"])
	{
		list_shaders[model] = new Shader(gl, 
            list_shader_source["vert-" + model],
            list_shader_source["frag-" + model],
			{aPosition:0, aNormal:1});
	}

	// initializes the material combobox
	let combo_mat = document.getElementById("materials");
	for(let matname in __js_materials)
	{
		let opt = document.createElement("option");
		opt.value = matname;
		opt.text = matname;
		combo_mat.add(opt, null);
	}
	combo_mat.selectedIndex = 10;

	// initializes two lights
	let list_lights = 
	[
		new Light
		(
			gl,
			[1.5, 1.5, 0, 1.0],		// position
			[0.1, 0.1, 0.1, 1.0],	// ambient
			[1.0, 1.0, 1.0, 1.0],	// diffusive
			[1.0, 1.0, 1.0, 1.0],	// specular
			false
		),
		new Light
		(
			gl,
			[0, 1.5, 1.5, 1.0],
			[0.1, 0.1, 0.1, 1.0],
			[1.0, 1.0, 1.0, 1.0],
			[1.0, 1.0, 1.0, 1.0],
			false
		)
	];

	// initializes the meshes
	let list_meshes = [];
	let monkey = new Mesh(gl);
	monkey.init_from_json_js(gl, __js_monkey, loc_aPosition, loc_aNormal);
	let monkey_smooth = new Mesh(gl);
	monkey_smooth.init_from_json_js(gl, __js_monkey_smooth, loc_aPosition, loc_aNormal);
	let monkey_sub2_smooth = new Mesh(gl);
	monkey_sub2_smooth.init_from_json_js(gl, __js_monkey_sub2_smooth, loc_aPosition, loc_aNormal);
	let cube = create_mesh_cube(gl, loc_aPosition, loc_aNormal);
	let ball = create_mesh_sphere(gl, 20, loc_aPosition, loc_aNormal);
	list_meshes["cube"] = cube;
	list_meshes["sphere"] = ball;
	list_meshes["monkey"] = monkey;
	list_meshes["monkey (smooth)"] = monkey_smooth;
	list_meshes["monkey (subdivided 2 steps, smooth)"] = monkey_sub2_smooth;

	let axes = new Axes(gl);

	let t_last = Date.now();

	const ANGLE_STEP_LIGHT = 30.0;
	const ANGLE_STEP_MESH = 30.0;

	let tick = function()
	{
		let now = Date.now();
		let elapsed = now - t_last;
		t_last = now;

		list_lights[0].M.rotate(( (ANGLE_STEP_LIGHT * elapsed) / 1000.0) % 360.0, 0, 1, 0);
		if(document.getElementById("mesh-rotating").checked)
			list_meshes[document.getElementById("objects").value].M.rotate(
				-((ANGLE_STEP_MESH * elapsed) / 1000.0) % 360.0, 0, 1, 0);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		axes.render(gl, V, P);

		for(let i in list_lights)
		{
			// for light state and render it
			list_lights[i].turn_on(document.getElementById('light' + i).checked);
			list_lights[i].set_type(document.getElementById('light' + i + "-type").value == "positional");
			list_lights[i].render(gl, V, P);
		}
		// render the selected mesh using the selected shader
		list_meshes[document.getElementById("objects").value].render(gl, 
			list_shaders[document.getElementById("shading-models").value],
			list_lights,
			__js_materials[document.getElementById("materials").value], V, P);

		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick();
}


