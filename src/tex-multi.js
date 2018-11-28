// MultiTexture.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord0;\n' +
  'attribute vec2 a_TexCoord1;\n' +
  'varying vec2 v_TexCoord0;\n' +
  'varying vec2 v_TexCoord1;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  v_TexCoord0 = a_TexCoord0;\n' +
  '  v_TexCoord1 = a_TexCoord1;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler0;\n' +
  'uniform sampler2D u_Sampler1;\n' +
  'varying vec2 v_TexCoord0;\n' +
  'varying vec2 v_TexCoord1;\n' +
  'void main() {\n' +
  '  vec4 color0 = texture2D(u_Sampler0, v_TexCoord0);\n' +
  '  vec4 color1 = texture2D(u_Sampler1, v_TexCoord1);\n' +
//  '  gl_FragColor = color0 * color1;\n' +
  '  gl_FragColor = mix(color0, color1, 0.5);\n' +
  '}\n';

var g_loadComplete = [false, false];
// Rotation angle (degrees/second)
var ANGLE_STEP = 45.0;

function main() {
	var canvas = document.getElementById('webgl');
	
	var gl = getWebGLContext(canvas);

	initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	
	var n = initVertexBuffers(gl);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	var textures = [null, null];
	var	loc_samplers = [-1, -1];
	var	texunits = [gl.TEXTURE3, gl.TEXTURE6];
	var	images = [null, null];


  // Set texture
	if (!initTextures(gl, textures, images, texunits, loc_samplers)) {
		console.log('Failed to intialize the texture.');
		return;
	}
	var tick_init = function() {
		if(g_loadComplete[0] && g_loadComplete[1]) 
		{
			uploadTextures(gl, textures, images);
			for(var i=0 ; i<2 ; i++)
			{
				gl.activeTexture(texunits[i]);
				gl.bindTexture(gl.TEXTURE_2D, textures[i]);
			}
			requestAnimationFrame(tick, canvas); // Request that the browser calls tick
		}
		else
		{
			requestAnimationFrame(tick_init, canvas); // Request that the browser calls tick
		}
	};

	// Current rotation angle
	var currentAngle = 0.0;
	// Model matrix
	var modelMatrix = new Matrix4();

	// Get storage location of u_ModelMatrix
	var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	if (!u_ModelMatrix)
	{ 
		console.log('Failed to get the storage location of u_ModelMatrix');
		return;
	}

	var tick = function() {
		currentAngle = animate(currentAngle);  // Update the rotation angle
		draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick_init();

}

function initVertexBuffers(gl) {
  var verticesTexCoords = new Float32Array([
    // Vertex coordinate, Texture coordinate
    -0.5,  0.5,   0.0, 1.0,  -1, 2,
    -0.5, -0.5,   0.0, 0.0,  -1, -1,
     0.5,  0.5,   1.0, 1.0,  2, 2,
     0.5, -0.5,   1.0, 0.0,  2, -1
  ]);
  var n = 4; // The number of vertices

  // Create a buffer object
  var vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write the positions of vertices to a vertex shader
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_TexCoord0
  var a_TexCoord0 = gl.getAttribLocation(gl.program, 'a_TexCoord0');
  if (a_TexCoord0 < 0) {
    console.log('Failed to get the storage location of a_TexCoord0');
    return -1;
  }
  gl.vertexAttribPointer(a_TexCoord0, 2, gl.FLOAT, false, FSIZE * 6, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord0);  // Enable the buffer assignment

   // Get the storage location of a_TexCoord1
  var a_TexCoord1 = gl.getAttribLocation(gl.program, 'a_TexCoord1');
  if (a_TexCoord1 < 0) {
    console.log('Failed to get the storage location of a_TexCoord1');
    return -1;
  }
  gl.vertexAttribPointer(a_TexCoord1, 2, gl.FLOAT, false, FSIZE * 6, FSIZE * 4);
  gl.enableVertexAttribArray(a_TexCoord1);  // Enable the buffer assignment

	return n;
}


function initTextures(gl, textures, images, texunits, loc_samplers) {
	for(var i=0 ; i<2 ; i++)
	{
		textures[i] = gl.createTexture(); 
		if (!textures[i]) {
			console.log('Failed to create the texture object');
			return false;
		}
		loc_samplers[i] = gl.getUniformLocation(gl.program, 'u_Sampler' + i);
		if (!loc_samplers[i]) {
			console.log('Failed to get the storage location of u_Sampler');
			return false;
		}
		gl.uniform1i(loc_samplers[i], texunits[i]-gl.TEXTURE0);

		gl.bindTexture(gl.TEXTURE_2D, textures[i]);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		// Create the image object
		images[i] = new Image();
		if (!images[i]) {
			console.log('Failed to create the image object');
			return false;
		}
	}

	// Register the event handler to be called when image loading is completed
	images[0].onload = function(){ onLoadImage(0); };
	images[1].onload = function(){ onLoadImage(1); };

	images[0].src = '../resources/sky.jpg';
	images[1].src = '../resources/circle.gif';

//	let url1 = 'https://threejs.org/examples/models/obj/cerberus/Cerberus_A.jpg';
//	images[1].crossOrigin = "anonymous";
//	images[1].src = url1;

	return true;

}

function onLoadImage(idx) {
	g_loadComplete[idx] = true;
}

function uploadTextures(gl, textures, images)
{
	for(var i=0 ; i<2 ; i++)
	{
		gl.bindTexture(gl.TEXTURE_2D, textures[i]);   

		// Set the image to texture
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
	}
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  // Set the rotation matrix
  modelMatrix.setRotate(currentAngle, 0, 0, 1); // Rotation angle, rotation axis (0, 0, 1)
 
  // Pass the rotation matrix to the vertex shader
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

		// Clear <canvas>
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);   // Draw the rectangle

}


// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
