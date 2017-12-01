var	list_shaders = [];


var light = { position:[0, 1.5, 1.5, 0.0], ambient: [0.5, 0.5, 0.5, 1.0], diffuse: [1.0, 1.0, 1.0, 1.0], specular:[1.0, 1.0, 1.0, 1.0]};

const	STATE_NONE = 0;
const	STATE_ROTATING = 1;
const	STATE_MOVING = 2;

var	gui = {offset:[0,0], position_mouse:null, state:STATE_NONE};

var model = {T:new Matrix4(), R:new Matrix4()};

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

var	monkey_sub2_smooth;
var	shader;

function main()
{
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);

	monkey_sub2_smooth = parse_json_js(gl, __js_monkey_sub2_smooth);

	var	src_vert = document.getElementById("vert-Blinn-Gouraud").text;
	var	src_frag = document.getElementById("frag-Blinn-Gouraud").text;
	shader = init_shader(gl, src_vert, src_frag, ["aPosition", "aNormal"]);

	canvas.onmousedown = function (ev) { on_mouse_down(gl, ev); };
	canvas.onmouseup = function (ev) { on_mouse_up(gl, ev); };
	canvas.onmousemove = function (ev) { on_mouse_move(gl, ev); };


    gl.clearColor(0.2, 0.2, 0.2, 1.0);

	refresh_scene(gl);
}

function get_mouse_position_in_canvas(ev)
{
	var x = ev.clientX, y = ev.clientY;
	var rect = ev.target.getBoundingClientRect();
//	return [x - rect.left, rect.bottom - y];
	return [x - rect.x, y - rect.y];
}

function on_mouse_down(gl, ev)
{
	if(ev.button == 2)	// left
	{
		gui.state = STATE_ROTATING;
		gui.position_mouse = get_mouse_position_in_canvas(ev);
	}
	else if(ev.button == 0)	// right
	{
		gui.state = STATE_MOVING;
		gui.position_mouse = get_mouse_position_in_canvas(ev);
	}
}

function on_mouse_up(gl, ev)
{
	gui.state = STATE_NONE;
}

// https://gist.github.com/sixman9/871099
function gl_project(gl, vec, MVP, viewport, d)
{
	var v = MVP.multiplyVector4(new Vector4([vec[0], vec[1], vec[2], 1]));
	if(v.elements[3] != 0)
	{
		v.elements[0] = v.elements[0]/v.elements[3];
		v.elements[1] = v.elements[1]/v.elements[3];
		v.elements[2] = v.elements[2]/v.elements[3];
	}
	v.elements[0] = (((v.elements[0] + 1.0)*0.5)*parseFloat(viewport[2])) + parseFloat(viewport[0]);
	v.elements[1] = (((-v.elements[1] + 1.0)*0.5)*parseFloat(viewport[3])) + parseFloat(viewport[1]);
//	v.elements[2] = (v.elements[2]*(d[1] - d[0])) + d[0];
	v.elements[2] = v.elements[2]*(d[1] - d[0])*0.5 + (d[0]+d[1])*0.5;
	return [v.elements[0], v.elements[1], v.elements[2]];
}

// https://gist.github.com/sixman9/871099
function gl_unproject(gl, vec, MVP, viewport, d)
{
	var v = [(((vec[0] - parseFloat(viewport[0]))/parseFloat(viewport[2]))*2.0) - 1.0,
		-(((vec[1] - parseFloat(viewport[1]))/parseFloat(viewport[3]))*2.0) - 1.0,
		(vec[2] - d[0])/(d[1]-d[0])];
	var	v = MVP.multiplyVector4(new Vector4([v[0], v[1], v[2], 1]));
	if(v.elements[3] != 0)
	{
		v.elements[0] = v.elements[0]/v.elements[3];
		v.elements[1] = v.elements[1]/v.elements[3];
		v.elements[2] = v.elements[2]/v.elements[3];
	}
	return [v.elements[0], v.elements[1], v.elements[2]];
}

