function main()
{
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);
    initShaders(gl, document.getElementById("shader-vert").text, document.getElementById("shader-frag").text);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

	var	objs = [];
	for(var i=3 ; i<=6 ; i++) objs.push(init_vbo_polygon(gl, i));

    var loc_MVP = gl.getUniformLocation(gl.program, 'uMVP');
	var	MVP = new Matrix4();
	var	positions = [	[-.5,-.5], [.5,-.5], [.5,.5], [-.5,.5]	];

    gl.clear(gl.COLOR_BUFFER_BIT);
	for(var i=0 ; i<4 ; i++)
	{
		MVP.setTranslate(positions[i][0], positions[i][1], 0);
		console.log(MVP);
    	gl.uniformMatrix4fv(loc_MVP, false, MVP.elements);
		draw_obj(gl, objs[i]);
	}
}

function draw_obj(gl, obj)
{
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vbo);
	for(var i=0 ; i<obj.attribs.length ; i++)
	{
		var	a = obj.attribs[i];
    	gl.vertexAttribPointer(a.id, a.size, a.type, a.normalized, a.stride, a.offset);
    	gl.enableVertexAttribArray(a.id);
	}
	gl.drawArrays(obj.type, 0, obj.n);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	for(var i=0 ; i<obj.attribs.length ; i++)
	{
    	gl.disableVertexAttribArray(a.id);
	}

}

function init_vbo_polygon(gl, n)
{
	var	STRIDE = 2+3;
	var	RADIUS = 0.4;
    var attribs = new Float32Array((n+2)*STRIDE);

	attribs[0] = 0;
	attribs[1] = 0;
	attribs[2] = 1;
	attribs[3] = 1;
	attribs[4] = 1;
	for(var i=0 ; i<=n ; i++)
	{
		attribs[(i+1)*STRIDE + 0] = RADIUS*Math.cos(i*2*Math.PI/n);
		attribs[(i+1)*STRIDE + 1] = RADIUS*Math.sin(i*2*Math.PI/n);
		attribs[(i+1)*STRIDE + 2] = Math.cos(i*2*Math.PI/n);
		attribs[(i+1)*STRIDE + 3] = Math.sin(i*2*Math.PI/n);
		attribs[(i+1)*STRIDE + 4] = 1;
	}

    var vbo = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, attribs, gl.STATIC_DRAW);
    
    var FSIZE = attribs.BYTES_PER_ELEMENT;

    var loc_Position = gl.getAttribLocation(gl.program, 'aPosition');
    var loc_Color = gl.getAttribLocation(gl.program, 'aColor');

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return {vbo:vbo, type:gl.TRIANGLE_FAN, n:n+2, attribs:[
		{id:loc_Position, size:2, type:gl.FLOAT, normalized:false, stride:FSIZE*5, offset:0},
		{id:loc_Color, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*5, offset:FSIZE*2}
				]};
}
