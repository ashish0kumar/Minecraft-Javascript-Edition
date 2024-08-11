import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { blocks } from './blocks';

export function createUI(world) {
    const gui = new GUI();

    gui.add(world.size, 'width', 8, 128, 1).name('Width');
    gui.add(world.size, 'height', 8, 64, 1).name('Height');

    const terrainFolder = gui.addFolder('Terrain');
    terrainFolder.add(world.param, 'seed', 0, 1000).name('Seed');
    terrainFolder.add(world.param.terrain, 'scale', 10, 100).name('Scale');
    terrainFolder.add(world.param.terrain, 'magnitude', 0, 1).name('Magnitude');
    terrainFolder.add(world.param.terrain, 'offset', 0, 1).name('Offset');

    const resourcesFolder = gui.addFolder('Resources');
    resourcesFolder.add(blocks.stone, 'scarcity', 0, 1).name('Scarcity');

    const scaleFolder = resourcesFolder.addFolder('Scale');
    scaleFolder.add(blocks.stone.scale, 'x', 10, 100).name('X Scale');
    scaleFolder.add(blocks.stone.scale, 'y', 10, 100).name('Y Scale');
    scaleFolder.add(blocks.stone.scale, 'z', 10, 100).name('Z Scale');
    
    gui.onChange(() => {
        world.generate();
    });
}