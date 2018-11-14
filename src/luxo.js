var	src_vert_axes = 
'            attribute vec4 aPosition;	\n' +
'            attribute vec4 aColor;	\n' +
'            uniform mat4 VP;	\n' +
'            varying vec4 vColor;	\n' +
'            void main()	\n' +
'            {	\n' +
'                gl_Position = VP * aPosition;	\n' +
'                gl_PointSize = 10.0;	\n' +
'                vColor = aColor;	\n' +
'            }\n';
var	src_frag_axes =
'            #ifdef GL_ES	\n' +
'            precision mediump float;	\n' +
'            #endif	\n' +
'            varying vec4 vColor;	\n' +
'            void main()	\n' +
'            {	\n' +
'                gl_FragColor = vColor;	\n' +
'            }	\n';
var	src_vert_lighting =
'            // eye coordinate system	\n' +
'			attribute vec4 aPosition;	\n' +
'			attribute vec3 aNormal;	\n' +
'			uniform mat4	MVP;	\n' +
'			uniform mat4	MV;	\n' +
'			uniform mat4	matNormal;	\n' +
'			varying vec3	vNormal;	\n' +
'			varying vec4	vPosWorld;	\n' +
'			void main()	\n' +
'			{	\n' +
'				vPosWorld = MV*aPosition;	\n' +
'				vNormal = normalize((matNormal*vec4(aNormal,0)).xyz);	\n' +
'				gl_Position = MVP*aPosition;	\n' +
'			}	\n'
var	src_frag_lighting =
'            // eye coordinate system	\n' +
'            #ifdef GL_ES	\n' +
'            precision mediump float;	\n' +
'            #endif	\n' +
'			varying vec4 vPosWorld;	\n' +
'			varying vec3	vNormal;	\n' +
'			struct TMaterial	\n' +
'			{	\n' +
'				vec3	ambient;	\n' +
'				vec3	diffuse;	\n' +
'				vec3	specular;	\n' +
'				vec3	emission;	\n' +
'				float	shininess;	\n' +
'			};	\n' +
'			struct TLight	\n' +
'			{	\n' +
'				vec4	position;	\n' +
'				vec4	direction;		\n' +
'				float	cutoff_angle; // cosine of the cut-off angle	\n' +
'				vec4	ambient;	\n' +
'				vec4	diffuse;	\n' +
'				vec4	specular;	\n' +
'			};	\n' +
'			uniform TMaterial	material;	\n' +
'			uniform TLight		lights[2];	\n' +
'			void main()	\n' +
'			{	\n' +
'				vec3	n = normalize(vNormal);	\n' +
'	\n' +
'				vec3	v = normalize(-vPosWorld.xyz);	\n' +
'	\n' +
'                gl_FragColor = vec4(0,0,0,1);	\n' +
'	\n' +
'                for(int i=0 ; i<2 ; i++)	\n' +
'                {	\n' +
'    				vec3	l = normalize((lights[i].position - vPosWorld).xyz);	\n' +
'    				vec3	r = reflect(-l, n);	\n' +
'    				float	l_dot_n = max(dot(l, n), 0.0);	\n' +
'    	\n' +
'    				vec3	ambient = lights[i].ambient.rgb * material.ambient;	\n' +
'    				vec3	diffuse = lights[i].diffuse.rgb * material.diffuse * l_dot_n;	\n' +
'    				vec3	specular = vec3(0.0);	\n' +
'    				if(l_dot_n > 0.0)	\n' +
'    				{	\n' +
'    					specular = lights[i].specular.rgb * material.specular * pow(max(dot(r, v), 0.0), material.shininess);	\n' +
'    				}	\n' +
'    				if(dot(-l,lights[i].direction.xyz) < lights[i].cutoff_angle)	\n' +
'    				{	\n' +
'    					diffuse = vec3(0);	\n' +
'    					specular = vec3(0);	\n' +
'    				}	\n' +
'    				gl_FragColor.rgb += ambient + diffuse + specular;	\n' +
'                }	\n' +
'//                gl_FragColor = vec4(lights[1].direction.xyz, 1);	\n' +
'			}	\n' ;

var list_mats = [];

var shader_model;
var lights = [];


