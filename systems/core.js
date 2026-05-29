import { initBoot } from "./boot.js";
import { initLogin, loginSystem } from "./login.js";
import { initGame } from "./game.js";
import { initChat, sendMsg } from "./chat.js";
import { toggleMusic } from "./audio.js";

window.loginSystem = loginSystem;
window.sendMsg = sendMsg;
window.toggleMusic = toggleMusic;

const Apps = {
  camera: false,
  chat: false,
  game: false,
  entity: false
};

function openApp(name) {
  const win = document.getElementById(name + "Window");
  if (!win) return;

  Apps[name] = true;
  win.style.display = "block";
}

function closeApp(name) {
  const win = document.getElementById(name + "Window");
  if (!win) return;

  Apps[name] = false;
  win.style.display = "none";
}


document.addEventListener(
  "DOMContentLoaded",
  () => {

    startBoot();

  }
);

  window.loginSystem = loginSystem;
window.sendMsg = sendMsg;
window.toggleMusic = toggleMusic;
  initBoot();
  initLogin();
  initGame();
  initChat();
});
