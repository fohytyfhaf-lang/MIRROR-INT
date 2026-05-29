import { initBoot } from "./boot.js";
import { initLogin, loginSystem } from "./login.js";
import { initGame } from "./game.js";
import { initChat, sendMsg } from "./chat.js";
import { toggleMusic, initAudio } from "./audio.js";

/* =========================
GLOBAL FUNCTIONS
========================= */

window.loginSystem = loginSystem;
window.sendMsg = sendMsg;
window.toggleMusic = toggleMusic;

/* =========================
WINDOW SYSTEM
========================= */

window.openApp = function(name){

  const win = document.getElementById(name + "Window");
  if(!win) return;

  win.style.display = "block";
};

window.closeApp = function(name){

  const win = document.getElementById(name + "Window");
  if(!win) return;

  win.style.display = "none";
};

/* =========================
INIT
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initAudio();   // 🔥 важно (музыка по клику)
    initBoot();    // boot → login
    initLogin();   // login system
    initGame();    // cube game
    initChat();    // staff chat

  }
);
