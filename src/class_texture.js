"use strict"

class Texture
{
	constructor(gl, image)
	{
		this.texid = gl.createTexture(); 
		gl.bindTexture(gl.TEXTURE_2D, this.texid);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
}
