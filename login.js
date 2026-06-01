import { playMusic } from "./audio.js";

export function loginSystem() {
  const u = document.getElementById("user");
  const p = document.getElementById("pass");
  const login = document.getElementById("loginScreen");
  const desktop = document.getElementById("desktop");
  const status = document.getElementById("status");

  if (!u || !p || !login || !desktop) return;

  if (u.value === "operator" && p.value === "0404") {

    status.innerText = "Welcome";

    login.classList.add("hidden");
    desktop.classList.remove("hidden");

    playMusic("background.mp3");

  } else {
    status.innerText = "Access Denied";
  }
}
