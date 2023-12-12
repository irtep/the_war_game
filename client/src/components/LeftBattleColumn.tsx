import React, { useContext, useEffect } from 'react';
import { FlamesContext } from '../context/FlamesContext';

const LeftBattleColumn: React.FC = (): React.ReactElement => {
  const { gameObject, hovered } = useContext(FlamesContext);
  const column10StyleSecondRow: React.CSSProperties = {
    flex: '1 0 10%',
    backgroundColor: 'rgb(80,80,80)', // Optional: Add background color for visualization
  };

  useEffect( () => {
    console.log('hovered: ', hovered);
  }, [hovered]);

  return <div style={column10StyleSecondRow}>
    {hovered}
  </div>;
};

export default LeftBattleColumn;