function init_shader(gl, src_vert, src_frag, attrib_names)
{
	initShaders(gl, src_vert, src_frag);
	h_prog = gl.program;
	var	attribs = {};
	for(let attrib of attrib_names)
	{
		attribs[attrib] = gl.getAttribLocation(h_prog, attrib);
	}
	return {h_prog:h_prog, attribs:attribs};
}

function init_models(gl)
{
//    var	src_vert = document.getElementById("vert-Phong-Phong").text;
//    var	src_frag = document.getElementById("frag-Phong-Phong").text;
//    shader_model = init_shader(gl, src_vert, src_frag, ["aPosition", "aNormal"]);
    shader_model = init_shader(gl, src_vert_lighting, src_frag_lighting, ["aPosition", "aNormal"]);
}

function init_materials(gl)
{
	//	http://devernay.free.fr/cours/opengl/materials.html
	list_mats["emerald"] =		    {ambient:[0.0215,0.1745,0.0215],		diffuse:[0.07568,0.61424,0.07568],		specular:[0.633,0.727811,0.633],				shininess:0.6};
	list_mats["jade"] =			    {ambient:[0.135,0.2225,0.1575],			diffuse:[0.54,0.89,0.63],				specular:[0.316228,0.316228,0.316228],			shininess:0.1};
	list_mats["obsidian"] =		    {ambient:[0.05375,0.05,0.06625],		diffuse:[0.18275,0.17,0.22525],			specular:[0.332741,0.328634,0.346435],			shininess:0.3};
	list_mats["pearl"] =			{ambient:[0.25,0.20725,0.20725],		diffuse:[1,0.829,0.829],				specular:[0.296648,0.296648,0.296648],			shininess:0.088};
	list_mats["ruby"] =			    {ambient:[0.1745,0.01175,0.01175],		diffuse:[0.61424,0.04136,0.04136],		specular:[0.727811,0.626959,0.626959],			shininess:0.6};
	list_mats["turquoise"] =		{ambient:[0.1,0.18725,0.1745],			diffuse:[0.396,0.74151,0.69102],		specular:[0.297254,0.30829,0.306678],			shininess:0.1};
	list_mats["brass"] =			{ambient:[0.329412,0.223529,0.027451],	diffuse:[0.780392,0.568627,0.113725],	specular:[0.992157,0.941176,0.807843],			shininess:0.21794872};
	list_mats["bronze"] =			{ambient:[0.2125,0.1275,0.054],			diffuse:[0.714,0.4284,0.18144],			specular:[0.393548,0.271906,0.166721],			shininess:0.2};
	list_mats["chrome"] =			{ambient:[0.25,0.25,0.25],				diffuse:[0.4,0.4,0.4],					specular:[0.774597,0.774597,0.774597],			shininess:0.6};
	list_mats["copper"] =			{ambient:[0.19125,0.0735,0.0225],		diffuse:[0.7038,0.27048,0.0828],		specular:[0.256777,0.137622,0.086014],			shininess:0.1};
	list_mats["gold"] =			    {ambient:[0.24725,0.1995,0.0745],		diffuse:[0.75164,0.60648,0.22648],		specular:[0.628281,0.555802,0.366065],			shininess:0.4};
	list_mats["silver"] =			{ambient:[0.19225,0.19225,0.19225],		diffuse:[0.50754,0.50754,0.50754],		specular:[0.508273,0.508273,0.508273],			shininess:0.4};
	list_mats["black plastic"] =	{ambient:[0.0,0.0,0.0],					diffuse:[0.01,0.01,0.01],				specular:[0.50,0.50,0.50],						shininess:.25};
	list_mats["cyan plastic"] =	    {ambient:[0.0,0.1,0.06],				diffuse:[0.0,0.50980392,0.50980392],	specular:[0.50196078,0.50196078,0.50196078],	shininess:.25};
	list_mats["green plastic"] =	{ambient:[0.0,0.0,0.0],					diffuse:[0.1,0.35,0.1],					specular:[0.45,0.55,0.45],						shininess:.25};
	list_mats["red plastic"] =	    {ambient:[0.0,0.0,0.0],					diffuse:[0.5,0.0,0.0],					specular:[0.7,0.6,0.6],							shininess:.25};
	list_mats["white plastic"] =	{ambient:[0.0,0.0,0.0],					diffuse:[0.55,0.55,0.55],				specular:[0.70,0.70,0.70],						shininess:.25};
	list_mats["yellow plastic"] =	{ambient:[0.0,0.0,0.0],					diffuse:[0.5,0.5,0.0],					specular:[0.60,0.60,0.50],						shininess:.25};
	list_mats["black rubber"] =	    {ambient:[0.02,0.02,0.02],				diffuse:[0.01,0.01,0.01],				specular:[0.4,0.4,0.4],							shininess:.078125};
	list_mats["cyan rubber"] =	    {ambient:[0.0,0.05,0.05],				diffuse:[0.4,0.5,0.5],					specular:[0.04,0.7,0.7],						shininess:.078125};
	list_mats["green rubber"] =	    {ambient:[0.0,0.05,0.0],				diffuse:[0.4,0.5,0.4],					specular:[0.04,0.7,0.04],						shininess:.078125};
	list_mats["red rubber"] =		{ambient:[0.05,0.0,0.0],				diffuse:[0.5,0.4,0.4],					specular:[0.7,0.04,0.04],						shininess:.078125};
	list_mats["white rubber"] =	    {ambient:[0.05,0.05,0.05],				diffuse:[0.5,0.5,0.5],					specular:[0.7,0.7,0.7],							shininess:.078125};
	list_mats["yellow rubber"] =    {ambient:[0.05,0.05,0.0],				diffuse:[0.5,0.5,0.4],					specular:[0.7,0.7,0.04],						shininess:.078125};

}

