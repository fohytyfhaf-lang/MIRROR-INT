let chatInit = false;
let chatInterval = null;

export function initChat() {
  const chat = document.getElementById("chat");
  if (!chat || chatInit) return;

  chatInit = true;

  chat.innerText = "SYS: CHAT ONLINE";

  chatInterval = setInterval(() => {
    const msgs = [
      "SYS: monitoring...",
      "NODE: stable",
      "MR.SMILE: watching...",
      "OPERATOR: signal active"
    ];

    appendLine(chat, msgs[Math.floor(Math.random() * msgs.length)], 20);
  }, 3000);
}

/* =========================
SAFE CHAT APPEND (NO LAG)
========================= */
function appendLine(chat, text, maxLines = 12) {
  let lines = chat.innerText.split("\n");

  lines.push(text);

  if (lines.length > maxLines) {
    lines = lines.slice(-maxLines);
  }

  chat.innerText = lines.join("\n");
}

/* =========================
SEND MESSAGE
========================= */
export function sendMsg() {
  const input = document.getElementById("msg");
  const chat = document.getElementById("chat");

  if (!input || !chat) return;
  if (!input.value.trim()) return;

  appendLine(chat, "YOU: " + input.value, 12);

  setTimeout(() => {
    appendLine(chat, "SYS: received", 12);
  }, 300);

  input.value = "";
}
