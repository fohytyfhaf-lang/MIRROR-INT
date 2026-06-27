import { loginSystem } from "./login.js";
import { playMusic, unlockAudio } from "./audio.js";
import { runCommand } from "./console.js";
import { setSoundState } from "./soundManager.js";
/* GLOBAL */
window.playMusic = playMusic;
window.unlockAudio = unlockAudio;
window.setSoundState = setSoundState;
window.runCommand = runCommand;
/* WINDOW SYSTEM */
function openApp(name) {
  const win = document.getElementById(name + "Window");
  if (win) win.classList.remove("hidden");
}

function closeApp(name) {
  const win = document.getElementById(name + "Window");
  if (win) win.classList.add("hidden");
}

window.openApp = openApp;
window.closeApp = closeApp;

/* LOGIN INIT */
window.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.addEventListener("click", loginSystem);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {

      const screen = document.getElementById("loginScreen");
      if (!screen || screen.classList.contains("hidden")) return;

      loginSystem();
    }
  });

});

/* CLOCK */
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
