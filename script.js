// =========================
// MIRROR-INT V7 CORE SYSTEM
// =========================

// ---------- SYSTEM STATE ----------
let progress = 0;
let accessLevel = 0;
let systemBooted = false;

let cameraStarted = false;
let activeCamera = 0;

let staffPaused = false;
let staffStarted = false;



// ---------- MEMORY ----------
let systemLog = [];
let staffChat = [];
let smileMemory = [];

// ---------- PLAYER ----------
let playerName = "OPERATOR";

let profile = {
  actions: 0,
  secret: 0,
  start: Date.now()
};

// ---------- STAFF ----------
const staffProfiles = [
  { name: "HARRIS", mood: "aggressive" },
  { name: "MILA", mood: "careful" },
  { name: "ETHAN", mood: "nervous" },
  { name: "LUCY", mood: "quiet" }
];

// ---------- FILE SYSTEM ----------
const files = {
  log: `INCIDENT LOG
Sector 04 breach detected
Unknown signal in system loop
Status: unstable`,

  subject: `SUBJECT REPORT
Entity: UNKNOWN
Memory corruption detected
Behavior: inconsistent logs`
};

// =========================
// SYSTEM SPEAK
// =========================
function systemSpeak(msg) {
  systemLog.push("[SYSTEM] " + msg);
  updateMemory();
}

// =========================
// MEMORY
// =========================
function updateMemory() {
  const mem = document.getElementById("memory");
  if (!mem) return;

  let minutes = Math.floor((Date.now() - profile.start) / 60000);

  let text = "";

  if (profile.actions > 5) text += "HIGH ACTIVITY\n";
  if (profile.secret > 0) text += "UNAUTHORIZED ACCESS\n";
  if (minutes > 1) text += "LONG SESSION DETECTED\n";

  if (!text) text = "USER STATUS: NORMAL";

  mem.innerText =
    text +
    "\n\n" +
    systemLog.slice(-6).join("\n");
}

// =========================
// WINDOW SYSTEM
// =========================
function openWindow(id) {
  const w = document.getElementById(id);
  if (w) w.style.display = "block";
}

function closeWindow(id) {
  const w = document.getElementById(id);
  if (w) w.style.display = "none";
}