function init_lights(gl)
{
    var l = {
        	position:[0, .9, 0, 1], 
        	direction:[0,-1,0,0],
        	cutoff_angle:180,
        	ambient: new Vector4([.1, .1, .1, 1.0]), 
        	diffuse: new Vector4([.5, .5, .5, 1.0]), 
        	specular:new Vector4([.5, .5, .5, 1.0]),
        	position_transformed:null
            };
    l.position = V.multiplyVector4(new Vector4(l.position));
    l.direction = V.multiplyVector4(new Vector4(l.direction));
    lights["ceiling"] = l;

    var l = {
        	position:[0, 0, 0, 1], 
        	direction:[0,-1,0,0],
        	cutoff_angle:30,
        	ambient: new Vector4([0.5, 0.5, 0.5, 1.0]), 
        	diffuse: new Vector4([1.0, 1.0, 1.0, 1.0]), 
        	specular:new Vector4([1.0, 1.0, 1.0, 1.0]),
        	position_transformed:null
            };
    lights["luxo"] = l;
};

function init_objects(gl)
{
}

var obj_walls;

var	shader_axes;
var luxo;


function main()
{
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);

	gl.enable(gl.DEPTH_TEST);

	shader_axes = init_shader(gl,
								src_vert_axes, src_frag_axes,
//								document.getElementById("vert-axes").text, 
//								document.getElementById("frag-axes").text,
								["aPosition", "aColor"]);
 
	axes = init_vbo_axes(gl);
    obj_walls = init_vbo_walls(gl);
    luxo = init_vbo_luxo(gl);

    init_xforms(gl);
	init_models(gl);
	init_materials(gl);
    init_lights(gl);
    init_objects(gl);

    for(let name of ["x", "z", "shoulder-1", "shoulder-2", "elbow", "lower", "upper", "head-1", "head-2", "cutoff"])
    {
        init_slider(gl, name);
    }
    gl.clearColor(0.2, 0.2, 0.2, 1.0);

    refresh_scene(gl);

//	var tick = function() {
//		angle = animate(angle);  // Update the rotation angle
//		refresh_scene(gl);   // Draw the triangle
//		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
//	};
//	tick();

}

function init_slider(gl, name)
{
    document.getElementById(name).onchange = function(ev) { refresh_scene(gl); };
    document.getElementById(name).oninput = function(ev) { refresh_scene(gl); };
}

var angle = 0;

