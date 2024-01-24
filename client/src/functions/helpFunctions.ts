//import { NodeBuilderFlags } from "typescript";
import { losBullet } from "../data/classes";
import { GameObject, CollisionResponse, Team } from "../data/sharedInterfaces";
import { collisionCheck } from "./collisionDetect";
//import { draw } from "../functions/draw";

export interface FoundData {
  found: boolean;
  id: string;
  all: any;
};

export const callDice = (max: number): number => {
  const result = 1 + Math.floor(Math.random() * max);
  return result;
}

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
      }
    });
  });

  return found;
}

export const startMovement = (id: string, setGameObject: any): void => {
  console.log('changin for : ', id );
  setGameObject((prevGameObject: GameObject) => ({
    ...prevGameObject,
    attacker: {
      ...prevGameObject.attacker,
      units: prevGameObject.attacker.units.map((unit: any) => ({
        ...unit,
        teams: unit.teams.map((team: any) => {
          if (id === team.uuid) {
            team.moveToTarget()
          }
          return team;
        }),
      })),
    },
    defender: {
      ...prevGameObject.defender,
      units: prevGameObject.defender.units.map((unit: any) => ({
        ...unit,
        teams: unit.teams.map((team: any) => {
          if (id === team.uuid) {
            team.moveToTarget()
          }
          return team;
        }),
      })),
    },
  }));
};

export const changePropsOfUnit = (id: string, properties: string[], values: any[], gameObject: GameObject, setGameObject: any): void => {
  console.log('change for unit: ', id);
  setGameObject({
    ...gameObject,
    attacker: {
      ...gameObject.attacker,
      units: gameObject.attacker.units.map((unit: any) => ({
        ...unit,
        teams: unit.teams.map((team: any) => {
          if (team.unit === id) {
            // Update properties for the current team
            console.log('found: ', team.unit, id);
            return { ...team, ...Object.fromEntries(properties.map((prop, index) => [prop, values[index]])) };
          } else {
            return team;
          }
        }),
      })),
    },
    defender: {
      ...gameObject.defender,
      units: gameObject.defender.units.map((unit: any) => ({
        ...unit,
        teams: unit.teams.map((team: any) => {
          if (team.unit === id) {
            // Update properties for the current team
            return { ...team, ...Object.fromEntries(properties.map((prop, index) => [prop, values[index]])) };
          } else {
            return team;
          }
        }),
      })),
    },
  });
};

export const changePropsOfTeam = (id: string, properties: string[], values: any[], gameObject: GameObject, setGameObject: any): void => {
  setGameObject( (oldGo: GameObject) => {
    let updatedGo: GameObject = {...oldGo};

    updatedGo.attacker = {
      ...updatedGo.attacker,
      units: oldGo.attacker.units.map((unit: any) => ({
        ...unit,
        teams: unit.teams.map((team: any) => {
          return id === team.uuid ? { ...team, ...Object.fromEntries(properties.map((prop, index) => [prop, values[index]])) } : team;
        }),
      })),
    };

    updatedGo.defender = {
      ...updatedGo.defender,
      units: oldGo.defender.units.map((unit: any) => ({
        ...unit,
        teams: unit.teams.map((team: any) => {
          return id === team.uuid ? { ...team, ...Object.fromEntries(properties.map((prop, index) => [prop, values[index]])) } : team;
        }),
      })),
    }

    return updatedGo;

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
          return team;
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



// Function to determine the side based on two closest distances
export const determineSide = (distances: Record<string, number>): string => {
  // Extract distance values from the object
  const distanceValues = Object.values(distances);

  // Sort distances in ascending order
  const sortedDistances = distanceValues.sort((a, b) => a - b);

  // Get the two closest distances
  const closest1 = sortedDistances[0];
  const closest2 = sortedDistances[1];

  // Find keys corresponding to the closest distances
  const closestKeys = Object.keys(distances).filter(
    key => distances[key] === closest1 || distances[key] === closest2,
  );

  // Determine the side based on the closest keys
  if (
    (closestKeys.includes('distanceToLeftTop') && closestKeys.includes('distanceToRightTop')) /*||
    (closestKeys.includes('distanceToLeftBottom') && closestKeys.includes('distanceToRightBottom'))*/
  ) {
    return 'front';
  } else if (
    (closestKeys.includes('distanceToLeftTop') && closestKeys.includes('distanceToLeftBottom')) ||
    (closestKeys.includes('distanceToRightTop') && closestKeys.includes('distanceToRightBottom'))
  ) {
    return 'side';
  } else if (
    (closestKeys.includes('distanceToLeftBottom') && closestKeys.includes('distanceToRightBottom')) /*||
    (closestKeys.includes('distanceToLeftTop') && closestKeys.includes('distanceToRightTop'))*/
  ) {
    return 'back';
  } else {
    // Handle other cases as needed
    return 'unknown';
  }
}

export const distanceCheck = (loca1: any, loca2: any): number => {
  const dx = loca2.x - loca1.x;
  const dy = loca2.y - loca1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance;
};

export const checkLOS = (team: Team,
                         target: Team,
                         gameObject: GameObject,
                         distance: number
                          ): CollisionResponse => {
  losBullet.x = team.x; losBullet.y = team.y;
  losBullet.target = { x: target.x, y: target.y };
  losBullet.uuid = team.uuid; // loaning uuid to ignore shooters collision test

  // 360, because turning too "uses" i++
  for (let i = 0; i < distance + 360; i++) {
    const getMovement = losBullet.moveToTarget();

    if (getMovement === undefined) { console.log('gM und. at LOS check'); }
    
    const check: CollisionResponse = collisionCheck(gameObject, getMovement.updatedBullet, 'los');

    if (check.collision) {
      
      return check;

    }

    losBullet.x = getMovement.updatedBullet.x;
    losBullet.y = getMovement.updatedBullet.y;
  }

  return {
    collision: false,
    withWhat: '',
    id: undefined
  };
}
