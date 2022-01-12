const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");
const scoreElement = document.querySelector("#scoreElement");
const startButton = document.querySelector("#startButton");
const menuUI = document.querySelector("#menuUI");
const menuScoreElement = document.querySelector("#menuScoreElement");

//Resizing
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

window.addEventListener('resize', () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
});


class Entity {
    constructor (x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
    }

    draw() {
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

class Player extends Entity{
    constructor (x, y, radius, colour, velocity) {
        super(x, y, radius, colour, velocity);
    }
}

class Projectile extends Entity{
    constructor (x, y, radius, colour, velocity) {
        super(x, y, radius, colour, velocity);

    }
}

class Enemy extends Entity{ 
    constructor (x, y, radius, colour, velocity) {
        super(x, y, radius, colour, velocity);

    }
}

const friction = 0.99;
class Particle extends Entity{ 
    constructor (x, y, radius, colour, velocity) {
        super(x, y, radius, colour, velocity);
        this.alpha = 1;

    }

    draw () {
        context.save();
        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.colour;
        context.fill();
        context.restore();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.alpha -= 0.01;
    }
}

let player;
let score;
let projectiles;
let enemies;
let particles;

function init() {
    player = new Player(canvas.width / 2, canvas.height / 2, 30, 'white', {x: 0, y: 0});
    score = 0;
    projectiles = [];
    enemies = [];
    particles = [];
    scoreElement.innerHTML = 0;
}

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
    }, (Math.random() + 0.8) * 1000);
}

function projectileOutOfBounds (projectile) {
    return projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y + projectile.radius > canvas.height;
}

let animationID;

function animate() {
    animationID = requestAnimationFrame(animate);
    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    updateParticles();
    updateProjectiles();
    updateEnemies();
    player.draw();
}

function updateParticles () {
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });
}

function updateProjectiles () {
    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (projectileOutOfBounds(projectile)) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });
}

function updateEnemies () {
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationID);
            menuUI.style.display = 'flex';
            menuScoreElement.innerHTML = score;
        }

        projectiles.forEach((projectile, projIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - projectile.radius - enemy.radius < 1) {

                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.colour, {x: (Math.random() - 0.5) * (Math.random() * 5), y: (Math.random() - 0.5) * (Math.random() * 5)}));
                }

                if(enemy.radius - 10 > 5) {
                    gsap.to(enemy, {radius: enemy.radius - 10});
                    setTimeout(() => {
                        projectiles.splice(projIndex, 1);
                    }, 0);
                    score += 100;
                } else {
                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1);
                        projectiles.splice(projIndex, 1);
                    }, 0);
                    score += 250;
                }

                scoreElement.innerHTML = score;
            }
        });
    });
}

window.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = {x: Math.cos(angle) * 6, y: Math.sin(angle) * 6};
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity));
});

startButton.addEventListener('click', () => {
    init(); 
    animate();
    spawnEnemies();
    menuUI.style.display = 'none';
});