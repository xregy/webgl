"use strict";
function main()
{
    let canvas = document.getElementById('webgl');
    let gl = canvas.getContext("webgl2");
    
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL'); return;
    }
    else
    {
        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}


main();
