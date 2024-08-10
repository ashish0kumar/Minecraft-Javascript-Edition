import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { gapSize } from "three/webgpu";

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0e0);
document.body.appendChild(renderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(-32, 16, -32);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(16, 0, 16);
controls.update();

// Scene
const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial({ color: 0x00d000 });

function setupLights() {
    const light1 = new THREE.DirectionalLight();
    light1.position.set(1, 1, 1);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight();
    light2.position.set(-1, 1, -0.5);
    scene.add(light2);

    const ambient = new THREE.AmbientLight();
    ambient.intensity = 0.1;
    scene.add(ambient);
}

function setupWorld(size) {
    for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(x, 0, z);
            scene.add(cube);
        }
    }
}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

setupLights();
setupWorld(32);
animate();