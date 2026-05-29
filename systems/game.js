export function initGame() {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  let x = 0;

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ff99";
    ctx.fillRect(x, 80, 40, 40);

    x += 2;
    if (x > canvas.width) x = -40;

    requestAnimationFrame(loop);
  }

  loop();
}
