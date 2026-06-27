import { loginSystem } from "./login.js";
import { playMusic } from "./audio.js";
import { initCamera, nextCam } from "./camera.js";

window.nextCam = nextCam;

/* =========================
   GLOBAL WINDOW ACCESS
========================= */

window.login = loginSystem;
window.openApp = openApp;
window.closeApp = closeApp;

/* =========================
   LOGIN ENTER KEY FIX
========================= */

window.login = loginSystem;

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.addEventListener("click", loginSystem);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const loginScreen = document.getElementById("loginScreen");
    if (loginScreen && !loginScreen.classList.contains("hidden")) {
      loginSystem();
    }
  }
});

/* =========================
   WINDOW SYSTEM
========================= */

function openApp(name) {
  const win = document.getElementById(name + "Window");
  if (win) win.classList.remove("hidden");
}

function closeApp(name) {
  const win = document.getElementById(name + "Window");
  if (win) win.classList.add("hidden");
}

/* =========================
   CLOCK SYSTEM
========================= */

function updateClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;

  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");

  clock.textContent = `${h}:${m}`;
}

setInterval(updateClock, 1000);
updateClock();

/* =========================
   INIT AUDIO (SAFE)
========================= */

window.playMusic = playMusic;
