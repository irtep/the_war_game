import { GameObject } from "../data/sharedInterfaces";
import { checkLOS, distanceCheck, findTeamById } from "./helpFunctions";

export const decideActions = (units: any, opponents: any, gameObject: GameObject) => {

    units.forEach((u: any) => {
        u.teams.forEach((t: any) => {
            let decided = false;
            let myGunRange = 0;
            let bestAT = 2;
            let closestDistance = 1000;
            let closestEnemy = '';
            let typeOfClosest = '';

            // default order hold is good, as it gives good change to shoot

            // if infantry range of tank MG or infantry, need to shoot
            if (t.type !== 'gun') {
                t.combatWeapons.forEach((w: any) => {

                    if (w.name.includes('MG') || (!w.specials.includes('artillery') && t.type === 'infantry')) {

                        opponents.forEach((ou: any) => {
                            //console.log('ou: ', ou);
                            // if gun teams
                            ou.teams.forEach((ot: any) => {
                                const distance = distanceCheck(t, ot);

                                if (distance < closestDistance) {
                                    closestDistance = distance;
                                    closestEnemy = ot.uuid;
                                    typeOfClosest = ot.type;
                                }

                                if (distance < w.combatRange) {
                                  //  const targetTeam = findTeamById(ot.uuid, gameObject);
                                  //  const losCheck = checkLOS(t, targetTeam, gameObject, distance);

                                   // if (losCheck.id === ot.uuid) {
                                        t.order = 'attack';
                                        t.target = ot.uuid;
                                        decided = true;
                                   // }
                                }
                            });
                        });
                    }
                });
            }

            // if tank at range of tank, need to shoot
            if (decided === false && t.type !== 'infantry') {
                t.combatWeapons.forEach((w: any) => {

                    if (!w.specials.includes('artillery')) {

                        opponents.forEach((ou: any) => {
                            //console.log('ou: ', ou);
                            // if gun teams
                            ou.teams.forEach((ot: any) => {
                                if (ot.disabled === false) {
                                    const distance = distanceCheck(t, ot);

                                    if (distance < closestDistance) {
                                        closestDistance = distance;
                                        closestEnemy = ot.uuid;
                                        typeOfClosest = ot.type;
                                    }
    
                                    if (distance < w.combatRange) {
                                  //      const targetTeam = findTeamById(ot.uuid, gameObject);
                                  //      const losCheck = checkLOS(t, targetTeam, gameObject, distance);
    
                                    //    if (losCheck.id === ot.uuid) {
                                            t.order = 'attack';
                                            t.target = ot.uuid;
                                            decided = true;
                                      //  }
                                    }
                                }
 
                            });
                        });
                    }
                });
            }

            // check if can bomb
            t.combatWeapons.forEach((cb: any) => {
                if (cb.combatRange > myGunRange &&
                    !cb.specials.includes('artillery')) { myGunRange = cb.combatRange; }

                if (cb.specials.includes('artillery') && decided === false) {
                    let targetFound = false;

                    opponents.forEach((ou: any) => {
                        //console.log('ou: ', ou);
                        // if gun teams
                        ou.teams.forEach((ot: any) => {
                            const distance = distanceCheck(t, ot);

                            if (distance < closestDistance) {
                                closestDistance = distance;
                                closestEnemy = ot.uuid;
                                typeOfClosest = ot.type;
                            }

                            if (!cb.specials.includes('artillery') && cb.AT > bestAT) { bestAT = cb.AT; }

                            if (ot.type === 'gun') {

                                if (distance < cb.combatRange) {
                                    t.order = 'bombard';
                                    t.target = { x: ot.x, y: ot.y }
                                    targetFound = true;
                                    decided = true;
                                }
                            }
                        });

                        if (targetFound === false) {
                            // if infantry teams
                            ou.teams.forEach((ot: any) => {
                                if (ot.type === 'infantry') {
                                    const distance = distanceCheck(t, ot);

                                    if (distance < cb.combatRange) {
                                        t.order = 'bombard';
                                        t.target = { x: ot.x, y: ot.y }
                                        targetFound = true;
                                        decided = true;
                                    }
                                }
                            });
                        }

                        if (targetFound === false) {
                            // if tanks
                            ou.teams.forEach((ot: any) => {
                                if (ot.type === 'gun') {
                                    const distance = distanceCheck(t, ot);

                                    if (distance < cb.combatRange) {
                                        t.order = 'bombard';
                                        t.target = { x: ot.x, y: ot.y }
                                        targetFound = true;
                                        decided = true;
                                    }
                                }
                            });
                        }

                    });
                }
            });

            if (decided === false && t.type === 'tank') {

                // check all opponents and if "t" is inside any shooting range, but outside "t" range, go closer
                // does not really work, need to move closer... and check the LOS
                opponents.forEach((ou: any) => {
                    ou.teams.forEach((ot: any) => {
                        const distanceToTeam = distanceCheck(t, ot);
                        let inRangeOfOpponentsGun = false;                               
                      //  const targetTeam = findTeamById(ot.uuid, gameObject);
                      //  const losCheck = checkLOS(t, targetTeam, gameObject, distanceToTeam);

                        ot.combatWeapons.forEach((oCw: any) => {
                            if (distanceToTeam <= oCw.combatRange &&
                                !oCw.specials.includes('artillery')) { 
                                    inRangeOfOpponentsGun = true; 
                                }
                            if (inRangeOfOpponentsGun && 
                                distanceToTeam > myGunRange //&&
                          //      losCheck.id === ot.uuid
                                ) {
                                t.order = 'attack';
                                //console.log('chose as target: ', ot.uuid);
                                t.target = ot.uuid;
                                decided = true;
                            }
                        });

                    });
                });
            }

            // if infantry team and close range of tank and does not have anti-tank. go assault
            if (decided === false &&
                t.type === 'infantry' &&
                bestAT < 3 &&
                typeOfClosest === 'tank' &&
                closestDistance < 150 &&
                t.foxhole === false) {
                t.order = 'attack';
                t.target = closestEnemy;
            }

            if (decided === false) {

            }

            // if bomber is a tank, but has other tank attacking it
            if (t.order === 'bombard' && t.type === 'tank') {
                // check all opponents and if "t" is inside any shooting range, but outside "t" range, go closer
                opponents.forEach((ou: any) => {
                    ou.teams.forEach((ot: any) => {
                        const distanceToTeam = distanceCheck(t, ot);
                        let inRangeOfOpponentsGun = false;

                        ot.combatWeapons.forEach((oCw: any) => {
                            if (distanceToTeam <= oCw.combatRange) { inRangeOfOpponentsGun = true; }
                            if (inRangeOfOpponentsGun && distanceToTeam > myGunRange && ot.type === 'tank') {
                                const targetTeam = findTeamById(ot.uuid, gameObject);
                                const losCheck = checkLOS(t, targetTeam, gameObject, distanceToTeam);

                                if (losCheck.id === ot.uuid) {
                                    t.order = 'move';
                                    t.target = { x: targetTeam.x, y: targetTeam.y }
                                    decided = true;
                                } else {
                                    // keep bombing
                                }

                            }
                        });

                    });
                });
            }

            // if attacking, but target is dead, hold
            if (t.order === 'attack' && typeof(t.target) === 'string') {
                const targetTeam = findTeamById(t.target, gameObject);
                if (targetTeam.disabled) {
                    t.order = 'hold';
                    t.target = '';
                }
            }
        });
    });
};