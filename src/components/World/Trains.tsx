import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../game/GameState';
import * as THREE from 'three';

const TrainMesh: React.FC<{ train: any }> = ({ train }) => {
    const meshRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (meshRef.current) {
            // Smooth interpolation could go here, but for now we stick to the game state position
            // Game state x/y are floats, so it should be relatively smooth if tick rate is high enough
            // or if we interpolate between ticks.
            // For now, direct mapping.
            meshRef.current.position.set(train.x, 0.3, train.y);

            // Rotation
            if (train.path.length > 0) {
                const target = train.path[0];
                const dx = target.x - train.x;
                const dy = target.y - train.y;
                const angle = Math.atan2(dx, dy); // In 3D (x, z), atan2(x, y) gives angle from Z axis? 
                // 3D space: x is right, z is down (screen). 
                // atan2(dx, dy) -> 0 when dx=0, dy=1 (moving down Z).
                meshRef.current.rotation.y = angle;
            }
        }
    });

    return (
        <group ref={meshRef} position={[train.x, 0.3, train.y]}>
            {/* Body */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.6, 0.4, 0.8]} />
                <meshStandardMaterial color="#ffeb3b" />
            </mesh>
            {/* Engine Front */}
            <mesh position={[0, 0.2, 0.3]}>
                <boxGeometry args={[0.4, 0.3, 0.2]} />
                <meshStandardMaterial color="#fbc02d" />
            </mesh>
        </group>
    );
};

export const Trains: React.FC = () => {
    const trains = useGameStore((state) => state.trainSystem.trains);

    return (
        <group>
            {trains.map(train => <TrainMesh key={train.id} train={train} />)}
        </group>
    );
};
