import React, { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';

interface House {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface Circles {
    x: number;
    y: number;
    s: number;
}

interface Canvas {
    w: number;
    h: number;
}

interface Adds {
    house: boolean;
    tree: boolean;
    water: boolean;
}

const CreateMap: React.FC = () => {
    const [houses, setHouses] = useState<House[]>([]);
    const [trees, setTrees] = useState<Circles[]>([]);
    const [waters, setWaters] = useState<Circles[]>([]);
    const [dialog, setDialog] = useState<boolean>(false);
    const [adding, setAdding] = useState<Adds>({
        house: false,
        tree: false,
        water: false
    });
    const canvasSize = { w: 1300, h: 900 };
    const formRef: any = useRef<HTMLFormElement>();

    const addHouse = () => { setAdding({ house: true, tree: false, water: false }); };
    const addTree = () => { setAdding({ house: false, tree: true, water: false }); };
    const addWater = () => { setAdding({ house: false, tree: false, water: true }); };

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (adding.house) {
            const newHouse: House = {
                x: Number(x),
                y: Number(y),
                w: 100,
                h: 100
            };
            setHouses([...houses, newHouse]);
        }

        if (adding.tree) {
            const newTree: Circles = {
                x: Number(x),
                y: Number(y),
                s: 12
            };
            setTrees([...trees, newTree]);
        }

        if (adding.water) {
            const newWater: Circles = {
                x: Number(x),
                y: Number(y),
                s: 55
            };
            setWaters([...waters, newWater]);
        }

        setAdding({ house: false, tree: false, water: false });
    };

    function draw() {
        const canvas = document.getElementById("mapCanvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

            houses.forEach((house: House) => {
                ctx.beginPath();
                ctx.fillStyle = "rgb(180,180,180)";
                ctx.rect(house.x, house.y, house.w, house.h);
                ctx.fill();
            });

            trees.forEach((tree: Circles) => {
                ctx.beginPath();
                ctx.fillStyle = "darkgreen";
                ctx.arc(tree.x, tree.y, tree.s, 0, Math.PI * 2, true);
                ctx.fill();
            });

            waters.forEach((water: Circles) => {
                ctx.beginPath();
                ctx.fillStyle = "darkblue";
                ctx.arc(water.x, water.y, water.s, 0, Math.PI * 2, true);
                ctx.fill();
            });
        }
    }

    const saveMap = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        const formData = {
            name: formRef.current?.name.value,
            type: formRef.current?.typeOfMap.value,
            houses: JSON.stringify(houses),
            trees: JSON.stringify(trees),
            waters: JSON.stringify(waters)
        };

        try {
            const response = await fetch('http://localhost:3111/api/terrains', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('send ok');
            } else {
                console.log('send not ok ', response);
            }
        } catch (error) {
            console.error('Error:', error);
        }

    }

    const formOpen = (): void => {
        setDialog(true);
    }

    const cancelSend = (): void => {
        setDialog(false);
    }

    useEffect(() => {
        draw();
    }, [houses, trees, waters]);

    return (
        <div>
            <button onClick={addHouse}>Add House</button>
            <button onClick={addTree}>Add Tree</button>
            <button onClick={addWater}>Add Water</button>
            <button onClick={formOpen}>save map</button>

            <Dialog
                maxWidth="lg"
                fullWidth={true}
                open={dialog}
                onClose={cancelSend}
            >
                <DialogTitle>Anna tiedot</DialogTitle>

                <DialogContent style={{ paddingTop: 10 }}>
                    <Stack
                        spacing={1}
                        component="form"
                        onSubmit={saveMap}
                        ref={formRef}
                    >

                        <TextField
                            required
                            name="name"
                            label="kentän nimi"
                            fullWidth
                            variant="outlined"
                        />

                        <TextField
                            required
                            name="typeOfMap"
                            label="kentän tyyppi"
                            fullWidth
                            variant="outlined"
                        />

                        <Button
                            variant="contained"
                            type="submit"
                        >Tallenna</Button>

                        <Button
                            variant="outlined"
                            onClick={cancelSend}
                        >Peruuta</Button>

                    </Stack>
                </DialogContent>

            </Dialog>

            <canvas
                id="mapCanvas"
                width={canvasSize.w}
                height={canvasSize.h}
                style={{
                    position: "absolute",
                    border: '1px solid black',
                    background: "#9A7B4D",
                    marginLeft: 0,
                    marginRight: 0
                }}
                onClick={handleCanvasClick}
            >
            </canvas>
        </div>
    );
};

export default CreateMap;
