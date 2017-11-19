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

var light = {
	position:[2.0, 2.0, 2.0, 0.0],
	ambient:[0.5, 0.5, 0.5],
	diffuse:[1.0, 1.0, 1.0],
	specular:[1.0, 1.0, 1.0]
};

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
	combo_shading.selectedIndex = 3;
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


var	cube;
var	axes;
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

	init_models(gl);
	init_materials(gl);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

	refresh_scene(gl);
}

function refresh_scene(gl)
{
	var	combo_shader = document.getElementById("shading-models");
	var	shader_model = list_shaders[combo_shader.options[combo_shader.selectedIndex].value];
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	render_object(gl, shader_model, cube);

	render_object(gl, shader_axes, axes);
}

function render_object(gl, shader, object)
{
    gl.useProgram(shader.h_prog);
	set_uniforms(gl, shader.h_prog);

	gl.bindBuffer(gl.ARRAY_BUFFER, object.vbo);
	for(var attrib_name in object.attribs)
	{
		var	attrib = object.attribs[attrib_name];
		gl.vertexAttribPointer(shader.attribs[attrib_name], attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
		gl.enableVertexAttribArray(shader.attribs[attrib_name]);
	}
	gl.drawArrays(object.type, 0, object.n);
	for(var attrib_name in object.attribs)
	{
		gl.disableVertexAttribArray(shader.attribs[attrib_name]);
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function set_uniforms(gl, h_prog)
{
	set_xforms(gl, h_prog);
	set_light(gl, h_prog);
	set_material(gl, h_prog);
}
function set_xforms(gl, h_prog)
{
	var	M = new Matrix4();
	var V = new Matrix4();
	var	P = new Matrix4();
	var	matNormal = new Matrix4();

	M.setRotate(30, 0, 1, 0);
	V.setLookAt(3, 2, 3, 0, 0, 0, 0, 1, 0);
	P.setPerspective(60, 1, 1, 100); 
	matNormal.setInverseOf(M);
	matNormal.transpose();

	loc = gl.getUniformLocation(h_prog, "VP")
	if(loc != null) gl.uniformMatrix4fv(loc, false, (P.multiply(V)).elements);
	loc = gl.getUniformLocation(h_prog, "V")
    if(loc != null)	gl.uniformMatrix4fv(loc, false, V.elements);
	loc = gl.getUniformLocation(h_prog, "MV")
    if(loc != null)	gl.uniformMatrix4fv(loc, false, (V.multiply(M)).elements);
	loc = gl.getUniformLocation(h_prog, "MVP")
    if(loc != null)	gl.uniformMatrix4fv(loc, false, ((P.multiply(V)).multiply(M)).elements);
	loc = gl.getUniformLocation(h_prog, "matNormal")
	if(loc != null)	gl.uniformMatrix4fv(loc, false, matNormal.elements);
}

function set_light(gl, h_prog)
{
	gl.uniform4f(gl.getUniformLocation(h_prog, "light.position"), light.position[0], light.position[1], light.position[2], light.position[3]);
	gl.uniform3f(gl.getUniformLocation(h_prog, "light.ambient"), light.ambient[0], light.ambient[1], light.ambient[2]);
	gl.uniform3f(gl.getUniformLocation(h_prog, "light.diffuse"), light.diffuse[0], light.diffuse[1], light.diffuse[2]);
	gl.uniform3f(gl.getUniformLocation(h_prog, "light.specular"), light.specular[0], light.specular[1], light.specular[2]);
}

function set_material(gl, h_prog)
{
	var	mat = list_mats[document.getElementById("materials").selectedIndex];
	gl.uniform3f(gl.getUniformLocation(h_prog, "material.ambient"), mat.ambient[0], mat.ambient[1], mat.ambient[2]);
	gl.uniform3f(gl.getUniformLocation(h_prog, "material.diffuse"), mat.diffuse[0], mat.diffuse[1], mat.diffuse[2]);
	gl.uniform3f(gl.getUniformLocation(h_prog, "material.specular"), mat.specular[0], mat.specular[1], mat.specular[2]);
	gl.uniform1f(gl.getUniformLocation(h_prog, "material.shininess"), mat.shininess);
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
	attribs["aPosition"] = {size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs["aNormal"] = {size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return {vbo:vbo, n:36, type:gl.TRIANGLES, attribs:attribs};
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
	attribs["aPosition"] = {size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs["aColor"] = {size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
   
    return {vbo:vbo, n:6, type:gl.LINES, attribs:attribs};
}




