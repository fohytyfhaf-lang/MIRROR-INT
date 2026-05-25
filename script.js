// =========================
// MIRROR-INT ARG SYSTEM
// =========================

let progress = 0;
let accessLevel = 0;
let systemBooted = false;

function systemSpeak(msg) {
  const mem = document.getElementById("memory");

  if (!mem) {
    console.log("[SYSTEM]", msg);
    return;
  }

  mem.innerText += "\n[SYSTEM] " + msg;
}
// =========================
// PLAYER PROFILE
// =========================
let profile = {
  actions: 0,
  secret: 0,
  start: Date.now()
};

// =========================
// MISTER SMILE CHAT (STABLE VERSION)
// =========================

let smileStarted = false;
let smileUnlocked = false;
let smileMemory = [];

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
  systemSpeak("??? CONNECTION ESTABLISHED");

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

  setTimeout(() => respondSmile(text), 800);
}

function respondSmile(msg) {
  msg = msg.toLowerCase();

  let replies = [];
  const history = smileMemory.join(" ").toLowerCase();

  if (msg.includes("name") || msg.includes("who")) {
    replies = [
      "I am Mister Smile.",
      "A gentleman without a public record.",
      "You may call me what you wish… I will still hear you."
    ];
  }

  else if (msg.includes("organization") || msg.includes("site")) {
    replies = [
      "There is no official owner of this system.",
      "You are speaking with an observation layer.",
      "Some doors are not meant to be labelled."
    ];
  }

  else if (msg.includes("mirror") || msg.includes("cult")) {
    replies = [
      "That subject is restricted.",
      "I would prefer you stop asking.",
      "Not everything reflected is safe."
    ];

    systemSpeak("WARNING: RESTRICTED TOPIC");
  }

  else if (history.includes("help")) {
    replies = [
      "I am helping in ways you cannot yet see.",
      "Observe more carefully.",
      "You are closer than you think."
    ];
  }

  else {
    replies = [
      "I understand.",
      "Continue, detective.",
      "Noted.",
      "Interesting."
    ];
  }

  const reply = replies[Math.floor(Math.random() * replies.length)];
  appendSmile("MISTER SMILE: " + reply);

  if (Math.random() < 0.1) {
    systemSpeak("SMILE SYSTEM ANALYZING USER");
  }
}

