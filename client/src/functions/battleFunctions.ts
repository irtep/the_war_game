//import { NodeBuilderFlags } from "typescript";
import { losBullet } from "../data/classes";
import { GameObject, CollisionResponse, Team, AttacksBox } from "../data/sharedInterfaces";
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

export const resolveActions = (inTurn: any, opponents: any, gameObject: GameObject, attacksToResolve: any[], scale: number) => {

  inTurn.units = inTurn.units.map((unit: any) => ({
    ...unit,
    teams: unit.teams.map((team: Team) => {

      /**
       * HOLD
       */

      if (team && team.order === 'hold' &&
        team.disabled === false &&
        team.stunned === false &&
        team.shaken === false) {

        let attacksBox: AttacksBox = {
          inRange: false,
          hasLOS: false,
          attacks: [],
          inCover: false,
          distance: 0
        }

        // check if any team is at weapons range
        opponents.units.forEach((du: any) => {

          du.teams.forEach((dt: any) => {

            if (dt.disabled === false) {
              const checkDistance: number = distanceCheck(
                { x: team.x, y: team.y },
                { x: dt.x, y: dt.y }
              );
              team.combatWeapons?.forEach((weapon: any) => {

                if (weapon.combatRange > checkDistance &&
                  (!weapon.specials.includes('artillery')) &&
                  weapon.AT > dt.armourSide &&
                  weapon.reload >= weapon.firerate) {

                  //console.log('holder ', team.name, ' on range! ');
                  //console.log('on range of: ', weapon.name);
                  const attack = {
                    weapon: weapon,
                    origin: team,
                    object: dt
                  };
                  attacksBox.inRange = true;
                  // if in range, shoot
                  // check LOS to target if in range
                  if (attacksBox.inRange) {
                    losBullet.x = team.x; losBullet.y = team.y;
                    losBullet.target = { x: dt.x, y: dt.y };
                    losBullet.uuid = team.uuid; // loaning uuid to ignore shooters collision test

                    // 360, because turning too "uses" i++
                    for (let i = 0; i < checkDistance + 360; i++) {
                      const getMovement = losBullet.moveToTarget();
                      if (getMovement === undefined) { console.log('gM und. at LOS check'); }
                      const check: CollisionResponse = collisionCheck(gameObject, getMovement.updatedBullet, 'los');

                      if (check.collision) {
                        // need to get id of collided returned...
                        //console.log('collision: ', check, losBullet.x, losBullet.y);
                        i = checkDistance + 361
                        if (check.id === dt.uuid) {
                          //console.log('is target');
                          attacksBox.hasLOS = true;
                          attacksBox.distance = checkDistance;
                          attacksBox.attacks.push(attack);
                        } else {
                          //console.log('collided with something else');
                        }
                      }
                      losBullet.x = getMovement.updatedBullet.x;
                      losBullet.y = getMovement.updatedBullet.y;
                    }
                  }
                  //console.log('out of loop');
                  // if in range and in LOS, push to attacksToResolve
                  if (attacksBox.attacks.length > 0 && (attacksBox.hasLOS)) {
                    //console.log('pushing to attacks to resolve');
                    attacksToResolve.push(attacksBox.attacks[0]);
                  }
                }
              })
            }

          });
        });

        // else, return team.
      }

      if (team.disabled === false &&
        team.stunned === false &&
        team.shaken === false &&
        team.speed > 0) {
        /*
         *  MOVE
         */

        if (team && team.order === 'move' && team.target &&
          (team.x !== team.target.x || team.y !== team.target.y)) {

          const getMovement = team.moveToTarget();
          const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');
          return resolveCollision(team, getMovement, check);

        }

        /*
         *  ATTACK
         */

        else if (team && team.order === 'attack') {
          //console.log('attack detected', team);
          if (typeof (team.target) === 'string') {

            const target: Team = findTeamById(team.target, gameObject);

            let attacksBox: AttacksBox = {
              inRange: false,
              hasLOS: false,
              attacks: [],
              inCover: false,
              distance: 0
            }

            // check if object is in weapon range
            const checkDistance = distanceCheck({ x: team.x, y: team.y }, { x: target.x, y: target.y });

            team.combatWeapons?.forEach((w: any) => {
              //console.log('comparing: ', w.combatRange, checkDistance);
              if (checkDistance < w.combatRange &&
                w.AT > target.armourSide &&
                (!w.specials.includes('artillery')) &&
                w.reload >= w.firerate) {
                //console.log('on range of: ', w.name);
                const attack = {
                  weapon: w,
                  origin: team,
                  object: target
                };
                attacksBox.inRange = true;

                // check LOS to target if in range
                if (attacksBox.inRange) {
                  losBullet.x = team.x; losBullet.y = team.y;
                  losBullet.target = { x: target.x, y: target.y };
                  losBullet.uuid = team.uuid; // loaning uuid to ignore shooters collision test

                  // 360, because turning too "uses" i++
                  for (let i = 0; i < checkDistance + 360; i++) {
                    const getMovement = losBullet.moveToTarget();
                    if (getMovement === undefined) { console.log('gM und. at LOS check'); }
                    const check: CollisionResponse = collisionCheck(gameObject, getMovement.updatedBullet, 'los');

                    if (check.collision) {
                      // need to get id of collided returned...
                      //console.log('collision: ', check, losBullet.x, losBullet.y);
                      i = checkDistance + 361
                      if (check.id === target.uuid) {
                        //console.log('is target');
                        attacksBox.attacks.push(attack);
                        attacksBox.hasLOS = true;
                        attacksBox.distance = checkDistance;
                      } else {
                        //console.log('collided with something else');
                      }

                    }

                    losBullet.x = getMovement.updatedBullet.x;
                    losBullet.y = getMovement.updatedBullet.y;
                  }
                }
              }
            });

            //console.log('out of loop');
            // if in range and in LOS, push to attacksToResolve
            if (attacksBox.attacks.length > 0 && (attacksBox.hasLOS)) {
              //console.log('pushing to attacks to resolve');
              attacksBox.attacks.forEach((a: any) => {
                //console.log('pushing: ', a);
                attacksToResolve.push(a);
                //console.log('aTr: ', attacksToResolve);
              });
              //console.log('returning team');
              return team;
            } else {
              // if not in range (and LOS), move closer, if can
              //console.log('moving closer');
              team.target = { x: target.x, y: target.y }
              const getMovement = team.moveToTarget();
              if (getMovement === undefined) { console.log('gM und. at moving when no los/range'); }
              const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');

              return resolveCollision(team, getMovement, check);
            }

          } else {
            //console.log('target not string: ', typeof (team.target), team.target);
            const findingTarget = findTeamByLocation(team.target.x, team.target.y, gameObject, scale);
            //console.log('returning back with original target: ', findingTarget);
            return { ...team, target: findingTarget };
          }

        }

        else if (team && team.order === 'bombard') {
          return team;
        }

        else if (team && team.order === 'reverse') {
          return team;
        }

        else if (team && team.order === 'charge') {
          return team;
        }
        else if (team && team.order === 'hold') {
          return team;
        }

        else {
          return team;
        }
      } else {
        // disabled, but could still return it, so it does change to undefined.
        return team;
      }
    }),
  }));

  return inTurn;
};

