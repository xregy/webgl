// ColoredTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'attribute float a_Index;\n' +
  'vec4 colors[3];\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '//  colors = vec4[3](vec4(1.0,0.0,0.0,1.0), vec3(0.0,1.0,0.0,1.0), vec3(0.0,0.0,1.0,1.0));\n' +
  '  colors[0] = vec4(1.0,0.0,0.0,1.0);\n' +
  '  colors[1] = vec4(0.0,1.0,0.0,1.0);\n' +
  '  colors[2] = vec4(0.0,0.0,1.0,1.0);\n' +
  '  gl_Position = a_Position;\n' +
  '  if(a_Index==0.0) v_Color = colors[0];\n' +
  '  else if(a_Index==1.0) v_Color = colors[1];\n' +
  '  else if(a_Index==2.0) v_Color = colors[2];\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE = 
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif \n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
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

  // 
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    // Vertex coordinates 
     0.0,  0.5, 0,
    -0.5, -0.5, 1,
     0.5, -0.5, 2
  ]);
  var n = 3;

  // Create a buffer object
  var vbo = gl.createBuffer();  
  if (!vbo) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4*3, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  var a_Index = gl.getAttribLocation(gl.program, 'a_Index');
  if(a_Index < 0) {
    console.log('Failed to get the storage location of a_Index');
    return -1;
  }
  gl.vertexAttribPointer(a_Index, 1, gl.FLOAT, false, 4*3, 4*2);
  gl.enableVertexAttribArray(a_Index);  // Enable the assignment of the buffer object

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}
