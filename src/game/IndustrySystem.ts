import { type Industry, IndustryType, MAP_HEIGHT, MAP_WIDTH, type Tile, TileType } from './types';

export class IndustrySystem {
    industries: Industry[] = [];

    generateIndustries(grid: Tile[][]) {
        // Simple random generation
        const count = 20;
        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * MAP_WIDTH);
            const y = Math.floor(Math.random() * MAP_HEIGHT);
            const tile = grid[y][x];

            if (tile.type !== TileType.WATER && !tile.industryId && !tile.cityId) {
                const types = Object.values(IndustryType);
                const type = types[Math.floor(Math.random() * types.length)];

                const industry: Industry = {
                    id: `ind_${i}`,
                    type,
                    x,
                    y,
                    name: `${type} ${i}`,
                    inventory: {},
                };

                this.industries.push(industry);
                tile.industryId = industry.id;
            }
        }
    }

    update() {
        this.industries.forEach((ind) => {
            // Generate cargo based on type
            // For simplicity, all industries generate "goods" for now, or specific types
            const productionRate = 1; // Units per tick

            let cargoType = 'goods';
            if (ind.type === IndustryType.COAL_MINE) cargoType = 'coal';
            if (ind.type === IndustryType.IRON_MINE) cargoType = 'iron';
            if (ind.type === IndustryType.FARM) cargoType = 'grain';
            if (ind.type === IndustryType.LUMBERYARD) cargoType = 'wood';
            if (ind.type === IndustryType.FACTORY) cargoType = 'goods'; // Factory could consume raw materials

            if (!ind.inventory[cargoType]) ind.inventory[cargoType] = 0;
            ind.inventory[cargoType] += productionRate;

            // Cap inventory
            if (ind.inventory[cargoType] > 1000) ind.inventory[cargoType] = 1000;
        });
    }
}
