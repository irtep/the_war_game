//import { NodeBuilderFlags } from "typescript";
import { GameObject } from "../data/sharedInterfaces";
//import { draw } from "../functions/draw";

export interface FoundData {
  found: boolean;
  id: string;
  all: any;
};

export const collisionCheck = (gameObject: GameObject, canvas: HTMLCanvasElement, team: any): boolean => {
  const ctx: CanvasRenderingContext2D | null | undefined = canvas?.getContext("2d");
  let collision: boolean = false;
  // set corners of team:
  team.setCorners(team.a);

  function pointInPoly(verties: any, testx: any, testy: any) {
    //console.log('verties: ', verties);
    //console.log('testx: ', testx);
    //console.log('testy: ', testy);
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
    //console.log('rect1: ', rect1);
    //console.log('rect2 ', rect2);
    //console.log('rect1.getCorners: ', rect1.getCorners());
    rect1.getCorners().forEach((corner: any) => {
      var isCollided = pointInPoly(rect2.getCorners(), corner.x, corner.y);

      if (isCollided) collision = true;
    });
    return collision;
  }

  function checkRectangleCollision(rect: any, rect2: any) {
    //console.log('cRC ', rect, rect2);
    if (testCollision(rect, rect2)) return true;
    else if (testCollision(rect2, rect)) return true;
    return false;
  }

  const runArray = (arr: any[]) => {
    arr.map((t: any) => {
      if (team.uuid !== t.uuid) {
        t.setCorners(t.a);
        const colCheck = checkRectangleCollision(team, t);
        if (colCheck === true) {
          collision = true;
        }
      };
    });
  }

  // check step by step, to be more efficent, first attackers
  gameObject.attacker.units.map((u: any) => {
    runArray(u.teams);
  });

  if (collision === false) {
    gameObject.defender.units.map((u: any) => {
      runArray(u.teams);
    });
  };

  if (collision === false) {
    gameObject.terrain.houses.forEach((h: any) => {
      // jatka tästä!
    });
  }

  return collision;
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
