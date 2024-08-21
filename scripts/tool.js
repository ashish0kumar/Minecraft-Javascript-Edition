import * as THREE from 'three';

export class Tool extends THREE.Group {
    // Whether or not the tool is currently animating
    animate = false;
    // Amplitude of the tool animation
    animationAmplitude = 0.5;
    // Duration of the animation
    animationDuration = 500;
    // Start time for the animation
    animationStart = 0;
    // Speed of the tool animation in rad/s
    animationSpeed = 0.025;
    // Currently active animation
    animation = undefined;
    // The 3d mesh of the actual tool
    toolMesh = undefined;
    
    get animationTime() {
        return performance.now() - this.animationStart;
    }

    /**
     * Trigger a new animation of the tool
     */
    startAnimation() {
        if (this.animate) return;

        this.animate = true;
        this.animationStart = performance.now();

        // Stop existing animation
        clearTimeout(this.animate);

        // Set a timer to stop the animation after a specific duration
        this.animation = setTimeout(() => {
            this.animate = false;
            this.toolMesh.rotation.y = 0;
        }, this.animationDuration);
    }

    /**
     * Updates the tool animationn state
     */
    update() {
        // Oscillate the tool back and forth
        if (this.animate && this.toolMesh) {
            this.toolMesh.rotation.y = this.animationAmplitude * 
            Math.sin(this.animationTime * this.animationSpeed);
        }
    }

    /**
     * Sets the active tool mesh
     * @param {THREE.Mesh} mesh 
     */
    setMesh(mesh) {
        this.clear();

        this.toolMesh = mesh;
        this.add(this.toolMesh);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        this.position.set(1, -0.4, -0.5);
        this.scale.set(0.5, 0.5, 0.5);
        this.rotation.z = Math.PI / 2;
        this.rotation.y = Math.PI + 0.2;
    }
}