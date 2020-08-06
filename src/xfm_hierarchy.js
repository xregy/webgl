import {Shader} from "../modules/class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"

"use strict";

function main() {
    const loc_aPosition = 4;
    
    const src_vert = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    uniform mat4	MVP;
    void main()
    {
        gl_Position = MVP*aPosition;
    }`;

    const src_frag = `#version 300 es
    precision mediump float;
    uniform vec3 color;
    out vec4 fColor;
    void main()
    {
        fColor = vec4(color,1);
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    const shader = new Shader(gl, src_vert, src_frag, ["MVP", "color"]);
    
    const quad = init_vbo_quad({gl, loc_aPosition});

    const mat_names = [ "P", "V", "T_base", "Rr", "Tr_low", "Sr", "Tr_high", "Rg", "Tg_low", "Sg", 
                    "Tg_high1", "Tg_high2", "Tb", "Sb", "Rb1", "Rb2"];
    let matrices = {}; 

    for(let m of mat_names)
    {
        matrices[m] = mat4.create();
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    set_slider_callbacks("x_R", function(ev) {render_scene(gl, shader, quad, matrices);});
    set_slider_callbacks("y_R", function(ev) {render_scene(gl, shader, quad, matrices);});
    set_slider_callbacks("length_R", function(ev) {render_scene(gl, shader, quad, matrices);});
    set_slider_callbacks("angle_R", function(ev) {render_scene(gl, shader, quad, matrices);});
    set_slider_callbacks("length_G", function(ev) {render_scene(gl, shader, quad, matrices);});
    set_slider_callbacks("angle_G", function(ev) {render_scene(gl, shader, quad, matrices);});
    set_slider_callbacks("length_B", function(ev) {render_scene(gl, shader, quad, matrices);});
    set_slider_callbacks("angle_B", function(ev) {render_scene(gl, shader, quad, matrices);});
    
    render_scene(gl, shader, quad, matrices);
}

function set_slider_callbacks(id, fn)
{
    document.getElementById(id).onchange = fn;
    document.getElementById(id).oninput = fn;
}

function render_quad(gl, shader, object, uniforms)
{
    gl.bindVertexArray(object.vao);
    set_uniforms(gl, shader, uniforms);
    gl.drawArrays(object.type, 0, object.n);
    gl.bindVertexArray(null);
}


function set_uniforms(gl, shader, uniforms)
{
    let MVP = mat4.create();
    for(let i = 0 ; i < uniforms.matrices.length ; i++)
    {
        mat4.multiply(MVP, MVP, uniforms.matrices[i]);
    }
    gl.uniformMatrix4fv(shader.loc_uniforms.MVP, false, MVP);
    gl.uniform3f(shader.loc_uniforms.color, uniforms.color[0], uniforms.color[1], uniforms.color[2]);
}

function render_scene(gl, shader, quad, matrices)
{
    const WIDTH_RED    = 0.3;
    const WIDTH_GREEN  = 0.2;
    const LENGTH_GREEN = 0.8;
    const WIDTH_BLUE   = (WIDTH_GREEN/2.0);
    const LENGTH_BLUE  = 0.3;

    let  x_R = document.getElementById("x_R").value/100.0;
    let  y_R = document.getElementById("y_R").value/100.0;
    let  length_R = document.getElementById("length_R").value/100.0;
    let  angle_R = document.getElementById("angle_R").value;
    let  length_G = document.getElementById("length_G").value/100.0;
    let  angle_G = document.getElementById("angle_G").value;
    let  length_B = document.getElementById("length_B").value/100.0;
    let  angle_B = document.getElementById("angle_B").value;

    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(shader.h_prog);

    let { P, V, T_base, Rr, Tr_low, Sr, Tr_high, Rg, Tg_low, Sg, Tg_high1, Tg_high2, Tb, Sb, Rb1, Rb2} = matrices;

    /*
                     P
                     |
                     V
                     |
                  T_base
                     |
                     Rr
                    /  \
               Tr_high  Tr_low
                  /      |
                 Rg      Sr
                /|\      |
               / | \  red quad
              /  |  \   
             /   |   \      
            /    |    \
       Tg_low Tg_high1 Tg_high2
          |      |      |
          Sg    Rb1    Rb2
          |      |      | 
        green    Tb     Tb
         quad    |      |
                 Sb     Sb
                 |      |
               blue    blue
               quad    quad
    */


    mat4.ortho(P, -2, 2, -2, 2, 0, 4);
    mat4.fromTranslation(V, [0, 0, -2]);
    
    mat4.fromTranslation(T_base, [x_R, y_R, 0]);
    mat4.fromRotation(Rr, toRadian(angle_R), [0, 0, 1]);
    mat4.fromTranslation(Tr_low, [(length_R-WIDTH_RED)/2.0, 0, 0.1]);
    mat4.fromScaling(Sr, [length_R, WIDTH_RED, 1]);
    
    render_quad(gl, shader, quad, {matrices:[P,V,T_base,Rr,Tr_low,Sr], color:[1,0,0]});
    
    mat4.fromTranslation(Tr_high, [length_R - WIDTH_RED, 0, 0]);
    mat4.fromRotation(Rg, toRadian(angle_G), [0, 0, 1]);
    mat4.fromTranslation(Tg_low, [(length_G - WIDTH_GREEN)/2.0, 0, 0]);
    mat4.fromScaling(Sg, [length_G, WIDTH_GREEN, 1]);
    
    render_quad(gl, shader, quad, {matrices:[P,V,T_base,Rr,Tr_high,Rg,Tg_low,Sg], color:[0,1,0]});
    
    mat4.fromTranslation(Tg_high1, [length_G - WIDTH_GREEN + WIDTH_BLUE/2.0, WIDTH_BLUE/2.0, 0]);
    mat4.fromTranslation(Tg_high2, [length_G - WIDTH_GREEN + WIDTH_BLUE/2.0, -WIDTH_BLUE/2.0, 0]);
    mat4.fromTranslation(Tb, [(length_B - WIDTH_BLUE)/2.0, 0, 0.3]);
    mat4.fromScaling(Sb, [length_B, WIDTH_BLUE, 1]);
    mat4.fromRotation(Rb1, toRadian(angle_B), [0, 0, 1]);
    mat4.fromRotation(Rb2, toRadian(-angle_B), [0, 0, 1]);

    render_quad(gl, shader, quad, {matrices:[P,V,T_base,Rr,Tr_high,Rg,Tg_high1,Rb1,Tb,Sb], color:[0,0,1]});

    render_quad(gl, shader, quad, {matrices:[P,V,T_base,Rr,Tr_high,Rg,Tg_high2,Rb2,Tb,Sb], color:[0,0,1]});
}

function init_vbo_quad({gl, loc_aPosition}) 
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const verts = new Float32Array([
      -0.5, -0.5,
       0.5, -0.5, 
       0.5,  0.5,
      -0.5,  0.5
    ]);
    
    const buf = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return {vao:vao, n:4, type:gl.TRIANGLE_FAN};
}

main();
