import { initBoot } from "./boot.js";
import { loginSystem } from "./login.js";
import { initChat, sendChat } from "./chat.js";
import { initCamera, nextCam } from "./camera.js";
import { openApp, closeApp } from "./windows.js";

window.login = loginSystem;
window.sendChat = sendChat;
window.openApp = openApp;
window.closeApp = closeApp;
window.nextCam = nextCam;

document.addEventListener("DOMContentLoaded", () => {
  initBoot();
  initChat();
  initCamera();
});
