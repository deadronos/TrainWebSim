import { MapSystem } from './MapSystem';
import { type Train } from './types';

export class TrainSystem {
    trains: Train[] = [];

    spawnTrain(x: number, y: number) {
        const train: Train = {
            id: `train_${Date.now()}`,
            x,
            y,
            speed: 0.05, // Tiles per tick
            path: [],
            cargo: null,
        };
        this.trains.push(train);
    }

    update(map: MapSystem): number {
        let totalRevenue = 0;
        let totalRunningCost = 0;

        this.trains.forEach((train) => {
            // Running cost
            totalRunningCost += 1; // $1 per tick per train

            if (train.path.length > 0) {
                const target = train.path[0];
                const dx = target.x - train.x;
                const dy = target.y - train.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < train.speed) {
                    // Reached target
                    train.x = target.x;
                    train.y = target.y;
                    train.path.shift();

                    // Handle Station Interaction
                    const tile = map.getTile(train.x, train.y);
                    if (tile && tile.hasStation) {
                        // Unload Cargo
                        if (train.cargo) {
                            // Revenue based on distance (simplified: fixed amount for now, but higher)
                            const revenue = train.cargo.amount * 20; // $20 per unit
                            totalRevenue += revenue;
                            train.cargo = null;
                        }

                        // Load Cargo
                        if (!train.cargo && tile.industryId) {
                            // Simple logic: load 'goods' if at an industry
                            train.cargo = { type: 'goods', amount: 10 };
                        }
                    }

                } else {
                    // Move towards target
                    train.x += (dx / dist) * train.speed;
                    train.y += (dy / dist) * train.speed;
                }
            } else {
                // No path, find random neighbor with track
                const neighbors = [
                    { x: Math.round(train.x) + 1, y: Math.round(train.y) },
                    { x: Math.round(train.x) - 1, y: Math.round(train.y) },
                    { x: Math.round(train.x), y: Math.round(train.y) + 1 },
                    { x: Math.round(train.x), y: Math.round(train.y) - 1 },
                ];

                const validNeighbors = neighbors.filter((n) => {
                    const tile = map.getTile(n.x, n.y);
                    return tile && tile.hasTrack;
                });

                if (validNeighbors.length > 0) {
                    // Simple random walk for now
                    const next = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
                    train.path.push(next);
                }
            }
        });
        return totalRevenue - totalRunningCost;
    }
}
