import * as THREE from 'three';
import { WorldChunk } from './worldChunk';
import { Player } from './player';

export class World extends THREE.Group {

    /**
     * The number of chunks to render around the player.
     * When this is set to 0, the chunk player is on is the only that is rendered.
     * If it is set to 1, the adjacent chunks are rendered;
     * if set to 2, the chunks adjacent to those are rendered, and so on.
     */
    drawDistance = 1;

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
        this.disposeChunks();

        for (let x = -1; x <= 1; x++) {
            for (let z = -1; z <= 1; z++) {
                const chunk = new WorldChunk(this.chunkSize, this.params);
                chunk.position.set(x * this.chunkSize.width, 0, z * this.chunkSize.width);
                chunk.userData = { x, z };
                chunk.generate();
                this.add(chunk);
            }
        }
    }

    /**
       * Generates the chunk at the (x,z) coordinates
       * @param {number} x 
       * @param {number} z
       */
    generateChunk(x, z) {
        const chunk = new WorldChunk(this.chunkSize, this.params);
        chunk.position.set(x * this.chunkSize.width, 0, z * this.chunkSize.width);
        chunk.userData = { x, z };

        if (this.asyncLoading) {
            requestIdleCallback(chunk.generate.bind(chunk), { timeout: 1000 });
        } else {
            chunk.generate();
        }

        this.add(chunk);
    }

    /**
     * Updates the visible portions of the world based on the current player position
     * @param {Player} player 
     */
    update(player) {
        const visibleChunks = this.getVisibleChunks(player);
        const chunksToAdd = this.getChunksToAdd(visibleChunks);
    }

    /**
     * Returns an array containing the coordinates of the chunks that are currently visible to the player
     * @param {Player} player
     * @returns {{x: number, z: number}[]} 
     */
    getVisibleChunks(player) {
        const visibleChunks = [];

        const coords = this.worldToChunkCoords(
            player.position.x,
            player.position.y,
            player.position.z
        );

        const chunkX = coords.chunk.x;
        const chunkZ = coords.chunk.z;

        for (let x = chunkX - this.drawDistance; x <= chunkX + this.drawDistance; x++) {
            for (let z = chunkZ - this.drawDistance; z <= chunkZ + this.drawDistance; z++) {
                visibleChunks.push({ x, z });
            }
        }

        return visibleChunks;
    }

    /**
     * Returns an array containing the coordinates of the chunks that are not yet loaded and need to be added to the scene
     * @param {{x: number, z: number}[]} visibleChunks
     * @returns {{x: number, z: number}[]}
     */
    getChunksToAdd(visibleChunks) {
        // Filter down the visible chunks to those not already in the world
        return visibleChunks.filter((chunk) => {
            const chunkExists = this.children
                .map((obj) => obj.userData)
                .find(({x, z}) => (
                    chunk.x === x && chunk.z === z
                ));
            
            return !chunkExists;
        });
    }

    /**
     * Gets the block data at (x, y, z)
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {{id: number, instanceId: number} | null}
     */
    getBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk) {
            return chunk.getBlock(coords.block.x, y, coords.block.z);
        } else {
            return null;
        }
    }

    /**
     * Returns the chunk and world coordinates of the block at (x,y,z)\
     *  - `chunk` is the coordinates of the chunk containing the block
     *  - `block` is the world coordinates of the block
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {{
     *  chunk: { x: number, z: number},
     *  block: { x: number, y: number, z: number}
     * }}
     */
    worldToChunkCoords(x, y, z) {
        const chunkCoords = {
            x: Math.floor(x / this.chunkSize.width),
            z: Math.floor(z / this.chunkSize.width),
        };

        const blockCoords = {
            x: x - this.chunkSize.width * chunkCoords.x,
            y,
            z: z - this.chunkSize.width * chunkCoords.z
        }

        return {
            chunk: chunkCoords,
            block: blockCoords
        };
    }

    /**
     * Returns the WorldChunk object the contains the specified coordinates
     * @param {number} chunkX
     * @param {number} chunkZ
     * @returns {WorldChunk | null}
     */
    getChunk(chunkX, chunkZ) {
        return this.children.find((chunk) => {
            return chunk.userData.x === chunkX && chunk.userData.z === chunkZ;
        });
    }

    disposeChunks() {
        this.traverse((chunk) => {
            if (chunk.disposeInstances) {
                chunk.disposeInstances();
            }
        });
        this.clear();
    }
}