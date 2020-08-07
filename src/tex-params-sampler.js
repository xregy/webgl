import {Shader} from "../modules/class_shader.mjs"

"use strict";

function main() 
{
    const tex_unit = 5;
    const loc_aPosition = 3;
    const loc_aTexCoord = 8;
    
    const src_vert =
    `#version 300 es
        layout(location=${loc_aPosition}) in vec4 aPosition;
        layout(location=${loc_aTexCoord}) in vec2 aTexCoord;
        out vec2 vTexCoord;
        void main() {
            gl_Position = aPosition;
            vTexCoord = aTexCoord;
        }
    `;
    
    // Fragment shader program
    const src_frag =
    `#version 300 es
        precision mediump float;
        uniform sampler2D uSampler;
        in vec2 vTexCoord;
        out vec4 fColor;
        void main() {
            fColor = texture(uSampler, vTexCoord);
        }
    `;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    const prog = new Shader(gl, src_vert, src_frag);
    gl.useProgram(prog.h_prog);

    const vao = initVertexBuffers(gl, loc_aPosition, loc_aTexCoord);

    const loc_uSampler = gl.getUniformLocation(prog.h_prog, 'uSampler');
    const tex = initTextures(gl, loc_uSampler, tex_unit);
    const sampler = gl.createSampler();
    gl.bindSampler(tex_unit, sampler);
    
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    init_UI(gl, vao, sampler);
    refresh(gl, vao, sampler);
}

function refresh(gl, vao, sampler)
{
    let e;
    
    gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    e = document.getElementById("mag_filter");
    gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, e.options[e.selectedIndex].value);
    
    e = document.getElementById("wrap_s");
    gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, e.options[e.selectedIndex].value);
    
    e = document.getElementById("wrap_t");
    gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, e.options[e.selectedIndex].value);
    
    gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    gl.bindVertexArray(vao);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle

    gl.bindVertexArray(null);
}


function init_UI(gl, vao, sampler)
{
    let e;

    e = document.getElementById("mag_filter");
    e.options[0].value = gl.NEAREST;
    e.options[1].value = gl.LINEAR;
    e.onchange = function(ev) { refresh(gl,vao,sampler); };

    e = document.getElementById("wrap_s");
    e.options[0].value = gl.REPEAT;
    e.options[1].value = gl.CLAMP_TO_EDGE;
    e.options[2].value = gl.MIRRORED_REPEAT;
    e.onchange = function(ev) { refresh(gl,vao,sampler); };

    e = document.getElementById("wrap_t");
    e.options[0].value = gl.REPEAT;
    e.options[1].value = gl.CLAMP_TO_EDGE;
    e.options[2].value = gl.MIRRORED_REPEAT;
    e.onchange = function(ev) { refresh(gl,vao,sampler); };
}

function initVertexBuffers(gl, loc_aPosition, loc_aTexCoord) 
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const verticesTexCoords = new Float32Array([
      // Vertex coordinates, texture coordinate
      -0.5,  0.5,   -1.0,  2.0,
      -0.5, -0.5,   -1.0, -1.0,
       0.5,  0.5,    2.0,  2.0,
       0.5, -0.5,    2.0, -1.0,
    ]);
    
    // Create the buffer object
    const vertexTexCoordBuffer = gl.createBuffer();
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    
    const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(loc_aPosition);  // Enable the assignment of the buffer object
    
    gl.vertexAttribPointer(loc_aTexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(loc_aTexCoord);  // Enable the assignment of the buffer object

    gl.bindVertexArray(null);
    return vao;
}

function initTextures(gl, loc_uSampler, tex_unit)
{
    const texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0 + tex_unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 2, 2, 0, gl.RGB, gl.UNSIGNED_BYTE, 
        new Uint8Array([255,0,0,   0,255,0,    0,0,255,   255,0,255]));
    
    gl.uniform1i(loc_uSampler, tex_unit);
    
    return texture;
}


main();

