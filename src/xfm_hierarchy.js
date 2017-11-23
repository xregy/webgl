function main() {
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);


	var	shader = init_shader(gl, ["aPosition"]);
	
	quad = init_vbo_quad(gl);
	
	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	
	// Clear <canvas>
	

	set_slider_callbacks("x_R", function(ev) {render_scene(gl, shader, quad);});
	set_slider_callbacks("y_R", function(ev) {render_scene(gl, shader, quad);});
	set_slider_callbacks("length_R", function(ev) {render_scene(gl, shader, quad);});
	set_slider_callbacks("angle_R", function(ev) {render_scene(gl, shader, quad);});
	set_slider_callbacks("length_G", function(ev) {render_scene(gl, shader, quad);});
	set_slider_callbacks("angle_G", function(ev) {render_scene(gl, shader, quad);});
	set_slider_callbacks("length_B", function(ev) {render_scene(gl, shader, quad);});
	set_slider_callbacks("angle_B", function(ev) {render_scene(gl, shader, quad);});

	render_scene(gl, shader, quad);

}

function set_slider_callbacks(id, fn)
{
	document.getElementById(id).onchange = fn;
	document.getElementById(id).oninput = fn;
}

var	WIDTH_RED = 0.3;
var	WIDTH_GREEN	= 0.2;
var	LENGTH_GREEN = 0.8;
var	WIDTH_BLUE = (WIDTH_GREEN/2.0);
var	LENGTH_BLUE	= 0.3;

var	x_R = 0;
var	y_R = 0;
var	length_R = 1.0;
var	angle_R = 10;
var	length_G;
var angle_G = -10;
var	length_B;
var angle_B = 30;

function render_quad(gl, shader, object, loc_MVP, matrices, loc_color, color)
{
	set_uniforms(gl, loc_MVP, matrices, loc_color, color);
	for(var attrib_name in shader.attribs)
	{
		var	attrib = object.attribs[attrib_name];
		gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
		gl.vertexAttribPointer(shader.attribs[attrib_name], attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.enableVertexAttribArray(shader.attribs[attrib_name]);
	}
	gl.drawArrays(object.type, 0, object.n);

}

function set_uniforms(gl, loc_MVP, matrices, loc_color, color)
{
	MVP = new Matrix4();
	for(let m of matrices)
	{
		MVP.multiply(m);
	}
	gl.uniformMatrix4fv(loc_MVP, false, MVP.elements);
	gl.uniform3fv(loc_color, (new Vector3(color)).elements);
}

function refresh_values()
{
	x_R = document.getElementById("x_R").value/100.0;
	y_R = document.getElementById("y_R").value/100.0;
	length_R = document.getElementById("length_R").value/100.0;
	angle_R = document.getElementById("angle_R").value;
	length_G = document.getElementById("length_G").value/100.0;
	angle_G = document.getElementById("angle_G").value;
	length_B = document.getElementById("length_B").value/100.0;
	angle_B = document.getElementById("angle_B").value;
}

function render_scene(gl, shader, quad)
{
	refresh_values();

	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(shader.h_prog);

	var loc_MVP = gl.getUniformLocation(shader.h_prog, "MVP");
	var loc_color = gl.getUniformLocation(shader.h_prog, "color");

	var	P  = new Matrix4();	P.setOrtho(-2, 2, -2, 2, 0, 4);
	var	T_base = new Matrix4();	T_base.setTranslate(x_R, y_R, 0);
	var	T = new Matrix4();	T.setTranslate(0, 0, -2);



	var	Rr = new Matrix4();	Rr.setRotate(angle_R, 0, 0, 1);
	var	Sr = new Matrix4();	Sr.setScale(length_R, WIDTH_RED, 1);
	var	Tr_low = new Matrix4();	Tr_low.setTranslate((length_R-WIDTH_RED)/2.0, 0, 0.1);

	render_quad(gl, shader, quad, loc_MVP, [P,T,T_base,Rr,Tr_low,Sr], loc_color, [1,0,0]);


	var Tr_high = new Matrix4();	Tr_high.setTranslate(length_R - WIDTH_RED, 0, 0);
	var Tg_low = new Matrix4();		Tg_low.setTranslate((length_G - WIDTH_GREEN)/2.0, 0, 0);
	var Sg = new Matrix4();			Sg.setScale(length_G, WIDTH_GREEN, 1);
	var Rg = new Matrix4();			Rg.setRotate(angle_G, 0, 0, 1);
	render_quad(gl, shader, quad, loc_MVP, [P,T,T_base,Rr,Tr_high,Rg,Tg_low,Sg], loc_color, [0,1,0]);

	var	Tg_high1 = new Matrix4();	 Tg_high1.setTranslate(length_G - WIDTH_GREEN + WIDTH_BLUE/2.0, WIDTH_BLUE/2.0, 0);
	var	Tg_high2 = new Matrix4();	 Tg_high2.setTranslate(length_G - WIDTH_GREEN + WIDTH_BLUE/2.0, -WIDTH_BLUE/2.0, 0);
	var	Tb = new Matrix4();			Tb.setTranslate((length_B - WIDTH_BLUE)/2.0, 0, 0.3);
	var	Sb = new Matrix4();			Sb.setScale(length_B, WIDTH_BLUE, 1);
	var	Rb1 = new Matrix4();	 	Rb1.setRotate(angle_B, 0, 0, 1);
	var	Rb2 = new Matrix4();		Rb2.setRotate(-angle_B, 0, 0, 1);
	render_quad(gl, shader, quad, loc_MVP, [P,T,T_base,Rr,Tr_high,Rg,Tg_high1,Rb1,Tb,Sb], loc_color, [0,0,1]);
	render_quad(gl, shader, quad, loc_MVP, [P,T,T_base,Rr,Tr_high,Rg,Tg_high2,Rb2,Tb,Sb], loc_color, [0,0,1]);


}

function init_shader(gl, attrib_names)
{

	var src_vert = document.getElementById("shader-vert").text;
	var src_frag = document.getElementById("shader-frag").text;
	// Initialize shaders
	if (!initShaders(gl, src_vert, src_frag)) {
		console.log('Failed to intialize shaders.');
		return;
	}

	h_prog = gl.program;

	var	attribs = {};
	for(let attrib of attrib_names)
	{
		attribs[attrib] = gl.getAttribLocation(h_prog, attrib);
	}
	return {h_prog:h_prog, attribs:attribs};
}

function init_vbo_quad(gl) {
	var verts = new Float32Array([
	  -0.5, -0.5,
	   0.5, -0.5, 
	   0.5,  0.5,
	  -0.5,  0.5
	]);
	
	// Create a buffer object
	var buf = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
	
	var	attribs = [];
	attribs["aPosition"] = {buffer:buf, size:2, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	return {n:4, type:gl.TRIANGLE_FAN, attribs:attribs};
}
