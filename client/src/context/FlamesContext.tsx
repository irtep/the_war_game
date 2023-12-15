import React, { createContext, useEffect, useRef, useState } from 'react';
import { GameObject, Selected } from '../data/sharedInterfaces';

export const FlamesContext: React.Context<any> = createContext(undefined);

interface Props {
    children: React.ReactNode;
}

interface SetupObject {
    mission: string;
    terrain: string;
    attacker: string;
    defender: string;
    you: string;
};

export const FlamesProvider: React.FC<Props> = (props: Props): React.ReactElement => {

    const fetched: React.MutableRefObject<boolean> = useRef(false);
    const [selected, setSelected] = useState<Selected>({
        id: [],
        type: '',
        all: {}
      });
    const [teams, setTeams] = useState<Array<any>>([]);
    const [terrains, setTerrains] = useState<Array<any>>([]);
    const [weapons, setWeapons] = useState<Array<any>>([]);
    const [armies, setArmies] = useState<Array<any>>([]);
    const [setupObject, setSetupObject] = useState<SetupObject>({
        mission: '',
        terrain: '',
        attacker: '',
        defender: '',
        you: '' // who is player, attacker or defender
    });
    const [gameObject, setGameObject] = useState<GameObject>({
        status: 'setup',
        attacker: '',
        defender: '',
        terrain: ''
    });
    const [hovered, setHovered] = useState<Selected>({
        id: [],
        type: '',
        all: {}
      });
    const [isPaused, setIsPaused] = useState<boolean>(false);
//    const [selectedOrder, setSelectedOrder] = useState<string>('');

    const fetchTeams = async (): Promise<void> => {
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

    const fetchArmies = async (): Promise<void> => {
        try {
            const response = await fetch('http://localhost:3111/api/armies', {
                method: 'GET'
            });

            if (response.ok) {
                const resp = await response.json();
                setArmies(resp);
                console.log('resp: ', resp);
            } else {
                console.log('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const fetchTerrains = async (): Promise<void> => {
        try {
            const response = await fetch('http://localhost:3111/api/terrains', {
                method: 'GET'
            });

            if (response.ok) {
                const resp = await response.json();
                setTerrains(resp);
                console.log('resp: ', resp);
            } else {
                console.log('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const fetchWeapons = async (): Promise<void> => {
        try {
            const response = await fetch('http://localhost:3111/api/weapons', {
                method: 'GET'
            });

            if (response.ok) {
                const resp = await response.json();
                setWeapons(resp);
                console.log('resp: ', resp);
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
            fetchArmies();
            fetchTerrains();
            fetchWeapons();
            fetched.current = true
        }

    }, []);

    return (
        <FlamesContext.Provider value={{
            teams,
            terrains,
            armies,
            fetchTeams,
            setupObject,
            setSetupObject,
            gameObject,
            setGameObject,
            selected,
            setSelected,
            hovered,
            setHovered,
            weapons,
            isPaused,
            setIsPaused,
   //         selectedOrder,
   //         setSelectedOrder
        }}>
            {props.children}
        </FlamesContext.Provider>
    );
}