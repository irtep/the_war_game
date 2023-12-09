export type Crews = {
    experience: string,
    limit: number, // does not do anything at the moment. gotta check if need to add.
    cost: number // maybe does not make sense to have different costs
};

export interface Faction {
    name: string;
    side: 'allies' | 'axis';
    game: 'mid war' | 'late war';
    crews: Array<Crews>,
    desc: string,
    logo: string
};

export const games: Array<string> = [
    'mid war',
    'late war'
];

export const factions: Array<Faction> = [
    {
        name: "Great Britain",
        side: "allies",
        game: "mid war",
        crews: [
            {
                experience: 'rookie',
                limit: 100,
                cost: 0
            },
            {
                experience: 'veteran',
                limit: 100,
                cost: 2
            },
            {
                experience: 'elite',
                limit: 3,
                cost: 4
            }
        ],
        desc: "The British Empire has rules most of the known world and it shows. Good training and fine equipment brings a solid base for North Africa battles. Also the receive lots of equipment and tanks from their ally the USA.",
        logo: "desertRats.png"
    },
    {
        name: "USA",
        side: "allies",
        game: "mid war",
        crews: [
            {
                experience: 'rookie',
                limit: 100,
                cost: 0
            },
            {
                experience: 'veteran',
                limit: 1,
                cost: 3
            }
        ],
        desc: "The huge industrial power of USA assure, that its troops are fighting with good equipments and material. However, at this point of the war they are still very inexperienced.",
        logo: "fightingFirst.png"
    },
    {
        name: "Germany",
        side: "axis",
        game: "mid war",
        crews: [
            {
                experience: 'rookie',
                limit: 3,
                cost: 0
            },
            {
                experience: 'veteran',
                limit: 100,
                cost: 2
            },
            {
                experience: 'elite',
                limit: 6,
                cost: 3
            },
            {
                experience: 'ace',
                limit: 1,
                cost: 4
            }
        ],
        desc: "Germany has already few years of quite successful war under its belt, and has been almost invicibles. They have good equipments and weapons with the most experienced troops.",
        logo: "DAK.png"
    },
    {
        name: "Italy",
        side: "axis",
        game: "mid war",
        crews: [
            {
                experience: 'rookie',
                limit: 3,
                cost: 0
            },
            {
                experience: 'veteran',
                limit: 100,
                cost: 2
            },
            {
                experience: 'elite',
                limit: 6,
                cost: 3
            }
        ],
        desc: "Italy got an old school beatdown from British, when they tried to captured Egypt. However, now they are back with their friends the Germans and with more experience.",
        logo: "italy.png"
    }
];
