import { loginSystem } from "./login.js";
import { playMusic } from "./audio.js";
import { runCommand } from "./console.js";
import { setSoundState } from "./soundManager.js";
import { listFiles, readFile } from "./filesystem.js";
import { makeWindowDraggable, bringToFront } from "./windowManager.js";
import { getFile } from "./secretOrg.js";
import { nextCam } from "./camera.js";

/* GLOBAL */
window.playMusic = playMusic;
window.setSoundState = setSoundState;
window.runCommand = runCommand;
window.listFiles = listFiles;
window.readFile = readFile;
window.makeWindowDraggable = makeWindowDraggable;
window.bringToFront = bringToFront;
window.getFile = getFile;
window.nextCam = nextCam;



let currentExplorerPath = "/files";
function renderExplorer(path) {
  const view = document.getElementById("filesList");

  if (!view) return;

  currentExplorerPath = path;

  const items = listFiles(path);

  view.innerHTML = items.length
    ? items.map(item => {
        const fullPath = path + "/" + item;

        return `<div onclick="openExplorerItem('${fullPath}')">
                  📄 ${item}
                </div>`;
      }).join("")
    : "EMPTY FOLDER";
}
window.openExplorerItem = function(path) {
  const content = readFile(path);

  if (content !== null) {
    document.getElementById("filesList").innerText = content;
  } else {
    renderExplorer(path);
  }
};
window.goBack = function() {
  if (currentExplorerPath === "/files") return;

  const parts = currentExplorerPath.split("/");
  parts.pop();

  const newPath = parts.join("/") || "/files";

  renderExplorer(newPath);
};

/* WINDOW SYSTEM */
function openApp(name) {
  const win = document.getElementById(name + "Window");

  if (win) {
    win.classList.remove("hidden");
    bringToFront(win);
    makeWindowDraggable(win);
  }
  
if (name === "files") {
  renderExplorer("/files");
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
