function main() {
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);
    initShaders(gl, document.getElementById("shader-vert").text, document.getElementById("shader-frag").text);
    

    obj = initVertexBuffers(gl);
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,1);
    
    var loc_MVP = gl.getUniformLocation(gl.program, 'u_MVP');
    
    var MVP = new Matrix4();
    MVP.setPerspective(30, 1, 1, 100);
    MVP.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    
    gl.uniformMatrix4fv(loc_MVP, false, MVP.elements);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.drawElements(gl.TRIANGLES, obj.n, gl.UNSIGNED_BYTE, 0);
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
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
        -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
         1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
         1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
         1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
        -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
    ]);
    
    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        0, 3, 4,   0, 4, 5,    // right
        0, 5, 6,   0, 6, 1,    // up
        1, 6, 7,   1, 7, 2,    // left
        7, 4, 3,   7, 3, 2,    // down
        4, 7, 6,   4, 6, 5     // back
    ]);
    
    // Create a buffer object
    var vbo = gl.createBuffer();
    var ibo = gl.createBuffer();
    
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
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return {vbo:vbo, ibo:ibo, n:indices.length};
}
