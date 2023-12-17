import { GameObject } from "../data/sharedInterfaces";
//import { draw } from "../functions/draw";

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

export const changePropsOfTeam = (id: string, properties: string[], values: any[], gameObject: GameObject, setGameObject: any): void => {
    setGameObject({
        ...gameObject,
        attacker: {
            ...gameObject.attacker,
            units: gameObject.attacker.units.map((unit: any) => ({
                ...unit,
                teams: unit.teams.map((team: any) => {
                    return id === team.uuid ? { ...team, ...Object.fromEntries(properties.map((prop, index) => [prop, values[index]])) } : team;
                }),
            })),
        },
        defender: {
            ...gameObject.defender,
            units: gameObject.defender.units.map((unit: any) => ({
                ...unit,
                teams: unit.teams.map((team: any) => {
                    return id === team.uuid ? { ...team, ...Object.fromEntries(properties.map((prop, index) => [prop, values[index]])) } : team;
                }),
            })),
        },
    });
};

export const findTeamByLocation = (x: number, y: number, gameObject: GameObject, scale: number): string | null => {
    const checkUnits = (units: any[]): string | null => {
        for (const unit of units) {
            for (const team of unit.teams) {
                if (
                    x >= team.x - team.width / (2 * scale) &&
                    x <= team.x + team.width / (2 * scale) &&
                    y >= team.y - team.width / (2 * scale) &&
                    y <= team.y + team.width / (2 * scale)
                ) {
                    return team.uuid;
                }
            }
        }
        return null;
    };

    const attackerTeamId = checkUnits(gameObject.attacker.units);
    if (attackerTeamId) {
        return attackerTeamId;
    }

    const defenderTeamId = checkUnits(gameObject.defender.units);
    return defenderTeamId;
};

export const findTeamById = (targetUuid: string, gameObject: GameObject): any | null => {
    const checkUnits = (units: any[]): { uuid: string, name: string } | null => {
      for (const unit of units) {
        for (const team of unit.teams) {
          if (team.uuid === targetUuid) {
            return team ;
          }
        }
      }
      return null;
    };
  
    const attackerTeam = checkUnits(gameObject.attacker.units);
    if (attackerTeam) {
      return attackerTeam;
    }
  
    const defenderTeam = checkUnits(gameObject.defender.units);
    return defenderTeam;
  };
/*
  export const doOrders = (gameObject: GameObject, setGameObject: any) => {
    const newGameObject = { ...gameObject };
  
    const processOrdersForUnits = (units: any[]) => {
      units.forEach((unit: any) => {
        unit.teams.forEach((team: any) => {
          switch (team.order) {
            case 'move':
              // Implement move logic here
              break;
            case 'attack':
              // Implement attack logic here
              break;
            // Add more order cases as needed
            default:
              // Handle unsupported orders or do nothing
          }
        });
      });
    };
  
    processOrdersForUnits(newGameObject.attacker.units);
    processOrdersForUnits(newGameObject.defender.units);
  
    // Update the game object with the modified teams
    //setGameObject(newGameObject);
  
    // Optionally, trigger a redraw or update the display
    /*
    if (draw) {
      draw(newGameObject, );
    }
    */
 // };