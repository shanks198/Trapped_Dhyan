const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ---------- CANVAS (STABLE SIZE) ---------- */
function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth, 420);
  canvas.height = Math.min(window.innerHeight, 640);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ---------- UI ---------- */
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");
const nameInput = document.getElementById("playerName");

/* ---------- ASSETS ---------- */
const playerImg = new Image();
playerImg.src = "dy.jpg";

const pipeImg = new Image();
pipeImg.src = "dacchu.png";

/* ---------- AUDIO ---------- */
const bgMusic = new Audio("bg1.mpeg");
bgMusic.loop = true;
bgMusic.volume = 0.3;

const gameOverSound = new Audio("go.mpeg");
const winSound = new Audio("win.mpeg");

/* ---------- GAME CONSTANTS ---------- */
const PIPE_WIDTH = 60;
const PIPE_GAP = 200;
const GRAVITY = 0.4;
const JUMP = -7;
const SPEED = 2.2;
const GOLD_SCORE = 100;

/* ---------- GAME STATE ---------- */
let player, pipes, score, running;

/* ---------- PLAYER ---------- */
function createPlayer() {
  return {
    x: 90,
    y: canvas.height / 2,
    vy: 0,
    size: 50
  };
}

/* ---------- PIPE ---------- */
function createPipe() {
  const topHeight =
    Math.random() * (canvas.height - PIPE_GAP - 200) + 80;

  return {
    x: canvas.width,
    top: topHeight,
    passed: false
  };
}

/* ---------- GAME LOOP ---------- */
function loop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Player */
  player.vy += GRAVITY;
  player.y += player.vy;
  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

  /* Pipes */
  pipes.forEach(p => {
    p.x -= SPEED;

    // Top pipe
    ctx.drawImage(pipeImg, p.x, p.top - 50, PIPE_WIDTH, 50);
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top - 50);

    // Bottom pipe
    ctx.drawImage(
      pipeImg,
      p.x,
      p.top + PIPE_GAP,
      PIPE_WIDTH,
      50
    );
    ctx.fillRect(
      p.x,
      p.top + PIPE_GAP + 50,
      PIPE_WIDTH,
      canvas.height
    );

    // Score
    if (!p.passed && p.x + PIPE_WIDTH < player.x) {
      score++;
      p.passed = true;
    }

    // Collision
    if (
      player.x < p.x + PIPE_WIDTH &&
      player.x + player.size > p.x &&
      (player.y < p.top ||
        player.y + player.size >
          p.top + PIPE_GAP)
    ) {
      endGame(false);
    }
  });

  pipes = pipes.filter(p => p.x + PIPE_WIDTH > 0);

  if (Math.random() < 0.02) pipes.push(createPipe());

  /* Score display */
  ctx.fillStyle = "#000";
  ctx.font = "26px Arial Black";
  ctx.fillText(score, canvas.width / 2 - 10, 40);

  if (score >= GOLD_SCORE) endGame(true);
  if (player.y < 0 || player.y + player.size > canvas.height)
    endGame(false);
  else requestAnimationFrame(loop);
}

/* ---------- START ---------- */
function startGame() {
  if (!nameInput.value.trim()) {
    alert("Enter saviour name");
    return;
  }

  player = createPlayer();
  pipes = [];
  score = 0;
  running = true;

  bgMusic.currentTime = 0;
  bgMusic.play();

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  requestAnimationFrame(loop);
}

/* ---------- END ---------- */
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

/* ---------- INPUT ---------- */
canvas.addEventListener("pointerdown", () => {
  if (running) player.vy = JUMP;
});

document.addEventListener("keydown", e => {
  if (e.code === "Space" && running) player.vy = JUMP;
});

startBtn.onclick = startGame;
restartBtn.onclick = () => location.reload();