function refresh_scene(gl)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(let name of ["x", "z", "lower", "upper"])
    {
        var e_slider = document.getElementById(name);
        var e_span = document.getElementById(name + "-value");
        e_span.innerHTML = e_slider.value*0.01;
    }
    for(let name of ["shoulder-1", "shoulder-2", "elbow", "head-1", "head-2", "cutoff"])
    {
        var e_slider = document.getElementById(name);
        var e_span = document.getElementById(name + "-value");
        e_span.innerHTML = e_slider.value;
    }


    update_xforms(gl);

    update_luxo_xforms(gl);

	render_object(gl, shader_axes, axes);

    render_walls(gl, shader_model, obj_walls);
    
    render_luxo(gl, shader_model);
//    render_light_source(gl);
}

//function render_light_source(gl)
//{
//    gl.useProgram(shader_axes.h_prog);
//
//    var VP = new Matrix4(P); VP.multiply(V);
//    gl.uniformMatrix4fv(gl.getUniformLocation(shader_axes.h_prog, "VP"), false, VP.elements);
//
//    var m = new Matrix4();
//    m.setRotate(angle, 0, 1, 0);
//
//    gl.vertexAttrib4fv(shader_axes.attribs["aPosition"], (m.multiplyVector4(new Vector4(light.position))).elements);
//    gl.vertexAttrib3f(shader_axes.attribs["aColor"], 1, 1, 1);
//
//    gl.drawArrays(gl.POINTS, 0, 1);
//
//    gl.useProgram(null);
//}

function render_object(gl, shader, object, mat_name=null, mtrx_model=new Matrix4())
{
    gl.useProgram(shader.h_prog);
	set_uniforms(gl, shader.h_prog, mat_name, mtrx_model);

	for(var attrib_name in object.attribs)
	{
		var	attrib = object.attribs[attrib_name];
		gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
		gl.vertexAttribPointer(shader.attribs[attrib_name], attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.enableVertexAttribArray(shader.attribs[attrib_name]);
	}
	if(object.drawcall == "drawArrays")
	{
		gl.drawArrays(object.type, 0, object.n);
	}
	else if(object.drawcall == "drawElements")
	{
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.buf_index);
		gl.drawElements(object.type, object.n, object.type_index, 0);
	}

	for(var attrib_name in object.attribs)
	{
		gl.disableVertexAttribArray(shader.attribs[attrib_name]);
	}

    gl.useProgram(null);
}

function set_uniforms(gl, h_prog, mat_name, mtrx_model)
{
	set_xforms(gl, h_prog, mtrx_model);
	set_lights(gl, h_prog);
    if(mat_name != null)    set_material(gl, h_prog, mat_name);
}

var	M;
var V;
var	P;
var	matNormal;


function init_xforms(gl)
{
	V = new Matrix4();
	P = new Matrix4();

    V.setLookAt(0, 0, 3, 0, 0, 0, 0, 1, 0);

	P.setPerspective(60, 1, 1, 5); 


}

function update_xforms(gl)
{
    var m = new Matrix4(V);
    m.rotate(angle, 0, 1, 0);


}

function normalize_vec3(v)
{
	var	len = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
	return [v[0]/len, v[1]/len, v[2]/len];
}

//function normalize_vec4(v)
//{
//	var	len = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]+v[3]*v[3]);
//	return [v[0]/len, v[1]/len, v[2]/len, v[3]/len];
//}



function set_xforms(gl, h_prog, mtrx_model)
{
	M = new Matrix4(mtrx_model);
	N = new Matrix4();

    var VP = new Matrix4(P); VP.multiply(V);
    var MV = new Matrix4(V); MV.multiply(M);
    var MVP = new Matrix4(P); MVP.multiply(V); MVP.multiply(M);
	N.setInverseOf(MV);
	N.transpose();

    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "VP"), false, VP.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MV"), false, MV.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "MVP"), false, MVP.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(h_prog, "matNormal"), false, N.elements);

}

