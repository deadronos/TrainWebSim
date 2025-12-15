import { MapSystem } from './MapSystem';
import { type Train } from './types';

export class TrainSystem {
    trains: Train[] = [];

    spawnTrain(x: number, y: number) {
        const train: Train = {
            id: `train_${Date.now()}`,
            x,
            y,
            speed: 0.1, // Faster speed for fun
            path: [],
            cargo: null,
            state: 'IDLE',
            waitTimer: 0,
        };
        this.trains.push(train);
    }

    update(map: MapSystem): number {
        let totalRevenue = 0;
        let totalRunningCost = 0;

        this.trains.forEach((train) => {
            totalRunningCost += 1;

            if (train.state === 'IDLE') {
                // If idle, look for a destination
                // For now, let's just pick a random station or different track segment if we don't have orders
                if (train.path.length === 0) {
                    this.findRandomPath(train, map);
                } else {
                    train.state = 'MOVING';
                }
            } else if (train.state === 'MOVING') {
                this.moveTrain(train);
                // Check if reached destination (path empty)
                if (train.path.length === 0) {
                    train.state = 'LOADING'; // Or Unloading
                    train.waitTimer = 50; // Wait 50 ticks
                }
            } else if (train.state === 'LOADING' || train.state === 'UNLOADING') {
                train.waitTimer--;
                if (train.waitTimer <= 0) {
                    // Done waiting, interaction happen?
                    this.handleStationInteraction(train, map);
                    train.state = 'IDLE';
                }
            }
        });
        return totalRevenue - totalRunningCost; // Only returning costs here, revenue calculation needs to be better integrated
    }

    private moveTrain(train: Train) {
        if (train.path.length === 0) return;

        const target = train.path[0];
        const dx = target.x - train.x;
        const dy = target.y - train.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < train.speed) {
            // Reached tile center
            train.x = target.x;
            train.y = target.y;
            train.path.shift();
        } else {
            // Move strictly towards center of next tile
            // Normalize
            train.x += (dx / dist) * train.speed;
            train.y += (dy / dist) * train.speed;
        }
    }

    private findRandomPath(train: Train, map: MapSystem) {
        // Simple BFS to find a random tile within X steps
        // Or finding a specific station. Let's find ANY other station or just a random track tile some distance away.

        const startNode = map.getTile(Math.round(train.x), Math.round(train.y));
        if (!startNode || !startNode.hasTrack) return; // Train off track!

        // BFS
        const queue: { x: number; y: number; path: { x: number, y: number }[] }[] = [{ x: startNode.x, y: startNode.y, path: [] }];
        const visited = new Set<string>();
        visited.add(`${startNode.x},${startNode.y}`);

        let foundPath: { x: number, y: number }[] = [];
        let iterations = 0;

        // Limiting search depth for performance
        while (queue.length > 0 && iterations < 500) {
            const current = queue.shift()!;
            iterations++;

            // Stop if we found a "destination" - for now, just 10-20 steps away to simulate movement
            if (current.path.length > 10 && Math.random() < 0.1) {
                foundPath = current.path;
                break;
            }

            const neighbors = map.getNeighborsWithTrack(current.x, current.y);
            // Randomize neighbors to get variety
            neighbors.sort(() => Math.random() - 0.5);

            for (const n of neighbors) {
                const key = `${n.x},${n.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({
                        x: n.x,
                        y: n.y,
                        path: [...current.path, { x: n.x, y: n.y }]
                    });
                }
            }
        }

        if (foundPath.length > 0) {
            train.path = foundPath;
        }
    }

    private handleStationInteraction(train: Train, map: MapSystem) {
        const tile = map.getTile(Math.round(train.x), Math.round(train.y));
        if (tile && tile.hasStation) {
            // Logic for loading/unloading
            // For now, magic money if at station
            if (train.cargo) {
                // Sell
                train.cargo = null;
                // Revenue handled by returning value? We need reference to game state or return it
            } else {
                // Load
                train.cargo = { type: 'goods', amount: 10 };
            }
        }
    }
}
