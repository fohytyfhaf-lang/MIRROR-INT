let progress = 0;

const loader = setInterval(() => {

  progress += Math.floor(Math.random() * 12);

  document.getElementById("loadText").innerText = progress + "%";

  if (progress >= 100) {
    clearInterval(loader);

    setTimeout(() => {
      document.getElementById("loading").style.display = "none";
      document.getElementById("screen").style.display = "block";
      startSystem();
    }, 500);
  }

}, 150);


function startSystem() {

  const cam = document.getElementById("cam");
  const status = document.getElementById("status");

  let instability = 0;

  setInterval(() => {

    let r = Math.random();

    if (r < 0.4) {
      cam.src = "images/cam_idle.gif";
      status.innerText = "SYSTEM: STABLE FEED";
    }

    else if (r < 0.7) {
      cam.src = "images/cam_glitch.gif";
      status.innerText = "WARNING: SIGNAL INSTABILITY";
      instability++;
    }

    else {
      cam.src = "images/cam_alert.gif";
      status.innerText = "ALERT: UNKNOWN PRESENCE";
      instability += 2;
    }

    if (instability > 6) {
      cam.src = "images/cam_secret.gif";
      status.innerText = ">>> HIDDEN FEED UNLOCKED <<<";
      instability = 0;
    }

  }, 3000);
}


function scan() {
  document.getElementById("status").innerText = "MANUAL SCAN ACTIVE";
}

function forceGlitch() {
  document.getElementById("status").innerText = "SYSTEM OVERLOAD";
}
