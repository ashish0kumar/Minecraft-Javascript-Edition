import * as THREE from 'three';

export class Tool extends THREE.Group {
    // Whether or not the tool is currently animating
    animate = false;
    // Start time for animation
    animationStart = 0;
    // Speed of the tool animation in rad/s
    animationSpeed = 0.025;
    // Currently active animation
    animation = undefined;
    // The 3d mesh of the actual tool
    toolMesh = undefined;
    
    /**
     * Sets the active tool mesh
     * @param {THREE.Mesh} mesh 
     */
    setMesh(mesh) {
        this.clear();
        this.add(mesh);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        this.position.set(0.6, -0.3, -0.5);
        this.scale.set(0.5, 0.5, 0.5);
        this.rotation.z = Math.PI / 2;
        this.rotation.y = Math.PI + 0.2;
    }
}