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
  "MR.SMILE: don't open CAM-06.",
  "MR.SMILE: system damaged :)"

];

export function initBoot(){

  const loading =
    document.getElementById("loading");

  const login =
    document.getElementById("login");

  const log =
    document.getElementById("bootLog");

  const fill =
    document.getElementById("bootFill");

  const percent =
    document.getElementById("bootPercent");

  let i = 0;

  function loadNext(){

    if(i >= files.length){

      log.innerHTML +=
        "<br>SYSTEM READY";

      setTimeout(() => {

        loading.style.display = "none";

        login.classList.add("active");

      }, 1000);

      return;
    }

    const file = files[i];

    log.innerHTML +=
      "LOADING: " + file + "<br>";

    if(Math.random() > 0.5){

      const msg =
        smileLines[
          Math.floor(
            Math.random() *
            smileLines.length
          )
        ];

      log.innerHTML +=
        "<span class='smile'>" +
        msg +
        "</span><br>";
    }

    log.scrollTop =
      log.scrollHeight;

    const p =
      Math.floor(
        ((i + 1) / files.length) * 100
      );

    fill.style.width = p + "%";

    percent.innerText = p + "%";

    i++;

    setTimeout(
      loadNext,
      700
    );
  }

  loading.style.display = "flex";

  login.classList.remove("active");

  loadNext();
}
