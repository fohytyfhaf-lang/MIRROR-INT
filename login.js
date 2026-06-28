import { playMusic } from "./audio.js";
import { setRole } from "./security.js";
/* =========================
   ACCOUNTS DATABASE
========================= */
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

  console.log("LOGIN TRY:", u, p);

  if (!accounts.hasOwnProperty(u)) {
    status.textContent = "UNKNOWN USER";
    return;
  }

  if (accounts[u] !== p) {
    status.textContent = "WRONG PASSWORD";
    return;
  }

  status.textContent = "WELCOME " + u;

if (u === "admin") setRole("admin");
else if (u === "operator") setRole("operator");
else setRole("guest");
   
  setTimeout(() => {
    loginScreen.classList.add("hidden");
    desktop.classList.remove("hidden");
     
     playMusic("background.mp3", 0.4);
  }, 400);
}
