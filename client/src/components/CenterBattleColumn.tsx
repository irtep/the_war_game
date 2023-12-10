import React from 'react';

const CenterBattleColumn: React.FC = (): React.ReactElement => {
  const centerBattleColumnStyle: React.CSSProperties = {
    flex: '1 0 80%',
    backgroundColor: 'lightcoral', // Optional: Add background color for visualization
  };

  return <div style={centerBattleColumnStyle}>Column 2</div>;
};

export default CenterBattleColumn;