// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴 PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "PASTE_HERE",
  authDomain: "PASTE_HERE",
  projectId: "PASTE_HERE",
  storageBucket: "PASTE_HERE",
  messagingSenderId: "PASTE_HERE",
  appId: "PASTE_HERE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------- CANVAS ----------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = Math.min(window.innerWidth, 400);
canvas.height = Math.min(window.innerHeight, 600);

// ---------- UI ----------
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const leaderboardDiv = document.getElementById("leaderboard");
const leaderboardList = document.getElementById("leaderboardList");
const finalScore = document.getElementById("finalScore");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const closeBoardBtn = document.getElementById("closeBoardBtn");
const nameInput = document.getElementById("playerName");

// ---------- ASSETS ----------
const playerImg = new Image();
playerImg.src = "dy.jpg";

const pipeImg = new Image();
pipeImg.src = "dacchu.png";

// ---------- GAME STATE ----------
let player, pipes, score;
let GRAVITY = 0.3, SPEED = 2.2, PIPE_GAP = 200;

// ---------- PLAYER ----------
function createPlayer() {
  return { x: 80, y: 300, vy: 0, size: 50 };
}

// ---------- PIPE ----------
function createPipe(x) {
  const top = Math.random() * 250 + 50;
  return { x, top, passed: false };
}

// ---------- GAME LOOP ----------
function gameLoop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Player
  player.vy += GRAVITY;
  player.y += player.vy;
  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

  // Pipes
  pipes.forEach(p => {
    p.x -= SPEED;

    ctx.drawImage(pipeImg, p.x, 0, 60, p.top);
    ctx.drawImage(pipeImg, p.x, p.top + PIPE_GAP, 60, canvas.height);

    if (!p.passed && p.x + 60 < player.x) {
      score++;
      p.passed = true;
    }

    // Collision
    if (
      player.x < p.x + 60 &&
      player.x + player.size > p.x &&
      (player.y < p.top || player.y + player.size > p.top + PIPE_GAP)
    ) {
      endGame();
    }
  });

  pipes = pipes.filter(p => p.x > -60);

  if (Math.random() < 0.02) pipes.push(createPipe(canvas.width));

  // Score
  ctx.fillStyle = "#000";
  ctx.font = "24px Arial";
  ctx.fillText(score, 190, 40);

  if (player.y > canvas.height || player.y < 0) endGame();
  else requestAnimationFrame(gameLoop);
}

// ---------- START ----------
function startGame() {
  if (!nameInput.value.trim()) return alert("Enter saviour name");

  player = createPlayer();
  pipes = [];
  score = 0;

  startScreen.classList.add("hidden");
  requestAnimationFrame(gameLoop);
}

// ---------- END ----------
async function endGame() {
  finalScore.innerText = `Saviour: ${nameInput.value}\nScore: ${score}`;
  gameOverScreen.classList.remove("hidden");

  // 🔥 SAVE SCORE ONLINE
  await addDoc(collection(db, "leaderboard"), {
    name: nameInput.value,
    score: score,
    time: Date.now()
  });

  showLeaderboard();
}

// ---------- LEADERBOARD ----------
async function showLeaderboard() {
  leaderboardList.innerHTML = "";
  leaderboardDiv.classList.remove("hidden");

  const snapshot = await getDocs(collection(db, "leaderboard"));
  const scores = [];

  snapshot.forEach(doc => scores.push(doc.data()));
  scores.sort((a,b)=>b.score-a.score);

  scores.slice(0,10).forEach((p,i)=>{
    const li = document.createElement("li");
    li.textContent = `${i+1}. ${p.name} — ${p.score}`;
    leaderboardList.appendChild(li);
  });
}

// ---------- INPUT ----------
canvas.addEventListener("pointerdown", () => player.vy = -6);

startBtn.onclick = startGame;
restartBtn.onclick = () => location.reload();
closeBoardBtn.onclick = () => leaderboardDiv.classList.add("hidden");



