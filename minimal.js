// HelloCanvas.js
function main()
{
  var canvas = document.getElementById('webgl');
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var gl = null;
  for (var i = 0; i < names.length; ++i)
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
    console.log('Failed to get the rendering context for WebGL'); return;
  }
  else
  {
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
}
