import React, { useContext, useRef, useState } from 'react';
import Header from './Header';
import { Button, Container, Dialog, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { games, factions, Faction } from '../data/factionData';
import { FlamesContext } from '../context/FlamesContext';

const container = {
    margin: "auto",
    width: "100%",
    borderRadius: "10px",
    padding: "10px",
    background: "rgb(80,80,80)",
    color: "rgb(170,170,170)"
};

const BuildArmy: React.FC = (): React.ReactElement => {
    const [nameOfGame, setNameOfGame] = useState<string>('');
    const [army, setArmy] = useState<string>('');
    const [pointLimit, setPointLimit] = useState<number>(50);
    const [pointsUsed, setPointsUsed] = useState<number>(0);
    const { teams } = useContext(FlamesContext);
    const [unitDialog, setUnitDialog] = useState<boolean>(false);
    const formRef: any = useRef<HTMLFormElement>();

    const createUnit = (e: React.FormEvent) => {
        e.preventDefault();
    }

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
                    {factions.map((value: Faction, index: number) => (
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

            <Typography>{`points used: ${pointsUsed}/${pointLimit}`}</Typography>

            <button
                style={{ margin: 2 }}
                onClick={() => { console.log('click'); setUnitDialog(true) }}
            >
                create unit
            </button>

            <Dialog
                maxWidth="lg"
                fullWidth={true}
                open={unitDialog}
                onClose={() => { setUnitDialog(false) }}
            >
                <DialogTitle>Choose 1-5 teams for this unit</DialogTitle>

                <DialogContent style={{ paddingTop: 10 }}>
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
                        />

                        <InputLabel id="unit1-label">
                            What army?
                        </InputLabel>
                        <Select
                            labelId="unit1-label"
                            id="unit1"
                            label="choose team"
                        >
                            {teams
                                .filter((value: any) => value.faction === army)
                                .map((value: any, index: number) => (
                                    <MenuItem key={`fz: ${index}`} value={value.name}>
                                        {value.name}
                                    </MenuItem>
                                ))}
                        </Select>

                        <Button
                            variant="contained"
                            type="submit"
                        >Tallenna</Button>

                        <Button
                            variant="outlined"
                            onClick={() => { setUnitDialog(false) }}
                        >Peruuta</Button>

                    </Stack>
                </DialogContent>

            </Dialog>

        </div>
    );
}

export default BuildArmy;