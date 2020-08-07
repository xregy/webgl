import * as THREE from "https://threejs.org/build/three.module.js"
import {OBJLoader} from "https://threejs.org/examples/jsm/loaders/OBJLoader.js"
import * as mat4 from "../lib/gl-matrix/mat4.js"
import {toRadian} from "../lib/gl-matrix/common.js"
import {Shader} from "../modules/class_shader.mjs"
import {Mesh} from "../modules/class_mesh.mjs"
import {Axes} from "../modules/class_axes.mjs"
import {Texture} from "../modules/class_texture.mjs"
import {length2, unproject_vector} from "../modules/utils.js"
import {Light} from "../modules/class_light.mjs"
import {Material, __js_materials} from "../modules/class_material.mjs"

"use strict";

function main()
{
    const loc_aPosition = 3;
    const loc_aNormal = 8;
    const loc_aTexCoord = 1;
    const numLights = 2;
    
    const src_vert = `#version 300 es
    layout(location=${loc_aPosition}) in vec4	aPosition;
    layout(location=${loc_aNormal}) in vec3	aNormal;
    layout(location=${loc_aTexCoord}) in vec2	aTexCoord;
    out vec2	vTexCoord;
    uniform mat4	MVP;
    uniform mat4	MV;
    uniform mat4	matNormal;
    uniform float	disp_scale;
    uniform float	disp_bias;
    uniform sampler2D tex_disp;
    uniform bool	use_disp_map;
    out vec3	vNormal;
    out vec4	vPosEye;
    void main()
    {
    	vPosEye = MV*aPosition;
    	float	disp = texture(tex_disp, aTexCoord).r;
    	vec4	p = aPosition;
    	if(use_disp_map) p += (disp_scale*disp + disp_bias)*vec4(aNormal, 0);
    	vNormal = normalize((matNormal*vec4(aNormal,0)).xyz);
    //				vNormal = normalize((vec4(aNormal,0)).xyz);
    	gl_Position = MVP*p;
    	vTexCoord = aTexCoord;
    }`;
    const src_frag = `#version 300 es
    #extension GL_OES_standard_derivatives : enable
    precision mediump float;
    //			uniform sampler2D tex_color;
    uniform highp mat4	matNormal;
    uniform sampler2D tex_norm;
    uniform bool	use_norm_map;
    in vec4 vPosEye;
    in vec3	vNormal;
    in vec2	vTexCoord;
    out vec4 fColor;
    struct TMaterial
    {
    	vec3	ambient;
    	vec3	diffuse;
    	vec3	specular;
    	vec3	emission;
    	float	shininess;
    };
    struct TLight
    {
    	vec4	position;
    	vec3	ambient;
    	vec3	diffuse;
    	vec3	specular;
    	bool	enabled;
    };
    uniform TMaterial	material;
    uniform TLight		light[${numLights}];
    
    // courtesy of Three.js fragment shader
    // http://www.thetenthplanet.de/archives/1180
    vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {
    	vec3 q0 = dFdx( eye_pos );
    	vec3 q1 = dFdy( eye_pos );
    	vec2 st0 = dFdx( vTexCoord );
    	vec2 st1 = dFdy( vTexCoord );
    	float scale = sign( st1.t * st0.s - st0.t * st1.s );
    	vec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * scale );
    	vec3 T = normalize( ( - q0 * st1.s + q1 * st0.s ) * scale );
    	vec3 N = normalize( surf_norm );
    	mat3 tsn = mat3( S, T, N );
    	vec3 mapN = texture( tex_norm, vTexCoord ).xyz * 2.0 - 1.0;
    	mapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );
    	return normalize( tsn * mapN );
    }
    
    // http://www.thetenthplanet.de/archives/1180
    mat3 cotangent_frame( vec3 N, vec3 p, vec2 uv )
    {
    	// get edge vectors of the pixel triangle
    	vec3 dp1 = dFdx( p );
    	vec3 dp2 = dFdy( p );
    	vec2 duv1 = dFdx( uv );
    	vec2 duv2 = dFdy( uv );
    	
    	// solve the linear system
    	vec3 dp2perp = cross( dp2, N );
    	vec3 dp1perp = cross( N, dp1 );
    	vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
    	vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
    	
    	// construct a scale-invariant frame 
    	float invmax = inversesqrt( max( dot(T,T), dot(B,B) ) );
    	return mat3( T * invmax, B * invmax, N );
    }
    
    vec3 perturb_normal( vec3 N, vec3 V, vec2 texcoord )
    {
    	// assume N, the interpolated vertex normal and 
    	// V, the view vector (vertex to eye)
    //				vec3 map = texture( mapBump, texcoord ).xyz;
    	vec3 map = 2.0*texture( tex_norm, texcoord ).xyz - 1.0;
    	mat3 TBN = cotangent_frame( N, -V, texcoord );
    	return normalize( TBN * map );
    }
    
    void main()
    {
    	vec3	n;
    	n = normalize(vNormal);
    	vec3	v = normalize(-vPosEye.xyz);
    	if(use_norm_map)
    	{
    //					n = normalize((matNormal * vec4(n, 0)).xyz);
    		n = perturbNormal2Arb(v, n);
    //					n = normalize(perturb_normal(n, v, vTexCoord));
    	}
    	vec3	l;
    	fColor = vec4(0.0);
    	for(int i=0 ; i<${numLights} ; i++)
    	{
    		if(light[i].enabled)
    		{
    			if(light[i].position.w == 1.0)
    				l = normalize((light[i].position - vPosEye).xyz);
    			else
    				l = normalize((light[i].position).xyz);
    			vec3	r = reflect(-l, n);
    			float	l_dot_n = max(dot(l, n), 0.0);
    			vec3	ambient = light[i].ambient * material.ambient;
    			vec3	diffuse = light[i].diffuse * material.diffuse * l_dot_n;
    			vec3	specular = vec3(0.0);
    			if(l_dot_n > 0.0)
    			{
    				specular = light[i].specular * material.specular * pow(max(dot(r, v), 0.0), material.shininess);
    			}
    			fColor += vec4(ambient + diffuse + specular, 1);
    		}
    	}
    	fColor.w = 1.0;
    //				fColor = vec4(n, 1);
    }`;


    const canvas = document.getElementById('webgl');
    const gl = canvas.getContext("webgl2");
    gl.getExtension('OES_standard_derivatives');
    
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    const V = mat4.create();
    mat4.lookAt(V, [6, 6, 6], [0, 0, 0], [0, 1, 0]);
    
    const P = mat4.create();
    mat4.ortho(P, -1, 1, -1, 1, 1, 100); 
    
    const uniform_vars = ["MVP", "MV", "matNormal", "disp_scale", 
    	"disp_bias", "tex_disp", "use_disp_map", "tex_norm", "use_norm_map"];
    
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[0]"));
    Array.prototype.push.apply(uniform_vars, Light.generate_uniform_names("light[1]"));
    Array.prototype.push.apply(uniform_vars, Material.generate_uniform_names("material"));
    
    const shader = new Shader(gl, src_vert, src_frag, uniform_vars);
    
    const lights = 
    [
        new Light
        (
            gl,
            [20, 20, 20, 1.0],		// position
            [0.1, 0.1, 0.1, 1.0],	// ambient
            [1.0, 1.0, 1.0, 1.0],	// diffusive
            [1.0, 1.0, 1.0, 1.0],	// specular
            false
        ),
        new Light
        (
            gl,
            [0, 20, 20, 0.0],		// position
            [0.1, 0.1, 0.1, 1.0],	// ambient
            [1.0, 1.0, 1.0, 1.0],	// diffusive
            [1.0, 1.0, 1.0, 1.0],	// specular
            true
        ),
    ];
    
    
    const mesh = new Mesh({gl, loc_aPosition});
    
    mat4.fromTranslation(mesh.M, [0, -8.8, 0]);
    mat4.scale(mesh.M, mesh.M, [0.05, 0.05, 0.05]);
    
    const axes = new Axes(gl,4);
    
    let lastX;
    let lastY;
    let angle = [0,0];
    let dragging = false;

    canvas.onmousedown = function(ev) 
    {
        let x = ev.clientX, y = ev.clientY;
        let bb = ev.target.getBoundingClientRect();
        if (bb.left <= x && x < bb.right && bb.top <= y && y < bb.bottom)
        {
            lastX = x;
            lastY = y;
            dragging = true;
        }
    }
    canvas.onmouseup = function(ev) { dragging = false; };
    
    const VP = mat4.create();
    canvas.onmousemove = function(ev)
    {
        let x = ev.clientX;
        let y = ev.clientY;
        if(dragging)
        {
            let offset = [x - lastX, y - lastY];
            if(offset[0] != 0 || offset[1] != 0) // For some reason, the offset becomes zero sometimes...
            {
                mat4.copy(VP, P);
                mat4.multiply(VP, VP, V);
                let axis = unproject_vector([offset[1], offset[0], 0], VP, 
                    gl.getParameter(gl.VIEWPORT));
                mat4.rotate(V, V, toRadian(length2(offset)), [axis[0], axis[1], axis[2]]);
            }
        }
        lastX = x;
        lastY = y;
    }
    
   
   
//    canvas.onmousedown = function(ev) 
//    {
//    	let x = ev.clientX, y = ev.clientY;
//    	let bb = ev.target.getBoundingClientRect();
//    	if (bb.left <= x && x < bb.right && bb.top <= y && y < bb.bottom)
//    	{
//    		lastX = x;
//    		lastY = y;
//    		dragging = true;
//    	}
//    }
//    canvas.onmouseup = function(ev) { dragging = false; };
//    
//    canvas.onmousemove = function(ev)
//    {
//    	let x = ev.clientX;
//    	let y = ev.clientY;
//    	if(dragging)
//    	{
//    		let offset = [x - lastX, y - lastY];
//    		if(offset[0] != 0 || offset[1] != 0) // For some reason, the offset becomes zero sometimes...
//    		{
//    			let	VP = new Matrix4(P);
//    			VP.multiply(V);
//    			let	axis = unproject_vector([offset[1], offset[0], 0], VP, 
//    				gl.getParameter(gl.VIEWPORT));
//    			V.rotate(length2(offset), axis[0], axis[1], axis[2]);
//    		}
//    	}
//    	lastX = x;
//    	lastY = y;
//    }

    const manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
    };
    const loader = new OBJLoader( manager );

    let tex_norm, tex_disp;
    const img_norm = new Image();
    const img_disp = new Image();

    function load_image(image, src)
    {
        return new Promise(function(resolve, reject) {
            image.crossOrigin = '';	// https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
            image.onload = function() {
                resolve(image);
            }
            image.onerror = () => reject(new Error(`Error while loading ${src}.`));
        	image.src = src;
        });
    }

    //https://threejs.org/examples/#webgl_materials_displacementmap 
    Promise.all([load_image(img_norm, '../resources/ninja-normal.png'),
                load_image(img_disp, '../resources/ninja-displacement.jpg')]
    ).then(
        function(images) {
            tex_norm = new Texture(gl, images[0]);
            tex_disp = new Texture(gl, images[1]);
            return new Promise(function(resolve, reject) {
                loader.load('../resources/ninjaHead_Low.obj',
                    function ( object )
                    {
                        resolve(object);
                    },
                    // called when loading is in progresses
                    function ( xhr )
                    {
                        document.getElementById("output").innerHTML = ( xhr.loaded / xhr.total * 100 ) + '% loaded.';
                    },
                    // called when loading has errors
                    function ( error )
                    {
                        reject(new Error(`Error while loading ${error.srcElement.responseURL}.`));
                    }
        
                );

            });
        }
    ).then(
        function(object) {
            document.getElementById("output").innerHTML = 'Successfully loaded.';
            for(let obj of object.children)
            {
                if(obj.type == "Mesh")
                {
                    mesh.init_from_THREE_geometry(gl, object.children[0].geometry,
						loc_aPosition, loc_aNormal, loc_aTexCoord);
                }
            }
            tick();
        }
    ).catch(
        err => document.getElementById("output").innerHTML = 'An error happened: ' + err.message
    );


    function tick() {   // start drawing
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        axes.render(gl, V, P);
        gl.useProgram(shader.h_prog);
        gl.uniform1i(gl.getUniformLocation(shader.h_prog, "use_norm_map"), document.getElementById("normmap").checked);
        gl.uniform1i(gl.getUniformLocation(shader.h_prog, "use_disp_map"), document.getElementById("dispmap").checked);
        gl.uniform1f(gl.getUniformLocation(shader.h_prog, "disp_scale"), 2.436143);
        gl.uniform1f(gl.getUniformLocation(shader.h_prog, "disp_bias"), -0.428408);
        mesh.render(gl, shader, lights, __js_materials["gold"], V, P, {"tex_norm":tex_norm, "tex_disp":tex_disp});
        requestAnimationFrame(tick, canvas);
    };


}

main();
