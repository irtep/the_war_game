import { Army } from "../data/sharedInterfaces";

export const createBattleMap = (input: any): any => {

    let parsedMap: any = {
        name: '',
        type: '',
        houses: [],
        trees: [],
        waters: []
    };

    for (let [key, value] of Object.entries(input)) {

        if (key === 'houses' || key === 'waters' || key === 'trees') {

            parsedMap[key] = JSON.parse(value as string);

        } else {
            parsedMap[key] = value;
        }
    }

    return parsedMap;
}

export const createBattleArmies = (input: Army, attacker: boolean): Army => {

    let parsedArmy: Army = {
        user: '',
        name: '',
        faction: '',
        game: '',
        points: 0,
        units: []
    };

    for (let [key, value] of Object.entries(input)) {

        if (key === 'units') {

            parsedArmy.units = JSON.parse(value as string);

            parsedArmy.units.forEach((unit: any, i: number) => {

                unit.teams.forEach((team: any, h: number) => {
                    team.x = 1000;
                    team.y = 1000;
                    team.a = 0;
                    team.disabled = false;
                    team.kills = [];
                    team.tacticalNumber = String(i) + String(h);
                    team.unit = '';
                    if (attacker) {
                        team.unit = 'a' + String(i);
                        team.uuid = 'a' + String(i) + String(i) + String(h);
                    } else {
                        team.unit = 'd' + String(i);
                        team.uuid = 'd' + String(i) + String(i) + String(h);
                    }
                });
            });

        } else {
            parsedArmy[key] = value;
        }
    }

    return parsedArmy;
};