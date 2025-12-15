import { createNoise2D } from 'simplex-noise';
import { MAP_HEIGHT, MAP_WIDTH, type Tile, TileType } from './types';

export class MapSystem {
    grid: Tile[][];

    constructor() {
        this.grid = this.generateMap();
    }

    private generateMap(): Tile[][] {
        const grid: Tile[][] = [];
        const noise2D = createNoise2D();

        for (let y = 0; y < MAP_HEIGHT; y++) {
            const row: Tile[] = [];
            for (let x = 0; x < MAP_WIDTH; x++) {
                // Use noise for terrain generation
                // Scale coordinates for noise
                const scale = 0.1;
                const value = noise2D(x * scale, y * scale);

                let type: TileType = TileType.GRASS;

                if (value < -0.3) type = TileType.WATER;
                else if (value > 0.4) type = TileType.FOREST;
                else if (value > 0.7) type = TileType.MOUNTAIN;

                row.push({
                    x,
                    y,
                    type,
                    hasTrack: false,
                    hasStation: false,
                    hasDepot: false,
                });
            }
            grid.push(row);
        }
        return grid;
    }

    getTile(x: number, y: number): Tile | null {
        if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return null;
        return this.grid[y][x];
    }

    getNeighborsWithTrack(x: number, y: number): Tile[] {
        const neighbors = [
            { x, y: y - 1 },
            { x, y: y + 1 },
            { x: x - 1, y },
            { x: x + 1, y },
        ];

        return neighbors
            .map((n) => this.getTile(n.x, n.y))
            .filter((t): t is Tile => t !== null && t.hasTrack);
    }
}
