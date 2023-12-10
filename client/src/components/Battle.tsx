import React, { useEffect, useContext } from 'react';
import FirstBattleRow from './FirstBattleRow';
import SecondBattleRow from './SecondBattleRow';
import { FlamesContext } from '../context/FlamesContext';
import { Army } from '../data/sharedInterfaces';
import { createBattleArmies, createBattleMap } from '../functions/setupFunctions';

const Battle: React.FC = (): React.ReactElement => {
  const { terrains,
    setupObject,
    gameObject,
    setGameObject,
    armies
  } = useContext(FlamesContext);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
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