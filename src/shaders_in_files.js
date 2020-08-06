"use strict";

function main()
{
    const loc_aPosition = 7;
    
    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");

    // https://stackoverflow.com/questions/31710768/how-can-i-fetch-an-array-of-urls-with-promise-all
    Promise.all(['./simple.vert','./simple.frag'].map(url => fetch(url)))
    .then(responses => Promise.all( responses.map(
        function(response) {
            if(response.ok) return response.text();
            else    throw new Error(`Error while reading ${response.url}.`);
        }) ))
    .then(texts => draw({gl, src_vert:texts[0], src_frag:texts[1], loc_aPosition}))
    .catch(err => console.log(err.message));

}

function draw({gl, src_vert, src_frag, loc_aPosition})
{
    const vertices = new Float32Array([
                        -0.90, -0.90, // Triangle 1
                         0.85, -0.90,
                        -0.90,  0.85,
                         0.90, -0.85, // Triangle 2
                         0.90,  0.90,
                        -0.85,  0.90]);

    const h_vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(h_vert, src_vert);
    gl.compileShader(h_vert);

    const h_frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(h_frag, src_frag);
    gl.compileShader(h_frag);

    const h_prog = gl.createProgram();
    gl.attachShader(h_prog, h_vert);
    gl.attachShader(h_prog, h_frag);
    gl.linkProgram(h_prog);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(h_prog);

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);


}


main();
