import {Mesh} from "../modules/class_mesh.mjs"
import {shaders} from "../modules/shaders.mjs"
import {Material, __js_materials} from "../modules/class_material.mjs"
import {Shader} from "../modules/class_shader.mjs"
import {Light} from "../modules/class_light.mjs"
//import {Axes} from "../modules/class_axes.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"
import {create_mesh_cube} from "../modules/create_mesh_cube.js"
import {create_mesh_sphere} from "../modules/create_mesh_sphere.js"

"use strict";

function main()
{
    const loc_aPosition = 2;
    const loc_aNormal = 8;
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
                shaders.src_vert_Blinn_Gouraud({loc_aPosition, loc_aNormal, numLights}), 
                shaders.src_frag_Blinn_Gouraud(), uniform_vars);
    
    const light = new Light
    (
        gl,
        [3, 3, 3, 1.0],
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
    
    const list_meshes = [monkey, cube, ball];	// the order should be consistent
    
    mat4.fromTranslation(cube.M, [2.5,2.5,0]);
    mat4.fromTranslation(ball.M, [2.5,0,2.5]);
    mat4.fromTranslation(monkey.M, [0,2.5,2.5]);
    
    const list_materials = {
        "cube":__js_materials["silver"], 
        "ball":__js_materials["copper"],
        "monkey":__js_materials["gold"], 
        };
    
    canvas.onmousedown = function(ev) 
    {
        let x = ev.clientX, y = ev.clientY;
        let bb = ev.target.getBoundingClientRect();
        if (bb.left <= x && x < bb.right && bb.top <= y && y < bb.bottom)
        {
            let id = get_id(gl, list_meshes, {x:x-bb.left, y:bb.bottom-y}, V, P);
            if(id > 0)
                document.getElementById("output").innerHTML = "The " + list_meshes[id-1].name + " is selected.";
            else
                document.getElementById("output").innerHTML = "Nothing is selected.";
            render_scene(gl, list_meshes, shader, [light], list_materials, V, P);
        }
    }
    function tick()
    {
        render_scene(gl, list_meshes, shader, [light], list_materials, V, P);
        requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    };
    tick();
}

function render_scene(gl, meshes, shader, lights, materials, V, P)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for(let light of lights)    light.render(gl, V, P);
    for(let mesh of meshes) mesh.render(gl, shader, lights, materials[mesh.name], V, P);
}

function get_id(gl, meshes, pos, V, P)
{
    for(let mesh of meshes) mesh.render_id(gl, V, P);
    
    let pixels = new Uint8Array(4); 
    
    gl.readPixels(pos.x, pos.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    
    return pixels[0];
}

main();

