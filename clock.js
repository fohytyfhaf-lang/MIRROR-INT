let clockInterval = null;
let lastState = "normal";

export function startClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;

  // защита от дублирования интервалов
  if (clockInterval) clearInterval(clockInterval);

  function formatTime() {
    const now = new Date();

    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");

    return `${h}:${m}`;
  }

  function applyEffect() {
    // случайный микро-глитч
    if (Math.random() < 0.02) {
      clock.classList.add("glitch");

      setTimeout(() => {
        clock.classList.remove("glitch");
      }, 200);
    }

    // реакция на состояние системы (MR.SMILE / тревога)
    if (window.clockState?.mode && window.clockState.mode !== lastState) {
      clock.classList.remove("danger", "smile", "error");

      const mode = window.clockState.mode;

      if (mode === "danger") clock.classList.add("danger");
      if (mode === "smile") clock.classList.add("smile");
      if (mode === "error") clock.classList.add("glitch");

      lastState = mode;
    }
  }

  function update() {
    clock.innerText = formatTime();
    applyEffect();
  }

  // старт
  update();

  clockInterval = setInterval(update, 1000);
}

export function stopClock() {
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = null;
}
