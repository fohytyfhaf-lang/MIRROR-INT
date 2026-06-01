function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if (u === "operator" && p === "0404") {
    document.getElementById("login").style.display = "none";
    document.getElementById("desktop").classList.remove("hidden");
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
