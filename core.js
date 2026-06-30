/* =========================
        IMPORTS
========================= */

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
import { forceEnableMrSmile, forceDisableMrSmile } from "./mrsmile.js";
import { knowledgeInit } from "./knowledge.js";

/* =========================
        GLOBAL EXPORTS
========================= */

window.playMusic = playMusic;
window.setSoundState = setSoundState;
window.runCommand = runCommand;
window.listFiles = listFiles;
window.readFile = readFile;
window.makeWindowDraggable = makeWindowDraggable;
window.bringToFront = bringToFront;
window.getFile = getFile;
window.nextCam = nextCam;

/* =========================
        WINDOW SYSTEM (FIXED)
========================= */

function openApp(name) {
    const win = document.getElementById(name + "Window");

    if (!win) return;

    win.classList.remove("hidden");
    bringToFront(win);
    makeWindowDraggable(win);

    if (name === "files") {
        openExplorer();
    }

    if (name === "console") {
        setSoundState("console");
    } else if (name === "camera") {
        setSoundState("camera");
    } else {
        setSoundState("desktop");
    }
}

function closeApp(name) {
    const win = document.getElementById(name + "Window");

    if (!win) return;

    win.classList.add("hidden");
    setSoundState("desktop");
}

window.openApp = openApp;
window.closeApp = closeApp;



/* =========================
        BOOT SCREEN LOGIC
========================= */

const bootScreen = document.getElementById("bootScreen");
const bootText = document.getElementById("bootText");
const bootProgress = document.getElementById("bootProgress");
const loginScreen = document.getElementById("loginScreen");

const bootLines = [
    "[SYSTEM] Initializing OMEGA core...",
    "[SYSTEM] Loading security modules...",
    "[SYSTEM] Checking database integrity...",
    "[SYSTEM] Connecting to main server...",
    "[SYSTEM] Loading MR.SMILE subsystem...",
    "[SYSTEM] Warning: unknown anomaly detected...",
    "[SYSTEM] Boot sequence almost complete..."
];

function startBoot() {
    let i = 0;
    let progress = 0;

    const textInterval = setInterval(() => {
        if (i < bootLines.length) {
            bootText.innerHTML += bootLines[i] + "<br>";
            i++;
        }
    }, 600);

    const progressInterval = setInterval(() => {
        progress += 5;
        bootProgress.style.width = progress + "%";

        if (progress >= 100) {
            clearInterval(progressInterval);
            clearInterval(textInterval);

            setTimeout(() => {
                bootScreen.style.display = "none";
                loginScreen.classList.remove("hidden");
            }, 500);
        }
    }, 150);
}



/* =========================
        LOGIN SYSTEM INIT (FIXED)
========================= */

function initLogin() {
    const btn = document.getElementById("loginBtn");

    if (btn) {
        btn.addEventListener("click", loginSystem);
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const screen = document.getElementById("loginScreen");
            if (screen && !screen.classList.contains("hidden")) {
                loginSystem();
            }
        }
    });
}

/* =========================
        CLOCK (FIXED)
========================= */

function updateClock() {
    const clock = document.getElementById("clock");
    if (!clock) return;

    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");

    clock.textContent = `${h}:${m}`;
}

/* =========================
        SYSTEM BOOT
========================= */

function bootSystem() {
    initMrSmile();
    initMemory();
    loadTrust();
    updatePersonality();
    initMrSmileChat();
    initMrSmileEvents();

    if (knowledgeInit) knowledgeInit();

    setTimeout(() => {
        openApp("logs");
        console.log("[OMEGA] SYSTEM MODULE ACTIVE");
    }, 2000);

    window.MRSMILE = {
        start: forceEnableMrSmile,
        stop: forceDisableMrSmile,
        chat: mrSmileSay,
        initChat: initMrSmileChat
    };

    console.log("[OMEGA] MR.SMILE READY");
}

/* =========================
        STARTUP (ONLY ONCE)
========================= */

window.addEventListener("DOMContentLoaded", () => {

    // скрываем login сразу
    loginScreen.classList.add("hidden");

    startBoot();

    initLogin();
    bootSystem();

    updateClock();
    setInterval(updateClock, 1000);
});

});
