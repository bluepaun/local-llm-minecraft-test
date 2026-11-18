import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 2, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(10, 20, 10);
scene.add(sunLight);

const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => controls.lock());

const keys = {};
document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);

const blockSize = 1;
const worldSize = 20;
const blocks = [];

const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
const blockMaterials = {
    grass: new THREE.MeshLambertMaterial({ color: 0x44aa44 }),
    dirt: new THREE.MeshLambertMaterial({ color: 0x8b4513 }),
    stone: new THREE.MeshLambertMaterial({ color: 0x808080 }),
};
let currentMaterial = blockMaterials.grass;

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Digit1') currentMaterial = blockMaterials.grass;
    if (e.code === 'Digit2') currentMaterial = blockMaterials.dirt;
    if (e.code === 'Digit3') currentMaterial = blockMaterials.stone;
});

for (let x = 0; x < worldSize; x++) {
    for (let z = 0; z < worldSize; z++) {
        const cube = new THREE.Mesh(geometry, blockMaterials.grass);
        cube.position.set(x, 0, z);
        scene.add(cube);
        blocks.push(cube);
    }
}

document.addEventListener('mousedown', (e) => {
    if (!controls.isLocked) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(blocks);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (e.button === 0) { // Left click: Remove
            scene.remove(intersect.object);
            blocks.splice(blocks.indexOf(intersect.object), 1);
        } else if (e.button === 2) { // Right click: Place
            const pos = intersect.object.position.clone().add(intersect.face.normal);
            const cube = new THREE.Mesh(geometry, currentMaterial);
            cube.position.copy(pos);
            scene.add(cube);
            blocks.push(cube);
        }
    }
});


document.addEventListener('contextmenu', (e) => e.preventDefault());

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        const delta = 0.1;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(keys['KeyW']) - Number(keys['KeyS']);
        direction.x = Number(keys['KeyD']) - Number(keys['KeyA']);
        direction.normalize();

        if (keys['KeyW'] || keys['KeyS']) velocity.z -= direction.z * 40.0 * delta;
        if (keys['KeyA'] || keys['KeyD']) velocity.x -= direction.x * 40.0 * delta;

        const nextPos = camera.position.clone();
        nextPos.x += -velocity.x * delta;
        nextPos.z += -velocity.z * delta;

        let collision = false;
        for (const block of blocks) {
            if (Math.abs(nextPos.x - block.position.x) < 0.7 && 
                Math.abs(nextPos.z - block.position.z) < 0.7 && 
                Math.abs(nextPos.y - block.position.y) < 0.7) {
                collision = true;
                break;
            }
        }

        if (!collision) {
            controls.moveRight(-velocity.x * delta);
            controls.moveForward(-velocity.z * delta);
        } else {
            velocity.set(0, 0, 0);
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
