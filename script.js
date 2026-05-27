// =========================
// MIRROR-INT WINDOWS 95 ARG
// =========================

// ---------- SYSTEM ----------
let progress = 0;
let accessLevel = 0;
let systemBooted = false;
let hackLines = [
  "[OK] accessing system core...",
  "[OK] bypassing security layer...",
  "[OK] injecting MIRROR protocol...",
  "[OK] override successful...",
  "[WARNING] unknown entity detected...",
  "[OK] boot sequence modified..."
];

function win95BootBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  function beep(time, freq, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  const start = ctx.currentTime + 0.1;

  beep(start + 0.0, 880, 0.12);
  beep(start + 0.2, 880, 0.12);
  beep(start + 0.4, 660, 0.18);
}


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
let smileMemory = [];

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
// BOOT SYSTEM
// =========================
function startBoot() {

  progress = 0;
  
document.getElementById(
  "bootSound"
).play();
  
  const boot = setInterval(() => {

    progress += 0.4;

    const bar = document.getElementById("bootProgress");
    const text = document.getElementById("loadText");
    const status = document.getElementById("bootStatus");

    if (bar) bar.style.width = progress + "%";
    if (text) text.innerText = Math.floor(progress) + "%";

   const logs = [
  "Loading HIMEM.SYS...",
  "Initializing system memory...",
  "Checking hardware...",
  "Loading device drivers...",
  "Starting UI subsystem...",
  "Mounting system registry..."
];

status.innerText = logs[Math.floor(progress / 15)] || logs[logs.length - 1];
    if (progress >= 100) {

      clearInterval(boot);

      setTimeout(() => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("login").style.display = "flex";
      }, 1000);

    }

  }, 220);
}

// =========================
// LOGIN SYSTEM
// =========================

function loginSystem(){

  const user =
    document.getElementById("user").value;

  const pass =
    document.getElementById("pass").value;

  const status =
    document.getElementById("loginStatus");

  let ok = false;

  if(user === "operator" && pass === "0404"){
    accessLevel = 1;
    ok = true;
  }

  else if(user === "research" && pass === "void"){
    accessLevel = 2;
    ok = true;
  }

  else if(user === "omega" && pass === "mirror"){
    accessLevel = 3;
    ok = true;
  }

  if(!ok){

    status.innerText = "ACCESS DENIED";

    return;
  }

  status.innerText = "ACCESS GRANTED";

  
  setTimeout(() => {

    document.getElementById("login").style.display = "none";

    document.getElementById("screen").style.display = "block";

    systemBooted = true;

    systemSpeak("SYSTEM ONLINE");

    startClock();

    startStaffAI();

    startCameraGlitch();

    updateMemory();

  }, 800);
}

// =========================
// WINDOWS
// =========================

function openWindow(id){
   document.getElementById(
    "clickSound"
  ).play();

  const w = document.getElementById(id);

  if(w){
    w.style.display = "block";
  }
}

function closeWindow(id){

  const w = document.getElementById(id);

  if(w){
    w.style.display = "none";
  }
}

// =========================
// CLOCK
// =========================

function startClock(){

  setInterval(() => {

    const c = document.getElementById("clock");

    if(c){
      c.innerText =
        new Date().toLocaleTimeString();
    }

  }, 1000);
}

// =========================
// MEMORY SYSTEM
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
    systemLog.slice(-10).join("\n");
}

// =========================
// CAMERA SYSTEM
// =========================

function switchCamera(dir){

  currentCam += dir;

  if(currentCam < 0){
    currentCam = cameras.length - 1;
  }

  if(currentCam >= cameras.length){
    currentCam = 0;
  }

  const cam =
    document.getElementById("cam");

  const name =
    document.getElementById("cameraName");

  cam.src = cameras[currentCam].src;

cam.style.filter = "brightness(1.2) contrast(1.3)";

setTimeout(() => {

  cam.style.filter = "none";

}, 120);


  name.innerText =
    cameras[currentCam].name;
}

function startCameraGlitch(){

  setInterval(() => {

    const cam =
      document.getElementById("cam");

    if(!cam) return;

    const r = Math.random();

    // лёгкий glitch
    if(r < 0.25){

      cam.style.opacity = "0.4";
      
      document.getElementById(
  "glitchSound"
).play();
      
      setTimeout(() => {

        cam.style.opacity = "1";

      }, 120);

    }

    // VHS noise
   // VHS noise
if(r < 0.12){

  document.getElementById(
    "glitchSound"
  ).play();

 cam.src =
  "images/noise.gif?" + Date.now();

  setTimeout(() => {

    cam.src =
      cameras[currentCam].src;

  }, 350);

}

    // secret camera override
    if(r < 0.05 &&
       accessLevel >= 2){

      cam.src =
        "images/cam_secret.gif";

      systemSpeak(
        "UNKNOWN CAMERA SIGNAL DETECTED"
      );

      setTimeout(() => {

        cam.src =
          cameras[currentCam].src;

      }, 1000);

    }

  }, 4000);

}
// =========================
// FILE SYSTEM
// =========================

