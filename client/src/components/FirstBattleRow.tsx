import React, { useContext } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { Typography } from '@mui/material';

const FirstBattleRow: React.FC = (): React.ReactElement => {
  const {
    gameObject,
    selected,
    isPaused,
    setIsPaused
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
      1
      <div style={centeredColumnStyle}>
        2
        {selected.id[0]}
        {
          (selected.id[1]) ?
            <>
              {selected.id[1]}
            </> :
            <></>
        }
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