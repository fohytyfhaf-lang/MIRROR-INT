let progress = 0;

const loader = setInterval(() => {

  progress += 10;

  document.getElementById("loadText").innerText = progress + "%";

  if (progress >= 100) {

    clearInterval(loader);

    document.getElementById("loading").style.display = "none";
    document.getElementById("screen").style.display = "block";

    startCamera();

  }

}, 200);


function startCamera() {

  const cam = document.getElementById("cam");
  const status = document.getElementById("status");

  setInterval(() => {

    let r = Math.random();

    if (r < 0.5) {
      cam.src = "images/cam_idle.gif";
      status.innerText = "SYSTEM: STABLE";
    }

    else {
      cam.src = "images/cam_glitch.gif";
      status.innerText = "SYSTEM: GLITCH DETECTED";
    }

  }, 3000);

}
