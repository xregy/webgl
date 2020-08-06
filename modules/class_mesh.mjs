import {Shader} from "./class_shader.mjs"
import {shaders} from "./shaders.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import * as vec4 from "../lib/gl-matrix/vec4.js"

export class Mesh
{
    constructor({gl, vao, draw_call, draw_mode, n, index_buffer_type, loc_aPosition})
    {
        this.vao = vao;
        this.name = "";
        this.draw_call = draw_call;
        this.draw_mode = draw_mode;
        this.n = n;
        this.index_buffer_type = index_buffer_type;
        this.M = mat4.create();
        this.MV = mat4.create();
        this.MVP = mat4.create();
        this.N = mat4.create();
        this.id = -1;
        if(!Mesh.shader_id)
            Mesh.shader_id = new Shader(gl, shaders.src_vert_picking({loc_aPosition}), shaders.src_frag_picking(), ["MVP", "u_id"]);
    }
    init_from_json_js(gl, json_obj, loc_aPosition=0, loc_aNormal=1, loc_aTexCoord=2)
    {
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        
        let attributes = json_obj.data.attributes;
        
        let buf_position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes.position.array), gl.STATIC_DRAW);
        
        gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc_aPosition);
        
        let buf_normal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes.normal.array), gl.STATIC_DRAW);
        
        gl.vertexAttribPointer(loc_aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc_aNormal);
        
        let buf_index = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(json_obj.data.index.array), gl.STATIC_DRAW);
        
        this.draw_call = "drawElements";
        this.draw_mode = gl.TRIANGLES;
        this.n = json_obj.data.index.array.length;
        this.index_buffer_type = gl.UNSIGNED_SHORT;
        
        gl.bindVertexArray(null);
    }
    init_from_THREE_geometry(gl, geom, loc_aPosition=0, loc_aNormal=1, loc_aTexCoord=2)
    {
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        
        let position = geom.attributes.position;
        let normal = geom.attributes.normal;
        
		if(loc_aNormal)
		{
	        let buf_normal = gl.createBuffer();
	        gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal);
	        gl.bufferData(gl.ARRAY_BUFFER, normal.array, gl.STATIC_DRAW);
        	gl.vertexAttribPointer(loc_aNormal, 3, gl.FLOAT, false, 0, 0);
        	gl.enableVertexAttribArray(loc_aNormal);
		}
        
        let buf_position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
        gl.bufferData(gl.ARRAY_BUFFER, position.array, gl.STATIC_DRAW);
        
        gl.vertexAttribPointer(loc_aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc_aPosition);
        
        if(geom.attributes.uv != undefined && loc_aTexCoord)
        {
            let buf_texcoord = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf_texcoord);
            gl.bufferData(gl.ARRAY_BUFFER, geom.attributes.uv.array, gl.STATIC_DRAW);
            gl.vertexAttribPointer(loc_aTexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(loc_aTexCoord);
        }
        if(geom.index)
        {
            this.draw_call = "drawElements";
            let buf_index = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geom.index.array, gl.STATIC_DRAW);
            this.n = geom.index.array.length;
            this.index_buffer_type = gl.UNSIGNED_SHORT;
        }
        else
        {
            this.draw_call = "drawArrays";
            this.n = geom.attributes.position.count;
        }
        this.draw_mode = gl.TRIANGLES;
        
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    set_uniform_matrices(gl, shader, V, P)
    {
        mat4.copy(this.MV, V);
        mat4.multiply(this.MV, this.MV, this.M);
        gl.uniformMatrix4fv(shader.loc_uniforms["MV"], false, this.MV);
        mat4.copy(this.MVP, P);
        mat4.multiply(this.MVP, this.MVP, this.MV);
        gl.uniformMatrix4fv(shader.loc_uniforms["MVP"], false, this.MVP);
        mat4.copy(this.MVP, V);
        mat4.multiply(this.MVP, this.MVP, this.M);
//        mat4.invert(this.N, this.MVP);
        mat4.invert(this.N, this.MV);
        mat4.transpose(this.N, this.N);
        gl.uniformMatrix4fv(shader.loc_uniforms["matNormal"], false, this.N);
    }
    set_uniform_lights(gl, shader, lights, V)
    {
//        let MV = new Matrix4();
        let i = 0;
        let v = vec4.create();
        for(let name in lights)
        {
            let light = lights[name];
            mat4.copy(this.MV, V);
            mat4.multiply(this.MV, this.MV, light.M);
            vec4.transformMat4(v, light.position, this.MV);
//            gl.uniform4fv(shader.loc_uniforms[`light[${i}].position`], (this.MV.multiplyVector4(light.position)).elements);
            gl.uniform4fv(shader.loc_uniforms[`light[${i}].position`], v);
            gl.uniform3fv(shader.loc_uniforms[`light[${i}].ambient`], light.ambient);
            gl.uniform3fv(shader.loc_uniforms[`light[${i}].diffuse`], light.diffusive);
            gl.uniform3fv(shader.loc_uniforms[`light[${i}].specular`], light.specular);
            gl.uniform1i(shader.loc_uniforms[`light[${i}].enabled`], light.enabled);
            vec4.transformMat4(v, light.direction, this.MV);
//            gl.uniform4fv(shader.loc_uniforms[`light[${i}].direction`], this.MV.multiplyVector4(light.direction).elements);
            gl.uniform4fv(shader.loc_uniforms[`light[${i}].direction`], v);
            gl.uniform1f(shader.loc_uniforms[`light[${i}].cutoff_angle`], Math.cos(light.cutoff_angle*Math.PI/180.0));

            i++;
        }
    }
    set_uniform_material(gl, shader, mat)
    {
        gl.uniform3fv(gl.getUniformLocation(shader.h_prog, "material.ambient"), mat.ambient);
        gl.uniform3fv(gl.getUniformLocation(shader.h_prog, "material.diffuse"), mat.diffusive);
        gl.uniform3fv(gl.getUniformLocation(shader.h_prog, "material.specular"), mat.specular);
        gl.uniform1f(gl.getUniformLocation(shader.h_prog, "material.shininess"), mat.shininess*128.0);
    }
    set_uniform_texture(gl, shader, textures)
    {
        let i=0;
        for(let texname in textures)
        {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, textures[texname].texid);
            gl.uniform1i(shader.loc_uniforms[texname], i);
            i++;
        }
    }
    render(gl, shader, lights, material, V, P, textures = null)
    {
        gl.useProgram(shader.h_prog);
        gl.bindVertexArray(this.vao);
        
        this.set_uniform_matrices(gl, shader, V, P);
        if(lights)	this.set_uniform_lights(gl, shader, lights, V);
        if(material)	this.set_uniform_material(gl, shader, material);
        if(textures)	this.set_uniform_texture(gl, shader, textures);
        if(this.draw_call == "drawArrays") gl.drawArrays(this.draw_mode, 0, this.n);
        else if(this.draw_call == "drawElements") gl.drawElements(this.draw_mode, this.n, this.index_buffer_type, 0);
        
        gl.bindVertexArray(null);
        gl.useProgram(null);
    }
    
    render_id(gl, V, P)
    {
        let	h_prog = Mesh.shader_id.h_prog;
        gl.useProgram(h_prog);
        gl.bindVertexArray(this.vao);
        
        mat4.copy(this.MVP, P);
        mat4.multiply(this.MVP, this.MVP, V);
        mat4.multiply(this.MVP, this.MVP, this.M);
        gl.uniformMatrix4fv(Mesh.shader_id.loc_uniforms["MVP"], false, this.MVP);
        gl.uniform1i(Mesh.shader_id.loc_uniforms["u_id"], this.id);
        
        if(this.draw_call == "drawArrays") gl.drawArrays(this.draw_mode, 0, this.n);
        else if(this.draw_call == "drawElements") gl.drawElements(this.draw_mode, this.n, this.index_buffer_type, 0);
        
        gl.bindVertexArray(null);
        gl.useProgram(null);
    }
}

// static properties
Mesh.shader_id = null;



