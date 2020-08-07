import * as THREE from "https://threejs.org/build/three.module.js"
import {GLTFLoader} from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"
import {Shader} from "../modules/class_shader.mjs"
import {Mesh} from "../modules/class_mesh.mjs"
import {Axes} from "../modules/class_axes.mjs"
import {Texture} from "../modules/class_texture.mjs"
import {length2, unproject_vector} from "../modules/utils.js"
import {Light} from "../modules/class_light.mjs"

"use strict";

function main()
{
    const loc_aPosition = 3;
    const loc_aTexCoord = 8;
    const loc_aNormal = -1;
    const numLights = 0;
    
    const src_vert = `#version 300 es
    layout(location=${loc_aPosition}) in vec4	aPosition;
    layout(location=${loc_aTexCoord}) in vec2	aTexCoord;
    out vec2	vTexCoord;
    uniform mat4	MVP;
    void main()
    {
    	gl_Position = MVP*aPosition;
    	vTexCoord = aTexCoord;
    }`;
    const src_frag = `#version 300 es
    #ifdef GL_ES
    precision mediump float;
    #endif
    uniform sampler2D tex;
    in vec2	vTexCoord;
    out vec4 fColor;
    void main()
    {
    	fColor = texture(tex, vTexCoord);
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext('webgl2');
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    
    const V = mat4.create();
    mat4.lookAt(V, [6, 6, 6], [0, 0, 0], [0, 1, 0]);
    
    const P = mat4.create();
//    mat4.perspective(P, toRadian(60), 1, 1, 100); 
    mat4.ortho(P, -15, 15, -15, 15, 1, 100);
 
    const uniform_vars = ["MVP", "tex"];
    
    const prog = new Shader(gl, src_vert, src_frag, uniform_vars);
    
    const mesh = new Mesh({gl, loc_aPosition});
    
    mat4.fromTranslation(mesh.M, [0, -14, 0]);
    
    const axes = new Axes(gl,10);
    
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
    
   
    const manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
    };
    
    let tex;
    
    const url = 'https://threejs.org/examples/models/gltf/Nefertiti/Nefertiti.glb';
    
    const loader = new GLTFLoader( manager );
    loader.load(url,
        function ( object )
        {
            document.getElementById("output").innerHTML = 'Successfully loaded.';
            for(let obj of object.scene.children)
            {
                if(obj.type == "Mesh")
                {
                    mesh.init_from_THREE_geometry(gl, obj.geometry, loc_aPosition, null, loc_aTexCoord);
                    tex = new Texture(gl, obj.material.map.image, false);
                }
            }
            tick();
        },
        // called when loading is in progresses
        function ( xhr )
        {
            document.getElementById("output").innerHTML = ( xhr.loaded / xhr.total * 100 ) + '% loaded.';
        },
        // called when loading has errors
        function ( error )
        {
            document.getElementById("output").innerHTML = 'An error happened: ' + error;
        }
    
    );
    
    
    function tick() {   // start drawing
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        axes.render(gl, V, P);
        mesh.render(gl, prog, null, null, V, P, {"tex":tex});
        requestAnimationFrame(tick, canvas);
    };
    

}


main();

