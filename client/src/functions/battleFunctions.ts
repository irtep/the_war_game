//import { NodeBuilderFlags } from "typescript";
import { losBullet } from "../data/classes";
import { GameObject, CollisionResponse, Team, AttacksBox, BombBox } from "../data/sharedInterfaces";
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

export const collisionCheck = (gameObject: GameObject, team: any, action: string): CollisionResponse => {
  const collisionResponse: CollisionResponse = {
    collision: false,
    withWhat: '',
    id: undefined
  };
  // set corners of team:
  //console.log('getting corners for ', team);
  team.setCorners(team.a);

  function pointInPoly(verties: any, testx: any, testy: any) {
    var i;
    var j;
    var c: any = 0;
    var nvert = verties.length;

    for (i = 0, j = nvert - 1; i < nvert; j = i++) {

      if (((verties[i].y > testy) != (verties[j].y > testy)) && (testx < (verties[j].x - verties[i].x) * (testy - verties[i].y) / (verties[j].y - verties[i].y) + verties[i].x))
        c = !c;
    }
    return c;
  }

  function testCollision(rect1: any, rect2: any) {
    var collision = false;

    rect1.getCorners().forEach((corner: any) => {
      var isCollided = pointInPoly(rect2.getCorners(), corner.x, corner.y);

      if (isCollided) collision = true;
    });

    return collision;
  }

  function checkRectangleCollision(rect: any, rect2: any) {

    if (testCollision(rect, rect2)) return true;

    else if (testCollision(rect2, rect)) return true;

    return false;
  }

  const runArray = (arr: any[], type: string) => {
    arr.map((t: any) => {

      if (type === 'teams') {

        if (team.uuid !== t.uuid) {
          t.setCorners(t.a);
          const colCheck = checkRectangleCollision(team, t);

          if (colCheck === true) {
            //const cornerit = team.getCorners();
            //console.log(`teams: ${team.uuid} vs ${t.uuid}`);
            //console.log(`corners 1: ${cornerit[0].x}`);
            collisionResponse.id = t.uuid;
            collisionResponse.collision = true;
            collisionResponse.withWhat = 'team';
          }

        };
      }

      else if (type === 'houses') {
        t.setCorners(0); // houses always have 0 angle, maybe later need to change.
        const colCheck = checkRectangleCollision(team, t);

        if (colCheck === true) {
          //console.log('is house');
          collisionResponse.collision = true;
          collisionResponse.withWhat = 'house';
        }
      }

      else if (type === 'trees') {
        t.setCorners(0); // trees always have 0 angle, maybe later need to change.
        const colCheck = checkRectangleCollision(team, t);

        if (colCheck === true) {
          console.log('is tree');
          collisionResponse.collision = true;
          collisionResponse.withWhat = 'tree';
        }
      }

      else if (type === 'waters') {
        t.setCorners(0); // waters always have 0 angle, maybe later need to change.
        const colCheck = checkRectangleCollision(team, t);

        if (colCheck === true) {
          //console.log('is water');
          collisionResponse.collision = true;
          collisionResponse.withWhat = 'water';
        }
      }

    });
  }

  // check step by step, to be more efficent, first attackers
  if (action !== 'cover') {
    gameObject.attacker.units.forEach((u: any) => {
      runArray(u.teams, 'teams');
    });
  }
  // action === cover is not used at the moment..
  if (collisionResponse.collision === false && action !== 'cover') {
    gameObject.defender.units.forEach((u: any) => {
      runArray(u.teams, 'teams');
    });
  };

  if (collisionResponse.collision === false && action !== 'cover') {
    runArray(gameObject.terrain.houses, 'houses');
  }

  if (collisionResponse.collision === false && action !== 'los' && action !== 'cover') {
    runArray(gameObject.terrain.waters, 'waters');
  }

  if (collisionResponse.collision === false && action !== 'los') {
    runArray(gameObject.terrain.trees, 'trees');
  }

  //console.log('responding: ', collisionResponse);
  return collisionResponse;
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
      }
    });
  });

  return found;
}

export const startMovement = (id: string, setGameObject: any, gameObject: GameObject, selected: any): void => {

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

export const resolveCollision = (
  noMovement: Team,
  withMovement: Team,
  check: CollisionResponse
) => {
  if (check.collision) {

    if (check.withWhat === 'team' || check.withWhat === 'house' || check.withWhat === 'water') {
      return noMovement;
    }

    else if (check.withWhat === 'tree') {
      // need to make a cross check, if ok, can advance, if not does not advance
      const crossCheck: number = callDice(6);

      if (crossCheck >= noMovement.cross) {
        console.log('cross ok', crossCheck, ' vs ', noMovement.cross);
        return withMovement;
      } else {
        console.log('cross failed: ', crossCheck, ' vs ', noMovement.cross);
        return noMovement;
      }
    }

  } else {
    return withMovement;
  }
}

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

export const upkeepPhase = (t: Team, setLog: any, log: string[]): Team => {
  let shootLog = '';

  if (t.disabled === false) {
    // reload
    t.combatWeapons?.forEach((w: any) => {
      if (w.reload < w.firerate && t.disabled === false &&
        t.shaken === false && t.stunned === false) {
        w.reload = w.reload + 5;
        if (w.reload > w.firerate) {
          w.reload = w.firerate
        }
      }
    });

    // shake of shakes
    if (t.shaken) {
      const motivationTest = callDice(12);
      const skillTest = callDice(6);
      if (motivationTest < t.motivation && skillTest < t.skill) {
        shootLog = shootLog + `${t.name} out of shake. dices: ${motivationTest}, ${skillTest} vs: ${t.motivation}, ${t.skill}`;
        t.shaken = false;
      }
    }

    // shake of stuns
    if (t.stunned) {
      const motivationTest = callDice(12);
      const skillTest = callDice(6);
      if (motivationTest < t.motivation && skillTest < t.skill) {
        shootLog = shootLog + `${t.name} out of shake. dices: ${motivationTest}, ${skillTest} vs: ${t.motivation}, ${t.skill}`;
        t.shaken = true;
        t.stunned = false;
      }
    }
  }

  if (shootLog !== '') { setLog([shootLog, ...log]); }

  return t;
}


