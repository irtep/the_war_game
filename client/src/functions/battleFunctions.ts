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

// Function to check collision with rotated rectangles
const checkCollisionWithRotatedRect = (team: any, otherTeam: any) => {
  const cosA = Math.cos((team.a * Math.PI) / 180);
  const sinA = Math.sin((team.a * Math.PI) / 180);

  if (otherTeam.a === undefined) { otherTeam.a = 0 }
  //console.log('r vs r ', team, otherTeam);
  // Translate coordinates to team's local coordinate system
  const relativeX = otherTeam.x - team.x;
  const relativeY = otherTeam.y - team.y;

  // Rotate the coordinates of the other rectangle back to the original orientation
  const rotatedX = relativeX * cosA + relativeY * sinA;
  const rotatedY = relativeY * cosA - relativeX * sinA;

  // Check collision in the original orientation
  if (rotatedX < team.width / 2 &&
    rotatedX > -team.width / 2 &&
    rotatedY < team.height / 2 &&
    rotatedY > -team.height / 2) {
    console.log('cc :', team.uuid, otherTeam.id, otherTeam.uuid);
  }
  return (
    rotatedX < team.width / 2 &&
    rotatedX > -team.width / 2 &&
    rotatedY < team.height / 2 &&
    rotatedY > -team.height / 2
  );
}

// Function to check collision with circles
const checkCollisionWithCircle = (team: any, circle: any) => {
  const dx = team.x - circle.x;
  const dy = team.y - circle.y;

  // Rotate the coordinates of the circle back to the original orientation
  const rotatedX = dx * Math.cos((team.a * Math.PI) / 180) + dy * Math.sin((team.a * Math.PI) / 180);
  const rotatedY = dy * Math.cos((team.a * Math.PI) / 180) - dx * Math.sin((team.a * Math.PI) / 180);

  //console.log('team is: ', team.uuid, team.x, team.y, circle.x, circle.y);
  return (
    rotatedX < team.width / 2 + circle.radius &&
    rotatedX > -team.width / 2 - circle.radius &&
    rotatedY < team.height / 2 + circle.radius &&
    rotatedY > -team.height / 2 - circle.radius
  );
}

export const startMovement = (id: string, setGameObject: any, gameObject: GameObject, selected: any): void => {
  console.log('startMovement', id);

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

export const getRotatedCorners = (team: any) => {
  const cosA = Math.cos((team.a * Math.PI) / 180);
  const sinA = Math.sin((team.a * Math.PI) / 180);
  console.log('team.a ', team.a);
  console.log('cosA sinA', cosA, sinA);
  // Calculate half-width and half-height
  console.log('team.w', team.w);
  const halfWidth = team.width / 2;
  const halfHeight = team.height / 2;
  console.log('hw hh ', halfWidth, halfHeight);
  // Calculate the coordinates of all corners in local coordinates
  const localCorners = [
    { x: -halfWidth, y: -halfHeight }, // Top-left corner
    { x: halfWidth, y: -halfHeight },  // Top-right corner
    { x: halfWidth, y: halfHeight },   // Bottom-right corner
    { x: -halfWidth, y: halfHeight },  // Bottom-left corner
  ];
  console.log('locas: ', localCorners);
  // Rotate each corner back to the original orientation
  const rotatedCorners = localCorners.map(({ x, y }) => ({
    x: team.x + x * cosA - y * sinA,
    y: team.y + y * cosA + x * sinA,
  }));

  return rotatedCorners;
};
