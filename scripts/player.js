import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/Addons.js";
import { World } from "./world";
import { blocks } from "./blocks";
import { Tool } from "./tool";

const CENTER_SCREEN = new THREE.Vector2();

export class Player {
    height = 1.75;
    radius = 0.5;
    maxSpeed = 6;

    jumpSpeed = 10;
    sprinting = false;
    onGround = false;

    input = new THREE.Vector3();
    velocity = new THREE.Vector3();
    #worldVelocity = new THREE.Vector3();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
    controls = new PointerLockControls(this.camera, document.body);
    cameraHelper = new THREE.CameraHelper(this.camera);

    raycaster = new THREE.Raycaster(undefined, undefined, 0, 3);
    selectedCoords = null;
    activeBlockId = blocks.empty.id;

    tool = new Tool();

    /**
     * @param {THREE.Scene} scene 
     */
    constructor(scene) {
        this.position.set(32, 16, 32);
        this.camera.layers.enable(1);
        scene.add(this.camera);
        // scene.add(this.cameraHelper);

        // Hide/show instructions based on pointer controls locking/unlocking
        this.controls.addEventListener('lock', function () {
            document.getElementById('overlay').style.visibility = 'hidden';
        });

        this.controls.addEventListener('unlock', function () {
            document.getElementById('overlay').style.visibility = 'visible';
        });

        this.camera.add(this.tool);

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));

        // Wirefram mesh vizualizing the player's boudning cylinder
        this.boundsHelper = new THREE.Mesh(
            new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
            new THREE.MeshBasicMaterial({ wireframe: true })
        );
        // scene.add(this.boundsHelper);

        const selectionMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.2,
            color: 0xffffaa
        });
        const selectionGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
        this.selectionHelper = new THREE.Mesh(selectionGeometry, selectionMaterial);
        scene.add(this.selectionHelper);

        this.raycaster.layers.set(0);
    }

    /**
     * Returns the velocity of the player in world coordinates
     * @returns {THREE.Vector3}
     */
    get worldVelocity() {
        this.#worldVelocity.copy(this.velocity);
        this.#worldVelocity.applyEuler(new THREE.Euler(0, this.camera.rotation.y, 0));
        return this.#worldVelocity;
    }

    /**
     * Updates the player state
     * @param {World} world 
     */
    update(world) {
        this.updateRaycaster(world);
        this.tool.update();
    }

    /**
     * Update the raycaster use for picking blocks
     * @param {World} world 
     */
    updateRaycaster(world) {
        this.raycaster.setFromCamera(CENTER_SCREEN, this.camera);
        const intersections = this.raycaster.intersectObject(world, true);

        if (intersections.length > 0) {
            const intersection = intersections[0];

            // Get the position of the chunk that the block is contained in
            const chunk = intersection.object.parent;

            // Get transformation matrix of the intersected block
            const blockMatrix = new THREE.Matrix4();
            intersection.object.getMatrixAt(intersection.instanceId, blockMatrix);

            // Extract the position from the block's transformation matrix
            // and store it in selectedCoords
            this.selectedCoords = chunk.position.clone();
            this.selectedCoords.applyMatrix4(blockMatrix);

            // If we are adding a block to the world, move the selection indicator
            // to the nearest adjacent block
            if (this.activeBlockId !== blocks.empty.id) {
                this.selectedCoords.add(intersection.normal);
            }

            this.selectionHelper.position.copy(this.selectedCoords);
            this.selectionHelper.visible = true;
            
        } else {
            this.selectedCoords = null;
            this.selectionHelper.visible = false;
        }
    }

    /**
     * Applies a change in velocity 'dv' that is specified in the world frame
     * @param {THREE.Vector3} dv 
     */
    applyWorldDeltaVelocity(dv) {
        dv.applyEuler(new THREE.Euler(0, -this.camera.rotation.y, 0));
        this.velocity.add(dv);
    }

    applyInputs(dt) {
        if (this.controls.isLocked) {
            this.velocity.x = this.input.x * (this.sprinting ? 1.3 : 1);
            this.velocity.z = this.input.z * (this.sprinting ? 1.3 : 1);
            this.controls.moveRight(this.velocity.x * dt);
            this.controls.moveForward(this.velocity.z * dt);
            this.position.y += this.velocity.y * dt;

            document.getElementById("player-position").innerHTML = this.toString();
        }
    }

    /**
     * Updates the position of the player's bounding cylinder helper
     */
    updateBoundsHelper() {
        this.boundsHelper.position.copy(this.position);
        this.boundsHelper.position.y -= this.height / 2;
    }

    /**
     * Returns the current world position of the player
     * @type {THREE.Vector3}
     */
    get position() {
        return this.camera.position;
    }

    /**
     * @param {KeyboardEvent} event 
     */
    onKeyDown(event) {
        if (!this.controls.isLocked) {
            this.controls.lock();
        }

        switch (event.code) {
            case 'Digit0':
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
            case 'Digit6':
            case 'Digit7':
            case 'Digit8':
                document.getElementById(`toolbar-${this.activeBlockId}`).classList.remove('selected');
                this.activeBlockId = Number(event.key);
                document.getElementById(`toolbar-${this.activeBlockId}`).classList.add('selected');

                // Only show the tool when it is currently active
                this.tool.visible = (this.activeBlockId === 0);
                break;
            case 'KeyW':
                this.input.z = this.maxSpeed;
                break;
            case 'KeyA':
                this.input.x = -this.maxSpeed;
                break;
            case 'KeyS':
                this.input.z = -this.maxSpeed;
                break;
            case 'KeyD':
                this.input.x = this.maxSpeed;
                break;
            case 'Space':
                if (this.onGround) {
                    this.velocity.y += this.jumpSpeed;
                }
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.sprinting = true;
                break;
        }
    }

    /**
     * @param {KeyboardEvent} event 
     */
    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.input.z = 0;
                break;
            case 'KeyA':
                this.input.x = 0;
                break;
            case 'KeyS':
                this.input.z = 0;
                break;
            case 'KeyD':
                this.input.x = 0;
                break;
            case 'KeyR':
                this.position.set(32, 16, 32);
                this.velocity.set(0, 0, 0);
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.sprinting = false;
                break;
        }
    }

    /**
     * Returns player position in a readable string form
     * @returns {string}
     */
    toString() {
        let str = '';
        str += `${this.position.x.toFixed(0)}, `;
        str += `${this.position.y.toFixed(0)}, `;
        str += `${this.position.z.toFixed(0)}`;
        return str;
    }
}