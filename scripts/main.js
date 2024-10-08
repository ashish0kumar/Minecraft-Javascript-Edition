import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { World } from "./world";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { createUI } from "./ui";
import { Player } from "./player";
import { Physics } from "./physics";
import { blocks } from "./blocks";
import { ModelLoader } from "./modelLoader";

const stats = new Stats();
document.body.append(stats.dom);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0e0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Camera
const orbitCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
orbitCamera.position.set(32, 32, 24);
orbitCamera.layers.enable(1);

const controls = new OrbitControls(orbitCamera, renderer.domElement);
controls.target.set(16, 0, 16);
controls.update();

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x80a0e0, 50, 100);
const world = new World();
world.generate();
scene.add(world);

const player = new Player(scene);
const physics = new Physics(scene);

const modelLoader = new ModelLoader();
modelLoader.loadModels((models) => {
    player.tool.setMesh(models.pickaxe);
});

const sun = new THREE.DirectionalLight();

function setupLights() {
    sun.position.set(50, 50, 50);
    sun.castShadow = true;
    // sun.intensity = 1.5;
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.bottom = -100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 200;
    sun.shadow.bias = -0.0001;

    sun.shadow.mapSize = new THREE.Vector2(2048, 2048);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(sun);
    scene.add(sun.target);

    const ambient = new THREE.AmbientLight();
    ambient.intensity = 0.25;
    scene.add(ambient);
}

function onMouseDown(event) {
    if (player.controls.isLocked && player.selectedCoords) {
        if (player.activeBlockId === blocks.empty.id) {
            // console.log(`Removing block at ${JSON.stringify(player.selectedCoords)}`);
            world.removeBlock(
                player.selectedCoords.x,
                player.selectedCoords.y,
                player.selectedCoords.z
            );
            player.tool.startAnimation();
        } else {
            // console.log(`Adding block at ${JSON.stringify(player.selectedCoords)}`);
            world.addBlock(
                player.selectedCoords.x,
                player.selectedCoords.y,
                player.selectedCoords.z,
                player.activeBlockId
            );
        }
    }
}

document.addEventListener('mousedown', onMouseDown);

// Render loop
let previousTime = performance.now();
function animate() {
    let currentTime = performance.now();
    let dt = (currentTime - previousTime) / 1000;

    requestAnimationFrame(animate);

    if (player.controls.isLocked) {
        player.update(world);
        physics.update(dt, player, world);
        world.update(player);

        sun.position.copy(player.position);
        sun.position.sub(new THREE.Vector3(-50, -50, -50));
        sun.target.position.copy(player.position);
    }

    renderer.render(scene, player.controls.isLocked ? player.camera : orbitCamera);
    stats.update();

    previousTime = currentTime;
}

window.addEventListener("resize", () => {
    orbitCamera.aspect = window.innerWidth / window.innerHeight;
    orbitCamera.updateProjectionMatrix();
    player.camera.aspect = window.innerWidth / window.innerHeight;
    player.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

setupLights();
createUI(scene, world, player, physics);
animate();