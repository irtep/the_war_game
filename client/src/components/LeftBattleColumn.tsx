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
    console.log('s: ', selected.all);
  }, [selected]);

  return <div style={column10StyleSecondRow}>
    {
      (selected.type === 'team' && 
      gameObject.status === 'battle' &&
      (selected.all.name)) ?
        <>
          <img 
            src={`/img/units/${selected.all.imgSide}.png`}
            width={150}
            />
          <Typography padding={1}>
            {`${selected.all.name} "${selected.all.tacticalNumber}"`}
          </Typography>
          <Typography padding={1}>
            weapons:
            {
              selected.all.combatWeapons.map( (wep: any, i: number) => {
                
                return(
                  <Typography 
                    marginBottom={2}
                    marginTop={2}
                    key={`wep: ${i}`}
                    >
                    {`${wep.name} AT: ${wep.AT}, FP: ${wep.FP}, range: ${wep.range}, rate: ${wep.firerate}, specials: ${wep.specials}`}

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