export function initBoot() {
  const loading = document.getElementById("loading");
  const login = document.getElementById("login");

  const log = document.getElementById("bootLog");
  const fill = document.getElementById("bootFill");
  const percent = document.getElementById("bootPercent");

  const files = ["kernel", "chat.sys", "audio.sys", "game.sys"];

  let i = 0;

  function step() {
    const p = Math.floor((i / files.length) * 100);

    if (fill) fill.style.width = p + "%";
    if (percent) percent.innerText = p + "%";

    if (i >= files.length) {
      log.innerHTML += "\nSYSTEM READY";
      setTimeout(() => {
        loading.style.display = "none";
        login.classList.add("active");
      }, 600);
      return;
    }

    log.innerHTML += "\nLOAD: " + files[i];
    i++;

    setTimeout(step, 400);
  }

  step();
}
