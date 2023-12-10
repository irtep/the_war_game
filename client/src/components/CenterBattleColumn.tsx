import React, { useContext, useEffect } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { draw } from '../functions/draw';

interface Canvas {
  w: number;
  h: number;
}

const CenterBattleColumn: React.FC = (): React.ReactElement => {
  const { gameObject, setGameObject } = useContext(FlamesContext);
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


    console.log(
      'clicked: ', x, y
    );
  };

  return (
    <div style={centerBattleColumnStyle}>
        <button 
          onClick={ () => { draw(canvas, canvasSize, gameObject); }}>
            draw
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