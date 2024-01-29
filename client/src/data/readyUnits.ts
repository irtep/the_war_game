export interface ReadyTeam {
    name: string;
    exp: string;
    points: number;
    howMany: number;
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
                points: 0,
                howMany: 2
            }
        ],
        points: 0,
        desc: 'A HQ unit with two Shermans.'
    },
    {
        name: 'Grant HQ (3 tanks)',
        teams: [
            {
                name: 'Grant HQ',
                exp: 'veteran',
                points: 0,
                howMany: 3
            }
        ],
        points: 0,
        desc: 'A HQ unit with three powerful tanks.'
    },
    {
        name: 'Grant HQ (2 tanks)',
        teams: [
            {
                name: 'Grant HQ',
                exp: 'veteran',
                points: 0,
                howMany: 2
            }
        ],
        points: 0,
        desc: 'A HQ unit with two tanks.'
    },
    {
        name: 'Rifle HQ',
        teams: [
            {
                name: 'Rifle company HQ',
                exp: 'veteran',
                points: 0,
                howMany: 2
            }
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
                points: 0,
                howMany: 5
            },
            {
                name: 'Boys AT-rifle team',
                exp: 'veteran',
                points: 0,
                howMany: 1
            },
            {
                name: '2-inch mortar team',
                exp: 'veteran',
                points: 0,
                howMany: 1
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
                points: 0,
                howMany: 7
            },
            {
                name: 'Boys AT-rifle team',
                exp: 'veteran',
                points: 0,
                howMany: 1
            },
            {
                name: '2-inch mortar team',
                exp: 'veteran',
                points: 0,
                howMany: 1
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
                points: 0,
                howMany: 3
            }
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
                points: 0,
                howMany: 4
            }
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
                points: 0,
                howMany: 6
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
                points: 0,
                howMany: 2
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
                points: 0,
                howMany: 3
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
                points: 0,
                howMany: 4
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
                points: 0,
                howMany: 3
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
                points: 0,
                howMany: 2
            },
            {
                name: 'Grant',
                exp: 'veteran',
                points: 0,
                howMany: 1
            }
        ],
        points: 0,
        desc: 'Crush your enemies with 2 shermans and 1 grant.'
    },
    {
        name: 'Grant Armoured Troop',
        teams: [
            {
                name: 'Grant HQ',
                exp: 'veteran',
                points: 0,
                howMany: 3
            }
        ],
        points: 0,
        desc: 'Three Grants Nothing can go wrong with those.'
    },
    {
        name: 'Crusader HQ',
        teams: [
            {
                name: 'Crusader II HQ', // not added to db
                exp: 'veteran',
                points: 0,
                howMany: 2
            },
            {
                name: 'Crusader CS HQ', // not added to db
                exp: 'veteran',
                points: 0,
                howMany: 2
            }
        ],
        points: 0,
        desc: '2 x Crusader II and 2 x Crusader CS.'
    },
    {
        name: 'Crusader II troop',
        teams: [
            {
                name: 'Crusader II', // not added to db
                exp: 'veteran',
                points: 0,
                howMany: 3
            }
        ],
        points: 0,
        desc: 'Some speedy cruiser tanks with 2 pdr cannon.'
    },
    {
        name: 'Crusader II (2) & III (1)',
        teams: [
            {
                name: 'Crusader II', // not added to db
                exp: 'veteran',
                points: 0,
                howMany: 2
            },
            {
                name: 'Crusader III', // not added to db
                exp: 'veteran',
                points: 0,
                howMany: 1
            }
        ],
        points: 0,
        desc: '2 x Crusader II and 1 x Crusader III.'
    },
    {
        name: 'Crusader II (1) & III (2)',
        teams: [
            {
                name: 'Crusader II', // not added to db
                exp: 'veteran',
                points: 0,
                howMany: 1
            },
            {
                name: 'Crusader III', // not added to db
                exp: 'veteran',
                points: 0,
                howMany: 2
            }
        ],
        points: 0,
        desc: '1 x Crusade & 2 x Crusader III.'
    },
    {
        name: 'Honey HQ (3)',
        teams: [
            {
                name: 'M3 Light tank HQ', // not added to db
                exp: 'veteran',
                points: 0,
                howMany: 3
            }
        ],
        points: 0,
        desc: '3 HQ Honeys.'
    },
    {
        name: 'Honey HQ (4)',
        teams: [
            {
                name: 'M3 Light tank HQ', // not added to db
                exp: 'veteran',
                points: 0,
                howMany: 4
            }
        ],
        points: 0,
        desc: '4 HQ Honeys.'
    },
    {
        name: 'Honey Troop',
        teams: [
            {
                name: 'M3 Light tank',
                exp: 'veteran',
                points: 0,
                howMany: 3
            }
        ],
        points: 0,
        desc: 'Some speedy light tanks with a fine cannon.'
    },
    {
        name: 'Priest Field Troop',
        teams: [
            {
                name: 'Priest', // not added to db
                exp: 'veteran',
                points: 0,
                howMany: 2
            }
        ],
        points: 0,
        desc: 'Great SP artillery.'
    }
];

// Deutch Afrika Korps

// Regio Esercito Italiano

