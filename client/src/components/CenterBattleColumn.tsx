import React, { useContext, useEffect } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { draw } from '../functions/draw';
import {
  checkIfFromHere,
  FoundData,
  changePropsOfTeam,
  findTeamByLocation,
  findTeamById,
  startMovement,
  collisionCheck,
  callDice
  //  doOrders
} from '../functions/battleFunctions';
import { GameObject, CollisionResponse } from '../data/sharedInterfaces';
//import { chipClasses } from '@mui/material';

interface Canvas {
  w: number;
  h: number;
}
/*
type IntervalItem = {
  teamId: string;
  intervalId: NodeJS.Timer;
};

interface ClickedObject {
  action: string;
  team: string;
};
*/
const CenterBattleColumn: React.FC = (): React.ReactElement => {
  //const [intervals, setIntervals] = useState<IntervalItem[]>([]);
  //const [clicked, setClicked] = useState<ClickedObject>({action: '', team: ''});
  //const [intervalId, setIntervalId] = useState<any>(null);
  const scale: number = 15;
  const { gameObject,
    setGameObject,
    selected,
    setSelected,
    setHovered,
    isPaused,
    setMousePosition
    //   setSelectedOrder,
    //   selectedOrder
  } = useContext(FlamesContext);
  //const mutableGameObject = useRef<GameObject>({ ...gameObject }); // Declare mutableGameObject using useRef
  const canvasSize: Canvas = { w: 1300, h: 900 };
  const canvas = document.getElementById("battleCanvas") as HTMLCanvasElement;

  const centerBattleColumnStyle: React.CSSProperties = {
    flex: '1 0 70%',
    //backgroundColor: 'lightcoral', // Optional: Add background color for visualization
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

    //
    // Deploy phase
    //

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

    //
    //          Battle phase
    //

    else if (gameObject.status === 'battle') {
      const playersUnit: FoundData = checkIfFromHere(gameObject[gameObject.player].units, x, y, scale);
      const opponentsUnit: FoundData = checkIfFromHere(gameObject[gameObject.opponent].units, x, y, scale);

      // if clicked is from your team
      if (playersUnit.found) {

        // order: listening, everyone else who was listening goes waiting
        setGameObject({
          ...gameObject,
          [gameObject.player]: {
            ...gameObject[gameObject.player],
            units: gameObject[gameObject.player].units.map((unit: any) => ({
              ...unit,
              teams: unit.teams.map((team: any) =>
                team.uuid === playersUnit.id ? { ...team, order: 'listening' } : team.order === 'listening' ? { ...team, order: 'waiting' } : team
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

        if (getSelected !== null) {
          // if attack order, goes as target
          if (getSelected.order === 'attack' ||
            getSelected.order === 'charge' ||
            getSelected.order === 'smoke attack' ||
            getSelected.order === 'smoke bombard' ||
            getSelected.order === 'bombard') {

            changePropsOfTeam(selected.id[0], ['target'], [opponentsUnit.id], gameObject, setGameObject);

          }
          else if (getSelected.order === 'move') {

            changePropsOfTeam(selected.id[0], ['target'], [{ x: x, y: y }], gameObject, setGameObject);

            startMovement(selected.id[0], setGameObject, gameObject, selected);

          } else { console.log(' else, ', getSelected); }
          // clear selected
          setSelected({ id: [], type: '', all: {} });
        }
      }

      // if clicked was not any team,
      else {
        const getSelected = findTeamById(selected.id[0], gameObject);
        console.log('was not selected');
        // if move or bombards
        if (getSelected) {
          console.log('found selected');
          if (getSelected.order === 'move' ||
            getSelected.order === 'smoke bombard' ||
            getSelected.order === 'bombard') {
            console.log('move, smoke or bombard');
            changePropsOfTeam(selected.id[0], ['target'], [{ x: x, y: y }], gameObject, setGameObject);
          }

          startMovement(selected.id[0], setGameObject, gameObject, selected);

        } else { console.log('not found'); }

        // clear selected
        setSelected({ id: [], type: '', all: {} });
      }

    }

  };

  useEffect(() => {
    if (gameObject.status === 'deploy' || gameObject.status === 'battle') {
      console.log('calling draw as gameObject changed');
      draw(canvas, canvasSize, gameObject, selected);

    }

  }, [gameObject]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (gameObject.status === 'battle' && !isPaused && intervalId === null) {
      intervalId = setInterval(() => {
        setGameObject((prevGameObject: GameObject) => {
          const updatedGameObject = { ...prevGameObject };

          if (updatedGameObject.attacker && updatedGameObject.attacker.units) {
            updatedGameObject.attacker.units = updatedGameObject.attacker.units.map((unit: any) => ({
              ...unit,
              teams: unit.teams.map((team: any) => {
                if (team && team.order === 'move' && team.target && (team.x !== team.target.x || team.y !== team.target.y)) {
                  // make collision check:
                  const getMovement = team.moveToTarget();
                  const check: CollisionResponse = collisionCheck(gameObject, getMovement);

                  if (check.collision) {

                    if (check.withWhat === 'team' || check.withWhat === 'house' || check.withWhat === 'water') {
                      return team;
                    }

                    else if (check.withWhat === 'tree') {
                      // need to make a cross check, if ok, can advance, if not does not advance
                      const crossCheck: number = callDice(6);

                      if (crossCheck >= team.cross) {
                        console.log('cross ok', crossCheck, ' vs ', team.cross);
                        return team.moveToTarget();
                      } else {
                        console.log('cross failed: ', crossCheck, ' vs ', team.cross);
                        return team;
                      }
                    }
                    
                  } else {
                    return team.moveToTarget();
                  }
                } else {
                  return team;
                }
              }),
            }));
          }

          if (updatedGameObject.defender && updatedGameObject.defender.units) {
            updatedGameObject.defender.units = updatedGameObject.defender.units.map((unit: any) => ({
              ...unit,
              teams: unit.teams.map((team: any) => {
                if (team && team.order === 'move' && team.target && (team.x !== team.target.x || team.y !== team.target.y)) {
                  
                  // make collision check:
                  const getMovement = team.moveToTarget();
                  const check: CollisionResponse = collisionCheck(gameObject, getMovement);

                  if (check.collision) {

                    if (check.withWhat === 'team' || check.withWhat === 'house' || check.withWhat === 'water') {
                      return team;
                    }

                    else if (check.withWhat === 'tree') {
                      // need to make a cross check, if ok, can advance, if not does not advance
                      const crossCheck: number = callDice(6);

                      if (crossCheck >= team.cross) {
                        console.log('cross ok', crossCheck, ' vs ', team.cross);
                        return team.moveToTarget();
                      } else {
                        console.log('cross failed: ', crossCheck, ' vs ', team.cross);
                        return team;
                      }
                    }
                    
                  } else {
                    return team.moveToTarget();
                  }
                } else {
                  return team;
                }
              }),
            }));
          }

          return updatedGameObject;
        });

        // draw(canvas, canvasSize, gameObject, selected);
      }, 100);
    }

    return () => {
      if (intervalId !== null) {
        console.log('clearing interval');
        clearInterval(intervalId);
      }
    };
  }, [isPaused, gameObject, selected]);

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
        (gameObject.status === 'battle' && selected.id.length > 0) ?
          <>

            <button onClick={() => {
              changePropsOfTeam(selected.id[0], ['order'], ['wait'], gameObject, setGameObject)
            }}>
              wait
            </button>

            <button onClick={() => {
              changePropsOfTeam(selected.id[0], ['order'], ['move'], gameObject, setGameObject)
            }}>
              move
            </button>

            <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['attack'], gameObject, setGameObject) }}>
              attack
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

