// =====================================
// MIRROR-INT 4.0 CORE ENGINE (FIXED)
// =====================================

// =========================
// STATE
// =========================
let progress = 0;
let accessLevel = 0;
let systemBooted = false;
let audioStarted = false;

let cameraIndex = 0;
const cameras = [
  { name: "CAM 01", src: "images/cam_server.gif" },
  { name: "CAM 02", src: "images/cam_storage.gif" },
  { name: "CAM 03", src: "" }
];

// =========================
// AUDIO SYSTEM
// =========================
function startAudioOnce() {
  if (audioStarted) return;
  audioStarted = true;

  const bg = document.getElementById("bgMusic");
  const boot = document.getElementById("bootMusic");

  if (bg) {
    bg.volume = 0.4;
    bg.loop = true;
    bg.play().catch(() => {});
  }

  if (boot) {
    boot.volume = 0.3;
    boot.play().catch(() => {});
  }

  console.log("AUDIO STARTED");
}

// ✅ FIXED GLOBAL initAudio (ВАЖНО)
function initAudio() {
  const trigger = () => {
    startAudioOnce();
    document.removeEventListener("pointerdown", trigger);
    document.removeEventListener("touchstart", trigger);
    document.removeEventListener("keydown", trigger);
  };

  document.addEventListener("pointerdown", trigger, { once: true });
  document.addEventListener("touchstart", trigger, { once: true });
  document.addEventListener("keydown", trigger, { once: true });
}

// =========================
// UTIL
// =========================
const $ = (id) => document.getElementById(id);

function show(id) {
  const el = $(id);
  if (el) el.style.display = "block";
}

function hide(id) {
  const el = $(id);
  if (el) el.style.display = "none";
}

// =========================
// INTRO (BIOS → HACK → BOOT)
// =========================
function startIntro() {
  show("biosScreen");

  setTimeout(() => {
    hide("biosScreen");
    show("hackScreen");

    typeHack(() => {
      hide("hackScreen");
      startBoot();
    });

  }, 1200);
}

function typeHack(cb) {
  const el = $("hackText");
  if (!el) return cb();

  const lines = [
    "MIRROR CORE INIT...",
    "ACCESSING SYSTEM MEMORY...",
    "WARNING: UNKNOWN SIGNAL DETECTED",
    "OVERRIDE ACCEPTED",
    "BOOT SEQUENCE CONTINUING..."
  ];

  let i = 0;
  el.innerText = "";

  const t = setInterval(() => {
    if (i >= lines.length) {
      clearInterval(t);
      setTimeout(cb, 600);
      return;
    }

    el.innerText += lines[i] + "\n";
    i++;
  }, 300);
}

// =========================
// BOOT SYSTEM
// =========================
function startBoot() {
  progress = 0;

  const bar = $("bootProgress");
  const text = $("loadText");
  const status = $("bootStatus");

  const logs = [
    "Loading system...",
    "Checking hardware...",
    "Injecting core...",
    "Mounting registry...",
    "SYSTEM READY"
  ];

  const boot = setInterval(() => {
    progress += Math.random() * 4;

    if (bar) bar.style.width = progress + "%";
    if (text) text.innerText = Math.floor(progress) + "%";
    if (status) status.innerText = logs[Math.floor(progress / 25)] || logs.at(-1);

    if (progress >= 100) {
      clearInterval(boot);

      setTimeout(() => {
        hide("loading");
        show("login");
      }, 800);
    }
  }, 120);
}

// =========================
// LOGIN
// =========================
function loginSystem() {
  const user = $("user").value;
  const pass = $("pass").value;
  const status = $("loginStatus");

  let ok = false;

  if (user === "operator" && pass === "0404") ok = true;
  if (user === "research" && pass === "void") ok = true;
  if (user === "omega" && pass === "mirror") ok = true;

  if (!ok) {
    status.innerText = "ACCESS DENIED";
    return;
  }

  status.innerText = "ACCESS GRANTED";

  setTimeout(() => {
    hide("login");
    show("screen");

    systemBooted = true;
    startClock();
  }, 600);
}

// =========================
// WINDOWS SYSTEM
// =========================
function openWindow(id) {
  show(id);
}

function closeWindow(id) {
  hide(id);
}

// =========================
// CAMERA SYSTEM (FIXED)
// =========================
function switchCamera(dir) {
  cameraIndex += dir;

  if (cameraIndex < 0) cameraIndex = cameras.length - 1;
  if (cameraIndex >= cameras.length) cameraIndex = 0;

  const cam = $("cam");
  const name = $("cameraName");

  if (cam) cam.src = cameras[cameraIndex].src;
  if (name) name.innerText = cameras[cameraIndex].name;
}

// =========================
// ARCHIVE
// =========================
function openFile(type) {
  const viewer = $("viewer");

  const files = {
    log: "INCIDENT LOG:\nSYSTEM BREACH DETECTED...",
    subject: "SUBJECT REPORT:\nENTITY CLASS UNKNOWN...",
  };

  if (viewer) viewer.innerText = files[type] || "UNKNOWN FILE";
}

function openOmega() {
  const viewer = $("viewer");
  if (viewer) viewer.innerText = "OMEGA FILE:\nACCESS DENIED // LEVEL 3 REQUIRED";
}

// =========================
// STAFF CHAT (LOCAL FAKE)
// =========================
function sendStaffMessage() {
  const input = $("staffInput");
  const log = $("staffLog");

  if (!input || !log) return;

  log.innerText += "\nYOU: " + input.value;
  input.value = "";

  setTimeout(() => {
    log.innerText += "\nSYS: MESSAGE RECEIVED";
  }, 500);
}

// =========================
// GAME (SIMPLE VOID RUNNER PLACEHOLDER)
// =========================
function startGame() {
  const canvas = $("gameCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ff99";
  ctx.fillText("VOID RUNNER ACTIVE...", 50, 120);
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
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  initAudio();
  startIntro();
});

console.log("MIRROR-INT 4.0 CORE LOADED");
