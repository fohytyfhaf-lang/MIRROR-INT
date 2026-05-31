import { loginSystem } from "./systems/login.js";
import { openApp, closeApp } from "./systems/windows.js";
import { sendChat } from "./systems/chat.js";
import { nextCam } from "./systems/camera.js";

window.login = loginSystem;
window.openApp = openApp;
window.closeApp = closeApp;
window.sendChat = sendChat;
window.nextCam = nextCam;
