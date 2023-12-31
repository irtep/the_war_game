import React, { useContext, useEffect, useRef, useState } from 'react';
import Header from './Header';
import { Button, Container, Dialog, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { games, factions, Faction, Crews } from '../data/factionData';
import { FlamesContext } from '../context/FlamesContext';
import { Team, Army, ArmyToSend, SavedTeam, SavedUnit } from '../data/sharedInterfaces';

const container = {
    margin: "auto",
    width: "100%",
    borderRadius: "10px",
    padding: "10px",
    background: "rgb(80,80,80)",
    color: "rgb(170,170,170)"
};

type stringOrUndefined = string | undefined;

const BuildArmy: React.FC = (): React.ReactElement => {
    const [nameOfGame, setNameOfGame] = useState<string>('');
    const [army, setArmy] = useState<string>(''); // this is faction! army is that armyCreated
    const [pointLimit, setPointLimit] = useState<number>(50);
    const { teams } = useContext(FlamesContext);
    const [unitDialog, setUnitDialog] = useState<boolean>(false);
    const formRef: any = useRef<HTMLFormElement>();
    const [unitName, setUnitName] = useState<string>('');
    const [teamSelectors, setTeamSelectors] = useState<stringOrUndefined[]>(['']);
    const [crewSelectors, setCrewSelectors] = useState<stringOrUndefined[]>(['']);
    const [armyCreated, setArmyCreated] = useState<Army>({
        user: '',
        name: '',
        faction: '',
        game: '',
        points: 0,
        units: []
    });

    const deleteUnit = (id: number): void => {
        setArmyCreated({
            ...armyCreated,
            units: armyCreated.units.filter(unit => unit.id !== id)
        });
    };

    const createUnit = (e: React.FormEvent): void => {
        e.preventDefault();

        const newUnit: SavedUnit = {
            id: armyCreated.units.length,
            name: JSON.stringify(unitName),
            teams: [],
            points: 0
        };

        for (let i = 0; i < teamSelectors.length - 1; i++) {
            let newTeam: SavedTeam = { team: '', crew: '', points: 0 };
            const teamStats = teams.filter((team: Faction) => team.name === teamSelectors[i]);
            const factionStats = factions
                .filter((value: Faction) => value.game === nameOfGame)
                .filter((value: Faction) => value.name === army);
            const crewStats = factionStats[0].crews.filter((crew: Crews) => crew.experience === crewSelectors[i]);

            newTeam.team = teamSelectors[i];
            newTeam.crew = crewSelectors[i];
            newTeam.points = crewStats[0].cost + teamStats[0].points;

            newUnit.teams.push(newTeam);
        };

        setArmyCreated({
            ...armyCreated,
            units: [...armyCreated.units, newUnit]
        });
    }

    const handleTeamSelectorChange = (index: number, value: stringOrUndefined): void => {
        let oldValues = [...teamSelectors];
        oldValues[index] = value;
        setTeamSelectors([...oldValues, '']);
        const oldPointsValue = armyCreated.points;
        const unitsStats = teams.filter((team: Faction) => team.name === value);
        setArmyCreated({
            ...armyCreated,
            points: Number(oldPointsValue) + Number(unitsStats[0].points)
        });
    };

    const handleCrewSelectorChange = (index: number, value: stringOrUndefined): void => {
        let oldValues = [...crewSelectors];
        oldValues[index] = value;
        setCrewSelectors([...oldValues, '']);
        
        const oldPointsValue = armyCreated.points;
        const factionStats = factions.filter((faction: Faction) => faction.name === army);
        const foundCrew = factionStats[0].crews.filter((crew: Crews) => crew.experience === value);
        
        setArmyCreated({
            ...armyCreated,
            points: Number(oldPointsValue) + Number(foundCrew[0].cost)
        });
    };

    const saveArmy = async (): Promise<void> => {
        const armyToSend: ArmyToSend = {
            user: 'default', // this maybe changes at some point, when multi users
            name: armyCreated.name,
            faction: army,
            game: nameOfGame,
            points: armyCreated.points,
            units: JSON.stringify(armyCreated.units)           
        };
        console.log('army to send: ', armyToSend);
        // API:
        
        try {
            const response = await fetch('http://localhost:3111/api/armies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(armyToSend),
            });

            if (response.ok) {
                console.log('Data saved successfully');
            } else {
                console.log('Error saving data');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('An error occurred while saving data');
        }        
    };

    useEffect(() => {
        console.log('ac: ', armyCreated);
    });

    return (
        <div style={container}>
            <Header />

            <FormControl sx={{ margin: 2, width: "20%" }}>
                <InputLabel id="dropdown-label">
                    What game?
                </InputLabel>
                <Select
                    labelId="dropdown-label"
                    id="dropdown"
                    value={nameOfGame}
                    label="What game?"
                    onChange={(e) => { setNameOfGame(e.target.value) }}
                >
                    {games.map((value: string, index: number) => (
                        <MenuItem key={index} value={value}>
                            {value}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ margin: 2, width: "20%" }}>
                <TextField
                    type="text"
                    value={armyCreated.name}
                    label="Name your army"
                    onChange={(e) => {
                        setArmyCreated({
                            ...armyCreated,
                            name: e.target.value
                        })
                    }}
                />
            </FormControl>

            <FormControl sx={{ margin: 2, width: "20%" }}>
                <InputLabel id="dropdown-label2">
                    What army?
                </InputLabel>
                <Select
                    labelId="dropdown-label2"
                    id="dropdown2"
                    value={army}
                    label="What army?"
                    onChange={(e) => { setArmy(e.target.value) }}
                >
                    {factions
                        .filter((value: Faction) => value.game === nameOfGame)
                        .map((value: Faction, index: number) => (
                            <MenuItem key={`f: ${index}`} value={value.name}>
                                {value.name}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>

            <FormControl sx={{ margin: 2, width: "20%" }}>
                <TextField
                    type="number"
                    value={pointLimit}
                    label="Points limit"
                    onChange={(e) => { setPointLimit(Number(e.target.value)) }}
                />
            </FormControl>

            <Typography>{`points used: ${armyCreated.points}/${pointLimit}`}</Typography>

            <button
                style={{
                    margin: 2,
                    background: "navy",
                    color: "white"
                }}
                onClick={() => { console.log('click'); setUnitDialog(true) }}
            >
                create unit
            </button>

            {
                (armyCreated.units.length > 0) ?
                <>
                    <br/>
                    <button 
                        style={{marginTop: 5}}
                        onClick={saveArmy}
                    >
                        Save army
                    </button>
                </>:
                <></>
            }

            <Dialog
                maxWidth="lg"
                fullWidth={true}
                open={unitDialog}
                onClose={() => { setUnitDialog(false) }}
            >
                <DialogTitle>Choose 1-5 teams for this unit</DialogTitle>

                <DialogContent style={{ paddingTop: 10, display: 'flex' }}>
                    <Stack
                        spacing={1}
                        component="form"
                        onSubmit={createUnit}
                        ref={formRef}
                    >

                        <TextField
                            required
                            name="name"
                            label="name of unit"
                            fullWidth
                            variant="outlined"
                            value={unitName}
                            onChange={(e) => { setUnitName(e.target.value) }}
                        />
                        <div style={{ flex: 1, marginRight: 20 }}>
                            {teamSelectors.map((selectedTeam, index) => (
                                <div key={`teamSelector${index}`}>
                                    <InputLabel id={`unit${index + 1}-label`}>
                                        {`Choose team ${index + 1}`}
                                    </InputLabel>
                                    <Select
                                        labelId={`unit${index + 1}-label`}
                                        id={`unit${index + 1}`}
                                        label={`choose team`}
                                        value={selectedTeam}
                                        onChange={(e) => {
                                            handleTeamSelectorChange(index, e.target.value as stringOrUndefined);
                                        }}
                                    >
                                        {/* Add an empty string value option */}
                                        <MenuItem value="">
                                            -
                                        </MenuItem>
                                        {
                                            teams
                                                .filter((value: Team) => value.faction === army)
                                                .map((value: Team, teamIndex: number) => (
                                                    <MenuItem
                                                        key={`teamselect${index + 1}:${teamIndex}`}
                                                        value={value.name}
                                                    >
                                                        {`${value.nickname} (${value.points} p.)`}
                                                    </MenuItem>
                                                ))}
                                    </Select>

                                </div>
                            ))}
                        </div>
                        <div style={{ flex: 1 }}>
                            {crewSelectors.map((selectedCrew, index) => (
                                <div key={`crewSelector${index}`}>
                                    <InputLabel id={`crew${index + 1}-label`}>
                                        {`Choose crew for team ${index + 1}`}
                                    </InputLabel>
                                    <Select
                                        labelId={`crew${index + 1}-label`}
                                        id={`crew${index + 1}`}
                                        label={`choose team`}
                                        value={selectedCrew}
                                        onChange={(e) => {
                                            handleCrewSelectorChange(index, e.target.value as stringOrUndefined);
                                        }}
                                    >
                                        {/* Add an empty string value option */}
                                        <MenuItem value="">
                                            -
                                        </MenuItem>
                                        {factions
                                            .filter((faction) => faction.name === army)
                                            .filter((faction) => faction.game === nameOfGame)
                                            .map((faction) =>
                                                faction.crews.map((crew, crewIndex) => (
                                                    <MenuItem key={`crewSelect${index + 1}:${crewIndex}`} value={crew.experience}>
                                                        {`${crew.experience} (${crew.cost})`}
                                                    </MenuItem>
                                                ))
                                            )}
                                    </Select>
                                </div>
                            ))}
                        </div>

                        <Button
                            variant="contained"
                            type="submit"
                        >
                            Tallenna
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={() => {
                                setUnitDialog(false);
                                setTeamSelectors(['']);
                                setCrewSelectors(['']);
                            }}
                        >
                            Peruuta / Poistu
                        </Button>

                    </Stack>
                </DialogContent>

            </Dialog >

            <Container>
                Units: <br />
                {
                    armyCreated.units.map((unit: SavedUnit, idx: number) => {
                        return (
                            <Container sx={{
                                backgroundImage: "linear-gradient(rgb(0,42,16), rgb(80,80,80))",
                                margin: 2,
                                borderRadius: 3,
                                padding: 2,
                                width: "30%"
                            }}
                                key={`ac ${idx}`}>
                                <Typography>
                                    {
                                        `name: ${unit.name}`
                                    }
                                </Typography>
                                <Typography>
                                    {
                                        unit.teams.map((team: SavedTeam, id: number) =>
                                            <span key={`teams ${id}`}>
                                                {`${team.crew} ${team.team} (${team.points} p.)`}<br />
                                            </span>
                                        )
                                    }
                                </Typography>
                                <button
                                    style={{
                                        margin: 4,
                                        background: "darkred"
                                    }}
                                    onClick={() => deleteUnit(unit.id)}
                                >delete unit</button>
                            </Container>
                        )
                    })
                }
            </Container>

        </div >
    );
}

export default BuildArmy;
