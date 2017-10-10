// HelloTQuad_FragCoord.js 
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_coords;\n' +
  'varying vec2 v_coords;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  v_coords = a_coords;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec2 v_coords;\n' +
  'void main() {\n' +
  '  float d = v_coords.x*v_coords.x + v_coords.y*v_coords.y;\n' +
  '  if(d < 0.5*0.5)    gl_FragColor = vec4(1,1,1,1);\n' +
  '  else discard;\n' +
  '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.5, 0.5, 0.5, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    -0.9,  0.9, -1, 1,
	-0.9, -0.9, -1, -1,
	 0.9,  0.9, 1, 1,
	 0.9, -0.9,  1, -1
  ]);
  var n = 4; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Pass the position of a point to a_Position variable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4*4, 0);

  // Enable the generic vertex attribute array
  gl.enableVertexAttribArray(a_Position);

  var a_coords = gl.getAttribLocation(gl.program, 'a_coords');
  if (a_coords < 0) {
    console.log('Failed to get the storage location of a_coords');
    return -1;
  }
  gl.vertexAttribPointer(a_coords, 2, gl.FLOAT, false, 4*4, 4*2);

  gl.enableVertexAttribArray(a_coords);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}
