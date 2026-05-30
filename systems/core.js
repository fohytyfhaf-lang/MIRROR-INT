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

let z = 10;

/* DRAG SYSTEM */
function makeDraggable(win) {
  const title = win.querySelector(".title");
  let offsetX = 0, offsetY = 0, drag = false;

  title.addEventListener("mousedown", (e) => {
    drag = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.zIndex = ++z;
  });

  document.addEventListener("mousemove", (e) => {
    if (!drag) return;
    win.style.left = (e.clientX - offsetX) + "px";
    win.style.top = (e.clientY - offsetY) + "px";
  });

  document.addEventListener("mouseup", () => drag = false);
}

/* INIT WINDOWS */
export function initWindows() {
  document.querySelectorAll(".window").forEach(makeDraggable);
}

/* CLOSE WINDOW */
window.closeApp = function(name) {
  const w = document.getElementById(name + "Window");
  if (w) w.style.display = "none";
};

/* OPEN WINDOW */
window.openApp = function(name) {
  const w = document.getElementById(name + "Window");
  if (w) {
    w.style.display = "block";
    w.style.zIndex = ++z;
  }
};

window.toggleStart = function () {
  const menu = document.getElementById("startMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
};

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
