var g_last = Date.now();
var ANGLE_STEP_LIGHT = 30.0;
function main()
{
	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.2, 0.2, 0.2, 1.0);

	var V = new Matrix4();
	V.setLookAt(3, 3, 3, 0, 0, 0, 0, 0, 1);

	var P = new Matrix4();
	P.setPerspective(60, 1, 1, 100); 

	var shader = new Shader(gl, 
			document.getElementById("vert-Phong-Phong").text,
			document.getElementById("frag-Phong-Phong").text,
			["aPosition", "aNormal", "aTexCoords"]);

	console.log(shader);

	// initializes two lights
	var list_lights = 
	[
		new Light
		(
			gl,
			[1.5, 0.0, 1.5, 1.0],		// position
			[0.1, 0.1, 0.1, 1.0],	// ambient
			[1.0, 1.0, 1.0, 1.0],	// diffusive
			[1.0, 1.0, 1.0, 1.0],	// specular
			false
		),
		new Light
		(
			gl,
			[1.5, 0.0, 1.5, 1.0],
			[0.1, 0.1, 0.1, 1.0],
			[1.0, 1.0, 1.0, 1.0],
			[1.0, 1.0, 1.0, 1.0],
			false
		)
	];

	var material = new Material([0,0,0],[0,0,0],[1,1,1],0.5);

	var plain = create_mesh_plain(gl);

	var axes = new Axes(gl);

	var tick = function()
	{
		var now = Date.now();
		var elapsed = now - g_last;
		g_last = now;

		list_lights[0].M.rotate(( (ANGLE_STEP_LIGHT * elapsed) / 1000.0) % 360.0, 0, 0, 1);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		axes.render(gl, V, P);

		for(i in list_lights)
		{
			// for light state and render it
			list_lights[i].turn_on(true);
			list_lights[i].set_type(true);
			list_lights[i].render(gl, V, P);
		}
		plain.render(gl, shader, list_lights, material, V, P);

		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick();
}

function create_mesh_plain(gl)
{
	var verts = new Float32Array([
		-2.0, 2.0, 0.1, 0,0,1, 0,1,
		 2.0, 2.0, 0.1, 0,0,1, 1,1,
		-2.0,-2.0, 0.1, 0,0,1, 0,0,
		 2.0,-2.0, 0.1, 0,0,1, 1,0
	]);
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
	var FSIZE = verts.BYTES_PER_ELEMENT;
	var attribs = [];
	attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*(3+3+2), offset:0};
	attribs["aNormal"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*(3+3+2), offset:FSIZE*3};
	attribs["aTexCoords"] = {buffer:vbo, size:2, type:gl.FLOAT, normalized:false, stride:FSIZE*(3+3+2), offset:FSIZE*(3+3)};
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return new Mesh(gl, "drawArrays", gl.TRIANGLE_STRIP, 4, attribs, -1, null);

}


