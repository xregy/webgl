class Shader
{
	constructor(_gl, src_vert, src_frag, attrib_names)
	{
		this.gl = _gl;
		this.init(src_vert, src_frag, attrib_names);
	}

	init(src_vert, src_frag, attrib_names)
	{
		initShaders(this.gl, src_vert, src_frag);
		this.h_prog = this.gl.program;
		this.attribs = {};
		for(let attrib of attrib_names)
		{
			this.attribs[attrib] = this.gl.getAttribLocation(this.h_prog, attrib);
		}
	}
}

class Light
{
	constructor(gl, position, ambient, diffusive, specular, enabled)
	{
		this.position = new Vector4(position);
		this.ambient = new Vector3(ambient);
		this.diffusive = new Vector3(diffusive);
		this.specular = new Vector3(specular);
		this.enabled = enabled;
		this.M = new Matrix4();
		this.MV = new Matrix4();

		var src_shader_vert = 
			  'attribute vec4 aPosition;\n'
			+ 'attribute vec4 aColor;\n'
			+ 'uniform mat4 MVP;\n'
			+ 'varying vec4 vColor;\n'
			+ 'void main()\n'
			+ '{\n'
			+ '	gl_Position = MVP * aPosition;\n'
			+ '	gl_PointSize = 10.0;\n'
			+ '	vColor = aColor;\n'
			+ '}\n';
		var src_shader_frag = '#ifdef GL_ES\n'
			+ 'precision mediump float;\n'
			+ '#endif\n'
			+ 'varying vec4 vColor;\n'
			+ 'void main()\n'
			+ '{\n'
			+ '	gl_FragColor = vColor;\n'
			+ '}\n';

		this.MVP = new Matrix4();

		this.shader = new Shader(gl, src_shader_vert, src_shader_frag, ["aPosition", "aColor"]);


	}
	transform(V)
	{
		this.MV.set(V);
		this.MV.multiply(this.M);
		this.position_eye = this.MV.multiplyVector4(this.position);
	}
	set_type(positional)
	{
		if(positional)	this.position.elements[3] = 1.0;
		else			this.position.elements[3] = 0.0;
	}
	turn_on(flag)
	{
		this.enabled = flag;
	}
	render(gl, V, P)
	{
		gl.useProgram(this.shader.h_prog);
		
		this.MVP = new Matrix4(P); this.MVP.multiply(V);
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shader.h_prog, "MVP"), false, this.MVP.elements);
		
		gl.vertexAttrib4fv(this.shader.attribs["aPosition"], this.M.multiplyVector4(this.position).elements);

		if(this.enabled)
			gl.vertexAttrib3f(this.shader.attribs["aColor"], 1, 1, 1);
		else
			gl.vertexAttrib3f(this.shader.attribs["aColor"], .1, .1, .1);
		
		gl.drawArrays(gl.POINTS, 0, 1);

		gl.useProgram(null);
	}


}


