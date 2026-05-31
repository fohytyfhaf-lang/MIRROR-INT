let log;

export function initChat() {
  log = document.getElementById("chatLog");
  log.innerText = "SYSTEM CHAT ONLINE";
}

export function sendChat() {
  const input = document.getElementById("chatInput");

  log.innerText += "\nYOU: " + input.value;

  setTimeout(() => {
    log.innerText += "\nSYS: message received";
  }, 500);

  input.value = "";
}
