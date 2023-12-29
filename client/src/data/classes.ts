
export const losBullet: any = {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    leftTopCorner: { x: 0, y: 0 },
    rightTopCorner: { x: 0, y: 0 },
    leftBottomCorner: { x: 0, y: 0 },
    rightBottomCorner: { x: 0, y: 0 },
    // makes locations of corners
    setCorners: function (angle: number) {
        //console.log('calling set corners for los bullet');
        const scale = 15;
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

        this.leftTopCorner = getRotatedTopLeftCornerOfRect(this.x - this.width / (2 * scale), this.y - this.height / (2 * scale), this.width / scale, this.height / scale, angle);

        var vecLength = getVectorLength(this.x - this.width / (2 * scale), this.y - this.height / (2 * scale), this.width / scale, this.height / scale);
        //console.log('vecLength: ',vecLength);

        angle = angle + getAngleForNextCorner(this.width / (2 * scale), vecLength);
        //console.log('angle: ',angle);
        this.rightTopCorner = getRotatedTopLeftCornerOfRect(this.x - this.width / (2 * scale), this.y - this.height / (2 * scale), this.width / scale, this.height / scale, angle);

        angle = angle + getAngleForNextCorner(this.height / (2 * scale), vecLength);
        //console.log('angle: ',angle);
        this.rightBottomCorner = getRotatedTopLeftCornerOfRect(this.x - this.width / (2 * scale), this.y - this.height / (2 * scale), this.width / scale, this.height / scale, angle);

        angle = angle + getAngleForNextCorner(this.width / (2 * scale), vecLength);
        //console.log('angle: ',angle);
        this.leftBottomCorner = getRotatedTopLeftCornerOfRect(this.x - this.width / (2 * scale), this.y - this.height / (2 * scale), this.width / scale, this.height / scale, angle);
    },

    // shows locations of corners
    getCorners: function () {
        return [this.leftTopCorner,
        this.rightTopCorner,
        this.rightBottomCorner,
        this.leftBottomCorner];
    },
    speed: 2,
    a: 0,
    targetAngle: 0,
    target: {x: 0, y: 0},
    moveToTarget: function () {
        // Function to normalize an angle to be between 0 and 360 degrees
        const normalizeAngle = (angle: number): number => {
            // Calculate the modulo to wrap the angle within the range [0, 360)
            return (angle % 360 + 360) % 360;
        }

        const updatedBullet = { ...this };
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate the angle based on the target position and add 90 degrees
        updatedBullet.targetAngle = ((Math.atan2(dy, dx) * 180) / Math.PI) + 90;

        // normalize the angle to not mess turning
        if (updatedBullet.targetAngle < 0 || updatedBullet.targetAngle > 360) {
            updatedBullet.targetAngle = normalizeAngle(updatedBullet.a);
        }

        const angleTolerance = 1; // Adjust this value based on your tolerance requirements
        // could be less too, for example 0,5
        if (Math.abs(updatedBullet.targetAngle - updatedBullet.a) < angleTolerance) {
            // facing target
             
            updatedBullet.x += (dx / distance) * 1;
            updatedBullet.y += (dy / distance) * 1;
        } else if (updatedBullet.targetAngle < updatedBullet.a) {
            // need to turn left
            updatedBullet.a--;
            //updatedBullet.x += (dx / distance) * (1 / 3);
            //updatedBullet.y += (dy / distance) * (1 / 3);
        } else if (updatedBullet.targetAngle > updatedBullet.a) {
            // need to turn right
            updatedBullet.a++;
            //updatedBullet.x += (dx / distance) * (1 / 3);
            //updatedBullet.y += (dy / distance) * (1 / 3);
        }

        if (distance < this.speed) {
            // Arrived at the target
            return `bullet at target: ${this.x} ${this.y} ${this.a}`;
        }

        // normalize the angle to not mess turning
        if (updatedBullet.a < 0 || updatedBullet.a > 360) {
            updatedBullet.a = normalizeAngle(updatedBullet.a);
        }

        this.x = updatedBullet.x;
        this.y = updatedBullet.y;
        this.a = updatedBullet.a;

        return { updatedBullet: this };
    
    }
}