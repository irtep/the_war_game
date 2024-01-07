import React, { useContext } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { Typography } from '@mui/material';

const LeftBattleColumn: React.FC = (): React.ReactElement => {
  const { gameObject, hovered } = useContext(FlamesContext);
  const column10StyleSecondRow: React.CSSProperties = {
    flex: '1 0 10%',
    backgroundColor: 'rgb(80,80,80)', // Optional: Add background color for visualization
  };
  /*
    useEffect(() => {
      console.log('s: ', hovered);
    }, [hovered]);
  */
  return <div style={column10StyleSecondRow}>
    {
      (hovered.type === 'team' &&
        gameObject.status === 'battle' &&
        (hovered.all.name)) ?
        <>
          <img
            src={`/img/units/${hovered.all.imgSide}.png`}
            width={150}
          />
          <Typography padding={1}>
            {`${hovered.all.crew} ${hovered.all.name} "${hovered.all.tacticalNumber}"`}
          </Typography>

          {
            (hovered.all.type === 'tank') ?
              <Typography padding={1}>
                {` front armour: ${hovered.all.armourFront} side armour: ${hovered.all.armourSide}`}
              </Typography> :
              <Typography padding={1}>
                {` save: ${hovered.all.save}+`}
              </Typography>
          }


          <div style={{padding:1}}>
            weapons:
            {
              hovered.all.combatWeapons.map((wep: any, i: number) => {

                return (
                  <Typography
                    marginBottom={2}
                    marginTop={2}
                    key={`wep: ${i}`}
                  >
                    {`${wep.name} AT: ${wep.AT}, FP: ${wep.FP}, range: ${wep.range}, rate: ${wep.reload}/${wep.firerate}, specials: ${wep.specials}`}

                  </Typography>
                )
              })
            }
          </div>
          <Typography padding={1}>
            {hovered.all.desc}
          </Typography>

          <Typography padding={1}>
            {`order: ${hovered.all.order}
            target: ${hovered.all.target}`}
          </Typography>

          <Typography padding={1}>
            {`x: ${hovered.all.x}
            y: ${hovered.all.y}
            a: ${hovered.all.a}
            tA: ${hovered.all.targetAngle}`}
          </Typography>
          <Typography padding={1} sx={{color: "red"}}>
            {`disabled: ${hovered.all.disabled}
            shaken: ${hovered.all.shaken}
            stunned: ${hovered.all.stunned}`}
          </Typography>
          <Typography padding={1}>
            {`kills: ${hovered.all.kills?.length}`}
          </Typography>
        </> : <></>
    }
  </div>;
};

export default LeftBattleColumn;