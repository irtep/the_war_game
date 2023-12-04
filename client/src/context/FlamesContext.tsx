import React, { createContext, useEffect, useRef, useState } from 'react';

export const FlamesContext: React.Context<any> = createContext(undefined);

interface Props {
    children: React.ReactNode;
}

export const FlamesProvider: React.FC<Props> = (props: Props): React.ReactElement => {

    const fetched: React.MutableRefObject<boolean> = useRef(false);

    const [teams, setTeams] = useState<Array<any>>([]);

    const fetchTeams = async (): Promise<void> => {
        try {
            const response = await fetch('http://localhost:3111/api/teams', {
                method: 'GET'
            });

            if (response.ok) {
                console.log('response', await response.json()); // Call response.json() as a function
            } else {
                console.log('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    useEffect(() => {

        if (!fetched.current) {
            fetchTeams();
        }

        return () => { fetched.current = true }

    }, []);

    return (
        <FlamesContext.Provider value={{
            teams
        }}>
            {props.children}
        </FlamesContext.Provider>
    );
}