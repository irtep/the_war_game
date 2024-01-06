import { GameObject, Team } from "../data/sharedInterfaces";
import { callDice } from "./helpFunctions";

export const resolveBombs = (bombsToResolve: any[], updatedGameObject: GameObject, setLog: any, log: string[]): any => {
    console.log('resolving bobbs');
    bombsToResolve.forEach((shooting: any) => {
        console.log('shooting: ', shooting);
        if (shooting.object.disabled === true) {
            shooting.origin.order = 'hold';
            //console.log('shooted disabled');
        } else {
            //console.log('shooted not disabled');
            if (shooting.weapon.reload >= shooting.weapon.firerate &&
                shooting.origin.shaken === false &&
                shooting.origin.stunned === false) {
                //console.log('ok to shoot');
                let shootLog: string = '';
                let hitHelpers = 0;
                let defHelpers = 0;

                // empty the gun
                shooting.weapon.reload = 0;
                shootLog = shootLog + `${shooting.origin.name} bombing with ${shooting.weapon.name}. `;

                // if aiming:
                /* disabled for now, always everyone was getting... gotta think about this.
                if (attacker.order === 'hold') {
                  hitHelpers++;
                  shootLog = shootLog + 'shooter is aiming carefully. ';
                }*/
                if (shooting.observer) {
                    hitHelpers++;
                } else {
                    defHelpers++;
                }

                const arcVsArc = (loc1: any, loc2: any) => {
                    loc1.radius = 25;
                    loc2.radius = 25;
                    const dx = loc1.x - loc2.x;
                    const dy = loc1.y - loc2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    const colliding = distance < loc1.radius + loc2.radius;
                    return colliding;
                };

                const hitTests = (army: any) => {
                    army.units.forEach((au: any) => {

                        au.teams.forEach((t: Team) => {
                            const testIfHit = arcVsArc({ x: shooting.object.x, y: shooting.object.y }, { x: t.x, y: t.y });

                            // if hit:
                            if (testIfHit) {
                                console.log('found target: ', t.name);
                                let hitDice = callDice(12);
                                const finalHitScore = hitDice + shooting.origin.rat + hitHelpers;
                                const finalDefScore = t.def + defHelpers;
                                shootLog = shootLog + `final hit: ${finalHitScore} dice ${hitDice} skill: ${shooting.origin.rat} mod+: ${hitHelpers}. `;
                                shootLog = shootLog + `def of object: ${t.def} + mod+ ${defHelpers}= ${finalDefScore}. `;

                                // target is pinned if infantry or gun
                                if (t.type === 'infantry' || t.type === 'gun') {
                                    t.pinned = true;
                                }

                                if (finalHitScore >= finalDefScore) {

                                    shootLog = shootLog + 'target is hit! ';

                                    if (t.type === 'tank') {
                                        let armourAffected = t.armourTop;

                                        const armorDice = callDice(6);
                                        const finalArmour = armorDice + armourAffected;
                                        const finalPenetration = shooting.weapon.AT;
                                        shootLog = shootLog + `armour: ${finalArmour} (dice: ${armorDice} + armour: ${armourAffected}). `;
                                        shootLog = shootLog + `penetrating power: ${shooting.weapon.AT}. `;

                                        if (finalArmour === finalPenetration) {
                                            shootLog = shootLog + 'glancing hit! ';
                                            const firePowerDice = callDice(6);
                                            if (firePowerDice >= shooting.weapon.FP) {
                                                const randomDice = callDice(6);
                                                switch (randomDice) {
                                                    case 1:
                                                        shootLog = shootLog + 'track damage. ';
                                                        t.speed = t.speed - 10;
                                                        if (t.speed < 0) { t.speed = 0 }
                                                        break;
                                                    case 2:
                                                        shootLog = shootLog + 'engine damage. ';
                                                        if (t.motorPower) {
                                                            t.motorPower = t.motorPower / 2;
                                                        }
                                                        break;
                                                    case 3:
                                                        shootLog = shootLog + 'crew shaken. ';
                                                        t.shaken = true;
                                                        t.combatWeapons?.forEach((wep: any) => {
                                                            wep.reload = 0;
                                                        });
                                                        break;
                                                    case 4:
                                                        shootLog = shootLog + 'crew stunned. ';
                                                        t.stunned = true;
                                                        t.combatWeapons?.forEach((wep: any) => {
                                                            wep.reload = 0;
                                                        });
                                                        break;
                                                    case 5:
                                                        shootLog = shootLog + 'immobilized. ';
                                                        t.speed = 0;
                                                        t.currentSpeed = 0;
                                                        break;
                                                    case 6:
                                                        shootLog = shootLog + 'weapons damaged. ';
                                                        t.combatWeapons?.forEach((wep: any) => {
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
                                                t.disable();
                                                shooting.origin.kills.push(t.name);
                                            } else {
                                                const randomDice = callDice(6);
                                                switch (randomDice) {
                                                    case 1:
                                                        shootLog = shootLog + 'track damage. ';
                                                        t.speed = t.speed - 10;
                                                        if (t.speed < 0) { t.speed = 0 }
                                                        break;
                                                    case 2:
                                                        shootLog = shootLog + 'engine damage. ';
                                                        if (t.motorPower) {
                                                            t.motorPower = t.motorPower / 2;
                                                        }
                                                        break;
                                                    case 3:
                                                        shootLog = shootLog + 'crew shaken. ';
                                                        t.shaken = true;
                                                        t.combatWeapons?.forEach((wep: any) => {
                                                            wep.reload = 0;
                                                        });
                                                        break;
                                                    case 4:
                                                        shootLog = shootLog + 'crew stunned. ';
                                                        t.stunned = true;
                                                        t.combatWeapons?.forEach((wep: any) => {
                                                            wep.reload = 0;
                                                        });
                                                        break;
                                                    case 5:
                                                        shootLog = shootLog + 'immobilized. ';
                                                        t.speed = 0;
                                                        t.currentSpeed = 0;
                                                        break;
                                                    case 6:
                                                        shootLog = shootLog + 'weapons damaged. ';
                                                        t.combatWeapons?.forEach((wep: any) => {
                                                            wep.firerate = wep.firerate * 2;
                                                        });
                                                        break;
                                                    default: console.log('glancing dice not found!', randomDice);
                                                };
                                            }
                                        }
                                    } else {
                                        // infantry or gun
                                        const saveDice = callDice(6);

                                        if (saveDice >= t.save) {
                                            shootLog = shootLog + `save ok, team saved: ${saveDice}. `;
                                        } else {

                                            // fox hole
                                            if (t.foxhole) {
                                                const firePowerDice = callDice(6);

                                                if (firePowerDice >= shooting.weapon.FP) {
                                                    shootLog = shootLog + `Foxhole did not save. FP dice: ${firePowerDice}. `;
                                                    t.disable();
                                                    shooting.origin.kills.push(t.name);
                                                } else {
                                                    shootLog = shootLog + `Foxhole saves. FP dice: ${firePowerDice}. `;
                                                }

                                            } else {
                                                shootLog = shootLog + `save failed: ${saveDice}. Team is dead.`;
                                                t.disable();
                                                shooting.origin.kills.push(t.name);
                                            }

                                        }
                                    }

                                } else {

                                }
                                console.log('writing log');
                                setLog([shootLog, ...log]);
                            } else {
                                //console.log('cant fire. ', shooting.weapon.reload, ' / ', shooting.weapon.firerate);
                            }
                        });

                    });
                }

                hitTests(updatedGameObject.attacker);
                hitTests(updatedGameObject.defender);

            }
        }
    });

    return bombsToResolve;
};