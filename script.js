window.onload = () => {

  const cam = document.getElementById("cam");
  const status = document.getElementById("status");

  let instability = 0;

  // загрузка
  let progress = 0;
  const loader = setInterval(() => {

    progress += Math.floor(Math.random() * 10);
    document.getElementById("loadText").innerText = progress + "%";

    if (progress >= 100) {
      clearInterval(loader);

      document.getElementById("loading").style.display = "none";
      document.getElementById("screen").style.display = "block";
    }

  }, 150);

  // камера
  function systemLoop() {

    let r = Math.random();

    if (r < 0.4) {
      cam.src = "images/cam_idle.gif";
      status.innerText = "SYSTEM: STABLE";
    }

    else if (r < 0.7) {
      cam.src = "images/cam_glitch.gif";
      status.innerText = "WARNING: GLITCH";
      instability++;
    }

    else {
      cam.src = "images/cam_alert.gif";
      status.innerText = "ALERT: ENTITY";
      instability += 2;
    }

    if (instability > 6) {
      cam.src = "images/cam_secret.gif";
      status.innerText = "HIDDEN FEED";
      instability = 0;
    }
  }

  setInterval(systemLoop, 3000);

};
