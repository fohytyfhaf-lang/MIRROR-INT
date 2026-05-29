const files = [
  "audio/background.mp3",
  "sounds/boot.wav",
  "images/cam_secret.gif",
  "images/cam_glitch.gif",
  "systems/game.js",
  "systems/chat.js",
  "systems/audio.js"
];

const smileLines = [
  "MR.SMILE: hello again.",
  "MR.SMILE: loading memories...",
  "MR.SMILE: someone is watching.",
  "MR.SMILE: don't trust CAM-06.",
  "MR.SMILE: system integrity unstable :)"
];

/* =========================
SAFE ELEMENT GETTER
========================= */
function el(id, fallbackTag = "div") {
  let node = document.getElementById(id);

  if (!node) {
    node = document.createElement(fallbackTag);
    node.id = id;
    document.body.appendChild(node);
  }

  return node;
}

/* =========================
INIT BOOT
========================= */
export function initBoot() {

  const loading = el("loading");
  const login = el("login");

  const log = el("bootLog", "pre");
  const fill = el("bootFill");
  const percent = el("bootPercent");

  // SAFE UI RESET
  loading.style.display = "flex";
  login.classList.remove("active");

  let i = 0;

  function write(text) {
    log.innerHTML += text + "<br>";
    log.scrollTop = log.scrollHeight;
  }

  function loadNext() {

    // progress calc
    const p = Math.floor((i / files.length) * 100);

    if (percent) percent.innerText = p + "%";
    if (fill) fill.style.width = p + "%";

    // finish
    if (i >= files.length) {

      write("<br>SYSTEM READY ✔");

      setTimeout(() => {
        loading.style.display = "none";
        login.classList.add("active");
      }, 800);

      return;
    }

    const file = files[i];

    write("LOADING: " + file);

    // Mr.Smile random messages
    if (Math.random() > 0.5) {
      const msg = smileLines[
        Math.floor(Math.random() * smileLines.length)
      ];
      write("<span style='color:#ff4d4d'>" + msg + "</span>");
    }

    i++;

    setTimeout(loadNext, 500 + Math.random() * 400);
  }

  write("BOOT SEQUENCE INITIATED...");
  loadNext();
}
