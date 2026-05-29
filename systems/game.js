let canvas, ctx;

let cube = {
  x: 50,
  y: 150,
  size: 20,
  vy: 0,
  grounded: true
};

let gravity = 0.6;
let jumpPower = -10;

let letters = [];
let code = "";

let running = false;

/* =====================
INIT GAME
===================== */
export function initGame() {
  canvas = document.getElementById("game");
  if (!canvas) return;

  ctx = canvas.getContext("2d");

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") jump();
  });

  canvas.addEventListener("click", jump);

  spawnLetters();

  running = true;
  loop();
}

/* =====================
JUMP
===================== */
function jump() {
  if (!cube.grounded) return;
  cube.vy = jumpPower;
  cube.grounded = false;
}

/* =====================
LETTERS
===================== */
function spawnLetters() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  setInterval(() => {
    letters.push({
      x: 500,
      y: 130 + Math.random() * 40,
      char: chars[Math.floor(Math.random() * chars.length)],
      size: 14
    });
  }, 1500);
}

/* =====================
GAME LOOP
===================== */
function loop() {
  if (!running) return;

  update();
  draw();

  requestAnimationFrame(loop);
}

/* =====================
UPDATE
===================== */
function update() {
  cube.vy += gravity;
  cube.y += cube.vy;

  if (cube.y >= 150) {
    cube.y = 150;
    cube.vy = 0;
    cube.grounded = true;
  }

  for (let i = 0; i < letters.length; i++) {
    let l = letters[i];
    l.x -= 3;

    // collision
    if (
      l.x < cube.x + cube.size &&
      l.x + 10 > cube.x &&
      l.y < cube.y + cube.size &&
      l.y + 10 > cube.y
    ) {
      code += l.char;
      document.getElementById("codeBox").innerText =
        "CODE: " + code;

      letters.splice(i, 1);
      i--;
    }

    if (l.x < -20) {
      letters.splice(i, 1);
      i--;
    }
  }

  if (code.length > 12) {
    code = code.slice(-12);
  }
}

/* =====================
DRAW
===================== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 170, 500, 30);

  // cube
  ctx.fillStyle = "#00ff99";
  ctx.fillRect(cube.x, cube.y, cube.size, cube.size);

  // letters
  ctx.fillStyle = "white";
  for (let l of letters) {
    ctx.fillText(l.char, l.x, l.y);
  }
}
