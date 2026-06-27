import { playMusic } from "./audio.js";

/* =========================
   ACCOUNTS DATABASE
========================= */

const accounts = {
  operator: "0404",
  admin: "0000",
  guest: "1234",
  doctor1987: "blackblood",
};

/* =========================
   LOGIN SYSTEM
========================= */

export function loginSystem() {
  const user = document.getElementById("user");
  const pass = document.getElementById("pass");

  const loginScreen = document.getElementById("loginScreen");
  const desktop = document.getElementById("desktop");
  const status = document.getElementById("status");

  if (!user || !pass || !loginScreen || !desktop) return;

  const u = user.value;
  const p = pass.value;

  if (accounts[u] && accounts[u] === p) {

    status.textContent = "Welcome " + u;

    setTimeout(() => {
      loginScreen.classList.add("hidden");
      desktop.classList.remove("hidden");

      // start music after login
      playMusic("background.mp3");

    }, 500);

  } else {
    status.textContent = "Access Denied";
  }
}
