import { Army } from "../data/sharedInterfaces";
import { useContext } from "react";

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

interface Weapon {
    name: string,

};

export function prepareWeapons(inputString: string, weapons: Array<any>) {
    // Use the split method to separate the string into an array
    let resultArray = inputString.split(', ');
    const preparedWeapons: any[] = [];

    // Trim any leading or trailing spaces from each element in the array
    resultArray = resultArray.map(function(item) {
        return item.trim();
    });

    resultArray.forEach( (w: string) => {
        const found = weapons.filter( (we: any) => we.name === w);
        found[0].reload = found[0].firerate;
        preparedWeapons.push(found[0]);
    });

    return preparedWeapons;
}
/*
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
                    // experience bonuses
                    switch (team.crew) {
                        case 'veteran':
                            team.rat = team.rat + 1;
                            team.mat = team.mat + 1;
                            break;
                        case 'elite':
                            team.rat = team.rat + 1;
                            team.mat = team.mat + 1;
                            team.def = team.def + 1;
                            team.reactions = team.reactions + 1;
                            team.skill = team.skill + 1;
                            break;
                        case 'ace':
                            team.rat = team.rat + 2;
                            team.mat = team.mat + 2;
                            team.def = team.def + 2;
                            team.reactions = team.reactions + 2;
                            team.skill = team.skill + 2;
                            if (team.save > 0) {
                                team.save = team.save + 1;
                            }
                            break;
                    };
                    // weapons and reloads
                    team.combatWeapons = prepareWeapons(team.weapons, weapons);
                    // power/weight ratio
                    team.motorPower = team.horsepowers/team.weight;
                });
            });

        } else {
            parsedArmy[key] = value;
        }
    }

    return parsedArmy;
};
*/