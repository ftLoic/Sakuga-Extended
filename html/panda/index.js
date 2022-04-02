/*
Reused from https://github.com/TylerPottsDev/chrome-dino-replica/blob/master/main.js
*/

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Variables
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let spawnTimer;
let keys = {};
let lastframe = -1;
let usernames = [
    'MAPPAGOAT',
    'SakuckerZ',
    'Xx_Eren_xX',
    'ASUTAAAAA',
    '60fps',
    'milkYboY',
    'Demain',
    'NotLoic',
    'ElRisitos',
    'VersCrique',
    'Unextended',
    'PAscon'
];
let phrases = [
    'lmao thats rotoscoped',
    'wtf this 3D panda',
    'rotoscope?',
    'tf is that panda',
    'worst op tbh',
    'bad rotoscope',
    'lmao the CGI panda'
];
let panda = document.getElementById('panda');
// Event Listeners
document.addEventListener('keydown', function(evt) {
    keys[evt.code] = true;
});
document.addEventListener('keyup', function(evt) {
    keys[evt.code] = false;
});

class Player {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.dy = 0;
        this.jumpForce = 15;
        this.originalHeight = h;
        this.grounded = false;
        this.jumpTimer = 0;
    }
    Animate() {
        // Jump
        if (keys['Space']) {
            this.Jump();
        } else {
            this.jumpTimer = 0;
        }

        this.y += this.dy;
        // Gravity
        if (this.y+this.h < canvas.height) {
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.h;
        }
        this.Draw();
    }
    Jump() {
        if (this.grounded && this.jumpTimer == 0) {
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }
    }
    Draw() {
        ctx.drawImage(panda, this.x, this.y);
    }
}

class Obstacle {
    constructor (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.dx = -gameSpeed;

        this.username = usernames[Math.floor(Math.random()*usernames.length)];
        this.phrase = phrases[Math.floor(Math.random()*phrases.length)];
    }
    Update() {
        this.x += this.dx;
        this.Draw();
        this.dx = -gameSpeed;
    }
    Draw() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        // author
        ctx.font = "bold 17px verdana, sans-serif";
        ctx.fillStyle = "#ee8887";
        ctx.fillText(this.username, this.x+12, this.y+25);
        // date
        ctx.font = "12px verdana, sans-serif";
        ctx.fillStyle = "#555555";
        ctx.fillText("6 days ago", this.x+12, this.y+42);
        // text
        ctx.font = "12px verdana, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(this.phrase, this.x+175, this.y+24);
    }
}

class Text {
    constructor (t, x, y, a, c, s) {
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }
    Draw() {
        ctx.fillStyle = this.c;
        ctx.font = this.s + "px sans-serif";
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
    }
}

// Game Functions
function SpawnObstacle() {
    let sizeX = 320;
    let sizeY = 80;
    let type = 0;
    let obstacle = new Obstacle(canvas.width+sizeX, canvas.height-sizeY, sizeX, sizeY);
    if (type == 1) {
        obstacle.y -= player.originalHeight - 10;
    }
    obstacles.push(obstacle);
}

function Start() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.font = "20px sans-serif";
    
    player = new Player(25, 0, 125, 99);
    ResetData();

    scoreText = new Text("Score: ", 20, 40, "left", "#ffffff", "28");
    highscore = localStorage.getItem("highest") | "0";
    highscoreText = new Text("High score: ", canvas.width-20, 40, "right", "#ffffff", "28");
}
function ResetData() {
    document.getElementById('background').style.backgroundPositionX = "0%";
    obstacles = [];
    gameSpeed = 0;
    gravity = 1;
    spawnTimer = 0;
    score = 0;
    player.y = 25;
}

// Draw game
setInterval(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer --;
    if (spawnTimer <= 0) {
        SpawnObstacle();
        spawnTimer = Math.max(45, gameSpeed)*(Math.random()+0.8)*1.7;
    }

    // Spawn Enemies
    for (let i = 0; i < obstacles.length; i ++) {
        let o = obstacles[i];
        if (o.x + o.w < 0) {
            obstacles.splice(i, 1);
        }
    }
    for (let i = 0; i < obstacles.length; i ++) {
        let o = obstacles[i];
        if (player.x <= o.x+o.w && player.x+player.w >= o.x && player.y <= o.y+o.h && player.y+player.h >= o.y) {
            if (score > highscore) {
                highscore = score;
                localStorage.setItem("highest", highscore);
            }
            ResetData();
        }
        o.Update();
    }

    player.Animate();

    highscoreText.t = "High score: "+highscore;
    highscoreText.Draw();
    score ++;
    document.getElementById('background').style.backgroundPositionX = (score/5)+"%";
    scoreText.t = "Score: "+score;
    scoreText.Draw();
    
    if (score < 10) gameSpeed = 70;
    if (score == 10) gameSpeed = 0;
    if (score > 10 && score < 120) gameSpeed += 0.1;
    if (score < 1700) gameSpeed += 0.025;
}, (1/60)*1000);

Start();