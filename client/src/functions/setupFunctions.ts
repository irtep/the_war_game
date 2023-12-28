
export const createBattleMap = (input: any): any => {

    let parsedMap: any = {
        name: '',
        type: '',
        houses: [],
        trees: [],
        waters: []
    };

    for (let [key, value] of Object.entries(input)) {

        if (key === 'houses' || key === 'waters' || key === 'trees') {

            parsedMap[key] = JSON.parse(value as string);

        } else {
            parsedMap[key] = value;
        }
    }

    // give some methods to houses, trees and waters for collision detect purposes
    parsedMap.houses.forEach((house: any) => {
        house.setCorners = function (angle: number) {
            const getRotatedTopLeftCornerOfRect = (x: number, y: number, width: number, height: number, angle: number) => {
                //console.log('gRtLCOR ', x, y, width, height, angle);

                const sin = (x: number) => {
                    return Math.sin(x / 180 * Math.PI);
                }

                const cos = (x: number) => {
                    return Math.cos(x / 180 * Math.PI);
                }

                var center = {
                    x: (x + width / 2),
                    y: (y + height / 2)
                };

                var vector = {
                    x: (x - center.x),
                    y: (y - center.y)
                };

                //console.log('vector: ',vector);
                var rotationMatrix = [[cos(angle), -sin(angle)], [sin(angle), cos(angle)]];

                var rotatedVector = {
                    x: vector.x * rotationMatrix[0][0] + vector.y * rotationMatrix[0][1],
                    y: vector.x * rotationMatrix[1][0] + vector.y * rotationMatrix[1][1]
                };

                return {
                    x: (center.x + rotatedVector.x),
                    y: (center.y + rotatedVector.y)
                };
            }

            const getAngleForNextCorner = (anc: any, vectorLength: any) => {
                var alpha = Math.acos(anc / vectorLength) * (180 / Math.PI);
                return 180 - alpha * 2;
            }

            const getVectorLength = (x: number, y: number, width: number, height: number) => {
                var center = {
                    x: x + width / 2,
                    y: y + height / 2
                };

                //console.log('center: ',center);
                var vector = {
                    x: (x - center.x),
                    y: (y - center.y)
                };
                return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            }

            this.leftTopCorner = getRotatedTopLeftCornerOfRect(house.x, house.y, house.w, house.h, angle);

            var vecLength = getVectorLength(house.x, house.y, house.w, house.h);
            //console.log('vecLength: ',vecLength);

            angle = angle + getAngleForNextCorner(this.w / 2, vecLength);
            //console.log('angle: ',angle);
            this.rightTopCorner = getRotatedTopLeftCornerOfRect(house.x, house.y, house.w, house.h, angle);

            angle = angle + getAngleForNextCorner(this.h / 2, vecLength);
            //console.log('angle: ',angle);
            this.rightBottomCorner = getRotatedTopLeftCornerOfRect(house.x, house.y, house.w, house.h, angle);

            angle = angle + getAngleForNextCorner(this.w / 2, vecLength);
            //console.log('angle: ',angle);
            this.leftBottomCorner = getRotatedTopLeftCornerOfRect(house.x, house.y, house.w, house.h, angle);
        };
        house.getCorners = function () {
            return [this.leftTopCorner,
            this.rightTopCorner,
            this.rightBottomCorner,
            this.leftBottomCorner];
        };
    });

    parsedMap.trees.forEach((tree: any) => {
        tree.setCorners = function () {
            let angle: number = 0;
            tree.w = tree.s*2;
            tree.h = tree.s*2;
            const getRotatedTopLeftCornerOfRect = (x: number, y: number, width: number, height: number, angle: number) => {
                //console.log('gRtLCOR ', x, y, width, height, angle);

                const sin = (x: number) => {
                    return Math.sin(x / 180 * Math.PI);
                }

                const cos = (x: number) => {
                    return Math.cos(x / 180 * Math.PI);
                }

                var center = {
                    x: (x + width / 2),
                    y: (y + height / 2)
                };

                var vector = {
                    x: (x - center.x),
                    y: (y - center.y)
                };

                //console.log('vector: ',vector);
                var rotationMatrix = [[cos(angle), -sin(angle)], [sin(angle), cos(angle)]];

                var rotatedVector = {
                    x: vector.x * rotationMatrix[0][0] + vector.y * rotationMatrix[0][1],
                    y: vector.x * rotationMatrix[1][0] + vector.y * rotationMatrix[1][1]
                };

                return {
                    x: (center.x + rotatedVector.x),
                    y: (center.y + rotatedVector.y)
                };
            }

            const getAngleForNextCorner = (anc: any, vectorLength: any) => {
                var alpha = Math.acos(anc / vectorLength) * (180 / Math.PI);
                return 180 - alpha * 2;
            }

            const getVectorLength = (x: number, y: number, width: number, height: number) => {
                var center = {
                    x: x + width / 2,
                    y: y + height / 2
                };

                //console.log('center: ',center);
                var vector = {
                    x: (x - center.x),
                    y: (y - center.y)
                };
                return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            }

            this.leftTopCorner = getRotatedTopLeftCornerOfRect(tree.x-tree.w/2, tree.y-tree.h/2, tree.w, tree.h, angle);

            var vecLength = getVectorLength(tree.x-tree.w/2, tree.y-tree.h/2, tree.w, tree.h);
            //console.log('vecLength: ',vecLength);

            angle = angle + getAngleForNextCorner(this.w / 2, vecLength);
            //console.log('angle: ',angle);
            this.rightTopCorner = getRotatedTopLeftCornerOfRect(tree.x-tree.w/2, tree.y-tree.h/2, tree.w, tree.h, angle);

            angle = angle + getAngleForNextCorner(this.h / 2, vecLength);
            //console.log('angle: ',angle);
            this.rightBottomCorner = getRotatedTopLeftCornerOfRect(tree.x-tree.w/2, tree.y-tree.h/2, tree.w, tree.h, angle);

            angle = angle + getAngleForNextCorner(this.w / 2, vecLength);
            //console.log('angle: ',angle);
            this.leftBottomCorner = getRotatedTopLeftCornerOfRect(tree.x-tree.w/2, tree.y-tree.h/2, tree.w, tree.h, angle);
        };
        tree.getCorners = function () {
            return [this.leftTopCorner,
            this.rightTopCorner,
            this.rightBottomCorner,
            this.leftBottomCorner];
        };
    });

    parsedMap.waters.forEach((water: any) => {
        water.setCorners = function () {
            let angle: number = 0;
            water.w = water.s*1.5;
            water.h = water.s*1.5;
            const getRotatedTopLeftCornerOfRect = (x: number, y: number, width: number, height: number, angle: number) => {
                //console.log('gRtLCOR ', x, y, width, height, angle);

                const sin = (x: number) => {
                    return Math.sin(x / 180 * Math.PI);
                }

                const cos = (x: number) => {
                    return Math.cos(x / 180 * Math.PI);
                }

                var center = {
                    x: (x + width / 2),
                    y: (y + height / 2)
                };

                var vector = {
                    x: (x - center.x),
                    y: (y - center.y)
                };

                //console.log('vector: ',vector);
                var rotationMatrix = [[cos(angle), -sin(angle)], [sin(angle), cos(angle)]];

                var rotatedVector = {
                    x: vector.x * rotationMatrix[0][0] + vector.y * rotationMatrix[0][1],
                    y: vector.x * rotationMatrix[1][0] + vector.y * rotationMatrix[1][1]
                };

                return {
                    x: (center.x + rotatedVector.x),
                    y: (center.y + rotatedVector.y)
                };
            }

            const getAngleForNextCorner = (anc: any, vectorLength: any) => {
                var alpha = Math.acos(anc / vectorLength) * (180 / Math.PI);
                return 180 - alpha * 2;
            }

            const getVectorLength = (x: number, y: number, width: number, height: number) => {
                var center = {
                    x: x + width / 2,
                    y: y + height / 2
                };

                //console.log('center: ',center);
                var vector = {
                    x: (x - center.x),
                    y: (y - center.y)
                };
                return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            }

            this.leftTopCorner = getRotatedTopLeftCornerOfRect(water.x-water.w/2, water.y-water.h/2, water.w, water.h, angle);

            var vecLength = getVectorLength(water.x-water.w/2, water.y-water.h/2, water.w, water.h);
            //console.log('vecLength: ',vecLength);

            angle = angle + getAngleForNextCorner(this.w / 2, vecLength);
            //console.log('angle: ',angle);
            this.rightTopCorner = getRotatedTopLeftCornerOfRect(water.x-water.w/2, water.y-water.h/2, water.w, water.h, angle);

            angle = angle + getAngleForNextCorner(this.h / 2, vecLength);
            //console.log('angle: ',angle);
            this.rightBottomCorner = getRotatedTopLeftCornerOfRect(water.x-water.w/2, water.y-water.h/2, water.w, water.h, angle);

            angle = angle + getAngleForNextCorner(this.w / 2, vecLength);
            //console.log('angle: ',angle);
            this.leftBottomCorner = getRotatedTopLeftCornerOfRect(water.x-water.w/2, water.y-water.h/2, water.w, water.h, angle);
        };
        water.getCorners = function () {
            return [this.leftTopCorner,
            this.rightTopCorner,
            this.rightBottomCorner,
            this.leftBottomCorner];
        };
    });

    return parsedMap;
}

export function prepareWeapons(inputString: string, weapons: Array<any>) {
    // Use the split method to separate the string into an array
    let resultArray = inputString.split(', ');
    const preparedWeapons: any[] = [];

    // Trim any leading or trailing spaces from each element in the array
    resultArray = resultArray.map(function (item) {
        return item.trim();
    });

    resultArray.forEach((w: string) => {
        console.log('w: ', w);
        const found = weapons.filter((we: any) => we.name === w);
        found[0].reload = found[0].firerate;
        found[0].combatRange = found[0].range * 15;
        preparedWeapons.push(found[0]);
    });

    return preparedWeapons;
}
