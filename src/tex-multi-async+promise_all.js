import {Shader} from "../modules/class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"

"use strict";

function main()
{
    const loc_aPosition = 3;
    const loc_aTexCoord0 = 5;
    const loc_aTexCoord1 = 6;

    const src_vert = 
    `#version 300 es
    layout(location=${loc_aPosition}) in vec2 aPosition;
    layout(location=${loc_aTexCoord0}) in vec2 aTexCoord0;
    layout(location=${loc_aTexCoord1}) in vec2 aTexCoord1;
    out vec2 vTexCoord0;
    out vec2 vTexCoord1;
    uniform mat4 MVP;
    void main()
    {
        gl_Position = MVP * vec4(aPosition, 0, 1);
        vTexCoord0 = aTexCoord0;
        vTexCoord1 = aTexCoord1;
    }
    `;
    
    const src_frag =
    `#version 300 es
    precision mediump float;
    uniform sampler2D uSampler0;
    uniform sampler2D uSampler1;
    in vec2 vTexCoord0;
    in vec2 vTexCoord1;
    out vec4 fColor;
    void main()
    {
        vec4 color0 = texture(uSampler0, vTexCoord0);
        vec4 color1 = texture(uSampler1, vTexCoord1);
        fColor = mix(color0, color1, 0.5);
    }
    `;

    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext('webgl2');
    
    const prog = new Shader(gl, src_vert, src_frag);
    const obj = initVBO(gl, loc_aPosition, loc_aTexCoord0, loc_aTexCoord1);
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    const textures = [{texture:null, unit:3, image:new Image(), loaded:false},
                    {texture:null, unit:5, image:new Image(), loaded:false}];
    
    const MVP = mat4.create();

    const loc_uSampler 
        = [0,1].map((i) => gl.getUniformLocation(prog.h_prog, "uSampler" + i));
    const loc_MVP = gl.getUniformLocation(prog.h_prog, "MVP");

    prog.set_uniforms = function(gl) 
    {
        for(let i in textures)
        {
            gl.activeTexture(gl.TEXTURE0 + textures[i].unit);
            gl.bindTexture(gl.TEXTURE_2D, textures[i].texture);
            gl.uniform1i(loc_uSampler[i], textures[i].unit);
        }
        gl.uniformMatrix4fv(loc_MVP, false, MVP);
    };
 
    let t_last = Date.now();
    const ANGLE_STEP = 45;
    
    function tick() {
        let now = Date.now();
        let elapsed = now - t_last;
        t_last = now;
        
        mat4.rotate(MVP, MVP, toRadian(( (ANGLE_STEP * elapsed) / 1000.0) % 360.0), [0, 0, 1]);
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        render_object(gl, prog, obj);
        requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    };
    
    function load_image(tex, src, callback)
    {
        return new Promise(function(resolve, reject) {
            tex.image.onload = () => resolve(tex);
            tex.image.onerror = () => reject(new Error(`Error while loading image "${src}"`));
            tex.image.src = src;
        });
    }

    async function start() {
        try {
            let texes = await Promise.all([
                load_image(textures[0], '../resources/sky.jpg'),
                load_image(textures[1], '../resources/circle.gif')]);
            init_texture(gl, texes[0]);
            init_texture(gl, texes[1]);
            tick();
        } catch(e) {
            console.log(`${e}`);
        }
    }


    start();

}

function render_object(gl, prog, object)
{
    gl.useProgram(prog.h_prog);
    prog.set_uniforms(gl);
    gl.bindVertexArray(object.vao);
    
    if(object.drawcall == "drawArrays") gl.drawArrays(object.type, 0, object.n);
    else if(object.drawcall == "drawElements") gl.drawElements(object.type, object.n, object.type_index, 0);
    
    gl.bindVertexArray(null);
    gl.useProgram(null);
}


function initVBO(gl, loc_aPosition, loc_aTexCoord0, loc_aTexCoord1)
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    const verts = new Float32Array([
        -0.5,  0.5,   0, 1,  -1,  2,
        -0.5, -0.5,   0, 0,  -1, -1,
         0.5,  0.5,   1, 1,   2,  2,
         0.5, -0.5,   1, 0,   2, -1
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    const SZ = verts.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, SZ*6, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aTexCoord0, 2, gl.FLOAT, false, SZ*6, SZ*2);
    gl.enableVertexAttribArray(loc_aTexCoord0);
    
    gl.vertexAttribPointer(loc_aTexCoord1, 2, gl.FLOAT, false, SZ*6, SZ*4);
    gl.enableVertexAttribArray(loc_aTexCoord1);
    
    gl.bindVertexArray(null);
    
    return {vao:vao, n:4, drawcall:"drawArrays", type:gl.TRIANGLE_STRIP};
}


function init_texture(gl, tex)
{
    tex.texture = gl.createTexture(); 
    gl.bindTexture(gl.TEXTURE_2D, tex.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
    return true;
}

main();


