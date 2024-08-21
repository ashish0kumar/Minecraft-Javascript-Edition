import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class ModelLoader {
    loader = new GLTFLoader();

    models = {
        pickaxe: undefined
    };

    /**
     * Loads the 3d model into memory
     * @param {(object) => ()} onLoad 
     */
    loadModels(onLoad) {
        this.loader.load('/public/models/pickaxe.glb', (model) => {
            const mesh = model.scene;
            this.models.pickaxe = mesh;
            onload(this.models);
        })
    }
}