import React, { useMemo } from 'react';
import { useGameStore } from '../../game/GameState';
import { MAP_HEIGHT, MAP_WIDTH } from '../../game/types';

export const Entities: React.FC = () => {
    const map = useGameStore((state) => state.map);

    // We need to rebuild this when map changes (e.g. building tracks)
    const entities = useMemo(() => {
        const rendered = [];
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const tile = map.getTile(x, y);
                if (!tile) continue;

                // Cities
                if (tile.cityId) {
                    rendered.push(
                        <mesh key={`city-${x}-${y}`} position={[x, 0.5, y]}>
                            <boxGeometry args={[0.8, 1, 0.8]} />
                            <meshStandardMaterial color="#ff5722" />
                        </mesh>
                    );
                }

                // Industries
                if (tile.industryId) {
                    rendered.push(
                        <mesh key={`ind-${x}-${y}`} position={[x, 0.5, y]}>
                            <boxGeometry args={[0.8, 0.8, 0.8]} />
                            <meshStandardMaterial color="#9c27b0" />
                        </mesh>
                    );
                }

                // Stations
                if (tile.hasStation) {
                    rendered.push(
                        <mesh key={`station-${x}-${y}`} position={[x, 0.3, y]}>
                            <boxGeometry args={[0.6, 0.2, 0.6]} />
                            <meshStandardMaterial color="#f44336" />
                        </mesh>
                    );
                }

                // Tracks
                if (tile.hasTrack) {
                    // Center piece
                    rendered.push(
                        <mesh key={`track-c-${x}-${y}`} position={[x, 0.11, y]}>
                            <boxGeometry args={[0.3, 0.05, 0.3]} />
                            <meshStandardMaterial color="#555" />
                        </mesh>
                    );

                    // Connections
                    const n = map.getTile(x, y - 1)?.hasTrack;
                    const s = map.getTile(x, y + 1)?.hasTrack;
                    const e = map.getTile(x + 1, y)?.hasTrack;
                    const w = map.getTile(x - 1, y)?.hasTrack;

                    if (n) {
                        rendered.push(<mesh key={`t-n-${x}-${y}`} position={[x, 0.11, y - 0.35]}><boxGeometry args={[0.2, 0.05, 0.7]} /><meshStandardMaterial color="#555" /></mesh>);
                    }
                    if (s) {
                        rendered.push(<mesh key={`t-s-${x}-${y}`} position={[x, 0.11, y + 0.35]}><boxGeometry args={[0.2, 0.05, 0.7]} /><meshStandardMaterial color="#555" /></mesh>);
                    }
                    if (e) {
                        rendered.push(<mesh key={`t-e-${x}-${y}`} position={[x + 0.35, 0.11, y]}><boxGeometry args={[0.7, 0.05, 0.2]} /><meshStandardMaterial color="#555" /></mesh>);
                    }
                    if (w) {
                        rendered.push(<mesh key={`t-w-${x}-${y}`} position={[x - 0.35, 0.11, y]}><boxGeometry args={[0.7, 0.05, 0.2]} /><meshStandardMaterial color="#555" /></mesh>);
                    }

                    // If isolated, draw a default vertical segment? Or just the center is enough for now.
                    if (!n && !s && !e && !w) {
                        rendered.push(<mesh key={`t-iso-${x}-${y}`} position={[x, 0.11, y]}><boxGeometry args={[0.2, 0.05, 0.8]} /><meshStandardMaterial color="#555" /></mesh>);
                    }
                }
            }
        }
        return rendered;
    }, [map, map.grid]); // Re-render when map changes (building)

    return <group>{entities}</group>;
};
