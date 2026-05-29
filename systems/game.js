let started = false;

function startGame() {

  if (started) return;

  started = true;

  const canvas = $("gameCanvas");

  const ctx = canvas.getContext("2d");

  let x = 100;
  let y = 100;

  const keys = {};

  document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  function loop() {

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (keys["w"]) y -= 4;
    if (keys["s"]) y += 4;
    if (keys["a"]) x -= 4;
    if (keys["d"]) x += 4;

    ctx.fillStyle = "#00ff99";
    ctx.fillRect(x, y, 20, 20);

    requestAnimationFrame(loop);
  }

  loop();
}
