import { playMusic } from "./audio.js";

export function loginSystem() {
  const u = document.getElementById("user");
  const p = document.getElementById("pass");
  const screen = document.getElementById("loginScreen");
  const desktop = document.getElementById("desktop");
  const status = document.getElementById("status");

  if (!u || !p || !screen || !desktop) return;

  if (u.value === "operator" && p.value === "0404") {

    status.innerText = "Welcome";

    setTimeout(() => {
      screen.classList.add("hidden");
      desktop.classList.remove("hidden");

      playMusic("background.mp3", 0.4);
    }, 400);

  } else {
    status.innerText = "Access Denied";
  }
}
