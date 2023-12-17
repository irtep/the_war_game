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
  //  doOrders
} from '../functions/battleFunctions';
import { GameObject } from '../data/sharedInterfaces';

interface Canvas {
  w: number;
  h: number;
}

type IntervalItem = {
  teamId: string;
  intervalId: NodeJS.Timer;
};

const CenterBattleColumn: React.FC = (): React.ReactElement => {
  const [intervals, setIntervals] = useState<IntervalItem[]>([]);
  //const [intervalId, setIntervalId] = useState<any>(null);
  const scale: number = 15;
  const { gameObject,
    setGameObject,
    selected,
    setSelected,
    setHovered,
    isPaused,
    setIsPaused,
    setMousePosition
    //   setSelectedOrder,
    //   selectedOrder
  } = useContext(FlamesContext);
  const canvasSize: Canvas = { w: 1300, h: 900 };
  const canvas = document.getElementById("battleCanvas") as HTMLCanvasElement;

  const centerBattleColumnStyle: React.CSSProperties = {
    flex: '1 0 70%',
    //backgroundColor: 'lightcoral', // Optional: Add background color for visualization
  };

  const startIntervalForTeam = (team: any) => {
    const intervalId = setInterval(() => {
      team.moveToTarget();
      console.log(`Tank position: (${team.x}, ${team.y}), Heading: ${team.a.toFixed(2)}, Speed: ${team.currentSpeed.toFixed(2)}, Order: ${team.order}`);

      // Check if the tank has reached the target
      if (team.order === 'waiting') {
        console.log(`Tank reached the target. Order changed to 'waiting'. Stopping the interval.`);
        stopIntervalForTeam(team);
      }
    }, 250);

    setIntervals((prevIntervals) => [...prevIntervals, { teamId: team.uuid, intervalId }]);
  };

  const stopIntervalForTeam = (team: any) => {

    intervals.forEach( (inte: any, index: number) => {
      console.log('checking for clear');
      if (inte.teamId === team.uuid) {
        console.log('found');
        clearInterval(inte.intervalId);
      } else {
        console.log('not this: ', inte.teamId, team.uuid);
      }
    });

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
            //console.log('changing props to target');
            changePropsOfTeam(selected.id[0], ['target'], [{ x: x, y: y }], gameObject, setGameObject);
            //console.log('starting movement');
            // Perform asynchronous state updates
            setTimeout(() => {
              if (selected.id.length > 0) {
                startMovement(selected.id[0], setGameObject, startIntervalForTeam);
              }
            }, 0);
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

          if (getSelected.order === 'move') {
            // Perform asynchronous state updates
            setTimeout(() => {
              if (selected.id.length > 0) {
                startMovement(selected.id[0], setGameObject, startIntervalForTeam);
              }
            }, 0);
          }

        } else { console.log('not found'); }

        // clear selected
        setSelected({ id: [], type: '', all: {} });
      }

    }

  };

  useEffect(() => {
    if (gameObject.status === 'deploy' || gameObject.status === 'battle') {

      draw(canvas, canvasSize, gameObject, selected);

    }

  }, [gameObject]);

  useEffect(() => {
    console.log('intervals: ', intervals);
  }, [intervals]);

  // Event listener for spacebar
  /*
  useEffect(() => {
    if (isPaused) {

      // Clear the existing interval when pausing
      console.log('is paused');
      if (intervalId !== null) {
        console.log('clearing interval');
        clearInterval(intervalId);
        setIntervalId(null);
      }
      console.log('drawing');
      draw(canvas, canvasSize, gameObject, selected);

    } else if (isPaused === false && intervalId === null) {
      // Start a new interval when resuming
      console.log('starting interval');
      
      const id = window.setInterval(() => {
        console.log('interval');
        doOrders(gameObject, setGameObject);
        draw(canvas, canvasSize, gameObject, selected);
      }, 255);
  
      setIntervalId(id);
    }
  }, [isPaused, gameObject, selected]);
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
        (gameObject.status === 'battle' && selected.id.length > 0) ?
          <>

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