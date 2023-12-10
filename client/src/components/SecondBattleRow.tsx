import React from 'react';
import LeftBattleColumn from './LeftBattleColumn';
import CenterBattleColumn from './CenterBattleColumn';
import RightBattleColumn from './RightBattleColumn';

const SecondBattleRow: React.FC = (): React.ReactElement => {
  const secondRowStyle: React.CSSProperties = {
    flex: '1 0 93%',
    display: 'flex',
  };

  return (
    <div style={secondRowStyle}>
      <LeftBattleColumn />
      <CenterBattleColumn />
      <RightBattleColumn />
    </div>
  );
};

export default SecondBattleRow;