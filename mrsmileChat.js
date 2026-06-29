import { mrSmileSay } from "./mrsmileCore.js";

export function initMrSmileChat() {

    console.log("[MR.SMILE CHAT] initialized");

    const input = document.getElementById("chatInput");
    const button = document.getElementById("sendBtn");

    if (!input || !button) return;

    button.addEventListener("click", async () => {

        const text = input.value;
        input.value = "";

        if (!text) return;

        const log = document.getElementById("chatLog");

        if (log) {
           log.innerHTML += `<div class="msg user">YOU: ${text}</div>`;
        }

        const response = await mrSmileSay(text);

        if (response && log) {
            log.innerText += "\nMR.SMILE: " + response;
        }

    });

}

function addMessage(text, type) {
  const log = document.getElementById("chatLog");

  log.innerHTML += `
    <div class="msg ${type}">
      ${text}
    </div>
  `;

  log.scrollTop = log.scrollHeight;
}
