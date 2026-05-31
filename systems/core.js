import { initBoot } from "./boot.js";
import { loginSystem } from "./login.js";
import { initChat, sendChat } from "./chat.js";
import { initCamera, nextCam } from "./camera.js";
import { openApp, closeApp } from "./windows.js";
import { initLore } from "./lore.js";
import { MrSmile } from "./mrsmile.js";

window.login = loginSystem;
window.sendChat = sendChat;
window.openApp = openApp;
window.closeApp = closeApp;
window.nextCam = nextCam;

window.gameState = {
  time: "night",
  evidence: [],
  alertLevel: 0
};

document.addEventListener("DOMContentLoaded", () => {

  initBoot();
  initChat();
  initCamera();
  initLore();

  MrSmile.init(); // 👁 запускаем скрытую систему

});
