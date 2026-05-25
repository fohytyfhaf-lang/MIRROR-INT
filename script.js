// =========================
// MIRROR-INT CORE SYSTEM
// =========================

let progress = 0;
let accessLevel = 0;
let systemBooted = false;
let cameraStarted = false;

let profile = {
  actions: 0,
  secret: 0,
  start: Date.now()
};

// =========================
// MEMORY + LOGS
// =========================

let systemLog = [];
let staffChat = [];
let smileMemory = [];

let smileStarted = false;
let smileUnlocked = false;

// =========================
// STAFF DATA
// =========================

const staffProfiles = [
  { name: "HARRIS", mood: "aggressive" },
  { name: "MILA", mood: "careful" },
  { name: "ETHAN", mood: "nervous" },
  { name: "LUCY", mood: "quiet" }
];

let playerName = "OPERATOR";

// =========================
// SYSTEM SPEAK
// =========================

function systemSpeak(msg) {
  systemLog.push("[SYSTEM] " + msg);
  const mem = document.getElementById("memory");
  if (mem) mem.innerText = updateMemory();
}

// =========================
// MEMORY ENGINE
// =========================

function updateMemory() {
  let minutes = Math.floor((Date.now() - profile.start) / 60000);

  let text = "";

  if (profile.actions > 10) text += "HIGH INTERACTION DETECTED\n";
  if (profile.secret > 0) text += "UNAUTHORIZED ACCESS\n";
  if (minutes >= 1) text += "LONG SESSION\n";

  if (!text) text = "USER STATUS: NORMAL\nNO ANOMALIES";

  return text + "\n\n" + systemLog.slice(-5).join("\n");
}

// =========================
// STAFF CHAT SYSTEM
// =========================

function addStaffMessage(author, text, type = "normal") {
  staffChat.push({
    author,
    text,
    type,
    time: new Date().toLocaleTimeString()
  });

  renderStaffChat();
}

function renderStaffChat() {
  const box = document.getElementById("staffLog");
  if (!box) return;

  box.innerText = staffChat
    .slice(-40)
    .map(m => `[${m.time}] ${m.author}: ${m.text}`)
    .join("\n");

  box.scrollTop = box.scrollHeight;
}

// =========================
// STAFF AI
// =========================
function staffAI() {

  const dialogue = [
    {
      author: "HARRIS",
      text: "System is unstable again...",
      delay: 0
    },
    {
      author: "MILA",
      text: "I noticed it too. Logs are corrupted.",
      delay: 3000
    },
    {
      author: "ETHAN",
      text: "Are we sure the operator is not the cause?",
      delay: 7000
    },
    {
      author: "LUCY",
      text: "Do not jump to conclusions.",
      delay: 11000
    },
    {
      author: "HARRIS",
      text: "Still... something is watching back.",
      delay: 15000
    }
  ];

  function runDialogue(index = 0) {

    if (index >= dialogue.length) {
      // пауза между “разговорами”
      setTimeout(() => staffAI(), 8000);
      return;
    }

    const msg = dialogue[index];

    setTimeout(() => {

      addStaffMessage(msg.author, msg.text);

      runDialogue(index + 1);

    }, msg.delay);
  }

  runDialogue();
}

// =========================
// PLAYER CHAT INPUT (FIX)
// =========================

