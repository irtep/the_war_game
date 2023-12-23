//import { NodeBuilderFlags } from "typescript";
import { GameObject } from "../data/sharedInterfaces";
//import { draw } from "../functions/draw";

export interface FoundData {
  found: boolean;
  id: string;
  all: any;
};

// based on:
// https://stackoverflow.com/questions/41469794/html-canvas-and-javascript-rotating-objects-with-collision-detection
export const collisionCheck = (gameObject: GameObject, canvas: HTMLCanvasElement, team: any): boolean => {
  const ctx: CanvasRenderingContext2D | null | undefined = canvas?.getContext("2d");
  let collision: boolean = false;

  const checkRecVsRec = ((team2: any): void => {

    ctx?.save(); // save old coords
    ctx?.translate(team2.x, team2.y); // go to x and y of team2
    ctx?.rotate(team2.a); // rotate to angle of team
    var tankInvMatrix = ctx?.getTransform().invertSelf(); // get inverse transformation matris of this rotated tank
    var bullet = new DOMPoint(team.x, team.y); // make dom point of team, that is now called a bullet
    var relBullet = tankInvMatrix?.transformPoint(bullet); // Transform the bullet point using the inverse matrix to get the relative position

    if (
      relBullet &&
      relBullet.x !== undefined &&
      relBullet.y !== undefined &&
      relBullet.x > -20 && relBullet.x < 20 &&
      relBullet.y > -10 && relBullet.y < 10
    ) {
      // Collision detected
      collision = true;
    }

    ctx?.restore(); // restore old saved coords

  });

  const checkVsOtherTeams = (arr: any[]): void => {
    arr.forEach((u: any) => {
      u.teams.forEach((t: any) => {
        // check vs center point of tank
        if (team.uuid !== t.uuid) {
          checkRecVsRec(t);
        };
        
        // check vs all corners // ei toimi kunnolla...
        if (team.uuid !== t.uuid) {
          for (let i = -1; i <= 1; i += 2) {
            for (let j = -1; j <= 1; j += 2) {
              const cornerX = t.x + i * (t.width / 2);
              const cornerY = t.y + j * (t.height / 2);
  
              const teamToCheck = {
                ...t,
                x: cornerX,
                y: cornerY,
                // Adjust other properties as needed
              };
  
              checkRecVsRec(teamToCheck);
            }
          }
        }
      });
    });
  };

  // makes 9 collision points to that building
  const checkVsBuildings = (arr: any[]): void => {
    arr.forEach((b: any) => {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const buildingToCheck = {
            ...b, // ei toimi kunnolla....
            x: b.x + (i * b.w) / 2,
            y: b.y + (j * b.h) / 2,
            width: b.w,
            height: b.h
          };
          checkRecVsRec(buildingToCheck);
        }
      }
    });
  };

  checkVsOtherTeams(gameObject.attacker.units);
  checkVsOtherTeams(gameObject.defender.units);
  checkVsBuildings(gameObject.terrain.houses);

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
        console.log('found: ', found);
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
