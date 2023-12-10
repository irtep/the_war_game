import React from 'react';

const FirstBattleRow: React.FC = (): React.ReactElement => {
  const firstBattleRowStyle: React.CSSProperties = {
    flex: '1 0 10%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue', // Optional: Add background color for visualization
  };

  const centeredColumnStyle: React.CSSProperties = {
    width: '100%',
  };

  return (
    <div style={firstBattleRowStyle}>
      <div style={centeredColumnStyle}>Content of the first row</div>
    </div>
  );
};

export default FirstBattleRow;