function sendStaffMessage() {
  const input = document.getElementById("staffInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  // сообщение игрока
  addStaffMessage("YOU", text);
  input.value = "";

  // реакция сотрудников
  setTimeout(() => staffResponse(text), 600);
}

// =========================
// STAFF RESPONSE SYSTEM
// =========================

function staffResponse(msg) {

  msg = msg.toLowerCase();

  let replies = [];

  // простая логика живого чата
  if (msg.includes("hello") || msg.includes("hi")) {
    replies = [
      "We are online.",
      "System acknowledges operator.",
      "Hello."
    ];
  }

  else if (msg.includes("who")) {
    replies = [
      "We are monitoring personnel.",
      "You are under observation.",
      "Staff unit active."
    ];
  }

  else if (msg.includes("help")) {
    replies = [
      "Request received.",
      "We will analyze your situation.",
      "Stand by."
    ];
  }

  else if (msg.includes("error") || msg.includes("bug")) {
    replies = [
      "System instability detected.",
      "We are checking logs.",
      "Possible anomaly."
    ];
  }

  else if (msg.includes("smile")) {
    replies = [
      "Do not mention that entity.",
      "Restricted topic.",
      "We are watching."
    ];
  }

  else {
    replies = [
      "Noted.",
      "Continue.",
      "Message logged."
    ];
  }

  const staff =
    staffProfiles[Math.floor(Math.random() * staffProfiles.length)];

  const reply =
    replies[Math.floor(Math.random() * replies.length)];

  setTimeout(() => {
    addStaffMessage(staff.name, reply);
  }, 500);
}
// =========================
// MISTER SMILE CHAT
// =========================

function openSmileChat() {
  const chat = document.getElementById("smileChat");
  if (!chat) return;

  if (!systemBooted) return systemSpeak("SYSTEM NOT READY");
  if (accessLevel < 1) return systemSpeak("ACCESS DENIED");

  chat.style.display = "block";
  systemSpeak("SMILE CONNECTION OPENED");

  if (!smileStarted) {
    smileStarted = true;
    appendSmile("MISTER SMILE: Good evening.");
  }
}

function sendSmile() {
  const input = document.getElementById("chatInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  appendSmile("YOU: " + text);
  smileMemory.push(text);

  if (smileMemory.length > 12) smileMemory.shift();

  input.value = "";

  setTimeout(() => respondSmile(text), 500);
}

function respondSmile(msg) {
  msg = msg.toLowerCase();
  const history = smileMemory.join(" ").toLowerCase();

  let replies;

  if (msg.includes("who")) {
    replies = ["I am Mister Smile.", "Nobody important.", "Just observing."];
  }
  else if (msg.includes("mirror")) {
    systemSpeak("RESTRICTED TOPIC");
    replies = ["Do not ask that.", "Some doors stay closed."];
  }
  else if (history.includes("help")) {
    replies = ["I help silently.", "You will understand later."];
  }
  else {
    replies = ["Understood.", "Continue.", "Noted."];
  }

  appendSmile("MISTER SMILE: " + replies[Math.floor(Math.random() * replies.length)]);
}

function appendSmile(t) {
  const log = document.getElementById("chatLog");
  if (!log) return;
  log.innerText += "\n" + t;
  log.scrollTop = log.scrollHeight;
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

 if (ok) {
  status.innerText = "ACCESS GRANTED";

  setTimeout(() => {
    document.getElementById("login").style.display = "none";
    document.getElementById("screen").style.display = "block";

    systemBooted = true;
    systemSpeak("SYSTEM ONLINE");

    if (accessLevel >= 1) startSystem();
    if (accessLevel >= 2) staffAI();
    if (accessLevel >= 3) unlockSmile();

  }, 800);

} else {
  status.innerText = "ACCESS DENIED";
  systemSpeak("FAILED LOGIN");
}

// =========================
// FILE SYSTEM
// =========================

const files = {
  log: "INCIDENT LOG\nUNKNOWN SIGNAL DETECTED\nSECTOR 04\nSTATUS: UNSTABLE",
  subject: "SUBJECT REPORT\nENTITY UNKNOWN\nSTATUS: MEMORY CORRUPTION"
};

function openFile(type) {
  const viewer = document.getElementById("viewer");
  if (!viewer) return;

  if (type === "log") viewer.innerText = files.log;
  else if (type === "subject") {
    if (accessLevel < 1) return systemSpeak("ACCESS REQUIRED");
    viewer.innerText = files.subject;
  }

  profile.actions++;
  updateMemory();
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
// CAMERA SYSTEM
// =========================

function startSystem() {
  if (cameraStarted) return;
  cameraStarted = true;

  const cam = document.getElementById("cam");
  if (!cam) return;

  let instability = 0;

  setInterval(() => {

    if (!systemBooted) return;

    let r = Math.random();

    if (accessLevel === 0) cam.src = "images/cam_idle.gif";
    else if (accessLevel <= 2) {
      cam.src = r < 0.5 ? "images/cam_glitch.gif" : "images/cam_alert.gif";
      instability++;
    } else {
      cam.src = "images/cam_secret.gif";
    }

    if (instability > 6) {
      cam.src = "images/cam_secret.gif";
      systemSpeak("ANOMALY DETECTED");
      instability = 0;
    }

  }, 2500);
}

// =========================
// BOOT SYSTEM
// =========================

document.addEventListener("DOMContentLoaded", () => {

  staffAI();

  const bootMessages = ["Loading...", "Checking system...", "Starting..."];

  const boot = setInterval(() => {

    const bar = document.getElementById("bootProgress");
    const text = document.getElementById("loadText");
    const status = document.getElementById("bootStatus");

    if (!bar || !text || !status) return;

    progress += 5;

    text.innerText = progress + "%";
    bar.style.width = progress + "%";

    status.innerText = bootMessages[Math.floor(Math.random() * bootMessages.length)];

    if (progress >= 100) {
      clearInterval(boot);

      setTimeout(() => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("login").style.display = "block";
        systemBooted = true;
      }, 800);
    }

  }, 200);
});

// =========================
// CLOCK
// =========================

setInterval(() => {
  const c = document.getElementById("clock");
  if (c) c.innerText = new Date().toLocaleTimeString();
}, 1000);
