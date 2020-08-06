Mesh.shader_id = null;

Mesh.src_shader_id_vert =
			'attribute vec4 aPosition;\n' +
			'uniform mat4 MVP;\n' +
			'uniform int  u_id;\n' +
			'varying vec4 v_Color;\n' +
			'void main()\n' + 
			'{\n' +
			'	gl_Position = MVP * aPosition;\n' +
			'	v_Color = vec4(float(u_id)/256.0, 0.0, 0.0, 1.0);\n' +
			'}\n';

Mesh.src_shader_id_frag =
			'#ifdef GL_ES\n' +
			'precision mediump float;\n' +
			'#endif\n' +
			'varying vec4 v_Color;\n' +
			'void main() {\n' +
			'	gl_FragColor = v_Color;\n' +
			'}\n';

function Mesh(gl, draw_call, draw_mode, n, attribs, index_buffer_id, index_buffer_type)
{
	this.name = "";
	this.draw_call = draw_call;
	this.draw_mode = draw_mode;
	this.n = n;
	this.index_buffer = {id:index_buffer_id, type:index_buffer_type};
	this.attribs = attribs;
	this.M = new Matrix4();
	this.MV = new Matrix4();
	this.MVP = new Matrix4();
	this.N = new Matrix4();
	this.id = -1;
	if(!Mesh.shader_id)
	{
		Mesh.shader_id = new Shader(gl, 
			Mesh.src_shader_id_vert,
			Mesh.src_shader_id_frag,
			['aPosition']);
	}
}


Mesh.prototype.init_from_json_js = function(gl, json_obj)
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

Mesh.prototype.set_uniform_matrices = function(gl, h_prog, V, P)
{
	this.MV.set(V);
	this.MV.multiply(this.M);
	gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MV"), false, this.MV.elements);
	this.MVP.set(P);
	this.MVP.multiply(this.MV);
	gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, this.MVP.elements);
	this.MVP.set(V);
	this.MVP.multiply(this.M);
	this.N.setInverseOf(this.MVP);
	this.N.transpose();
	gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "matNormal"), false, this.N.elements);
}

Mesh.prototype.set_uniform_lights = function(gl, h_prog, lights, V)
{
	this.MV = new Matrix4();
	var i = 0;
	for(var name in lights)
	{
		var light = lights[name];
		this.MV.set(V);
		this.MV.multiply(light.M);
		gl.uniform4fv(gl.getUniformLocation(h_prog, "light[" + i + "].position"), 
			(this.MV.multiplyVector4(light.position)).elements);
		gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].ambient"), light.ambient.elements);
		gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].diffuse"), light.diffusive.elements);
		gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].specular"), light.specular.elements);
		gl.uniform1i(gl.getUniformLocation(h_prog, "light[" + i + "].enabled"), light.enabled);
		i++;
	}
}
Mesh.prototype.set_uniform_material = function(gl, h_prog, mat)
{
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.ambient"), mat.ambient.elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.diffuse"), mat.diffusive.elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.specular"), mat.specular.elements);
	gl.uniform1f(gl.getUniformLocation(h_prog, "material.shininess"), mat.shininess*128.0);
}

Mesh.prototype.render = function(gl, shader, lights, material, V, P)
{
	gl.useProgram(shader.h_prog);
	this.set_uniform_matrices(gl, shader.h_prog, V, P);
	if(lights!=null)	this.set_uniform_lights(gl, shader.h_prog, lights, V);
	if(material!=null)	this.set_uniform_material(gl, shader.h_prog, material);
	for(var attrib_name in this.attribs)
	{
		var attrib = this.attribs[attrib_name];
		gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
		gl.vertexAttribPointer(shader.attribs[attrib_name], attrib.size, attrib.type, 
			attrib.normalized, attrib.stride, attrib.offset);
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

Mesh.prototype.render_id = function(gl, V, P)
{
	var	h_prog = Mesh.shader_id.h_prog;
	gl.useProgram(h_prog);

	this.MVP.set(P);
	this.MVP.multiply(V);
	this.MVP.multiply(this.M);
	gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, this.MVP.elements);

	gl.uniform1i(gl.getUniformLocation(h_prog, "u_id"), this.id);

	for(var attrib_name in Mesh.shader_id.attribs)
	{
		var attrib = this.attribs[attrib_name];
		gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
		gl.vertexAttribPointer(Mesh.shader_id.attribs[attrib_name], attrib.size, attrib.type, 
			attrib.normalized, attrib.stride, attrib.offset);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.enableVertexAttribArray(Mesh.shader_id.attribs[attrib_name]);
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
	for(var attrib_name in Mesh.shader_id.attribs)
	{
		gl.disableVertexAttribArray(Mesh.shader_id.attribs[attrib_name]);
	}
	gl.useProgram(null);

}



