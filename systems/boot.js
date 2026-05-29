
 const files = [

  "audio/background.mp3",
  "sounds/boot.wav",

  "images/cam_secret.gif",
  "images/cam_glitch.gif",

  "systems/game.js",
  "systems/chat.js",
  "systems/audio.js"

];

async function startBoot(){

  const log = document.getElementById("bootLog");
  const fill = document.getElementById("bootFill");
  const percent = document.getElementById("bootPercent");

  for(let i = 0; i < files.length; i++){

    const file = files[i];

    log.innerText +=
      "LOADING: " + file + "\n";

    log.scrollTop = log.scrollHeight;

    await fakeLoad(file);

    const p =
      Math.floor(
        ((i + 1) / files.length) * 100
      );

    fill.style.width = p + "%";

    percent.innerText = p + "%";
  }

  log.innerText +=
    "\nSYSTEM READY";

  setTimeout(() => {

    document
      .getElementById("loading")
      .style.display = "none";

    document
      .getElementById("login")
      .classList.add("active");

  }, 1200);
}

function fakeLoad(file){

  return new Promise(resolve => {

    setTimeout(() => {
      resolve();
    }, 400 + Math.random() * 700);

  });
}
