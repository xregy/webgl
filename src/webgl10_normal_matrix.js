"use strict";

function init_materials(gl)
{
    let combo_mat = document.getElementById("materials");
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
    let canvas = document.getElementById('webgl');
    let gl = getWebGLContext(canvas);
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    let V = new Matrix4();
    V.setLookAt(3, 2, 3, 0, 0, 0, 0, 1, 0);
    
    let P = new Matrix4();
    P.setPerspective(60, 1, 1, 100); 
    
    let shader = new Shader(gl, 
        document.getElementById("vert-Phong-Phong").text,
        document.getElementById("frag-Phong-Phong").text,
        ["aPosition", "aNormal"]);
    
    init_materials(gl);
    
    let axes = new Axes(gl);
    
    let light = new Light(gl,
        [1.5, 1.0, 0.0, 1.0], 
        [0.5, 0.5, 0.5, 1.0], 
        [1.0, 1.0, 1.0, 1.0], 
        [1.0, 1.0, 1.0, 1.0],
        true);
    
    let ball = create_mesh_sphere(gl,20);
    ball.M.setScale(2.0, 0.7, 0.7);
    
    let t_last = Date.now();
    const ANGLE_STEP = 30.0;
    
    
    let tick = function() {
        let now = Date.now();
        let elapsed = now - t_last;
        t_last = now;
        
        light.M.rotate((ANGLE_STEP * elapsed) / 1000.0, 0, 1, 0);
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
    set_uniform_matrices_with_wrong_normal_matrix(gl, mesh, shader.h_prog, V, P);
    set_uniform_lights(gl, mesh, shader.h_prog, lights, V);
    set_uniform_material(gl, mesh, shader.h_prog, material);
    for(let attrib_name in mesh.attribs)
    {
        let attrib = mesh.attribs[attrib_name];
        gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
        gl.vertexAttribPointer(shader.attribs[attrib_name], attrib.size, attrib.type, 
            attrib.normalized, attrib.stride, attrib.offset);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(shader.attribs[attrib_name]);
    }
    if(mesh.draw_call == "drawArrays")
    {
        gl.drawArrays(mesh.draw_mode, 0, mesh.n);
    }
    else if(mesh.draw_call == "drawElements")
    {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
        gl.drawElements(mesh.draw_mode, mesh.n, mesh.index_buffer.type, 0);
    }
    for(let attrib_name in mesh.attribs)
    {
        gl.disableVertexAttribArray(shader.attribs[attrib_name]);
    }
    gl.useProgram(null);
}

function set_uniform_matrices_with_wrong_normal_matrix(gl, mesh, h_prog, V, P)
{
    mesh.MV.set(V);
    mesh.MV.multiply(mesh.M);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MV"), false, mesh.MV.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "matNormal"), false, mesh.MV.elements);
    mesh.MVP.set(P);
    mesh.MVP.multiply(mesh.MV);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, mesh.MVP.elements);
}
function set_uniform_lights(gl, mesh, h_prog, lights, V)
{
    let MV = new Matrix4();
    let i = 0;
    for(let name in lights)
    {
        let light = lights[name];
        MV.set(V);
        MV.multiply(light.M);
        gl.uniform4fv(gl.getUniformLocation(h_prog, "light[" + i + "].position"), 
                        (MV.multiplyVector4(light.position)).elements);
        gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].ambient"), light.ambient.elements);
        gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].diffuse"), light.diffusive.elements);
        gl.uniform3fv(gl.getUniformLocation(h_prog, "light[" + i + "].specular"), light.specular.elements);
        gl.uniform1i(gl.getUniformLocation(h_prog, "light[" + i + "].enabled"), light.enabled);
        i++;
    }
}
function set_uniform_material(gl, mesh, h_prog, mat)
{
    gl.uniform3fv(gl.getUniformLocation(h_prog, "material.ambient"), mat.ambient.elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "material.diffuse"), mat.diffusive.elements);
    gl.uniform3fv(gl.getUniformLocation(h_prog, "material.specular"), mat.specular.elements);
    gl.uniform1f(gl.getUniformLocation(h_prog, "material.shininess"), mat.shininess*128.0);
}


