export interface ReadyTeam {
    name: string;
    exp: string;
    points: number;
};

export interface ReadyUnit {
    name: string;
    teams: ReadyTeam[];
    points: number;
    desc: string;
};

// ready units like hq, platoons etc.
// points will be fullfilled from database and from faction data (exp)

// Desert Rats
export const desertRatsUnits: ReadyUnit[] = [
    {
        name: 'Sherman HQ',
        teams: [
            {
                name: 'Sherman M4A1 HQ',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Sherman M4A1 HQ',
                exp: 'veteran',
                points: 0
            }
        ],
        points: 0,
        desc: 'A HQ unit with two Shermans.'
    },
    {
        name: 'Tank HQ',
        teams: [
            {
                name: 'Sherman M4A1 HQ',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Grant HQ',
                exp: 'veteran',
                points: 0
            }
        ],
        points: 0,
        desc: 'A HQ unit with tanks. Containing Sherman and Grant.'
    },
    {
        name: 'Rifle HQ',
        teams: [
            {
                name: 'Rifle company HQ',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Rifle company HQ',
                exp: 'veteran',
                points: 0
            },
        ],
        points: 0,
        desc: 'A HQ unit with tank'
    },
    {
        name: 'Rifle platoon (7 teams)',
        teams: [
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Boys AT-rifle team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '2-inch mortar team',
                exp: 'veteran',
                points: 0
            }
        ],
        points: 0,
        desc: 'A good solid infantry unit, with Boys at-rifle and 2-inch mortar. Very good in close combat.'
    },
    {
        name: 'Rifle platoon (9 teams)',
        teams: [
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Bren & SMLE team',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Boys AT-rifle team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '2-inch mortar team',
                exp: 'veteran',
                points: 0
            }
        ],
        points: 0,
        desc: 'A good solid infantry unit, with Boys at-rifle and 2-inch mortar. Very good in close combat.'
    },
    {
        name: '3-inch mortar platoon (3 pipes)',
        teams: [
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
        ],
        points: 0,
        desc: 'A good infantry support, that can fire smoke bombardment too'
    },
    {
        name: '3-inch mortar platoon (4 pipes)',
        teams: [
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
        ],
        points: 0,
        desc: 'A good infantry support, that can fire smoke bombardment too'
    },
    {
        name: '3-inch mortar platoon (6 pipes)',
        teams: [
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '3-inch mortar team',
                exp: 'veteran',
                points: 0
            }
        ],
        points: 0,
        desc: 'A good infantry support, that can fire smoke bombardment too'
    },
    {
        name: '6 pdr anti-tank platoon (2 pipes)',
        teams: [
            {
                name: '6 pdr anti-tank team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '6 pdr anti-tank team',
                exp: 'veteran',
                points: 0
            }
        ],
        points: 0,
        desc: 'A good anti-tank gun. Anything else than tiger does not want to take this to frontal armour.'
    },
    {
        name: '6 pdr anti-tank platoon (3 pipes)',
        teams: [
            {
                name: '6 pdr anti-tank team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '6 pdr anti-tank team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '6 pdr anti-tank team',
                exp: 'veteran',
                points: 0
            }
        ],
        points: 0,
        desc: 'A good anti-tank gun. Anything else than tiger does not want to take this to frontal armour.'
    },
    {
        name: '6 pdr anti-tank platoon (4 pipes)',
        teams: [
            {
                name: '6 pdr anti-tank team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '6 pdr anti-tank team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '6 pdr anti-tank team',
                exp: 'veteran',
                points: 0
            },
            {
                name: '6 pdr anti-tank team',
                exp: 'veteran',
                points: 0
            }
        ],
        points: 0,
        desc: 'A good anti-tank gun. Anything else than tiger does not want to take this to frontal armour.'
    },    
    {
        name: 'Sherman Armoured Troop (3 shermans)',
        teams: [
            {
                name: 'Sherman M4A1',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Sherman M4A1',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Sherman M4A1',
                exp: 'veteran',
                points: 0
            }
        ],
        points: 0,
        desc: 'A powerful armoured sherman unit.'
    },    
    {
        name: 'Sherman Armoured Troop (2 shermans, 1 grant)',
        teams: [
            {
                name: 'Sherman M4A1',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Sherman M4A1',
                exp: 'veteran',
                points: 0
            },
            {
                name: 'Grant',
                exp: 'veteran',
                points: 0
            }
        ],
        points: 0,
        desc: 'Crush your enemies with 2 shermans and 1 grant.'
    }
];

// Deutch Afrika Korps

// Regio Esercito Italiano

