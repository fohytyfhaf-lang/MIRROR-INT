let clockStarted = false;

function startClock() {

  if (clockStarted) return;

  clockStarted = true;

  setInterval(() => {

    $("clock").innerText =
      new Date().toLocaleTimeString();

  }, 1000);
}
