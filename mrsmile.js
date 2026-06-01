import { playMusic } from "./audio.js";

export function initMrSmile() {
  setInterval(() => {
    const h = new Date().getHours();

    if (h >= 22 || h <= 5) {
      const log = document.getElementById("chatLog");
      if (!log) return;

      const msgs = [
        "you shouldn't be here",
        "they are watching you",
        "stop opening files",
        "I helped you... for now"
      ];

      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      log.innerText += "\nMR.SMILE: " + msg;

      playMusic("glitch.mp3", 0.2);
    }
  }, 15000);
}
