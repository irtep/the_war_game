import React, { useContext, useEffect } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { draw } from '../functions/draw';

interface Canvas {
  w: number;
  h: number;
}

const CenterBattleColumn: React.FC = (): React.ReactElement => {
  const { gameObject, setGameObject, selected } = useContext(FlamesContext);
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
  
    if (selected.id.length > 0) {
      selected.id.forEach((id: string) => {
        if (id[0] === 'a') { // attackers id
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
    }
  };

  useEffect( () => {
    if (gameObject.status === 'deploy') {
      draw(canvas, canvasSize, gameObject);
    } else {
     // console.log('gO ', gameObject);
    }
  }, [gameObject]);

  return (
    <div style={centerBattleColumnStyle}>
        <button 
          onClick={ () => { draw(canvas, canvasSize, gameObject); }}>
            draw
          </button>
          <button 
          onClick={ () => { draw(canvas, canvasSize, gameObject); }}>
            quickdepo A
          </button>
          <button 
          onClick={ () => { draw(canvas, canvasSize, gameObject); }}>
            quickdepo B
          </button>
          <br/>
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