f// =========================
// MIRROR-INT SYSTEM
// script.js
// =========================


// ===== ЧАСЫ =====

function updateClock() {

  const now = new Date();

  document.getElementById("clock").innerText =
    "LOCAL TIME: " + now.toLocaleTimeString();
}

setInterval(updateClock, 1000);

updateClock();


// ===== ПАПКА =====

function toggleFolder() {

  const folder =
    document.getElementById("folderContent");

  if (folder.style.display === "none") {

    folder.style.display = "block";

    addLog("ARCHIVE DIRECTORY OPENED");

  } else {

    folder.style.display = "none";

    addLog("ARCHIVE DIRECTORY CLOSED");
  }
}


// ===== ДОКУМЕНТЫ =====

const files = {

  log:
`INCIDENT LOG

03:41 AM

UNKNOWN SIGNAL DETECTED

STATUS:
UNRESOLVED

NOTES:
SIGNAL SOURCE UNKNOWN
SECTOR 04 OFFLINE`,



  subject:
`SUBJECT REPORT

ENTITY ID:
UNKNOWN

BEHAVIOR:
UNSTABLE

THREAT LEVEL:
MEDIUM

NOTES:
SUBJECT REACTS TO LIGHT
MEMORY LOSS DETECTED`
};


// ===== ОТКРЫТИЕ ФАЙЛОВ =====

function openFile(type) {

  document.getElementById("viewer").innerText =
    files[type];

  addLog("FILE OPENED: " + type.toUpperCase());
}


// ===== СЕКРЕТНЫЙ ДОКУМЕНТ =====

function openSecretFile() {

  let password =
    prompt("ENTER ACCESS PASSWORD:");

  if (password === "MIRROR") {

    document.getElementById("viewer").innerText =
`OMEGA DOCUMENT

ACCESS GRANTED

SUBJECT STATUS:
ACTIVE

WARNING:
MEMORY CORRUPTION DETECTED

NOTES:
DO NOT TRUST VISUAL FEED

LAST MESSAGE:
"IT IS STILL ALIVE"`;


    addLog("OMEGA DOCUMENT ACCESSED");

    glitchEffect();

  } else {

    addLog("FAILED ACCESS ATTEMPT");

    alert("ACCESS DENIED");
  }
}


// ===== ЛОГИ =====

function addLog(text) {

  const logBox =
    document.getElementById("logBox");

  logBox.innerHTML += "\n> " + text;

  logBox.scrollTop =
    logBox.scrollHeight;
}


// ===== АВТО-ЛОГИ =====

const randomLogs = [

  "SIGNAL INTERRUPTION DETECTED",

  "MEMORY SECTOR FAILURE",

  "ARCHIVE RESPONSE DELAY",

  "UNKNOWN PROCESS RUNNING",

  "VISUAL FEED CORRUPTED",

  "ENTITY MOVEMENT DETECTED",

  "AUDIO CHANNEL LOST",

  "CAMERA FEED UNSTABLE"

];

setInterval(() => {

  if (Math.random() > 0.7) {

    let pick =
      randomLogs[
        Math.floor(Math.random() * randomLogs.length)
      ];

    addLog(pick);
  }

}, 5000);


// ===== ГЛИЧ ЭФФЕКТ =====

function glitchEffect() {

  const title =
    document.querySelector(".title");

  title.style.transform =
    "translateX(2px)";

  setTimeout(() => {

    title.style.transform =
      "translateX(-2px)";

  }, 50);

  setTimeout(() => {

    title.style.transform =
      "translateX(0px)";

  }, 100);
}


// ===== СЛУЧАЙНЫЕ ГЛИЧИ =====

setInterval(() => {

  if (Math.random() > 0.85) {

    glitchEffect();

  }

}, 3000);


// ===== СКРЫТАЯ ARG ПОДСКАЗКА =====

let secretCounter = 0;

document.body.addEventListener("click", () => {

  secretCounter++;

  if (secretCounter === 10) {

    addLog("HIDDEN MESSAGE DETECTED");

    addLog("CODE FRAGMENT: MIR");

  }

  if (secretCounter === 20) {

    addLog("SECOND FRAGMENT FOUND");

    addLog("CODE FRAGMENT: ROR");
  }

});


// ===== СКРЫТИЕ ПАПКИ ПРИ ЗАГРУЗКЕ =====

document.getElementById("folderContent").style.display =
  "none";


// ===== СТАРТОВЫЕ ЛОГИ =====

setTimeout(() => {

  addLog("BOOT SEQUENCE COMPLETE");

}, 1000);


setTimeout(() => {

  addLog("ARCHIVE MODULE LOADED");

}, 2000);


setTimeout(() => {

  addLog("WARNING: 1 CORRUPTED FILE DETECTED");

}, 3500);
