import exp from "constants";
import { Explosion, Smoke, Team } from "../data/sharedInterfaces";
import { callDice } from "./helpFunctions";

export const upkeepPhase = (t: Team, setLog: any, log: string[]): Team => {
    let shootLog = '';
  
    if (t.disabled === false) {
  
      // reload
      t.combatWeapons?.forEach((w: any) => {
        if (w.reload < w.firerate && t.disabled === false &&
          t.shaken === false && t.stunned === false && t.pinned === false) {
          w.reload = w.reload + 5;
          if (w.reload > w.firerate) {
            w.reload = w.firerate
          }
        }
      });
  
      // shake of shakes
      if (t.shaken) {
        const motivationTest = callDice(12);
        const skillTest = callDice(12);
        if (motivationTest < t.motivation && skillTest < t.skill) {
          //shootLog = shootLog + `${t.name} out of shake. tests: ${motivationTest}, ${skillTest} vs skills: ${t.motivation}, ${t.skill}`;
          t.shaken = false;
        }
      }
  
      // shake of stuns
      if (t.stunned) {
        const motivationTest = callDice(12);
        const skillTest = callDice(12);
        if (motivationTest < t.motivation && skillTest < t.skill) {
          //shootLog = shootLog + `${t.name} out of stun. tests: ${motivationTest}, ${skillTest} vs: ${t.motivation}, ${t.skill}`;
          t.shaken = true;
          t.stunned = false;
        }
      }
  
      // shake pins
      if (t.pinned) {
        const motivationTest = callDice(12);
        const skillTest = callDice(12);
        if (motivationTest < t.motivation && skillTest < t.skill) {
          //shootLog = shootLog + `${t.name} out of pin. tssts: ${motivationTest}, ${skillTest} vs: ${t.motivation}, ${t.skill}`;
          t.shaken = true;
          t.stunned = false;
        }
      }
    }
  
    if (shootLog !== '') { setLog([shootLog, ...log]); }
  
    return t;
  }

  export const handleSmokesAndExplosions = ((smokesOrExplosions: any, explosion: boolean) => {
    
    smokesOrExplosions.forEach( (sOe: Smoke | Explosion) => {
      sOe.size--;
      if (explosion) {
        sOe.size--;
        sOe.size--;
      }
    });

    return smokesOrExplosions.filter( (sOe: Smoke | Explosion) => sOe.size > 0 );

  });