class Mesh
{
	constructor(draw_call, draw_mode, n, attribs, index_buffer_id, index_buffer_type)
	{
		this.draw_call = draw_call;
		this.draw_mode = draw_mode;
		this.n = n;
		this.index_buffer = {id:index_buffer_id, type:index_buffer_type};
		this.attribs = attribs;
		this.M = new Matrix4();
		this.MVP = new Matrix4();
		this.N = new Matrix4();
	}
	init_from_json_js(gl, json_obj)
	{
		var attribs = json_obj.data.attributes;
	
		var buf_position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attribs.position.array), gl.STATIC_DRAW);
	
		var buf_normal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attribs.normal.array), gl.STATIC_DRAW);
	
		var buf_index = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(json_obj.data.index.array), gl.STATIC_DRAW);
	
		var attribs = [];
		attribs["aPosition"] = {buffer:buf_position, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};
		attribs["aNormal"] = {buffer:buf_normal, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	
		this.draw_call = "drawElements";
		this.draw_mode = gl.TRIANGLES;
		this.n = json_obj.data.index.array.length;
		this.index_buffer = {id:buf_index, type:gl.UNSIGNED_SHORT};
		this.attribs = attribs;
	
	}


	set_uniform_matrices(gl, h_prog, V, P)
	{
		gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MV"), false, V.elements);

		this.MVP.set(P);
		this.MVP.multiply(V);
		this.MVP.multiply(this.M);
		gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, this.MVP.elements);

		this.MVP.set(V);
		this.MVP.multiply(this.M);
		this.N.setInverseOf(this.MVP);
		this.N.transpose();
		gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "matNormal"), false, this.N.elements);
	}
	
	set_uniform_light(gl, h_prog, lights)
	{
		for(var i=0 ; i<lights.length ; i++)
		{
			gl.uniform4fv(gl.getUniformLocation(h_prog, "light[" + i + "].position"), lights[i].position_eye.elements);
			gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].ambient"), lights[i].ambient.elements);
			gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].diffuse"), lights[i].diffusive.elements);
			gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].specular"), lights[i].specular.elements);
			gl.uniform1i(gl.getUniformLocation(h_prog, "light[" + i + "].enabled"), lights[i].enabled);
		}
	}
	
	set_uniform_material(gl, h_prog, mat)
	{
		gl.uniform3fv(gl.getUniformLocation(h_prog, "material.ambient"), mat.ambient.elements);
		gl.uniform3fv(gl.getUniformLocation(h_prog, "material.diffuse"), mat.diffusive.elements);
		gl.uniform3fv(gl.getUniformLocation(h_prog, "material.specular"), mat.specular.elements);
		gl.uniform1f(gl.getUniformLocation(h_prog, "material.shininess"), mat.shininess*128.0);
	}
	
	render(gl, shader, lights, material, V, P)
	{
		gl.useProgram(shader.h_prog);

		this.set_uniform_matrices(gl, shader.h_prog, V, P);
		if(lights!=null)	this.set_uniform_light(gl, shader.h_prog, lights);
		if(material!=null)	this.set_uniform_material(gl, shader.h_prog, material);

		for(var attrib_name in this.attribs)
		{
			var attrib = this.attribs[attrib_name];
			gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
			gl.vertexAttribPointer(shader.attribs[attrib_name], attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.enableVertexAttribArray(shader.attribs[attrib_name]);
		}
		if(this.draw_call == "drawArrays")
		{
			gl.drawArrays(this.draw_mode, 0, this.n);
		}
		else if(this.draw_call == "drawElements")
		{
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer.id);
			gl.drawElements(this.draw_mode, this.n, this.index_buffer.type, 0);
		}
	
		for(var attrib_name in this.attribs)
		{
			gl.disableVertexAttribArray(shader.attribs[attrib_name]);
		}
	
		gl.useProgram(null);
	}
}


class Axes
{
	constructor(gl)
	{
		var src_shader_vert = 
			  'attribute vec4 aPosition;\n'
			+ 'attribute vec4 aColor;\n'
			+ 'uniform mat4 MVP;\n'
			+ 'varying vec4 vColor;\n'
			+ 'void main()\n'
			+ '{\n'
			+ '	gl_Position = MVP * aPosition;\n'
			+ '	vColor = aColor;\n'
			+ '}\n';
		var src_shader_frag = '#ifdef GL_ES\n'
			+ 'precision mediump float;\n'
			+ '#endif\n'
			+ 'varying vec4 vColor;\n'
			+ 'void main()\n'
			+ '{\n'
			+ '	gl_FragColor = vColor;\n'
			+ '}\n';
		this.MVP = new Matrix4();

		this.shader = new Shader(gl, src_shader_vert, src_shader_frag, ["aPosition", "aColor"]);

		this.init_vbo(gl);
	}

