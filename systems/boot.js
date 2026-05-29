export function startBoot() {
  let progress = 0;

  const bar = document.getElementById("bootProgress");
  const text = document.getElementById("loadText");

  const t = setInterval(() => {
    progress += 5;

    if (bar) bar.style.width = progress + "%";
    if (text) text.innerText = progress + "%";

    if (progress >= 100) {
      clearInterval(t);

      document.getElementById("loading").style.display = "none";
      document.getElementById("login").style.display = "flex";
    }
  }, 100);
}
