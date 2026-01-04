const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ---------- ADMIN ---------- */
const ADMIN_PASSWORD = "admin123";

/* ---------- MEDAL TARGETS ---------- */
const BRONZE_SCORE = 25;
const SILVER_SCORE = 35;
const GOLD_SCORE   = 50;

/* ---------- CANVAS ---------- */
function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth, 400);
  canvas.height = Math.min(window.innerHeight, 600);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ---------- UI ---------- */
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const pauseBtn = document.getElementById("pauseBtn");
const difficultySelect = document.getElementById("difficulty");
const nameInput = document.getElementById("playerName");

const leaderboardDiv = document.getElementById("leaderboard");
const leaderboardList = document.getElementById("leaderboardList");
const closeBoardBtn = document.getElementById("closeBoardBtn");
const clearBoardBtn = document.getElementById("clearBoardBtn");

/* ---------- ASSETS ---------- */
const playerImg = new Image();
playerImg.src = "dy.jpg";

const pipeTipImg = new Image();
pipeTipImg.src = "dacchu.png";

/* ---------- AUDIO ---------- */
const gameOverSound = new Audio("go.mpeg");
const bgMusic = new Audio("bg1.mpeg");
const winSound = new Audio("win.mpeg"); // 🥇 GOLD WIN AUDIO

bgMusic.loop = true;
bgMusic.volume = 0.35;

/* ---------- GAME STATE ---------- */
let GRAVITY, SPEED, PIPE_GAP, PIPE_INTERVAL;
let player = null;
let pipes = [];
let score = 0;
let medal = "";
let gameRunning = false;
let paused = false;
let pipeTimer = 0;
let playerName = "";

/* ---------- DIFFICULTY ---------- */
function setDifficulty(level) {
  if (level === "easy") {
    GRAVITY = 0.18; SPEED = 1.8; PIPE_GAP = 240; PIPE_INTERVAL = 2000;
  } else if (level === "medium") {
    GRAVITY = 0.30; SPEED = 2.0; PIPE_GAP = 190; PIPE_INTERVAL = 1500;
  } else {
    GRAVITY = 0.42; SPEED = 2.6; PIPE_GAP = 155; PIPE_INTERVAL = 1200;
  }
}

/* ---------- PLAYER ---------- */
function createPlayer() {
  return {
    x: 90,
    y: canvas.height / 2,
    size: 60,
    vy: 0,
    dead: false,

    flap() {
      if (!gameRunning || paused) return;
      this.vy = -4.5;
    },

    update() {
      if (!gameRunning || paused) return;
      this.vy += GRAVITY;
      this.y += this.vy;
      if (this.y < 0) this.y = 0;
      if (this.y + this.size > canvas.height) this.dead = true;
    },

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x + 30, this.y + 30, 30, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(playerImg, this.x, this.y, this.size, this.size);
      ctx.restore();
    },

    bounds() {
      return { x: this.x + 10, y: this.y + 10, w: 40, h: 40 };
    }
  };
}

/* ---------- PIPE ---------- */
function createPipe(x) {
  const pipeWidth = 60;
  const tipSize = 50;
  const gapY = Math.random() * (canvas.height - PIPE_GAP - 120) + 60;

  return {
    x,
    passed: false,

    update() { this.x -= SPEED; },

    draw() {
      ctx.fillStyle = "#49b34c";
      ctx.fillRect(this.x, 0, pipeWidth, gapY - tipSize);
      ctx.drawImage(pipeTipImg, this.x - 5, gapY - tipSize, pipeWidth + 10, tipSize);
      ctx.fillRect(this.x, gapY + PIPE_GAP + tipSize, pipeWidth, canvas.height);
      ctx.drawImage(pipeTipImg, this.x - 5, gapY + PIPE_GAP, pipeWidth + 10, tipSize);
    },

    bounds() {
      return [
        { x: this.x, y: 0, w: pipeWidth, h: gapY },
        { x: this.x, y: gapY + PIPE_GAP, w: pipeWidth, h: canvas.height }
      ];
    }
  };
}

