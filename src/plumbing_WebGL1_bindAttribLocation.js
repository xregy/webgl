"use strict";
function main()
{
    let canvas = document.getElementById('webgl');
    let gl = getWebGLContext(canvas);

    let h_vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(h_vert, document.getElementById("shader-vert").text);
    gl.compileShader(h_vert);

    let	h_frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(h_frag, document.getElementById("shader-frag").text);
    gl.compileShader(h_frag);

    let h_prog = gl.createProgram();
    gl.attachShader(h_prog, h_vert);
    gl.attachShader(h_prog, h_frag);

    let loc_aPosition = 3;	// any uint value is ok
    let	loc_aColor = 8;
    gl.bindAttribLocation(h_prog, loc_aPosition, 'aPosition');	// must be called BEFORE linkProgram()!!!
    gl.bindAttribLocation(h_prog, loc_aColor, 'aColor');	// must be called BEFORE linkProgram()!!!
    gl.linkProgram(h_prog);
    
    let vertices = new Float32Array([
                        -0.9,-0.9, 1,0,0,
                         0.9,-0.9, 0,1,0,
                         0.9, 0.9, 0,0,1,
                        -0.9, 0.9, 1,1,1]);
    let FSIZE = vertices.BYTES_PER_ELEMENT;

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 5*FSIZE, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.vertexAttribPointer(loc_aColor, 3, gl.FLOAT, false, 5*FSIZE, 2*FSIZE);
    gl.enableVertexAttribArray(loc_aColor);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(h_prog);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