	init_vbo(gl)
	{
		var vertices = new Float32Array([
		  // Vertex coordinates and color
		  0,0,0, 1,0,0,
		  2,0,0, 1,0,0,
		
		  0,0,0, 0,1,0,
		  0,2,0, 0,1,0,
		
		  0,0,0, 0,0,1,
		  0,0,2, 0,0,1,
		]);
		
		var vbo = gl.createBuffer();  
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		
		var FSIZE = vertices.BYTES_PER_ELEMENT;
		
		this.attribs = [];

		this.attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
		this.attribs["aColor"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};
	
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	set_uniform_matrices(gl, h_prog, V, P)
	{
		this.MVP.set(P);
		this.MVP.multiply(V);
		gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, this.MVP.elements);
	}
	
	render(gl, V, P)
	{
		gl.useProgram(this.shader.h_prog);

		this.set_uniform_matrices(gl, this.shader.h_prog, V, P);

		for(var attrib_name in this.attribs)
		{
			var attrib = this.attribs[attrib_name];
			gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
			gl.vertexAttribPointer(this.shader.attribs[attrib_name], attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.enableVertexAttribArray(this.shader.attribs[attrib_name]);
		}
		gl.drawArrays(gl.LINES, 0, 6);

		for(var attrib_name in this.attribs)
		{
			gl.disableVertexAttribArray(this.shader.attribs[attrib_name]);
		}
	
		gl.useProgram(null);

	}
}


var g_list_shaders = [];
var g_list_meshes = {};
var g_list_lights = {};
var g_axes;
var g_light_rotating;
var g_light_static;

function init_models(gl, V, P)
{
	var attrib_names = ["aPosition", "aNormal"];
	var models = ["Blinn-Gouraud", "Phong-Gouraud", "Blinn-Phong", "Phong-Phong"];
	for(let model of models)
	{
		var src_vert = document.getElementById("vert-" + model).text;
		var src_frag = document.getElementById("frag-" + model).text;
		g_list_shaders[model] = new Shader(gl, src_vert, src_frag, attrib_names);
	}

	var combo_shading = document.getElementById("shading-models");
	for(var name in g_list_shaders)
	{
		var opt = document.createElement("option");
		opt.value = name;
		opt.text = name;
		combo_shading.add(opt, null);
	}
	combo_shading.selectedIndex = 0;
	combo_shading.onchange = function(ev) { refresh_scene(gl, V, P) };

}

function init_materials(gl, V, P)
{
	var combo_mat = document.getElementById("materials");
	for(matname in __js_materials)
	{
		var opt = document.createElement("option");
		opt.value = matname;
		opt.text = matname;
		combo_mat.add(opt, null);
	}
	combo_mat.selectedIndex = 10;
	combo_mat.onchange = function(ev) { refresh_scene(gl, V, P) };
}

function init_lights(gl, V, P)
{
	g_light_rotating = new Light
	(
		gl,
		[1.5, 1.5, 0, 1.0],		// position
		[0.1, 0.1, 0.1, 1.0],	// ambient
		[1.0, 1.0, 1.0, 1.0],	// diffusive
		[1.0, 1.0, 1.0, 1.0],	// specular
		false
	);
	
	g_light_static = new Light
	(
		gl,
		[0, 1.5, 1.5, 1.0],
		[0.1, 0.1, 0.1, 1.0],
		[1.0, 1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0, 1.0],
		false
	);


	var combo_light;
	
	combo_light = document.getElementById("light-rotating-type");
	combo_light.selectedIndex = 1;
	combo_light.onchange = function(ev) { refresh_scene(gl, V, P) };
	document.getElementById("light-rotating").onchange = function(ev) { refresh_scene(gl, V, P) };
	combo_light = document.getElementById("light-static-type");
	combo_light.selectedIndex = 1;
	combo_light.onchange = function(ev) { refresh_scene(gl, V, P) };
	document.getElementById("light-static").onchange = function(ev) { refresh_scene(gl, V, P) };

	g_list_lights["light-rotating"] = g_light_rotating;
	g_list_lights["light-static"] = g_light_static;

};

function init_meshes(gl, V, P)
{
	var monkey = new Mesh();				monkey.init_from_json_js(gl, __js_monkey);
	var monkey_smooth = new Mesh();			monkey_smooth.init_from_json_js(gl, __js_monkey_smooth);
	var monkey_sub2_smooth = new Mesh();	monkey_sub2_smooth.init_from_json_js(gl, __js_monkey_sub2_smooth);
	var cube = init_vbo_cube(gl);
	var ball = init_vbo_sphere(gl);


	var combo_obj = document.getElementById("objects");
	combo_obj.selectedIndex = 2;
	combo_obj.onchange = function(ev) { refresh_scene(gl, V, P) };

	g_list_meshes["cube"] = cube;
	g_list_meshes["sphere"] = ball;
	g_list_meshes["monkey"] = monkey;
	g_list_meshes["monkey (smooth)"] = monkey_smooth;
	g_list_meshes["monkey (subdivided 2 steps, smooth)"] = monkey_sub2_smooth;
}


var ANGLE_STEP_LIGHT = 30.0;
var ANGLE_STEP_MESH = 30.0;

function main()
{
	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);

