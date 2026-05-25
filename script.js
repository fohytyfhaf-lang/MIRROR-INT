// =========================
// MIRROR-INT V95 SYSTEM
// =========================

let progress = 0;
let accessLevel = 0;
let currentCamera = 0;

let systemLog = [];
let staffMessages = [];

const cameraList = [
  {
    name: "CAMERA 01 / HALLWAY",
    src: "images/cam_idle.gif"
  },

  {
    name: "CAMERA 02 / STORAGE",
    src: "images/cam_glitch.gif"
  },

  {
    name: "CAMERA 03 / OMEGA",
    src: "images/cam_secret.gif"
  }
];

// =========================
// FILES
// =========================

const files = {

  log: `
INCIDENT LOG / 07

Unknown movement detected
inside sector hallway.

Staff member ETHAN
reported hearing voices
through inactive speakers.

STATUS:
UNRESOLVED
`,

  subject: `
SUBJECT REPORT

Entity designation:
"MISTER SMILE"

Observed:
- appears in reflections
- causes memory loss
- active mostly at night

WARNING:
avoid direct interaction
`,

  research: `
RESEARCH NOTES

The system memory
continues rewriting itself.

Old files disappear.

Some employees claim
the cameras move on their own.
`
};

// =========================
// BOOT SYSTEM
// =========================

document.addEventListener("DOMContentLoaded", () => {

  const boot = setInterval(() => {

    progress += 4;

    const bar =
      document.getElementById("bootProgress");

    const txt =
      document.getElementById("loadText");

    const status =
      document.getElementById("bootStatus");

    if (bar)
      bar.style.width = progress + "%";

    if (txt)
      txt.innerText = progress + "%";

    if (progress < 30)
      status.innerText =
      "Loading system core...";

    else if (progress < 60)
      status.innerText =
      "Checking archives...";

    else if (progress < 90)
      status.innerText =
      "Connecting cameras...";

    else
      status.innerText =
      "Starting interface...";

    if (progress >= 100) {

      clearInterval(boot);

      setTimeout(() => {

        document.getElementById("loading")
          .style.display = "none";

        document.getElementById("login")
          .style.display = "flex";

      }, 900);
    }

  }, 120);

});

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

  let ok = false;

  if (
    user === "operator" &&
    pass === "0404"
  ) {
    accessLevel = 1;
    ok = true;
  }

  else if (
    user === "research" &&
    pass === "void"
  ) {
    accessLevel = 2;
    ok = true;
  }

  else if (
    user === "omega" &&
    pass === "mirror"
  ) {
    accessLevel = 3;
    ok = true;
  }

  if (!ok) {

    status.innerText =
      "ACCESS DENIED";

    return;
  }

  status.innerText =
    "ACCESS GRANTED";

  setTimeout(() => {

    document.getElementById("login")
      .style.display = "none";

    document.getElementById("screen")
      .style.display = "block";

    updateMemory();

    startClock();

    startStaffChat();

    checkSmile();

  }, 1200);

}

// =========================
// WINDOWS
// =========================

function openWindow(id) {

  const w =
    document.getElementById(id);

  if (w)
    w.style.display = "block";
}

function closeWindow(id) {

  const w =
    document.getElementById(id);

  if (w)
    w.style.display = "none";
}

// =========================
// CAMERA SYSTEM
// =========================

function switchCamera(dir) {

  currentCamera += dir;

  if (currentCamera < 0)
    currentCamera =
    cameraList.length - 1;

  if (currentCamera >= cameraList.length)
    currentCamera = 0;

  const cam =
    document.getElementById("cam");

  const name =
    document.getElementById("cameraName");

  cam.src =
    cameraList[currentCamera].src;

  name.innerText =
    cameraList[currentCamera].name;
}

// =========================
// FILE VIEWER
// =========================

function openFile(type) {

  const viewer =
    document.getElementById("viewer");

  if (!viewer) return;

  viewer.innerText =
    files[type];
}

// =========================
// OMEGA FILE
// =========================

