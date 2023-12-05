import React, { useState } from 'react';
import Header from './Header';
import CreateTeam from './CreateTeam';
import CreateWeapon from './CreateWeapon';
import CreateMap from './CreateMap';

const container = {
    margin: "auto",
    width: "100%",
    borderRadius: "10px",
    padding: "10px",
    background: "rgb(80,80,80)",
    color: "rgb(170,170,170)"
};

const CreateStuff: React.FC = (): React.ReactElement => {
    const [show, setShow] = useState<string>('');

    return (
        <div style={container}>

            <Header />

            <button
                style={{ margin: 3 }}
                onClick={() => { setShow('createTeam') }}
            >
                create team
            </button>

            <button
                style={{ margin: 3, background: "blue", color: "white" }}
                onClick={() => { setShow('createWeapon') }}
            >
                create weapon
            </button>

            <button
                style={{ margin: 3, background: "green" }}
                onClick={() => { setShow('createMap') }}
            >
                create map
            </button>

            {
                (show === 'createTeam') ?
                    <CreateTeam /> : <></>
            }
            {
                (show === 'createWeapon') ?
                    <CreateWeapon /> : <></>
            }
            {
                (show === 'createMap') ?
                    <CreateMap /> : <></>
            }
        </div>
    );
}

export default CreateStuff;