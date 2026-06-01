import { playMusic } from "./audio.js";
export function loginSystem() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if (u === "operator" && p === "0404") {

    document.getElementById("status").innerText = "Welcome";

  setTimeout(() => {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("desktop").classList.remove("hidden");

  playMusic("background.mp3");

}, 500);
    
  } else {
    document.getElementById("status").innerText = "Access Denied";
  }
}
window.login = loginSystem;
