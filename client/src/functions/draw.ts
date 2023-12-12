import { GameObject } from "../data/sharedInterfaces";

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

export const draw = (canvas: HTMLCanvasElement, canvasSize: Canvas, gameObject: GameObject): void => {
    const scale = 20;
    const ctx = canvas.getContext("2d");

    if (ctx) {
        ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
        //console.log('draw: ', gameObject);

        // Draw terrain:
        gameObject.terrain.houses.forEach((house: House) => {
            ctx.beginPath();
            ctx.fillStyle = "rgb(180,180,180)";
            ctx.rect(house.x, house.y, house.w, house.h);
            ctx.fill();
        });

        gameObject.terrain.trees.forEach((tree: Circles) => {
            ctx.beginPath();
            ctx.fillStyle = "darkgreen";
            ctx.arc(tree.x, tree.y, tree.s, 0, Math.PI * 2, true);
            ctx.fill();
        });

        gameObject.terrain.waters.forEach((water: Circles) => {
            ctx.beginPath();
            ctx.fillStyle = "darkblue";
            ctx.arc(water.x, water.y, water.s, 0, Math.PI * 2, true);
            ctx.fill();
        });
        //console.log('game at drw', gameObject);
        // draw attackers units: 
        gameObject.attacker.units.forEach( (unit: any) => {
            unit.teams.forEach( (team: any) => {
                ctx.beginPath();
                ctx.fillStyle = "grey";
                ctx.rect(team.x, team.y, team.width/scale, team.height/scale);
                ctx.fill();
                ctx.font='10px Arial';
                ctx.fillStyle = 'white';
                ctx.fillText('unit '+ unit.name, team.x - 20, team.y - 15);
                ctx.fillStyle='white';
                ctx.fillText(team.name + ' ' + team.tacticalNumber, team.x - 20, team.y - 5);
                ctx.closePath();
                
                ctx.save(); // save coords system
                //ctx.translate(partsToPaint.hull.x, partsToPaint.hull.y);} // go here
                ctx.translate(unit.x, unit.y); // go here
                ctx.rotate(unit.a * Math.PI / 180);
                
               //console.log('drawing: ', team.x, team.y, team.width, team.height);
            });
        });

        gameObject.defender.units.forEach( (unit: any) => {
            unit.teams.forEach( (team: any) => {
                ctx.beginPath();
                ctx.fillStyle = "darkgreen";
                ctx.rect(team.x, team.y, team.width/scale, team.height/scale);
                ctx.fill();
                ctx.font='10px Arial';
                ctx.fillStyle = 'white';
                ctx.fillText('unit '+ unit.name, team.x - 20, team.y - 15);
                ctx.fillStyle='white';
                ctx.fillText(team.name + ' ' + team.tacticalNumber, team.x - 20, team.y - 5);
                ctx.closePath();
                /*
                ctx.save(); // save coords system
                if (unit.leftTopCorner !== undefined) {
                  ctx.translate(unit.leftTopCorner.x, unit.leftTopCorner.y);}
                else {
                  //ctx.translate(partsToPaint.hull.x, partsToPaint.hull.y);} // go here
                  ctx.translate(unit.x, unit.y);} // go here
                ctx.rotate(degrees * Math.PI / 180);
                */
               //console.log('drawing: ', team.x, team.y, team.w, team.h);
            });
        });
    }
}