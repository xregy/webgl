import {Shader} from "../modules/class_shader.mjs"

"use strict"

function main()
{
    const loc_aPosition=3;
    const loc_aTexCoord = 9;
    const src_vert = `#version 300 es
        layout(location=${loc_aPosition}) in vec4 a_Position;
        layout(location=${loc_aTexCoord}) in vec2 a_TexCoord;
        out vec2 v_TexCoord;
        void main()
        {
            gl_Position = a_Position;
            v_TexCoord = a_TexCoord;
        }`;
    const src_frag = `#version 300 es
        precision mediump float;
        uniform sampler2D uSampler;
        in vec2 v_TexCoord;
        out vec4 f_Color;
        void main()
        {
            f_Color = texture(uSampler, v_TexCoord);
        }`;

    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext('webgl2');
    const prog = new Shader(gl, src_vert, src_frag);
    gl.useProgram(prog.h_prog);

    initVertexBuffers(gl, loc_aPosition, loc_aTexCoord);

    const loc_uSampler = gl.getUniformLocation(prog.h_prog, 'uSampler');
    initTextures(gl, loc_uSampler);

    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    refresh(gl);
}
    
function refresh(gl)
{
    gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle
}

function initVertexBuffers(gl, loc_aPosition, loc_aTexCoord)
{
    const verticesTexCoords = new Float32Array([
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
    
    return;
}

function initTextures(gl, loc_uSampler)
{
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 2, 2, 0, gl.RGB, gl.UNSIGNED_BYTE, 
        new Uint8Array([255,0,0,   0,255,0,  99,99,    0,0,255,   255,0,255, 99,99]));
    gl.uniform1i(loc_uSampler, 0);
}

main();

