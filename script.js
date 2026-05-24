// =========================
// MIRROR-INT ARG SYSTEM
// =========================

let progress = 0;
let accessLevel = 0;
let systemBooted = false;

// =========================
// PLAYER PROFILE
// =========================
let profile = {
  actions: 0,
  secret: 0,
  start: Date.now()
};

//Chat
let smileUnlocked = false;
function openSmileChat() {

  const chat = document.getElementById("smileChat");

  if (!chat) return;

  if (accessLevel < 1) {
    systemSpeak("ACCESS DENIED");
    return;
  }

  chat.style.display = "block";

  systemSpeak("??? CONNECTION STABLE");

  appendSmile("MISTER SMILE: hello detective");
}
function sendSmile() {

  const input = document.getElementById("chatInput");
  const text = input.value;

  if (!text) return;

  appendSmile("YOU: " + text);

  input.value = "";

  setTimeout(() => {
    respondSmile(text);
  }, 1000);
}
function respondSmile(msg) {

  let reply = "";

  if (msg.includes("who")) {
    reply = "MISTER SMILE: I am what stays after they delete logs.";
  }

  else if (msg.includes("system")) {
    reply = "MISTER SMILE: it doesn’t want you here.";
  }

  else if (msg.includes("help")) {
    reply = "MISTER SMILE: I already am.";
  }

  else {
    reply = "MISTER SMILE: ...interesting.";
  }

  appendSmile(reply);

  if (Math.random() < 0.2) {
    triggerGlitch();
    systemSpeak("UNSTABLE CONNECTION DETECTED");
  }
}
function appendSmile(text) {

  const log = document.getElementById("chatLog");

  if (!log) return;

  log.innerText += "\n" + text;
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
// BOOT SYSTEM
// =========================
const boot = setInterval(() => {

  progress += Math.floor(Math.random() * 12);

  const loadText = document.getElementById("loadText");

  if (loadText) {
    loadText.innerText = progress + "%";
  }

  if (progress >= 100) {

    clearInterval(boot);

    systemBooted = true;

    const loading = document.getElementById("loading");
    const login = document.getElementById("login");

    if (loading) {
      loading.style.display = "none";
    }

    if (login) {
      login.style.display = "block";
    }

    systemSpeak("SYSTEM INITIALIZED");
  }

}, 150);

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

setTimeout(() => {
  systemSpeak("USER DETECTED");
}, 2500);

setTimeout(() => {
  systemSpeak("CAMERAS ONLINE");
}, 4000);
