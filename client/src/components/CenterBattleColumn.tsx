import React, { useContext, useEffect, useState } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { draw } from '../functions/draw';
import {
  checkIfFromHere,
  FoundData,
  changePropsOfTeam,
  findTeamByLocation,
  findTeamById,
  startMovement,
  changePropsOfUnit
} from '../functions/helpFunctions';
import { GameObject, Team } from '../data/sharedInterfaces';
import { resolveBombs } from '../functions/resolveBombs';
import { resolveAttacks } from '../functions/resolveAttacks';
import { resolveActions } from '../functions/resolveActions';
import { decideActions } from '../functions/aiActions';
import { handleSmokesAndExplosions, upkeepPhase } from '../functions/upkeepPhase';
import { closeCombat } from '../functions/closeCombat';

interface Canvas {
  w: number;
  h: number;
}

const CenterBattleColumn: React.FC = (): React.ReactElement => {
  const [unitSelection, setUnitSelection] = useState<boolean>(false);
  const scale: number = 15;
  const { gameObject,
    setGameObject,
    selected,
    setSelected,
    setHovered,
    isPaused,
    setMousePosition,
    setLog,
    log
  } = useContext(FlamesContext);
  const canvasSize: Canvas = { w: 1300, h: 900 };
  const canvas = document.getElementById("battleCanvas") as HTMLCanvasElement;

  const centerBattleColumnStyle: React.CSSProperties = {
    flex: '1 0 70%',
    backgroundColor: 'darkgreen', // Optional: Add background color for visualization
  };

  const handleHover = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (gameObject.status === 'deploy' || gameObject.status === 'battle') {

      const tryToFind = findTeamByLocation(x, y, gameObject, scale);

      if (tryToFind !== null) {
        const whatTeam = findTeamById(tryToFind, gameObject);
        setHovered({ id: [tryToFind], type: 'team', all: whatTeam });
      }

    }

    setMousePosition({ x: x, y: y });

  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    //  //  //
    // Deploy phase (clicks)
    //  //  //

    if (gameObject.status === 'deploy') {

      // if selected
      if (selected.id.length > 0) {

        selected.id.forEach((id: string) => {
          changePropsOfTeam(id, ['x', 'y'], [x, y], gameObject, setGameObject);
        });

        setSelected({ id: [], type: '' });
      } else {
        // if not selected yet

        const finding = findTeamByLocation(x, y, gameObject, scale);

        if (findTeamByLocation !== null) {
          setSelected({ id: [finding], type: 'team' });
        }

      }
    }

    //  //  //  //
    //          Battle phase  (clicks)  ********************
    //  //  //  //

    else if (gameObject.status === 'battle') {
      const playersUnit: FoundData = checkIfFromHere(gameObject[gameObject.player].units, x, y, scale);
      const opponentsUnit: FoundData = checkIfFromHere(gameObject[gameObject.opponent].units, x, y, scale);

      // if clicked is from your team
      if (playersUnit.found) {

        // order: listening, everyone else who was listening goes holding
        setGameObject({
          ...gameObject,
          [gameObject.player]: {
            ...gameObject[gameObject.player],
            units: gameObject[gameObject.player].units.map((unit: any) => ({
              ...unit,
              teams: unit.teams.map((team: any) =>
                team.uuid === playersUnit.id ? { ...team, order: 'listening', currentSpeed: 0 } : team.order === 'listening' ? { ...team, order: 'hold' } : team
              ),
            })),
          },
        });
        setSelected({ id: [playersUnit.id], type: 'team', all: playersUnit.all });
      }

      // if clicked is from opponent team and order is selected
      else if (opponentsUnit.found) {
        // who ever had listening gets selected order and target is uuid of that clicked opponent, clear selected
        const getSelected = findTeamById(selected.id[0], gameObject);

        if (getSelected !== null && getSelected !== undefined) {
          // if attack order, goes as target
          if (getSelected.order === 'attack' ||
            getSelected.order === 'charge' ||
            getSelected.order === 'smoke') {
            //console.log('getSelected: ', getSelected);
            if (unitSelection) {
              changePropsOfUnit(getSelected.unit, ['target'], [opponentsUnit.id], gameObject, setGameObject);
            } else {
              changePropsOfTeam(getSelected.uuid, ['target'], [opponentsUnit.id], gameObject, setGameObject);
            }

          }
          else if (getSelected.order === 'move' ||
            getSelected.order === 'reverse' || // not in use atm.
            getSelected.order === 'smoke bombard' ||
            getSelected.order === 'bombard') {

            if (unitSelection) {
              //console.log('unit selection up');
              changePropsOfUnit(selected.all.unit, ['target'], [{ x: x, y: y }], gameObject, setGameObject);

              gameObject[gameObject.player].units.forEach((unit: any) => ({
                ...unit,
                teams: unit.teams.forEach((team: any) => {
                  if (selected.all.unit === team.unit) {
                    startMovement(team.id, setGameObject);
                  }
                })
              }))
            } else {
              //console.log('not unit selection');
              changePropsOfTeam(selected.id[0], ['target'], [{ x: x, y: y }], gameObject, setGameObject);
              startMovement(selected.id[0], setGameObject);
            }

          }

          // clear selected
          setSelected({ id: [], type: '', all: {} });
          setUnitSelection(false);
        }
      }

      // if clicked was not any team,
      else {
        const getSelected = findTeamById(selected.id[0], gameObject);

        // if move or bombards
        if (getSelected) {
          //console.log('found selected');
          if (getSelected.order === 'move' ||
            getSelected.order === 'reverse' ||
            getSelected.order === 'smoke bombard' ||
            getSelected.order === 'bombard') {

            if (unitSelection) {

              gameObject[gameObject.player].units.forEach((unit: any) => {
                if (selected.all.unit === unit.uuid) {

                  // Calculate the relative position of the selected unit in its team
                  const relativeX = x - unit.teams[0].x;
                  const relativeY = y - unit.teams[0].y;

                  // Iterate through teams and adjust targets based on relative positions
                  unit.teams.forEach((team: any) => {
                    const adjustedX = team.x + relativeX;
                    const adjustedY = team.y + relativeY;
                    console.log('adjusted: ', adjustedX, adjustedY);
                    // Set the adjusted target for each team
                    changePropsOfTeam(team.uuid, ['target'], [{ x: adjustedX, y: adjustedY }], gameObject, setGameObject);
                    startMovement(team.id, setGameObject);
                  });
                }
              });
              
            } else {

              changePropsOfTeam(selected.id[0], ['target'], [{ x: x, y: y }], gameObject, setGameObject);
              startMovement(selected.id[0], setGameObject);

            }
          }

        }

        // clear selected
        setSelected({ id: [], type: '', all: {} });
        setUnitSelection(false);
      }

    }

  };

  useEffect(() => {
    if (gameObject.status === 'deploy' || gameObject.status === 'battle') {
      
      draw(canvas, canvasSize, gameObject, selected);

    }

  }, [gameObject]);

  // -----------------------------
  // Main game loop
  // -----------------------------

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    /** //  //  //
     *    BATTLE  (loop)
     */ //  //  //

    if (gameObject.status === 'battle' && !isPaused && intervalId === null) {
      const refreshRate: number = 100;
      let attacksToResolve: any[] = []; // will be filled in interval
      let bombsToResolve: any[] = [];

      // interval when game is not paused
      intervalId = setInterval(() => {

        setGameObject((prevGameObject: GameObject) => {
          const updatedGameObject = { ...prevGameObject };

          // AI makes decides what it wants to do
          if (gameObject.opponent === 'attacker') {
            decideActions(updatedGameObject.attacker.units, updatedGameObject.defender.units, gameObject);
          } else {
            decideActions(updatedGameObject.defender.units, updatedGameObject.attacker.units, gameObject);
          }

          // resolve bombardments
          if (bombsToResolve && bombsToResolve.length > 0) {
            // sort by origin.reactions
            bombsToResolve.sort((a, b) => a.origin.reactions - b.origin.reactions);
            bombsToResolve = resolveBombs(bombsToResolve,
              updatedGameObject,
              setLog,
              log);

          }

          // resolve shooting
          if (attacksToResolve && attacksToResolve.length > 0) {
            // sort by origin.reactions
            attacksToResolve.sort((a, b) => a.origin.reactions - b.origin.reactions);

            updatedGameObject.attacksToResolve = resolveAttacks(attacksToResolve,
              updatedGameObject,
              setLog,
              log);

          }
          draw(canvas, canvasSize, gameObject, selected);
          // Reset attacksToResolve and bombs
          attacksToResolve = [];
          bombsToResolve = [];

          if (updatedGameObject.attacker && updatedGameObject.attacker.units) {
            // actions like move, attack, bombard etc.
            updatedGameObject.attacker = resolveActions(
              updatedGameObject.attacker,
              updatedGameObject.defender,
              gameObject,
              attacksToResolve,
              bombsToResolve,
              scale,
              setLog,
              log);

          }

          if (updatedGameObject.defender && updatedGameObject.defender.units) {
            // actions like move, attack, bombard etc.
            updatedGameObject.defender = resolveActions(
              updatedGameObject.defender,
              updatedGameObject.attacker,
              gameObject,
              attacksToResolve,
              bombsToResolve,
              scale,
              setLog,
              log);

          }

          // reload guns, shakes, stuns etc.
          updatedGameObject.attacker.units.forEach((u: any) => {
            u.teams.forEach((t: Team) => {

              t = upkeepPhase(t, setLog, log);

            });
          });

          updatedGameObject.defender.units.forEach((u: any) => {
            u.teams.forEach((t: Team) => {

              t = upkeepPhase(t, setLog, log);

            });
          });

          // smokes and explosions:
          updatedGameObject.smokes = handleSmokesAndExplosions(updatedGameObject.smokes, false);
          updatedGameObject.explosions = handleSmokesAndExplosions(updatedGameObject.explosions, true);

          // close combat:
          closeCombat(gameObject, setLog, log);

          return { ...updatedGameObject, attacksToResolve, bombsToResolve };
          
        }); // setGameObject ends here

        // control log size
        if (log.length > 20) {
          let currentLog = log;
          currentLog.length = 20;
          setLog([...currentLog]);
        }
      }, refreshRate);
    }

    return () => {
      if (intervalId !== null) {
        
        clearInterval(intervalId);

      }
    };
  }, [isPaused, gameObject, selected]);

  /************************************
   *          Buttons etc.
   * **********************************
   */

  return (
    <div style={centerBattleColumnStyle}>

      {
        (gameObject.status === 'deploy') ?
          <>
            <button
              onClick={() => {
                setGameObject({
                  ...gameObject,
                  attacker: {
                    ...gameObject.attacker,
                    units: gameObject.attacker.units.map((unit: any, unitIndex: number) => ({
                      ...unit,
                      teams: unit.teams.map((team: any, teamIndex: number) => {
                        let newX = 50 + unitIndex * 100 + teamIndex * 50 + unit.id * 170;
                        let newY = 50;
                        if (unit.id > 3) {
                          newX = 100 + unitIndex * 100 + teamIndex * 50;
                          newY = 130
                        }
                        return { ...team, x: newX, y: newY, a: 180 };
                      }),
                    })),
                  },
                });
              }}
            >
              quickdepo A
            </button>

            <button
              onClick={() => {
                setGameObject({
                  ...gameObject,
                  defender: {
                    ...gameObject.defender,
                    units: gameObject.defender.units.map((unit: any, unitIndex: number) => ({
                      ...unit,
                      teams: unit.teams.map((team: any, teamIndex: number) => {
                        let newX = 50 + unitIndex * 100 + teamIndex * 50 + unit.id * 170;
                        let newY = 780;
                        if (unit.id > 3) {
                          newX = 100 + unitIndex * 100 + teamIndex * 50;
                          newY = 830
                        }
                        return { ...team, x: newX, y: newY };
                      }),
                    })),
                  },
                });
              }}
            >
              quickdepo D
            </button>

            <button
              onClick={() => {
                setGameObject({
                  ...gameObject,
                  status: 'battle'
                });
              }}
            >
              deployment ready
            </button>
          </> : <></>
      }
      {
        (gameObject.status === 'battle' && selected.id.length > 0 && (isPaused)) ?
          <>

            <button onClick={() => {
              changePropsOfTeam(selected.id[0], ['order'], ['hold'], gameObject, setGameObject)
            }}>
              hold
            </button>
            <button
              style={{ background: "gray", color: "black" }}
              onClick={() => {
                changePropsOfUnit(selected.all.unit, ['order'], ['hold'], gameObject, setGameObject);
                setUnitSelection(true);
              }}>
              unit hold
            </button>

            <button onClick={() => {
              changePropsOfTeam(selected.id[0], ['order'], ['move'], gameObject, setGameObject)
            }}>
              move
            </button>
            <button
              style={{ background: "gray", color: "black" }}
              onClick={() => {
                changePropsOfUnit(selected.all.unit, ['order'], ['move'], gameObject, setGameObject);
                setUnitSelection(true);
              }}>
              unit move
            </button>
            <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['attack'], gameObject, setGameObject) }}>
              attack
            </button>
            <button
              style={{ background: "gray", color: "black" }}
              onClick={() => {
                changePropsOfUnit(selected.all.unit, ['order'], ['attack'], gameObject, setGameObject);
                setUnitSelection(true);
              }}>
              unit attack
            </button>

            {
              (selected.all.type !== 'gun') ?
                <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['charge'], gameObject, setGameObject) }}>
                  charge
                </button> : <></>
            }

            {
              (selected.all.type === 'infantry') ?
                <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['dig foxholes'], gameObject, setGameObject) }}>
                  dig foxholes
                </button> : <></>
            }
            {
              (selected.all.type === 'infantry') ?
                <button
                  style={{ background: "gray", color: "black" }}
                  onClick={() => {
                    changePropsOfUnit(selected.all.unit, ['order'], ['dig foxholes'], gameObject, setGameObject);
                  }}>
                  unit dig foxholes
                </button> : <></>
            }
            {
              (selected.all.specials?.includes('observer')) ?
                <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['observing'], gameObject, setGameObject) }}>
                  observe
                </button> : <></>
            }
            {
              selected.all.combatWeapons.map((wepo: any, ix: number) => {
                return (
                  <span key={`arti: ${ix}`}>
                    {
                      (wepo.specials.includes('artillery')) ?
                        <>
                          <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['bombard'], gameObject, setGameObject) }}>
                            bombard
                          </button>
                        </> :
                        <></>
                    }
                  </span>
                )
              }
              )
            }
            {
              selected.all.combatWeapons.map((wepo: any, ix: number) => {
                return (
                  <span key={`artiSmoke: ${ix}`}>
                    {
                      (wepo.specials.includes('artillery') && wepo.specials.includes('smoke')) ?
                        <>
                          <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['smoke bombard'], gameObject, setGameObject) }}>
                            smoke bombard
                          </button>
                        </> :
                        <></>
                    }
                  </span>
                )
              }
              )
            }
            {
              selected.all.combatWeapons.map((wepo: any, ix: number) => {
                return (
                  <span key={`smoke: ${ix}`}>
                    {
                      (wepo.specials.includes('smoke') && !wepo.specials.includes('artillery')) ?
                        <>
                          <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['smoke'], gameObject, setGameObject) }}>
                            smoke attack
                          </button>
                        </> :
                        <></>
                    }
                  </span>
                )
              }
              )
            }
          </> : <></>
      }

      <br />
      <canvas
        id="battleCanvas"
        width={canvasSize.w}
        height={canvasSize.h}
        style={{
          position: "absolute",
          border: '1px solid black',
          background: "#9A7B4D",
          marginLeft: 0,
          marginRight: 0
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleHover}
      >
      </canvas>

    </div>);
};

export default CenterBattleColumn;
