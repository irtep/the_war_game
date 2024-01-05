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
    effects: string; // not in use at the moment, but maybe later
    specials: string;
    desc: string;
    order: any;
    weapons: Array<string>|string;
    combatWeapons?: Array<string>;
    unit: string;
    transport: number;
    transporting: Array<string>|string;
    nickname: string;
    target: any;
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
    uuid?: string,
    targetAngle?: number,
    moveToTarget?: any,
    disable?: any,
    shaken?: boolean,
    stunned?: boolean,
    motorPower?: number,
    currentSpeed?: number,
    pinned?: boolean,
    foxhole?: boolean
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

export interface MousePos {
    x: string | number,
    y: string | number
  }

export interface GameObject {
    status: 'setup'  | 'preBattle'  | 'battle'  | 'postBattle';
    attacker: any,
    defender: any,
    terrain: any,
    player?: '' | 'attacker' | 'defender';
    opponent?: '' | 'attacker' | 'defender';
    mission?: string,
    attacksToResolve?: any[],
    bombsToResolve?: any[],
    smokes?: any[]
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

export interface CollisionResponse {
    collision: boolean;
    withWhat: string;
    id?: string | undefined;
  };
// number|string;

export interface AttacksBox {
    inRange: boolean;
    hasLOS: boolean;
    attacks: any[];
    inCover: boolean;
    distance: number;
  }

  export interface BombBox {
    inRange: boolean;
    observer: boolean;
    attacks: any[];
    inCover: boolean;
    distance: number;
  }  