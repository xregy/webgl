var	list_shaders = [];

var light = {
	position:[1.5, 0, 0, 1], 
	direction:[-1,0,0,0],
	cuotff_angle:-1,
	ambient: [0.5, 0.5, 0.5, 1.0], 
	diffuse: [1.0, 1.0, 1.0, 1.0], 
	specular:[1.0, 1.0, 1.0, 1.0],
	position_transformed:null
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
    for(matname in __js_materials)
	{
		var opt = document.createElement("option");
		opt.value = matname;
		opt.text = matname;
		combo_mat.add(opt, null);
	}
	combo_mat.selectedIndex = 10;
	combo_mat.onchange = function(ev) { refresh_scene(gl) };
}

function init_lights(gl)
{
	document.getElementById("cutoff-angle").onchange = function(ev) { refresh_scene(gl) };
};

function init_objects(gl)
{
	var	combo_object = document.getElementById("objects");
	combo_object.selectedIndex = 2;
}

var	monkey;
var	cube;
var	ball;

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
 
	axes = init_vbo_axes(gl);
	cube = init_vbo_cube(gl);
	ball = init_vbo_sphere(gl);
	monkey = parse_json_js(gl, __js_monkey_sub2_smooth);

	init_models(gl);
	init_materials(gl);
    init_lights(gl);
    init_objects(gl);

    gl.clearColor(0.2, 0.2, 0.2, 1.0);

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

	light.cutoff_angle = parseInt(document.getElementById("cutoff-angle").value);

    update_xforms(gl);

	render_object(gl, shader_axes, axes);

	var	combo_object = document.getElementById("objects");
	var	object_name = combo_object.options[combo_object.selectedIndex].value;
	if(object_name == "cube")			render_object(gl, shader_model, cube);
	else if(object_name == "sphere")	render_object(gl, shader_model, ball);
	else if(object_name == "monkey")	render_object(gl, shader_model, monkey);


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

    var m = new Matrix4(V);
    m.rotate(angle, 0, 1, 0);

    light.position_xformed = m.multiplyVector4(new Vector4(light.position));
	light.direction_xformed = m.multiplyVector4(new Vector4(light.direction));
}

function normalize_vec3(v)
{
	var	len = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
	return [v[0]/len, v[1]/len, v[2]/len];
}

function normalize_vec4(v)
{
	var	len = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]+v[3]*v[3]);
	return [v[0]/len, v[1]/len, v[2]/len, v[3]/len];
}



function set_xforms(gl, h_prog)
{
    var VP = new Matrix4(P); VP.multiply(V);
    var MV = new Matrix4(V); MV.multiply(M);
    var MVP = new Matrix4(P); MVP.multiply(V); MVP.multiply(M);

    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "VP"), false, VP.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MV"), false, MV.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, MVP.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "matNormal"), false, matNormal.elements);

}

function set_light(gl, h_prog)
{
	gl.uniform4fv(gl.getUniformLocation(h_prog, "light.position"), light.position_xformed.elements);
	gl.uniform4fv(gl.getUniformLocation(h_prog, "light.direction"), light.direction_xformed.elements);
	gl.uniform1f(gl.getUniformLocation(h_prog, "light.cutoff_angle"), Math.cos(light.cutoff_angle*Math.PI/180.0));
    gl.uniform3fv(gl.getUniformLocation(h_prog, "light.ambient"), (new Vector3(light.ambient)).elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "light.diffuse"), (new Vector3(light.diffuse)).elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "light.specular"), (new Vector3(light.specular)).elements);

}

function set_material(gl, h_prog)
{
	var	mat = __js_materials[document.getElementById("materials").value];
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