function openOmega() {

  const viewer =
    document.getElementById("viewer");

  if (accessLevel < 3) {

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

The entity was never found.

It was invited.

All cameras connected
to sector 04 eventually
begin showing the same face.

Do not let it speak alone
with the operator.
`;
}

// =========================
// STAFF CHAT
// =========================

function addStaffMessage(author, msg) {

  staffMessages.push(
    `[${author}] ${msg}`
  );

  const box =
    document.getElementById("staffLog");

  if (!box) return;

  box.innerText =
    staffMessages.slice(-40).join("\n");

  box.scrollTop =
    box.scrollHeight;
}

// =========================
// STAFF AI
// =========================

function startStaffChat() {

  const scenes = [

    [
      {
        t: 0,
        a: "HARRIS",
        m: "System feels unstable again."
      },

      {
        t: 5000,
        a: "MILA",
        m: "Camera 03 keeps glitching."
      },

      {
        t: 10000,
        a: "ETHAN",
        m: "I heard voices yesterday."
      },

      {
        t: 16000,
        a: "LUCY",
        m: "Do not discuss that here."
      }
    ],

    [
      {
        t: 0,
        a: "MILA",
        m: "Did anyone sleep?"
      },

      {
        t: 6000,
        a: "ETHAN",
        m: "Not after reading the Omega logs."
      },

      {
        t: 12000,
        a: "HARRIS",
        m: "Those files should be deleted."
      },

      {
        t: 17000,
        a: "LUCY",
        m: "Nothing deletes anymore."
      }
    ]
  ];

  function runScene() {

    const scene =
      scenes[
        Math.floor(
          Math.random() *
          scenes.length
        )
      ];

    scene.forEach(msg => {

      setTimeout(() => {

        addStaffMessage(
          msg.a,
          msg.m
        );

      }, msg.t);

    });

    setTimeout(runScene, 26000);
  }

  runScene();
}

// =========================
// PLAYER CHAT
// =========================

function sendStaffMessage() {

  const input =
    document.getElementById("staffInput");

  if (!input) return;

  const text =
    input.value.trim();

  if (!text) return;

  addStaffMessage(
    "YOU",
    text
  );

  input.value = "";

  setTimeout(() => {

    addStaffMessage(
      "HARRIS",
      "Message received."
    );

  }, 1000);
}

// =========================
// SMILE CHAT
// =========================

function sendSmile() {

  const input =
    document.getElementById("chatInput");

  const log =
    document.getElementById("chatLog");

  if (!input || !log) return;

  const text =
    input.value.trim();

  if (!text) return;

  log.innerText +=
    "\nYOU: " + text;

  input.value = "";

  setTimeout(() => {

    log.innerText +=
      "\nMISTER SMILE: I can still see you.";

    log.scrollTop =
      log.scrollHeight;

  }, 1400);
}

// =========================
// NIGHT EVENT
// =========================

function checkSmile() {

  const hour =
    new Date().getHours();

  if (hour >= 1 && hour <= 4) {

    setTimeout(() => {

      addStaffMessage(
        "SYSTEM",
        "Unknown user connected."
      );

      openWindow("smileWindow");

    }, 20000);
  }
}

// =========================
// MEMORY
// =========================

function updateMemory() {

  const mem =
    document.getElementById("memory");

  if (!mem) return;

  mem.innerText =
`
SYSTEM STATUS: ONLINE

ACTIVE USER LEVEL:
${accessLevel}

CAMERAS CONNECTED:
${cameraList.length}

ARCHIVE STATUS:
STABLE

OMEGA STATUS:
RESTRICTED
`;
}

// =========================
// CLOCK
// =========================

function startClock() {

  setInterval(() => {

    const c =
      document.getElementById("clock");

    if (!c) return;

    c.innerText =
      new Date().toLocaleTimeString();

  }, 1000);
}

// =========================
// MINI GAME
// =========================

function fakeHack() {

  const game =
    document.getElementById("gameText");

  if (!game) return;

  game.innerText =
`
CONNECTING...

BYPASSING SECURITY...

ACCESSING STAFF DATABASE...

ACCESS GRANTED
`;
}