export const resolveAttacks = (attacksToResolve: any[], updatedGameObject: GameObject, setLog: any, log: string[]): any[] => {

  attacksToResolve.forEach((shooting: any) => {
    if (shooting.object.disabled === true) {
      shooting.origin.order = 'hold';
    } else {
      if (shooting.weapon.reload >= shooting.weapon.firerate &&
        shooting.origin.shaken === false &&
        shooting.origin.stunned === false) {

        let shootLog: string = '';
        const attacker = shooting.origin;
        const target = shooting.object;
        let hitDice = callDice(12);
        let hitHelpers = 0;
        let defHelpers = 0;
        let armourSofteners = 0;
        let armourHardeners = 0;
        let concealed = false;

        // empty the gun
        shooting.weapon.reload = 0;
        shootLog = shootLog + `${shooting.origin.name} fires at ${shooting.object.name} with ${shooting.weapon.name}. `;

        // if far away or close
        if (shooting.distance < 100) {
          hitHelpers++;
          armourSofteners++;
          shootLog = shootLog + 'target is point blank range. ';
        }
        if (shooting.distance > 241) {
          console.log('long distance');
          defHelpers++;
          shootLog = shootLog + 'target is at long range. ';
          if (!shooting.weapon.specials.includes('HEAT')) {
            //console.log('does not have heat');
            armourHardeners++;
          } else {
            //console.log('has HEAT');
            shootLog = shootLog + 'but the gun has HEAT round. ';
          }
        }

        // if concealed
        updatedGameObject.terrain.trees.forEach((t: any) => {
          const distance = distanceCheck(
            { x: target.x, y: target.y },
            { x: t.x, y: t.y }
          );
          //console.log('distance to tree: ', distance);
          if (distance < 40) {
            //console.log('concealed by trees', distance, target.width);
            shootLog = shootLog + 'target is concealed by trees and bushes. ';
            concealed = true;
          }
        });
        updatedGameObject.smokes?.forEach((t: any) => {
          const distance = distanceCheck(
            { x: target.x, y: target.y },
            { x: t.x, y: t.y }
          );
          //console.log('distance to smoke: ', distance);
          if (distance < 40) {
            //console.log('concealed by smoke');
            shootLog = shootLog + 'target is concealed by smoke. ';
            concealed = true;
          }

        });

        // if aiming:
        /* disabled for now, always everyone was getting... gotta think about this.
        if (attacker.order === 'hold') {
          hitHelpers++;
          shootLog = shootLog + 'shooter is aiming carefully. ';
        }*/
        // if moving:
        if (target.order === 'move') {
          defHelpers++;
          shootLog = shootLog + 'target is moving. ';
        }
        // if concealed:
        if (concealed) { defHelpers++; }

        if (shooting.object.type === 'infantry' && shooting.weapon.includes('No HE')) {
          shootLog = shootLog + 'No HE shell, so harder to hit. ';
          defHelpers++;
          defHelpers++;
        }

        //console.log('shooter: ', shooting.origin);
        //console.log('object: ', shooting.object);
        const finalHitScore = hitDice + shooting.origin.rat + hitHelpers;
        const finalDefScore = shooting.object.def + defHelpers;
        shootLog = shootLog + `final hit: ${finalHitScore} dice ${hitDice} skill: ${shooting.origin.rat} mod+: ${hitHelpers} mod-: ${defHelpers}. `;
        shootLog = shootLog + `def of object: ${shooting.object.def} ${defHelpers} = ${finalDefScore}. `;

        if (finalHitScore >= finalDefScore) {
          shootLog = shootLog + 'target is hit! ';

          if (shooting.object.type === 'tank') {
            // check where object is hit.
            const distanceToLeftTop: number = distanceCheck(
              { x: shooting.origin.x, y: shooting.origin.y },
              { x: shooting.object.leftTopCorner.x, y: shooting.object.leftTopCorner.y }
            );
            const distanceToRightTop: number = distanceCheck(
              { x: shooting.origin.x, y: shooting.origin.y },
              { x: shooting.object.rightTopCorner.x, y: shooting.object.rightTopCorner.y }
            );
            const distanceToLeftBottom: number = distanceCheck(
              { x: shooting.origin.x, y: shooting.origin.y },
              { x: shooting.object.leftBottomCorner.x, y: shooting.object.leftBottomCorner.y }
            );
            const distanceToRightBottom: number = distanceCheck(
              { x: shooting.origin.x, y: shooting.origin.y },
              { x: shooting.object.rightBottomCorner.x, y: shooting.object.rightBottomCorner.y }
            );
            // make distance checks to all corners, and decide by that
            const distances: Record<string, number> = {
              distanceToLeftTop: distanceToLeftTop,
              distanceToRightTop: distanceToRightTop,
              distanceToLeftBottom: distanceToLeftBottom,
              distanceToRightBottom: distanceToRightBottom
            };

            const tankSide: string = determineSide(distances);
            shootLog = shootLog + 'round hits front plate. ';
            let armourAffected = shooting.object.armourFront;
            if (tankSide === 'side') {
              armourAffected = shooting.object.armourSide
              shootLog = shootLog + `side armour value: ${shooting.object.armourSide}. `;
            }
            if (tankSide === 'back') {
              shootLog = shootLog + 'round hits back plates. ';
              armourAffected = shooting.object.armourSide;
              armourSofteners++;
            }

            console.log('target is tank', armourAffected);
            const armorDice = callDice(6);
            const finalArmour = armorDice + armourHardeners + armourAffected;
            const finalPenetration = shooting.weapon.AT + armourSofteners;
            shootLog = shootLog + `armour: ${finalArmour} (dice: ${armorDice} + mod+ ${armourHardeners} + armour: ${armourAffected}). `;
            shootLog = shootLog + `penetrating dice: ${finalPenetration} at: ${shooting.weapon.AT} mod+ ${armourSofteners}. `;

            if (finalArmour === finalPenetration) {
              shootLog = shootLog + 'glancing hit! ';
              const firePowerDice = callDice(6);
              if (firePowerDice >= shooting.weapon.FP) {
                const randomDice = callDice(6);
                switch (randomDice) {
                  case 1:
                    shootLog = shootLog + 'track damage. ';
                    shooting.object.speed = shooting.object.speed - 10;
                    if (shooting.object.speed < 0) { shooting.object.speed = 0 }
                    break;
                  case 2:
                    shootLog = shootLog + 'engine damage. ';
                    shooting.object.motorPower = shooting.object.motorPower / 2;
                    break;
                  case 3:
                    shootLog = shootLog + 'crew shaken. ';
                    shooting.object.shaken = true;
                    shooting.object.combatWeapons.forEach((wep: any) => {
                      wep.reload = 0;
                    });
                    break;
                  case 4:
                    shootLog = shootLog + 'crew stunned. ';
                    shooting.object.stunned = true;
                    shooting.object.combatWeapons.forEach((wep: any) => {
                      wep.reload = 0;
                    });
                    break;
                  case 5:
                    shootLog = shootLog + 'immobilized. ';
                    shooting.object.speed = 0;
                    shooting.object.currentSpeed = 0;
                    break;
                  case 6:
                    shootLog = shootLog + 'weapons damaged. ';
                    shooting.object.combatWeapons.forEach((wep: any) => {
                      wep.firerate = wep.firerate * 2;
                    });
                    break;
                  default: console.log('glancing dice not found! ', randomDice);
                };
              } else {
                shootLog = shootLog + 'no damage!';
              }
            } else if (finalArmour < finalPenetration) {
              shootLog = shootLog + 'penetrating hit!. ';
              const firePowerDice = callDice(6);

              if (firePowerDice >= shooting.weapon.FP) {
                shootLog = shootLog + 'destroyed!. ';
                shooting.object.disable();
                shooting.origin.kills.push(shooting.object.name);
              } else {
                const randomDice = callDice(6);
                switch (randomDice) {
                  case 1:
                    shootLog = shootLog + 'track damage. ';
                    shooting.object.speed = shooting.object.speed - 10;
                    if (shooting.object.speed < 0) { shooting.object.speed = 0 }
                    break;
                  case 2:
                    shootLog = shootLog + 'engine damage. ';
                    shooting.object.motorPower = shooting.object.motorPower / 2;
                    break;
                  case 3:
                    shootLog = shootLog + 'crew shaken. ';
                    shooting.object.shaken = true;
                    shooting.object.combatWeapons.forEach((wep: any) => {
                      wep.reload = 0;
                    });
                    break;
                  case 4:
                    shootLog = shootLog + 'crew stunned. ';
                    shooting.object.stunned = true;
                    shooting.object.combatWeapons.forEach((wep: any) => {
                      wep.reload = 0;
                    });
                    break;
                  case 5:
                    shootLog = shootLog + 'immobilized. ';
                    shooting.object.speed = 0;
                    shooting.object.currentSpeed = 0;
                    break;
                  case 6:
                    shootLog = shootLog + 'weapons damaged. ';
                    shooting.object.combatWeapons.forEach((wep: any) => {
                      wep.firerate = wep.firerate * 2;
                    });
                    break;
                  default: console.log('glancing dice not found!', randomDice);
                };
              }
            }
          } else {
            console.log('target is infantry or gun');
            const saveDice = callDice(6);

            if (saveDice >= shooting.object.save) {
              shootLog = shootLog + `save ok, team saved: ${saveDice}. `;
            } else {

              // gun shield
              if (shooting.object.specials.includes('gun shield')) {
                const firePowerDice = callDice(6);

                if (firePowerDice >= shooting.weapon.FP) {
                  shootLog = shootLog + `ammo punches through the gun shield: ${firePowerDice}. `;
                  shooting.object.disable();
                  shooting.origin.kills.push(shooting.object.name);
                } else {
                  shootLog = shootLog + `Gun shield saves the team. FP dice: ${firePowerDice}. `;
                }
                
                shootLog = shootLog + `save ok, team saved: ${saveDice}. `;
              } else {
                shootLog = shootLog + `save failed: ${saveDice}. Team is dead.`;
                shooting.object.disable();
                shooting.origin.kills.push(shooting.object.name);
              }

              // need to add if in cover/foxholes

            }
          }

        } else {
          shootLog = shootLog + 'it is a miss!';
        }
        setLog([shootLog, ...log]);
      } else {
        console.log('cant fire. ', shooting.weapon.reload, ' / ', shooting.weapon.firerate);
      }
    }

  });
  return attacksToResolve;
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
        shootLog = shootLog + t.name + 'out of shake. dices: '+ motivationTest, skillTest+ 'vs: '+ t.motivation, t.skill;
        t.shaken = false;
      }
    }

    // shake of stuns
    if (t.stunned) {
      const motivationTest = callDice(12);
      const skillTest = callDice(6);
      if (motivationTest < t.motivation && skillTest < t.skill) {
        shootLog = shootLog + t.name + ' out of stun, but shaken. dices: '+ motivationTest, skillTest+ 'vs: '+ t.motivation, t.skill;
        t.shaken = true;
        t.stunned = false;
      }
    }
  }

  if (shootLog !== '') { setLog([shootLog, ...log]);}

  return t;
}
