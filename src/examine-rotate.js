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
import {length2, unproject_vector} from "../modules/utils.js"

"use strict";

function main()
{
    const loc_aPosition = 2;
    const loc_aNormal = 1;
    const numLights = 1;

    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    
    const V = mat4.create();
    mat4.lookAt(V, [6, 6, 6], [0, 0, 0], [0, 1, 0]);
    
    const P = mat4.create();
    mat4.perspective(P, toRadian(60), 1, 1, 100); 
    
    const uniform_vars = ["MVP", "MV", "matNormal"];
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[0]"));
    Array.prototype.push.apply(uniform_vars, Material.generate_uniform_names("material"));
    
    const shader = new Shader(gl, 
                shaders.src_vert_Phong_Gouraud({loc_aPosition, loc_aNormal, numLights}), 
                shaders.src_frag_Phong_Gouraud(), uniform_vars);
    
    const light = new Light
    (
        gl,
        [2.5, 2.5, 2.5, 1.0],
        [0.1, 0.1, 0.1, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        false
    );
    light.turn_on(true);
    
    // initializes the meshes
    const cube = create_mesh_cube(gl, loc_aPosition, loc_aNormal);
    const ball = create_mesh_sphere(gl, 20, loc_aPosition, loc_aNormal);
    const monkey = new Mesh({gl, loc_aPosition});
    monkey.init_from_json_js(gl, __js_monkey_smooth, loc_aPosition, loc_aNormal);

    let id = 0;
    monkey.id = ++id;
    cube.id = ++id;
    ball.id = ++id;
    
    monkey.name = "monkey";
    cube.name = "cube";
    ball.name = "ball";
    
    const list_meshes = [monkey, cube, ball];	
    
    mat4.fromTranslation(cube.M, [2.5,2.5,0]);
    mat4.fromTranslation(ball.M, [2.5,0,2.5]);
    mat4.fromTranslation(monkey.M, [0,2.5,2.5]);

    const list_materials = {
        "cube":__js_materials["silver"], 
        "ball":__js_materials["copper"],
        "monkey":__js_materials["gold"], 
        };
    
    const axes = new Axes(gl,4);
    
    let lastX;
    let lastY;
    let angle = [0,0];
    let dragging = false;
    
    canvas.onmousedown = function(ev) 
    {
        let x = ev.clientX, y = ev.clientY;
        let bb = ev.target.getBoundingClientRect();
        if (bb.left <= x && x < bb.right && bb.top <= y && y < bb.bottom)
        {
            lastX = x;
            lastY = y;
            dragging = true;
        }
    }
    canvas.onmouseup = function(ev) { dragging = false; };
    
    const VP = mat4.create();
    canvas.onmousemove = function(ev)
    {    
        let x = ev.clientX;
        let y = ev.clientY;
        if(dragging)
        {
            let offset = [x - lastX, y - lastY];
            if(offset[0] != 0 || offset[1] != 0) // For some reason, the offset becomes zero sometimes...
            {
                mat4.copy(VP, P);
                mat4.multiply(VP, VP, V);
                let axis = unproject_vector([offset[1], offset[0], 0], VP, 
                    gl.getParameter(gl.VIEWPORT));
                mat4.rotate(V, V, toRadian(length2(offset)), [axis[0], axis[1], axis[2]]);
            }
        }
        lastX = x;
        lastY = y;
    }
    
    let tick = function()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        axes.render(gl, V, P);
        light.render(gl, V, P);
        for(let mesh of list_meshes)
                mesh.render(gl, shader, [light], list_materials[mesh.name], V, P);
        requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    };
    tick();
}

main();