function set_lights(gl, h_prog)
{
    var l = lights["ceiling"];
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[0].position"), l.position.elements);
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[0].direction"), l.direction.elements);
    gl.uniform1f(gl.getUniformLocation(h_prog, "lights[0].cutoff_angle"), Math.cos(l.cutoff_angle*Math.PI/180.0));
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[0].ambient"), l.ambient.elements);
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[0].diffuse"), l.diffuse.elements);
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[0].specular"), l.specular.elements);

    var l = lights["luxo"];
    var m = new Matrix4(V);
    m.multiply(luxo["head"].M);
    var pos = m.multiplyVector4(new Vector4(l.position));
    var dir = m.multiplyVector4(new Vector4(l.direction));
	gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[1].position"), pos.elements);
	gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[1].direction"), dir.elements);
	gl.uniform1f(gl.getUniformLocation(h_prog, "lights[1].cutoff_angle"), Math.cos(document.getElementById("cutoff").value*Math.PI/180.0));
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[1].ambient"), l.ambient.elements);
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[1].diffuse"), l.diffuse.elements);
    gl.uniform4fv(gl.getUniformLocation(h_prog, "lights[1].specular"), l.specular.elements);


}

function set_material(gl, h_prog, mat_name)
{
	var	mat = list_mats[mat_name];
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.ambient"), (new Vector3(mat.ambient)).elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.diffuse"), (new Vector3(mat.diffuse)).elements);
	gl.uniform3fv(gl.getUniformLocation(h_prog, "material.specular"), (new Vector3(mat.specular)).elements);
	gl.uniform1f(gl.getUniformLocation(h_prog, "material.shininess"), mat.shininess*128.0);
}
function init_vbo_axes(gl)
{
    var vertices = new Float32Array([
      // Vertex coordinates and color
      0,0,0, 1,0,0,
      2,0,0, 1,0,0,

      0,0,0, 0,1,0,
      0,2,0, 0,1,0,

      0,0,0, 0,0,1,
      0,0,2, 0,0,1,
    ]);

    var vbo = gl.createBuffer();  
   
    // Write the vertex information and enable it
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    var FSIZE = vertices.BYTES_PER_ELEMENT;
    
	var	attribs = [];
	attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs["aColor"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
   
    return {n:6, drawcall:"drawArrays", type:gl.LINES, attribs:attribs};
}



function init_vbo_cube(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var verts = new Float32Array([
         1, 1, 1,    1, 0, 0,  // v0 White
         1,-1, 1,    1, 0, 0,  // v3 Yellow
         1,-1,-1,    1, 0, 0,  // v4 Green

         1, 1, 1,    1, 0, 0,  // v0 White
         1,-1,-1,    1, 0, 0,  // v4 Green
         1, 1,-1,    1, 0, 0,  // v5 Cyan

         1, 1, 1,    0, 1, 0,  // v0 White
         1, 1,-1,    0, 1, 0,  // v5 Cyan
        -1, 1,-1,    0, 1, 0,  // v6 Blue

         1, 1, 1,    0, 1, 0,  // v0 White
        -1, 1,-1,    0, 1, 0,  // v6 Blue
        -1, 1, 1,    0, 1, 0,  // v1 Magenta

         1, 1, 1,    0, 0, 1,  // v0 White
        -1, 1, 1,    0, 0, 1,  // v1 Magenta
        -1,-1, 1,    0, 0, 1,  // v2 Red

         1, 1, 1,    0, 0, 1,  // v0 White
        -1,-1, 1,    0, 0, 1,  // v2 Red
         1,-1, 1,    0, 0, 1,  // v3 Yellow

        -1,-1,-1,   -1, 0, 0,  // v7 Black
        -1,-1, 1,   -1, 0, 0,  // v2 Red
        -1, 1, 1,   -1, 0, 0,  // v1 Magenta

        -1,-1,-1,   -1, 0, 0,  // v7 Black
        -1, 1, 1,   -1, 0, 0,  // v1 Magenta
        -1, 1,-1,   -1, 0, 0,  // v6 Blue

        -1,-1,-1,    0, 0,-1,  // v7 Black
        -1, 1,-1,    0, 0,-1,  // v6 Blue
         1, 1,-1,    0, 0,-1,  // v5 Cyan

        -1,-1,-1,    0, 0,-1,  // v7 Black
         1, 1,-1,    0, 0,-1,  // v5 Cyan
         1,-1,-1,    0, 0,-1,  // v4 Green

        -1,-1,-1,    0,-1, 0,  // v7 Black
         1,-1,-1,    0,-1, 0,  // v4 Green
         1,-1, 1,    0,-1, 0,  // v3 Yellow

        -1,-1,-1,    0,-1, 0,  // v7 Black
         1,-1, 1,    0,-1, 0,  // v3 Yellow
        -1,-1, 1,    0,-1, 0,  // v2 Red

    ]);
    
   
    var vbo = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	var FSIZE = verts.BYTES_PER_ELEMENT;
	var	attribs = [];
	attribs["aPosition"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs["aNormal"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	return {n:36, drawcall:"drawArrays", type:gl.TRIANGLES, attribs:attribs};
}


// http://rodger.global-linguist.com/webgl/ch08/PointLightedSphere.js
function init_vbo_sphere(gl) 
{ // Create a sphere
    var SPHERE_DIV = 13;
    
    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;
    
    var positions = [];
    var indices = [];
    
    // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);
            
            positions.push(si * sj);  // X
            positions.push(cj);       // Y
            positions.push(ci * sj);  // Z
        }
    }
    
    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
            p1 = j * (SPHERE_DIV+1) + i;
            p2 = p1 + (SPHERE_DIV+1);
            
            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);
            
            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);
        }
    }
    
	var	buf_position = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	var	buf_normal = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

	var	attribs = [];
	attribs["aPosition"] = {buffer:buf_position, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	attribs["aNormal"] = {buffer:buf_normal, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};


	var	buf_index = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    return {n:indices.length, drawcall:"drawElements", buf_index:buf_index, type_index:gl.UNSIGNED_SHORT, type:gl.TRIANGLES, attribs:attribs};
}

