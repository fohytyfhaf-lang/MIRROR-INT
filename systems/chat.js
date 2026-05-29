export function initChat() {
  const chat = document.getElementById("chat");

  setInterval(() => {
    const msgs = [
      "SYS: monitoring active...",
      "NODE: connection stable",
      "ENTITY: observing user...",
      "OPERATOR: signal received"
    ];

    chat.innerText += "\n" + msgs[Math.floor(Math.random() * msgs.length)];
  }, 3000);
}

function initChat() {
  if (Apps.chatInit) return;
  Apps.chatInit = true;

  document.getElementById("chat").innerText = "SYS: CHAT ONLINE";
}


export function sendMsg() {
  const input = document.getElementById("msg");
  const chat = document.getElementById("chat");

  if (!input.value.trim()) return;

  const MAX_LINES = 12;

  let lines = chat.innerText.split("\n");

  lines.push("YOU: " + input.value);

  // ограничение
  if (lines.length > MAX_LINES) {
    lines = lines.slice(lines.length - MAX_LINES);
  }

  chat.innerText = lines.join("\n");

  setTimeout(() => {
    lines.push("SYS: message received");

    if (lines.length > MAX_LINES) {
      lines = lines.slice(lines.length - MAX_LINES);
    }

    chat.innerText = lines.join("\n");
  }, 400);

  input.value = "";
}
