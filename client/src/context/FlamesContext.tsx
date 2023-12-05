import React, { createContext, useEffect, useRef, useState } from 'react';

export const FlamesContext: React.Context<any> = createContext(undefined);

interface Props {
    children: React.ReactNode;
}

export const FlamesProvider: React.FC<Props> = (props: Props): React.ReactElement => {

    const fetched: React.MutableRefObject<boolean> = useRef(false);

    const [teams, setTeams] = useState<Array<any>>([]);

    const fetchTeams = async (): Promise<void> => {
        console.log('fetching');
        try {
            const response = await fetch('http://localhost:3111/api/teams', {
                method: 'GET'
            });

            if (response.ok) {
                const resp = await response.json();
                setTeams(resp);
                console.log('resp: ', resp);
            } else {
                console.log('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    useEffect(() => {
        console.log('context effect: ');
        if (!fetched.current) {
            fetchTeams();
            fetched.current = true
        }

    }, []);

    return (
        <FlamesContext.Provider value={{
            teams,
            fetchTeams
        }}>
            {props.children}
        </FlamesContext.Provider>
    );
}