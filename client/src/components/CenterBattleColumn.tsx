import React, { useContext, useEffect, useState } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { draw } from '../functions/draw';

interface Canvas {
  w: number;
  h: number;
}

const CenterBattleColumn: React.FC = (): React.ReactElement => {
  const [intervalId, setIntervalId] = useState<any>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const scale: number = 15;
  const { gameObject,
    setGameObject,
    selected,
    setSelected,
    setHovered } = useContext(FlamesContext);
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

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (gameObject.status = 'deploy') {
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

  };

  useEffect(() => {
    if (gameObject.status === 'deploy' || gameObject.status === 'battle') {

      console.log('status: ', gameObject.status);
      draw(canvas, canvasSize, gameObject);
      
    } else if (gameObject.status === 'startBattle' && !intervalId) {
      // Only start the interval if it hasn't been started yet
      const id = window.setInterval(() => {
        console.log('interval: ');
      }, 250);
      setIntervalId(id);
      setGameObject({ ...gameObject, status: 'battle' });
    }

    // Cleanup function to clear the interval when component unmounts or dependencies change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameObject, intervalId]);

  // Event listener for spacebar
  useEffect(() => {
    const handleKeyDown = (event: { key: string; }) => {
      if (event.key === ' ') {
        if (isPaused) {
          // Clear the existing interval when pausing
          clearInterval(intervalId);
        } else {
          // Start a new interval when resuming
          const id = window.setInterval(() => {
            console.log('interval: ');
          }, 250);
          setIntervalId(id);
        }

        // Toggle the pause state
        setIsPaused((prevState) => !prevState);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener when component unmounts or dependencies change
    return () => {
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