import { GameObject } from "../data/sharedInterfaces";

interface House {
    x: number;
    y: number;
    w: number;
    h: number;
    getCorners?: any;
    setCorners?: any;
}

interface Circles {
    x: number;
    y: number;
    s: number;
    getCorners?: any;
    setCorners?: any;
}

interface Canvas {
    w: number;
    h: number;
}

// Define a type for the image cache
interface ImageCache {
    [key: string]: HTMLImageElement;
}

// Create an object to store loaded images
const imageCache: ImageCache = {};

export const draw = (canvas: HTMLCanvasElement, canvasSize: Canvas, gameObject: GameObject, selected: any): void => {
    const scale: number = 15;
    const ctx: CanvasRenderingContext2D | null | undefined = canvas?.getContext("2d");

    if (ctx) {
        ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
        //console.log('draw: ', gameObject);

        // Draw terrain:
        gameObject.terrain.houses.forEach((house: House) => {
            /*
                        house.setCorners(0); // for debug
                        const corners = house.getCorners(); // for debug
                        console.log('corners: ', corners);
            */
            ctx.beginPath();
            ctx.fillStyle = "rgb(180,180,180)";
            ctx.rect(house.x, house.y, house.w, house.h);
            ctx.fill();
            ctx.closePath();

            // for debug:
            /*
                        const colors: string[] = ['orange', 'red', 'blue', 'green'];
                        corners.forEach((corner: any, ix: number) => {
                            ctx.beginPath();
                            ctx.strokeStyle = colors[ix];
                            ctx.arc(corner.x, corner.y, 10, 0, Math.PI * 2, true);
                            ctx.stroke();
                            ctx.closePath();
                        });
            */
        });

        gameObject.terrain.trees.forEach((tree: Circles) => {
            /*
                        tree.setCorners(0); // for debug
                        const corners = tree.getCorners(); // for debug
            */
            ctx.beginPath();
            ctx.fillStyle = "darkgreen";
            ctx.arc(tree.x, tree.y, tree.s, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.closePath();
            /*
                        const colors: string[] = ['orange', 'red', 'blue', 'green'];
                        corners.forEach((corner: any, ix: number) => {
                            ctx.beginPath();
                            ctx.strokeStyle = colors[ix];
                            ctx.arc(corner.x, corner.y, 10, 0, Math.PI * 2, true);
                            ctx.stroke();
                            ctx.closePath();
                        });*/
        });

        gameObject.terrain.waters.forEach((water: Circles) => {

            //           water.setCorners(0); // for debug
            //           const corners = water.getCorners(); // for debug

            ctx.beginPath();
            ctx.fillStyle = "darkblue";
            ctx.arc(water.x, water.y, water.s, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.closePath();
            /*
                        const colors: string[] = ['orange', 'red', 'blue', 'green'];
                        corners.forEach((corner: any, ix: number) => {
                            ctx.beginPath();
                            ctx.strokeStyle = colors[ix];
                            ctx.arc(corner.x, corner.y, 10, 0, Math.PI * 2, true);
                            ctx.stroke();
                            ctx.closePath();
                        });*/
        });

        gameObject.attacker.units.forEach((unit: any) => {
            unit.teams.forEach((team: any) => {
                //console.log('imagekey: ', team.imgTop);
                if (team === undefined) {
                    // for some reason can be undefined sometimes after LOS check.
                    // need to investigate further
                    console.log('error: ', unit, team);
                } else {
                    const imgKey = team.imgTop;

                    //          team.setCorners(0); // for debug
                    //         const corners = team.getCorners(); // for debug

                    // Check if the image is already in the cache
                    if (!imageCache[imgKey]) {
                        // If not, load the image and add it to the cache
                        const img = new Image();
                        img.onerror = (error) => {
                            console.error('Error loading image:', error);
                        };
                        img.src = process.env.PUBLIC_URL + `/img/units/${imgKey}.png`;
                        imageCache[imgKey] = img;
                    }

                    const img = imageCache[imgKey];

                    // Draw the image using the cached instance
                    ctx.save();
                    ctx.translate(team.x, team.y);
                    ctx.rotate(team.a * (Math.PI / 180));
                    ctx.drawImage(img, -team.width / (2 * scale), -team.height / (2 * scale), team.width / scale, team.height / scale);

                    // Draw text or other things related to the team
                    ctx.font = '10px Arial';
                    ctx.fillStyle = 'white';
                    ctx.fillText('unit ' + unit.name, -team.width / (2 * scale) - 20, -team.height / (2 * scale) - 15);
                    ctx.fillStyle = 'white';
                    ctx.fillText(team.name + ' ' + team.tacticalNumber, -team.width / (2 * scale) - 20, -team.height / (2 * scale) - 5);


                    ctx.restore();

                    if (team.order === 'listening') {
                        ctx.beginPath();
                        ctx.strokeStyle = 'green';
                        ctx.arc(team.x, team.y, 50, 0, Math.PI * 2, true);
                        ctx.stroke();
                        ctx.closePath();
                    }

                    if (team.uuid === selected.id[0]) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'navy';
                        ctx.arc(team.x, team.y, 55, 0, Math.PI * 2, true);
                        ctx.stroke();
                        ctx.closePath();

                        // weapon ranges
                        team.combatWeapons.forEach((w: any) => {

                            ctx.beginPath();
                            ctx.strokeStyle = 'black';
                            ctx.arc(team.x, team.y, w.combatRange, 0, Math.PI * 2, true);
                            ctx.stroke();
                            ctx.closePath();
                        });
                    }
                    /*
                                    const colors: string[] = ['orange', 'red', 'blue', 'green'];
                                    corners.forEach((corner: any, ix: number) => {
                                        ctx.beginPath();
                                        ctx.strokeStyle = colors[ix];
                                        ctx.arc(corner.x, corner.y, 10, 0, Math.PI * 2, true);
                                        ctx.stroke();
                                        ctx.closePath();
                                    });
                    */
                }
            });
        });

        gameObject.defender.units.forEach((unit: any) => {
            unit.teams.forEach((team: any) => {
                if (team === undefined) {
                    console.log('team undefined...', unit);
                } else {
                    const imgKey = team.imgTop;

                    // Check if the image is already in the cache
                    if (!imageCache[imgKey]) {
                        // If not, load the image and add it to the cache
                        const img = new Image();
                        img.src = process.env.PUBLIC_URL + `/img/units/${imgKey}.png`;
                        imageCache[imgKey] = img;
                    }

                    const img = imageCache[imgKey];

                    // Draw the image using the cached instance
                    ctx.save();
                    ctx.translate(team.x, team.y);
                    ctx.rotate(team.a * (Math.PI / 180));
                    ctx.drawImage(img, -team.width / (2 * scale), -team.height / (2 * scale), team.width / scale, team.height / scale);

                    // Draw text or other things related to the team
                    ctx.font = '10px Arial';
                    ctx.fillStyle = 'white';
                    ctx.fillText('unit ' + unit.name, -team.width / (2 * scale) - 20, -team.height / (2 * scale) - 15);
                    ctx.fillStyle = 'white';
                    ctx.fillText(team.name + ' ' + team.tacticalNumber, -team.width / (2 * scale) - 20, -team.height / (2 * scale) - 5);


                    ctx.restore();

                    if (team.order === 'listening') {
                        ctx.beginPath();
                        ctx.strokeStyle = 'green';
                        ctx.arc(team.x, team.y, 50, 0, Math.PI * 2, true);
                        ctx.stroke();
                        ctx.closePath();
                    }

                    if (team.uuid === selected.id[0]) {

                        ctx.beginPath();
                        ctx.strokeStyle = 'navy';
                        ctx.arc(team.x, team.y, 55, 0, Math.PI * 2, true);
                        ctx.stroke();
                        ctx.closePath();

                        // weapon ranges
                        team.combatWeapons.forEach((w: any) => {

                            ctx.beginPath();
                            ctx.strokeStyle = 'black';
                            ctx.arc(team.x, team.y, w.combatRange, 0, Math.PI * 2, true);
                            ctx.stroke();
                            ctx.closePath();
                        });
                    }
                }

            });
        });
    }
};
/*
export const draw = (canvas: HTMLCanvasElement, canvasSize: Canvas, gameObject: GameObject, selected: any): void => {
    const scale = 15;
    const ctx = canvas?.getContext("2d");

    if (ctx) {
        ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
        //console.log('draw: ', gameObject);

        // Draw terrain:
        gameObject.terrain.houses.forEach((house: House) => {
            ctx.beginPath();
            ctx.fillStyle = "rgb(180,180,180)";
            ctx.rect(house.x, house.y, house.w, house.h);
            ctx.fill();
            ctx.closePath();
        });

        gameObject.terrain.trees.forEach((tree: Circles) => {
            ctx.beginPath();
            ctx.fillStyle = "darkgreen";
            ctx.arc(tree.x, tree.y, tree.s, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.closePath();
        });

        gameObject.terrain.waters.forEach((water: Circles) => {
            ctx.beginPath();
            ctx.fillStyle = "darkblue";
            ctx.arc(water.x, water.y, water.s, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.closePath();
        });
        //console.log('game at drw', gameObject);
        // draw attackers units:
        gameObject.attacker.units.forEach((unit: any) => {
            unit.teams.forEach((team: any) => {
                const img = new Image();
                img.src = process.env.PUBLIC_URL + `/img/units/${team.imgTop}.png`;
                img.onload = () => {

                    // Draw the image here
                    ctx.save(); // Save the current context state

                    // Move the coordinate system to the team's position
                    ctx.translate(team.x, team.y);
                    ctx.rotate(team.a * (Math.PI / 180));

                    // Draw the rotated image
                    ctx.drawImage(img, -team.width / (2 * scale), -team.height / (2 * scale), team.width / scale, team.height / scale);

                    // Draw text or other things related to the team
                    ctx.font = '10px Arial';
                    ctx.fillStyle = 'white';
                    ctx.fillText('unit ' + unit.name, -team.width / (2 * scale) - 20, -team.height / (2 * scale) - 15);
                    ctx.fillStyle = 'white';
                    ctx.fillText(team.name + ' ' + team.tacticalNumber, -team.width / (2 * scale) - 20, -team.height / (2 * scale) - 5);

                    ctx.restore(); // Restore the original context state

                    if (team.order === 'listening') {
                        ctx.beginPath();
                        ctx.strokeStyle = 'green';
                        ctx.arc(team.x, team.y, 50, 0, Math.PI * 2, true);
                        ctx.stroke();
                        ctx.closePath();
                    }

                    if (team.uuid === selected.id[0]) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'navy';
                        ctx.arc(team.x, team.y, 55, 0, Math.PI * 2, true);
                        ctx.stroke();
                        ctx.closePath();
                    }
                };
            });
        });

        gameObject.defender.units.forEach((unit: any) => {
            unit.teams.forEach((team: any) => {
                const img = new Image();
                img.src = process.env.PUBLIC_URL + `/img/units/${team.imgTop}.png`;
                img.onload = () => {

                    // Draw the image here
                    ctx.save(); // Save the current context state

                    // Move the coordinate system to the team's position
                    ctx.translate(team.x, team.y);
                    ctx.rotate(team.a * (Math.PI / 180));

                    // Draw the rotated image
                    ctx.drawImage(img, -team.width / (2 * scale), -team.height / (2 * scale), team.width / scale, team.height / scale);

                    // Draw text or other things related to the team
                    ctx.font = '10px Arial';
                    ctx.fillStyle = 'black';
                    ctx.fillText('unit ' + unit.name, -team.width / (2 * scale) - 20, -team.height / (2 * scale) - 15);
                    ctx.fillStyle = 'black';
                    ctx.fillText(team.name + ' ' + team.tacticalNumber, -team.width / (2 * scale) - 20, -team.height / (2 * scale) - 5);

                    if (team.order === 'listening') {

                        ctx.beginPath();
                        ctx.strokeStyle = 'green';
                        ctx.arc(team.x, team.y, 50, 0, Math.PI * 2, true);
                        ctx.stroke();
                        ctx.closePath();
                    }

                    ctx.restore(); // Restore the original context state
                };
            });
        });
    }
}
*/

// https://github.com/irtep/TheRockRally/blob/master/public/race/draw.js