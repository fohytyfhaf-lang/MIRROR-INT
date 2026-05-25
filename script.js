// =========================
// MIRROR-INT ARG SYSTEM
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

let smileStarted = false;
let smileUnlocked = false;
let smileMemory = [];

let systemLog = [];

// =========================
// SYSTEM SPEAK (SAFE)
// =========================
function systemSpeak(msg) {
  systemLog.push("[SYSTEM] " + msg);

  const mem = document.getElementById("memory");
  if (!mem) return;

  mem.innerText = updateMemory();
}

// =========================
// MEMORY ENGINE
// =========================
function updateMemory() {

  let minutes = Math.floor((Date.now() - profile.start) / 60000);

  let text = "";

  if (profile.actions > 10) text += "HIGH INTERACTION DETECTED\n";
  if (profile.secret > 0) text += "UNAUTHORIZED FILE ACCESS\n";
  if (minutes >= 1) text += "LONG OBSERVATION SESSION\n";

  if (!text) text = "USER STATUS: NORMAL\nNO ANOMALIES";

  const logs = systemLog.slice(-5).join("\n");

  return text + "\n\n" + logs;
}

// =========================
// MISTER SMILE
// =========================
function openSmileChat() {

  const chat = document.getElementById("smileChat");
  if (!chat) return;

  if (!systemBooted) {
    systemSpeak("SYSTEM NOT READY");
    return;
  }

  if (accessLevel < 1) {
    systemSpeak("ACCESS DENIED");
    return;
  }

  chat.style.display = "block";
  systemSpeak("CONNECTION ESTABLISHED");

  if (!smileStarted) {
    smileStarted = true;
    appendSmile("MISTER SMILE: Good evening, detective.");
    appendSmile("MISTER SMILE: I am already watching the system with you.");
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

  setTimeout(() => respondSmile(text), 600);
}

function respondSmile(msg) {

  msg = msg.toLowerCase();
  const history = smileMemory.join(" ").toLowerCase();

  let replies = [];

  if (msg.includes("name") || msg.includes("who")) {
    replies = [
      "I am Mister Smile.",
      "A gentleman without a public record.",
      "You may call me what you wish."
    ];
  }

  else if (msg.includes("mirror") || msg.includes("cult")) {
    replies = [
      "That subject is restricted.",
      "Not everything reflected is safe."
    ];
    systemSpeak("WARNING: RESTRICTED TOPIC");
  }

  else if (history.includes("help")) {
    replies = [
      "I am helping in ways you cannot yet see.",
      "Observe more carefully."
    ];
  }

  else {
    replies = [
      "I understand.",
      "Continue.",
      "Noted."
    ];
  }

  const reply = replies[Math.floor(Math.random() * replies.length)];
  appendSmile("MISTER SMILE: " + reply);
}

function appendSmile(text) {

  const log = document.getElementById("chatLog");
  if (!log) return;

  log.innerText += "\n" + text;
  log.scrollTop = log.scrollHeight;
}

// =========================
// BOOT SYSTEM
// =========================
document.addEventListener("DOMContentLoaded", () => {

  const bootMessages = [
    "Loading kernel modules...",
    "Checking archive integrity...",
    "Connecting to observation network...",
    "Loading cameras...",
    "Decrypting logs...",
    "Starting interface...",
    "Synchronizing memory...",
    "Launching MIRROR-INT..."
  ];

  const boot = setInterval(() => {

    const bar = document.getElementById("bootProgress");
    const text = document.getElementById("loadText");
    const status = document.getElementById("bootStatus");

    if (!bar || !text || !status) return;

    progress += Math.floor(Math.random() * 8) + 2;
    if (progress > 100) progress = 100;

    text.innerText = progress + "%";
    bar.style.width = progress + "%";

    status.innerText =
      bootMessages[Math.floor(Math.random() * bootMessages.length)];

    if (progress >= 100) {

      clearInterval(boot);

      setTimeout(() => {

        document.getElementById("loading").style.display = "none";
        document.getElementById("login").style.display = "block";

        systemBooted = true;
        systemSpeak("SYSTEM INITIALIZED");

      }, 1000);
    }

  }, 250);
});

// =========================
// CLOCK
// =========================
setInterval(() => {
  const clock = document.getElementById("clock");
  if (!clock) return;

  clock.innerText =
    "TIME: " + new Date().toLocaleTimeString();
}, 1000);

// =========================
// LOGIN SYSTEM
// =========================
function loginSystem() {

  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;
  const status = document.getElementById("loginStatus");

  let success = false;

  if (user === "operator" && pass === "0404") {
    accessLevel = 1;
    status.innerText = "ACCESS GRANTED: OPERATOR";
    success = true;
  }

  else if (user === "research" && pass === "void") {
    accessLevel = 2;
    status.innerText = "ACCESS GRANTED: RESEARCHER";
    success = true;
  }

  else if (user === "omega" && pass === "mirror") {
    accessLevel = 3;
    status.innerText = "OMEGA CLEARANCE GRANTED";
    success = true;
  }

  else {
    accessLevel = 0;
    status.innerText = "ACCESS DENIED";
    systemSpeak("FAILED LOGIN ATTEMPT");
  }

  if (success) {

    setTimeout(() => {

      document.getElementById("login").style.display = "none";
      document.getElementById("screen").style.display = "block";

      startSystem();
      systemSpeak("USER AUTHENTICATED");

    }, 1000);
  }
}

// =========================
// FILES
// =========================
const files = {
  log: `INCIDENT LOG
UNKNOWN SIGNAL DETECTED
SECTOR: 04
STATUS: UNSTABLE
NOTE: OBSERVATION ACTIVE`,

  subject: `SUBJECT REPORT
ENTITY CLASS: UNKNOWN
BEHAVIOR: OBSERVED
STATUS: MEMORY CORRUPTION`
};

// =========================
// STAFF CHAT SYSTEM
// =========================

const staffProfiles = [

{
  name: "HARRIS",
  mood: "aggressive"
},

{
  name: "MILA",
  mood: "careful"
},

{
  name: "ETHAN",
  mood: "nervous"
},

{
  name: "LUCY",
  mood: "quiet"
}

];

// =========================
// FILE VIEW
// =========================
function openFile(type) {

  const viewer = document.getElementById("viewer");
  if (!viewer) return;

  if (type === "log") viewer.innerText = files.log;

  else if (type === "subject") {
    if (accessLevel < 1) {
      systemSpeak("ACCESS LEVEL REQUIRED");
      return;
    }
    viewer.innerText = files.subject;
  }

  profile.actions++;
  updateMemory();
}

// =========================
// SECRET FILE
// =========================
function openSecret() {

  profile.secret++;

  if (accessLevel < 3) {
    systemSpeak("OMEGA ACCESS REQUIRED");
    return;
  }

  let pass = prompt("ENTER OMEGA KEY:");

  if (pass === "MIRROR") {
    document.getElementById("viewer").innerText =
`OMEGA FILE UNLOCKED

SUBJECT: ENTITY-0
STATUS: ACTIVE`;

    systemSpeak("OMEGA FILE ACCESSED");
  } else {
    systemSpeak("INVALID KEY");
  }

  updateMemory();
}

// =========================
// ACCESS LEVELS
// =========================
function increaseAccess() {
  if (accessLevel < 3) {
    accessLevel++;
    systemSpeak("ACCESS LEVEL " + accessLevel);
  }
}

// =========================
// CLICK OBSERVATION
// =========================
document.addEventListener("click", () => {

  profile.actions++;
  updateMemory();

  if (profile.secret >= 2 && !smileUnlocked) {
    smileUnlocked = true;
    openSmileChat();
  }

  if (profile.actions === 5) increaseAccess();
  if (profile.actions === 15) increaseAccess();
  if (profile.actions === 30) increaseAccess();
});

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

    if (accessLevel === 0) {
      cam.src = "images/cam_idle.gif";
    }

    else if (accessLevel <= 2) {

      if (r < 0.5) {
        cam.src = "images/cam_glitch.gif";
        instability++;
      } else {
        cam.src = "images/cam_alert.gif";
        instability += 2;
      }
    }

    else {
      cam.src = "images/cam_secret.gif";
      systemSpeak("SYSTEM OBSERVING USER");
    }

    if (instability > 6) {
      cam.src = "images/cam_secret.gif";
      systemSpeak("ENTITY IN FRAME");
      instability = 0;
    }

  }, 2500);
}
