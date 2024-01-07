import { losBullet } from "../data/classes";
import { AttacksBox, CollisionResponse, GameObject, Team } from "../data/sharedInterfaces";
import { callDice, checkLOS, distanceCheck, findTeamById, findTeamByLocation } from "./helpFunctions";
import { collisionCheck, resolveCollision } from "./collisionDetect";

export const resolveActions = (inTurn: any, opponents: any, gameObject: GameObject, attacksToResolve: any[], bombsToResolve: any[], scale: number, setLog: any, log: string[]) => {

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
                    //smoke
                    gameObject.smokes?.push({ x: team.x, y: team.y, size: (7 - weapon.FP) }); // gun
                    //gameObject.smokes?.push({ x: dt.x, y: dt.y, size: (11 - weapon.FP) }); // target
                    //explosion
                    gameObject.explosions?.push({ x: team.x, y: team.y, size: (2) }); // gun
                    gameObject.explosions?.push({ x: dt.x, y: dt.y, size: (11 - weapon.FP) }); // target
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
        team.pinned === false &&
        team.speed > 0) {
        /*
         *  MOVE
         */

        if (team && team.order === 'move' && team.target &&
          (team.x !== team.target.x || team.y !== team.target.y)) {

          if (team.foxhole) { team.foxhole = false; }

          const getMovement = team.moveToTarget();
          const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');
          return resolveCollision(team, getMovement, check);

        }

        /*
         *  ATTACK
         */

        else if (team && team.order === 'attack' && team.stunned === false && team.shaken === false) {

          let longestWeaponRange = 0;

          if (typeof (team.target) === 'string') {

            const target: Team = findTeamById(team.target, gameObject);

            if (target.disabled) { team.order = 'hold' }

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
              if (w.combatRange > longestWeaponRange) {
                longestWeaponRange = w.combatRange;
              }
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

                  const losResult: CollisionResponse = checkLOS(team, target, gameObject, checkDistance);

                  if (losResult.collision) {

                    if (losResult.id === target.uuid) {
                      attacksBox.attacks.push(attack);
                      attacksBox.hasLOS = true;
                      attacksBox.distance = checkDistance;
                    }

                  }

                }
              } else {

              }
            });

            //console.log('out of loop');
            // if in range and in LOS, push to attacksToResolve
            if (attacksBox.attacks.length > 0 && (attacksBox.hasLOS)) {
              //console.log('pushing to attacks to resolve');
              attacksBox.attacks.forEach((a: any) => {
                //console.log('pushing: ', a);
                attacksToResolve.push(a);
                //smoke
                gameObject.smokes?.push({ x: team.x, y: team.y, size: (7 - a.weapon.FP) }); // gun
                //gameObject.smokes?.push({ x: target.x, y: target.y, size: (11 - a.weapon.FP) }); // target
                //explosion
                gameObject.explosions?.push({ x: team.x, y: team.y, size: (2) }); // gun
                gameObject.explosions?.push({ x: target.x, y: target.y, size: (11 - a.weapon.FP) }); // target
              });
              //console.log('returning team');
              return team;
            } else {

              // if not in range (and LOS), move closer, if can
              if (checkDistance >= longestWeaponRange) {
                //console.log('changing to move; ', checkDistance, longestWeaponRange);

                if (team.foxhole) { team.foxhole = false; }

                team.target = { x: target.x, y: target.y }
                const getMovement = team.moveToTarget();

                if (getMovement === undefined) { console.log('gM und. at moving when no los/range'); }

                const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');

                return resolveCollision(team, getMovement, check);

              } else {
                return team;
              }
            }

          } else {
            console.log('team: ', team);
            console.log('target not string: ', typeof (team.target), team.target);
            if (typeof(team.target.x) === 'number') {
              const findingTarget = findTeamByLocation(team.target.x, team.target.y, gameObject, scale);
              return { ...team, target: findingTarget };
            } else {
              console.log('did not find, returning: ', team);
              return team;
            }
            /*
            const findingTarget = findTeamByLocation(team.target.x, team.target.y, gameObject, scale);
            //console.log('returning back with original target: ', findingTarget);
            return { ...team, target: findingTarget };
            */
          }

        }

        /**
         *        BOMBARD
         */

        else if (team && team.order === 'bombard' && typeof (team.target.y) === 'number' &&
          team.stunned === false && team.shaken === false) {

          // check if in range of bombard
          const checkDistance: number = distanceCheck(
            { x: team.x, y: team.y },
            { x: team.target.x, y: team.target.y }
          );

          // if in range
          team.combatWeapons?.forEach((w: any) => {
            //console.log('comparing: ', w.combatRange, checkDistance);
            if (checkDistance < w.combatRange &&
              (w.specials.includes('artillery')) &&
              w.reload >= w.firerate) {

              const attack = {
                weapon: w,
                origin: team,
                object: { x: team.target.x, y: team.target.y },
                observer: false
              };

              // check if observers
              inTurn.units.forEach((itU: any) => {
                itU.teams.forEach((itUt: Team) => {
                  if (itUt.order === 'observing') {
                    attack.observer = true;
                    setLog([`${itUt.name} observes for ${team.name}'s bombardment.`, ...log]);
                  }
                });
              });
              //console.log('pushed to bombs', attack);
              bombsToResolve.push(attack);
              //smoke
              gameObject.smokes?.push({ x: team.x, y: team.y, size: (7 - attack.weapon.FP) }); // gun
              gameObject.smokes?.push({ x: team.target.x, y: team.target.y, size: (14 - attack.weapon.FP) }); // target
              //explosion
              gameObject.explosions?.push({ x: team.x, y: team.y, size: (2) }); // gun
              gameObject.explosions?.push({ x: team.target.x, y: team.target.y, size: (14 - attack.weapon.FP) }); // target
            }
          });

          return team;
        }

        /**
         *       SMOKE BOMBARD
         */

        else if (team && team.order === 'smoke bombard' && typeof (team.target.y) === 'number' &&
          team.stunned === false && team.shaken === false) {

          // check if in range of bombard
          const checkDistance: number = distanceCheck(
            { x: team.x, y: team.y },
            { x: team.target.x, y: team.target.y }
          );

          // if in range
          team.combatWeapons?.forEach((w: any) => {
            //console.log('comparing: ', w.combatRange, checkDistance);
            if (checkDistance < w.combatRange &&
              (w.specials.includes('artillery')) &&
              w.reload >= w.firerate) {

              const attack = {
                weapon: w,
                origin: team,
                object: { x: team.target.x, y: team.target.y },
                observer: false
              };

              // check if observers
              inTurn.units.forEach((itU: any) => {
                itU.teams.forEach((itUt: Team) => {
                  if (itUt.order === 'observing') {
                    attack.observer = true;
                    setLog([`${itUt.name} observes for ${team.name}'s bombardment.`, ...log]);
                  }
                });
              });
              //console.log('pushed to bombs', attack);
              //bombsToResolve.push(attack);
              //smoke
              gameObject.smokes?.push({ x: team.x, y: team.y, size: (7 - attack.weapon.FP) }); // gun
              gameObject.smokes?.push({ x: JSON.stringify(team.target.x), y: JSON.stringify(team.target.y), size: (50 - attack.weapon.FP) }); // target
              //explosion
              gameObject.explosions?.push({ x: team.x, y: team.y, size: (2) }); // gun
              gameObject.explosions?.push({ x: team.target.x, y: team.target.y, size: (14 - attack.weapon.FP) }); // target
              w.reload = 0;
            }
          });

          return team;
        }

        else if (team && team.order === 'dig foxholes' && team.shaken === false && team.stunned === false) {
          // if test is passed, the fox holes are ok.
          const skillTest = callDice(12);

          if (skillTest < team.skill) {
            team.foxhole = true;
            team.order = 'hold';
          }

          return team;
        }

        /**
         * 
         *          SMOKE SHOT
         * 
         */
        else if (team && team.order === 'smoke' && team.disabled === false && team.shaken === false && team.stunned === false) {

          let longestWeaponRange = 0;

          if (typeof (team.target) === 'string') {

            const target: Team = findTeamById(team.target, gameObject);

            if (target.disabled) { team.order = 'hold' }

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
              if (w.specials.includes('smoke') && !w.specials.includes('artillery')) {

                longestWeaponRange = w.combatRange;

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

                    const losResult: CollisionResponse = checkLOS(team, target, gameObject, checkDistance);

                    if (losResult.collision) {

                      if (losResult.id === target.uuid) {
                        attacksBox.attacks.push(attack);
                        attacksBox.hasLOS = true;
                        attacksBox.distance = checkDistance;
                        w.reload = 0;
                      }

                    }

                  }
                } else {

                }
              }

            });

            //console.log('out of loop');
            // if in range and in LOS, push to attacksToResolve
            if (attacksBox.attacks.length > 0 && (attacksBox.hasLOS)) {
              //console.log('pushing to attacks to resolve');
              attacksBox.attacks.forEach((a: any) => {
                //console.log('pushing: ', a);
                //attacksToResolve.push(a);
                //smoke
                gameObject.smokes?.push({ x: team.x, y: team.y, size: (7 - a.weapon.FP) }); // gun
                gameObject.smokes?.push({ x: JSON.stringify(target.x), y: JSON.stringify(target.y), size: (50 - a.weapon.FP) }); // target
                //explosion
                gameObject.explosions?.push({ x: team.x, y: team.y, size: (2) }); // gun
                gameObject.explosions?.push({ x: target.x, y: target.y, size: (11 - a.weapon.FP) }); // target
                
              });
              //console.log('returning team');
              return team;
            } else {

              // if not in range (and LOS), move closer, if can
              if (checkDistance >= longestWeaponRange) {
                //console.log('changing to move; ', checkDistance, longestWeaponRange);

                if (team.foxhole) { team.foxhole = false; }

                team.target = { x: target.x, y: target.y }
                const getMovement = team.moveToTarget();

                if (getMovement === undefined) { console.log('gM und. at moving when no los/range'); }

                const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');

                return resolveCollision(team, getMovement, check);

              } else {
                return team;
              }
            }

          } else {
            //console.log('target not string: ', typeof (team.target), team.target);
            const findingTarget = findTeamByLocation(team.target.x, team.target.y, gameObject, scale);
            //console.log('returning back with original target: ', findingTarget);
            return { ...team, target: findingTarget };
          }

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