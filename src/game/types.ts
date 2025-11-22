export const TileType = {
    GRASS: 'grass',
    WATER: 'water',
    FOREST: 'forest',
    MOUNTAIN: 'mountain',
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

export const IndustryType = {
    FACTORY: 'factory',
    LUMBERYARD: 'lumberyard',
    FARM: 'farm',
    COAL_MINE: 'coal_mine',
    IRON_MINE: 'iron_mine',
} as const;

export type IndustryType = typeof IndustryType[keyof typeof IndustryType];

export interface Industry {
    id: string;
    type: IndustryType;
    x: number;
    y: number;
    name: string;
    inventory: Record<string, number>; // Cargo storage
}

export interface City {
    id: string;
    x: number;
    y: number;
    name: string;
    population: number;
    passengers: number;
}

export interface Tile {
    x: number;
    y: number;
    type: TileType;
    hasTrack: boolean;
    hasStation: boolean;
    hasDepot: boolean;
    ownerId?: string;
    industryId?: string;
    cityId?: string;
}

export interface Train {
    id: string;
    x: number; // Grid coordinates (float for smooth movement)
    y: number;
    speed: number;
    path: { x: number; y: number }[]; // List of tile coordinates
    cargo: { type: string; amount: number } | null;
    targetStationId?: string;
}

export const TILE_SIZE = 32;
export const MAP_WIDTH = 64;
export const MAP_HEIGHT = 64;
