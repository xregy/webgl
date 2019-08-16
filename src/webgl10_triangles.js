"use stricrt";
const src_vert = 
`
attribute vec4 aPosition;
void main()
{
    gl_Position = aPosition;
}
`;
const src_frag = 
`
precision mediump float;
void main()
{
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}
`;

function main()
{
    let canvas = document.getElementById('webgl');
    let names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    let gl = null;
    for (let i = 0; i < names.length; ++i)
    {
        try
        {
            gl = canvas.getContext(names[i], []);
        }
        catch(e)
        {
        }
        if (gl)
        {
            break;
        }
    }

    if (!gl)  
    {
        console.log('Failed to get the rendering context for WebGL'); 
        return;
    }

    let vertices = new Float32Array([
                        -0.90, -0.90, // Triangle 1
                         0.85, -0.90,
                        -0.90,  0.85,
                         0.90, -0.85, // Triangle 2
                         0.90,  0.90,
                        -0.85,  0.90]);

    let h_prog = gl.createProgram();

    let h_vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(h_vert, src_vert);
    gl.compileShader(h_vert);
    gl.attachShader(h_prog, h_vert);

    let h_frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(h_frag, src_frag);
    gl.compileShader(h_frag);
    gl.attachShader(h_prog, h_frag);

    gl.linkProgram(h_prog);

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    let loc_aPosition = gl.getAttribLocation(h_prog, 'aPosition');
    gl.vertexAttribPointer(loc_aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_aPosition);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(h_prog);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

}