	var V = new Matrix4();
	var P = new Matrix4();

	init_models(gl);
	init_materials(gl);
	init_lights(gl);
	init_meshes(gl);

	g_axes = new Axes(gl);

	gl.clearColor(0.2, 0.2, 0.2, 1.0);

	var tick = function()
	{
		elapsed = animate();  // Update the rotation angle

		var	angle;

		angle = ( (ANGLE_STEP_LIGHT * elapsed) / 1000.0) % 360.0;
		g_light_rotating.M.rotate(angle, 0, 1, 0);

		var combo_object = document.getElementById("objects");
		var obj = g_list_meshes[combo_object.options[combo_object.selectedIndex].value];
		angle = ((ANGLE_STEP_MESH * elapsed) / 1000.0) % 360.0;
		if(document.getElementById("mesh-rotating").checked)	obj.M.rotate(-angle, 0, 1, 0);

		refresh_scene(gl, V, P);   // Draw the triangle
		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick();

}



function refresh_scene(gl, V, P)
{
	var combo_shader = document.getElementById("shading-models");
	var shader_model = g_list_shaders[combo_shader.options[combo_shader.selectedIndex].value];

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	V.setLookAt(3, 2, 3, 0, 0, 0, 0, 1, 0);

	P.setPerspective(60, 1, 1, 100); 

	for(name in g_list_lights)
	{
		g_list_lights[name].transform(V);
		g_list_lights[name].turn_on(document.getElementById(name).checked);

		var combo_light = document.getElementById(name + "-type");
		light_type = combo_light.options[combo_light.selectedIndex].value;

		g_list_lights[name].set_type(light_type == "positional");
	}

	g_axes.render(gl, V, P);

	var combo_object = document.getElementById("objects");

	var obj = g_list_meshes[combo_object.options[combo_object.selectedIndex].value];

	obj.render(gl, shader_model, [g_light_rotating, g_light_static], __js_materials[document.getElementById("materials").value], V, P);

	g_light_rotating.render(gl, V, P);
	g_light_static.render(gl, V, P);
}




function init_vbo_cube(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
	var verts = new Float32Array([
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
    
   
	var vbo = gl.createBuffer();
    
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	var FSIZE = verts.BYTES_PER_ELEMENT;
	var attribs = [];
	attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs["aNormal"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return new Mesh("drawArrays", gl.TRIANGLES, 36, attribs, -1, null);
}


// http://rodger.global-linguist.com/webgl/ch08/PointLightedSphere.js
function init_vbo_sphere(gl) 
{ // Create a sphere
	var SPHERE_DIV = 13;
	
	var i, ai, si, ci;
	var j, aj, sj, cj;
	var p1, p2;
	
	var positions = [];
	var indices = [];
	
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
    
	var buf_position = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	var buf_normal = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	var attribs = [];
	attribs["aPosition"] = {buffer:buf_position, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	attribs["aNormal"] = {buffer:buf_normal, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};


	var buf_index = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
	return new Mesh("drawElements", gl.TRIANGLES, indices.length, attribs, buf_index, gl.UNSIGNED_SHORT); 
}

var g_last = Date.now();
function animate() {
	// Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	return elapsed;
}

