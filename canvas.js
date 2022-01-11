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

class Enemy { 
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

class Particle { 
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

const player = new Player(canvas.width / 2, canvas.height / 2, 30, 'white');

const projectiles = [];
const enemies = [];
const particles = [];

function spawnEnemies () {
    setInterval(() => {
        const radius = Math.random() * 30 + 6;
        let x;
        let y;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? -radius : canvas.width + radius;
        }
        
        const colour = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = {x: Math.cos(angle), y: Math.sin(angle)};
        enemies.push (new Enemy (x, y, radius, colour, velocity));
    }, 1000);
}

function projectileOutOfBounds (projectile) {
    return projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y + projectile.radius > canvas.height;
}

let animationID;

function animate() {
    animationID = requestAnimationFrame(animate);
    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (projectileOutOfBounds(projectile)) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationID);
        }

        projectiles.forEach((projectile, projIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - projectile.radius - enemy.radius < 1) {
                for (let i = 0; i < 8; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, 3, enemy.colour, {x: Math.random() - 0.5, y: Math.random() - 0.5}));
                }
                if(enemy.radius - 10 > 5) {
                    gsap.to(enemy, {radius: enemy.radius - 10});
                    setTimeout(() => {
                        projectiles.splice(projIndex, 1);
                    }, 0);
                } else {
                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1);
                        projectiles.splice(projIndex, 1);
                    }, 0);
                }
            }
        });
    })
    player.draw();
}

window.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = {x: Math.cos(angle) * 6, y: Math.sin(angle) * 6};
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity));
});

animate();
spawnEnemies();