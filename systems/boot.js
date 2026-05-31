export function initBoot() {

  const loading = $("loading");
  const login = $("login");
  const screen = $("screen");

  // 🔥 ВСЁ СКРЫТЬ
  login.classList.add("hidden");
  screen.classList.add("hidden");

  const files = ["kernel", "chat.sys", "audio.sys", "game.sys"];
  let i = 0;

  function step() {

    if (i >= files.length) {

      setTimeout(() => {
        loading.classList.add("hidden");
        login.classList.remove("hidden");
      }, 500);

      return;
    }

    i++;
    setTimeout(step, 400);
  }

  step();
}
