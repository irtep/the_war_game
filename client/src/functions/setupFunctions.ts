
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
