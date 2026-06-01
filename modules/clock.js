function startClock() {
  const clock = document.getElementById("clock");

  function update() {
    const now = new Date();
    clock.innerText =
      now.getHours().toString().padStart(2, "0") + ":" +
      now.getMinutes().toString().padStart(2, "0");
  }

  update();
  setInterval(update, 1000);
}

startClock();
