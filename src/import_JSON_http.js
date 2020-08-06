import {Mesh} from "../modules/class_mesh.mjs"
import {shaders} from "../modules/shaders.mjs"
import {Material, __js_materials} from "../modules/class_material.mjs"
import {Shader} from "../modules/class_shader.mjs"
import {Light} from "../modules/class_light.mjs"
import {Axes} from "../modules/class_axes.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"


"use strict";

function main()
{
    const loc_aPosition = 2;
    const loc_aNormal = 8;
    const numLights = 1;

    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.2,0.2,0.2,1);
    
    const V = mat4.create();
    mat4.lookAt(V, [2, 1, 3], [0, 0, 0], [0, 1, 0]);
    
    const P = mat4.create();
    mat4.perspective(P, toRadian(50), 1, 1, 100); 
    
    const axes = new Axes(gl);
    
    const uniform_vars = ["MVP", "MV", "matNormal"];
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[0]"));
    Array.prototype.push.apply(uniform_vars, Material.generate_uniform_names("material"));
    
    const shader = new Shader(gl, shaders.src_vert_Phong_Gouraud({loc_aPosition, loc_aNormal, numLights}), 
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
    
    const monkey = new Mesh({gl, loc_aPosition});
    
    
    const request = new XMLHttpRequest();
    
    function tick() {   // Start drawing
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        axes.render(gl, V, P);
        monkey.render(gl, shader, [light], __js_materials["gold"], V, P);
        requestAnimationFrame(tick, canvas);
    };
    
    request.onreadystatechange = function()
    {
        if(request.readyState == 4 && request.status != 404)
        {
            monkey.init_from_json_js(gl, JSON.parse(request.responseText), loc_aPosition, loc_aNormal);
            tick();
        }
    }
    
    request.open('GET', '../resources/monkey_sub2_smooth.json', true);
    request.send();

}


main();

