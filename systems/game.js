let y = 100;
let vy = 0;

function startGame(){
  const c = $("canvas");
  const ctx = c.getContext("2d");

  document.onkeydown = (e)=>{
    if(e.code === "Space") vy = -8;
  };

  function loop(){
    ctx.fillStyle="black";
    ctx.fillRect(0,0,300,150);

    vy += 0.5;
    y += vy;

    if(y > 100){ y = 100; vy = 0; }

    ctx.fillStyle="lime";
    ctx.fillRect(50,y,20,20);

    requestAnimationFrame(loop);
  }

  loop();
}
