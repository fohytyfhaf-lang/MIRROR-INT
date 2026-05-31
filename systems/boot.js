export function initBoot() {

  const log = document.getElementById("bootLog");
  const fill = document.getElementById("bootFill");

  const files = ["kernel", "chat.sys", "camera.sys"];
  let i = 0;

  function step() {

    if (i >= files.length) {
      setTimeout(() => {
        document.getElementById("boot").classList.add("hidden");
        document.getElementById("login").classList.remove("hidden");
      }, 500);
      return;
    }

    log.innerHTML += "\nLOAD: " + files[i];

    fill.style.width = ((i / files.length) * 100) + "%";

    i++;
    setTimeout(step, 400);
  }
  step();
}
