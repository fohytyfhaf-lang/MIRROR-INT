import { playMusic } from "./audio.js";

const accounts = {
  operator: "0404",
  admin: "0000",
  guest: "1234"
};

export function loginSystem() {
  const u = document.getElementById("user");
  const p = document.getElementById("pass");
  const login = document.getElementById("loginScreen");
  const desktop = document.getElementById("desktop");
  const status = document.getElementById("status");

  if (!u || !p || !login || !desktop) return;

  const user = u.value;
  const pass = p.value;

  if (accounts[user] && accounts[user] === pass) {

    status.innerText = "Welcome " + user;

    setTimeout(() => {
      login.classList.add("hidden");
      desktop.classList.remove("hidden");

      playMusic("background.mp3");
    }, 400);

  } else {
    status.innerText = "Access Denied";
  }
}
