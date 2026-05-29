let started = false;

document.addEventListener("click", ()=>{
  if(started) return;
  started = true;

  const bgm = $("bgm");
  bgm.volume = 0.3;
  bgm.play();
});
