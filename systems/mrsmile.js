export const MrSmile = {

  active: false,

  lines: [
    "you are not alone.",
    "they already know you entered.",
    "stop digging deeper.",
    "you shouldn't trust the cameras.",
    "i helped you... for now."
  ],

  init() {

    console.log("MR.SMILE INIT");

    this.tick = setInterval(() => {

      const hour = new Date().getHours();

      if (hour >= 22 || hour <= 5) {
        if (!this.active) {
          this.active = true;
          this.showMessage();
        }
      }

    }, 5000);
  },

  showMessage() {

    const log =
      document.getElementById("chatLog") ||
      document.getElementById("chat");

    if (!log) {
      console.warn("MR.SMILE: chat not found");
      return;
    }

    const msg =
      this.lines[Math.floor(Math.random() * this.lines.length)];

    log.innerText += "\nMR.SMILE: " + msg;
  }
};
