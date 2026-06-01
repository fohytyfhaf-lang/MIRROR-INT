console.log("OMEGA CORE LOADED");

/* =========================
STATE
========================= */
const State = {
  logged: false
};

/* =========================
SAFE GET
========================= */
const $ = (id) => document.getElementById(id);

/* =========================
BOOT (простая версия)
========================= */
function boot() {
  let p = 0;
  const bar = $("bootFill");
  const log = $("bootLog");

  const interval = setInterval(() => {
    p += 10;

    bar.style.width = p + "%";
    log.innerText = "BOOT: " + p + "%";

    if (p >= 100) {
      clearInterval(interval);

      $("boot").style.display = "none";
      $("login").classList.remove("hidden");
    }
  }, 150);
}

/* =========================
LOGIN
========================= */
function login() {
  const u = $("user").value;
  const p = $("pass").value;

  if (u === "operator" && p === "0404") {

    $("loginStatus").innerText = "ACCESS GRANTED";

    setTimeout(() => {
      $("login").classList.add("hidden");
      $("desktop").classList.remove("hidden");
      State.logged = true;
    }, 300);

  } else {
    $("loginStatus").innerText = "NO ACCESS";
  }
}

/* =========================
WINDOW SYSTEM
========================= */
function openApp(name) {
  const w = $(name + "Window");
  if (w) w.classList.remove("hidden");
}

function closeApp(name) {
  const w = $(name + "Window");
  if (w) w.classList.add("hidden");
}

/* =========================
CHAT
========================= */
function sendChat() {
  const input = $("chatInput");
  const log = $("chatLog");

  if (!input.value) return;

  log.innerText += "\nYOU: " + input.value;
  input.value = "";

  setTimeout(() => {
    log.innerText += "\nSYS: OK";
  }, 300);
}

/* =========================
CAMERA (простая)
========================= */
const cams = ["cam1.jpg", "cam2.jpg", "cam3.jpg"];
let camIndex = 0;

function nextCam() {
  camIndex = (camIndex + 1) % cams.length;
  $("camView").src = cams[camIndex];
}

/* =========================
INIT
========================= */
window.onload = () => {
  boot();
};

/* =========================
EXPORT TO HTML (ВАЖНО)
========================= */
window.login = login;
window.openApp = openApp;
window.closeApp = closeApp;
window.sendChat = sendChat;
window.nextCam = nextCam;
