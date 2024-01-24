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
        desc: 'A HQ unit with tank'
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
        name: 'Rifle platoon',
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
                name: 'Boys AT-rifle', // need to do to database pg 177
                exp: 'veteran',
                points: 0
            },
            {
                name: '2-inch mortar', // need to do to database pg 177
                exp: 'veteran',
                points: 0
            }
        ],
        points: 0,
        desc: 'A good solid infantry unit, with Boys at-rifle and 2-inch mortar'
    }
];

// Deutch Afrika Korps

// Regio Esercito Italiano

