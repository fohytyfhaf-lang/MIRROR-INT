let progress = 0;

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    hide("biosScreen");
    startBoot();
  }, 1200);
});

function startBoot() {
  const bar = $("bootProgress");
  const text = $("loadText");

  const t = setInterval(() => {
    progress += 5;

    if (bar) bar.style.width = progress + "%";
    if (text) text.innerText = progress + "%";

    if (progress >= 100) {
      clearInterval(t);

      hide("loading");

      const login = $("login");
      if (login) login.classList.add("active");
    }
  }, 80);
}
