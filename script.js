// =========================
// MIRROR-INT CLEAN AUDIO + CORE FIX
// =========================
// ---------- AUDIO SYSTEM ----------
// =========================

let audioStarted = false;

function startAudioOnce() {
  if (audioStarted) return;
  audioStarted = true;

  const bg = document.getElementById("bgMusic");
  const boot = document.getElementById("bootMusic");

  const unlock = () => {
    if (bg) {
      bg.volume = 0.4;
      bg.loop = true;
      bg.muted = false;
      bg.play().catch(() => {});
    }

function initAudio() {
  const trigger = () => {
    startAudioOnce();
  };

  document.addEventListener("pointerdown", trigger, { once: true });
  document.addEventListener("touchstart", trigger, { once: true });
  document.addEventListener("keydown", trigger, { once: true });
}
    
    if (boot) {
      boot.volume = 0.3;
      boot.play().catch(() => {});
    }
  };

  setTimeout(unlock, 30);
  console.log("AUDIO STARTED");
}

let bootStage = 0;

function show(el) {
  if (el) el.style.display = "block";
}

function hide(el) {
  if (el) el.style.display = "none";
}

// ОДИН УНИВЕРСАЛЬНЫЙ ТРИГГЕР (ANDROID + PC)
// =========================
// ANDROID + PC AUDIO INIT
// =========================
function startIntro() {
  const bios = document.getElementById("biosScreen");
  const hack = document.getElementById("hackScreen");

  show(bios);

  setTimeout(() => {
    hide(bios);
    show(hack);

    typeHackText(() => {
      hide(hack);
      startBoot();
    });

  }, 1200);
}

// =========================
// HACK TYPING EFFECT (ARG FEEL)
// =========================
function typeHackText(callback) {
  const el = document.getElementById("hackText");
  if (!el) return callback();

  const lines = [
    "injecting MIRROR CORE...",
    "accessing kernel memory...",
    "warning: unknown entity detected",
    "boot override accepted",
    "..."
  ];

  let i = 0;

  const t = setInterval(() => {
    if (i >= lines.length) {
      clearInterval(t);
      setTimeout(callback, 500);
      return;
    }

    el.innerText += lines[i] + "\n";
    i++;
  }, 300);
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
  const bar = document.getElementById("bootProgress");
  const text = document.getElementById("loadText");
  const status = document.getElementById("bootStatus");

  let progress = 0;

  const logs = [
    "Loading system...",
    "Checking hardware...",
    "Injecting core modules...",
    "Mounting registry...",
    "WARNING: ENTITY ACTIVE"
  ];

  const boot = setInterval(() => {
    progress += Math.random() * 3; // ARG FEEL (НЕ линейный)

    if (bar) bar.style.width = progress + "%";
    if (text) text.innerText = Math.floor(progress) + "%";

    if (status) {
      status.innerText = logs[Math.floor(progress / 25)] || logs.at(-1);
    }

    if (progress >= 100) {
      clearInterval(boot);

      // glitch before login
      setTimeout(() => {
        document.getElementById("loading").style.opacity = "0";

        setTimeout(() => {
          hide(document.getElementById("loading"));
          show(document.getElementById("login"));
        }, 600);

      }, 800);
    }
  }, 120);
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
  // 🔥 ВАЖНО ДЛЯ ANDROID
  initAudio();
})

// =========================
// SAFE ELEMENT CHECK
// =========================
function $(id) {
  return document.getElementById(id);
}

// =========================
// PREVENT MOBILE ZOOM
// =========================
if ("ongesturestart" in window) {
  document.addEventListener("gesturestart", e => {
    e.preventDefault();
  });
}

// =========================
// ANDROID PERFORMANCE FIX
// =========================
window.addEventListener("touchmove", () => {}, {
  passive: true
});

console.log("MIRROR-INT CORE READY");
