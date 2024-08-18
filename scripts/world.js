import * as THREE from 'three';
import { WorldChunk } from './worldChunk';
import { Player } from './player';

export class World extends THREE.Group {

    /**
     * Whether or not we want to load the chunks asynchronously
     */
    asyncLoading = true;

    /**
     * The number of chunks to render around the player.
     * When this is set to 0, the chunk player is on is the only that is rendered.
     * If it is set to 1, the adjacent chunks are rendered;
     * if set to 2, the chunks adjacent to those are rendered, and so on.
     */
    drawDistance = 3;

    chunkSize = {
        width: 32,
        height: 32
    };

    params = {
        seed: 0,
        terrain: {
            scale: 100,
            magnitude: 0.1,
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

        for (let x = -this.drawDistance; x <= this.drawDistance; x++) {
            for (let z = -this.drawDistance; z <= this.drawDistance; z++) {
                const chunk = new WorldChunk(this.chunkSize, this.params);
                chunk.position.set(
                    x * this.chunkSize.width,
                    0,
                    z * this.chunkSize.width
                );
                chunk.userData = { x, z };
                chunk.generate();
                this.add(chunk);
            }
        }
    }

    /**
     * Updates the visible portions of the world based on the current player position
     * @param {Player} player 
     */
    update(player) {
        const visibleChunks = this.getVisibleChunks(player);
        const chunksToAdd = this.getChunksToAdd(visibleChunks);
        this.removeUnusedChunks(visibleChunks);

        for (const chunk of chunksToAdd) {
            this.generateChunk(chunk.x, chunk.z);
        }
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
                .find(({ x, z }) => (
                    chunk.x === x && chunk.z === z
                ));

            return !chunkExists;
        });
    }

    /**
     * Removes current loaded chunks that are no longer visible to the player
     * @param {{x: number, y: number}[]} visibleChunks 
     */
    removeUnusedChunks(visibleChunks) {
        // Filter down the chunks that are no longer visible to the player
        const chunksToRemove = this.children.filter((chunk) => {
            const { x, z } = chunk.userData;
            const chunkExists = visibleChunks
                .find((visibleChunk) => (
                    visibleChunk.x === x && visibleChunk.z === z
                ));

            return !chunkExists;
        });

        for (const chunk of chunksToRemove) {
            chunk.disposeInstances();
            this.remove(chunk);
            // console.log(`Removing chunk at X: ${chunk.userData.x} Z: ${chunk.userData.z}`);
        }
    }

    /**
     * Generates the chunk at (x, z) coordinates
     * @param {number} x 
     * @param {number} z 
     */
    generateChunk(x, z) {
        const chunk = new WorldChunk(this.chunkSize, this.params);
        chunk.position.set(
            x * this.chunkSize.width,
            0,
            z * this.chunkSize.width
        );
        chunk.userData = { x, z };

        if (this.asyncLoading) {
            requestIdleCallback(chunk.generate.bind(chunk), { timeout: 1000 });
        } else {
            chunk.generate();
        }

        this.add(chunk);
        // console.log(`Adding chunk at X: ${x} Z: ${z}`);
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

        if (chunk && chunk.loaded) {
            return chunk.getBlock(
                coords.block.x, 
                y, 
                coords.block.z
            );
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

    /**
     * Adds a new block at (x, y, z) of type `blockId`
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} blockId 
     */
    addBlock(x, y, z, blockId) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk) {
            chunk.addBlock(
                coords.block.x,
                coords.block.y,
                coords.block.z,
                blockId
            );

            // Hide adjacent neighbours if they are now hidden after adding a new block
            this.hideBlock(x - 1, y, z);
            this.hideBlock(x + 1, y, z);
            this.hideBlock(x, y - 1, z);
            this.hideBlock(x, y + 1, z);
            this.hideBlock(x, y, z - 1);
            this.hideBlock(x, y, z + 1);
        }
    }

    /**
     * Removes the block at (x, y, z) and sets it to empty
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    removeBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk) {
            chunk.removeBlock(
                coords.block.x,
                coords.block.y,
                coords.block.z
            );

            // Reveal adjacent neighbours if they are hidden
            this.revealBlock(x - 1, y, z);
            this.revealBlock(x + 1, y, z);
            this.revealBlock(x, y - 1, z);
            this.revealBlock(x, y + 1, z);
            this.revealBlock(x, y, z - 1);
            this.revealBlock(x, y, z + 1);
        }
    }

    /**
     * Reveals the block at (x, y, z) by adding a new mesh instance
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    revealBlock(x, y, z) {
        const coords =  this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk) {
            chunk.addBlockInstance(
                coords.block.x,
                coords.block.y,
                coords.block.z
            );
        }
    }

    /**
     * Hides the block at (x, y, z) by removing the mesh instance
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    hideBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk && chunk.isBlockObscured(coords.block.x, coords.block.y, coords.block.z)) {
            chunk.deleteBlockInstance(
                coords.block.x,
                coords.block.y,
                coords.block.z
            );
        }
    }
}