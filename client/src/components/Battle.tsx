import React from 'react';
import FirstBattleRow from './FirstBattleRow';
import SecondBattleRow from './SecondBattleRow';

const Battle: React.FC = (): React.ReactElement => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  };

  return (
    <div style={containerStyle}>
      <FirstBattleRow />
      <SecondBattleRow />
    </div>
  );
};

export default Battle;