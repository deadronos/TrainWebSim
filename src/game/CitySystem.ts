import { type City, MAP_HEIGHT, MAP_WIDTH, type Tile, TileType } from './types';

export class CitySystem {
    cities: City[] = [];

    generateCities(grid: Tile[][]) {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * MAP_WIDTH);
            const y = Math.floor(Math.random() * MAP_HEIGHT);
            const tile = grid[y][x];

            if (tile.type === TileType.GRASS && !tile.industryId && !tile.cityId) {
                const city: City = {
                    id: `city_${i}`,
                    x,
                    y,
                    name: `City ${i}`,
                    population: 100 + Math.floor(Math.random() * 1000),
                    passengers: 0,
                };

                this.cities.push(city);
                tile.cityId = city.id;
            }
        }
    }
}
