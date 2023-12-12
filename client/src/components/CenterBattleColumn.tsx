import React, { useContext, useEffect } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { draw } from '../functions/draw';

interface Canvas {
  w: number;
  h: number;
}

const CenterBattleColumn: React.FC = (): React.ReactElement => {
  const { gameObject, 
          setGameObject, 
          selected,
          setSelected } = useContext(FlamesContext);
  const canvasSize: Canvas = { w: 1300, h: 900 };
  const canvas = document.getElementById("battleCanvas") as HTMLCanvasElement;

  const centerBattleColumnStyle: React.CSSProperties = {
    flex: '1 0 70%',
    //backgroundColor: 'lightcoral', // Optional: Add background color for visualization
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log('click');

    if (gameObject.status = 'deploy') {

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
        setSelected({id: [], type: ''});
      }
    }

  };

  useEffect(() => {
    if (gameObject.status === 'deploy') {
      draw(canvas, canvasSize, gameObject);
    } else {
      // console.log('gO ', gameObject);
    }
  }, [gameObject]);

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
                    newY = 55
                  }
                  return { ...team, x: newX, y: newY };
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
                  let newY = 800;
                  if (unit.id > 3) {
                    newX = 100 + unitIndex * 100 + teamIndex * 50;
                    newY = 850
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
      >
      </canvas>

    </div>);
};

export default CenterBattleColumn;