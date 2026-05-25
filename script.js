let accessLevel = 0;
let systemBooted = false;

let playerTalked = false;
let staffPaused = false;

let systemLog = [];
let staffChat = [];

let cameraIndex = 0;

const cameras = [
  "images/cam_idle.gif",
  "images/cam_glitch.gif",
  "images/cam_alert.gif",
  "images/cam_secret.gif"
];
function systemSpeak(msg) {
  systemLog.push("[SYS] " + msg);

  const mem = document.getElementById("memory");
  if (!mem) return;

  const last = systemLog.slice(-6).join("\n");
  mem.innerText = last;
}
function addStaffMessage(author, text) {
  staffChat.push({ author, text, time: new Date().toLocaleTimeString() });
  renderStaff();
}

function renderStaff() {
  const box = document.getElementById("staffLog");
  if (!box) return;

  box.innerText = staffChat
    .slice(-50)
    .map(m => `[${m.time}] ${m.author}: ${m.text}`)
    .join("\n");

  box.scrollTop = box.scrollHeight;
}

function staffAI() {
  if (staffPaused) return;

  const scenes = [
    [
      ["HARRIS", "We have a problem in sector 04."],
      ["MILA", "Logs are changing after each refresh."],
      ["ETHAN", "That’s not possible... right?"],
      ["LUCY", "Stop assuming it's the operator."]
    ],

    [
      ["MILA", "Do you ever feel like the system is aware?"],
      ["ETHAN", "Every night."],
      ["HARRIS", "Don’t say that out loud."],
      ["LUCY", "It already knows."]
    ]
  ];

  const scene = scenes[Math.floor(Math.random() * scenes.length)];

  let i = 0;

  function play() {
    if (i >= scene.length) {
      setTimeout(staffAI, 7000);
      return;
    }

    const [name, text] = scene[i];

    setTimeout(() => {
      addStaffMessage(name, text);
      i++;
      play();
    }, 2500 + Math.random() * 1500);
  }

  play();
}

function sendStaffMessage() {
  const input = document.getElementById("staffInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  playerTalked = true;

  addStaffMessage("YOU", text);
  input.value = "";

  setTimeout(() => staffReaction(text), 800);
}

function staffReaction(msg) {
  msg = msg.toLowerCase();

  let reply = "Noted.";

  if (msg.includes("hello")) reply = "We hear you.";
  if (msg.includes("who")) reply = "We are staff control.";
  if (msg.includes("help")) reply = "Processing request...";
  if (msg.includes("mirror")) reply = "STOP. DO NOT DISCUSS THAT.";

  const npc = ["HARRIS","MILA","ETHAN","LUCY"][Math.floor(Math.random()*4)];

  setTimeout(() => {
    addStaffMessage(npc, reply);
  }, 600);
}

function startCameraSystem() {
  const cam = document.getElementById("cam");
  if (!cam) return;

  setInterval(() => {

    if (!systemBooted) return;

    let r = Math.random();

    if (r < 0.2) cameraIndex = (cameraIndex + 1) % cameras.length;

    cam.src = cameras[cameraIndex];

    if (cameraIndex === 3) {
      systemSpeak("ENTITY DETECTED IN FEED");
    }

  }, 3000);
}

function loginSystem() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  if (
    (user === "operator" && pass === "0404") ||
    (user === "research" && pass === "void") ||
    (user === "omega" && pass === "mirror")
  ) {
    accessLevel++;

    document.getElementById("login").style.display = "none";
    document.getElementById("screen").style.display = "block";

    systemBooted = true;

    systemSpeak("SYSTEM ONLINE");

    startCameraSystem();
    staffAI();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  systemSpeak("BOOT SEQUENCE READY");
});

