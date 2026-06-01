import { loginSystem } from "./login.js";
import { playMusic } from "./audio.js";

window.login = loginSystem;

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    loginSystem();
  }
});
