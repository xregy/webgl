import {Shader} from "../modules/class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"

"use strict";

function main() {
    const loc_aPosition = 5;

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
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    set_slider_callbacks("x_R", function(ev) {render_scene(gl, shader, quad);});
    set_slider_callbacks("y_R", function(ev) {render_scene(gl, shader, quad);});
    set_slider_callbacks("length_R", function(ev) {render_scene(gl, shader, quad);});
    set_slider_callbacks("angle_R", function(ev) {render_scene(gl, shader, quad);});
    set_slider_callbacks("length_G", function(ev) {render_scene(gl, shader, quad);});
    set_slider_callbacks("angle_G", function(ev) {render_scene(gl, shader, quad);});
    set_slider_callbacks("length_B", function(ev) {render_scene(gl, shader, quad);});
    set_slider_callbacks("angle_B", function(ev) {render_scene(gl, shader, quad);});
    
    render_scene(gl, shader, quad);
}

function set_slider_callbacks(id, fn)
{
    document.getElementById(id).onchange = fn;
    document.getElementById(id).oninput = fn;
}

function render_quad(gl, shader, object, uniforms)
{
    gl.bindVertexArray(object.vao);
    gl.uniformMatrix4fv(shader.loc_uniforms.MVP, false, uniforms.MVP);
    gl.uniform3f(shader.loc_uniforms.color, uniforms.color[0], uniforms.color[1], uniforms.color[2]);
    gl.drawArrays(object.type, 0, object.n);
    gl.bindVertexArray(null);
}


function render_scene(gl, shader, quad)
{
    const WIDTH_RED = 0.3;
    const WIDTH_GREEN	= 0.2;
    const LENGTH_GREEN = 0.8;
    const WIDTH_BLUE = (WIDTH_GREEN/2.0);
    const LENGTH_BLUE	= 0.3;

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
    
    let MatStack = [];
    let MVP = mat4.create();
    
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
    
    mat4.ortho(MVP, -2, 2, -2, 2, 0, 4);   // P
    mat4.translate(MVP, MVP, [0, 0, -2]);    // V
    
    mat4.translate(MVP, MVP, [x_R, y_R, 0]); // T_base
    mat4.rotate(MVP, MVP, toRadian(angle_R), [0, 0, 1]);   // Rr
    MatStack.push(mat4.clone(MVP));
        mat4.translate(MVP, MVP, [(length_R-WIDTH_RED)/2.0, 0, 0.1]);    // Tr_low
        mat4.scale(MVP, MVP, [length_R, WIDTH_RED, 1]);  // Sr
        render_quad(gl, shader, quad, {MVP:MVP, color:[1,0,0]});    // red quad
    MVP = MatStack.pop();
    
    mat4.translate(MVP, MVP, [length_R - WIDTH_RED, 0, 0]);  // Tr_high
    mat4.rotate(MVP, MVP, toRadian(angle_G), [0, 0, 1]);   // Rg
    MatStack.push(mat4.clone(MVP));
        mat4.translate(MVP, MVP, [(length_G - WIDTH_GREEN)/2.0, 0, 0]);  // Tg_low
        mat4.scale(MVP, MVP, [length_G, WIDTH_GREEN, 1]);    // Sg
        render_quad(gl, shader, quad, {MVP:MVP, color:[0,1,0]});    // green quad
    mat4.copy(MVP, MatStack.pop());
    
    MatStack.push(mat4.clone(MVP));
        mat4.translate(MVP, MVP, [length_G - WIDTH_GREEN + WIDTH_BLUE/2.0, WIDTH_BLUE/2.0, 0]); // Tg_high1
        mat4.rotate(MVP, MVP, toRadian(angle_B), [0, 0, 1]);    // Rb1
        mat4.translate(MVP, MVP, [(length_B - WIDTH_BLUE)/2.0, 0, 0.3]);   // Tb
        mat4.scale(MVP, MVP, [length_B, WIDTH_BLUE, 1]);   // Sb
        render_quad(gl, shader, quad, {MVP:MVP, color:[0,0,1]});    // blue quad
    mat4.copy(MVP, MatStack.pop());
    
    MatStack.push(mat4.clone(MVP));
        mat4.translate(MVP, MVP, [length_G - WIDTH_GREEN + WIDTH_BLUE/2.0, -WIDTH_BLUE/2.0, 0]);    // Tg_high2
        mat4.rotate(MVP, MVP, toRadian(-angle_B), [0, 0, 1]);   // Rb2
        mat4.translate(MVP, MVP, [(length_B - WIDTH_BLUE)/2.0, 0, 0.3]);   // Tb
        mat4.scale(MVP, MVP, [length_B, WIDTH_BLUE, 1]);   // Sb
        render_quad(gl, shader, quad, {MVP:MVP, color:[0,0,1]});    // blue quad
    mat4.copy(MVP, MatStack.pop());

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
