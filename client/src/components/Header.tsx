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
                create units
            </button>
        </div>
    );
}

export default Header;