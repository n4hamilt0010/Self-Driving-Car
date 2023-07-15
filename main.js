const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const N = 1;
const cars = generateCars(N);
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(0), -800, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(2), -800, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(0), -900, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(2), -900, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(1), -1000, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(2), -1000, 30, 50, "DUMMY", 2), 
    new Car(road.getLaneCenter(2), -1200, 30, 50, "DUMMY", 2)
];
let bestCar = cars[0];
if(localStorage.getItem('bestBrain')){
    for(let i = 0; i < cars.length; ++i){
        cars[i].brain = JSON.parse(
            localStorage.getItem('bestBrain')
        );
        if(i != 0){
            NeuralNetwork.mutate(cars[i].brain, 0.03);
        }
    }
}

function save(){
    localStorage.setItem(
        'bestBrain', JSON.stringify(bestCar.brain)
    );
}

function discard(){
    localStorage.removeItem('bestBrain');
}

function generateCars(N){
    let cars = [];
    for(let i = 0; i < N; ++i){
        cars.push(
            new Car(road.getLaneCenter(1), 100, 30, 50, "AI")
        );
    }

    return cars
}

function animate(){
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;
    for(let i = 0; i < traffic.length; ++i){
        traffic[i].update(road.borders, [], road.lanes);
    }
    let fittestScore = Number.MAX_SAFE_INTEGER;
    for(const car of cars){
        car.update(road.borders, traffic, road.lanes);
        const score = car.inLane? car.y - 100: car.y;
        if(score < fittestScore){
            fittestScore = score;
            bestCar = car;
        }
    }
    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);
    road.draw(carCtx);
    for(let i = 0; i < traffic.length; ++i){
        traffic[i].draw(carCtx, "red");
    }
    carCtx.globalAlpha = 0.2;
    for(const car of cars){
        car.draw(carCtx, "blue", false);
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true);
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}

animate();
