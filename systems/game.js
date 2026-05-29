let gameLoopStarted = false;

function startGame() {

  const canvas = document.getElementById("gameCanvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let player = {
    x: 100,
    y: 100,
    size: 20,
    speed: 4
  };

  let keys = {};

  if (!gameLoopStarted) {

    document.addEventListener("keydown", (e) => {
      keys[e.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (e) => {
      keys[e.key.toLowerCase()] = false;
    });

    gameLoopStarted = true;
  }

  function update() {

    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;
  }

  function draw() {

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ff99";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    ctx.font = "16px Courier New";
    ctx.fillStyle = "white";
    ctx.fillText("VOID RUNNER ACTIVE", 20, 20);
  }

  function loop() {

    update();
    draw();

    requestAnimationFrame(loop);
  }

  loop();
}
