import { playMusic } from "./audio.js";
import { setRole } from "./security.js";
import { initSettings, applyLanguage } from "./settings.js";
import { Storage } from "./storage.js";

const accounts = {
  operator: "0404",
  admin: "0000",
  guest: "1234",
  test: "1111"
};

export function loginSystem() {

  const userEl = document.getElementById("user");
  const passEl = document.getElementById("pass");
  const status = document.getElementById("status");
  const loginScreen = document.getElementById("loginScreen");
  const desktop = document.getElementById("desktop");

  if (!userEl || !passEl) return;

  const u = userEl.value.trim();
  const p = passEl.value.trim();

  if (!u || !p) {
    if (status) status.textContent = "ENTER CREDENTIALS";
    return;
  }

  console.log("LOGIN TRY:", u, p);

  if (!accounts[u]) {
    if (status) status.textContent = "UNKNOWN USER";
    return;
  }

  if (accounts[u] !== p) {
    if (status) status.textContent = "WRONG PASSWORD";
    return;
  }

  if (status) status.textContent = "WELCOME " + u;

  if (u === "admin") setRole("admin");
  else if (u === "operator") setRole("operator");
  else setRole("guest");

  setTimeout(() => {
    if (loginScreen) loginScreen.classList.add("hidden");
    if (desktop) desktop.classList.remove("hidden");

    try {
      playMusic("background.mp3", 0.4);
    } catch (e) {
      console.warn("Audio error:", e);
    }

  }, 400);
}
