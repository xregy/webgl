"use strict";
function main() {
    let canvas = document.getElementById('webgl');
    let gl = getWebGLContext(canvas);

    let shader = new Shader(gl, 
                document.getElementById("shader-vert").text,
                document.getElementById("shader-frag").text,
                ["aPosition"]);
    
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

const WIDTH_RED = 0.3;
const WIDTH_GREEN	= 0.2;
const LENGTH_GREEN = 0.8;
const WIDTH_BLUE = (WIDTH_GREEN/2.0);
const LENGTH_BLUE	= 0.3;

let x_R = 0;
let y_R = 0;
let length_R = 1.0;
let angle_R = 10;
let length_G;
let angle_G = -10;
let length_B;
let angle_B = 30;

function render_quad(gl, shader, object, uniforms)
{
    set_uniforms(gl, shader.loc_uniforms, uniforms);
    for(let attrib_name in shader.attribs)
    {
        let	attrib = object.attribs[attrib_name];
        gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
        gl.vertexAttribPointer(shader.attribs[attrib_name], attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(shader.attribs[attrib_name]);
    }
    gl.drawArrays(object.type, 0, object.n);
}

function set_uniforms(gl, loc_uniforms, uniforms)
{
    gl.uniformMatrix4fv(loc_uniforms.MVP, false, uniforms.MVP.elements);
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
    
    let MatStack = [];
    let MVP = new Matrix4();
    
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
    
    MVP.setOrtho(-2, 2, -2, 2, 0, 4);   // P
    MVP.translate(0, 0, -2);    // V
    
    MVP.translate(x_R, y_R, 0); // T_base
    MVP.rotate(angle_R, 0, 0, 1);   // Rr
    MatStack.push(new Matrix4(MVP));
        MVP.translate((length_R-WIDTH_RED)/2.0, 0, 0.1);    // Tr_low
        MVP.scale(length_R, WIDTH_RED, 1);  // Sr
        render_quad(gl, shader, quad, {MVP:MVP, color:[1,0,0]});    // red quad
    MVP = MatStack.pop();
    
    MVP.translate(length_R - WIDTH_RED, 0, 0);  // Tr_high
    MVP.rotate(angle_G, 0, 0, 1);   // Rg
    MatStack.push(new Matrix4(MVP));
        MVP.translate((length_G - WIDTH_GREEN)/2.0, 0, 0);  // Tg_low
        MVP.scale(length_G, WIDTH_GREEN, 1);    // Sg
        render_quad(gl, shader, quad, {MVP:MVP, color:[0,1,0]});    // green quad
    MVP = MatStack.pop();
    
    MatStack.push(new Matrix4(MVP));
        MVP.translate(length_G - WIDTH_GREEN + WIDTH_BLUE/2.0, WIDTH_BLUE/2.0, 0); // Tg_high1
        MVP.rotate(angle_B, 0, 0, 1);    // Rb1
        MVP.translate((length_B - WIDTH_BLUE)/2.0, 0, 0.3);   // Tb
        MVP.scale(length_B, WIDTH_BLUE, 1);   // Sb
        render_quad(gl, shader, quad, {MVP:MVP, color:[0,0,1]});    // blue quad
    MVP = MatStack.pop();
    
    MatStack.push(new Matrix4(MVP));
        MVP.translate(length_G - WIDTH_GREEN + WIDTH_BLUE/2.0, -WIDTH_BLUE/2.0, 0);    // Tg_high2
        MVP.rotate(-angle_B, 0, 0, 1);   // Rb2
        MVP.translate((length_B - WIDTH_BLUE)/2.0, 0, 0.3);   // Tb
        MVP.scale(length_B, WIDTH_BLUE, 1);   // Sb
        render_quad(gl, shader, quad, {MVP:MVP, color:[0,0,1]});    // blue quad
    MVP = MatStack.pop();

}

function init_vbo_quad(gl)
{
    let verts = new Float32Array([
      -0.5, -0.5,
       0.5, -0.5, 
       0.5,  0.5,
      -0.5,  0.5
    ]);
    
    // Create a buffer object
    let buf = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    let attribs = [];
    attribs["aPosition"] = {buffer:buf, size:2, type:gl.FLOAT, normalized:false, stride:0, offset:0};
    
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return {n:4, type:gl.TRIANGLE_FAN, attribs:attribs};
}
