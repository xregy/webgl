import * as vec4 from "../lib/gl-matrix/vec4.js"
import * as vec3 from "../lib/gl-matrix/vec3.js"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"
import {Light} from "../modules/class_light.mjs"
import {Material, __js_materials} from "../modules/class_material.mjs"
import {Shader} from "../modules/class_shader.mjs"
import {shaders} from "../modules/shaders.mjs"
import {Axes} from "../modules/class_axes.mjs"
import {create_mesh_cube} from "../modules/create_mesh_cube.js"
import {create_mesh_sphere} from "../modules/create_mesh_sphere.js"

"use strict";

function init_materials(gl)
{
    const combo_mat = document.getElementById("materials");
    for(let matname in __js_materials)
    {
        let opt = document.createElement("option");
        opt.value = matname;
        opt.text = matname;
        combo_mat.add(opt, null);
    }
    combo_mat.selectedIndex = 10;
}

function main()
{
    const loc_aPosition = 2;
    const loc_aNormal = 8;
    const numLights = 1;

    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    const V = mat4.create();
    mat4.lookAt(V, [3, 2, 3], [0, 0, 0], [0, 1, 0]);
    
    const P = mat4.create();
    mat4.perspective(P, toRadian(60), 1, 1, 100); 
 
    const uniform_vars = ["MVP", "MV", "matNormal"];
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[0]"));
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[1]"));
    Array.prototype.push.apply(uniform_vars, Material.generate_uniform_names("material"));

   
    const shader = new Shader(gl, 
        shaders.src_vert_Phong_Phong({loc_aPosition, loc_aNormal}),
        shaders.src_frag_Phong_Phong({numLights}), uniform_vars);
    
    init_materials(gl);
    
    const axes = new Axes(gl);
    
    const light = new Light(gl,
        [1.5, 1.0, 0.0, 1.0], 
        [0.5, 0.5, 0.5, 1.0], 
        [1.0, 1.0, 1.0, 1.0], 
        [1.0, 1.0, 1.0, 1.0],
        true);
    
    const ball = create_mesh_sphere(gl,20, loc_aPosition, loc_aNormal);
    mat4.fromScaling(ball.M, [2.0, 0.7, 0.7]);
    
    let t_last = Date.now();
    const ANGLE_STEP = 30.0;
    
    
    function tick() {
        let now = Date.now();
        let elapsed = now - t_last;
        t_last = now;
        
        mat4.rotate(light.M, light.M, toRadian((ANGLE_STEP * elapsed) / 1000.0), [0, 1, 0]);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        axes.render(gl, V, P);
        
        light.render(gl, V, P);
        
        if(document.getElementById("normal-matrix-right").checked)
        {
            ball.render(gl, shader, [light], __js_materials[document.getElementById("materials").value], V, P);
        }
        else
        {
            render_with_wrong_normal_matrix(gl, ball, shader, [light], 
                __js_materials[document.getElementById("materials").value], V, P);
        }
        requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    };
    tick();
    
}
function render_with_wrong_normal_matrix(gl, mesh, shader, lights, material, V, P)
{
    gl.useProgram(shader.h_prog);
    gl.bindVertexArray(mesh.vao);

    set_uniform_matrices_with_wrong_normal_matrix(gl, mesh, shader.h_prog, V, P);
    set_uniform_lights(gl, mesh, shader.h_prog, lights, V);
    set_uniform_material(gl, mesh, shader.h_prog, material);

    if(mesh.draw_call == "drawArrays") gl.drawArrays(mesh.draw_mode, 0, mesh.n);
    else if(mesh.draw_call == "drawElements") gl.drawElements(mesh.draw_mode, mesh.n, mesh.index_buffer_type, 0);

    gl.bindVertexArray(null);
    gl.useProgram(null);
}

function set_uniform_matrices_with_wrong_normal_matrix(gl, mesh, h_prog, V, P)
{
    mat4.copy(mesh.MV, V);
    mat4.multiply(mesh.MV, mesh.MV, mesh.M);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MV"), false, mesh.MV);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "matNormal"), false, mesh.MV);
    mat4.copy(mesh.MVP, P);
    mat4.multiply(mesh.MVP, mesh.MVP, mesh.MV);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, mesh.MVP);
}
function set_uniform_lights(gl, mesh, h_prog, lights, V)
{
    const MV = mat4.create();
    let i = 0;
    let v = vec4.create();
    for(let name in lights)
    {
        let light = lights[name];
        mat4.copy(MV, V);
        mat4.multiply(MV, MV, light.M);
        vec4.transformMat4(v, light.position, MV);
        gl.uniform4fv(gl.getUniformLocation(h_prog, "light[" + i + "].position"), v);
        gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].ambient"), light.ambient);
        gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].diffuse"), light.diffusive);
        gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].specular"), light.specular);
        gl.uniform1i(gl.getUniformLocation(h_prog, "light[" + i + "].enabled"), light.enabled);
        i++;
    }
}
function set_uniform_material(gl, mesh, h_prog, mat)
{
    gl.uniform3fv(gl.getUniformLocation(h_prog, "material.ambient"), mat.ambient);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "material.diffuse"), mat.diffusive);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "material.specular"), mat.specular);
    gl.uniform1f(gl.getUniformLocation(h_prog, "material.shininess"), mat.shininess*128.0);
}


main();
