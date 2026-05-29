let x = 20;
let y = 100;
let vy = 0;
let gravity = 0.5;
let jump = false;

function startGame(){
  const c = $("game");
  const ctx = c.getContext("2d");

  document.onkeydown = (e)=>{
    if(e.code === "Space"){
      vy = -8;
    }
  };

  function loop(){
    ctx.fillStyle="black";
    ctx.fillRect(0,0,300,150);

    vy += gravity;
    y += vy;

    if(y > 120){
      y = 120;
      vy = 0;
    }

    ctx.fillStyle="lime";
    ctx.fillRect(x,y,20,20);

    requestAnimationFrame(loop);
  }

  loop();
}
