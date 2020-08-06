"use stricrt";

function main()
{
    const loc_aPosition = 7;

    const src_vert = 
    `#version 300 es
        layout(location=${loc_aPosition}) in vec4 aPosition;
        void main()
        {
            gl_Position = aPosition;
        }
    `;
    const src_frag = 
    `#version 300 es
        precision mediump float;
        out vec4 fColor;
        void main()
        {
            fColor = vec4(0.0, 0.0, 1.0, 1.0);
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


    const vertices = new Float32Array([
                        -0.90, -0.90, // Triangle 1
                         0.85, -0.90,
                        -0.90,  0.85,
                         0.90, -0.85, // Triangle 2
                         0.90,  0.90,
                        -0.85,  0.90]);

    // Setting up the geometry data
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();

    // From which VBO to retrieve the geometry data? --> stored in the VAO
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);    
    // Upload the geometry data
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // In which pattern vertex position data (specified by loc_aPosition)
    // are stored in the buffer? --> stored in the VAO
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    // Enable the attribute specified by loc_aPosition --> stored in the VAO
    gl.enableVertexAttribArray(loc_aPosition);

    gl.bindVertexArray(null);   // Unbind the VAO
    
    // After unbinding the VAO, the followings don't affect 
    // the states stored in the VAO.
    gl.disableVertexAttribArray(loc_aPosition); 
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

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
