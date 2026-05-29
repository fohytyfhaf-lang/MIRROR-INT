import { initBoot } from "./boot.js";
import { initLogin, loginSystem } from "./login.js";
import { initGame } from "./game.js";
import { initChat, sendMsg } from "./chat.js";
import { toggleMusic } from "./audio.js";

window.loginSystem = loginSystem;
window.sendMsg = sendMsg;
window.toggleMusic = toggleMusic;

document.addEventListener("DOMContentLoaded", () => {
  initBoot();
  initLogin();
  initGame();
  initChat();
});
