// =========================
// MIRROR-INT WINDOWS 95 ARG
// CLEAN VERSION
// =========================

// ---------- SYSTEM ----------
let progress = 0;
let accessLevel = 0;
let systemBooted = false;

// ---------- INTRO ----------
const hackLines = [

  "[OK] accessing system core...",
  "[OK] bypassing security layer...",
  "[OK] injecting MIRROR protocol...",
  "[OK] override successful...",
  "[WARNING] unknown entity detected...",
  "[OK] boot sequence modified..."

];

// ---------- CAMERA ----------
let currentCam = 0;

const cameras = [

  {
    name: "CAMERA 01 / MAIN HALL",
    src: "images/cam_hall.gif"
  },

  {
    name: "CAMERA 02 / ARCHIVE",
    src: "images/cam_glitch.gif"
  },

  {
    name: "CAMERA 03 / STORAGE",
    src: "images/cam_storage.gif"
  },

  {
    name: "CAMERA 04 / OFFICE",
    src: "images/cam_office.gif"
  },

  {
    name: "CAMERA 05 / LAB",
    src: "images/cam_lab.gif"
  },

  {
    name: "CAMERA 06 / SERVER ROOM",
    src: "images/cam_server.gif"
  },

  {
    name: "CAMERA 07 / ALERT",
    src: "images/cam_alert.gif"
  },

  {
    name: "CAMERA 08 / RESTRICTED",
    src: "images/cam_secret.gif"
  }

];

// ---------- MEMORY ----------
let systemLog = [];
let staffMessages = [];

// ---------- FILES ----------
const files = {

  log: `
INCIDENT LOG / 04

03:14 AM

Unknown movement detected
inside sector hallway.

Audio corrupted.

Staff requested lockdown.

STATUS:
UNRESOLVED
`,

  subject: `
SUBJECT REPORT

Entity:
UNKNOWN

Behavior:
Observes operators through
inactive cameras.

Several staff members
reported hearing whispers.

STATUS:
ACTIVE
`,

  research: `
RESEARCH NOTES

Project MIRROR started
in 1998.

Purpose:
Behavior monitoring.

After first activation,
multiple disappearances
were reported.

Internal archives sealed.
`

};

// =========================
// START INTRO
// =========================

document.addEventListener("DOMContentLoaded", () => {

  startIntro();

});

// =========================
// INTRO
// =========================

function startIntro() {

  const bios =
    document.getElementById("biosScreen");

  const hack =
    document.getElementById("hackScreen");

  const hackText =
    document.getElementById("hackText");

  bios.style.display = "block";

  setTimeout(() => {

    bios.style.display = "none";

    hack.style.display = "block";

    let i = 0;

    const interval = setInterval(() => {

      if(i < hackLines.length){

        hackText.innerText +=
          hackLines[i] + "\n";

        i++;

      }

      else{

        clearInterval(interval);

        setTimeout(() => {

          hack.style.display = "none";

          startBoot();

        }, 1000);

      }

    }, 500);

  }, 2000);

}

// =========================
// BOOT
// =========================

function startBoot() {

  progress = 0;

  document.getElementById(
    "bootSound"
  ).play();

  const boot = setInterval(() => {

    progress += 0.5;

    const bar =
      document.getElementById("bootProgress");

    const text =
      document.getElementById("loadText");

    const status =
      document.getElementById("bootStatus");

    if(bar){
      bar.style.width =
        progress + "%";
    }

    if(text){
      text.innerText =
        Math.floor(progress) + "%";
    }

    const logs = [

      "Loading HIMEM.SYS...",
      "Initializing system memory...",
      "Checking hardware...",
      "Loading device drivers...",
      "Starting UI subsystem...",
      "Mounting system registry...",
      "Launching MIRROR-INT..."

    ];

    status.innerText =
      logs[
        Math.floor(progress / 15)
      ] || logs[logs.length - 1];

    if(progress >= 100){

      clearInterval(boot);

      setTimeout(() => {

        document.getElementById(
          "loading"
        ).style.display = "none";

        document.getElementById(
          "login"
        ).style.display = "flex";

      }, 1000);

    }

  }, 250);

}

// =========================
// LOGIN
// =========================

