function startGame(){
  const canvas = $("gameCanvas");
  const ctx = canvas.getContext("2d");

  let x = 50;
  let speed = 3;

  function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#00ff99";
    ctx.fillRect(x,100,40,40);

    x += speed;

    if(x > canvas.width-40 || x < 0)
      speed *= -1;

    requestAnimationFrame(loop);
  }

  loop();
}
