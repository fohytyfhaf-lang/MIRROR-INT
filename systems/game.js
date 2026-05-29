export function initGame() {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  let cube = {
    x: 50,
    y: 150,
    vy: 0,
    jumping: false
  };

  let gravity = 0.8;
  let ground = 150;

  let obstacles = [];
  let letters = [];

  let code = [];

  const alphabet = ["M", "I", "R", "R", "O", "R"];

  let tick = 0;

  // jump
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      if (!cube.jumping) {
        cube.vy = -12;
        cube.jumping = true;
      }
    }
  });

  function spawnObstacle() {
    obstacles.push({
      x: 500,
      w: 20,
      h: 40
    });
  }

  function spawnLetter() {
    letters.push({
      x: 500,
      y: 120,
      char: alphabet[Math.floor(Math.random() * alphabet.length)]
    });
  }

  function reset() {
    cube.x = 50;
    cube.y = 150;
    cube.vy = 0;
    obstacles = [];
    letters = [];
    code = [];
  }

  function loop() {
    tick++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ground
    ctx.fillStyle = "#003333";
    ctx.fillRect(0, 180, canvas.width, 20);

    // cube physics
    cube.y += cube.vy;
    cube.vy += gravity;

    if (cube.y >= ground) {
      cube.y = ground;
      cube.jumping = false;
    }

    // draw cube
    ctx.fillStyle = "#00ff99";
    ctx.fillRect(cube.x, cube.y, 20, 20);

    // spawn obstacles
    if (tick % 90 === 0) {
      spawnObstacle();
    }

    // spawn letters
    if (tick % 150 === 0) {
      spawnLetter();
    }

    // obstacles
    for (let i = 0; i < obstacles.length; i++) {
      let o = obstacles[i];
      o.x -= 4;

      ctx.fillStyle = "red";
      ctx.fillRect(o.x, 160, o.w, o.h);

      // collision
      if (
        cube.x < o.x + o.w &&
        cube.x + 20 > o.x &&
        cube.y + 20 > 160
      ) {
        reset();
      }
    }

    // letters
    for (let i = 0; i < letters.length; i++) {
      let l = letters[i];
      l.x -= 4;

      ctx.fillStyle = "yellow";
      ctx.fillText(l.char, l.x, l.y);

      // collect
      if (
        cube.x < l.x + 10 &&
        cube.x + 20 > l.x &&
        cube.y < l.y + 10
      ) {
        code.push(l.char);
        letters.splice(i, 1);
        i--;
      }
    }

    // show code
    document.getElementById("codeBox").innerText =
      "CODE: " + code.join("");

    requestAnimationFrame(loop);
  }

  loop();
}
