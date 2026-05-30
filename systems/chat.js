let chatInterval = null;

export function initChat() {
  const chat = document.getElementById("chat");
  if (!chat) return;

  if (chat.dataset.init === "true") return;
  chat.dataset.init = "true";

  chat.innerText = "SYS: CHAT ONLINE";

  const msgs = [
    "SYS: monitoring active...",
    "NODE: connection stable",
    "ENTITY: observing user...",
    "OPERATOR: signal received"
  ];

  chatInterval = setInterval(() => {
    chat.innerText +=
      "\n" + msgs[Math.floor(Math.random() * msgs.length)];

    chat.scrollTop = chat.scrollHeight;
  }, 3000);
}

export function sendMsg() {
  const input = document.getElementById("msg");
  const chat = document.getElementById("chat");

  if (!input || !chat) return;
  if (!input.value.trim()) return;

  const MAX_LINES = 12;

  let lines = chat.innerText.split("\n");

  lines.push("YOU: " + input.value);

  if (lines.length > MAX_LINES) {
    lines = lines.slice(-MAX_LINES);
  }

  setTimeout(() => {
    lines.push("SYS: message received");

    if (lines.length > MAX_LINES) {
      lines = lines.slice(-MAX_LINES);
    }

    chat.innerText = lines.join("\n");
    chat.scrollTop = chat.scrollHeight;
  }, 400);

  chat.innerText = lines.join("\n");
  input.value = "";
}
