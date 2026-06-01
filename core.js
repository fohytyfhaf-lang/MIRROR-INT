import { loginSystem } from "./modules/login.js";
import { openApp, closeApp } from "./modules/windows.js";
import { sendChat } from "./modules/chat.js";
import { nextCam } from "./modules/camera.js";

window.login = loginSystem;
window.openApp = openApp;
window.closeApp = closeApp;
window.sendChat = sendChat;
window.nextCam = nextCam;

console.log("WIN7 ARG SYSTEM ONLINE");
