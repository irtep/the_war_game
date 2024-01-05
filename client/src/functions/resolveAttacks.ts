import { GameObject } from "../data/sharedInterfaces";
import { callDice, determineSide, distanceCheck } from "./battleFunctions";

export const resolveAttacks = (attacksToResolve: any[], updatedGameObject: GameObject, setLog: any, log: string[]): any[] => {

    attacksToResolve.forEach((shooting: any) => {
      if (shooting.object.disabled === true) {
        shooting.origin.order = 'hold';
      } else {
        if (shooting.weapon.reload >= shooting.weapon.firerate &&
          shooting.origin.shaken === false &&
          shooting.origin.stunned === false) {
  
          let shootLog: string = '';
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
  
          if (shooting.object.type === 'infantry' && shooting.weapon.specials.includes('No HE')) {
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