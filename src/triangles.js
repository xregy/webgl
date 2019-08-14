"use stricrt";
function main()
{
    let canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl2");
    if (!gl)  
    {
        console.log('Failed to get the rendering context for WebGL'); 
        return;
    }

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let vertices = new Float32Array([
                        -0.90, -0.90, // Triangle 1
                         0.85, -0.90,
                        -0.90,  0.85,
                         0.90, -0.85, // Triangle 2
                         0.90,  0.90,
                        -0.85,  0.90]);

    let src_vert = 
    `#version 300 es
        layout(location=7) in vec4 aPosition;
        void main()
        {
            gl_Position = aPosition;
        }
    `;
    let src_frag = 
    `#version 300 es
        precision mediump float;
        out vec4 fColor;
        void main()
        {
            fColor = vec4(0.0, 0.0, 1.0, 1.0);
        }
    `;

    let h_prog = gl.createProgram();

    let h_vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(h_vert, src_vert);
    gl.compileShader(h_vert);
    gl.attachShader(h_prog, h_vert);

    let	h_frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(h_frag, src_frag);
    gl.compileShader(h_frag);
    gl.attachShader(h_prog, h_frag);

    gl.linkProgram(h_prog);

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    let loc_aPosition = 7;
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.bindVertexArray(null);
    // All the info we need are already stored in "vao".
    gl.disableVertexAttribArray(loc_aPosition); 
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(h_prog);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);

}
