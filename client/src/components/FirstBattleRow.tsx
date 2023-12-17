import React, { useContext } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { Typography } from '@mui/material';

const FirstBattleRow: React.FC = (): React.ReactElement => {
  const {
    gameObject,
    selected,
    isPaused,
    setIsPaused,
    mousePosition
  } = useContext(FlamesContext);

  const firstBattleRowStyle: React.CSSProperties = {
    flex: '1 0 7%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray', // Optional: Add background color for visualization
  };

  const centeredColumnStyle: React.CSSProperties = {
    width: '100%',
  };

  return (
    <div style={firstBattleRowStyle}>
      
      <div style={centeredColumnStyle}>
        <Typography>
          {mousePosition.x} {mousePosition.y}
        </Typography>
      </div>

      {
        (gameObject.status === 'battle' && isPaused === true) ?
          <Typography>
            GAME PAUSED
          </Typography> : <></>
      }
      {
        (gameObject.status === 'battle') ?
          <button onClick={ () => { setIsPaused(!isPaused)}}>
            toggle pause
          </button> : <></>
      }
 </div>
  );
};

export default FirstBattleRow;