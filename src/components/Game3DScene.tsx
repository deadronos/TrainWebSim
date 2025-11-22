import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Terrain } from './World/Terrain';
import { Entities } from './World/Entities';
import { Trains } from './World/Trains';
import { MAP_WIDTH, MAP_HEIGHT } from '../game/types';

export const Game3DScene: React.FC = () => {
    // Center camera on map
    const cx = MAP_WIDTH / 2;
    const cy = MAP_HEIGHT / 2;

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[cx, 20, cy + 20]} fov={50} />
                <OrbitControls target={[cx, 0, cy]} />

                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1}
                    castShadow
                />

                <Terrain />
                <Entities />
                <Trains />

                {/* Grid Helper for reference */}
                <gridHelper args={[Math.max(MAP_WIDTH, MAP_HEIGHT) * 2, Math.max(MAP_WIDTH, MAP_HEIGHT) * 2]} position={[cx - 0.5, 0, cy - 0.5]} />
            </Canvas>
        </div>
    );
};
