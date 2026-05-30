let chatInit = false;

export function initChat() {
  const chat = document.getElementById("chat");
  if (!chat || chatInit) return;

  chatInit = true;
  chat.innerText = "SYS: CHAT ONLINE";

  setInterval(() => {
    const msgs = [
      "SYS: monitoring...",
      "NODE: stable",
      "MR.SMILE: watching...",
      "OPERATOR: signal active"
    ];

    chat.innerText += "\n" + msgs[Math.floor(Math.random() * msgs.length)];
  }, 3000);
}

export function sendMsg() {
  const input = document.getElementById("msg");
  const chat = document.getElementById("chat");

  if (!input.value.trim()) return;

  const MAX = 12;

  let lines = chat.innerText.split("\n");
  lines.push("YOU: " + input.value);

  if (lines.length > MAX) lines = lines.slice(-MAX);

  chat.innerText = lines.join("\n");

  setTimeout(() => {
    lines.push("SYS: received");
    if (lines.length > MAX) lines = lines.slice(-MAX);
    chat.innerText = lines.join("\n");
  }, 300);

  input.value = "";
}
