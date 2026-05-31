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

    setInterval(() => {

      const hour = new Date().getHours();

      if (hour >= 22 || hour <= 5) {
        this.active = true;
        this.showMessage();
      }

    }, 10000);

  },

  showMessage() {

    const log = document.getElementById("chatLog");
    if (!log) return;

    const msg = this.lines[
      Math.floor(Math.random() * this.lines.length)
    ];

    log.innerText += "\nMR.SMILE: " + msg;
  }
};
