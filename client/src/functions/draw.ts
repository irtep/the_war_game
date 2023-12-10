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
   // const canvas = document.getElementById("mapCanvas") as HTMLCanvasElement;
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
    }
}