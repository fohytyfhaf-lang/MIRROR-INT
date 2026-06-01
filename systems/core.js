import { enableDebugMode, fixBootBlock } from "./debug.js";
import { initBoot } from "./boot.js";
import { initChat, sendChat } from "./chat.js";
import { initCamera, nextCam } from "./camera.js";
import { openApp, closeApp } from "./windows.js";
import { initLore } from "./lore.js";
import { MrSmile } from "./mrsmile.js";
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

document.addEventListener("DOMContentLoaded", () => {

  console.log("CORE READY");

  try { initBoot(); } catch(e) { console.error("BOOT FAIL", e); }
  try { initChat(); } catch(e) { console.error("CHAT FAIL", e); }
  try { initCamera(); } catch(e) { console.error("CAMERA FAIL", e); }
  try { initLore(); } catch(e) { console.error("LORE FAIL", e); }

  try { enableDebugMode(); } catch(e) { console.error("DEBUG FAIL", e); }
  try { fixBootBlock(); } catch(e) { console.error("FIX FAIL", e); }

  try {
    MrSmile?.init?.();
  } catch(e) {
    console.error("MRSMILE FAIL", e);
  }

});
