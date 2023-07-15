

class Road{
    constructor(x, width, laneCount=3){
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;
        this.laneWidth = this.width / this.laneCount;

        const infinity = 1000000;
        this.top = -infinity;
        this.bottom = infinity;
        this.left = x - (this.width / 2);
        this.right = x + (this.width / 2);
        const topRight = {x: this.right, y: this.top};
        const bottomRight = {x: this.right, y: this.bottom};
        const topLeft = {x: this.left, y: this.top};
        const bottomLeft = {x: this.left, y: this.bottom};
        this.borders = [
            [topLeft, bottomLeft], 
            [topRight, bottomRight]
        ];
        this.lanes = [];
        for(let i = 1; i < this.laneCount; ++i){
            const x = this.left + this.laneWidth * i;
            const topPoint = {
                x: x, 
                y: this.top
            };
            const bottomPoint = {
                x: x, 
                y: this.bottom
            };
            this.lanes.push([topPoint, bottomPoint]);
        }
    }

    getLaneCenter(laneIdx){
        const laneWidth = this.width / this.laneCount;
        return this.left + (laneWidth / 2) + (laneIdx * laneWidth);
    }

    draw(ctx){
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        // for(let i = 1; i < this.laneCount; ++i){
        //     const x = lerp(
        //         this.left, this.right, i / this.laneCount
        //     );
        //     if(i > 0 && i < this.laneCount){
        //         ctx.setLineDash([20, 20]);
        //     } else{
        //         ctx.setLineDash([]);
        //     }
        //     ctx.beginPath();
        //     ctx.moveTo(x, this.top);
        //     ctx.lineTo(x, this.bottom);
        //     ctx.stroke();
        // }
        ctx.setLineDash([20, 20]);
        for(let i = 0; i < this.lanes.length; ++i){
            ctx.beginPath();
            ctx.moveTo(this.lanes[i][0].x, this.lanes[i][0].y);
            ctx.lineTo(this.lanes[i][1].x, this.lanes[i][1].y);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        this.borders.forEach((border) => {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        });
    }
}