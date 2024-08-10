import * as THREE from "three";

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial({ color: 0x00d000 });

export class World extends THREE.Group {
    constructor(size = 32) {
        super();
        this.size = size;
    }

    generate() {
        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                const block = new THREE.Mesh(geometry, material);
                block.position.set(x, 0, z);
                this.add(block);
            }
        }
    }
}