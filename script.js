
const $ = (id) => document.getElementById(id);

/* =====================
BOOT
===================== */

let progress = 0;

function startBoot(){

  const bar = $("bootProgress");
  const text = $("loadText");
  const status = $("bootStatus");

  const logs = [
    "Loading system...",
    "Checking memory...",
    "Injecting modules...",
    "SYSTEM READY"
  ];

  const boot = setInterval(() => {

    progress += 5;

    bar.style.width = progress + "%";

    text.innerText = progress + "%";

    status.innerText =
      logs[Math.floor(progress / 25)] || "READY";

    if(progress >= 100){

      clearInterval(boot);

      setTimeout(() => {

        $("loading").style.display = "none";

        $("login").classList.add("active");

      }, 500);
    }

  }, 120);
}

/* =====================
LOGIN
===================== */

function loginSystem(){

  const user = $("user").value;
  const pass = $("pass").value;

  const status = $("loginStatus");

  if(user === "operator" && pass === "0404"){

    status.innerText = "ACCESS GRANTED";

    setTimeout(() => {

      $("login").classList.remove("active");

      $("screen").style.display = "block";

    }, 500);

  }else{

    status.innerText = "ACCESS DENIED";

  }
}

/* =====================
WINDOWS
===================== */

function openWindow(id){

  $(id).style.display = "block";

}

/* =====================
CAMERAS
===================== */

const cameras = [
  {
    name:"CAM SECRET",
    src:"cam_secret.gif"
  },
  {
    name:"CAM GLITCH",
    src:"cam_glitch.gif"
  }
];

let camIndex = 0;

function switchCamera(dir){

  camIndex += dir;

  if(camIndex < 0)
    camIndex = cameras.length - 1;

  if(camIndex >= cameras.length)
    camIndex = 0;

  $("cam").src = cameras[camIndex].src;

  $("cameraName").innerText =
    cameras[camIndex].name;
}

/* =====================
CHAT
===================== */

function sendStaffMessage(){

  const input = $("staffInput");
  const log = $("staffLog");

  if(input.value.trim() === "")
    return;

  log.innerText +=
    "\nYOU: " + input.value;

  setTimeout(() => {

    log.innerText +=
      "\nSYS: MESSAGE RECEIVED";

  }, 400);

  input.value = "";
}

/* =====================
GAME
===================== */

function startGame(){

  const canvas = $("gameCanvas");

  const ctx =
    canvas.getContext("2d");

  let x = 50;

  function draw(){

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#00ff99";

    ctx.fillRect(
      x,
      100,
      40,
      40
    );

    x += 2;

    if(x > canvas.width)
      x = -40;

    requestAnimationFrame(draw);
  }

  draw();
}

/* =====================
INIT
===================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    startBoot();

  }
);
```
