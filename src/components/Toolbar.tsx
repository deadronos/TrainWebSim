import React from 'react';
import { type ToolType, useGameStore } from '../game/GameState';

export const Toolbar: React.FC = () => {
    const selectedTool = useGameStore((state) => state.selectedTool);
    const setTool = useGameStore((state) => state.setTool);

    const tools: { id: ToolType; label: string }[] = [
        { id: 'none', label: 'Inspect' },
        { id: 'track', label: 'Build Track ($200)' },
        { id: 'station', label: 'Build Station ($2000)' },
        { id: 'train', label: 'Buy Train ($5000)' },
        { id: 'demolish', label: 'Demolish ($50)' },
    ];

    return (
        <div className="toolbar" style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            gap: '10px',
            pointerEvents: 'auto',
        }}>
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => setTool(tool.id)}
                    style={{
                        padding: '8px 16px',
                        background: selectedTool === tool.id ? '#4caf50' : '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {tool.label}
                </button>
            ))}
        </div>
    );
};
