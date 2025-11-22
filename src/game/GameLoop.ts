import { useEffect, useRef } from 'react';
import { useGameStore } from './GameState';

export const useGameLoop = () => {
    const advanceTick = useGameStore((state) => state.advanceTick);
    const paused = useGameStore((state) => state.paused);
    const requestRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);

    const animate = (time: number) => {
        if (lastTimeRef.current !== null) {
            // const deltaTime = time - lastTimeRef.current;
            if (!paused) {
                // Logic tick is handled by setInterval for now
            }
        }
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);

        const tickInterval = setInterval(() => {
            if (!useGameStore.getState().paused) {
                advanceTick();
            }
        }, 100);

        return () => {
            if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
            clearInterval(tickInterval);
        };
    }, [paused, advanceTick]); // Added dependencies
};
