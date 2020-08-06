"use stricrt";

function main()
{
    const src_vert = 
    `#version 300 es
        vec4 positions[] = vec4[](
            vec4(-0.90, -0.90, 0, 1),
            vec4( 0.85, -0.90, 0, 1),
            vec4(-0.90,  0.85, 0, 1),
            vec4( 0.90, -0.85, 0, 1),
            vec4( 0.90,  0.90, 0, 1),
            vec4(-0.85,  0.90, 0, 1)
        );
        vec4 colors[] = vec4[](
            vec4(1, 0, 0, 1),
            vec4(0, 1, 0, 1),
            vec4(0, 0, 1, 1),
            vec4(0, 1, 1, 1),
            vec4(1, 0, 1, 1),
            vec4(1, 1, 0, 1)
        );
        out vec4 vColor;
    
        void main()
        {
            gl_Position = positions[gl_VertexID];
            vColor = colors[gl_VertexID];
        }
    `;
    const src_frag = 
    `#version 300 es
        precision mediump float;
        in vec4 vColor;
        out vec4 fColor;
        void main()
        {
            fColor = vColor;
        }
    `;


    // Getting the WebGL context
    const canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl2");

    // Compiling the shaders
    const h_prog = gl.createProgram();

    const h_vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(h_vert, src_vert);
    gl.compileShader(h_vert);
    gl.attachShader(h_prog, h_vert);

    const h_frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(h_frag, src_frag);
    gl.compileShader(h_frag);
    gl.attachShader(h_prog, h_frag);

    gl.linkProgram(h_prog);

    // Setting up the geometry data
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // In general, the following lines are called in an infinite loop. 
    // (called "rendering loop")
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(h_prog);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
}

main();
