import React from 'react';
import { useGameStore } from '../game/GameState';

export const InfoPanel: React.FC = () => {
    const selectedEntity = useGameStore((state) => state.selectedEntity);
    const map = useGameStore((state) => state.map);
    const industrySystem = useGameStore((state) => state.industrySystem);
    const citySystem = useGameStore((state) => state.citySystem);

    if (!selectedEntity) return null;

    let content = null;

    if (selectedEntity.type === 'city') {
        const city = citySystem.cities.find(c => c.id === selectedEntity.id);
        if (city) {
            content = (
                <div>
                    <h3>{city.name}</h3>
                    <p>Population: {city.population}</p>
                </div>
            );
        }
    } else if (selectedEntity.type === 'industry') {
        const industry = industrySystem.industries.find(i => i.id === selectedEntity.id);
        if (industry) {
            content = (
                <div>
                    <h3>{industry.name}</h3>
                    <p>Type: {industry.type}</p>
                    <h4>Inventory:</h4>
                    <ul>
                        {Object.entries(industry.inventory).map(([type, amount]) => (
                            <li key={type}>{type}: {Math.floor(amount)}</li>
                        ))}
                    </ul>
                </div>
            );
        }
    } else if (selectedEntity.type === 'tile') {
        // Ensure x and y are defined before calling getTile
        if (selectedEntity.x !== undefined && selectedEntity.y !== undefined) {
            const tile = map.getTile(selectedEntity.x, selectedEntity.y);
            if (tile) {
                content = (
                    <div>
                        <h3>Tile Info</h3>
                        <p>Type: {tile.type}</p>
                        <p>Coordinates: {selectedEntity.x}, {selectedEntity.y}</p>
                        {tile.hasTrack && <p>Has Track</p>}
                        {tile.hasStation && <p>Has Station</p>}
                    </div>
                );
            }
        }
    }

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '250px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            pointerEvents: 'auto',
        }}>
            {content}
            <button
                onClick={() => useGameStore.getState().setSelectedEntity(null)}
                style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}
            >
                Close
            </button>
        </div>
    );
};
