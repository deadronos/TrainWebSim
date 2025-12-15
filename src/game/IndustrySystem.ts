import { type Industry, IndustryType, MAP_HEIGHT, MAP_WIDTH, type Tile, TileType } from './types';

export class IndustrySystem {
    industries: Industry[] = [];

    generateIndustries(grid: Tile[][]) {
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
                    inputBuffer: {},
                    outputBuffer: {},
                };

                this.industries.push(industry);
                tile.industryId = industry.id;
            }
        }
    }

    update() {
        this.industries.forEach((ind) => {
            const productionRate = 1;

            // Simple Production Logic
            // In a real game, this would be data-driven.
            switch (ind.type) {
                case IndustryType.COAL_MINE:
                    this.produce(ind, 'coal', productionRate);
                    break;
                case IndustryType.IRON_MINE:
                    this.produce(ind, 'iron', productionRate);
                    break;
                case IndustryType.LUMBERYARD:
                    this.produce(ind, 'wood', productionRate);
                    break;
                case IndustryType.FARM:
                    this.produce(ind, 'grain', productionRate);
                    break;
                case IndustryType.FACTORY:
                    // Factories need Steel or something? 
                    // Let's say Factory needs Iron + Coal = Goods (Simplified Steel Mill + Factory)
                    // Or just generic Goods from nothing for now if no inputs?
                    // Let's make it consume: Needs 1 Iron -> Produces 1 Goods
                    if (this.consume(ind, 'iron', 1)) {
                        this.produce(ind, 'goods', 5); // High value
                    }
                    break;
            }
        });
    }

    private produce(ind: Industry, cargoType: string, amount: number) {
        if (!ind.outputBuffer[cargoType]) ind.outputBuffer[cargoType] = 0;
        ind.outputBuffer[cargoType] = Math.min(ind.outputBuffer[cargoType] + amount, 1000);
    }

    private consume(ind: Industry, cargoType: string, amount: number): boolean {
        if (!ind.inputBuffer[cargoType] || ind.inputBuffer[cargoType] < amount) return false;
        ind.inputBuffer[cargoType] -= amount;
        return true;
    }
}
