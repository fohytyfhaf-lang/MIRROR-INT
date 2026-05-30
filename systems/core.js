console.log("CORE LOADED");

/* =========================
GLOBAL STATE
========================= */

const State = {
  loggedIn: false,
  bootDone: false,
  gameStarted: false,
  windows: {}
};

/* =========================
SAFE GET
========================= */

function el(id) {
  return document.getElementById(id);
}

/* =========================
BOOT (если есть boot.js)
========================= */

import { initBoot } from "./boot.js";
import { initLogin, loginSystem } from "./login.js";
import { initGame } from "./game.js";
import { initChat, sendMsg } from "./chat.js";
import { toggleMusic, initAudio } from "./audio.js";

/* =========================
WINDOW SYSTEM
========================= */

function openWindow(name) {
  const win = el(name + "Window");
  if (!win) return;
  win.style.display = "block";
}

function closeWindow(name) {
  const win = el(name + "Window");
  if (!win) return;
  win.style.display = "none";
}

window.openApp = openWindow;
window.closeApp = closeWindow;

/* =========================
LOGIN WRAPPER
========================= */

window.loginSystem = () => {
  loginSystem();
  State.loggedIn = true;

  setTimeout(() => {
    el("login").classList.remove("active");
    el("screen").style.display = "block";
  }, 300);
};

/* =========================
CHAT WRAPPER
========================= */

window.sendMsg = sendMsg;

/* =========================
AUDIO WRAPPER
========================= */

window.toggleMusic = toggleMusic;

/* =========================
GAME START
========================= */

window.startGame = function () {
  if (State.gameStarted) return;
  State.gameStarted = true;
  initGame();
};

/* =========================
INIT SEQUENCE
========================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  initAudio();
  initBoot();
  initLogin();
  initChat();
});
