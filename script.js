// =========================
// MIRROR-INT ARG SYSTEM
// LIVING SYSTEM VERSION
// =========================

/* =========================
   BOOT SEQUENCE
========================= */
let progress = 0;
let accessLevel = 0;
let systemBooted = false;

let profile = {
  actions: 0,
  secret: 0,
  start: Date.now()
};
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

// 0 = guest
// 1 = operator
// 2 = researcher
// 3 = omega clearance
const boot = setInterval(() => {
  progress += Math.floor(Math.random() * 12);

  const loadText = document.getElementById("loadText");
  if (loadText) loadText.innerText = progress + "%";

  if (progress >= 100) {
    clearInterval(boot);
    systemBooted = true;

    const loading = document.getElementById("loading");
    const login = document.getElementById("login");

    if (loading) loading.style.display = "none";
    if (login) login.style.display = "block";

    systemSpeak("SYSTEM INITIALIZED");
  }
}, 150);
/* =========================
   CLOCK SYSTEM
========================= */
setInterval(() => {
  const clock = document.getElementById("clock");
  if (!clock) return;

  clock.innerText = "TIME: " + new Date().toLocaleTimeString();
}, 1000);


/* =========================
   FILE SYSTEM (ARG)
========================= */


function openFile(type) {
  const viewer = document.getElementById("viewer");
  if (!viewer) return;

  // 📁 LOG — доступен всем
  if (type === "log") {
    viewer.innerText = files[type];
  }

  // 📁 SUBJECT — только level 1+
  else if (type === "subject") {
    if (accessLevel < 1) {
      systemSpeak("ACCESS LEVEL REQUIRED: 1");
      return;
    }
    viewer.innerText = files[type];
  }

  profile.actions++;
  updateMemory();
}

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

    const screen = document.getElementById("screen");
    if (screen) screen.style.display = "block";

    setTimeout(() => {
      startSystem();
      systemSpeak("USER AUTHENTICATED");
    }, 300);

  }, 1200);
}
/* =========================
   SECRET FILE (ARG EVENT)
========================= */
function openSecret() {
  profile.secret++;

  if (accessLevel < 3) {
    systemSpeak("OMEGA ACCESS REQUIRED (LEVEL 3)");
    return;
  }

  let pass = prompt("ENTER OMEGA KEY:");

  if (pass === "MIRROR") {
    document.getElementById("viewer").innerText =
`OMEGA FILE UNLOCKED

SUBJECT: ENTITY-0
STATUS: ACTIVE

NOTE:
USER HAS REACHED SYSTEM CORE
OBSERVATION LOOP COMPLETE`;

    systemSpeak("OMEGA FILE ACCESSED");
    triggerGlitch();
  } else {
    systemSpeak("INVALID OMEGA KEY");
  }

  updateMemory();
}
function increaseAccess() {
  if (accessLevel < 3) {
    accessLevel++;
    systemSpeak("ACCESS LEVEL UPGRADED: " + accessLevel);
  }
} 
document.addEventListener("click", () => {
  profile.actions++;
  updateMemory();

  if (profile.actions === 5) increaseAccess();
  if (profile.actions === 15) increaseAccess();
  if (profile.actions === 30) increaseAccess();
});
setInterval(() => {
  if (accessLevel === 3) {
    systemSpeak("SYSTEM NOTICE: USER IS NOW PART OF CORE OBSERVATION");
  }
}, 20000);
/* =========================
   CAMERA SYSTEM (LIVING)
========================= */
function startSystem() {
  const cam = document.getElementById("cam");
  if (!cam) return;

  let instability = 0;

  setTimeout(() => {
    cam.src = "images/cam_secret.gif";
    systemSpeak("INITIAL SIGNAL DETECTED");
  }, 8000);

  setInterval(() => {

    // ❗ СИСТЕМА НЕ АКТИВНА ДО BOOT
    if (!systemBooted) return;

    let r = Math.random();

    // 🟢 GUEST
    if (accessLevel === 0) {
      cam.src = "images/cam_idle.gif";
    }

    // 🟡 OPERATOR / RESEARCHER
    else if (accessLevel === 1 || accessLevel === 2) {
      if (r < 0.5) {
        cam.src = "images/cam_glitch.gif";
        instability++;
      } else {
        cam.src = "images/cam_alert.gif";
        instability += 2;
      }
    }

    // 🔴 OMEGA
    else if (accessLevel === 3) {
      cam.src = "images/cam_secret.gif";
      systemSpeak("SYSTEM OBSERVING USER DIRECTLY");
    }

    if (instability > 6) {
      cam.src = "images/cam_secret.gif";
      systemSpeak("ENTITY IN FRAME");
      instability = 0;
    }

  }, 2500);
}
/* =========================
   🧠 PLAYER MEMORY (ARG PROFILE)
========================= */


/* =========================
   MEMORY ENGINE (TEXT THAT FEELS ALIVE)
========================= */
function updateMemory() {
  const mem = document.getElementById("memory");
  if (!mem) return;

  let minutes = Math.floor((Date.now() - profile.start) / 60000);

  let text = "";

  if (profile.actions > 10) {
    text += "HIGH INTERACTION DETECTED\n";
  }

  if (profile.secret > 0) {
    text += "UNAUTHORIZED FILE ACCESS\n";
  }

  if (minutes >= 1) {
    text += "LONG OBSERVATION SESSION\n";
  }

  if (text === "") {
    text = "USER STATUS: NORMAL\nNO ANOMALIES";
  }

  mem.innerText = text;
}


/* =========================
   SYSTEM VOICE (ARG TEXT EVENTS)
========================= */
function systemSpeak(msg) {
  const mem = document.getElementById("memory");
  if (!mem) return;

  mem.innerText =
    mem.innerText +
    "\n[SYSTEM] " + msg;
}

/* =========================
   GLITCH EFFECT
========================= */
function triggerGlitch() {
  const body = document.body;

  body.style.filter = "contrast(1.3) brightness(0.8)";

  setTimeout(() => {
    body.style.filter = "none";
  }, 150);
}


/* =========================
   CLICK OBSERVATION (ARG)
========================= */



/* =========================
   STARTUP MEMORY STATE
========================= */
setTimeout(() => systemSpeak("OBSERVATION STARTED"), 1000);
setTimeout(() => systemSpeak("USER DETECTED"), 2500);
setTimeout(() => systemSpeak("CAMERAS ONLINE"), 4000);
