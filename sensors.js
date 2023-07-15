class Sensor{
    constructor(car){
        this.car = car;
        this.rayCount = 5;
        this.rayLength = 150;
        this.raySpread = Math.PI / 2;

        this.rays = [];
        this.readings = [];
    }

    update(roadBorders, traffic){
        this.#castRays();
        this.readings = [];
        for(let i = 0; i < this.rays.length; ++i){
            const reading = this.#getReading(this.rays[i], roadBorders, traffic);
            this.readings.push(reading);
        }
    }

    #castRays(){
        this.rays = [];
        for(let i = 0 ; i < this.rayCount; ++i){
            const angle = lerp(
                this.raySpread / 2, 
                - this.raySpread / 2, 
                this.rayCount == 1? 0.5: i / (this.rayCount - 1)
            ) + this.car.angle;
            const startPoint = {
                x: this.car.x, 
                y: this.car.y
            };
            const endPoint = {
                x: this.car.x + Math.sin(angle) * this.rayLength, 
                y: this.car.y + Math.cos(angle) * -this.rayLength
            };
            
            this.rays.push([startPoint, endPoint]);
        }
    }

    #getReading(ray, roadBorders, traffic){
        let touches = [];
        for(let j = 0; j < roadBorders.length; ++j){
            const touch = getIntersection(
                ray[0], 
                ray[1], 
                roadBorders[j][0], 
                roadBorders[j][1]
            );

            if(touch){
                touches.push(touch);
            }
        }
        for(let i = 0; i < traffic.length; ++i){
            const polygon = traffic[i].polygon;
            for(let j = 0; j < polygon.length; ++j){
                const touch = getIntersection(
                    ray[0],
                    ray[1], 
                    polygon[j], 
                    polygon[(j + 1) % polygon.length]
                );

                if(touch){
                    touches.push(touch);
                }
            }
        }

        if(touches.length == 0){
            return null;
        }
        const offsets = touches.map(touch => touch.offset);
        const minOffset = Math.min(...offsets);
        const reading = touches.find(touch => touch.offset == minOffset);
        return reading;
    }

    draw(ctx){
        for(let i = 0; i < this.rays.length; ++i){
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.beginPath();
            ctx.moveTo(
                this.rays[i][0].x, 
                this.rays[i][0].y
            );
            const end = this.readings[i]? this.readings[i]: this.rays[i][1];
            ctx.lineTo(
                end.x, 
                end.y
            );
            ctx.stroke();

            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(
                end.x, 
                end.y
            );
            ctx.lineTo(
                this.rays[i][1].x, 
                this.rays[i][1].y
            );
            ctx.stroke();
        }
    }
}