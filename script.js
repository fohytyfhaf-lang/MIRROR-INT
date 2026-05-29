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
        if (login) login.classList.add("active");

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

    if (login) login.classList.remove("active");
    if (screen) screen.style.display = "block";

    startClock();
  }, 600);
}
// =========================
// WINDOWS
// =========================
function openWindow(id) {
  const win = document.getElementById(id);

  if (!win) return;

  win.style.display = "block";

  // случайная позиция как Win95
  if (!win.dataset.opened) {
    win.style.top = (80 + Math.random() * 120) + "px";
    win.style.left = (120 + Math.random() * 180) + "px";

    win.dataset.opened = "true";
  }
}

function closeWindow(id) {
  const win = document.getElementById(id);

  if (!win) return;

  win.style.display = "none";
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

  const text = input.value.trim();

  if (!text) return;

  log.innerText += "\nYOU: " + text;

  input.value = "";

  const replies = [
    "SYS: MESSAGE RECEIVED",
    "STAFF: Copy that.",
    "STAFF: Sector locked.",
    "STAFF: Movement detected.",
    "SYS: Connection unstable.",
    "STAFF: Access granted.",
    "STAFF: Entity not found.",
    "STAFF: Repeat last command."
  ];

  setTimeout(() => {
    const reply =
      replies[Math.floor(Math.random() * replies.length)];

    log.innerText += "\n" + reply;

    log.scrollTop = log.scrollHeight;
  }, 500);
}

// =========================
// GAME SAFE
// =========================
let gameStarted = false;

function startGame() {
  if (gameStarted) return;

  gameStarted = true;

  const canvas = $("gameCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let x = 50;
  let y = 120;

  let speed = 4;

  const keys = {};

  document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  function loop() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (keys["w"]) y -= speed;
    if (keys["s"]) y += speed;
    if (keys["a"]) x -= speed;
    if (keys["d"]) x += speed;

    ctx.fillStyle = "#00ff99";
    ctx.fillRect(x, y, 20, 20);

    ctx.font = "14px Courier New";
    ctx.fillText("VOID RUNNER ACTIVE", 20, 20);

    requestAnimationFrame(loop);
  }

  loop();
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

document.querySelectorAll(".window-header").forEach(header => {

  const win = header.parentElement;

  let dragging = false;

  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener("mousedown", (e) => {

    dragging = true;

    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {

    if (!dragging) return;

    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });

});
