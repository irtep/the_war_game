export interface FoundData {
    found: boolean;
    id: string;
    all: any;
};

export const checkIfFromHere = (arr: any, x: any, y: any, scale: number) => {

    let found: FoundData = {
        found: false,
        id: '',
        all: {}
    };
    arr.forEach((unit: any) => {
        unit.teams.forEach((team: any) => {
            if (
                x >= team.x - team.width / (2 * scale) &&
                x <= team.x + team.width / (2 * scale) &&
                y >= team.y - team.width / (2 * scale) &&
                y <= team.y + team.width / (2 * scale)
            ) {
                found.found = true;
                found.id = team.uuid;
                found.all = team;
                console.log('found: ', found);
            }
        });
    });

    return found;
}