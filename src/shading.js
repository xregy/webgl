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


function main()
{
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);

//	h_prog_Blinn_Gouraud = init_shaders(gl, "vert-Blinn-Gouraud", "frag-Blinn-Gouraud");
//	h_prog_Phong_Gouraud = init_shaders(gl, "vert-Phong-Gouraud", "frag-Phong-Gouraud");
//	h_prog_Blinn_Phong = init_shaders(gl, "vert-Blinn-Phong", "frag-Blinn-Phong");
//	h_prog_Phong_Phong = init_shaders(gl, "vert-Phong-Phong", "frag-Phong-Phong");

//	console.log("Blinn-Gouraud");
	initShaders(gl, document.getElementById("vert-Blinn-Gouraud").text, document.getElementById("frag-Blinn-Gouraud").text);
	h_prog_Blinn_Gouraud = gl.program;
//	console.log("Phong-Gouraud");
	initShaders(gl, document.getElementById("vert-Phong-Gouraud").text, document.getElementById("frag-Phong-Gouraud").text);
	h_prog_Phong_Gouraud = gl.program;
//	console.log("Blinn-Phong");
	initShaders(gl, document.getElementById("vert-Blinn-Phong").text, document.getElementById("frag-Blinn-Phong").text);
	h_prog_Blinn_Phong = gl.program;
//	console.log("Phong-Phong");
	initShaders(gl, document.getElementById("vert-Phong-Phong").text, document.getElementById("frag-Phong-Phong").text);
	h_prog_Phong_Phong = gl.program;

	list_shaders.push({name:"Blinn-Gouraud", h_prog:h_prog_Blinn_Gouraud, loc_Position:-1, loc_Normal:-1});
	list_shaders.push({name:"Phong-Gouraud", h_prog:h_prog_Phong_Gouraud, loc_Position:-1, loc_Normal:-1});
	list_shaders.push({name:"Blinn-Phong", h_prog:h_prog_Blinn_Phong, loc_Position:-1, loc_Normal:-1});
	list_shaders.push({name:"Phong-Phong", h_prog:h_prog_Phong_Phong, loc_Position:-1, loc_Normal:-1});
 
	init_vbo_cube(gl);

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

	var	combo_shading = document.getElementById("shading-models");

	for(var i=0 ; i<list_shaders.length ; i++)
	{
		var opt = document.createElement("option");
		opt.value = i;
		opt.text = list_shaders[i].name;
		combo_shading.add(opt, null);
		init_locations(gl, list_shaders[i]);
	}
	combo_shading.selectedIndex = 3;
	combo_shading.onchange = function(ev) { refresh_scene(gl) };

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

	refresh_scene(gl);
}

function refresh_scene(gl)
{
	var	shader = list_shaders[document.getElementById("shading-models").selectedIndex];
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shader.h_prog);

	var	M = new Matrix4();
	var V = new Matrix4();
	var	P = new Matrix4();
	var	matNormal = new Matrix4();

	V.setLookAt(3, 2, 3, 0, 0, 0, 0, 1, 0);
	P.setPerspective(60, 1, 1, 100); 

    gl.uniformMatrix4fv(gl.getUniformLocation(shader.h_prog, "V"), false, V.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(shader.h_prog, "MV"), false, (M.multiply(M)).elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(shader.h_prog, "MVP"), false, ((P.multiply(V)).multiply(M)).elements);

	matNormal.setInverseOf(M);
	matNormal.transpose();
	gl.uniformMatrix4fv(gl.getUniformLocation(shader.h_prog, "matNormal"), false, matNormal.elements);

	set_light(gl, shader);
	set_material(gl, shader);

	enable_attribs(gl, shader);

	for(var i=0 ; i<6 ; i++)
    	gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);
}

function set_light(gl, shader)
{
	gl.uniform4f(gl.getUniformLocation(shader.h_prog, "light.position"), light.position[0], light.position[1], light.position[2], light.position[3]);
	gl.uniform3f(gl.getUniformLocation(shader.h_prog, "light.ambient"), light.ambient[0], light.ambient[1], light.ambient[2]);
	gl.uniform3f(gl.getUniformLocation(shader.h_prog, "light.diffuse"), light.diffuse[0], light.diffuse[1], light.diffuse[2]);
	gl.uniform3f(gl.getUniformLocation(shader.h_prog, "light.specular"), light.specular[0], light.specular[1], light.specular[2]);
}

