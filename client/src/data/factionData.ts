export interface Faction {
    name: string;
    side: 'allies'|'axis';
    game: 'mid war'|'late war';
};

export const games: Array<string> = [
    'mid war',
    'late war'
];

export const factions: Array<Faction> = [
    {name: "Great Britain", side: "allies", game: "mid war"},
    {name: "USA", side: "allies", game: "mid war"},
    {name: "Germany", side: "axis", game: "mid war"},
    {name: "Italy", side: "axis", game: "mid war"}
];
