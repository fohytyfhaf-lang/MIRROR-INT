// =========================
// MIRROR-INT ARG SYSTEM
// LIVING SYSTEM VERSION
// =========================

/* =========================
   BOOT SEQUENCE
========================= */
let progress = 0;

const boot = setInterval(() => {
  progress += Math.floor(Math.random() * 12);

  const loadText = document.getElementById("loadText");
  if (loadText) loadText.innerText = progress + "%";

  if (progress >= 100) {
    clearInterval(boot);

    const loading = document.getElementById("loading");
    const screen = document.getElementById("screen");

    if (loading) loading.style.display = "none";
    if (screen) screen.style.display = "block";

    startSystem();
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

function openFile(type) {
  const viewer = document.getElementById("viewer");
  if (!viewer) return;

  viewer.innerText = files[type] || "FILE NOT FOUND";

  profile.actions++;
  updateMemory();
}


/* =========================
   SECRET FILE (ARG EVENT)
========================= */
function openSecret() {
  profile.secret++;

  let pass = prompt("ENTER ACCESS KEY:");

  if (pass === "MIRROR") {
    document.getElementById("viewer").innerText =
      "OMEGA FILE UNLOCKED\n\nENTITY CONFIRMED:\nIT IS WATCHING BACK";

    triggerGlitch();

    setTimeout(() => {
      systemSpeak("YOU SHOULD NOT HAVE DONE THAT");
    }, 3000);

  } else {
    systemSpeak("ACCESS DENIED");
  }

  updateMemory();
}


/* =========================
   CAMERA SYSTEM (LIVING)
========================= */
function startSystem() {
  const cam = document.getElementById("cam");
  if (!cam) return;

  let instability = 0;

    cam.src = "images/cam_secret.gif";
    systemSpeak("INITIAL SIGNAL DETECTED");
  }, 8000);

  setInterval(() => {
    let r = Math.random();

    if (r < 0.4) {
      cam.src = "images/cam_idle.gif";
      systemSpeak("SYSTEM STABLE");
    }

    else if (r < 0.75) {
      cam.src = "images/cam_glitch.gif";
      instability++;
    }

    else {
      cam.src = "images/cam_alert.gif";
      instability += 2;
      systemSpeak("MOVEMENT DETECTED");
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
let profile = {
  actions: 0,
  secret: 0,
  start: Date.now()
};


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
    "[SYSTEM]\n" + msg + "\n\n" + mem.innerText;
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
document.addEventListener("click", () => {
  profile.actions++;
  updateMemory();
});


/* =========================
   STARTUP MEMORY STATE
========================= */
setTimeout(() => systemSpeak("OBSERVATION STARTED"), 1000);
setTimeout(() => systemSpeak("USER DETECTED"), 2500);
setTimeout(() => systemSpeak("CAMERAS ONLINE"), 4000);
