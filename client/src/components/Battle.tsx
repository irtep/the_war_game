import React, { useEffect, useContext } from 'react';
import FirstBattleRow from './FirstBattleRow';
import SecondBattleRow from './SecondBattleRow';
import { FlamesContext } from '../context/FlamesContext';
import { Army, Team } from '../data/sharedInterfaces';
import { createBattleMap, prepareWeapons } from '../functions/setupFunctions';

const Battle: React.FC = (): React.ReactElement => {
  const { terrains,
    setupObject,
    gameObject,
    setGameObject,
    armies,
    teams,
    weapons
  } = useContext(FlamesContext);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  };

  const createBattleArmies = (input: Army, attacker: boolean): Army => {

    let parsedArmy: Army = {
      user: '',
      name: '',
      faction: '',
      game: '',
      points: 0,
      units: []
    };

    for (let [key, value] of Object.entries(input)) {
      console.log('teams: ', teams);
      if (key === 'units') {

        parsedArmy.units = JSON.parse(value as string);

        parsedArmy.units.forEach((unit: any, i: number) => {

          unit.teams.forEach((team: any, h: number) => {

            // find team that has same name
            const foundFromDB: Team[] = teams.filter((t: Team) => t.name === team.team);

            for (let [tkey, tvalue] of Object.entries(foundFromDB[0])) {
              if (tvalue !== '') {
                team[tkey] = tvalue;
              }
            }

            //console.log('fdb: ', foundFromDB);

            team.x = 1000;
            team.y = 1000;
            team.a = 0;
            team.disabled = false;
            team.kills = [];
            team.tacticalNumber = String(i) + String(h);
            team.unit = '';
            if (attacker) {
              team.unit = 'a' + String(i);
              team.uuid = 'a' + String(i) + String(i) + String(h);
            } else {
              team.unit = 'd' + String(i);
              team.uuid = 'd' + String(i) + String(i) + String(h);
            }
            // experience bonuses
            switch (team.crew) {
              case 'veteran':
                team.rat = team.rat + 1;
                team.mat = team.mat + 1;
                break;
              case 'elite':
                team.rat = team.rat + 1;
                team.mat = team.mat + 1;
                team.def = team.def + 1;
                team.reactions = team.reactions + 1;
                team.skill = team.skill + 1;
                break;
              case 'ace':
                team.rat = team.rat + 2;
                team.mat = team.mat + 2;
                team.def = team.def + 2;
                team.reactions = team.reactions + 2;
                team.skill = team.skill + 2;
                if (team.save > 0) {
                  team.save = team.save + 1;
                }
                break;
            };
            // weapons and reloads
            team.combatWeapons = prepareWeapons(team.weapons, weapons);
            // power/weight ratio
            team.motorPower = team.horsepowers / team.weight;
          });
        });

      } else {
        parsedArmy[key] = value;
      }
    }

    return parsedArmy;
  };

  useEffect(() => {

    // pregame setup
    if (gameObject.status === 'preBattle') {

      const attackersArmy = armies.filter((army: Army) => army.name === setupObject.attacker);
      const defendersArmy = armies.filter((army: Army) => army.name === setupObject.defender);
      const selectedMap = terrains.filter((terrain: any) => terrain.name === setupObject.terrain);

      setGameObject({
        ...gameObject,
        attacker: createBattleArmies(attackersArmy[0], true),
        defender: createBattleArmies(defendersArmy[0], false),
        status: 'deploy',
        terrain: createBattleMap(selectedMap[0])
      });

    };

    console.log(gameObject);
  }, [gameObject]);

  return (
    <div style={containerStyle}>
      <FirstBattleRow />
      <SecondBattleRow />
    </div>
  );
};

export default Battle;