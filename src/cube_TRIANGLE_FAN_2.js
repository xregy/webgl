function main() {
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);
    initShaders(gl, document.getElementById("shader-vert").text, document.getElementById("shader-frag").text);
    

    initVertexBuffers(gl);
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,1);
    
    var loc_MVP = gl.getUniformLocation(gl.program, 'u_MVP');
    
    var MVP = new Matrix4();
    MVP.setPerspective(30, 1, 1, 100);
    MVP.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    
    gl.uniformMatrix4fv(loc_MVP, false, MVP.elements);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    for(var i=0 ; i<4 ; i++)    gl.drawArrays(gl.TRIANGLE_FAN, 5*i, 5);
}

function initVertexBuffers(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var verticesColors = new Float32Array([
         1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
         1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
         1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
         1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow

        -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
         1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0,  // v7 Black
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta

        -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
         1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0,  // v7 Black
         1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow

         1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0,  // v7 Black
         1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
         1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0,  // v7 Black
    ]);
    
   
    // Create a buffer object
    var vbo = gl.createBuffer();
    
    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);
    
    return;
}
