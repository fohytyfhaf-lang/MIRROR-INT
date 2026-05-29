
import { startBoot } from "./boot.js";
import { loginSystem } from "./login.js";
import { startGame } from "./game.js";
import { initChat } from "./chat.js";
import { initCamera } from "./camera.js";

window.startBoot = startBoot;
window.loginSystem = loginSystem;
window.startGame = startGame;

document.addEventListener("DOMContentLoaded", () => {
  startBoot();
});

const $ = id => document.getElementById(id);

let logged = false;
let x = 20;
let y = 150;
let velY = 0;
let jump = false;
let code = 0;

// ================= LOGIN =================
function loginSystem(){
  const u = $("user").value;
  const p = $("pass").value;

  if(
    (u==="operator" && p==="0404") ||
    (u==="admin" && p==="0000")
  ){
    $("loginStatus").innerText = "OK";

    setTimeout(()=>{
      $("login").style.display="none";
      $("screen").classList.remove("hidden");
      startGame();
    },500);
  } else {
    $("loginStatus").innerText = "NO";
  }
}

// ================= MUSIC =================
function toggleMusic(){
  const m = $("music");
  if(m.paused) m.play();
  else m.pause();
}

// ================= CHAT =================
function sendMsg(){
  const msg = $("msg");
  $("chat").innerText += "\nYOU: " + msg.value;

  setTimeout(()=>{
    const replies = [
      "we see you",
      "system awake",
      "don’t trust logs",
      "mirror responds"
    ];
    $("chat").innerText += "\nSYS: " +
      replies[Math.floor(Math.random()*replies.length)];
  },500);

  msg.value="";
}

// ================= GAME =================
const canvas = $("game");
const ctx = canvas ? canvas.getContext("2d") : null;

function startGame(){
  requestAnimationFrame(loop);
}

function loop(){
  if(!ctx) return;

  ctx.fillStyle="black";
  ctx.fillRect(0,0,500,200);

  // gravity
  velY += 0.5;
  y += velY;

  if(y > 150){
    y = 150;
    velY = 0;
    jump = false;
  }

  // cube
  ctx.fillStyle="#00ff99";
  ctx.fillRect(x,y,20,20);

  // fake code pickup
  if(Math.random()<0.02){
    code++;
    $("codeBox").innerText = "CODE: " + code;
  }

  requestAnimationFrame(loop);
}

// jump
document.addEventListener("keydown", e=>{
  if(e.code==="Space" && !jump){
    velY = -8;
    jump = true;
  }
});
