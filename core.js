import { loginSystem } from "./login.js";
import { openApp, closeApp } from "./windows.js";
import { playMusic } from "./audio.js";
import { initMrSmile } from "./mrsmile.js";

window.login = loginSystem;
window.openApp = openApp;
window.closeApp = closeApp;

document.addEventListener("DOMContentLoaded", () => {
  initMrSmile();
});

window.loginSystem = loginSystem;
window.openApp = openApp;
window.closeApp = closeApp;
