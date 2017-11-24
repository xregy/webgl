var list_mats = 
[
	//	http://devernay.free.fr/cours/opengl/materials.html
	{name:"emerald",		ambient:[0.0215,0.1745,0.0215],			diffuse:[0.07568,0.61424,0.07568],		specular:[0.633,0.727811,0.633],				shininess:0.6},
	{name:"jade",			ambient:[0.135,0.2225,0.1575],			diffuse:[0.54,0.89,0.63],				specular:[0.316228,0.316228,0.316228],			shininess:0.1},
	{name:"obsidian",		ambient:[0.05375,0.05,0.06625],			diffuse:[0.18275,0.17,0.22525],			specular:[0.332741,0.328634,0.346435],			shininess:0.3},
	{name:"pearl",			ambient:[0.25,0.20725,0.20725],			diffuse:[1,0.829,0.829],				specular:[0.296648,0.296648,0.296648],			shininess:0.088},
	{name:"ruby",			ambient:[0.1745,0.01175,0.01175],		diffuse:[0.61424,0.04136,0.04136],		specular:[0.727811,0.626959,0.626959],			shininess:0.6},
	{name:"turquoise",		ambient:[0.1,0.18725,0.1745],			diffuse:[0.396,0.74151,0.69102],		specular:[0.297254,0.30829,0.306678],			shininess:0.1},
	{name:"brass",			ambient:[0.329412,0.223529,0.027451],	diffuse:[0.780392,0.568627,0.113725],	specular:[0.992157,0.941176,0.807843],			shininess:0.21794872},
	{name:"bronze",			ambient:[0.2125,0.1275,0.054],			diffuse:[0.714,0.4284,0.18144],			specular:[0.393548,0.271906,0.166721],			shininess:0.2},
	{name:"chrome",			ambient:[0.25,0.25,0.25],				diffuse:[0.4,0.4,0.4],					specular:[0.774597,0.774597,0.774597],			shininess:0.6},
	{name:"copper",			ambient:[0.19125,0.0735,0.0225],		diffuse:[0.7038,0.27048,0.0828],		specular:[0.256777,0.137622,0.086014],			shininess:0.1},
	{name:"gold",			ambient:[0.24725,0.1995,0.0745],		diffuse:[0.75164,0.60648,0.22648],		specular:[0.628281,0.555802,0.366065],			shininess:0.4},
	{name:"silver",			ambient:[0.19225,0.19225,0.19225],		diffuse:[0.50754,0.50754,0.50754],		specular:[0.508273,0.508273,0.508273],			shininess:0.4},
	{name:"black plastic",	ambient:[0.0,0.0,0.0],					diffuse:[0.01,0.01,0.01],				specular:[0.50,0.50,0.50],						shininess:.25},
	{name:"cyan plastic",	ambient:[0.0,0.1,0.06],					diffuse:[0.0,0.50980392,0.50980392],	specular:[0.50196078,0.50196078,0.50196078],	shininess:.25},
	{name:"green plastic",	ambient:[0.0,0.0,0.0],					diffuse:[0.1,0.35,0.1],					specular:[0.45,0.55,0.45],						shininess:.25},
	{name:"red plastic",	ambient:[0.0,0.0,0.0],					diffuse:[0.5,0.0,0.0],					specular:[0.7,0.6,0.6],							shininess:.25},
	{name:"white plastic",	ambient:[0.0,0.0,0.0],					diffuse:[0.55,0.55,0.55],				specular:[0.70,0.70,0.70],						shininess:.25},
	{name:"yellow plastic",	ambient:[0.0,0.0,0.0],					diffuse:[0.5,0.5,0.0],					specular:[0.60,0.60,0.50],						shininess:.25},
	{name:"black rubber",	ambient:[0.02,0.02,0.02],				diffuse:[0.01,0.01,0.01],				specular:[0.4,0.4,0.4],							shininess:.078125},
	{name:"cyan rubber",	ambient:[0.0,0.05,0.05],				diffuse:[0.4,0.5,0.5],					specular:[0.04,0.7,0.7],						shininess:.078125},
	{name:"green rubber",	ambient:[0.0,0.05,0.0],					diffuse:[0.4,0.5,0.4],					specular:[0.04,0.7,0.04],						shininess:.078125},
	{name:"red rubber",		ambient:[0.05,0.0,0.0],					diffuse:[0.5,0.4,0.4],					specular:[0.7,0.04,0.04],						shininess:.078125},
	{name:"white rubber",	ambient:[0.05,0.05,0.05],				diffuse:[0.5,0.5,0.5],					specular:[0.7,0.7,0.7],							shininess:.078125},
	{name:"yellow rubber",	ambient:[0.05,0.05,0.0],				diffuse:[0.5,0.5,0.4],					specular:[0.7,0.7,0.04],						shininess:.078125},
];

var	list_shaders = [];


