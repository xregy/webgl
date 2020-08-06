import {Shader} from "../modules/class_shader.mjs"

"use strict";

function main()
{
    const loc_aPosition = 2;
    const loc_aPointSize = 5;
    const src_vert =
    `#version 300 es
    layout(location=${loc_aPosition}) in vec4 aPosition;
    layout(location=${loc_aPointSize}) in float aPointSize;
    void main()
    {
    	gl_Position = aPosition;
        gl_PointSize = aPointSize;
    }
    `;
    const src_frag_red = 
    `#version 300 es
    precision mediump float;
    out vec4 fColor;
    void main()
    {
    	fColor = vec4(1, 0, 0, 1);
    }
    `;
    const src_frag_blue = 
    `#version 300 es
    precision mediump float;
    out vec4 fColor;
    void main()
    {
    	fColor = vec4(0, 0, 1, 1);
    }
    `;

    const loc_attribs = {aPosition:loc_aPosition, aPointSize:loc_aPointSize};

    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    const shader_red = new Shader(gl, src_vert, src_frag_red);
    const shader_blue = new Shader(gl, src_vert, src_frag_blue);

    const obj_red = init_points_red(gl);
    const obj_blue = init_points_blue(gl);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    render_object({gl, shader:shader_red, object:obj_red, loc_attribs});
    render_object({gl, shader:shader_blue, object:obj_blue, loc_attribs});
}
function render_object({gl, shader, object, loc_attribs})
{
    gl.useProgram(shader.h_prog);
    
    for(let attrib_name in object.attribs)
    {
        let attrib = object.attribs[attrib_name];
        gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
        gl.vertexAttribPointer(loc_attribs[attrib_name], attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(loc_attribs[attrib_name]);
    }
    if(object.drawcall == 'drawElements')
    {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.index.buffer);
        gl.drawElements(object.type, object.n, object.index.type, 0);
    }
    else if(object.drawcall == 'drawArrays')
    {
        gl.drawArrays(object.type, 0, object.n);
    }
    
    for(let attrib_name in object.attribs)
    {
        gl.disableVertexAttribArray(loc_attribs[attrib_name]);
    }
    
    gl.useProgram(null);
}

function init_points_red(gl)
{
    const position = new Float32Array([ -0.9, -0.9, 0, -0.9, -0.9, 0]);
    const pointsize = new Float32Array([ 10, 20, 30]);
    
    const buf_position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
    gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);
    
    const buf_pointsize = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_pointsize);
    gl.bufferData(gl.ARRAY_BUFFER, pointsize, gl.STATIC_DRAW);
    
    const attribs = [];
    attribs["aPosition"] = {buffer:buf_position, size:2, type:gl.FLOAT, normalized:false, stride:0, offset:0};
    attribs["aPointSize"] = {buffer:buf_pointsize, size:1, type:gl.FLOAT, normalized:false, stride:0, offset:0};
    
    return {n:3, drawcall:'drawArrays', type:gl.POINTS, attribs:attribs};
}

function init_points_blue(gl)
{
    const position =  new Float32Array([ 0.9, 0.9, 0, 0.9, 0.9, 0]);
    const pointsize = new Float32Array([ 40, 50, 60 ]);
    const indices = new Uint16Array([0,1,2]);
    
    const buf_position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
    gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);
    
    const buf_pointsize = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_pointsize);
    gl.bufferData(gl.ARRAY_BUFFER, pointsize, gl.STATIC_DRAW);
    
    const buf_idx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    
    const attribs = [];
    attribs["aPosition"] = {buffer:buf_position, size:2, type:gl.FLOAT, normalized:false, stride:0, offset:0};
    attribs["aPointSize"] = {buffer:buf_pointsize, size:1, type:gl.FLOAT, normalized:false, stride:0, offset:0};
    
    return {n:3, drawcall:'drawElements', index:{buffer:buf_idx, type:gl.UNSIGNED_SHORT}, type:gl.POINTS, attribs:attribs};
}


main();
