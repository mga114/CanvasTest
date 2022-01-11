const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

//Resizing
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

window.addEventListener('resize', () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
});

//TODO: extrapolate circle renderer into a parent class
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

class Projectile {
    constructor (x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;

    }

    draw () {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.colour;
        context.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const player = new Player(canvas.width / 2, canvas.height / 2, 30, 'blue');

const projectiles = [];

function animate() {
    requestAnimationFrame(animate);
    context.clearRect(0, 0, canvas.width, canvas.height);
    projectiles.forEach(projectile => {
        projectile.update();
    });
    player.draw();
}

window.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = {x: Math.cos(angle), y: Math.sin(angle)};
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', velocity));
});

animate();