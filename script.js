// =========================
// MIRROR-INT 4.0 FULL ARG CORE
// Stable / Android Safe / Story Engine
// =========================

let audioUnlocked = false;
let started = false;

let threat = 0;
let corruption = 0;
let storyStage = 0;

let log = [];

// =========================
// AUDIO (SAFE)
// =========================
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  const bg = document.getElementById("bgMusic");
  const boot = document.getElementById("bootMusic");

  [bg, boot].forEach(a => {
    if (!a) return;
    a.volume = 0.35;
    a.play().catch(() => {});
  });
}

// Android / PC gesture unlock
document.addEventListener("pointerdown", () => {
  unlockAudio();
  const o = document.getElementById("tapOverlay");
  if (o) o.remove();
}, { once: true });

// =========================
// SAFE SOUND
// =========================
function sfx(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {});
}

// =========================
// BOOT
// =========================
function startBoot() {
  let p = 0;

  sfx("bootSound");

  const boot = setInterval(() => {
    p++;

    const bar = document.getElementById("bootProgress");
    const text = document.getElementById("loadText");
    const status = document.getElementById("bootStatus");

    if (bar) bar.style.width = p + "%";
    if (text) text.innerText = p + "%";

    const lines = [
      "Booting MIRROR kernel...",
      "Checking memory integrity...",
      "Loading archive layers...",
      "SYSTEM STABLE (for now)"
    ];

    if (status) {
      status.innerText = lines[Math.floor(p / 25)] || lines.at(-1);
    }

    if (p >= 100) {
      clearInterval(boot);

      setTimeout(() => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("login").style.display = "flex";
      }, 500);
    }
  }, 20);
}

// =========================
// LOGIN
// =========================
function loginSystem() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;
  const status = document.getElementById("loginStatus");

  const ok =
    (u === "operator" && p === "0404") ||
    (u === "research" && p === "void") ||
    (u === "omega" && p === "mirror");

  if (!ok) {
    status.innerText = "ACCESS DENIED";
    return;
  }

  status.innerText = "ACCESS GRANTED";

  setTimeout(() => {
    document.getElementById("login").style.display = "none";
    document.getElementById("screen").style.display = "block";

    started = true;

    startClock();
    startARG();
  }, 400);
}

// =========================
// WINDOW SYSTEM
// =========================
function openWindow(id) {
  sfx("clickSound");
  document.getElementById(id)?.style.display = "block";
}

function closeWindow(id) {
  document.getElementById(id)?.style.display = "none";
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
// MEMORY ENGINE
// =========================
function writeLog(text) {
  log.push("[SYS] " + text);

  const mem = document.getElementById("memory");
  if (!mem) return;

  mem.innerText = log.slice(-14).join("\n");
}

// =========================
// ARG CORE ENGINE (HEART OF 4.0)
// =========================
function startARG() {
  setInterval(() => {
    if (!started) return;

    const events = [
      eventIdle,
      eventCameraDrift,
      eventCorruption,
      eventThreat,
      eventStoryShift
    ];

    const e = events[Math.floor(Math.random() * events.length)];
    e();
  }, 7000);
}

// =========================
// EVENTS
// =========================
function eventIdle() {
  writeLog("background processes running");
}

function eventCameraDrift() {
  writeLog("camera signal unstable");

  const cam = document.getElementById("cam");
  if (!cam) return;

  if (Math.random() < 0.4) {
    cam.style.opacity = "0.4";
    setTimeout(() => cam.style.opacity = "1", 120);
  }
}

function eventCorruption() {
  corruption++;

  writeLog("DATA CORRUPTION LEVEL: " + corruption);

  if (corruption === 3) {
    trigger("Something is changing the files...");
  }

  if (corruption === 6) {
    trigger("Archive integrity failing");
  }

  if (corruption >= 9) {
    trigger("MIRROR OVERRIDE ACTIVE");
    corruption = 0;
  }
}

function eventThreat() {
  threat++;

  writeLog("THREAT LEVEL: " + threat);

  if (threat === 5) {
    trigger("Unknown presence detected");
  }

  if (threat >= 10) {
    trigger("SYSTEM WATCHING YOU");
    threat = 0;
  }
}

function eventStoryShift() {
  storyStage++;

  if (storyStage === 3) {
    trigger("You are not the first operator.");
  }

  if (storyStage === 6) {
    trigger("MIRROR remembers you.");
  }

  if (storyStage === 9) {
    trigger("EXIT IS NO LONGER VALID");
  }
}

// =========================
// GLOBAL EVENT TRIGGER
// =========================
function trigger(text) {
  writeLog("!!! " + text);

  const mem = document.getElementById("memory");
  if (mem) {
    mem.innerText += "\n\n[WARNING]\n" + text;
  }

  sfx("alertSound");
}

// =========================
// INTRO
// =========================
function startIntro() {
  const bios = document.getElementById("biosScreen");
  const hack = document.getElementById("hackScreen");

  bios.style.display = "block";

  setTimeout(() => {
    bios.style.display = "none";
    hack.style.display = "block";

    setTimeout(() => {
      hack.style.display = "none";
      startBoot();
    }, 900);

  }, 1000);
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  startIntro();
});
