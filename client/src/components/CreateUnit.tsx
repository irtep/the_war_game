import React, { useRef, useState } from 'react';
import Header from './Header';
import { Button, TextField, Stack, Typography, Container } from '@mui/material';
import { teamProps } from '../data/teamData';

const container = {
    margin: "auto",
    width: "90%",
    borderRadius: "10px",
    padding: "10px",
    color: "rgb(170,170,170)"
};

const CreateUnit: React.FC = (): React.ReactElement => {
    const [msg, setMsg] = useState<string>('');

    const formRef: any = useRef<HTMLFormElement>();

    const save = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Validate input values
        const formData = {} as Record<string, string | number>;
        let isValid = true;

        teamProps.forEach((field) => {
            const input = event.currentTarget[field.value] as HTMLInputElement;
            const inputValue = input.value.trim();

            if (field.type === 'number') {
                if (!/^\d+$/.test(inputValue)) {
                    isValid = false;
                    setMsg(`Invalid value for ${field.value}. Please enter a number.`);
                }
                formData[field.value] = parseInt(inputValue, 10);
            } else if (field.type === 'string') {
                formData[field.value] = inputValue;
            }
        });

        if (!isValid) {
            return;
        }

        try {
            const response = await fetch('http://localhost:3111/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMsg('Data saved successfully');
            } else {
                setMsg('Error saving data');
            }
        } catch (error) {
            console.error('Error:', error);
            setMsg('An error occurred while saving data');
        }
    };

    return (
        <div style={container}>

            <Header />

            <Container sx={{
                marginTop: 10,
                color: "white"
                }}>
                <Stack
                    spacing={1}
                    component="form"
                    onSubmit={save}
                    ref={formRef}
                >

                    <Typography sx= {{ marginBottom: 5 }}>
                        Lisää yksikkö
                    </Typography>

                    {
                        teamProps.map( (field, index) => {
                            return(
                                <TextField
                                    key={index}
                                    name={field.value}
                                    label={field.value}
                                    fullWidth
                                    variant="outlined"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}    
                                    type={field.type === 'number' ? 'number' : 'text'}                            
                                />
                            )
                        })
                    }

                    <Button
                        variant="contained"
                        type="submit"
                    >Tallenna</Button>

                    <Typography sx={{ color: "red" }}>
                        {msg}
                    </Typography>

                </Stack>
            </Container>

        </div>
    );
}

export default CreateUnit;