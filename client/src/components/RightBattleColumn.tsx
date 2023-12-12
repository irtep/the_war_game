import React, { useContext, useEffect, useState } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { Button, Container, Typography } from '@mui/material';

const RightBattleColumn: React.FC = (): React.ReactElement => {

  const {
    gameObject,
    setGameObject,
    selected,
    setSelected
  } = useContext(FlamesContext);
  const rightBattleColumnStyle: React.CSSProperties = {
    flex: '1 0 20%',
    backgroundColor: 'darkgreen', // Optional: Add background color for visualization
  };

  return (
    <div style={rightBattleColumnStyle}>
      {
        (gameObject.status === 'deploy') ?
          <Container>
            <Typography sx={{ marginTop: 5 }}>
              Deploy troops of {gameObject.attacker.faction}:
            </Typography>
            {
              gameObject.attacker.units.map((unit: any, i: number) => {
                return (
                  <div key={`a ${i}`}>
                    <button
                      key={`f ${i}`}
                      value={`u${unit.id}`}
                      style={{
                        background: 'blue',
                        color: 'rgb(180,180,180)',
                        margin: 2
                      }}
                      onClick={() => {
                        let all: Array<string> = [];
                        unit.teams.forEach((tea: any) => {
                            setSelected({
                              id: all,
                              type: 'unit'
                            });
                          all.push(tea.uuid);
                        });
                      }}
                    >
                      {unit.name}:
                    </button>
                    <br />
                    {
                      unit.teams.map((team: any, h: number) => {
                        return (
                          <div key={`yy ${team.uuid}`}>
                            <button
                              key={`x ${i}`}
                              value={team.uuid}
                              style={{
                                background: 'rgb(0,42,16)',
                                color: 'rgb(180,180,180)',
                                margin: 2
                              }}
                              onClick={() => {
                                unit.teams.forEach((tea: any) => {
                                  if (selected.id[0] === tea.uuid) {
                                    // if already selected, turn it
                                    setSelected({
                                      id: [],
                                      type: ''
                                    });    
                                    
                                    setGameObject({
                                      ...gameObject,
                                      attacker: {
                                        ...gameObject.attacker,
                                        units: gameObject.attacker.units.map((unit: any) => ({
                                          ...unit,
                                          teams: unit.teams.map((team: any) =>
                                            team.uuid === tea.uuid ? { ...team, a: tea.a + 45 } : team
                                          ),
                                        })),
                                      },
                                    });       
                                                 
                                  } else {
                                    console.log('one click')
                                    setSelected({
                                      id: [team.uuid],
                                      type: 'unit'
                                    });
                                  }
                                });
                              }}
                              disabled={team.disabled}
                            >
                              {`${team.crew} ${team.team} "${team.tacticalNumber}"`}
                            </button>
                            <br />
                          </div>
                        )
                      })
                    }
                  </div>
                )
              })
            }
            <Typography sx={{ marginTop: 5 }}>
              Deploy troops of {gameObject.defender.faction}:
            </Typography>
            {
              gameObject.defender.units.map((unit: any, i: number) => {
                return (
                  <>
                    <button
                      key={`x ${i} eee ${unit.id}`}
                      value={`e${unit.id}`}
                      style={{
                        background: 'darkred',
                        color: 'rgb(180,180,180)',
                        margin: 2
                      }}
                      onClick={() => {
                        let all: Array<string> = [];
                        unit.teams.forEach((tea: any) => {
                          all.push(tea.uuid);
                        });
                        setSelected({
                          id: all,
                          type: 'unit'
                        });
                      }}
                    >
                      {unit.name}:
                    </button>
                    <br />
                    {
                      unit.teams.map((team: any, h: number) => {
                        return (
                          <div key={`yyd ${team.uuid}`}>
                            <button
                              key={`x ${i}`}
                              value={team.uuid}
                              style={{
                                background: 'rgb(0,42,16)',
                                color: 'rgb(180,180,180)',
                                margin: 2
                              }}
                              onClick={() => {
                                unit.teams.forEach((tea: any) => {
                                  if (selected.id[0] === tea.uuid) {
                                    // if already selected, turn it
                                    setGameObject({
                                      ...gameObject,
                                      defender: {
                                        ...gameObject.defender,
                                        units: gameObject.defender.units.map((unit: any) => ({
                                          ...unit,
                                          teams: unit.teams.map((team: any) =>
                                            team.uuid === tea.uuid ? { ...team, a: tea.a + 45 } : team
                                          ),
                                        })),
                                      },
                                    });
                                    setSelected({
                                      id: [],
                                      type: ''
                                    });           
                                                  
                                  } else {
                                    setSelected({
                                      id: [team.uuid],
                                      type: 'unit'
                                    });
                                  }
                                });
                              }}
                              disabled={team.disabled}
                            >
                              {`${team.crew} ${team.team} "${team.tacticalNumber}"`}
                            </button>
                            <br />
                          </div>
                        )
                      })
                    }
                  </>
                )
              })
            }

          </Container> :
          <></>
      }
    </div>);
};

export default RightBattleColumn;