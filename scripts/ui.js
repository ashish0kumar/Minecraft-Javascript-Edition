import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { resources } from './blocks';

export function createUI(world, player) {
    const gui = new GUI();

    const playerFolder = gui.addFolder('Player');
    playerFolder.add(player, 'maxSpeed', 1, 20).name('Max Speed');

    gui.add(world.size, 'width', 8, 128, 1).name('Width');
    gui.add(world.size, 'height', 8, 64, 1).name('Height');

    const terrainFolder = gui.addFolder('Terrain');
    terrainFolder.add(world.param, 'seed', 0, 1000).name('Seed');
    terrainFolder.add(world.param.terrain, 'scale', 10, 100).name('Scale');
    terrainFolder.add(world.param.terrain, 'magnitude', 0, 1).name('Magnitude');
    terrainFolder.add(world.param.terrain, 'offset', 0, 1).name('Offset');

    const resourcesFolder = gui.addFolder('Resources');
    
    resources.forEach(resource => {
        const resourceFolder = resourcesFolder.addFolder(resource.name);
        resourceFolder.add(resource, 'scarcity', 0, 1).name('Scarcity');

        const scaleFolder = resourceFolder.addFolder('Scale');
        scaleFolder.add(resource.scale, 'x', 10, 100).name('X Scale');
        scaleFolder.add(resource.scale, 'y', 10, 100).name('Y Scale');
        scaleFolder.add(resource.scale, 'z', 10, 100).name('X Scale');
    });

    gui.onChange(() => {
        world.generate();
    });
}