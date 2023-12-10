import React, { useContext } from 'react';
import { FlamesContext } from '../context/FlamesContext';

const FirstBattleRow: React.FC = (): React.ReactElement => {
  const {
    gameObject,
    selected,
    setSelected
  } = useContext(FlamesContext);

  const firstBattleRowStyle: React.CSSProperties = {
    flex: '1 0 7%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue', // Optional: Add background color for visualization
  };

  const centeredColumnStyle: React.CSSProperties = {
    width: '100%',
  };

  return (
    <div style={firstBattleRowStyle}>
      <div style={centeredColumnStyle}>
        {selected.id[0]}
        {
          (selected.id[1]) ?
            <>
              {selected.id[1]}
            </> :
            <></>
        }
            </div>

      </div>
      );
};

      export default FirstBattleRow;