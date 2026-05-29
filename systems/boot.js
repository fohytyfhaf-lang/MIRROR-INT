let boot = 0;

function startBoot(){
  const t = $("bootText");

  let i = setInterval(()=>{
    boot += 10;
    t.innerText = "Loading " + boot + "%";

    if(boot >= 100){
      clearInterval(i);
      hide("boot");
      show("login");
    }
  },200);
}

window.onload = startBoot;
}
