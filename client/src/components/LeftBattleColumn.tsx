import React, { useContext, useEffect } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { Typography } from '@mui/material';

const LeftBattleColumn: React.FC = (): React.ReactElement => {
  const { selected, gameObject } = useContext(FlamesContext);
  const column10StyleSecondRow: React.CSSProperties = {
    flex: '1 0 10%',
    backgroundColor: 'rgb(80,80,80)', // Optional: Add background color for visualization
  };

  useEffect(() => {
    console.log('selected: ', selected);
  }, [selected]);

  return <div style={column10StyleSecondRow}>
    {
      (selected.type === 'unit' && 
      gameObject.status === 'battle' &&
      (selected.all.name)) ?
        <>
          <Typography padding={1}>
            {`${selected.all.name} "${selected.all.tacticalNumber}"`}
          </Typography>
          <Typography padding={1}>
            weapons:
            {
              selected.all.weapons.map( (wep: any, i: number) => {
                return(
                  <Typography key={`wep: ${i}`}>
                    {`AT: ${wep.AT} FP: ${wep.FP} range: ${wep.range} rate: ${wep.firerate}`}
                    {wep.specials.map( (specs: string, ii: number) => {
                      return(
                        <Typography key={`spe: ${ii}`}>
                          {specs}
                        </Typography>
                      )
                    })}
                  </Typography>
                )
              })
            }
          </Typography>
          <Typography padding={1}>
            {selected.all.desc}
          </Typography>
        </> : <></>
    }
  </div>;
};

export default LeftBattleColumn;