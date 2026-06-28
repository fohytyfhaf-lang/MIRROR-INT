import { loginSystem } from "./login.js";
import { playMusic } from "./audio.js";
import { runCommand } from "./console.js";
import { setSoundState } from "./soundManager.js";
import { listFiles, readFile } from "./filesystem.js";
import { makeWindowDraggable, bringToFront } from "./windowManager.js";
import { getFile } from "./secretOrg.js";
import { nextCam } from "./camera.js";
import { openExplorer } from "./explorer.js";
import { initMrSmile } from "./mrsmile.js";
import { initMemory } from "./mrsmileMemory.js";
import { loadTrust } from "./mrsmileTrust.js";
import { updatePersonality } from "./personality.js";
import { mrSmileSay } from "./mrsmileCore.js";
import { initMrSmileChat } from "./mrsmileChat.js";
import { initMrSmileEvents } from "./mrsmileEvents.js";

import { knowledgeInit } from "./knowledge.js"; // если есть init

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
window.MRSMILE_DEBUG = {
    start: initMrSmileChat,
    test: mrSmileSay
};
window.addEventListener("DOMContentLoaded", () => {
  initMrSmile();
});

window.addEventListener("DOMContentLoaded", () => {
    
 console.log("CORE START");

    initMrSmile();
    initMemory();
    loadTrust();
    updatePersonality();

    initMrSmileChat();
    initMrSmileEvents();

    console.log("BEFORE MRSMILE DEBUG");

    window.MRSMILE_DEBUG = {
        start: () => initMrSmileChat(),
        test: (t) => mrSmileSay(t)
    };

    console.log("MRSMILE READY");


    // память
    initMemory();

    // доверие
    loadTrust();

    // личность
    updatePersonality();

    // чат
    if (initMrSmileChat) initMrSmileChat();

    // события
    if (initMrSmileEvents) initMrSmileEvents();

    // знания
    if (knowledgeInit) knowledgeInit();

    console.log("[OMEGA] MR.SMILE MODULE LOADED");

});

/* WINDOW SYSTEM */
function openApp(name) {
  const win = document.getElementById(name + "Window");

  if (win) {
    win.classList.remove("hidden");
    bringToFront(win);
    makeWindowDraggable(win);
  }
  
if (name === "files") {
  openExplorer();
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
