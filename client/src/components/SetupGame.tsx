import React, { useContext, useEffect } from 'react';
import Header from './Header';
import { Container, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { missions, Mission } from '../data/missionData';
import { FlamesContext } from '../context/FlamesContext';
import Battle from './Battle';

const SetupGame: React.FC = (): React.ReactElement => {
    const { terrains,
        armies,
        setupObject,
        setSetupObject,
        gameObject,
        setGameObject
    } = useContext(FlamesContext);

    useEffect(() => {
        //console.log('setupOBject ', setupObject);
    });

    return (
        <div>

            {
                (gameObject.status === 'setup') ?
                    <Container>
                        <Header />

                        <FormControl sx={{ margin: 2, width: "20%" }}>
                            <InputLabel id="dropdown-mission">
                                choose a mission
                            </InputLabel>
                            <Select
                                labelId="dropdown-mission"
                                id="dropMission"
                                value={setupObject.mission}
                                label="choose a mission"
                                onChange={(e: any) => {
                                    setSetupObject({
                                        ...setupObject,
                                        mission: e.target.value
                                    });
                                }}
                            >
                                {missions.map((value: Mission, index: number) => (
                                    <MenuItem key={index} value={value.name}>
                                        {value.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ margin: 2, width: "20%" }}>
                            <InputLabel id="dropdown-terrain">
                                choose a map
                            </InputLabel>
                            <Select
                                labelId="dropdown-terrain"
                                id="dropMap"
                                value={setupObject.terrain}
                                label="choose a map"
                                onChange={(e: any) => {
                                    setSetupObject({
                                        ...setupObject,
                                        terrain: e.target.value
                                    });
                                }}
                            >
                                {terrains.map((value: any, index: number) => (
                                    <MenuItem key={index} value={value.name}>
                                        {value.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ margin: 2, width: "20%" }}>
                            <InputLabel id="dropdown-attacler">
                                choose an attacker
                            </InputLabel>
                            <Select
                                labelId="dropdown-attacker"
                                id="dropattacker"
                                value={setupObject.attacker}
                                label="choose an attacker"
                                onChange={(e: any) => {
                                    setSetupObject({
                                        ...setupObject,
                                        attacker: e.target.value
                                    });
                                }}
                            >
                                {armies.map((value: any, index: number) => (
                                    <MenuItem key={index} value={value.name}>
                                        {value.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ margin: 2, width: "20%" }}>
                            <InputLabel id="dropdown-defender">
                                choose a defender
                            </InputLabel>
                            <Select
                                labelId="dropdown-defender"
                                id="dropdefender"
                                value={setupObject.defender}
                                label="choose a defender"
                                onChange={(e: any) => {
                                    setSetupObject({
                                        ...setupObject,
                                        defender: e.target.value
                                    });
                                }}
                            >
                                {armies.map((value: any, index: number) => (
                                    <MenuItem key={index} value={value.name}>
                                        {value.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ margin: 2, width: "20%" }}>
                            <InputLabel id="dropdown-you">
                                are you attacker or defender?
                            </InputLabel>
                            <Select
                                labelId="dropdown-you"
                                id="dropyou"
                                value={setupObject.you}
                                label="attack or defend"
                                onChange={(e: any) => {
                                    setSetupObject({
                                        ...setupObject,
                                        you: e.target.value
                                    });
                                }}
                            >
                                <MenuItem value="attacker">
                                    attacker
                                </MenuItem>
                                <MenuItem value="defender">
                                    defender
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {
                            (
                                setupObject.attacker !== '' &&
                                setupObject.defender !== '' &&
                                setupObject.map !== '' &&
                                setupObject.mission !== '' &&
                                setupObject.you !== ''
                            ) ?
                                <button
                                    onClick={ () => {
                                        setGameObject({
                                            ...gameObject,
                                            status: 'preBattle'
                                        });
                                    }}
                                >Start game</button> :
                                <></>
                        }


                    </Container> :
                    <Battle />
            }
        </div>
    );
}

export default SetupGame;