import {Shader} from "../modules/class_shader.mjs"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"

"use strict";

function main()
{
    const loc_aPosition = 3;
    const loc_aTexCoord = 5;
    const tex_unit = 3;

    const src_vert = 
    `#version 300 es
    layout(location=${loc_aPosition}) in vec2 aPosition;
    layout(location=${loc_aTexCoord}) in vec2 aTexCoord;
    out vec2 vTexCoord;
    uniform mat4 MVP;
    void main()
    {
    	gl_Position = MVP * vec4(aPosition, 0, 1);
    	vTexCoord = aTexCoord;
    }
    `;
    
    const src_frag =
    `#version 300 es
    precision mediump float;
    uniform sampler2D uSampler;
    in vec2 vTexCoord;
    out vec4 fColor;
    void main()
    {
    	fColor = texture(uSampler, vTexCoord);
    }
    `;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    
    document.getElementById("mag-LINEAR").value = gl.LINEAR;
    document.getElementById("mag-NEAREST").value = gl.NEAREST;

    document.getElementById("min-LINEAR").value = gl.LINEAR;
    document.getElementById("min-NEAREST").value = gl.NEAREST;
    document.getElementById("min-NEAREST_MIPMAP_NEAREST").value = gl.NEAREST_MIPMAP_NEAREST;
    document.getElementById("min-LINEAR_MIPMAP_NEAREST").value =  gl.LINEAR_MIPMAP_NEAREST;
    document.getElementById("min-NEAREST_MIPMAP_LINEAR").value = gl.NEAREST_MIPMAP_LINEAR;
    document.getElementById("min-LINEAR_MIPMAP_LINEAR").value = gl.LINEAR_MIPMAP_LINEAR;
    
    const prog = new Shader(gl, src_vert, src_frag);
    
    const obj = initVBO(gl, loc_aPosition, loc_aTexCoord);
    
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    const textures = 
    {
        "checkerboard":generate_tex_checkerboard(gl, 32),
        "separate_colors":generate_tex_mipmap(gl, 6, [[255,0,0], [0,255,0], [0,0,255], [255,255,0], [255,0,255], [0,255,255]])
    };
    
    const MVP = mat4.create();
    
    const loc_uSampler = gl.getUniformLocation(prog.h_prog, "uSampler");
    const loc_MVP = gl.getUniformLocation(prog.h_prog, "MVP");

    prog.set_uniforms = function(gl) 
    {
        gl.activeTexture(gl.TEXTURE0 + tex_unit);
        gl.bindTexture(gl.TEXTURE_2D, textures[document.getElementById("texture").value]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, document.getElementById("min-filter").value);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, document.getElementById("mag-filter").value);
        gl.uniform1i(loc_uSampler, tex_unit);
        gl.uniformMatrix4fv(loc_MVP, false, MVP);
    };
    
    const X_MIN = -2;
    const X_MAX = 2;
    const X_STEP = 1.5;
    
    let t_last = Date.now();
    let sign = 1;
    let x = 0;

    let V = mat4.create();
    
    function tick()
    {
        let now = Date.now();
        let elapsed = now - t_last;
        t_last = now;
        
        x += sign * (document.getElementById("speed").value*0.01) * elapsed * 0.001;
        if(x > X_MAX)
        {
            x = X_MAX;
            sign *= -1;
        }
        else if(x < X_MIN)
        {
            x = X_MIN;
            sign *= -1;
        }
        mat4.perspective(MVP, toRadian(60), 1, 1, 100); 
        mat4.lookAt(V, [x,-10,1], [0,0,0], [0,0,1]);
        mat4.multiply(MVP, MVP, V);
        mat4.scale(MVP, MVP, [20.0, 20.0, 20.0]);
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        render_object(gl, prog, obj);
        requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    };
    
    tick();
    
}

function generate_tex_checkerboard(gl, N)
{
    const img = new Uint8Array(N*N*3);
    let color;
    for(let i=0 ; i<N ; i++)
    {
        for(let j=0 ; j<N ; j++)
        {
            
            if(((i < (N/2))+(j < (N/2)))%2 == 0)    color = 255;
            else                                    color = 0;
            img[3*(N*i + j) + 0] = color;
            img[3*(N*i + j) + 1] = color;
            img[3*(N*i + j) + 2] = color;
        }
    }
    const tex = gl.createTexture(); 
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, N, N, 0, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    return tex;
}

function generate_tex_mipmap(gl, levels, colors, max_level)
{
    const tex = gl.createTexture(); 
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    for(let level = 0 ; level < levels ; level++)
    {
        let N = Math.pow(2,levels-level-1);
        let img = new Uint8Array(N*N*3);
        for(let i=0 ; i<N ; i++)
        {
            for(let j=0 ; j<N ; j++)
            {
                for(let k=0 ; k<3 ; k++) img[3*(i*N + j) + k] = colors[level][k];
            }
        }
        gl.texImage2D(gl.TEXTURE_2D, level, gl.RGB, N, N, 0, gl.RGB, gl.UNSIGNED_BYTE, img);
    }
    return tex;
}

function render_object(gl, prog, object)
{    
    gl.useProgram(prog.h_prog);
    gl.bindVertexArray(object.vao);
    
    prog.set_uniforms(gl);
    
    if(object.drawcall == "drawArrays") gl.drawArrays(object.type, 0, object.n);
    else if(object.drawcall == "drawElements") gl.drawElements(object.type, object.n, object.type_index, 0);
    
    gl.bindVertexArray(null);
    
    gl.useProgram(null);
}


function initVBO(gl, loc_aPosition, loc_aTexCoord)
{
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const verts = new Float32Array([
        -0.5,  0.5,   0, 20,
        -0.5, -0.5,   0, 0,
         0.5,  0.5,   20, 20,
         0.5, -0.5,   20, 0,
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    
    const SZ = verts.BYTES_PER_ELEMENT;
    
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, SZ*4, 0);
    gl.enableVertexAttribArray(loc_aPosition);
    
    gl.vertexAttribPointer(loc_aTexCoord, 2, gl.FLOAT, false, SZ*4, SZ*2);
    gl.enableVertexAttribArray(loc_aTexCoord);
    
    gl.bindVertexArray(null);
    
    return {vao:vao, n:4, drawcall:"drawArrays", type:gl.TRIANGLE_STRIP};
}

main();

