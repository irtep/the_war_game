import React, { useContext, useEffect, useState } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { draw } from '../functions/draw';
import { checkIfFromHere, FoundData } from '../functions/battleFunctions';

interface Canvas {
  w: number;
  h: number;
}

const CenterBattleColumn: React.FC = (): React.ReactElement => {
  const [intervalId, setIntervalId] = useState<any>(null);
  const scale: number = 15;
  const { gameObject,
    setGameObject,
    selected,
    setSelected,
    setHovered,
    isPaused, 
    setIsPaused
   } = useContext(FlamesContext);
  const canvasSize: Canvas = { w: 1300, h: 900 };
  const canvas = document.getElementById("battleCanvas") as HTMLCanvasElement;

  const centerBattleColumnStyle: React.CSSProperties = {
    flex: '1 0 70%',
    //backgroundColor: 'lightcoral', // Optional: Add background color for visualization
  };

  const handleHover = (event: React.MouseEvent<HTMLCanvasElement>) => {

    if (gameObject.status === 'deploy' || gameObject.status === 'battle') {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      gameObject.attacker.units.forEach((unit: any) => {
        unit.teams.forEach((team: any) => {
          if (
            x >= team.x - team.width / (2 * scale) &&
            x <= team.x + team.width / (2 * scale) &&
            y >= team.y - team.width / (2 * scale) &&
            y <= team.y + team.width / (2 * scale)
          ) {
            setHovered(team.uuid);
          }
        });
      });
      gameObject.defender.units.forEach((unit: any) => {
        unit.teams.forEach((team: any) => {
          if (
            x >= team.x - team.width / (2 * scale) &&
            x <= team.x + team.width / (2 * scale) &&
            y >= team.y - team.width / (2 * scale) &&
            y <= team.y + team.width / (2 * scale)
          ) {
            setHovered(team.uuid);
          }
        });
      });
    }

  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Deploy phase
    if (gameObject.status === 'deploy') {
      // if selected
      if (selected.id.length > 0) {
        selected.id.forEach((id: string) => {
          if (id[0] === 'a') {
            setGameObject({
              ...gameObject,
              attacker: {
                ...gameObject.attacker,
                units: gameObject.attacker.units.map((unit: any) => ({
                  ...unit,
                  teams: unit.teams.map((team: any) =>
                    team.uuid === id ? { ...team, x: x, y: y } : team
                  ),
                })),
              },
            });
          } else {
            setGameObject({
              ...gameObject,
              defender: {
                ...gameObject.defender,
                units: gameObject.defender.units.map((unit: any) => ({
                  ...unit,
                  teams: unit.teams.map((team: any) =>
                    team.uuid === id ? { ...team, x: x, y: y } : team
                  ),
                })),
              },
            });
          }
        });
        setSelected({ id: [], type: '' });
      } else {
        // if not selected yet
        gameObject.attacker.units.forEach((unit: any) => {
          unit.teams.forEach((team: any) => {
            if (
              x >= team.x - team.width / (2 * scale) &&
              x <= team.x + team.width / (2 * scale) &&
              y >= team.y - team.width / (2 * scale) &&
              y <= team.y + team.width / (2 * scale)
            ) {
              setSelected({ id: [team.uuid], type: 'team' });
            }
          });
        });
        gameObject.defender.units.forEach((unit: any) => {
          unit.teams.forEach((team: any) => {
            if (
              x >= team.x - team.width / (2 * scale) &&
              x <= team.x + team.width / (2 * scale) &&
              y >= team.y - team.width / (2 * scale) &&
              y <= team.y + team.width / (2 * scale)
            ) {
              setSelected({ id: [team.uuid], type: 'team' });
            }
          });
        });
      }
    }
    else if (gameObject.status === 'battle') {
      const playersUnit: FoundData = checkIfFromHere(gameObject[gameObject.player].units, x, y, scale);
      console.log('pU ', playersUnit);
      const opponentsUnit: FoundData = checkIfFromHere(gameObject[gameObject.opponent].units, x, y, scale);
      console.log('oU ', opponentsUnit);
      // if clicked is from your team
      if (playersUnit.found) {
        // order: listening, everyone else who was listening goes waiting
        console.log('player unit!');
        // show order buttons
      }

      // if clicked is from opponent team and order is selected
      else if (opponentsUnit.found) {
        // who ever had listening gets selected order and target is uuid of that clicked opponent
        console.log('opponents unit!');
        // hide order buttons
      }

      // if clicked was not any team,
      else {
        // that location comes as target and selected order as order
        console.log('no unit');
        // hide order buttons
      }

    }

  };

  useEffect(() => {
    if (gameObject.status === 'deploy' || gameObject.status === 'battle') {

      console.log('status: ', gameObject.status);
      draw(canvas, canvasSize, gameObject);

    } else if (gameObject.status === 'startBattle' && !intervalId) {
      // Only start the interval if it hasn't been started yet
      //console.log('starting interval, 1st effect');
      const id = window.setInterval(() => {
        //console.log('interval: ');
      }, 1000);
      setIntervalId(id);
      setGameObject({ ...gameObject, status: 'battle' });
    }

    // Cleanup function to clear the interval when component unmounts or dependencies change

  }, [gameObject, intervalId]);

  // Event listener for spacebar
  useEffect(() => {
    const handleKeyDown = (event: { key: string; }) => {
      
      if (event.key === ' ') {
        //console.log('key down, space');
        if (isPaused) {
          // Clear the existing interval when pausing
          //console.log('is paused, clearing interval');
          clearInterval(intervalId);
        } else {
          // Start a new interval when resuming
          //console.log('starting interval')
          const id = window.setInterval(() => {
            //console.log('interval: ');
          }, 1000);
          setIntervalId(id);
        }

        // Toggle the pause state
        console.log('pause toggle');
        setIsPaused((prevState: any) => !prevState);
      }
    };
    console.log('adding keydown listener');
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener when component unmounts or dependencies change
 
    return () => {
      console.log('removing keydown listener');
      window.removeEventListener('keydown', handleKeyDown);
    }; 
  }, [isPaused, intervalId]);

  return (
    <div style={centerBattleColumnStyle}>
      <button
        onClick={() => { draw(canvas, canvasSize, gameObject); }}>
        draw
      </button>
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
            status: 'startBattle'
          });
        }}
      >
        deployment ready
      </button>
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