function length3(v)
{
	return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
}

function on_mouse_move(gl, ev)
{
	if((gui.state == STATE_ROTATING) || (gui.state == STATE_MOVING))
	{
		pos = get_mouse_position_in_canvas(ev);
//		console.log(pos);

		gui.offset = [pos[0]-gui.position_mouse[0], pos[1]-gui.position_mouse[1]];
//		console.log(gui.offset);
		gui.position_mouse = pos;
		var	viewport = gl.getParameter(gl.VIEWPORT, viewport);
		var	d = gl.getParameter(gl.DEPTH_RANGE, d);

		var MVP = new Matrix4(P);
		MVP.multiply(V);

		MVP.multiply(model.T);
		MVP.multiply(model.R);

		var	M = new Matrix4(model.T);
		M.multiply(model.R);

//		console.log(P);
//		console.log(V);
//		console.log(model.T);
//		console.log(model.R);
//		console.log(MVP);

		var org_win = gl_project(gl, [0,0,0], MVP, viewport, d);
//		console.log(org_win);
		var	dir_win;
		if(gui.state == STATE_ROTATING)
		{
			dir_win = [gui.offset[1], gui.offset[0], 0];
		}
		else if (gui.state == STATE_MOVING)
		{
			dir_win = [gui.offset[0], -gui.offset[1], 0];
		}

		var	v = [org_win[0] + dir_win[0], org_win[1] + dir_win[1], org_win[2] + dir_win[2]];
		var	dir_model = gl_unproject(gl, v, MVP, viewport, d);

		var	dd = new Float32Array(3);
		var	ret = GLU.unProject(v[0], v[1], v[2], M.elements, P.elements, V.elements, dd);
		console.log(ret, dd);


		dir_model[2] = 0;
		console.log(dir_model);
		if(gui.state == STATE_ROTATING)
		{
			R = new Matrix4();
			R.setRotate(length3(dir_win), dir_model[0], dir_model[1], dir_model[2]);
			R.multiply(model.R);
			model.R = R;
		}
		else if (gui.state == STATE_MOVING)
		{
			T = new Matrix4();
			T.setTranslate(dir_model[0], dir_model[1], dir_model[2]);
			T.multiply(model.T);
			model.T = T;
		}
		refresh_scene(gl);
	}
}
	

function refresh_scene(gl)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    update_xforms(gl);

	render_object(gl, shader, monkey_sub2_smooth);
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

var V;
var	P;
var	matNormal;


function update_xforms(gl)
{
	V = new Matrix4();
	P = new Matrix4();
	matNormal = new Matrix4();

    V.setLookAt(0, 0, 10, 0, 0, 0, 0, 1, 0);

	P.setPerspective(30, 1, 1, 20); 

	M = new Matrix4(model.T);
	M.multiply(model.R);

	var MV = new Matrix4(V); MV.multiply(M);
	matNormal.setInverseOf(MV);
	matNormal.transpose();
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
	gl.uniform4fv(gl.getUniformLocation(h_prog, "light.position"), (new Vector4(light.position)).elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "light.ambient"), (new Vector3(light.ambient)).elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "light.diffuse"), (new Vector3(light.diffuse)).elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "light.specular"), (new Vector3(light.specular)).elements);
}

function set_material(gl, h_prog)
{
	var	mat = __js_materials["gold"];
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.ambient"), (new Vector3(mat.ambient)).elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.diffuse"), (new Vector3(mat.diffuse)).elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.specular"), (new Vector3(mat.specular)).elements);
	gl.uniform1f(gl.getUniformLocation(h_prog, "material.shininess"), mat.shininess*128.0);
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
	attribs["aNormal"] = {buffer:buf_normal, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};

    return {n:obj.data.index.array.length, drawcall:"drawElements", buf_index:buf_index, type_index:gl.UNSIGNED_SHORT, type:gl.TRIANGLES, attribs:attribs};
}


