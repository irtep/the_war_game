import React, { useEffect, useContext } from 'react';
import FirstBattleRow from './FirstBattleRow';
import SecondBattleRow from './SecondBattleRow';
import { FlamesContext } from '../context/FlamesContext';
import { Army } from '../data/sharedInterfaces';
import { createBattleUnit } from '../functions/setupFunctions';

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
    console.log('battle: gO', gameObject);
    // pregame setup
    if (gameObject.status === 'preBattle') {
    // create battle units

    // look up attackers units (from setupObject) and create them as battleUnits to gameObject
    const attackersArmy = armies.filter( (army: Army, idx: number) => army.name === setupObject.attacker);
    
    console.log('attackersArmy: ', attackersArmy);
    // change status to 'battle's
    };

  }, [gameObject]);

  return (
    <div style={containerStyle}>
      <FirstBattleRow />
      <SecondBattleRow />
    </div>
  );
};

export default Battle;