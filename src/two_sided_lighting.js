var	mats =
{front:
	{name:"gold",
		ambient:[0.24725,0.1995,0.0745],		
		diffuse:[0.75164,0.60648,0.22648],		
		specular:[0.628281,0.555802,0.366065],			
		shininess:0.4
	},
back:
	{name:"silver",			
		ambient:[0.19225,0.19225,0.19225],		
		diffuse:[0.50754,0.50754,0.50754],		
		specular:[0.508273,0.508273,0.508273],			
		shininess:0.4
	}
};


var light = { 
	position:[0, .5, .5, 1], 
	ambient: [0.2, 0.2, 0.2, 1.0], 
	diffuse: [1.0, 1.0, 1.0, 1.0], 
	specular:[1.0, 1.0, 1.0, 1.0],
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


var	quad;
var	axes;

var	shader_lighting;
var	shader_axes;


function main()
{
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);

	shader_lighting = init_shader(gl,
								document.getElementById("vert-Phong-Phong").text,
								document.getElementById("frag-Phong-Phong").text,
								["aPosition", "aNormal"]);

	shader_axes = init_shader(gl,
								document.getElementById("vert-axes").text, 
								document.getElementById("frag-axes").text,
								["aPosition", "aColor"]);
 
	quad = init_vbo_quad(gl);
	axes = init_vbo_axes(gl);

    gl.clearColor(0.5, 0.5, 0.5, 1.0);

	var	angle = 0;

	var tick = function() {
		angle = animate(angle);  // Update the rotation angle
		refresh_scene(gl, angle);   // Draw the triangle
		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick();
}

function refresh_scene(gl, angle)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    update_xforms(gl, angle);

	render_object(gl, shader_axes, axes);

	render_object(gl, shader_lighting, quad);

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

var	M, V, P, VP, MV, MVP, matNormal;


function update_xforms(gl, angle)
{
	M = new Matrix4();
	V = new Matrix4();
	P = new Matrix4();
	matNormal = new Matrix4();

	M.setRotate(angle, 0, 1, 0);

    V.setLookAt(3, 2, 3, 0, 0, 0, 0, 1, 0);

	P.setPerspective(60, 1, 1, 100); 

    VP = new Matrix4(P); VP.multiply(V);
    MV = new Matrix4(V); MV.multiply(M);
    MVP = new Matrix4(P); MVP.multiply(V); MVP.multiply(M);
	matNormal.setInverseOf(MV);
	matNormal.transpose();

    light.position_xformed = V.multiplyVector4(new Vector4(light.position));
}

function set_xforms(gl, h_prog)
{

	loc = gl.getUniformLocation(h_prog, "VP")
	if(loc != null) gl.uniformMatrix4fv(loc, false, VP.elements);

	loc = gl.getUniformLocation(h_prog, "MV")
    if(loc != null)	gl.uniformMatrix4fv(loc, false, MV.elements);

	loc = gl.getUniformLocation(h_prog, "MVP")
    if(loc != null)	gl.uniformMatrix4fv(loc, false, MVP.elements);

	loc = gl.getUniformLocation(h_prog, "matNormal")
	if(loc != null)	gl.uniformMatrix4fv(loc, false, matNormal.elements);

}

function set_light(gl, h_prog)
{
	gl.uniform4fv(gl.getUniformLocation(h_prog, "light.position"), light.position_xformed.elements);
    gl.uniform3f(gl.getUniformLocation(h_prog, "light.ambient"), light.ambient[0], light.ambient[1], light.ambient[2]);
    gl.uniform3f(gl.getUniformLocation(h_prog, "light.diffuse"), light.diffuse[0], light.diffuse[1], light.diffuse[2]);
    gl.uniform3f(gl.getUniformLocation(h_prog, "light.specular"), light.specular[0], light.specular[1], light.specular[2]);
}

function set_material(gl, h_prog)
{
	gl.uniform3fv(gl.getUniformLocation(h_prog, "mat_front.ambient"), (new Vector3(mats["front"].ambient)).elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "mat_front.diffuse"), (new Vector3(mats["front"].diffuse)).elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "mat_front.specular"), (new Vector3(mats["front"].specular)).elements);
	gl.uniform1f(gl.getUniformLocation(h_prog, "mat_front.shininess"), mats["front"].shininess*128.0);

	gl.uniform3fv(gl.getUniformLocation(h_prog, "mat_back.ambient"), (new Vector3(mats["back"].ambient)).elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "mat_back.diffuse"), (new Vector3(mats["back"].diffuse)).elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "mat_back.specular"), (new Vector3(mats["back"].specular)).elements);
	gl.uniform1f(gl.getUniformLocation(h_prog, "mat_back.shininess"), mats["back"].shininess*128.0);
}


function init_vbo_quad(gl) {
    var verts = new Float32Array([
        -1,-1, 0,    0, 0, 1,
         1,-1, 0,    0, 0, 1,
         1, 1, 0,    0, 0, 1,
        -1, 1, 0,    0, 0, 1,
    ]);
   
    var vbo = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	var FSIZE = verts.BYTES_PER_ELEMENT;
	var	attribs = [];
	attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs["aNormal"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return {n:4, drawcall:"drawArrays", type:gl.TRIANGLE_FAN, attribs:attribs};
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