function parse_json_js(gl, obj)
{
	var	attributes = obj.data.attributes;

	var	buf_position = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes.position.array), gl.STATIC_DRAW);

	var	buf_normal = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf_normal);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes.normal.array), gl.STATIC_DRAW);

	var	buf_index = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf_index);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.data.index.array), gl.STATIC_DRAW);

	var	attribs = [];
	attribs["aPosition"] = {buffer:buf_position, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};
	attribs["aColor"] = {buffer:buf_normal, size:3, type:gl.FLOAT, normalized:false, stride:0, offset:0};

    return {n:obj.data.index.array.length, drawcall:"drawElements", buf_index:buf_index, type_index:gl.UNSIGNED_SHORT, type:gl.TRIANGLES, attribs:attribs};
}


var ROOM_WIDTH_HALF = 1;
function init_vbo_walls(gl)
{
    var verts = new Float32Array(
                [-ROOM_WIDTH_HALF, -ROOM_WIDTH_HALF, 0, 0, 1,
                  ROOM_WIDTH_HALF, -ROOM_WIDTH_HALF, 0, 0, 1,
                  ROOM_WIDTH_HALF,  ROOM_WIDTH_HALF, 0, 0, 1,
                 -ROOM_WIDTH_HALF,  ROOM_WIDTH_HALF, 0, 0, 1]
            );

    var vbo = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	var FSIZE = verts.BYTES_PER_ELEMENT;
	var	attribs = [];
	attribs["aPosition"] = {buffer:vbo, size:2, type:gl.FLOAT, normalized:false, stride:FSIZE*5, offset:0};
	attribs["aNormal"] = {buffer:vbo, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*5, offset:FSIZE*2};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var walls = [];

    M = new Matrix4();
    M.setTranslate(0, 0, -1);
    walls["back"] = {M:M, material:"gold"};

    M = new Matrix4();
    M.setTranslate(-1, 0, 0);
    M.rotate(90, 0, 1, 0);
    walls["left"] = {M:M, material:"silver"};

    M = new Matrix4();
    M.setTranslate(1, 0, 0);
    M.rotate(-90, 0, 1, 0);
    walls["right"] = {M:M, material:"chrome"};

    M = new Matrix4();
    M.setTranslate(0, 1, 0);
    M.rotate(90, 1, 0, 0);
    walls["top"] = {M:M, material:"bronze"};

    M = new Matrix4();
    M.setTranslate(0, -1, 0);
    M.rotate(-90, 1, 0, 0);
    walls["bottom"] = {M:M, material:"copper"};

    return {walls:walls, object:{n:4, drawcall:"drawArrays", type:gl.TRIANGLE_FAN, attribs:attribs}};
}

