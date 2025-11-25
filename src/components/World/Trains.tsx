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
            meshRef.current.position.set(train.x, 0.4, train.y);

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
        <group ref={meshRef} position={[train.x, 0.4, train.y]}>
            {/* Locomotive body */}
            <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[0.5, 0.35, 0.7]} />
                <meshStandardMaterial color="#1565c0" /> {/* Blue locomotive */}
            </mesh>
            {/* Locomotive cab/top */}
            <mesh position={[0, 0.35, -0.1]}>
                <boxGeometry args={[0.4, 0.2, 0.4]} />
                <meshStandardMaterial color="#0d47a1" /> {/* Darker blue */}
            </mesh>
            {/* Locomotive front/cowcatcher */}
            <mesh position={[0, 0.05, 0.35]}>
                <boxGeometry args={[0.35, 0.15, 0.15]} />
                <meshStandardMaterial color="#ffc107" /> {/* Yellow front */}
            </mesh>
            {/* Wheels (simplified as boxes for simplicity) */}
            <mesh position={[-0.22, -0.08, 0.2]}>
                <boxGeometry args={[0.06, 0.15, 0.15]} />
                <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0.22, -0.08, 0.2]}>
                <boxGeometry args={[0.06, 0.15, 0.15]} />
                <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[-0.22, -0.08, -0.2]}>
                <boxGeometry args={[0.06, 0.15, 0.15]} />
                <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0.22, -0.08, -0.2]}>
                <boxGeometry args={[0.06, 0.15, 0.15]} />
                <meshStandardMaterial color="#222" />
            </mesh>
            {/* Cargo indicator when loaded */}
            {train.cargo && (
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[0.3, 0.15, 0.3]} />
                    <meshStandardMaterial color="#4caf50" /> {/* Green cargo indicator */}
                </mesh>
            )}
        </group>
    );
};

export const Trains: React.FC = () => {
    const trains = useGameStore((state) => state.trainSystem.trains);
    // Subscribe to tick to ensure trains list updates when spawned
    useGameStore((state) => state.tick);

    return (
        <group>
            {trains.map(train => <TrainMesh key={train.id} train={train} />)}
        </group>
    );
};
