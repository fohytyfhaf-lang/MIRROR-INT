import { loginSystem } from "./login.js";
import { playMusic } from "./audio.js";
import { runCommand } from "./console.js";
import { setSoundState } from "./soundManager.js";
import { listFiles, readFile } from "./filesystem.js";
import { makeWindowDraggable, bringToFront } from "./windowManager.js";
/* GLOBAL */
window.playMusic = playMusic;
window.setSoundState = setSoundState;
window.runCommand = runCommand;
window.listFiles = listFiles;
window.readFile = readFile;
window.makeWindowDraggable = makeWindowDraggable;
window.bringToFront = bringToFront;
/* WINDOW SYSTEM */
function openApp(name) {
  const win = document.getElementById(name + "Window");

  if (win) {
    win.classList.remove("hidden");
    bringToFront(win);
    makeWindowDraggable(win);
  }
  
if (name === "files") {
  const view = document.querySelector("#filesWindow p");
  if (view) {
    const files = listFiles("/files");

    view.innerText = files.length
      ? files.join("\n")
      : "NO FILES FOUND";
  }
}
  
  switch (name) {
    case "console":
      setSoundState("console");
      break;

    case "camera":
      setSoundState("camera");
      break;

    default:
      setSoundState("desktop");
  }
}

function closeApp(name) {
  const win = document.getElementById(name + "Window");
  if (win) win.classList.add("hidden");

  setSoundState("desktop");
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
