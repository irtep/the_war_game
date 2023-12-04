import React, { useState } from 'react';
import Header from './Header';
import CreateUnit from './CreateUnit';
import CreateWeapon from './CreateWeapon';

const container = {
    margin: "auto",
    width: "50%",
    borderRadius: "10px",
    padding: "10px",
    background: "rgb(80,80,80)",
    color: "rgb(170,170,170)"
};

const CreateStuff: React.FC = (): React.ReactElement => {
    const [show, setShow] = useState<string>('');
    
    return (
        <div style={container}>

            <Header/>

            <button
                style={{ margin: 3}}
                onClick={ () => { setShow('createTeam')}}
            >
                create team
            </button>

            <button
                style={{ margin: 3}}
                onClick={ () => { setShow('createWeapon')}}
            >
                create weapon
            </button>

            {
                (show === 'createTeam') ?
                <CreateUnit/> : <></>
            }
            {
                (show === 'createWeapon') ?
                <CreateWeapon/> : <></>
            }
        </div>
    );
}

export default CreateStuff;