import exp from "constants";
import { Explosion, GameObject, Smoke } from "../data/sharedInterfaces";
import { callDice } from "./helpFunctions";

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

// Function to draw a star-like explosion
const drawExplosion = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, numPoints: number, color: string) => {
    ctx.beginPath();
    ctx.fillStyle = color;

    for (let i = 0; i < numPoints * 2; i++) {
        const angle = (i * Math.PI) / numPoints;
        const distance = i % 2 === 0 ? radius : radius / 2; // Alternate between outer and inner points
        const posX = x + distance * Math.cos(angle);
        const posY = y + distance * Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(posX, posY);
        } else {
            ctx.lineTo(posX, posY);
        }
    }

    ctx.closePath();
    ctx.fill();
}

const drawTeams = (ctx: any, teams: any, scale: number, selected: any) => {
    teams.units.forEach((unit: any) => {
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

                // draw if...
                if (team.pinned) {
                    ctx.fillStyle = 'red';
                    ctx.fillText('pinned', -team.width / (2 * scale) - 20, team.height / (2 * scale) + 2);
                }
                if (team.shaken) {
                    ctx.fillStyle = 'red';
                    ctx.fillText('shaken', -team.width / (2 * scale) - 20, team.height / (2 * scale) + 4);
                }
                if (team.stunned) {
                    ctx.fillStyle = 'red';
                    ctx.fillText('stunned', -team.width / (2 * scale) - 20, team.height / (2 * scale) + 6);
                }
                if (team.speed === 0) {
                    if (team.disabled) {
                        ctx.fillStyle = 'red';
                        ctx.fillText('destroyed', -team.width / (2 * scale) - 20, team.height / (2 * scale) + 8);
                    } else {
                        ctx.fillStyle = 'red';
                        ctx.fillText('immobilized', -team.width / (2 * scale) - 20, team.height / (2 * scale) + 8);
                    }
                }

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
                    team.combatWeapons.forEach((w: any, i: number) => {

                        ctx.beginPath();
                        ctx.strokeStyle = 'black';
                        ctx.arc(team.x, team.y, w.combatRange, 0, Math.PI * 2, true);
                        ctx.stroke();
                        ctx.closePath();

                        ctx.fillStyle = 'purple';
                        ctx.fillText(`${w.name} status: ${w.reload}/${w.firerate}`, team.x + 50, team.y + i * 10);
                    });
                }
                if (team.disabled && team.type === 'tank') {
                    // if disabled make a smoke effect
                    const randomDirs1 = callDice(3);
                    const randomDirs2 = callDice(3);
                    const horizontalChange = callDice(10);
                    const verticalChange = callDice(10);
                    const sizeChange = callDice(5) + 5;
                    const flameSize = sizeChange / 1.8; // Adjust the size of flames relative to smoke

                    const dirs = [
                        { x: team.x - horizontalChange, y: team.y + verticalChange },
                        { x: team.x + horizontalChange, y: team.y - verticalChange },
                        { x: team.x - horizontalChange, y: team.y + verticalChange },
                        { x: team.x + horizontalChange, y: team.y - verticalChange },
                    ];

                    // smoke
                    ctx.beginPath();
                    ctx.fillStyle = 'rgb(169,169,169)';
                    ctx.arc(dirs[randomDirs1].x, dirs[randomDirs2].y, sizeChange, 0, Math.PI * 2, true);
                    ctx.fill();
                    ctx.closePath();

                    // more smoke
                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.fillStyle = 'rgba(160,160,160, 0.8)'; // Adjust the color and opacity of flames
                        ctx.arc(
                            dirs[randomDirs2].x,
                            dirs[randomDirs1].y,
                            flameSize,
                            0,
                            Math.PI * 2,
                            true
                        );
                        ctx.fill();
                        ctx.closePath();
                    }
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
}

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


        // draw all teams:
        drawTeams(ctx, gameObject.attacker, scale, selected);
        drawTeams(ctx, gameObject.defender, scale, selected);

        // firing lines
        gameObject.attacksToResolve?.forEach((shooting: any) => {
            // console.log('draw: ', shooting.weapon);
            if (shooting.weapon.reload < 500 || shooting.weapon.reload === shooting.weapon.firerate) {
                // Draw firing line
                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.moveTo(shooting.origin.x, shooting.origin.y);
                ctx.lineTo(shooting.object.x, shooting.object.y);
                ctx.stroke();

                // Draw explosion (star) at the target
                drawExplosion(ctx, shooting.object.x, shooting.object.y, 5, 5, 'yellow');
            }
        });

        // bombardments
        gameObject.bombsToResolve?.forEach((shooting: any) => {
            // console.log('draw: ', shooting.weapon);
            if (shooting.weapon.reload < 500 || shooting.weapon.reload === shooting.weapon.firerate) {
                // Draw firing line
                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.moveTo(shooting.origin.x, shooting.origin.y);
                ctx.lineTo(shooting.object.x, shooting.object.y);
                ctx.stroke();

                // Draw explosion (star) at the target
                drawExplosion(ctx, shooting.object.x, shooting.object.y, 7, 7, 'yellow');
                ctx.beginPath();
                ctx.strokeStyle = 'orange';
                ctx.arc(shooting.object.x, shooting.object.y, 50, 0, Math.PI * 2, true);
                ctx.stroke();
                ctx.closePath();
            }
        });

        // smokes:

        gameObject.smokes?.forEach((smoke: Smoke) => {

            if (smoke.size > 0) {
                ctx.beginPath();
                ctx.fillStyle = "darkgray";
                ctx.arc(smoke.x, smoke.y, smoke.size, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.closePath();
            }

        });

        // explosions
        gameObject.explosions?.forEach((explosion: Explosion) => {

            if (explosion.size > 0) {
                drawExplosion(ctx, explosion.x, explosion.y, 7, 7, 'yellow');
                ctx.beginPath();
                ctx.strokeStyle = 'orange';
                ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2, true);
                ctx.stroke();
                ctx.closePath();
            }

        });
    }
};


// https://github.com/irtep/TheRockRally/blob/master/public/race/draw.js