function openFile(type){

  const viewer =
    document.getElementById("viewer");

  if(!viewer) return;

  if(files[type]){

    viewer.innerText = files[type];

    systemSpeak(
      "OPENED FILE: " + type.toUpperCase()
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

    systemSpeak("OMEGA ACCESS FAILED");

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

  systemSpeak("OMEGA FILE OPENED");
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

  const scenes = [

    [
      ["HARRIS","System feels unstable again."],
      ["MILA","Archive cameras keep freezing."],
      ["ETHAN","Did someone open restricted files?"],
      ["LUCY","Stop discussing this here."]
    ],

    [
      ["MILA","I stayed overnight yesterday."],
      ["ETHAN","You too?"],
      ["MILA","I heard footsteps near camera 03."],
      ["HARRIS","Ignore it."]
    ],

    [
      ["ETHAN","Do you think the operators can read this?"],
      ["LUCY","Hopefully not."],
      ["HARRIS","Keep focus on work."]
    ]

  ];

  function playScene(){

    const s =
      scenes[Math.floor(Math.random()*scenes.length)];

    s.forEach((m,i) => {

      setTimeout(() => {

        addStaffMessage(m[0],m[1]);

      }, i * 5000);

    });

    setTimeout(playScene,30000);
  }

  playScene();
}

// =========================
// PLAYER MESSAGE
// =========================

function sendStaffMessage(){

  const input =
    document.getElementById("staffInput");

  if(!input) return;

  const text =
    input.value.trim();

  if(!text) return;

  addStaffMessage("YOU",text);

  input.value = "";

  setTimeout(() => {

    respondStaff(text);

  }, 1200);
}

function respondStaff(msg){

  msg = msg.toLowerCase();

  let response =
    "Message logged.";

  if(msg.includes("hello")){
    response = "Hello operator.";
  }

  else if(msg.includes("mirror")){
    response = "Do not discuss MIRROR here.";
  }

  else if(msg.includes("camera")){
    response = "Camera feeds are unstable.";
  }

  else if(msg.includes("smile")){
    response = "Restricted topic.";
  }

  const staff = [
    "HARRIS",
    "MILA",
    "ETHAN",
    "LUCY"
  ];

  const name =
    staff[Math.floor(Math.random()*staff.length)];

  addStaffMessage(name,response);
}

// =========================
// MISTER SMILE CHAT
// =========================

function sendSmile(){

  const input =
    document.getElementById("chatInput");

  if(!input) return;

  const text =
    input.value.trim();

  if(!text) return;

  appendSmile(
    "YOU: " + text
  );

  input.value = "";

  setTimeout(() => {

    respondSmile(text);

  }, 2000);
}

function appendSmile(text){

  const log =
    document.getElementById("chatLog");

  log.innerText +=
    "\n" + text;

  log.scrollTop =
    log.scrollHeight;
}

function respondSmile(msg){

  msg = msg.toLowerCase();

  let reply =
    "...watching";

  if(msg.includes("who")){
    reply = "You already know me.";
  }

  else if(msg.includes("hello")){
    reply = "Good evening.";
  }

  else if(msg.includes("mirror")){
    reply = "The mirror is open.";
  }

  else if(msg.includes("help")){
    reply = "Nobody can help now.";
  }

  appendSmile(
    "SMILE: " + reply
  );
}

// =========================
// MINI GAME
// =========================

function fakeHack(){

  const game =
    document.getElementById("gameText");

  game.innerText =
`
CONNECTING TO NODE...

BYPASSING FIREWALL...

ACCESSING ARCHIVE...

ACCESS GRANTED
`;

  setTimeout(() => {

    game.innerText +=
`

SECRET FOUND:
OMEGA ACTIVE
`;

  }, 3000);
}

// =========================
// VOID RUNNER GAME
// =========================

let gameStarted = false;

let player = {
  x: 40,
  y: 180,
  w: 20,
  h: 20,
  vy: 0,
  jump: false
};

let obstacles = [];
let fragments = [];

let score = 0;
let collected = 0;

let hiddenCode = ["4", "0", "4", "A", "X"];

function startGame() {

  if (gameStarted) return;

  gameStarted = true;

  const canvas =
    document.getElementById("gameCanvas");

  const ctx =
    canvas.getContext("2d");

  obstacles = [];
  fragments = [];

  collected = 0;

  document.getElementById(
    "fragmentCount"
  ).innerText = "0";

  document.getElementById(
    "codeDisplay"
  ).innerText = "CODE: -----";

  player.y = 180;
  player.vy = 0;

  function spawnObstacle() {

    obstacles.push({
      x: 700,
      y: 190,
      w: 20,
      h: 40
    });

  }

  function spawnFragment() {

    fragments.push({
      x: 700,
      y: 120 + Math.random() * 60,
      char:
        hiddenCode[
          Math.floor(
            Math.random() *
            hiddenCode.length
          )
        ]
    });

  }

  let obstacleTimer =
    setInterval(spawnObstacle, 1800);

  let fragmentTimer =
    setInterval(spawnFragment, 3500);

  function loop() {

    if (!gameStarted) return;

    ctx.clearRect(0,0,700,250);

    // floor
    ctx.fillStyle = "#00ff99";

    ctx.fillRect(0,210,700,3);

    // player
    ctx.fillRect(
      player.x,
      player.y,
      player.w,
      player.h
    );

    // gravity
    player.vy += 0.6;

    player.y += player.vy;

    if (player.y > 180) {

      player.y = 180;

      player.jump = false;
    }

    // obstacles
    for (
      let i = obstacles.length - 1;
      i >= 0;
      i--
    ) {

      let o = obstacles[i];

      o.x -= 6;

      ctx.fillRect(
        o.x,
        o.y,
        o.w,
        o.h
      );

      // collision
      if (
        player.x < o.x + o.w &&
        player.x + player.w > o.x &&
        player.y < o.y + o.h &&
        player.y + player.h > o.y
      ) {

        clearInterval(obstacleTimer);
        clearInterval(fragmentTimer);

        gameStarted = false;

        alert(
          "SYSTEM FAILURE\nCollected: " +
          collected
        );

        return;
      }

      if (o.x < -40) {

        obstacles.splice(i,1);

      }

    }

    // fragments
    for (
      let i = fragments.length - 1;
      i >= 0;
      i--
    ) {

      let f = fragments[i];

      f.x -= 5;

      ctx.fillStyle = "#ffffff";

      ctx.font = "20px Courier New";

      ctx.fillText(
        f.char,
        f.x,
        f.y
      );

      // collect
      if (
        player.x < f.x + 20 &&
        player.x + player.w > f.x &&
        player.y < f.y &&
        player.y + player.h > f.y - 20
      ) {

        collected++;

        document.getElementById(
          "fragmentCount"
        ).innerText = collected;

        let current =
          document.getElementById(
            "codeDisplay"
          ).innerText;

        document.getElementById(
          "codeDisplay"
        ).innerText =
          current.replace("-", f.char);

        fragments.splice(i,1);

        // WIN
        if (collected >= 5) {

          clearInterval(obstacleTimer);
          clearInterval(fragmentTimer);

          gameStarted = false;

          systemLog.push(
            "[GAME] OMEGA ACCESS RESTORED"
          );

          updateMemory();

          openWindow("archiveWindow");

          openWindow("smileWindow");

          appendSmile(
            "MISTER SMILE: You were never supposed to find this."
          );

          const viewer =
            document.getElementById("viewer");

          viewer.innerText = `OMEGA FILE

CLASSIFIED LEVEL: OMEGA

PROJECT:
MIRROR-INT

STATUS:
FAILED CONTAINMENT

SUBJECT:
MISTER SMILE

NOTES:

The entity learned to use
the system infrastructure.

Staff members reported:

- voices from inactive rooms
- rewritten archives
- movement inside camera loops
- messages sent without users

FINAL NOTE:

DO NOT LET IT REACH
THE OPERATOR.

END OF FILE`;

          document.getElementById(
            "cam"
          ).src =
            "images/cam_secret.gif";

          document.getElementById(
            "memory"
          ).innerText +=
            "\n\n[WARNING]\nOMEGA ACCESS GRANTED";

          setTimeout(() => {
            
document.getElementById(
    "alertSound"
  ).play();

            alert(
              "OMEGA FILE UNLOCKED"
            );

          }, 500);

        }

      }

      if (f.x < -20) {

        fragments.splice(i,1);

      }

    }

    requestAnimationFrame(loop);

  }

  loop();

}

document.addEventListener(
  "keydown",
  e => {

    if (
      e.code === "Space" &&
      !player.jump &&
      gameStarted
    ) {

      player.vy = -11;

      player.jump = true;

    }

  }
);

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById(
    "bootSound"
  ).volume = 0.3;

  document.getElementById(
    "clickSound"
  ).volume = 0.4;

  document.getElementById(
    "glitchSound"
  ).volume = 0.25;

  document.getElementById(
    "alertSound"
  ).volume = 0.5;

  startIntro();

});

function startIntro() {

  const bios =
    document.getElementById("biosScreen");

  const hack =
    document.getElementById("hackScreen");

  const hackText =
    document.getElementById("hackText");

  bios.style.display = "block";

  document.getElementById("bootSound").play().catch(() => {});
  
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

        }, 800);

      }

    }, 400);

  }, 1500);

}
