const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ================= CANVAS ================= */
function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth, 420);
  canvas.height = Math.min(window.innerHeight, 640);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ================= UI ================= */
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");
const nameInput = document.getElementById("playerName");

/* ================= ASSETS ================= */
const playerImg = new Image();
playerImg.src = "dy.jpg";

const pipeImg = new Image();
pipeImg.src = "dacchu.png";

/* ================= AUDIO ================= */
const bgMusic = new Audio("bg1.mpeg");
bgMusic.loop = true;
bgMusic.volume = 0.3;

const gameOverSound = new Audio("go.mpeg");
const winSound = new Audio("win.mpeg");

/* ================= CONSTANTS ================= */
const PIPE_WIDTH = 70;
const PIPE_GAP = 200;
const PIPE_SPEED = 2.4;

const GRAVITY = 0.45;
const JUMP = -7.5;
const GOLD_SCORE = 100;

/* ================= GAME STATE ================= */
let player;
let pipes = [];
let score = 0;
let running = false;
let pipeSpawnTimer = 0;

/* ================= PLAYER ================= */
function createPlayer() {
  return {
    x: 90,
    y: canvas.height / 2,
    size: 52,
    velocity: 0
  };
}

/* ================= PIPE ================= */
function createPipe() {
  const minTop = 60;
  const maxTop = canvas.height - PIPE_GAP - 120;

  const topHeight =
    Math.random() * (maxTop - minTop) + minTop;

  return {
    x: canvas.width,
    topHeight,
    passed: false
  };
}

/* ================= GAME LOOP ================= */
function gameLoop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* ----- PLAYER ----- */
  player.velocity += GRAVITY;
  player.y += player.velocity;

  ctx.drawImage(
    playerImg,
    player.x,
    player.y,
    player.size,
    player.size
  );

  /* ----- PIPES ----- */
  pipes.forEach(pipe => {
    pipe.x -= PIPE_SPEED;

    /* Top pipe body */
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(
      pipe.x,
      0,
      PIPE_WIDTH,
      pipe.topHeight
    );

    /* Top pipe cap */
    ctx.drawImage(
      pipeImg,
      pipe.x,
      pipe.topHeight - 40,
      PIPE_WIDTH,
      40
    );

    /* Bottom pipe body */
    const bottomY = pipe.topHeight + PIPE_GAP;
    ctx.fillRect(
      pipe.x,
      bottomY + 40,
      PIPE_WIDTH,
      canvas.height - bottomY
    );

    /* Bottom pipe cap */
    ctx.drawImage(
      pipeImg,
      pipe.x,
      bottomY,
      PIPE_WIDTH,
      40
    );

    /* ----- SCORE ----- */
    if (!pipe.passed && pipe.x + PIPE_WIDTH < player.x) {
      pipe.passed = true;
      score++;
    }

    /* ----- COLLISION ----- */
    const hitX =
      player.x < pipe.x + PIPE_WIDTH &&
      player.x + player.size > pipe.x;

    const hitTop =
      player.y < pipe.topHeight;

    const hitBottom =
      player.y + player.size > bottomY;

    if (hitX && (hitTop || hitBottom)) {
      endGame(false);
    }
  });

  pipes = pipes.filter(p => p.x + PIPE_WIDTH > 0);

  /* ----- PIPE SPAWN ----- */
  pipeSpawnTimer++;
  if (pipeSpawnTimer > 90) {
    pipes.push(createPipe());
    pipeSpawnTimer = 0;
  }

  /* ----- SCORE DISPLAY ----- */
  ctx.fillStyle = "#000";
  ctx.font = "28px Arial Black";
  ctx.fillText(score, canvas.width / 2 - 12, 45);

  /* ----- BOUNDS ----- */
  if (player.y < 0 || player.y + player.size > canvas.height) {
    endGame(false);
  }

  if (score >= GOLD_SCORE) {
    endGame(true);
  }

  requestAnimationFrame(gameLoop);
}

/* ================= START GAME ================= */
function startGame() {
  if (!nameInput.value.trim()) {
    alert("Enter saviour name");
    return;
  }

  player = createPlayer();
  pipes = [];
  score = 0;
  pipeSpawnTimer = 0;
  running = true;

  bgMusic.currentTime = 0;
  bgMusic.play();

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  requestAnimationFrame(gameLoop);
}

/* ================= END GAME ================= */
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

/* ================= INPUT ================= */
canvas.addEventListener("pointerdown", () => {
  if (running) player.velocity = JUMP;
});

document.addEventListener("keydown", e => {
  if (e.code === "Space" && running) {
    player.velocity = JUMP;
  }
});

startBtn.onclick = startGame;
restartBtn.onclick = () => location.reload();
