import React, { useMemo } from 'react';
import { useGameStore } from '../../game/GameState';
import { MAP_HEIGHT, MAP_WIDTH, TileType } from '../../game/types';

export const Terrain: React.FC = () => {
    const map = useGameStore((state) => state.map);
    // Subscribe to tick to force re-render when tiles change
    const tick = useGameStore((state) => state.tick);

    const tiles = useMemo(() => {
        const t = [];
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const tile = map.getTile(x, y);
                if (tile) {
                    t.push({ ...tile, x, y });
                }
            }
        }
        return t;
    }, [map, tick]);

    return (
        <group>
            {tiles.map((tile) => {
                let color = '#4caf50';
                let height = 0.2;

                switch (tile.type) {
                    case TileType.GRASS:
                        color = '#4caf50';
                        height = 0.2;
                        break;
                    case TileType.WATER:
                        color = '#2196f3';
                        height = 0.1;
                        break;
                    case TileType.FOREST:
                        color = '#2e7d32';
                        height = 0.3;
                        break;
                    case TileType.MOUNTAIN:
                        color = '#795548';
                        height = 1.0;
                        break;
                }

                return (
                    <mesh
                        key={`${tile.x}-${tile.y}`}
                        position={[tile.x, height / 2, tile.y]}
                        onClick={(e) => {
                            e.stopPropagation();
                            const state = useGameStore.getState();
                            const { selectedTool, spendMoney, setSelectedEntity, trainSystem } = state;

                            const realTile = state.map.getTile(tile.x, tile.y);
                            if (!realTile) return;

                            // Handle Building
                            if (selectedTool !== 'none') {
                                if (selectedTool === 'track') {
                                    if (!realTile.hasTrack && realTile.type !== TileType.WATER && realTile.type !== TileType.MOUNTAIN) {
                                        realTile.hasTrack = true;
                                        spendMoney(200);
                                        // Force state update
                                        useGameStore.setState({ tick: state.tick + 1 });
                                    }
                                } else if (selectedTool === 'station') {
                                    // Stations should be buildable on tracks (Transport Tycoon style)
                                    if (!realTile.hasStation && realTile.type !== TileType.WATER && realTile.type !== TileType.MOUNTAIN) {
                                        realTile.hasStation = true;
                                        realTile.hasTrack = true; // Stations include track
                                        spendMoney(2000);
                                        // Force state update
                                        useGameStore.setState({ tick: state.tick + 1 });
                                    }
                                } else if (selectedTool === 'train') {
                                    if (realTile.hasTrack) {
                                        trainSystem.spawnTrain(realTile.x, realTile.y);
                                        spendMoney(5000);
                                        // Force state update for train spawn
                                        useGameStore.setState({ tick: state.tick + 1 });
                                    }
                                } else if (selectedTool === 'demolish') {
                                    let changed = false;
                                    if (realTile.hasTrack) {
                                        realTile.hasTrack = false;
                                        spendMoney(50);
                                        changed = true;
                                    }
                                    if (realTile.hasStation) {
                                        realTile.hasStation = false;
                                        spendMoney(50);
                                        changed = true;
                                    }
                                    if (changed) {
                                        useGameStore.setState({ tick: state.tick + 1 });
                                    }
                                }
                            } else {
                                // Inspect Tool
                                if (realTile.cityId) {
                                    setSelectedEntity({ type: 'city', id: realTile.cityId });
                                } else if (realTile.industryId) {
                                    setSelectedEntity({ type: 'industry', id: realTile.industryId });
                                } else {
                                    setSelectedEntity({ type: 'tile', x: realTile.x, y: realTile.y });
                                }
                            }
                        }}
                    >
                        <boxGeometry args={[1, height, 1]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                );
            })}
        </group>
    );
};
