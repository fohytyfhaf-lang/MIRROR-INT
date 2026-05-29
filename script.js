// =====================================
// MIRROR-INT 4.0 CORE (STABLE FIXED)
// =====================================

// =========================
// STATE
// =========================
let progress = 0;
let accessLevel = 0;
let systemBooted = false;
let audioStarted = false;
let clockStarted = false;

let cameraIndex = 0;

// =========================
// CAMERAS
// =========================
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
// AUDIO (SAFE)
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
// INTRO
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
// BOOT
// =========================
function startBoot() {
  progress = 0;

  const bar = $("bootProgress");
  const text = $("loadText");
  const status = $("bootStatus");

  const logs = [
    "Loading system...",
    "Checking hardware...",
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

const login = document.getElementById("login");
login.style.display = "flex";
login.classList.add("active");
      }, 800);
    }
  }, 120);
}

// =========================
// LOGIN (FIXED)
// =========================
function loginSystem() {
  const user = document.getElementById("user")?.value;
  const pass = document.getElementById("pass")?.value;
  const status = document.getElementById("loginStatus");

  let ok = false;

  if (user === "operator" && pass === "0404") ok = true;
  if (user === "research" && pass === "void") ok = true;
  if (user === "omega" && pass === "mirror") ok = true;

  if (!ok) {
    if (status) status.innerText = "ACCESS DENIED";
    return;
  }

  if (status) status.innerText = "ACCESS GRANTED";

 setTimeout(() => {
  const login = document.getElementById("login");
  const screen = document.getElementById("screen");

  login.classList.remove("active");
  login.style.display = "none";

  screen.style.display = "block";

  systemBooted = true;
  startClock();
}, 600);
// =========================
// WINDOWS
// =========================
function openWindow(id) {
  show(id);
}

function closeWindow(id) {
  hide(id);
}

// =========================
// CAMERA FIXED
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
// ARCHIVE SAFE
// =========================
function openFile(type) {
  const viewer = $("viewer");
  if (!viewer) return;

  const files = {
    log: "INCIDENT LOG:\nSYSTEM BREACH DETECTED...",
    subject: "SUBJECT REPORT:\nUNKNOWN ENTITY CLASS..."
  };

  viewer.innerText = files[type] || "FILE NOT FOUND";
}

function openOmega() {
  const viewer = $("viewer");
  if (viewer) viewer.innerText = "OMEGA FILE:\nACCESS LEVEL REQUIRED: 3";
}

// =========================
// CHAT SAFE
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
// GAME SAFE
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
// CLOCK FIX (NO DUPLICATES)
// =========================
function startClock() {
  if (clockStarted) return;
  clockStarted = true;

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

  setTimeout(() => {
    startIntro();
  }, 200);
});

console.log("MIRROR-INT 4.0 CORE LOADED");
