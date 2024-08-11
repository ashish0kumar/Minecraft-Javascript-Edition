import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

function loadTexture(path) {
    const texture = textureLoader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return texture;
}

const textures = {
    dirt: loadTexture('textures/dirt.png'),
    grass: loadTexture('textures/grass.png'),
    grassSide: loadTexture('textures/grass_side.png'),
    stone: loadTexture('textures/stone.png'),
    coalOre: loadTexture('textures/coal_ore.png'),
    ironOre: loadTexture('textures/iron_ore.png'),
};

export const blocks = {
    empty: {
        id: 0,
        name: 'empty'
    },
    grass: {
        id: 1,
        name: 'grass',
        color: 0x559020,
        material: [
            new THREE.MeshLambertMaterial({ map: textures.grassSide }), // right
            new THREE.MeshLambertMaterial({ map: textures.grassSide }), // left
            new THREE.MeshLambertMaterial({ map: textures.grass }), // top
            new THREE.MeshLambertMaterial({ map: textures.dirt }), // bottom
            new THREE.MeshLambertMaterial({ map: textures.grassSide }), // front
            new THREE.MeshLambertMaterial({ map: textures.grassSide }) // back
        ]
    },
    dirt: {
        id: 2,
        name: 'dirt',
        color: 0x807020,
        material: new THREE.MeshLambertMaterial({ map: textures.dirt })
    },
    stone: {
        id: 3,
        name: 'stone',
        color: 0x808080,
        scale: { x: 30, y: 30, z: 30 },
        scarcity: 0.5,
        material: new THREE.MeshLambertMaterial({ map: textures.stone })
    },
    coalOre: {
        id: 4,
        name: 'coalOre',
        color: 0x202020,
        scale: { x: 20, y: 20, z: 20 },
        scarcity: 0.8,
        material: new THREE.MeshLambertMaterial({ map: textures.coalOre })
    },
    ironOre: {
        id: 5,
        name: 'ironOre',
        color: 0x806060,
        scale: { x: 60, y: 60, z: 60 },
        scarcity: 0.9,
        material: new THREE.MeshLambertMaterial({ map: textures.ironOre })
    }
};

export const resources = [
    blocks.stone,
    blocks.coalOre,
    blocks.ironOre
];