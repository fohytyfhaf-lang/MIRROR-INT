// =========================
// MIRROR-INT 4.0 CORE ENGINE
// =========================

// =========================
// GLOBAL STATE
// =========================
let audioStarted = false;
let progress = 0;
let accessLevel = 0;
let systemBooted = false;

// =========================
// UTIL
// =========================
function $(id) {
  return document.getElementById(id);
}

function show(el) {
  if (el) el.style.display = "block";
}

function hide(el) {
  if (el) el.style.display = "none";
}

// =========================
// AUDIO SYSTEM (ANDROID FIX)
// =========================
function startAudioOnce() {
  if (audioStarted) return;
  audioStarted = true;

  const bg = $("bgMusic");
  const boot = $("bootMusic");

  const play = (el, vol, loop = false) => {
    if (!el) return;
    el.volume = vol;
    el.loop = loop;
    el.muted = false;
    el.play().catch(() => {});
  };

  setTimeout(() => {
    play(bg, 0.4, true);
    play(boot, 0.3, false);
    console.log("AUDIO STARTED");
  }, 50);
}

function initAudio() {
  const trigger = () => startAudioOnce();

  document.addEventListener("pointerdown", trigger, { once: true });
  document.addEventListener("touchstart", trigger, { once: true });
  document.addEventListener("keydown", trigger, { once: true });
}

// =========================
// BOOT SOUND
// =========================
function safeBootSound() {
  const el = $("bootSound");
  if (!el) return;
  el.volume = 0.3;
  el.play().catch(() => {});
}

// =========================
// INTRO (BIOS → HACK → BOOT)
// =========================
function startIntro() {
  const bios = $("biosScreen");
  const hack = $("hackScreen");
  const text = $("hackText");

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
// HACK TEXT EFFECT
// =========================
function typeHackText(cb) {
  const el = $("hackText");
  if (!el) return cb();

  const lines = [
    "injecting MIRROR CORE...",
    "accessing kernel memory...",
    "warning: unknown entity detected",
    "boot override accepted",
    "..."
  ];

  let i = 0;
  el.innerText = "";

  const t = setInterval(() => {
    if (i >= lines.length) {
      clearInterval(t);
      setTimeout(cb, 500);
      return;
    }
    el.innerText += lines[i] + "\n";
    i++;
  }, 250);
}

// =========================
// BOOT SEQUENCE
// =========================
function startBoot() {
  progress = 0;
  safeBootSound();

  const bar = $("bootProgress");
  const text = $("loadText");
  const status = $("bootStatus");

  const logs = [
    "Loading system...",
    "Checking hardware...",
    "Starting UI...",
    "Mounting registry...",
    "WARNING: ENTITY ACTIVE"
  ];

  const boot = setInterval(() => {
    progress += Math.random() * 4;

    if (bar) bar.style.width = progress + "%";
    if (text) text.innerText = Math.floor(progress) + "%";

    if (status) {
      status.innerText = logs[Math.floor(progress / 25)] || logs.at(-1);
    }

    if (progress >= 100) {
      clearInterval(boot);

      setTimeout(() => {
        hide($("loading"));
        show($("login"));
      }, 800);
    }
  }, 120);
}

// =========================
// LOGIN SYSTEM
// =========================
function loginSystem() {
  const user = $("user").value;
  const pass = $("pass").value;
  const status = $("loginStatus");

  let ok = false;

  if (user === "operator" && pass === "0404") {
    accessLevel = 1; ok = true;
  } else if (user === "research" && pass === "void") {
    accessLevel = 2; ok = true;
  } else if (user === "omega" && pass === "mirror") {
    accessLevel = 3; ok = true;
  }

  if (!ok) {
    status.innerText = "ACCESS DENIED";
    return;
  }

  status.innerText = "ACCESS GRANTED";

  setTimeout(() => {
    hide($("login"));
    show($("screen"));
    systemBooted = true;

    startClock();
  }, 600);
}

// =========================
// WINDOWS SYSTEM
// =========================
function openWindow(id) {
  playSound("clickSound");
  show($(id));
}

function closeWindow(id) {
  hide($(id));
}

// =========================
// SOUND
// =========================
function playSound(id) {
  const el = $(id);
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {});
}

// =========================
// CLOCK
// =========================
function startClock() {
  setInterval(() => {
    const c = $("clock");
    if (c) c.innerText = new Date().toLocaleTimeString();
  }, 1000);
}

// =========================
// CHAT SYSTEM (STAFF + SMILE)
// =========================
function sendStaffMessage() {
  const input = $("staffInput");
  const log = $("staffLog");
  if (!input || !log) return;

  log.innerText += "\nYOU: " + input.value;
  input.value = "";
}

function sendSmile() {
  const input = $("chatInput");
  const log = $("chatLog");
  if (!input || !log) return;

  log.innerText += "\nYOU: " + input.value;
  input.value = "";
}

// =========================
// ARCHIVE SYSTEM
// =========================
function openFile(type) {
  const viewer = $("viewer");

  const files = {
    log: "INCIDENT LOG: SYSTEM BREACH DETECTED",
    subject: "SUBJECT REPORT: ENTITY CLASS UNKNOWN",
  };

  viewer.innerText = files[type] || "FILE CORRUPTED";
}

function openOmega() {
  $("viewer").innerText = "Ω FILE: ACCESS DENIED BY CORE";
}

// =========================
// CAMERA SYSTEM
// =========================
let camIndex = 0;

const cams = [
  "CAMERA 01 ACTIVE",
  "CAMERA 02 SIGNAL LOST",
  "CAMERA 03 ENTITY MOVING",
  "CAMERA 04 STATIC NOISE"
];

function switchCamera(dir) {
  camIndex += dir;

  if (camIndex < 0) camIndex = cams.length - 1;
  if (camIndex >= cams.length) camIndex = 0;

  const name = $("cameraName");
  const img = $("cam");

  if (name) name.innerText = cams[camIndex];

  if (img) {
    img.src = "images/cam_" + (camIndex + 1) + ".gif";
  }
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("bootSound")?.volume = 0.3;
  document.getElementById("clickSound")?.volume = 0.4;

  startIntro();
  initAudio();
});

console.log("MIRROR-INT 4.0 CORE ONLINE");
