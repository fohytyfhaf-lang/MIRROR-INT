// =========================
// MIRROR-INT CLEAN AUDIO + CORE FIX
// =========================
// ---------- AUDIO SYSTEM ----------
// =========================
// MIRROR-INT AUDIO FIX (ANDROID + PC SAFE)
// =========================

let audioStarted = false;

function startAudioOnce() {
  if (audioStarted) return;
  audioStarted = true;

  const bg = document.getElementById("bgMusic");
  const boot = document.getElementById("bootMusic");

  // безопасный старт музыки только после жеста
  setTimeout(() => {

    if (bg) {
      bg.volume = 0.4;
      bg.loop = true;
      bg.muted = false;

      const p = bg.play();
      if (p) p.catch(() => console.log("BG BLOCKED"));
    }

    if (boot) {
      boot.volume = 0.3;
      boot.play().catch(() => {});
    }

  }, 50);

  console.log("AUDIO ENABLED");
}


// =========================
// UNIVERSAL USER INTERACTION TRIGGER
// (ANDROID + PC 100%)
// =========================
function initAudio() {

  const start = () => {
    startAudioOnce();
    document.removeEventListener("pointerdown", start);
  };

  document.addEventListener("pointerdown", start, { once: true });
}

// ---------- SAFE SOUND PLAY ----------
function playSound(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.currentTime = 0;
  el.play().catch(() => {});
}


// =========================
// BOOT SOUND FIX
// =========================
function safeBootSound() {
  const el = document.getElementById("bootSound");
  if (!el) return;

  el.volume = 0.3;
  el.play().catch(() => {});
}


// =========================
// GLOBAL GAME / SYSTEM STATE
// =========================
let progress = 0;
let accessLevel = 0;
let systemBooted = false;


// =========================
// START BOOT
// =========================
function startBoot() {
  progress = 0;

  safeBootSound();

  const boot = setInterval(() => {
    progress += 0.5;

    const bar = document.getElementById("bootProgress");
    const text = document.getElementById("loadText");
    const status = document.getElementById("bootStatus");

    if (bar) bar.style.width = progress + "%";
    if (text) text.innerText = Math.floor(progress) + "%";

    const logs = [
      "Loading system...",
      "Checking hardware...",
      "Starting UI...",
      "Mounting registry..."
    ];

    if (status) {
      status.innerText = logs[Math.floor(progress / 25)] || logs.at(-1);
    }

    if (progress >= 100) {
      clearInterval(boot);

      setTimeout(() => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("login").style.display = "flex";
      }, 800);
    }
  }, 200);
}


// =========================
// LOGIN
// =========================
function loginSystem() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;
  const status = document.getElementById("loginStatus");

  let ok = false;

  if (user === "operator" && pass === "0404") {
    accessLevel = 1;
    ok = true;
  } else if (user === "research" && pass === "void") {
    accessLevel = 2;
    ok = true;
  } else if (user === "omega" && pass === "mirror") {
    accessLevel = 3;
    ok = true;
  }

  if (!ok) {
    status.innerText = "ACCESS DENIED";
    return;
  }

  status.innerText = "ACCESS GRANTED";

  setTimeout(() => {
    document.getElementById("login").style.display = "none";
    document.getElementById("screen").style.display = "block";

    systemBooted = true;

    startClock();
    updateMemory();
  }, 600);
}


// =========================
// WINDOWS
// =========================
function openWindow(id) {
  playSound("clickSound");

  const w = document.getElementById(id);
  if (w) w.style.display = "block";
}

function closeWindow(id) {
  const w = document.getElementById(id);
  if (w) w.style.display = "none";
}


// =========================
// CLOCK
// =========================
function startClock() {
  setInterval(() => {
    const c = document.getElementById("clock");
    if (c) c.innerText = new Date().toLocaleTimeString();
  }, 1000);
}


// =========================
// MEMORY
// =========================
let systemLog = [];

function systemSpeak(text) {
  systemLog.push("[SYS] " + text);
  updateMemory();
}

function updateMemory() {
  const mem = document.getElementById("memory");
  if (!mem) return;

  mem.innerText = systemLog.slice(-10).join("\n");
}


// =========================
// INIT (ВАЖНО)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("bootSound")?.volume = 0.3;
  document.getElementById("clickSound")?.volume = 0.4;
  document.getElementById("glitchSound")?.volume = 0.25;
  document.getElementById("alertSound")?.volume = 0.5;

  startIntro();
});


// =========================
// INTRO FIX
// =========================
function startIntro() {
  const bios = document.getElementById("biosScreen");
  const hack = document.getElementById("hackScreen");
  const hackText = document.getElementById("hackText");

  bios.style.display = "block";

  setTimeout(() => {
    bios.style.display = "none";
    hack.style.display = "block";

    setTimeout(() => {
      hack.style.display = "none";
      startBoot();
    }, 1500);
  }, 1200);
}
