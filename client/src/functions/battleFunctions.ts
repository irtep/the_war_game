//import { NodeBuilderFlags } from "typescript";
import { GameObject, CollisionResponse, Team } from "../data/sharedInterfaces";
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

export const collisionCheck = (gameObject: GameObject, team: any): CollisionResponse => {
  const collisionResponse: CollisionResponse = {
    collision: false,
    withWhat: ''
  };
  // set corners of team:
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
            const cornerit = team.getCorners();
            //console.log(`teams: ${team.uuid} vs ${t.uuid}`);
            //console.log(`corners 1: ${cornerit[0].x}`);
            collisionResponse.collision = true;
            collisionResponse.withWhat = 'team';
          }

        };
      }

      else if (type === 'houses') {
        t.setCorners(0); // houses always have 0 angle, maybe later need to change.
        const colCheck = checkRectangleCollision(team, t);

        if (colCheck === true) {
          console.log('is house');
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
          console.log('is water');
          collisionResponse.collision = true;
          collisionResponse.withWhat = 'water';
        }
      }

    });
  }

  // check step by step, to be more efficent, first attackers
  gameObject.attacker.units.map((u: any) => {
    runArray(u.teams, 'teams');
  });

  if (collisionResponse.collision === false) {
    gameObject.defender.units.map((u: any) => {
      runArray(u.teams, 'teams');
    });
  };

  if (collisionResponse.collision === false) {
    runArray(gameObject.terrain.houses, 'houses');
  }

  if (collisionResponse.collision === false) {
    runArray(gameObject.terrain.waters, 'waters');
  }

  if (collisionResponse.collision === false) {
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

export const hasLineOfSight = (point1: any, point2: any, obstacles: any[]): boolean => {
  const x1 = point1.x;
  const y1 = point1.y;
  const x2 = point2.x;
  const y2 = point2.y;

  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;

  let x = x1;
  let y = y1;
  let err = dx - dy;

  while (Math.abs(x - x2) > 1 || Math.abs(y - y2) > 1) {
    for (const obstacle of obstacles) {
      // Check if the line intersects with the bounding box of the obstacle
      if (
        x >= obstacle.x && x <= obstacle.x + obstacle.width &&
        y >= obstacle.y && y <= obstacle.y + obstacle.height
      ) {
        console.log('returning false: ', obstacle.x, obstacle.y);
        return false; // There is an obstacle in the path
      }
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  console.log('returning true');
  return true; // No obstacles in the path
};