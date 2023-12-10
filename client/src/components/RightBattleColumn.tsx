import React, { useContext } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { Container, Typography } from '@mui/material';

const RightBattleColumn: React.FC = (): React.ReactElement => {
  const { gameObject } = useContext(FlamesContext);
  const rightBattleColumnStyle: React.CSSProperties = {
    flex: '1 0 20%',
    backgroundColor: 'lightgreen', // Optional: Add background color for visualization
  };

  return (
    <div style={rightBattleColumnStyle}>
      {
        (gameObject.status === 'deploy') ?
        <Container>
          <Typography sx={{ marginTop: 5}}>
            Deploy troops of {gameObject.attacker.faction}:
          </Typography>
          {
            gameObject.attacker.units.map( (unit: any, i: number) => {
              return(
                <Typography key={i}>
                  {unit.name}
                </Typography>
              )
            })
          }
          <Typography sx={{ marginTop: 10}}>
            Deploy troops of {gameObject.defender.faction}:
          </Typography>
          {
            gameObject.defender.units.map( (unit: any, i: number) => {
              return(
                <Typography key={i}>
                  {unit.name}
                </Typography>
              )
            })
          }

        </Container> :
        <></>
      }
    </div>);
};

export default RightBattleColumn;