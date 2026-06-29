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
spawnEyes()
  startAudio();
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
removeEyes()
   document.addEventListener("mousemove", e => {

    if (!active) return;

    eyes.forEach(obj => {

        const rect = obj.eye.getBoundingClientRect();

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let dx = e.clientX - cx;
        let dy = e.clientY - cy;

        const len = Math.sqrt(dx * dx + dy * dy);

        const max = 6;

        if (len > max) {
            dx = dx / len * max;
            dy = dy / len * max;
        }

        obj.pupil.style.transform =
            `translate(${dx}px, ${dy}px)`;

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
let eyes = [];

function spawnEyes() {
  const layer = document.getElementById("eyesLayer");
  if (!layer) return;

  layer.innerHTML = "";
  layer.style.display = "block";

  eyes = [];

  for (let i = 0; i < 12; i++) {

    const eye = document.createElement("div");
    eye.className = "eye";

    const pupil = document.createElement("div");
    pupil.className = "pupil";

    eye.appendChild(pupil);

    eye.style.left = Math.random() * 90 + "vw";
    eye.style.top = Math.random() * 90 + "vh";
    eye.style.transform = `scale(${0.5 + Math.random()})`;

    layer.appendChild(eye);

    eyes.push({
      eye,
      pupil
    });
  }
}
