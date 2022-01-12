//HTML elements to JS
const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");
const scoreElement = document.querySelector("#scoreElement");
const startButton = document.querySelector("#startButton");
const menuUI = document.querySelector("#menuUI");
const menuScoreElement = document.querySelector("#menuScoreElement");

//Resizing canvas to fit window size
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

//Ensures scales and positionining stays consistent when window is resized
window.addEventListener('resize', () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    //centers player
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
});


//Base class entity for all rendered objects in the canvas
class Entity {
    constructor (x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
    }

    draw() {
        //Draws each entity as a circle
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.colour;
        context.fill();
    }

    update() {
        //draws and moves the entity
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

const friction = 0.99; //amount the particles slows down by, 0-1, closer to 0 means higher friction
class Particle extends Entity{ 
    constructor (x, y, radius, colour, velocity) {
        super(x, y, radius, colour, velocity);
        this.alpha = 1;

    }

    draw () {
        //renders particles at different alpha values to fade out
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

//initialising variables
let player;
let score;
let projectiles;
let enemies;
let particles;

//called at the start of each game, resets/initialises game variables
function init() {
    player = new Player(canvas.width / 2, canvas.height / 2, 30, 'white', {x: 0, y: 0});
    score = 0;
    projectiles = [];
    enemies = [];
    particles = [];
    scoreElement.innerHTML = 0;
}

//spawns enemies using setInterval function where the timing is controlled by second argument of setInterval()
function spawnEnemies () {
    setInterval(() => {
        const radius = Math.random() * 30 + 6; //radius of each enemy
        let x;
        let y;

        //sets spawn location of the enemy
        if (Math.random() < 0.5) {
            //set position to somewhere on the left or right of the screen
            x = Math.random() < 0.5 ? -radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            //set position to somewhere on the top or bottom of the screen
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? -radius : canvas.width + radius;
        }
        
        const colour = `hsl(${Math.random() * 360}, 50%, 50%)`; //random colour value
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x); //computes angle to player
        const velocity = {x: Math.cos(angle), y: Math.sin(angle)}; //velocity needed to get to the player
        enemies.push (new Enemy (x, y, radius, colour, velocity));
    }, (Math.random() + 0.8) * 1000); //change this value to change spawn rate
}

//tests if a projectile is out of the range of the screen
function projectileOutOfBounds (projectile) {
    return projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y + projectile.radius > canvas.height;
}

let animationID; //current animation frame ID

//main game loop
function animate() {
    animationID = requestAnimationFrame(animate); //key function responsible for game loop
    //resets screen after each frame
    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    //updates game components
    updateParticles();
    updateProjectiles();
    updateEnemies();
    player.draw();
}

function updateParticles () {
    particles.forEach((particle, index) => {
        //if particle is invisble then delete
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
                //delete projectile
                projectiles.splice(index, 1);
            }, 0);
        }
    });
}


function updateEnemies () {
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        
        //distance between enemy and player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            //game over, enemy touching player
            cancelAnimationFrame(animationID);
            menuUI.style.display = 'flex'; //shows menuUI
            menuScoreElement.innerHTML = score;
        }

        projectiles.forEach((projectile, projIndex) => {
            //test if any projectile is touching the enemy
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - projectile.radius - enemy.radius < 1) { 
                //projectile touched enemy

                //create particle explosion
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.colour, {x: (Math.random() - 0.5) * (Math.random() * 5), y: (Math.random() - 0.5) * (Math.random() * 5)}));
                }

                //if enemy is too large
                if(enemy.radius - 10 > 5) {
                    //shrink enemy
                    gsap.to(enemy, {radius: enemy.radius - 10}); //using GSAP to lerp size of enemy
                    setTimeout(() => {
                        //remove projectile
                        projectiles.splice(projIndex, 1);
                    }, 0);
                    score += 100;
                } else {
                    //remove both projectile and enemy
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

//shoot projectile
window.addEventListener('click', (event) => {
    //angle and velocity relative to mouse click from player position
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = {x: Math.cos(angle) * 6, y: Math.sin(angle) * 6};
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity));
});

//starts/restarts game
startButton.addEventListener('click', () => {
    init(); 
    animate();
    spawnEnemies();
    menuUI.style.display = 'none';
});