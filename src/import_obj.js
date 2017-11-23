function main()
{
//	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
//    camera.position.z = 1;
	var THREE = require('three');

	var loader = new THREE.OBJLoader();
	


	loader.load("../resources/monkey.obj");
}