function set_material(gl, shader)
{
	var	mat = list_mats[document.getElementById("materials").selectedIndex];
	gl.uniform3f(gl.getUniformLocation(shader.h_prog, "material.ambient"), mat.ambient[0], mat.ambient[1], mat.ambient[2]);
	gl.uniform3f(gl.getUniformLocation(shader.h_prog, "material.diffuse"), mat.diffuse[0], mat.diffuse[1], mat.diffuse[2]);
	gl.uniform3f(gl.getUniformLocation(shader.h_prog, "material.specular"), mat.specular[0], mat.specular[1], mat.specular[2]);
	gl.uniform1f(gl.getUniformLocation(shader.h_prog, "material.shininess"), mat.shininess);
}


function init_shaders(gl, id_vert, id_frag)
{
	var src_vert = document.getElementById(id_vert).text;
	var src_frag = document.getElementById(id_frag).text;

    var h_vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(h_vert, src_vert);
    gl.compileShader(h_vert);

    var	h_frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(h_frag, src_frag);
    gl.compileShader(h_frag);

    var h_prog = gl.createProgram();
    gl.attachShader(h_prog, h_vert);
    gl.attachShader(h_prog, h_frag);

    gl.linkProgram(h_prog);

	return h_prog;
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
         1, 1, 1,     1, 0, 0,  // v0
         1,-1, 1,     1, 0, 0,  // v3
         1,-1,-1,     1, 0, 0,  // v4
         1, 1,-1,     1, 0, 0,  // v5

         1, 1, 1,     0, 1, 0,  // v0
         1, 1,-1,     0, 1, 0,  // v5
        -1, 1,-1,     0, 1, 0,  // v6
        -1, 1, 1,     0, 1, 0,  // v1

         1, 1, 1,     0, 0, 1,  // v0
        -1, 1, 1,     0, 0, 1,  // v1
        -1,-1, 1,     0, 0, 1,  // v2
         1,-1, 1,     0, 0, 1,  // v3

        -1,-1,-1,    -1, 0, 0,  // v7
        -1,-1, 1,    -1, 0, 0,  // v2
        -1, 1, 1,    -1, 0, 0,  // v1
        -1, 1,-1,    -1, 0, 0,  // v6

        -1,-1,-1,     0, 0,-1,  // v7
        -1, 1,-1,     0, 0,-1,  // v6
         1, 1,-1,     0, 0,-1,  // v5
         1,-1,-1,     0, 0,-1,  // v4

        -1,-1,-1,     0,-1, 0,  // v7
         1,-1,-1,     0,-1, 0,  // v4
         1,-1, 1,     0,-1, 0,  // v3
        -1,-1, 1,     0,-1, 0,  // v2
    ]);
    
   
    var vbo = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
//    var FSIZE = verts.BYTES_PER_ELEMENT;

   return;

}

function init_locations(gl, shader)
{
//	console.log(shader);
//	gl.UseProgram(shader.h_prog);
	shader.loc_Position = gl.getAttribLocation(shader.h_prog, 'aPosition');
	shader.loc_Color = gl.getAttribLocation(shader.h_prog, 'aNormal');
	shader.loc_MVP = gl.getUniformLocation(shader.h_prog, 'MVP');
	shader.loc_MV = gl.getUniformLocation(shader.h_prog, 'MV');
	shader.loc_V = gl.getUniformLocation(shader.h_prog, 'V');
	shader.loc_matNormal = gl.getUniformLocation(shader.h_prog, 'matNormal');
}

function enable_attribs(gl, shader)
{
	gl.vertexAttribPointer(shader.loc_Position, 3, gl.FLOAT, false, 4 * 6, 0);
	gl.enableVertexAttribArray(shader.loc_Position);
	gl.vertexAttribPointer(shader.loc_Color, 3, gl.FLOAT, false, 4 * 6, 4 * 3);
	gl.enableVertexAttribArray(shader.loc_Color);
}