function loginSystem(){

  const user =
    document.getElementById("user").value;

  const pass =
    document.getElementById("pass").value;

  const status =
    document.getElementById("loginStatus");

  let ok = false;

  if(user === "operator" &&
     pass === "0404"){

    accessLevel = 1;
    ok = true;

  }

  else if(user === "research" &&
          pass === "void"){

    accessLevel = 2;
    ok = true;

  }

  else if(user === "omega" &&
          pass === "mirror"){

    accessLevel = 3;
    ok = true;

  }

  if(!ok){

    status.innerText =
      "ACCESS DENIED";

    return;

  }

  status.innerText =
    "ACCESS GRANTED";

  setTimeout(() => {

    document.getElementById(
      "login"
    ).style.display = "none";

    document.getElementById(
      "screen"
    ).style.display = "block";

    systemBooted = true;

    systemSpeak(
      "SYSTEM ONLINE"
    );

    startClock();

    startStaffAI();

    updateMemory();

  }, 1000);

}

// =========================
// WINDOWS
// =========================

function openWindow(id){

  const sound =
    document.getElementById(
      "clickSound"
    );

  if(sound){

    sound.currentTime = 0;
    sound.play();

  }

  const w =
    document.getElementById(id);

  if(w){

    w.style.display = "block";

  }

}

function closeWindow(id){

  const w =
    document.getElementById(id);

  if(w){

    w.style.display = "none";

  }

}

// =========================
// CLOCK
// =========================

function startClock(){

  setInterval(() => {

    const c =
      document.getElementById("clock");

    if(c){

      c.innerText =
        new Date().toLocaleTimeString();

    }

  }, 1000);

}

// =========================
// MEMORY
// =========================

function systemSpeak(text){

  systemLog.push(
    "[SYSTEM] " + text
  );

  updateMemory();

}

function updateMemory(){

  const mem =
    document.getElementById("memory");

  if(!mem) return;

  mem.innerText =
    systemLog.slice(-12).join("\n");

}

// =========================
// CAMERA
// =========================

function switchCamera(dir){

  currentCam += dir;

  if(currentCam < 0){

    currentCam =
      cameras.length - 1;

  }

  if(currentCam >= cameras.length){

    currentCam = 0;

  }

  const cam =
    document.getElementById("cam");

  const name =
    document.getElementById("cameraName");

  if(cam){

    cam.src =
      cameras[currentCam].src;

  }

  if(name){

    name.innerText =
      cameras[currentCam].name;

  }

}

// =========================
// FILES
// =========================

function openFile(type){

  const viewer =
    document.getElementById("viewer");

  if(!viewer) return;

  if(files[type]){

    viewer.innerText =
      files[type];

    systemSpeak(
      "OPENED FILE: " +
      type.toUpperCase()
    );

  }

}

function openOmega(){

  const viewer =
    document.getElementById("viewer");

  if(accessLevel < 3){

    viewer.innerText =
`
ACCESS DENIED

OMEGA CLEARANCE REQUIRED
`;

    return;

  }

  viewer.innerText =
`
OMEGA FILE

Project MIRROR was never
shut down.

The operators are being
observed in real time.

MISTER SMILE IS ACTIVE.

DO NOT TRUST
THE CAMERAS.
`;

}

// =========================
// STAFF CHAT
// =========================

function addStaffMessage(author,text){

  staffMessages.push(
    `[${author}] ${text}`
  );

  renderStaffChat();

}

function renderStaffChat(){

  const box =
    document.getElementById("staffLog");

  if(!box) return;

  box.innerText =
    staffMessages.slice(-40).join("\n");

  box.scrollTop =
    box.scrollHeight;

}

// =========================
// STAFF AI
// =========================

function startStaffAI(){

  const messages = [

    ["HARRIS",
     "System feels unstable again."],

    ["MILA",
     "Archive cameras keep freezing."],

    ["ETHAN",
     "Did someone open restricted files?"],

    ["LUCY",
     "Stop discussing this here."]

  ];

  setInterval(() => {

    const msg =
      messages[
        Math.floor(
          Math.random() *
          messages.length
        )
      ];

    addStaffMessage(
      msg[0],
      msg[1]
    );

  }, 7000);

}

// =========================
// MISTER SMILE
// =========================

function sendSmile(){

  const input =
    document.getElementById("chatInput");

  const log =
    document.getElementById("chatLog");

  if(!input || !log) return;

  const text =
    input.value.trim();

  if(!text) return;

  log.innerText +=
    "\nYOU: " + text;

  input.value = "";

  setTimeout(() => {

    log.innerText +=
      "\nSMILE: ...watching";

  }, 1500);

}

// =========================
// GAME
// =========================

let gameStarted = false;

document.addEventListener(
  "keydown",
  e => {

    if(
      e.code === "Space" &&
      gameStarted
    ){

      e.preventDefault();

    }

  }
);
