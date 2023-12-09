import React from 'react';
import { useNavigate } from 'react-router-dom';

const buttons = {
    marginTop: "2px",
    marginRight: "2px",
    fontWeight: "bold",
};

const Header: React.FC = (): React.ReactElement => {

    const navigate = useNavigate();

    return (
        <div>
            <button
                style={{
                    ...buttons,
                    background: "purple",
                }}
                value=''
                onClick={() => { navigate(`/`);}}
            >
                start page
            </button>

            <button
                style={{
                    ...buttons,
                    background: "cyan",
                }}
                value='/createstuff'
                onClick={() => { navigate(`/createstuff`);}}
            >
                create stuff
            </button>

            <button
                style={{
                    ...buttons,
                    background: "green",
                }}
                value='/createstuff'
                onClick={() => { navigate(`/buildarmy`);}}
            >
                build an army
            </button>

            <button
                style={{
                    ...buttons,
                    background: "navy",
                    color: "white"
                }}
                value='/setupgame'
                onClick={() => { navigate(`/setupgame`);}}
            >
                setup game
            </button>
        </div>
    );
}

export default Header;