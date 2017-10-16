// Comparison with WebGL 1.0
//
// - non-float attribute supported
// - initialized declaration of an array
// - array initialization using an array
// - array index by an attribute

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
    var gl = canvas.getContext("webgl2");

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, 
        document.getElementById("shader-vert").text,
        document.getElementById("shader-frag").text)) {
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
     0.0,  0.5, 
    -0.5, -0.5, 
     0.5, -0.5, 
  ]);
  var n = 3;

  var indices = new Int32Array([0, 1, 2]);

  // Create a buffer object
  var vbo_vertices = gl.createBuffer();  
  if (!vbo_vertices) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertices);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Create a buffer object
  var vbo_indices = gl.createBuffer();  
  if (!vbo_indices) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo_indices);

  gl.bufferData(gl.ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  var a_Index = gl.getAttribLocation(gl.program, 'a_Index');
  if(a_Index < 0) {
    console.log('Failed to get the storage location of a_Index');
    return -1;
  }
  gl.vertexAttribIPointer(a_Index, 1, gl.INT, 0, 0);
  gl.enableVertexAttribArray(a_Index);  // Enable the assignment of the buffer object

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}
