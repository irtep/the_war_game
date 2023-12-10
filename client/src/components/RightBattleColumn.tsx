import React from 'react';

const RightBattleColumn: React.FC = (): React.ReactElement => {
  const rightBattleColumnStyle: React.CSSProperties = {
    flex: '1 0 10%',
    backgroundColor: 'lightgreen', // Optional: Add background color for visualization
  };

  return <div style={rightBattleColumnStyle}>Column 1</div>;
};

export default RightBattleColumn;