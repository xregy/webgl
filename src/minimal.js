"use strict";
function main()
{
    let canvas = document.getElementById('webgl');
    let names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    let gl = null;
    for (let i = 0; i < names.length; ++i)
    {
          gl = canvas.getContext(names[i], []);
          if (gl) break;
    }
    
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