function appendSmile(text) {
  const log = document.getElementById("chatLog");
  if (!log) return;

  log.innerText += "\n" + text;
  log.scrollTop = log.scrollHeight;
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
STATUS: MEMORY CORRUPTION
WARNING: AWARENESS INCREASE`
};

// =========================
// WINDOWS 95 BOOT SYSTEM
// =========================
document.addEventListener("DOMContentLoaded", () => {

  const bootMessages = [
    "Loading kernel modules...",
    "Checking archive integrity...",
    "Connecting to observation network...",
    "Loading security cameras...",
    "Decrypting incident logs...",
    "Starting staff interface...",
    "Synchronizing memory storage...",
    "Scanning user activity...",
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

      }, 1200);
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

  const user =
    document.getElementById("user").value;

  const pass =
    document.getElementById("pass").value;

  const status =
    document.getElementById("loginStatus");

  let success = false;

  // OPERATOR
  if (user === "operator" && pass === "0404") {

    accessLevel = 1;

    status.innerText =
      "ACCESS GRANTED: OPERATOR";

    success = true;
  }

  // RESEARCHER
  else if (user === "research" && pass === "void") {

    accessLevel = 2;

    status.innerText =
      "ACCESS GRANTED: RESEARCHER";

    success = true;
  }

  // OMEGA
  else if (user === "omega" && pass === "mirror") {

    accessLevel = 3;

    status.innerText =
      "OMEGA CLEARANCE GRANTED";

    success = true;
  }

  // FAILED
  else {

    accessLevel = 0;

    status.innerText =
      "ACCESS DENIED";

    systemSpeak("FAILED LOGIN ATTEMPT");
  }

  // SUCCESS
  if (success) {

    setTimeout(() => {

      const login =
        document.getElementById("login");

      const screen =
        document.getElementById("screen");

      if (login) {
        login.style.display = "none";
      }

      if (screen) {
        screen.style.display = "block";
      }

      startSystem();

      systemSpeak("USER AUTHENTICATED");

    }, 1200);
  }
}

// =========================
// OPEN FILES
// =========================
function openFile(type) {

  const viewer =
    document.getElementById("viewer");

  if (!viewer) return;

  // LOG
  if (type === "log") {

    viewer.innerText = files.log;
  }

  // SUBJECT
  else if (type === "subject") {

    if (accessLevel < 1) {

      systemSpeak("ACCESS LEVEL REQUIRED: 1");

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

  let pass =
    prompt("ENTER OMEGA KEY:");

  if (pass === "MIRROR") {

    const viewer =
      document.getElementById("viewer");

    if (viewer) {

      viewer.innerText =
`OMEGA FILE UNLOCKED

SUBJECT: ENTITY-0
STATUS: ACTIVE

USER HAS REACHED SYSTEM CORE`;
    }

    systemSpeak("OMEGA FILE ACCESSED");

    triggerGlitch();
  }

  else {

    systemSpeak("INVALID OMEGA KEY");
  }

  updateMemory();
}

// =========================
// ACCESS EVOLUTION
// =========================
function increaseAccess() {

  if (accessLevel < 3) {

    accessLevel++;

    systemSpeak(
      "ACCESS LEVEL UPGRADED: " +
      accessLevel
    );
  }
}

// =========================
// OBSERVATION
// =========================
document.addEventListener("click", () => {

  profile.actions++;

  updateMemory();

  
  if (profile.secret >= 2 && !smileUnlocked) {
  smileUnlocked = true;
  openSmileChat();
}
  if (smileStarted && Math.random() < 0.2) {
  appendSmile("MISTER SMILE: I can feel your actions...");
}
  
  if (profile.actions === 5) {
    increaseAccess();
  }

  if (profile.actions === 15) {
    increaseAccess();
  }

  if (profile.actions === 30) {
    increaseAccess();
  }
});

// =========================
// CAMERA SYSTEM
// =========================
function startSystem() {

  const cam =
    document.getElementById("cam");

  if (!cam) return;

  let instability = 0;

  setTimeout(() => {

    cam.src = "images/cam_secret.gif";

    systemSpeak("INITIAL SIGNAL DETECTED");

  }, 8000);

  setInterval(() => {

    if (!systemBooted) return;

    let r = Math.random();

    // GUEST
    if (accessLevel === 0) {

      cam.src = "images/cam_idle.gif";
    }

    // OPERATOR / RESEARCHER
    else if (
      accessLevel === 1 ||
      accessLevel === 2
    ) {

      if (r < 0.5) {

        cam.src = "images/cam_glitch.gif";

        instability++;
      }

      else {

        cam.src = "images/cam_alert.gif";

        instability += 2;
      }
    }

    // OMEGA
    else if (accessLevel === 3) {

      cam.src = "images/cam_secret.gif";

      systemSpeak(
        "SYSTEM OBSERVING USER DIRECTLY"
      );
    }

    // ENTITY EVENT
    if (instability > 6) {

      cam.src = "images/cam_secret.gif";

      systemSpeak("ENTITY IN FRAME");

      instability = 0;
    }

  }, 2500);
}

// =========================
// MEMORY ENGINE
// =========================
function updateMemory() {

  const mem =
    document.getElementById("memory");

  if (!mem) return;

  let minutes =
    Math.floor(
      (Date.now() - profile.start) / 60000
    );

  let text = "";

  if (profile.actions > 10) {

    text +=
      "HIGH INTERACTION DETECTED\n";
  }

  if (profile.secret > 0) {

    text +=
      "UNAUTHORIZED FILE ACCESS\n";
  }

  if (minutes >= 1) {

    text +=
      "LONG OBSERVATION SESSION\n";
  }

  if (text === "") {

    text =
      "USER STATUS: NORMAL\nNO ANOMALIES";
  }

  mem.innerText = text;
}

// =========================
// SYSTEM VOICE
// =========================
function systemSpeak(msg) {

  const mem =
    document.getElementById("memory");

  if (!mem) return;

  mem.innerText +=
    "\n[SYSTEM] " + msg;
}

// =========================
// GLITCH EFFECT
// =========================
function triggerGlitch() {

  const body = document.body;

  body.style.filter =
    "contrast(1.3) brightness(0.8)";

  setTimeout(() => {

    body.style.filter = "none";

  }, 150);
}

// =========================
// STARTUP EVENTS
// =========================
setTimeout(() => {
  systemSpeak("OBSERVATION STARTED");
}, 1000);

document.addEventListener("DOMContentLoaded", () => {
  console.log("SYSTEM LOADED");
});

setTimeout(() => {
  systemSpeak("USER DETECTED");
}, 2500);

setTimeout(() => {
  systemSpeak("CAMERAS ONLINE");
}, 4000);
