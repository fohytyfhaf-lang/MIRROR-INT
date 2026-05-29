function startClock(){
  if(window.state.clockStarted) return;
  window.state.clockStarted = true;

  setInterval(() => {
    $("clock").innerText = new Date().toLocaleTimeString();
  }, 1000);
}
