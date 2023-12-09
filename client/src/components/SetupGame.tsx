import React from 'react';
import Header from './Header';

const container = {
    margin: "auto",
    width: "100%",
    borderRadius: "10px",
    padding: "10px",
    background: "rgb(80,80,80)",
    color: "rgb(170,170,170)"
};

const SetupGame: React.FC = (): React.ReactElement => {

    
    return (
        <div style={container}>

            <Header/>

            <p>
                SetupGame
            </p>

        </div>
    );
}

export default SetupGame;