var light = { position:[1.5, 1.5, 0, 0.0], ambient: [0.5, 0.5, 0.5, 1.0], diffuse: [1.0, 1.0, 1.0, 1.0], specular:[1.0, 1.0, 1.0, 1.0],
                position_transformed:null};

function init_shader(gl, src_vert, src_frag, attrib_names)
{
	initShaders(gl, src_vert, src_frag);
	h_prog = gl.program;
	var	attribs = {};
	for(let attrib of attrib_names)
	{
		attribs[attrib] = gl.getAttribLocation(h_prog, attrib);
	}
	return {h_prog:h_prog, attribs:attribs};
}

function init_models(gl)
{
	var	attrib_names = ["aPosition", "aNormal"];
	var	models = ["Blinn-Gouraud", "Phong-Gouraud", "Blinn-Phong", "Phong-Phong"];
	for(let model of models)
	{
		var	src_vert = document.getElementById("vert-" + model).text;
		var	src_frag = document.getElementById("frag-" + model).text;
		list_shaders[model] = init_shader(gl, src_vert, src_frag, attrib_names);
	}

	var	combo_shading = document.getElementById("shading-models");
	for(var name in list_shaders)
	{
		var opt = document.createElement("option");
		opt.value = name;
		opt.text = name;
		combo_shading.add(opt, null);
	}
	combo_shading.selectedIndex = 2;
	combo_shading.onchange = function(ev) { refresh_scene(gl) };

}

function init_materials(gl)
{
	var	combo_mat = document.getElementById("materials");
	for(var i=0 ; i<list_mats.length ; i++)
	{
		var opt = document.createElement("option");
		opt.value = i;
		opt.text = list_mats[i].name;
		combo_mat.add(opt, null);
	}
	combo_mat.selectedIndex = 10;
	combo_mat.onchange = function(ev) { refresh_scene(gl) };
}

function init_lights(gl)
{
	var	combo_light = document.getElementById("light-type");
    combo_light.selectedIndex = 1;
	combo_light.onchange = function(ev) { refresh_scene(gl) };
};

function init_objects(gl)
{
	var	combo_obj = document.getElementById("objects");
	combo_obj.onchange = function(ev) { refresh_scene(gl) };
}

var	cube;
var	axes;
var	ball;
var	monkey;
var	monkey_smooth;
var	turkey_flat;
var	shader_axes;


function main()
{
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);

	shader_axes = init_shader(gl,
								document.getElementById("vert-axes").text, 
								document.getElementById("frag-axes").text,
								["aPosition", "aColor"]);
 
	cube = init_vbo_cube(gl);
	axes = init_vbo_axes(gl);
	ball = init_vbo_sphere(gl);
	monkey_smooth = parse_json_js(gl, __js_monkey_smooth);
	monkey = parse_json_js(gl, __js_monkey);
	turkey_flat = parse_json_js(gl, __js_turkey_flat);

	init_models(gl);
	init_materials(gl);
    init_lights(gl);
    init_objects(gl);

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
//    gl.clearColor(0, 0, 0, 1.0);

	var tick = function() {
		angle = animate(angle);  // Update the rotation angle
		refresh_scene(gl);   // Draw the triangle
		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick();

}

var angle = 0;

function refresh_scene(gl)
{
	var	combo_shader = document.getElementById("shading-models");
	var	shader_model = list_shaders[combo_shader.options[combo_shader.selectedIndex].value];
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    update_xforms(gl);

	render_object(gl, shader_axes, axes);


	var	combo_object = document.getElementById("objects");
	var	object_name = combo_object.options[combo_object.selectedIndex].value;

	if(object_name == "cube")			render_object(gl, shader_model, turkey_flat);
	else if(object_name == "sphere")	render_object(gl, shader_model, ball);
	else if(object_name == "monkey")	render_object(gl, shader_model, monkey);
	else if(object_name == "monkey (smooth)")	render_object(gl, shader_model, monkey_smooth);

    render_light_source(gl);
}

function render_light_source(gl)
{
    gl.useProgram(shader_axes.h_prog);

    var VP = new Matrix4(P); VP.multiply(V);
    gl.uniformMatrix4fv(gl.getUniformLocation(shader_axes.h_prog, "VP"), false, VP.elements);

    var m = new Matrix4();
    m.setRotate(angle, 0, 1, 0);

    gl.vertexAttrib4fv(shader_axes.attribs["aPosition"], (m.multiplyVector4(new Vector4(light.position))).elements);
    gl.vertexAttrib3f(shader_axes.attribs["aColor"], 1, 1, 1);

    gl.drawArrays(gl.POINTS, 0, 1);
}

function render_object(gl, shader, object)
{
    gl.useProgram(shader.h_prog);
	set_uniforms(gl, shader.h_prog);

	for(var attrib_name in object.attribs)
	{
		var	attrib = object.attribs[attrib_name];
		gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
		gl.vertexAttribPointer(shader.attribs[attrib_name], attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.enableVertexAttribArray(shader.attribs[attrib_name]);
	}
	if(object.drawcall == "drawArrays")
	{
		gl.drawArrays(object.type, 0, object.n);
	}
	else if(object.drawcall == "drawElements")
	{
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.buf_index);
		gl.drawElements(object.type, object.n, object.type_index, 0);
	}

	for(var attrib_name in object.attribs)
	{
		gl.disableVertexAttribArray(shader.attribs[attrib_name]);
	}

    gl.useProgram(null);
}

