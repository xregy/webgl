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


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    const shader_red = new Shader(gl, src_vert, src_frag_red);
    const shader_blue = new Shader(gl, src_vert, src_frag_blue);
    
    const obj_red = init_points_red({gl, shader:shader_red, loc_aPosition, loc_aPointSize});
    const obj_blue = init_points_blue({gl, shader:shader_blue, loc_aPosition, loc_aPointSize});
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    render_object({gl, shader:shader_red, object:obj_red});
    render_object({gl, shader:shader_blue, object:obj_blue});
}

function render_object({gl, shader, object})
{
    gl.useProgram(shader.h_prog);
    gl.bindVertexArray(object.vao);
    if(object.drawcall == 'drawElements') gl.drawElements(object.type, object.n, object.index_type, 0);
    else if(object.drawcall == 'drawArrays') gl.drawArrays(object.type, 0, object.n);
    gl.bindVertexArray(null);
    gl.useProgram(null);
}

function init_points_red({gl, shader, loc_aPosition, loc_aPointSize})
{    
    const position = new Float32Array([ -0.9, -0.9, 0, -0.9, -0.9, 0]);
    const pointsize = new Float32Array([ 10, 20, 30]);
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao); 
    
    const buf_position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
    gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); // Yes, we can unbind the BO after calling gl.vertexAttribPointer()
    gl.enableVertexAttribArray(loc_aPosition);
    
    
    const buf_pointsize = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_pointsize);
    gl.bufferData(gl.ARRAY_BUFFER, pointsize, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPointSize, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);   // Yes, we can unbind the BO after calling gl.vertexAttribPointer()
    gl.enableVertexAttribArray(loc_aPointSize);
    
    gl.bindVertexArray(null); 
    gl.disableVertexAttribArray(loc_aPosition);
    gl.disableVertexAttribArray(loc_aPointSize);
    
    return {vao:vao, n:3, drawcall:'drawArrays', type:gl.POINTS};
}

function init_points_blue({gl, shader, loc_aPosition, loc_aPointSize})
{
    const position =  new Float32Array([ 0.9, 0.9, 0, 0.9, 0.9, 0]);
    const pointsize = new Float32Array([ 40, 50, 60 ]);
    const indices = new Uint16Array([0,1,2]);
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao); 
    
    const buf_position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
    gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.enableVertexAttribArray(loc_aPosition);
    
    
    const buf_pointsize = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf_pointsize);
    gl.bufferData(gl.ARRAY_BUFFER, pointsize, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(loc_aPointSize, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.enableVertexAttribArray(loc_aPointSize);
    
    const buf_idx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    
    gl.bindVertexArray(null); 
    gl.disableVertexAttribArray(loc_aPosition);
    gl.disableVertexAttribArray(loc_aPointSize);
    
    return {vao:vao, n:3, drawcall:'drawElements', index_type:gl.UNSIGNED_SHORT, type:gl.POINTS};
}


main();
