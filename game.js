const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ============ CANVAS ============ */
function resize() {
  canvas.width = Math.min(window.innerWidth, 420);
  canvas.height = Math.min(window.innerHeight, 640);
}
resize();
window.addEventListener("resize", resize);

/* ============ UI ============ */
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");
const nameInput = document.getElementById("playerName");

/* ============ ASSETS ============ */
const playerImg = new Image();
playerImg.src = "dy.jpg";

const pipeImg = new Image();
pipeImg.src = "dacchu.png";

/* ============ AUDIO ============ */
const bgMusic = new Audio("bg1.mpeg");
bgMusic.loop = true;
bgMusic.volume = 0.3;

const gameOverSound = new Audio("go.mpeg");
const winSound = new Audio("win.mpeg");

/* ============ CONSTANTS ============ */
const GRAVITY = 0.45;
const JUMP = -8;
const SPEED = 2.5;

const PIPE_WIDTH = 70;
const PIPE_GAP = 200;
const PIPE_INTERVAL = 140;

const GOLD_SCORE = 100;

/* ============ GAME STATE ============ */
let player;
let pipes = [];
let score = 0;
let frame = 0;
let running = false;

/* ============ PLAYER ============ */
function resetPlayer() {
  player = {
    x: 90,
    y: canvas.height / 2,
    vy: 0,
    size: 50
  };
}

/* ============ PIPE ============ */
function createPipe() {
  const top =
    Math.random() * (canvas.height - PIPE_GAP - 200) + 80;

  pipes.push({
    x: canvas.width,
    top,
    passed: false
  });
}

/* ============ GAME LOOP ============ */
function loop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* ---- PLAYER ---- */
  player.vy += GRAVITY;
  player.y += player.vy;

  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

  /* ---- PIPES ---- */
  pipes.forEach(p => {
    p.x -= SPEED;

    // Top pipe body
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);

    // Top cap
    ctx.drawImage(pipeImg, p.x, p.top - 40, PIPE_WIDTH, 40);

    // Bottom pipe
    const bottomY = p.top + PIPE_GAP;
    ctx.fillRect(p.x, bottomY + 40, PIPE_WIDTH, canvas.height);

    // Bottom cap
    ctx.drawImage(pipeImg, p.x, bottomY, PIPE_WIDTH, 40);

    // Score
    if (!p.passed && p.x + PIPE_WIDTH < player.x) {
      p.passed = true;
      score++;
    }

    // Collision
    const hitX =
      player.x + player.size > p.x &&
      player.x < p.x + PIPE_WIDTH;

    const hitTop = player.y < p.top;
    const hitBottom = player.y + player.size > bottomY;

    if (hitX && (hitTop || hitBottom)) endGame(false);
  });

  pipes = pipes.filter(p => p.x + PIPE_WIDTH > 0);

  /* ---- PIPE SPAWN ---- */
  frame++;
  if (frame % PIPE_INTERVAL === 0) createPipe();

  /* ---- SCORE ---- */
  ctx.fillStyle = "#000";
  ctx.font = "28px Arial Black";
  ctx.fillText(score, canvas.width / 2 - 15, 45);

  /* ---- BOUNDS ---- */
  if (player.y < 0 || player.y + player.size > canvas.height) {
    endGame(false);
  }

  if (score >= GOLD_SCORE) endGame(true);

  requestAnimationFrame(loop);
}

/* ============ START ============ */
function startGame() {
  if (!nameInput.value.trim()) {
    alert("Enter saviour name");
    return;
  }

  resetPlayer();
  pipes = [];
  score = 0;
  frame = 0;
  running = true;

  bgMusic.currentTime = 0;
  bgMusic.play();

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  requestAnimationFrame(loop);
}

/* ============ END ============ */
function endGame(win) {
  if (!running) return;
  running = false;

  bgMusic.pause();
  bgMusic.currentTime = 0;

  if (win) {
    winSound.currentTime = 0;
    winSound.play();
  } else {
    gameOverSound.currentTime = 0;
    gameOverSound.play();
  }

  finalScore.innerText =
    `Saviour: ${nameInput.value}\nScore: ${score}`;

  gameOverScreen.classList.remove("hidden");
}

/* ============ INPUT ============ */
canvas.addEventListener("pointerdown", () => {
  if (running) player.vy = JUMP;
});

document.addEventListener("keydown", e => {
  if (e.code === "Space" && running) player.vy = JUMP;
});

startBtn.onclick = startGame;
restartBtn.onclick = () => location.reload();

