import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../game/GameState';
import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE, TileType } from '../game/types';

export const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const map = useGameStore((state) => state.map);
    const tick = useGameStore((state) => state.tick);
    const selectedTool = useGameStore((state) => state.selectedTool);
    const spendMoney = useGameStore((state) => state.spendMoney);
    const setSelectedEntity = useGameStore((state) => state.setSelectedEntity);

    // Camera state
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        // Apply camera transform
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);

        // Draw visible tiles
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const tile = map.getTile(x, y);
                if (!tile) continue;

                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;

                // Draw Terrain
                switch (tile.type) {
                    case TileType.GRASS:
                        ctx.fillStyle = '#4caf50';
                        break;
                    case TileType.WATER:
                        ctx.fillStyle = '#2196f3';
                        break;
                    case TileType.FOREST:
                        ctx.fillStyle = '#2e7d32';
                        break;
                    case TileType.MOUNTAIN:
                        ctx.fillStyle = '#795548';
                        break;
                }
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

                // Draw Tracks
                if (tile.hasTrack) {
                    ctx.strokeStyle = '#555';
                    ctx.lineWidth = 6;
                    ctx.lineCap = 'round';
                    ctx.beginPath();

                    // Check neighbors
                    const n = map.getTile(x, y - 1)?.hasTrack;
                    const s = map.getTile(x, y + 1)?.hasTrack;
                    const e = map.getTile(x + 1, y)?.hasTrack;
                    const w = map.getTile(x - 1, y)?.hasTrack;

                    const cx = px + TILE_SIZE / 2;
                    const cy = py + TILE_SIZE / 2;

                    // Default to vertical if no neighbors or isolated
                    if (!n && !s && !e && !w) {
                        ctx.moveTo(cx, py);
                        ctx.lineTo(cx, py + TILE_SIZE);
                    } else {
                        if (n) { ctx.moveTo(cx, cy); ctx.lineTo(cx, py); }
                        if (s) { ctx.moveTo(cx, cy); ctx.lineTo(cx, py + TILE_SIZE); }
                        if (e) { ctx.moveTo(cx, cy); ctx.lineTo(px + TILE_SIZE, cy); }
                        if (w) { ctx.moveTo(cx, cy); ctx.lineTo(px, cy); }

                        // Special case for straight lines to look continuous
                        if (n && s && !e && !w) {
                            ctx.moveTo(cx, py); ctx.lineTo(cx, py + TILE_SIZE);
                        }
                        if (!n && !s && e && w) {
                            ctx.moveTo(px, cy); ctx.lineTo(px + TILE_SIZE, cy);
                        }
                    }
                    ctx.stroke();

                    // Draw sleepers (simple lines across)
                    ctx.strokeStyle = '#3e2723';
                    ctx.lineWidth = 2;
                    // ... (sleepers logic omitted for simplicity for now)
                }

                // Draw Stations
                if (tile.hasStation) {
                    ctx.fillStyle = '#f44336'; // Red for stations
                    ctx.fillRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
                }

                // Draw Entities
                if (tile.cityId) {
                    ctx.fillStyle = '#ff5722'; // Orange for cities
                    ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                } else if (tile.industryId) {
                    ctx.fillStyle = '#9c27b0'; // Purple for industries
                    ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                }

                // Draw Grid Lines
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
            }
        }

        // Draw Trains
        const trainSystem = useGameStore.getState().trainSystem;
        trainSystem.trains.forEach((train) => {
            const px = train.x * TILE_SIZE;
            const py = train.y * TILE_SIZE;

            ctx.save();
            ctx.translate(px + TILE_SIZE / 2, py + TILE_SIZE / 2);

            // Calculate rotation
            let angle = 0;
            if (train.path.length > 0) {
                const target = train.path[0];
                const dx = target.x - train.x;
                const dy = target.y - train.y;
                angle = Math.atan2(dy, dx);
            }
            ctx.rotate(angle);

            // Draw Train Body
            ctx.fillStyle = '#ffeb3b'; // Yellow
            ctx.fillRect(-TILE_SIZE / 3, -TILE_SIZE / 6, TILE_SIZE * 0.8, TILE_SIZE / 3);

            // Draw Engine Front
            ctx.fillStyle = '#fbc02d'; // Darker Yellow
            ctx.fillRect(TILE_SIZE / 6, -TILE_SIZE / 6, TILE_SIZE / 6, TILE_SIZE / 3);

            // Draw Wheels
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-TILE_SIZE / 4, -TILE_SIZE / 6, 3, 0, Math.PI * 2);
            ctx.arc(TILE_SIZE / 4, -TILE_SIZE / 6, 3, 0, Math.PI * 2);
            ctx.arc(-TILE_SIZE / 4, TILE_SIZE / 6, 3, 0, Math.PI * 2);
            ctx.arc(TILE_SIZE / 4, TILE_SIZE / 6, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        ctx.restore();

    }, [map, tick, offset, zoom]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastMouse({ x: e.clientX, y: e.clientY });

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Calculate grid coordinates
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const wx = (mx / zoom) - offset.x;
        const wy = (my / zoom) - offset.y;

        const tx = Math.floor(wx / TILE_SIZE);
        const ty = Math.floor(wy / TILE_SIZE);

        const tile = map.getTile(tx, ty);

        // Handle Building
        if (selectedTool !== 'none') {
            if (tile) {
                if (selectedTool === 'track') {
                    if (!tile.hasTrack && tile.type !== TileType.WATER && tile.type !== TileType.MOUNTAIN) {
                        tile.hasTrack = true;
                        spendMoney(200);
                    }
                } else if (selectedTool === 'station') {
                    if (!tile.hasStation && !tile.hasTrack && tile.type === TileType.GRASS) {
                        tile.hasStation = true;
                        spendMoney(2000);
                    }
                } else if (selectedTool === 'train') {
                    if (tile.hasTrack) {
                        // Ensure we don't spawn two trains on same spot (simple check)
                        const trainSystem = useGameStore.getState().trainSystem;
                        const existingTrain = trainSystem.trains.find(t => Math.round(t.x) === tx && Math.round(t.y) === ty);

                        if (!existingTrain) {
                            trainSystem.spawnTrain(tx, ty);
                            spendMoney(5000);
                        }
                    }
                } else if (selectedTool === 'demolish') {
                    if (tile.hasTrack) {
                        tile.hasTrack = false;
                        spendMoney(50);
                    }
                    if (tile.hasStation) {
                        tile.hasStation = false;
                        spendMoney(50);
                    }
                }
            }
        } else {
            // Inspect Tool
            if (tile) {
                if (tile.cityId) {
                    setSelectedEntity({ type: 'city', id: tile.cityId });
                } else if (tile.industryId) {
                    setSelectedEntity({ type: 'industry', id: tile.industryId });
                } else {
                    setSelectedEntity({ type: 'tile', x: tx, y: ty });
                }
            } else {
                setSelectedEntity(null);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastMouse({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        const zoomSensitivity = 0.001;
        const newZoom = Math.max(0.1, Math.min(5, zoom - e.deltaY * zoomSensitivity));
        setZoom(newZoom);
    };

    return (
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ display: 'block' }}
        />
    );
};
