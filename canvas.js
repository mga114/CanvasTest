const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

//Resizing
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

window.addEventListener('resize', () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    player.draw();
});

class Player {
    constructor (x, y, radius, colour) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
    }

    draw () {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.colour;
        context.fill();
    }
}

const player = new Player(100, 100, 30, 'blue');
player.draw();