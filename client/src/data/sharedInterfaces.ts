export interface Team {
    name: string;
    def: number;
    speed: number;
    mat: number;
    rat: number;
    reactions: number;
    motivation: number;
    skill: number;
    save: number;
    armourFront: number;
    armourSide: number;
    armourTop: number;
    type: string;
    faction: string;
    imgSide: string;
    imgTop: string;
    effects: number|string;
    specials: number|string;
    desc: string;
    order: string;
    weapons: Array<string>|string;
    unit: string;
    transport: number;
    transporting: Array<string>|string;
    nickname: string;
    target: string;
    cross: number;
    points: number;
    height: number;
    width: number;
    game: string;
};

export interface Army {
    name: string;
    faction: string;
    game: string;
    points: number;
    units: Array<any>
};

export interface SavedTeam {
    team: string|undefined; // undefined needed for build army phase. for dropdowns
    crew: string|undefined;
};

export interface SavedUnit {
    name: string;
    teams: Array<SavedTeam>
};

// number|string;