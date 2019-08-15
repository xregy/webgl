"use strict";
function main() {
    let canvas = document.getElementById('webgl');
    let gl = canvas.getContext("webgl2");
    let shader = new Shader(gl, 
            document.getElementById("shader-vert").text,
            document.getElementById("shader-frag").text,
            {aPosition:3});
    
    let quad = init_vbo_quad(gl);
    
    shader.loc_uniforms = {MVP:gl.getUniformLocation(shader.h_prog, "MVP"),
                        color:gl.getUniformLocation(shader.h_prog, "color")};
    
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

const WIDTH_RED    = 0.3;
const WIDTH_GREEN  = 0.2;
const LENGTH_GREEN = 0.8;
const WIDTH_BLUE   = (WIDTH_GREEN/2.0);
const LENGTH_BLUE  = 0.3;

let x_R      = 0;
let y_R      = 0;
let length_R = 1.0;
let angle_R  = 10;
let length_G;
let angle_G  = -10;
let length_B;
let angle_B  = 30;

function render_quad(gl, shader, vao, uniforms)
{
    set_uniforms(gl, shader.loc_uniforms, uniforms);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);
}

function set_uniforms(gl, loc_uniforms, uniforms)
{
    let MVP = new Matrix4();
    for(let m of uniforms.matrices)
    {
        MVP.multiply(m);
    }
    gl.uniformMatrix4fv(loc_uniforms.MVP, false, MVP.elements);
    gl.uniform3fv(loc_uniforms.color, (new Vector3(uniforms.color)).elements);
}

function refresh_values()
{
    x_R = document.getElementById("x_R").value/100.0;
    y_R = document.getElementById("y_R").value/100.0;
    length_R = document.getElementById("length_R").value/100.0;
    angle_R = document.getElementById("angle_R").value;
    length_G = document.getElementById("length_G").value/100.0;
    angle_G = document.getElementById("angle_G").value;
    length_B = document.getElementById("length_B").value/100.0;
    angle_B = document.getElementById("angle_B").value;
}

function render_scene(gl, shader, quad)
{
    refresh_values();
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(shader.h_prog);


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


    let P  = new Matrix4();	P.setOrtho(-2, 2, -2, 2, 0, 4);
    let V = new Matrix4();	V.setTranslate(0, 0, -2);
    
    let T_base = new Matrix4();		T_base.setTranslate(x_R, y_R, 0);
    let Rr = new Matrix4();			Rr.setRotate(angle_R, 0, 0, 1);
    let Tr_low = new Matrix4();		Tr_low.setTranslate((length_R-WIDTH_RED)/2.0, 0, 0.1);
    let Sr = new Matrix4();			Sr.setScale(length_R, WIDTH_RED, 1);
    
    render_quad(gl, shader, quad, {matrices:[P,V,T_base,Rr,Tr_low,Sr], color:[1,0,0]});
    
    let Tr_high = new Matrix4();	Tr_high.setTranslate(length_R - WIDTH_RED, 0, 0);
    let Rg = new Matrix4();			Rg.setRotate(angle_G, 0, 0, 1);
    let Tg_low = new Matrix4();		Tg_low.setTranslate((length_G - WIDTH_GREEN)/2.0, 0, 0);
    let Sg = new Matrix4();			Sg.setScale(length_G, WIDTH_GREEN, 1);
    render_quad(gl, shader, quad, {matrices:[P,V,T_base,Rr,Tr_high,Rg,Tg_low,Sg], color:[0,1,0]});
    
    let Tg_high1 = new Matrix4();	Tg_high1.setTranslate(length_G - WIDTH_GREEN + WIDTH_BLUE/2.0, WIDTH_BLUE/2.0, 0);
    let Tg_high2 = new Matrix4();	Tg_high2.setTranslate(length_G - WIDTH_GREEN + WIDTH_BLUE/2.0, -WIDTH_BLUE/2.0, 0);
    let Tb = new Matrix4();			Tb.setTranslate((length_B - WIDTH_BLUE)/2.0, 0, 0.3);
    let Sb = new Matrix4();			Sb.setScale(length_B, WIDTH_BLUE, 1);
    let Rb1 = new Matrix4();		Rb1.setRotate(angle_B, 0, 0, 1);
    let Rb2 = new Matrix4();		Rb2.setRotate(-angle_B, 0, 0, 1);
    render_quad(gl, shader, quad, {matrices:[P,V,T_base,Rr,Tr_high,Rg,Tg_high1,Rb1,Tb,Sb], color:[0,0,1]});
    render_quad(gl, shader, quad, {matrices:[P,V,T_base,Rr,Tr_high,Rg,Tg_high2,Rb2,Tb,Sb], color:[0,0,1]});
}

function init_vbo_quad(gl) {
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let verts = new Float32Array([
      -0.5, -0.5,
       0.5, -0.5, 
       0.5,  0.5,
      -0.5,  0.5
    ]);
    
    let buf = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    let loc_aPosition = 3;
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return vao;
}
