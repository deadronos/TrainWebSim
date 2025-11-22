import { create } from 'zustand';
import { MapSystem } from './MapSystem';
import { CitySystem } from './CitySystem';
import { IndustrySystem } from './IndustrySystem';
import { TrainSystem } from './TrainSystem';

export type ToolType = 'none' | 'track' | 'station' | 'demolish' | 'train';

export interface SelectedEntity {
    type: 'city' | 'industry' | 'tile';
    id?: string;
    x?: number;
    y?: number;
}

interface GameState {
    map: MapSystem;
    citySystem: CitySystem;
    industrySystem: IndustrySystem;
    trainSystem: TrainSystem;
    money: number;
    tick: number;
    paused: boolean;
    selectedTool: ToolType;
    selectedEntity: SelectedEntity | null;

    // Actions
    togglePause: () => void;
    advanceTick: () => void;
    setTool: (tool: ToolType) => void;
    setSelectedEntity: (entity: SelectedEntity | null) => void;
    spendMoney: (amount: number) => void;
    saveGame: () => void;
    loadGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => {
    const map = new MapSystem();
    const citySystem = new CitySystem();
    const industrySystem = new IndustrySystem();
    const trainSystem = new TrainSystem();

    // Generate entities on the map
    citySystem.generateCities(map.grid);
    industrySystem.generateIndustries(map.grid);

    return {
        map,
        citySystem,
        industrySystem,
        trainSystem,
        money: 100000,
        tick: 0,
        paused: false,
        selectedTool: 'none',
        selectedEntity: null,

        togglePause: () => set((state) => ({ paused: !state.paused })),
        advanceTick: () => {
            const state = get();
            if (!state.paused) {
                const revenue = state.trainSystem.update(state.map);
                state.industrySystem.update();
                set({
                    tick: state.tick + 1,
                    money: state.money + revenue
                });
            }
        },
        setTool: (tool) => set({ selectedTool: tool }),
        setSelectedEntity: (entity) => set({ selectedEntity: entity }),
        spendMoney: (amount) => set((state) => ({ money: state.money - amount })),

        saveGame: () => {
            const state = get();
            const data = {
                money: state.money,
                tick: state.tick,
                map: state.map.grid,
                cities: state.citySystem.cities,
                industries: state.industrySystem.industries,
                trains: state.trainSystem.trains
            };
            localStorage.setItem('trainWebSim_save', JSON.stringify(data));
            alert('Game Saved!');
        },

        loadGame: () => {
            const saveStr = localStorage.getItem('trainWebSim_save');
            if (saveStr) {
                const data = JSON.parse(saveStr);

                // Re-hydrate systems
                const newMap = new MapSystem();
                newMap.grid = data.map;

                const newCitySystem = new CitySystem();
                newCitySystem.cities = data.cities;

                const newIndustrySystem = new IndustrySystem();
                newIndustrySystem.industries = data.industries;

                const newTrainSystem = new TrainSystem();
                newTrainSystem.trains = data.trains;

                set({
                    money: data.money,
                    tick: data.tick,
                    map: newMap,
                    citySystem: newCitySystem,
                    industrySystem: newIndustrySystem,
                    trainSystem: newTrainSystem,
                    paused: true
                });
                alert('Game Loaded!');
            } else {
                alert('No save found!');
            }
        }
    };
});
