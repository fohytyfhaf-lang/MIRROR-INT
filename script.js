let progress = 0;

/* =========================
   BOOT SYSTEM
========================= */
const loader = setInterval(() => {

  progress += Math.floor(Math.random() * 12);

  document.getElementById("loadText").innerText = progress + "%";

  if (progress >= 100) {
    clearInterval(loader);

    document.getElementById("loading").style.display = "none";
    document.getElementById("screen").style.display = "block";

    startSystem();
  }

}, 150);


/* =========================
   CLOCK
========================= */
setInterval(() => {
  document.getElementById("clock").innerText =
    "TIME: " + new Date().toLocaleTimeString();
}, 1000);


/* =========================
   FILE SYSTEM
========================= */
const files = {
  log: `INCIDENT LOG
UNKNOWN SIGNAL DETECTED
SECTOR OFFLINE
STATUS: UNSTABLE`,

  subject: `SUBJECT REPORT
ENTITY: UNKNOWN
BEHAVIOR: OBSERVED
MEMORY LOSS DETECTED`
};

function openFile(type) {
  document.getElementById("viewer").innerText = files[type];
  profile.clicks++;
  updateMemory();
}

function openSecret() {

  profile.secretAttempts++;

  let pass = prompt("ENTER ACCESS PASSWORD");

  if (pass === "MIRROR") {
    document.getElementById("viewer").innerText =
      "OMEGA FILE UNLOCKED\nENTITY CONFIRMED ACTIVE";

    document.getElementById("memory").innerText =
      "WARNING: ENTITY IS AWARE OF OBSERVATION";

  } else {
    alert("ACCESS DENIED");
  }

  updateMemory();
}


/* =========================
   CAMERA SYSTEM
========================= */
function startSystem() {

  const cam = document.getElementById("cam");
  const memory = document.getElementById("memory");

  let instability = 0;

  setInterval(() => {

    let r = Math.random();

    if (r < 0.4) {
      cam.src = "images/cam_idle.gif";
    }

    else if (r < 0.7) {
      cam.src = "images/cam_glitch.gif";
      instability++;
    }

    else {
      cam.src = "images/cam_alert.gif";
      instability += 2;
    }

    if (instability > 6) {
      cam.src = "images/cam_secret.gif";

      memory.innerText =
        "MEMORY CORRUPTION DETECTED\nSUBJECT IS BEING STUDIED";

      instability = 0;
    }

  }, 3000);
}


/* =========================
   🧠 ARG SYSTEM (ТЫ)
========================= */
let profile = {
  clicks: 0,
  secretAttempts: 0,
  startTime: Date.now()
};


/* 👁 наблюдение за действиями */
document.addEventListener("click", () => {
  profile.clicks++;
  updateMemory();
});


/* =========================
   MEMORY ENGINE (ARG TEXT)
========================= */
function updateMemory() {

  let memory = document.getElementById("memory");

  let minutes = Math.floor((Date.now() - profile.startTime) / 60000);

  let msg = "";

  if (profile.clicks > 15) {
    msg += "HIGH INTERACTION LEVEL DETECTED\n";
  }

  if (profile.secretAttempts > 0) {
    msg += "UNAUTHORIZED ACCESS ATTEMPTS RECORDED\n";
  }

  if (minutes >= 1) {
    msg += "LONG OBSERVATION SESSION ACTIVE\n";
  }

  if (msg === "") {
    msg = "USER STATUS: NORMAL\nNO ANOMALIES DETECTED";
  }

  memory.innerText = msg;
}
