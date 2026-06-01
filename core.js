
import { playMusic } from "./audio.js";

window.playMusic = playMusic;

function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  const login = document.getElementById("login");
  const desktop = document.getElementById("desktop");

  if (u === "operator" && p === "0404") {

    login.classList.add("hidden");
    desktop.classList.remove("hidden");

  } else {
    document.getElementById("status").innerText = "NO ACCESS";
  }
}

function openApp(name) {
  const w = document.getElementById(name + "Window");
  if (w) w.classList.remove("hidden");
}

function closeApp(name) {
  const w = document.getElementById(name + "Window");
  if (w) w.classList.add("hidden");
}

function sendChat() {}
function nextCam() {}


window.login = login;
window.openApp = openApp;
window.closeApp = closeApp;
window.sendChat = sendChat;
window.nextCam = nextCam;
window.playMusic=audio;
