import * as THREE from 'three';
import { Player } from './player';
import { World } from './world';
import { blocks } from './blocks';

export class Physics {
    constructor(scene) {
        
    }

    /**
     * Moves physics simulation forward in time by 'dt'
     * @param {number} dt 
     * @param {Player} player 
     * @param {World} world 
     */
    update(dt, player, world) {
        this.detectCollisions(player, world);
    }

    /**
     * Main function for collision detection
     * @param {Player} player 
     * @param {World} world 
     */
    detectCollisions(player, world) {
        const candidates = this.broadPhase(player, world);
        // const collisions = this.narrowPhase(candidates, player);

        // if (collisions.length > 0) {
        //     this.resolveCollisions(collisions);
        // }
    }

    /**
     * Performs a rough search against the world to return all possible blocks the player may be collided with
     * @param {Player} player 
     * @param {World} world 
     * @returns {[]}
     */
    broadPhase(player, world) {
        const candidates = [];

        // Gets the extents of the player
        const extents = {
            x: {
                min: Math.floor(player.position.x - player.radius),
                max: Math.ceil(player.position.x + player.radius)
            },
            y: {
                min: Math.floor(player.position.y - player.height),
                max: Math.ceil(player.position.y)
            },
            z: {
                min: Math.floor(player.position.z - player.radius),
                max: Math.ceil(player.position.z + player.radius)
            }
        }

        // Loop through all blocks within the player's extents
        // If they aren't empty, then they are a possible collision candidate 
        for (let x = extents.x.min; x <= extents.x.max; x++) {
            for (let y = extents.y.min; y <= extents.y.max; y++) {
                for (let z = extents.z.min; z <= extents.z.max; z++) {
                    const block = world.getBlock(x, y, z);
                    if (block && block.id !== blocks.empty.id) {
                        const blockPos = { x, y, z };
                        candidates.push(blockPos);
                    }
                }
            }
        }

        console.log(`Broadphase candidates: ${candidates.length}`);

        return candidates;
    }

    /**
     * 
     * @param {Array} candidates 
     * @param {Player} player 
     */
    narrowPhase(candidates, player) {

    }

    /**
     * Visualizes the block the player is colliding with
     * @param {THREE.Object3D} block 
     */
    addCollisionHelper(block) {
        
    }
}