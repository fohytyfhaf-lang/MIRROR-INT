import { enableDebugMode, fixBootBlock } from "./debug.js";
import { initBoot } from "./boot.js";
import { initChat, sendChat } from "./chat.js";
import { initCamera, nextCam } from "./camera.js";
import { openApp, closeApp } from "./windows.js";
import { initLore } from "./lore.js";
import { loginSystem } from "./login.js";

window.loginSystem = loginSystem;
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

let MrSmileModule = null;

async function loadMrSmile() {
  try {
    const mod = await import("./mrsmile.js");
    MrSmileModule = mod.MrSmile;
  } catch (e) {
    console.warn("MRSMILE NOT LOADED");
  }
}

document.addEventListener("DOMContentLoaded", () => {

  console.log("CORE READY");

  // 🚀 boot ВСЕГДА первым
  initBoot();

  // UI systems
  initChat();
  initCamera();
  initLore();

  // debug tools
  enableDebugMode();
  fixBootBlock();

  // MrSmile НЕ блокирует систему
  loadMrSmile().then(() => {
    MrSmileModule?.init?.();
  });

});
