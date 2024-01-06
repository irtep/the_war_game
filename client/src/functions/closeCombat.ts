import { GameObject, Team } from "../data/sharedInterfaces";
import { callDice, distanceCheck } from "./helpFunctions";

export const closeCombat = (gameObject: GameObject, setLog: any, log: string[]) => {
    // check if anyone is close enough to fight
    gameObject.attacker.units.forEach((u: any) => {
        u.teams.forEach((t: Team) => {

            gameObject.defender.units.forEach((u2: any) => {
                u2.teams.forEach((t2: Team) => {

                    const distance = distanceCheck(t, t2);
                    let toLog = '';

                    if (distance < 50 && (t.type !== 'tank' && t2.type !== 'tank')) {
                        const tDice = callDice(6);
                        const t2Dice = callDice(6);
                        let tHits = tDice + t.mat;
                        let t2Hits = t2Dice + t2.mat;

                        if (t.shaken) { tHits--; }; if (t2.shaken) { t2Hits--; };
                        if (t.stunned) { tHits--; }; if (t2.stunned) { t2Hits--; };
                        if (t.pinned) { tHits--; }; if (t2.pinned) { t2Hits--; };

                        toLog = toLog + `close combat. ${t.name} vs ${t2.name}. values: ${tHits} vs ${t2Hits} (dice ${tDice} skill ${t.mat}) (dice ${t2Dice} skill ${t2.skill})`;

                        if (tHits > t2Hits) {

                            if (t2.type === 'tank') {
                                let highestPower = 0;
                                let armourScore = 0;
                                let gunName = '';
                                const defDice = callDice(6);
                                
                                t.combatWeapons?.forEach( (w:any) => {
                                    if (w.AT > highestPower) { 
                                        highestPower = w.AT;
                                        gunName = w.name;
                                    }
                                })

                                if (highestPower === 2) {
                                    armourScore = t2.armourTop + defDice;
                                    toLog = toLog + `${t.name} with improvised weapons vs top armour. (${highestPower} vs ${armourScore}) (a: ${t2.armourTop} + d: ${defDice})`;
                                } else {
                                    armourScore = t2.armourSide + callDice(6);
                                    toLog = toLog + `${t.name} with ${gunName} vs side armour. (${highestPower} vs ${armourScore}) (a: ${t2.armourSide} + d: ${defDice})`;                                   
                                }

                                if (highestPower > armourScore) {
                                    t2.disable();
                                    t.kills?.push(t2.name);
                                    toLog = toLog + `${t2.name} destroyed`;
                                } 
                                else if (highestPower === armourScore) {
                                    t2.stunned = true;
                                    toLog = toLog + `${t2.name} stunned`;
                                }

                            } else {
                                t2.disable();
                                t.kills?.push(t2.name);
                            }
                            
                        }
                        else if (t2Hits > tHits) {
                            
                            if (t.type === 'tank') {
                                let highestPower = 0;
                                let armourScore = 0;
                                let gunName = '';
                                const defDice = callDice(6);
                                
                                t2.combatWeapons?.forEach( (w:any) => {
                                    if (w.AT > highestPower) { 
                                        highestPower = w.AT;
                                        gunName = w.name;
                                    }
                                })

                                if (highestPower === 2) {
                                    armourScore = t.armourTop + defDice;
                                    toLog = toLog + `${t2.name} with improvised weapons vs top armour. (${highestPower} vs ${armourScore}) (a: ${t.armourTop} + d: ${defDice})`;
                                } else {
                                    armourScore = t.armourSide + callDice(6);
                                    toLog = toLog + `${t2.name} with ${gunName} vs side armour. (${highestPower} vs ${armourScore}) (a: ${t.armourSide} + d: ${defDice})`;                                   
                                }

                                if (highestPower > armourScore) {
                                    t.disable();
                                    t2.kills?.push(t.name);
                                    toLog = toLog + `${t2.name} destroyed`;
                                } 
                                else if (highestPower === armourScore) {
                                    t.stunned = true;
                                    toLog = toLog + `${t2.name} stunned`;
                                }

                            } else {
                                t.disable();
                                t2.kills?.push(t2.name);
                                toLog = toLog + `${t2.name} destroyed`;
                            }
                        }

                        setLog([toLog, ...log]);
                    }

                });
            });

        });
    });
}