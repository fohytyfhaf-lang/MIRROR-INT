// =====================================
// MIRROR-INT 4.0 CORE (STABLE BUILD)
// =====================================

// =========================
// STATE
// =========================
let progress = 0;
let accessLevel = 0;
let systemBooted = false;
let audioStarted = false;

let cameraIndex = 0;

// 🧠 камеры под твою структуру
const cameras = [
  { name: "CAM SERVER", src: "images/cam_server.gif" },
  { name: "CAM STORAGE", src: "images/cam_storage.gif" },
  { name: "CAM LAB", src: "images/cam_lab.gif" },
  { name: "CAM OFFICE", src: "images/cam_office.gif" },
  { name: "CAM HALL", src: "images/cam_hall.gif" },
  { name: "CAM SECRET", src: "images/cam_secret.gif" },
  { name: "CAM GLITCH", src: "images/cam_glitch.gif" },
  { name: "CAM ALERT", src: "images/cam_alert.gif" }
];

// =========================
// HELPERS
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
// AUDIO SYSTEM
// =========================
function startAudioOnce() {
  if (audioStarted) return;
  audioStarted = true;

  const bg = $("bgMusic");

  if (bg) {
    bg.volume = 0.4;
    bg.loop = true;
    bg.play().catch(() => {});
  }

  console.log("AUDIO STARTED");
}

function initAudio() {
  const trigger = () => startAudioOnce();

  document.addEventListener("pointerdown", trigger, { once: true });
  document.addEventListener("touchstart", trigger, { once: true });
  document.addEventListener("keydown", trigger, { once: true });
}

// =========================
// INTRO (BIOS → BOOT)
// =========================
function startIntro() {
  show("biosScreen");

  setTimeout(() => {
    hide("biosScreen");
    show("hackScreen");

    setTimeout(() => {
      hide("hackScreen");
      startBoot();
    }, 1200);

  }, 1200);
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
    "Loading MIRROR-INT core...",
    "Checking systems...",
    "Injecting modules...",
    "Mounting memory...",
    "SYSTEM READY"
  ];

  const boot = setInterval(() => {
    progress += Math.random() * 5;

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
  const user = $("user")?.value;
  const pass = $("pass")?.value;
  const status = $("loginStatus");

  let ok = false;
show("login"); // OK
  if (user === "operator" && pass === "0404") ok = true;
  if (user === "research" && pass === "void") ok = true;
  if (user === "omega" && pass === "mirror") ok = true;

  if (!ok) {
    if (status) status.innerText = "ACCESS DENIED";
    return;
  }

  if (status) status.innerText = "ACCESS GRANTED";

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
// CAMERA SYSTEM
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
// ARCHIVE SYSTEM
// =========================
function openFile(type) {
  const viewer = $("viewer");

  const files = {
    log: "INCIDENT LOG:\nSYSTEM BREACH DETECTED...",
    subject: "SUBJECT REPORT:\nUNKNOWN ENTITY CLASS...",
  };

  if (viewer) viewer.innerText = files[type] || "FILE NOT FOUND";
}

function openOmega() {
  const viewer = $("viewer");
  if (viewer) viewer.innerText = "OMEGA FILE:\nACCESS LEVEL REQUIRED: 3";
}

// =========================
// STAFF CHAT
// =========================
function sendStaffMessage() {
  const input = $("staffInput");
  const log = $("staffLog");

  if (!input || !log) return;

  log.innerText += "\nYOU: " + input.value;

  setTimeout(() => {
    log.innerText += "\nSYS: MESSAGE RECEIVED";
  }, 400);

  input.value = "";
}

// =========================
// GAME (PLACEHOLDER)
// =========================
function startGame() {
  const canvas = $("gameCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ff99";
  ctx.fillText("VOID RUNNER ACTIVE", 50, 120);
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
// INIT (IMPORTANT FIX)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  initAudio();

  setTimeout(() => {
    startIntro();
  }, 200);
});

console.log("MIRROR-INT 4.0 CORE LOADED");
