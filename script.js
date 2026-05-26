// =========================
// MIRROR-INT WINDOWS 95 ARG
// =========================

// ---------- SYSTEM ----------
let progress = 0;
let accessLevel = 0;
let systemBooted = false;

// ---------- CAMERA ----------
let currentCam = 0;

const cameras = [
  {
    name: "CAMERA 01 / HALL",
    src: "images/cam_idle.gif"
  },

  {
    name: "CAMERA 02 / ARCHIVE",
    src: "images/cam_glitch.gif"
  },

  {
    name: "CAMERA 03 / RESTRICTED",
    src:
 },

  {
name: "CAMERA 04 / RESTRICTED",
    src: 
 },

  {
    name: "CAMERA 05 / RESTRICTED",
    src: 
 },

  {
name: "CAMERA 06 / RESTRICTED",
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

document.addEventListener("DOMContentLoaded", () => {

  const boot = setInterval(() => {

    progress += 4;

    const bar = document.getElementById("bootProgress");
    const text = document.getElementById("loadText");
    const status = document.getElementById("bootStatus");

    if(bar) bar.style.width = progress + "%";
    if(text) text.innerText = progress + "%";

    if(progress < 30){
      status.innerText = "Loading modules...";
    }

    else if(progress < 60){
      status.innerText = "Checking memory...";
    }

    else if(progress < 90){
      status.innerText = "Starting camera systems...";
    }

    else{
      status.innerText = "Launching MIRROR-INT...";
    }

    if(progress >= 100){

      clearInterval(boot);

      setTimeout(() => {

        document.getElementById("loading").style.display = "none";

        document.getElementById("login").style.display = "flex";

      }, 700);
    }

  }, 120);

});

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

  name.innerText =
    cameras[currentCam].name;
}

function startCameraGlitch(){

  setInterval(() => {

    if(accessLevel >= 2){

      const r = Math.random();

      if(r < 0.2){

        const cam =
          document.getElementById("cam");

        cam.style.opacity = "0.4";

        setTimeout(() => {
          cam.style.opacity = "1";
        }, 200);

      }

    }

  }, 3000);
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

      if (o.x < -40)
        obstacles.splice(i,1);
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

if (collected >= 5) {

  systemLog.push(
    "[GAME] OMEGA ACCESS RESTORED"
  );

  updateMemory();

  gameStarted = false;

  // открыть архив
  openWindow("archiveWindow");

  // открыть smile
  openWindow("smileWindow");

  // сообщение smile
  appendSmile(
    "MISTER SMILE: You were never supposed to find this."
  );

  // показать секретный файл
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

  // глюк камер
  document.getElementById(
    "cam"
  ).src =
    "images/cam_secret.gif";

  // memory warning
  document.getElementById(
    "memory"
  ).innerText +=
    "\n\n[WARNING]\nOMEGA ACCESS GRANTED";

  // alert
  setTimeout(() => {

    alert(
      "OMEGA FILE UNLOCKED"
    );

  }, 500);

}

      }

      if (f.x < -20)
        fragments.splice(i,1);
    }

    requestAnimationFrame(loop);

  }

  loop();

}

// jump
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