function render_walls(gl, shader, obj_walls)
{
    for(wallname in obj_walls.walls)
    {
        wall = obj_walls.walls[wallname];
        render_object(gl, shader, obj_walls.object, wall.material, wall.M);
    }
}

var g_last = Date.now();
var ANGLE_STEP = 30.0;
function animate(angle) {
	// Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
	return newAngle %= 360;
}

function init_vbo_luxo(gl) {
    var x = .5;
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var verts_cube = new Float32Array([
         x, x, x,    1, 0, 0,  // v0 White
         x,-x, x,    1, 0, 0,  // v3 Yellow
         x,-x,-x,    1, 0, 0,  // v4 Green

         x, x, x,    1, 0, 0,  // v0 White
         x,-x,-x,    1, 0, 0,  // v4 Green
         x, x,-x,    1, 0, 0,  // v5 Cyan

         x, x, x,    0, 1, 0,  // v0 White
         x, x,-x,    0, 1, 0,  // v5 Cyan
        -x, x,-x,    0, 1, 0,  // v6 Blue

         x, x, x,    0, 1, 0,  // v0 White
        -x, x,-x,    0, 1, 0,  // v6 Blue
        -x, x, x,    0, 1, 0,  // v1 Magenta

         x, x, x,    0, 0, 1,  // v0 White
        -x, x, x,    0, 0, 1,  // v1 Magenta
        -x,-x, x,    0, 0, 1,  // v2 Red

         x, x, x,    0, 0, 1,  // v0 White
        -x,-x, x,    0, 0, 1,  // v2 Red
         x,-x, x,    0, 0, 1,  // v3 Yellow

        -x,-x,-x,   -1, 0, 0,  // v7 Black
        -x,-x, x,   -1, 0, 0,  // v2 Red
        -x, x, x,   -1, 0, 0,  // v1 Magenta

        -x,-x,-x,   -1, 0, 0,  // v7 Black
        -x, x, x,   -1, 0, 0,  // v1 Magenta
        -x, x,-x,   -1, 0, 0,  // v6 Blue

        -x,-x,-x,    0, 0,-1,  // v7 Black
        -x, x,-x,    0, 0,-1,  // v6 Blue
         x, x,-x,    0, 0,-1,  // v5 Cyan

        -x,-x,-x,    0, 0,-1,  // v7 Black
         x, x,-x,    0, 0,-1,  // v5 Cyan
         x,-x,-x,    0, 0,-1,  // v4 Green

        -x,-x,-x,    0,-1, 0,  // v7 Black
         x,-x,-x,    0,-1, 0,  // v4 Green
         x,-x, x,    0,-1, 0,  // v3 Yellow

        -x,-x,-x,    0,-1, 0,  // v7 Black
         x,-x, x,    0,-1, 0,  // v3 Yellow
        -x,-x, x,    0,-1, 0,  // v2 Red

    ]);
   
    var vbo_cube = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_cube);
    gl.bufferData(gl.ARRAY_BUFFER, verts_cube, gl.STATIC_DRAW);

	var FSIZE = verts_cube.BYTES_PER_ELEMENT;
	var	attribs_cube = [];
	attribs_cube["aPosition"] = {buffer:vbo_cube, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs_cube["aNormal"] = {buffer:vbo_cube, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var RADIUS_SMALL = .1;
    var RADIUS_LARGE = .2;
    var HEIGHT = .2
    var array_verts_head = [];
    var steps = 24;
    for(var i=0 ; i<=steps ; i++)
    {
        angle = (parseFloat(i)*2.0*Math.PI)/parseFloat(steps);
        n  = normalize_vec3([
                        Math.sin(angle), 
                        parseFloat(RADIUS_LARGE-RADIUS_SMALL)/parseFloat(HEIGHT),
                        Math.cos(angle)
                        ]);

        array_verts_head.push(RADIUS_SMALL*Math.sin(angle));
        array_verts_head.push(0);
        array_verts_head.push(RADIUS_SMALL*Math.cos(angle));

        array_verts_head.push(parseFloat(n[0]));
        array_verts_head.push(parseFloat(n[1]));
        array_verts_head.push(parseFloat(n[2]));

        array_verts_head.push(RADIUS_LARGE*Math.sin(angle));
        array_verts_head.push(-HEIGHT);
        array_verts_head.push(RADIUS_LARGE*Math.cos(angle));

        array_verts_head.push(parseFloat(n[0]));
        array_verts_head.push(parseFloat(n[1]));
        array_verts_head.push(parseFloat(n[2]));
    }
    var verts_head = new Float32Array(array_verts_head);

    var vbo_head = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_head);
    gl.bufferData(gl.ARRAY_BUFFER, verts_head, gl.STATIC_DRAW);

	var FSIZE = verts_head.BYTES_PER_ELEMENT;
	var	attribs_head = [];
	attribs_head["aPosition"] = {buffer:vbo_head, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:0};
	attribs_head["aNormal"] = {buffer:vbo_head, size:3, type:gl.FLOAT, normalized:false, stride:FSIZE*6, offset:FSIZE*3};

    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    var parts = [];

    parts["base"] = {n:36, drawcall:"drawArrays", type:gl.TRIANGLES, attribs:attribs_cube, material:"gold"};
    parts["lower"] = {n:36, drawcall:"drawArrays", type:gl.TRIANGLES, attribs:attribs_cube, material:"silver"};
    parts["upper"] = {n:36, drawcall:"drawArrays", type:gl.TRIANGLES, attribs:attribs_cube, material:"copper"};
    parts["head"] = {n:(steps+1)*2, drawcall:"drawArrays", type:gl.TRIANGLE_STRIP, attribs:attribs_head, material:"chrome"};
    
	return parts;
}

