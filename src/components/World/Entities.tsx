import React, { useMemo } from 'react';
import { useGameStore } from '../../game/GameState';
import { MAP_HEIGHT, MAP_WIDTH } from '../../game/types';

export const Entities: React.FC = () => {
    const map = useGameStore((state) => state.map);
    // Subscribe to tick to force re-render when game state changes (tracks, stations built)
    const tick = useGameStore((state) => state.tick);

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

                // Stations - render prominently above tracks
                if (tile.hasStation) {
                    // Station platform
                    rendered.push(
                        <mesh key={`station-${x}-${y}`} position={[x, 0.35, y]}>
                            <boxGeometry args={[0.9, 0.15, 0.9]} />
                            <meshStandardMaterial color="#e53935" /> {/* Red platform */}
                        </mesh>
                    );
                    // Station building
                    rendered.push(
                        <mesh key={`station-bld-${x}-${y}`} position={[x, 0.6, y]}>
                            <boxGeometry args={[0.5, 0.4, 0.5]} />
                            <meshStandardMaterial color="#b71c1c" /> {/* Dark red building */}
                        </mesh>
                    );
                }

                // Tracks - render above terrain (y=0.25 to be above grass at y=0.1)
                if (tile.hasTrack) {
                    // Track base/ballast
                    rendered.push(
                        <mesh key={`track-base-${x}-${y}`} position={[x, 0.22, y]}>
                            <boxGeometry args={[0.9, 0.08, 0.9]} />
                            <meshStandardMaterial color="#8B7355" /> {/* Brown ballast */}
                        </mesh>
                    );

                    // Connections - draw rails based on neighbors
                    const n = map.getTile(x, y - 1)?.hasTrack || map.getTile(x, y - 1)?.hasStation;
                    const s = map.getTile(x, y + 1)?.hasTrack || map.getTile(x, y + 1)?.hasStation;
                    const e = map.getTile(x + 1, y)?.hasTrack || map.getTile(x + 1, y)?.hasStation;
                    const w = map.getTile(x - 1, y)?.hasTrack || map.getTile(x - 1, y)?.hasStation;

                    // Rails (dark metallic color)
                    const railColor = "#333";
                    const railHeight = 0.28;

                    if (n || s) {
                        // Vertical rails
                        rendered.push(<mesh key={`t-rail-l-${x}-${y}`} position={[x - 0.2, railHeight, y]}><boxGeometry args={[0.08, 0.06, 0.95]} /><meshStandardMaterial color={railColor} metalness={0.8} roughness={0.3} /></mesh>);
                        rendered.push(<mesh key={`t-rail-r-${x}-${y}`} position={[x + 0.2, railHeight, y]}><boxGeometry args={[0.08, 0.06, 0.95]} /><meshStandardMaterial color={railColor} metalness={0.8} roughness={0.3} /></mesh>);
                    }
                    if (e || w) {
                        // Horizontal rails
                        rendered.push(<mesh key={`t-rail-t-${x}-${y}`} position={[x, railHeight, y - 0.2]}><boxGeometry args={[0.95, 0.06, 0.08]} /><meshStandardMaterial color={railColor} metalness={0.8} roughness={0.3} /></mesh>);
                        rendered.push(<mesh key={`t-rail-b-${x}-${y}`} position={[x, railHeight, y + 0.2]}><boxGeometry args={[0.95, 0.06, 0.08]} /><meshStandardMaterial color={railColor} metalness={0.8} roughness={0.3} /></mesh>);
                    }

                    // If isolated track, draw both directions
                    if (!n && !s && !e && !w) {
                        rendered.push(<mesh key={`t-rail-l-${x}-${y}`} position={[x - 0.2, railHeight, y]}><boxGeometry args={[0.08, 0.06, 0.95]} /><meshStandardMaterial color={railColor} metalness={0.8} roughness={0.3} /></mesh>);
                        rendered.push(<mesh key={`t-rail-r-${x}-${y}`} position={[x + 0.2, railHeight, y]}><boxGeometry args={[0.08, 0.06, 0.95]} /><meshStandardMaterial color={railColor} metalness={0.8} roughness={0.3} /></mesh>);
                    }
                }
            }
        }
        return rendered;
    }, [map, tick]); // Re-render when map changes (building) - tick forces update

    return <group>{entities}</group>;
};
