import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';

function main() {

    // Set up the box
    const geomCube = new THREE.BoxGeometry(1, 1, 1);
    const matCube = new THREE.MeshLambertMaterial({color: 0xFF8080});
    const cube = new THREE.Mesh(geomCube, matCube);
    cube.position.set(0, 0.5, 0);

    // Set up the plane
    const geomPlane = new THREE.PlaneGeometry(1, 1);
    const matPlane = new THREE.MeshLambertMaterial({color: 0x80FFFF});
    const plane = new THREE.Mesh(geomPlane, matPlane);
    plane.scale.set(5, 5, 1);
    plane.rotateX(THREE.MathUtils.degToRad(-90));


    // Set up the light
    const light = new THREE.PointLight({color:0xFFFFFF});
    light.position.set(5, 5, 1);
    light.distance = 0;

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 100);
    const angleX = THREE.MathUtils.degToRad(-10);
    const angleY = THREE.MathUtils.degToRad(40);
    const V = new THREE.Matrix4();
    V.makeRotationFromEuler(new THREE.Euler(angleX, angleY, 0, "ZYX"));
    V.setPosition(3, 1.5, 4);
    camera.applyMatrix4(V);

    // Compose the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080);
    scene.add(cube);
    scene.add(plane);
    scene.add(light);
    
    // Render the scene
    const canvas = document.querySelector('#webgl');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.render(scene, camera);
}

main();

