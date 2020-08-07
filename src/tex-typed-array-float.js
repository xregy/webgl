import {Shader} from "../modules/class_shader.mjs"

"use strict";

function main() 
{
    const loc_aPosition = 5;
    const loc_aTexCoord = 2;

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

    const loc_uSampler = gl.getUniformLocation(prog.h_prog, 'uSampler');

    const vao = initVertexBuffers(gl, loc_aPosition, loc_aTexCoord);
    
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    initTextures(gl, loc_uSampler);
    gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    gl.bindVertexArray(vao);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle
    
}

function initVertexBuffers(gl, loc_aPosition, loc_aTexCoord) 
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const verticesTexCoords = new Float32Array([
      // Vertex coordinates, texture coordinate
      -0.5,  0.5,   0.0, 1.0,
      -0.5, -0.5,   0.0, 0.0,
       0.5,  0.5,   1.0, 1.0,
       0.5, -0.5,   1.0, 0.0,
    ]);
    
    const vertexTexCoordBuffer = gl.createBuffer();
    
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

function initTextures(gl, loc_uSampler) 
{
    const texture = gl.createTexture();
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    // The following setting doesn't work...
//    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 2, 2, 0, gl.RGB, gl.FLOAT, new Float32Array([1,0,0,   0,1,0,   0,0,1,   1,0,1]));

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB32F, 2, 2, 0, gl.RGB, gl.FLOAT, new Float32Array([1,0,0,   0,1,0,   0,0,1,   1,0,1]));
    
    gl.uniform1i(loc_uSampler, 0);
}


main();
