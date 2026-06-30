import { loginSystem } from "./login.js";
import { playMusic } from "./audio.js";
import { runCommand } from "./console.js";
import { setSoundState } from "./soundManager.js";
import { makeWindowDraggable, bringToFront } from "./windowManager.js";
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
import { applyLanguage } from "./language.js";
import { Storage } from "./storage.js";
/* =========================
        GLOBAL
========================= */

window.playMusic = playMusic;
window.runCommand = runCommand;
window.setSoundState = setSoundState;
window.makeWindowDraggable = makeWindowDraggable;
window.bringToFront = bringToFront;
window.nextCam = nextCam;

/* =========================
        WINDOWS
========================= */

function openApp(name) {
    const win = document.getElementById(name + "Window");
    if (!win) return;

    win.classList.remove("hidden");
    bringToFront(win);
    makeWindowDraggable(win);

    if (name === "files") openExplorer();

    setSoundState(name === "console" ? "console"
        : name === "camera" ? "camera"
        : "desktop");
}

function closeApp(name) {
    const win = document.getElementById(name + "Window");
    if (win) win.classList.add("hidden");

    setSoundState("desktop");
}

window.openApp = openApp;
window.closeApp = closeApp;

/* =========================
        BOOT
========================= */

function startBoot() {
    const boot = document.getElementById("bootScreen");
    const login = document.getElementById("loginScreen");
    const text = document.getElementById("bootText");
    const bar = document.getElementById("bootProgress");

    if (!boot || !login) return;

    const lines = [
        "Initializing OMEGA...",
        "Loading modules...",
        "Connecting systems...",
        "Starting MR.SMILE...",
        "Boot complete"
    ];

    let i = 0;
    let p = 0;

    const t = setInterval(() => {
        if (i < lines.length) {
            text.innerHTML += lines[i++] + "<br>";
        }
    }, 500);

    const b = setInterval(() => {
        p += 5;
        if (bar) bar.style.width = p + "%";

        if (p >= 100) {
            clearInterval(t);
            clearInterval(b);

            setTimeout(() => {
                boot.style.display = "none";
                login.classList.remove("hidden");
            }, 500);
        }
    }, 120);
}

/* =========================
        LOGIN
========================= */

function initLogin() {
    const btn = document.getElementById("loginBtn");

    if (!btn) return;

    btn.addEventListener("click", loginSystem);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const login = document.getElementById("loginScreen");
            if (login && !login.classList.contains("hidden")) {
                loginSystem();
            }
        }
    });
}

/* =========================
        SYSTEM INIT
========================= */

function bootSystem() {
    initMrSmile();
    initMemory();
    loadTrust();
    updatePersonality();
    initMrSmileChat();
    initMrSmileEvents();

    if (knowledgeInit) knowledgeInit();

    window.MRSMILE = {
        start: forceEnableMrSmile,
        stop: forceDisableMrSmile,
        chat: mrSmileSay,
        initChat: initMrSmileChat
    };
}

/* =========================
        START
========================= */

window.addEventListener("DOMContentLoaded", () => {
        
    startBoot();
    initLogin();
    bootSystem();

    // =========================
    // SETTINGS LOAD FIX
    // =========================

    const user = Storage.get("currentUser");

    if (user) {
        const users = Storage.get("users", {});
        const settings = users[user]?.settings;

        if (settings) {
            if (settings.language) {
                applyLanguage(settings.language);
            }

            if (initSettings) {
                initSettings();
            }
        }
    }
});