// =========================
// LOGIN SYSTEM
// =========================
function loginSystem() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;
  const status = document.getElementById("loginStatus");

  let ok = false;

  if (user === "operator" && pass === "0404") { accessLevel = 1; ok = true; }
  else if (user === "research" && pass === "void") { accessLevel = 2; ok = true; }
  else if (user === "omega" && pass === "mirror") { accessLevel = 3; ok = true; }

  if (!ok) {
    status.innerText = "ACCESS DENIED";
    systemSpeak("FAILED LOGIN");
    return;
  }

  status.innerText = "ACCESS GRANTED";

  setTimeout(() => {
    document.getElementById("login").style.display = "none";
    document.getElementById("screen").style.display = "block";

    systemBooted = true;
    systemSpeak("SYSTEM ONLINE");

    startSystem();

   if (accessLevel >= 2 && !staffStarted) {
  staffStarted = true;
  staffAI();
}
  if (accessLevel >= 3) {
  setTimeout(() => unlockSmile(), 1200);
}

// =========================
// FILE SYSTEM
// =========================
function openFile(type) {
  const viewer = document.getElementById("viewer");
  if (!viewer) return;

  if (type === "log") viewer.innerText = files.log;

  if (type === "subject") {
    if (accessLevel < 1) return systemSpeak("ACCESS REQUIRED");
    viewer.innerText = files.subject;
  }

  profile.actions++;
  updateMemory();
}

// =========================
// CAMERA SYSTEM (MULTI VIEW)
// =========================
function startSystem() {
 if (cameraStarted) return;
cameraStarted = true;

console.log("CAMERA SYSTEM STARTED");

  const cam = document.getElementById("cam");
  if (!cam) return;

  setInterval(() => {
    if (!systemBooted) return;

    const r = Math.random();

    const cameras = [
      "images/cam_idle.gif",
      "images/cam_hall.gif",
      "images/cam_server.gif",
      "images/cam_unknown.gif"
    ];

    if (accessLevel === 0) {
      cam.src = cameras[0];
    } else if (accessLevel <= 2) {
      cam.src = r < 0.6 ? cameras[1 + Math.floor(Math.random() * 2)] : cameras[0];
    } else {
      cam.src = cameras[3];
    }

  }, 2500);
}

// =========================
// STAFF AI (REAL DIALOGUES)
// =========================
function staffAI() {
  if (staffPaused) return;

  const scenes = [
    [
      { t: 0, a: "HARRIS", m: "System instability is increasing..." },
      { t: 4000, a: "MILA", m: "Logs are rewriting themselves." },
      { t: 9000, a: "ETHAN", m: "I don't think this is normal behavior." },
      { t: 14000, a: "LUCY", m: "Stay calm. Monitor only." },
      { t: 20000, a: "HARRIS", m: "Something is inside the system..." }
    ],
    [
      { t: 0, a: "MILA", m: "Did you sleep?" },
      { t: 5000, a: "ETHAN", m: "Not really... I keep thinking about logs." },
      { t: 10000, a: "HARRIS", m: "We are not supposed to talk about that." },
      { t: 16000, a: "LUCY", m: "We are still humans, Harris." }
    ]
  ];

  const scene = scenes[Math.floor(Math.random() * scenes.length)];

  scene.forEach(msg => {
    setTimeout(() => {
      addStaffMessage(msg.a, msg.m);
    }, msg.t);
  });

  setTimeout(staffAI, 25000);
}

// =========================
// STAFF CHAT
// =========================
function addStaffMessage(author, text) {
  staffChat.push({
    author,
    text,
    time: new Date().toLocaleTimeString()
  });

  renderStaff();
}

function renderStaff() {
  const box = document.getElementById("staffLog");
  if (!box) return;

  box.innerText = staffChat
    .slice(-50)
    .map(m => `[${m.time}] ${m.author}: ${m.text}`)
    .join("\n");

  box.scrollTop = box.scrollHeight;
}

// =========================
// PLAYER MESSAGE
// =========================
function sendStaffMessage() {
  const input = document.getElementById("staffInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  addStaffMessage("YOU", text);
  input.value = "";

  setTimeout(() => staffResponse(text), 800);
}

// =========================
// STAFF RESPONSE AI
// =========================
function staffResponse(msg) {
  msg = msg.toLowerCase();

  let reply = "Noted.";

  if (msg.includes("hello")) reply = "We are online.";
  if (msg.includes("who")) reply = "We are monitoring you.";
  if (msg.includes("help")) reply = "Stand by.";
  if (msg.includes("error")) reply = "Checking system logs.";

  const staff =
    staffProfiles[Math.floor(Math.random() * staffProfiles.length)];

  setTimeout(() => {
    addStaffMessage(staff.name, reply);
  }, 600);
}

// =========================
// SMILE SYSTEM
// =========================
function unlockSmile() {
  systemSpeak("MISTER SMILE DETECTED");
  openWindow("smileWindow");
}

function sendSmile() {
  const input = document.getElementById("chatInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  appendSmile("YOU: " + text);
  smileMemory.push(text);

  input.value = "";

  setTimeout(() => {
    appendSmile("MISTER SMILE: ...I am still here.");
  }, 800);
}

function appendSmile(t) {
  const log = document.getElementById("chatLog");
  if (!log) return;

  log.innerText += "\n" + t;
  log.scrollTop = log.scrollHeight;
}

// =========================
// CLOCK
// =========================
setInterval(() => {
  const c = document.getElementById("clock");
  if (c) c.innerText = new Date().toLocaleTimeString();
}, 1000);

// =========================
// BOOT TRIGGER
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const boot = setInterval(() => {
    progress += 5;

    const bar = document.getElementById("bootProgress");
    const txt = document.getElementById("loadText");
    const st = document.getElementById("bootStatus");

    if (bar) bar.style.width = progress + "%";
    if (txt) txt.innerText = progress + "%";
    if (st) st.innerText = "Loading system modules...";

    if (progress >= 100) {
      clearInterval(boot);

      setTimeout(() => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("login").style.display = "block";
      }, 800);
    }
  }, 200);
});