function update_luxo_xforms(gl)
{
    var x = document.getElementById("x").value*0.01;
    var z = document.getElementById("z").value*0.01;
    var shoulder_1 = document.getElementById("shoulder-1").value;
    var shoulder_2 = document.getElementById("shoulder-2").value;
    var lower = document.getElementById("lower").value*0.01;
    var elbow = document.getElementById("elbow").value;
    var upper = document.getElementById("upper").value*0.01;
    var head_1 = document.getElementById("head-1").value;
    var head_2 = document.getElementById("head-2").value;

    var m = new Matrix4();
    var BASE_WIDTH =.4;
    var BASE_HEIGHT = .1;
    m.setTranslate(x, BASE_HEIGHT*.5-ROOM_WIDTH_HALF, z);
    m.scale(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    luxo["base"]["M"] = m;


    var m = new Matrix4();
    var WIDTH_LOWER = .1;
    m.setTranslate(x, BASE_HEIGHT-ROOM_WIDTH_HALF, z);
    m.rotate(shoulder_2, 0, 1, 0);
    m.rotate(shoulder_1, 0, 0, 1);
    m.translate((lower-WIDTH_LOWER)*.5, 0, 0);
    m.scale(lower, WIDTH_LOWER, WIDTH_LOWER);
    luxo["lower"]["M"] = m;

    var m = new Matrix4();
    var WIDTH_UPPER = .1;
    m.setTranslate(x, BASE_HEIGHT-ROOM_WIDTH_HALF, z);
    m.rotate(shoulder_2, 0, 1, 0);
    m.rotate(shoulder_1, 0, 0, 1);
    m.translate(lower-WIDTH_LOWER, 0, 0);
    m.rotate(elbow, 0, 0, 1);
    m.translate((upper-WIDTH_UPPER)*.5, 0, 0);
    m.scale(upper, WIDTH_UPPER, WIDTH_UPPER);
    luxo["upper"]["M"] = m;

    var m = new Matrix4();
    m.setTranslate(x, BASE_HEIGHT-ROOM_WIDTH_HALF, z);
    m.rotate(shoulder_2, 0, 1, 0);
    m.rotate(shoulder_1, 0, 0, 1);
    m.translate(lower-WIDTH_LOWER, 0, 0);
    m.rotate(elbow, 0, 0, 1);
    m.translate(upper-WIDTH_UPPER*.5, 0, 0);
    m.rotate(head_2, 1, 0, 0);
    m.rotate(head_1, 0, 0, 1);
    luxo["head"]["M"] = m;



}

function render_luxo(gl, shader)
{
    for(partname in luxo)
    {
        var part = luxo[partname];
        render_object(gl, shader, part, part.material, part.M);
    }
}


