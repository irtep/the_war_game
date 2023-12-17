export interface Team {
    name: string;
    def: number;
    speed: number; // this is max speed
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
    order: any;
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
    // for gaming:
    x?: number,
    y?: number,
    a?: number, // angle
    disabled?: boolean,
    tacticalNumber?: string,
    kills?: Array<string>,
    uuid?: string
};

export interface Army {
    user: string;
    name: string;
    faction: string;
    game: string;
    points: number;
    units: any[]; // Adjust the type of 'units' array as needed
    [key: string]: any; // Index signature allowing any string key

};

export interface GameObject {
    status: 'setup'  | 'preBattle'  | 'battle'  | 'postBattle';
    attacker: any,
    defender: any,
    terrain: any,
    player?: '' | 'attacker' | 'defender';
    opponent?: '' | 'attacker' | 'defender';
    mission?: string
};

export interface ArmyToSend {
    user: string;
    name: string;
    faction: string;
    game: string;
    points: number;
    units: string;
};

export interface SavedTeam {
    team: string | undefined; // undefined needed for build army phase. for dropdowns
    crew: string | undefined;
    points: number;
};

export interface SavedUnit {
    id: number;
    name: string;
    teams: Array<SavedTeam>;
    points: number
};

export interface Selected {
    id: Array<string | number>;
    type: string;
    all?: any;
};

// number|string;