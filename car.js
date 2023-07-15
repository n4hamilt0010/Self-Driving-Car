class Car{
    constructor(x, y, width, height, carType, maxSpeed=3){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.damaged = false;

        this.controls = new Controls(carType);
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.maxReverseSpeed = (this.maxSpeed / 2) * -1;
        this.friction = 0.05;
        this.angle = 0;

        this.carType = carType;
        this.useBrain = carType == 'AI';
        if(this.carType != 'DUMMY'){
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 4]
            );
        }
        this.inLane = true;
    }

    update(roadBorders, traffic, lanes){
        if(!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
            this.inLane = this.#isInLane(lanes);
        }
        if(this.carType != 'DUMMY'){
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(reading => reading==null? 0: 1-reading.offset);
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);
            if(this.useBrain){
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    #isInLane(lanes){
        for(const lane of lanes){
            const touch = polyIntersect(lane, this.polygon);
            if(touch){
                return false;
            }
        }

        return true;
    }

    #move(){
        if(this.controls.forward){
            this.speed += this.acceleration;
        } 
        if(this.controls.reverse){
            this.speed -= this.acceleration;
        }

        if(this.speed > this.maxSpeed){
            this.speed = this.maxSpeed;
        } 
        if(this.speed < this.maxReverseSpeed){
            this.speed = this.maxReverseSpeed;
        }

        if(this.speed > 0){
            this.speed -= this.friction;
        } else if(this.speed < 0){
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction){
            this.speed = 0;
        }

        if(this.speed != 0){
            const flip = this.speed > 0? 1: -1;
            if(this.controls.right){
                this.angle += 0.03 * flip;
            }
            if(this.controls.left){
                this.angle -= 0.03 * flip;
            }
        }

        this.x += Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    #createPolygon(){
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.height, this.width);
        points.push({
            x: this.x + (Math.cos(this.angle-alpha) * rad), 
            y: this.y + (Math.sin(this.angle-alpha) * rad)
        });
        points.push({
            x: this.x + (Math.cos(this.angle+alpha) * rad), 
            y: this.y + (Math.sin(this.angle+alpha) * rad)
        });
        points.push({
            x: this.x + (Math.cos(Math.PI + this.angle-alpha) * rad), 
            y: this.y + (Math.sin(Math.PI + this.angle-alpha) * rad)
        });
        points.push({
            x: this.x + (Math.cos(Math.PI + this.angle+alpha) * rad), 
            y: this.y + (Math.sin(Math.PI + this.angle+alpha) * rad)
        });

        return points;
    }

    #assessDamage(roadBorders, traffic){
        for(let i = 0; i < roadBorders.length; ++i){
            if(polyIntersect(this.polygon, roadBorders[i])){
                return true;
            }
        }
        for(let i = 0; i < traffic.length; ++i){
            if(polyIntersect(this.polygon, traffic[i].polygon)){
                return true;
            }
        }

        return false;
    }

    draw(ctx, colour, drawSensors){
        if(this.damaged){
            ctx.fillStyle = "grey";
        } else{
            ctx.fillStyle = colour;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i = 1; i < this.polygon.length; ++i){
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        if(this.carType != 'DUMMY' && drawSensors){
            this.sensor.draw(ctx);
        }
    }
}