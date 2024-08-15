import * as THREE from 'three';
import { WorldChunk } from './worldChunk';

export class World extends THREE.Group {

    chunkSize = { 
        width: 64, 
        height: 32 
    };

    params = {
        seed: 0,
        terrain: {
            scale: 30,
            magnitude: 0.5,
            offset: 0.2
        }
    };

    constructor(seed = 0) {
        super();
        this.seed = seed;
    }

    /**
     * Regenerate the wolrd data model and the meshes
     */
    generate() {
        this.chunk = new WorldChunk(this.chunkSize, this.params);
        this.chunk.generate();
        this.add(this.chunk);
    }

    /**
     * Gets the block data at (x, y, z)
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {{id: number, instanceId: number} | null}
     */
    getBlock(x, y, z) {
        return this.chunk.getBlock(x, y, z);
    }
}