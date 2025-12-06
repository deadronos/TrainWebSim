
import { MapSystem } from './MapSystem';
import { TileType } from './types';
import assert from 'assert';

console.log("Running MapSystem tests...");

const mapSystem = new MapSystem();
let mountains = 0;
let forests = 0;

for (let y = 0; y < mapSystem.grid.length; y++) {
    for (let x = 0; x < mapSystem.grid[y].length; x++) {
        const tile = mapSystem.grid[y][x];
        if (tile.type === TileType.MOUNTAIN) mountains++;
        if (tile.type === TileType.FOREST) forests++;
    }
}

// We expect some mountains given the noise generation
assert(mountains > 0, "Map should contain mountains");
assert(forests > 0, "Map should contain forests");

console.log("MapSystem tests passed!");