/* ---------- GAME LOOP ---------- */
function gameLoop() {
  if (!gameRunning || !player) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update();
  player.draw();

  pipeTimer += 16;
  if (pipeTimer > PIPE_INTERVAL) {
    pipes.push(createPipe(canvas.width));
    pipeTimer = 0;
  }

  pipes.forEach(p => {
    p.update();
    p.draw();

    p.bounds().forEach(b => {
      if (overlap(player.bounds(), b)) player.dead = true;
    });

    if (!p.passed && p.x + 60 < player.x) {
      p.passed = true;
      score++;

      if (score === BRONZE_SCORE) medal = "🥉 Bronze";
      if (score === SILVER_SCORE) medal = "🥈 Silver";
      if (score === GOLD_SCORE) {
        medal = "🥇 Gold";
        winSound.currentTime = 0;
        winSound.play();
        endGame();
      }
    }
  });

  pipes = pipes.filter(p => p.x + 60 > 0);
  drawScore();

  if (player.dead) endGame();
  else requestAnimationFrame(gameLoop);
}

/* ---------- SCORE ---------- */
function drawScore() {
  ctx.font = "28px Arial Black";
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 4;
  ctx.strokeText(score, canvas.width / 2 - 10, 50);
  ctx.fillText(score, canvas.width / 2 - 10, 50);
}

/* ---------- COLLISION ---------- */
function overlap(a, b) {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}

/* ---------- GAME CONTROL ---------- */
function startGame() {
  gameOverSound.pause(); gameOverSound.currentTime = 0;
  winSound.pause(); winSound.currentTime = 0;
  bgMusic.pause(); bgMusic.currentTime = 0;

  playerName = nameInput.value.trim();
  if (!playerName) return alert("Enter saviour name");

  setDifficulty(difficultySelect.value);
  pipes = [];
  score = 0;
  medal = "";
  pipeTimer = 0;
  paused = false;
  gameRunning = true;

  player = createPlayer();

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  leaderboardDiv.classList.add("hidden");
  pauseBtn.classList.remove("hidden");

  bgMusic.play();
  requestAnimationFrame(gameLoop);
}

function endGame() {
  if (!gameRunning) return;
  gameRunning = false;

  bgMusic.pause();
  if (medal !== "🥇 Gold") {
    gameOverSound.currentTime = 0;
    gameOverSound.play();
  }

  pauseBtn.classList.add("hidden");
  saveScore();

  finalScore.innerText =
    `Saviour: ${playerName}\nScore: ${score}\nMedal: ${medal || "None"}`;

  showLeaderboard();
  gameOverScreen.classList.remove("hidden");
  leaderboardDiv.classList.remove("hidden");
}

/* ---------- LEADERBOARD ---------- */
function saveScore() {
  let board = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const existing = board.find(p => p.name === playerName);

  if (existing) {
    if (score > existing.score) existing.score = score;
  } else {
    board.push({ name: playerName, score });
  }

  board.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(board.slice(0, 10)));
}

function showLeaderboard() {
  leaderboardList.innerHTML = "";
  (JSON.parse(localStorage.getItem("leaderboard")) || []).forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${p.name} — ${p.score}`;
    leaderboardList.appendChild(li);
  });
}

/* ---------- INPUT ---------- */
canvas.addEventListener("pointerdown", () => {
  if (player && gameRunning && !paused) player.flap();
});
document.addEventListener("keydown", e => {
  if (e.code === "Space" && player && gameRunning && !paused) player.flap();
});

pauseBtn.onclick = () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶ Resume" : "⏸ Pause";
};

closeBoardBtn.onclick = () => leaderboardDiv.classList.add("hidden");

clearBoardBtn.onclick = () => {
  const pass = prompt("Enter admin password");
  if (pass === ADMIN_PASSWORD) {
    localStorage.removeItem("leaderboard");
    leaderboardList.innerHTML = "";
    alert("Leaderboard cleared");
  } else {
    alert("Unauthorized");
  }
};

startBtn.onclick = startGame;
restartBtn.onclick = () => {
  gameOverScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
};


