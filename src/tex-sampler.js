"use strict";

const tex_unit = 5;
const loc_aPosition = 3;
const loc_aTexCoord = 8;

let src_vert =
`#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aTexCoord}) in vec2 aTexCoord;
    out vec2 vTexCoord;
    void main() {
        gl_Position = aPosition;
        vTexCoord = aTexCoord;
    }
`;

let src_frag =
`#version 300 es
    precision mediump float;
    uniform sampler2D uSampler;
    in vec2 vTexCoord;
    out vec4 fColor;
    void main() {
        fColor = texture(uSampler, vTexCoord);
    }
`;

function main() 
{
    let canvas = document.getElementById('webgl');
    let gl = canvas.getContext("webgl2");
    
    initShaders(gl, src_vert, src_frag);

    let vao = initVertexBuffers(gl);
    
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    let tex = initTextures(gl);
    let samplers = initSamplers(gl);

    init_UI(gl, vao, samplers);
    refresh(gl, vao, samplers);
}

function refresh(gl, vao, samplers)
{
    let elements = document.getElementsByName("sampler");
    for(let e of elements)
    {
        if(e.checked)
        {
            gl.bindSampler(tex_unit, samplers[Number(e.value)]);
            break;
        }
    }

    gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    gl.bindVertexArray(vao);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle

    gl.bindVertexArray(null);
}


function init_UI(gl, vao, samplers)
{
    let elements = document.getElementsByName("sampler");
    for(let e of elements)
    {
        e.onchange = function(ev) { refresh(gl,vao,samplers); };
    }
}

function initVertexBuffers(gl) 
{
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let verticesTexCoords = new Float32Array([
      // Vertex coordinates, texture coordinate
      -0.5,  0.5,   -1.0,  2.0,
      -0.5, -0.5,   -1.0, -1.0,
       0.5,  0.5,    2.0,  2.0,
       0.5, -0.5,    2.0, -1.0,
    ]);
    
    // Create the buffer object
    let vertexTexCoordBuffer = gl.createBuffer();
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    
    let FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(loc_aPosition);  // Enable the assignment of the buffer object
    
    gl.vertexAttribPointer(loc_aTexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(loc_aTexCoord);  // Enable the assignment of the buffer object

    gl.bindVertexArray(null);
    return vao;
}

function initTextures(gl)
{
    let texture = gl.createTexture();
    let uSampler = gl.getUniformLocation(gl.program, 'uSampler');

    gl.activeTexture(gl.TEXTURE0 + tex_unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 2, 2, 0, gl.RGB, gl.UNSIGNED_BYTE, 
        new Uint8Array([255,0,0,   0,255,0,    0,0,255,   255,0,255]));
    
    gl.uniform1i(uSampler, tex_unit);
    
    return texture;
}

function initSamplers(gl)
{
    let samplers = [];

    samplers[0] = gl.createSampler();
    gl.samplerParameteri(samplers[0], gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.samplerParameteri(samplers[0], gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.samplerParameteri(samplers[0], gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.samplerParameteri(samplers[0], gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    
    samplers[1] = gl.createSampler();
    gl.samplerParameteri(samplers[1], gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.samplerParameteri(samplers[1], gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.samplerParameteri(samplers[1], gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.samplerParameteri(samplers[1], gl.TEXTURE_WRAP_T, gl.REPEAT);

    return samplers;
 
}





