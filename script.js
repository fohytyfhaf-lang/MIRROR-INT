// =========================
// MIRROR INT V7 FIXED CORE
// =========================

let accessLevel = 0;
let loggedIn = false;

// memory
let systemLog = [];
let staffChat = [];

// cameras
let camIndex = 0;
const cameras = [
  "https://i.imgur.com/8QfQx.gif",
  "https://i.imgur.com/3ZQ3Z8B.gif",
  "https://i.imgur.com/7ZQ7Z7Z.gif"
];

let progress = 0;

document.addEventListener("DOMContentLoaded", () => {

  const boot = setInterval(() => {

    progress += 3;

    const bar = document.getElementById("bootProgress");
    const txt = document.getElementById("loadText");
    const st = document.getElementById("bootStatus");

    if (bar) bar.style.width = progress + "%";
    if (txt) txt.innerText = progress + "%";

    if (progress < 40) st.innerText = "loading system core...";
    else if (progress < 80) st.innerText = "checking memory integrity...";
    else st.innerText = "starting interface...";

    if (progress >= 100) {
      clearInterval(boot);

      setTimeout(() => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("login").style.display = "block";
      }, 600);
    }

  }, 80);

});



// =========================
// CLOCK
// =========================
setInterval(() => {
  const c = document.getElementById("clock");
  if (c) c.innerText = new Date().toLocaleTimeString();
}, 1000);

// =========================
// LOGIN
// =========================
function login() {
  document.getElementById("desktop").style.display = "block";
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if (u === "operator" && p === "0404") accessLevel = 1;
  else if (u === "research" && p === "void") accessLevel = 2;
  else if (u === "omega" && p === "mirror") accessLevel = 3;
  else {
    alert("ACCESS DENIED");
    return;
  }

  loggedIn = true;

  document.getElementById("login").style.display = "none";
  document.getElementById("main").style.display = "block";

  systemLog.push("SYSTEM ONLINE");

  startStaffAI();
}

// =========================
// WINDOWS
// =========================
function openWin(id) {
  const w = document.getElementById(id);
  if (w) w.style.display = "block";
}

function closeWin(id) {
  const w = document.getElementById(id);
  if (w) w.style.display = "none";
}

// =========================
// CAMERA SWITCH
// =========================
function switchCam() {
  camIndex = (camIndex + 1) % cameras.length;
  document.getElementById("cam").src = cameras[camIndex];
}

// =========================
// STAFF CHAT SYSTEM
// =========================
function addStaff(author, text) {
  staffChat.push(`[${author}] ${text}`);

  const box = document.getElementById("staffLog");
  if (box) {
    box.innerText = staffChat.slice(-30).join("\n");
    box.scrollTop = box.scrollHeight;
  }
}

// =========================
// PLAYER MESSAGE
// =========================
function sendStaffMessage() {
  const input = document.getElementById("staffInput");
  if (!input) return;

  const msg = input.value.trim();
  if (!msg) return;

  addStaff("YOU", msg);
  input.value = "";

  setTimeout(() => staffReply(msg), 800);
}

// =========================
// STAFF REPLY AI
// =========================
function staffReply(msg) {
  msg = msg.toLowerCase();

  let reply = "Noted.";

  if (msg.includes("hello")) reply = "We are online.";
  else if (msg.includes("who")) reply = "Monitoring system active.";
  else if (msg.includes("help")) reply = "Stand by.";
  else if (msg.includes("error")) reply = "Checking logs...";

  const names = ["HARRIS", "MILA", "ETHAN", "LUCY"];
  const name = names[Math.floor(Math.random() * names.length)];

  addStaff(name, reply);
}

// =========================
// LIVE STAFF AI (LONG DELAY STORY CHAT)
// =========================
function startStaffAI() {

  const scenes = [
    [
      { t: 0, a: "HARRIS", m: "System feels… wrong today." },
      { t: 4000, a: "MILA", m: "I noticed delays in logs." },
      { t: 9000, a: "ETHAN", m: "Did anyone else hear that sound?" },
      { t: 14000, a: "LUCY", m: "Stay focused." },
      { t: 20000, a: "HARRIS", m: "Something is inside the system." }
    ],
    [
      { t: 0, a: "MILA", m: "I can't sleep after last shift." },
      { t: 5000, a: "ETHAN", m: "Same… I keep thinking about cameras." },
      { t: 10000, a: "LUCY", m: "We are just observers." }
    ]
  ];

  function run() {
    const scene = scenes[Math.floor(Math.random() * scenes.length)];

    scene.forEach(m => {
      setTimeout(() => addStaff(m.a, m.m), m.t);
    });

    setTimeout(run, 25000);
  }

  run();
}

// =========================
// SMILE CHAT (SIMPLE FIX)
// =========================
function sendSmile() {
  const input = document.getElementById("chatInput");
  if (!input) return;

  const msg = input.value.trim();
  if (!msg) return;

  const box = document.getElementById("chatLog");
  box.innerText += "\nYOU: " + msg;

  input.value = "";

  setTimeout(() => {
    box.innerText += "\nSMILE: ...observing";
  }, 1000);
}
