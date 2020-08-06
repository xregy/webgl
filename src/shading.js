import {Mesh} from "../modules/class_mesh.mjs"
import {shaders} from "../modules/shaders.mjs"
import {Material, __js_materials} from "../modules/class_material.mjs"
import {Shader} from "../modules/class_shader.mjs"
import {Light} from "../modules/class_light.mjs"
import {Axes} from "../modules/class_axes.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"
import {create_mesh_cube} from "../modules/create_mesh_cube.js"
import {create_mesh_sphere} from "../modules/create_mesh_sphere.js"

"use strict";

function main()
{
    const loc_aPosition = 3;
    const loc_aNormal = 9;
    const numLights = 2;

    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    const V = mat4.create();
    mat4.lookAt(V, [2, 1, 3], [0, 0, 0], [0, 1, 0]);
    
    const P = mat4.create();
    mat4.perspective(P, toRadian(50), 1, 1, 100); 
 
    const list_shaders = [];
    
    const uniform_vars = ["MVP", "MV", "matNormal"];
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[0]"));
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[1]"));
    Array.prototype.push.apply(uniform_vars, Material.generate_uniform_names("material"));
    
    const list_shader_source = 
    {
        "vert-Phong-Gouraud":shaders.src_vert_Phong_Gouraud({loc_aPosition, loc_aNormal, numLights}), 
        "frag-Phong-Gouraud":shaders.src_frag_Phong_Gouraud(),
        "vert-Blinn-Gouraud":shaders.src_vert_Blinn_Gouraud({loc_aPosition, loc_aNormal, numLights}),
        "frag-Blinn-Gouraud":shaders.src_frag_Blinn_Gouraud(),
        "vert-Blinn-Phong":shaders.src_vert_Blinn_Phong({loc_aPosition, loc_aNormal}),
        "frag-Blinn-Phong":shaders.src_frag_Blinn_Phong({numLights}),
        "vert-Phong-Phong":shaders.src_vert_Phong_Phong({loc_aPosition, loc_aNormal}),
        "frag-Phong-Phong":shaders.src_frag_Phong_Phong({numLights}),
    };
    
    // initializes shaders (reflection models)
    for(let model of [
    "Phong-Gouraud", 
    "Blinn-Gouraud", 
    "Blinn-Phong", "Phong-Phong"])
    {
        list_shaders[model] = new Shader(gl, 
            list_shader_source["vert-" + model],
            list_shader_source["frag-" + model],
            uniform_vars);
    }
    
    // initializes the material combobox
    const combo_mat = document.getElementById("materials");
    for(let matname in __js_materials)
    {
        let opt = document.createElement("option");
        opt.value = matname;
        opt.text = matname;
        combo_mat.add(opt, null);
    }
    combo_mat.selectedIndex = 10;
    
    // initializes two lights
    let list_lights = 
    [
        new Light
        (
            gl,
            [1.5, 1.5, 0, 1.0],		// position
            [0.1, 0.1, 0.1, 1.0],	// ambient
            [1.0, 1.0, 1.0, 1.0],	// diffusive
            [1.0, 1.0, 1.0, 1.0],	// specular
            false
        ),
        new Light
        (
            gl,
            [0, 1.5, 1.5, 1.0],
            [0.1, 0.1, 0.1, 1.0],
            [1.0, 1.0, 1.0, 1.0],
            [1.0, 1.0, 1.0, 1.0],
            false
        )
    ];
    
    // initializes the meshes
    let list_meshes = [];
    const monkey = new Mesh({gl, loc_aPosition});
    monkey.init_from_json_js(gl, __js_monkey, loc_aPosition, loc_aNormal);
    const monkey_smooth = new Mesh({gl, loc_aPosition});
    monkey_smooth.init_from_json_js(gl, __js_monkey_smooth, loc_aPosition, loc_aNormal);
    const monkey_sub2_smooth = new Mesh({gl, loc_aPosition});
    monkey_sub2_smooth.init_from_json_js(gl, __js_monkey_sub2_smooth, loc_aPosition, loc_aNormal);
    const cube = create_mesh_cube(gl, loc_aPosition, loc_aNormal);
    const ball = create_mesh_sphere(gl, 20, loc_aPosition, loc_aNormal);
    list_meshes["cube"] = cube;
    list_meshes["sphere"] = ball;
    list_meshes["monkey"] = monkey;
    list_meshes["monkey (smooth)"] = monkey_smooth;
    list_meshes["monkey (subdivided 2 steps, smooth)"] = monkey_sub2_smooth;
    
    const axes = new Axes(gl);
    
    let t_last = Date.now();
    
    const ANGLE_STEP_LIGHT = 30.0;
    const ANGLE_STEP_MESH = 30.0;
    
    function tick()
    {
        let now = Date.now();
        let elapsed = now - t_last;
        t_last = now;
        
        mat4.rotate(list_lights[0].M, list_lights[0].M, toRadian(( (ANGLE_STEP_LIGHT * elapsed) / 1000.0) % 360.0), [0, 1, 0]);
        if(document.getElementById("mesh-rotating").checked)
        {
            let M = list_meshes[document.getElementById("objects").value].M;
            mat4.rotate(M, M, toRadian(-((ANGLE_STEP_MESH * elapsed) / 1000.0) % 360.0), [0, 1, 0]);
        }
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        axes.render(gl, V, P);
        
        for(let i in list_lights)
        {
            // for light state and render it
            list_lights[i].turn_on(document.getElementById('light' + i).checked);
            list_lights[i].set_type(document.getElementById('light' + i + "-type").value == "positional");
            list_lights[i].render(gl, V, P);
        }
        // render the selected mesh using the selected shader
        list_meshes[document.getElementById("objects").value].render(gl, 
            list_shaders[document.getElementById("shading-models").value],
            list_lights,
            __js_materials[document.getElementById("materials").value], V, P);
        
        requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    };
    tick();
}


main();
