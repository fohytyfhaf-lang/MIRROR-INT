import { playMusic } from "./audio.js";

let active = false;
let interval = null;
let audio = null;

/* =========================
   INIT SYSTEM
========================= */
export function initMrSmile() {
  checkTime();

  setInterval(checkTime, 60000); // проверка раз в минуту
}

/* =========================
   TIME CHECK
========================= */
function checkTime() {
  const h = new Date().getHours();
  const isNight = h >= 22 || h <= 5;

  if (isNight && !active) {
    enable();
  }

  if (!isNight && active) {
    disable();
  }
}

/* =========================
   ENABLE MR.SMILE
========================= */
function enable() {
  active = true;

  const log = document.getElementById("chatLog");
  if (log) {
    log.innerText += "\n[SYSTEM] UNKNOWN PROCESS: MR.SMILE";
  }

  startAudio();
spawnEyes();
  interval = setInterval(() => {
    whisper();
  }, 20000);
}

/* =========================
   DISABLE MR.SMILE
========================= */
function disable() {
  active = false;

  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  stopAudio();

  const log = document.getElementById("chatLog");
  if (log) {
    log.innerText += "\n[SYSTEM] MR.SMILE DISCONNECTED";
  }
}

/* =========================
   AUDIO CONTROL
========================= */
function startAudio() {
  stopAudio(); // защита от дубля

  audio = new Audio("audio/mrsmile.mp3");
  audio.volume = 0.25;
  audio.loop = true;

  audio.play().catch(() => {});
}

function stopAudio() {
  if (audio) {
    audio.pause();
    audio = null;
  }
}

/* =========================
   WHISPERS
========================= */
function whisper() {
  const log = document.getElementById("chatLog");
  if (!log) return;

  const msgs = [
    "you shouldn't be here",
    "they are watching you",
    "stop opening files",
    "I helped you... for now",
    "do not trust SYSTEM"
  ];

  const msg = msgs[Math.floor(Math.random() * msgs.length)];

  log.innerText += "\nMR.SMILE: " + msg;
}
/* ===== 👁 EYES SYSTEM ===== */
function spawnEyes() {
  const layer = document.getElementById("eyesLayer");
  if (!layer) return;

  layer.innerHTML = "";
  layer.style.display = "block";

  for (let i = 0; i < 12; i++) {
    const eye = document.createElement("div");
    eye.className = "eye";

    eye.style.left = Math.random() * 100 + "vw";
    eye.style.top = Math.random() * 100 + "vh";

    eye.style.transform = `scale(${0.5 + Math.random()})`;

    layer.appendChild(eye);
  }
}

function removeEyes() {
  const layer = document.getElementById("eyesLayer");
  if (!layer) return;

  layer.style.display = "none";
  layer.innerHTML = "";
}
