const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = 1024;
canvas.height = 576;

let speed = 6;
let score = 0;

const keys = {
    left: {
        pressed: false
    },
    right: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

function createImage(src) {
    const image = new Image();
    image.src = `./images/${src}`;
    return image;
}

class Player {
    constructor() {
        this.velocity = {
            x: 0, y: 0
        }
        this.image = createImage("spaceship.png");
        this.scale = 0.15
        this.width = this.image.width * this.scale;
        this.height = this.image.height * this.scale;
        this.rotation = 0;
        this.position = {
            x: (canvas.width / 2) - this.width / 2,
            y: canvas.height - this.height * 2
        }
        this.opacity = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.translate(player.position.x + player.width / 2, player.position.y + player.height / 2);
        c.rotate(this.rotation);
        c.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2);
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
    }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.radius = 4;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'red';
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.width = 3;
        this.height = 10;
    }

    draw() {
        c.fillStyle = 'white';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader {
    constructor({ position }) {
        this.velocity = {
            x: 0, y: 0
        }
        this.image = createImage("invader.png");
        this.scale = 1
        this.width = this.image.width * this.scale;
        this.height = this.image.height * this.scale;
        this.position = position;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update({ velocity }) {
        this.draw();
        this.position.x += velocity.x;
        this.position.y += velocity.y;
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0, y: 5
            }
        }));
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0, y: 0
        }
        this.velocity = {
            x: 3, y: 0
        }

        this.invaders = []
        const rows = Math.floor(Math.random() * 5 + 2);
        const columns = Math.floor(Math.random() * 10 + 5);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                this.invaders.push(new Invader({
                    position: {
                        x: j * 30, y: i * 30
                    }
                }));
            }
        }
        this.width = columns * 30;
    }
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y = 0;

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        }
    };
}

class Particle {
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position
        this.velocity = velocity
        this.radius = radius;
        this.color = color
        this.opacity = 1;
        this.fades = fades
    }

    draw() {
        c.save();
        c.globeAlpha = this.opacity;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.fades) {
            this.opacity -= 0.01;
        }
    }
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];
let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let game = {
    over: false,
    active: true
}

for (let i = 0; i < 100; i++) {
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        },
        velocity: {
            x: 0,
            y: .3
        },
        radius: Math.random() * 2,
        color: 'white',
        fades: false
    }))
}

function createParticles({ object, color, fades }) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 2,
            color,
            fades
        }))
    }
}

function animate() {
    if (!game.active) return;
    requestAnimationFrame(animate);
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();

    particles.forEach((particle, i) => {
        if (particle.position.y > canvas.height) {
            particle.position.x = Math.random() * canvas.width;
            particle.position.y = -particle.radius;
        }
        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1);
            }, 0);
        }
        else {
            particle.update();
        }
    })

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
            }, 0);
        }
        else {
            invaderProjectile.update();
        }

        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
                player.opacity = 0;
                game.over = true;
            }, 0);
            setTimeout(() => {
                game.active = false;
            }, 1500);
            createParticles({
                object: player, color: "white", fades: true
            })
        }
    })

    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
        else {
            projectile.update();
        }
    })

    grids.forEach((grid, gridIndex) => {
        grid.update();

        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
        }

        grid.invaders.forEach((invader, i) => {
            invader.update({ velocity: grid.velocity });

            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y) {
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(
                            (invader2) => invader2 === invader
                        )
                        const projectileFound = projectiles.find(
                            (projectile2) => projectile2 === projectile
                        )
                        if (invaderFound && projectileFound) {
                            score += 100;
                            scoreElement.innerHTML = score;
                            createParticles({
                                object: invader, color: "#baa8de", fades: true
                            });

                            grid.invaders.splice(i, 1);
                            projectiles.splice(j, 1);

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0];
                                const lastInvader = grid.invaders[grid.invaders.length - 1];

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                grid.position.x = firstInvader.position.x;
                            } else {
                                grids.splice(gridIndex, 1);
                            }
                        }
                    }, 0);
                }
            })
        })
    })

    if (keys.left.pressed && player.position.x > 0) {
        player.velocity.x = -speed;
        player.rotation = -0.15;
    }
    else if (keys.right.pressed && player.position.x + player.width < canvas.width) {
        player.velocity.x = speed;
        player.rotation = 0.15;
    }
    else {
        player.velocity.x = 0;
        player.rotation = 0;
    }

    if (frames % randomInterval === 0) {
        grids.push(new Grid);
        randomInterval = Math.floor(Math.random() * 500 + 500);
        frames = 0;
    }


    frames++;
}

animate();

addEventListener('keydown', ({ key }) => {
    if (game.over) return;
    switch (key) {
        case "ArrowLeft":
            keys.left.pressed = true;
            break;

        case "ArrowRight":
            keys.right.pressed = true;
            break;

        case " ":
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                velocity: {
                    x: 0, y: -10
                }
            }))
            break;
    }
})

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case "ArrowLeft":
            keys.left.pressed = false;
            break;

        case "ArrowRight":
            keys.right.pressed = false;
            break;

        case " ":
            break;
    }
})