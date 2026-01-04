// 🔴 TEMPORARILY DISABLE FIREBASE
// (we will re-enable after confirming game runs)

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ---------- CANVAS ---------- */
function resize() {
  canvas.width = Math.min(window.innerWidth, 400);
  canvas.height = Math.min(window.innerHeight, 600);
}
resize();
window.addEventListener("resize", resize);

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
const winSound = new Audio("win.mpeg");
const gameOverSound = new Audio("go.mpeg");

/* ---------- GAME STATE ---------- */
let player, pipes, score, running;
const GRAVITY = 0.4, SPEED = 2.2, GAP = 200;

/* ---------- PLAYER ---------- */
function createPlayer() {
  return { x: 80, y: canvas.height / 2, vy: 0, size: 50 };
}

/* ---------- PIPE ---------- */
function createPipe(x) {
  const top = Math.random() * (canvas.height - GAP - 120) + 60;
  return { x, top, passed: false };
}

/* ---------- LOOP ---------- */
function loop() {
  if (!running) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  player.vy += GRAVITY;
  player.y += player.vy;
  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

  pipes.forEach(p => {
    p.x -= SPEED;
    ctx.drawImage(pipeImg, p.x, 0, 60, p.top);
    ctx.drawImage(pipeImg, p.x, p.top + GAP, 60, canvas.height);

    if (!p.passed && p.x + 60 < player.x) {
      score++;
      p.passed = true;
    }

    if (
      player.x < p.x + 60 &&
      player.x + player.size > p.x &&
      (player.y < p.top || player.y + player.size > p.top + GAP)
    ) endGame(false);
  });

  pipes = pipes.filter(p => p.x > -60);
  if (Math.random() < 0.02) pipes.push(createPipe(canvas.width));

  ctx.fillStyle = "#000";
  ctx.font = "24px Arial";
  ctx.fillText(score, canvas.width/2 - 10, 40);

  if (score >= 100) endGame(true);
  if (player.y < 0 || player.y > canvas.height) endGame(false);
  else requestAnimationFrame(loop);
}

/* ---------- START ---------- */
function startGame() {
  if (!nameInput.value.trim()) return alert("Enter saviour name");

  player = createPlayer();
  pipes = [];
  score = 0;
  running = true;

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  requestAnimationFrame(loop);
}

/* ---------- END ---------- */
function endGame(win) {
  if (!running) return;
  running = false;

  (win ? winSound : gameOverSound).play();

  finalScore.innerText =
    `Saviour: ${nameInput.value}\nScore: ${score}`;

  gameOverScreen.classList.remove("hidden");
}

/* ---------- INPUT ---------- */
canvas.addEventListener("pointerdown", ()=> running && (player.vy = -6));
document.addEventListener("keydown", e=>{
  if (e.code==="Space" && running) player.vy = -6;
});

startBtn.onclick = startGame;
restartBtn.onclick = () => location.reload();

