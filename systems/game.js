export function initGame() {}

export function startGameLoop() {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  let y = 150, v = 0, g = 0.8, jump = false;

  document.addEventListener("keydown", e => {
    if (e.code === "Space" && !jump) {
      v = -12;
      jump = true;
    }
  });

  function loop() {
    ctx.clearRect(0, 0, 500, 200);

    v += g;
    y += v;

    if (y > 150) {
      y = 150;
      v = 0;
      jump = false;
    }

    ctx.fillStyle = "lime";
    ctx.fillRect(50, y, 30, 30);

    requestAnimationFrame(loop);
  }

  loop();
}
