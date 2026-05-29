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

export function sendMsg() {
  const input = document.getElementById("msg");
  const chat = document.getElementById("chat");

  if (!input.value.trim()) return;

  chat.innerText += "\nYOU: " + input.value;

  setTimeout(() => {
    chat.innerText += "\nSYS: message accepted";
  }, 500);

  input.value = "";
}
