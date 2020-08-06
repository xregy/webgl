import {Shader} from "../modules/class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"

"use strict";

function main()
{
    const loc_aPosition = 4;
    const loc_aColor = 8;

    const src_vert = `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aColor}) in vec4 aColor;
    out vec4 vColor;
    uniform	mat4 uMVP;
    void main()
    {
        gl_Position = uMVP*aPosition;
        vColor = aColor;
    }`;
    const src_frag = `#version 300 es
    precision mediump float;
    in vec4 vColor;
    out vec4 fColor;
    void main()
    {
        fColor = vColor;
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    const prog = new Shader(gl, src_vert, src_frag, ["uMVP"]);
    gl.useProgram(prog.h_prog);


    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    let objs = [];
    for(let i=3 ; i<=6 ; i++) objs.push(init_vbo_polygon({gl, n:i, loc_aPosition, loc_aColor}));
    
    const positions = [ [-.5,-.5, 0], [.5,-.5, 0], [.5,.5, 0], [-.5,.5, 0]];
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    for(let i=0 ; i<4 ; i++)
    {
        let MVP = mat4.create();
        mat4.translate(MVP, MVP, positions[i]);
        draw_obj(gl, prog, objs[i], MVP);
    }
}

function draw_obj(gl, prog, obj, MVP)
{
    gl.useProgram(prog.h_prog);
    gl.bindVertexArray(obj.vao);
//    shader.set_uniforms(gl);
    gl.uniformMatrix4fv(prog.loc_uniforms["uMVP"], false, MVP);
    
    gl.drawArrays(obj.type, 0, obj.n);
    
    gl.bindVertexArray(null);
    gl.useProgram(null);
}

function init_vbo_polygon({gl, n, loc_aPosition, loc_aColor})
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const STRIDE = 2+3;
    const RADIUS = 0.4;
    const attribs = new Float32Array((n+2)*STRIDE);
    
    attribs[0] = 0;
    attribs[1] = 0;
    attribs[2] = 1;
    attribs[3] = 1;
    attribs[4] = 1;
    for(let i=0 ; i<=n ; i++)
    {
        attribs[(i+1)*STRIDE + 0] = RADIUS*Math.cos(i*2*Math.PI/n);
        attribs[(i+1)*STRIDE + 1] = RADIUS*Math.sin(i*2*Math.PI/n);
        attribs[(i+1)*STRIDE + 2] = Math.cos(i*2*Math.PI/n);
        attribs[(i+1)*STRIDE + 3] = Math.sin(i*2*Math.PI/n);
        attribs[(i+1)*STRIDE + 4] = 1;
    }
    
    const vbo = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, attribs, gl.STATIC_DRAW);
    
    const SZ = attribs.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, SZ*5, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, SZ*5, SZ*2);
    gl.enableVertexAttribArray(loc_aColor);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return {vao:vao, type:gl.TRIANGLE_FAN, n:n+2};
}

main();