function set_uniforms(gl, h_prog)
{
	set_xforms(gl, h_prog);
	set_light(gl, h_prog);
	set_material(gl, h_prog);
}

var	M;
var V;
var	P;
var	matNormal;


function update_xforms(gl)
{
	M = new Matrix4();
	V = new Matrix4();
	P = new Matrix4();
	matNormal = new Matrix4();

    V.setLookAt(3, 2, 3, 0, 0, 0, 0, 1, 0);

	P.setPerspective(60, 1, 1, 100); 

	var MV = new Matrix4(V); MV.multiply(M);
	matNormal.setInverseOf(MV);
	matNormal.transpose();

    var combo_light = document.getElementById("light-type");
	var	light_type = combo_light.options[combo_light.selectedIndex].value;

    var m = new Matrix4(V);
    m.rotate(angle, 0, 1, 0);
    if(light_type == "directional") light.position[3] = 0;
    else                            light.position[3] = 1;

    light.position_xformed = m.multiplyVector4(new Vector4(light.position));
}


function set_xforms(gl, h_prog)
{
    var VP = new Matrix4(P); VP.multiply(V);
    var MV = new Matrix4(V); MV.multiply(M);
    var MVP = new Matrix4(P); MVP.multiply(V); MVP.multiply(M);
//    var V_inv = new Matrix4();
//    V_inv.setInverseOf(V);

    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "VP"), false, VP.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MV"), false, MV.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, MVP.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "matNormal"), false, matNormal.elements);
//  gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "V"), false, V.elements);
//  gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "V_inv"), false, V_inv.elements);
//  gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "M"), false, M.elements);

}

function set_light(gl, h_prog)
{
	gl.uniform4fv(gl.getUniformLocation(h_prog, "light.position"), light.position_xformed.elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "light.ambient"), (new Vector3(light.ambient)).elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "light.diffuse"), (new Vector3(light.diffuse)).elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "light.specular"), (new Vector3(light.specular)).elements);

    var V_inv = new Matrix4();
    V_inv.setInverseOf(V);

	var	eye = new Vector4([0,0,0,1]);
	var	pos_eye_world = V_inv.multiplyVector4(eye);

    gl.uniform4fv(gl.getUniformLocation(h_prog, "light.eye_world"), pos_eye_world.elements);
}

function set_material(gl, h_prog)
{
	var	mat = list_mats[document.getElementById("materials").selectedIndex];
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.ambient"), (new Vector3(mat.ambient)).elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.diffuse"), (new Vector3(mat.diffuse)).elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.specular"), (new Vector3(mat.specular)).elements);
	gl.uniform1f(gl.getUniformLocation(h_prog, "material.shininess"), mat.shininess*128.0);
}
function init_vbo_axes(gl)
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
   
    // Write the vertex information and enable it
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    var FSIZE = vertices.BYTES_PER_ELEMENT;
    
	var	attribs = [];
	attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs["aColor"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
   
    return {n:6, drawcall:"drawArrays", type:gl.LINES, attribs:attribs};
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
	var	attribs = [];
	attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs["aNormal"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return {n:36, drawcall:"drawArrays", type:gl.TRIANGLES, attribs:attribs};
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
    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);
            
            positions.push(si * sj);  // X
            positions.push(cj);       // Y
            positions.push(ci * sj);  // Z
        }
    }
    
    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
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
    
	var	buf_position = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	var	buf_normal = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

	var	attribs = [];
	attribs["aPosition"] = {buffer:buf_position, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	attribs["aNormal"] = {buffer:buf_normal, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};


	var	buf_index = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    return {n:indices.length, drawcall:"drawElements", buf_index:buf_index, type_index:gl.UNSIGNED_SHORT, type:gl.TRIANGLES, attribs:attribs};
}

function parse_json_js(gl, obj)
{
//	console.log(obj.data.attributes);
	console.log(obj.data);

	var	attributes = obj.data.attributes;

	var	buf_position = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes.position.array), gl.STATIC_DRAW);

	var	buf_normal = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes.normal.array), gl.STATIC_DRAW);

	var	buf_index = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.data.index.array), gl.STATIC_DRAW);

	var	attribs = [];
	attribs["aPosition"] = {buffer:buf_position, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	attribs["aColor"] = {buffer:buf_normal, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};

    return {n:obj.data.index.array.length, drawcall:"drawElements", buf_index:buf_index, type_index:gl.UNSIGNED_SHORT, type:gl.TRIANGLES, attribs:attribs};
}

var g_last = Date.now();
var ANGLE_STEP = 30.0;
function animate(angle) {
	// Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
	return newAngle %= 360;
}

