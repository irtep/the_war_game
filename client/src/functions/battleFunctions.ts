export interface FoundData {
    found: boolean;
    id: string;
};

export const checkIfFromHere = (arr: any, x: any, y: any, scale: number) => {

    let found: FoundData = {
        found: false,
        id: ''
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
                console.log('found: ', found);
            }
        });
    });

    return found;
}