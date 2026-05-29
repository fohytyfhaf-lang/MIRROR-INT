function sendStaffMessage() {

  const input = document.getElementById("staffInput");
  const log = document.getElementById("staffLog");

  if (!input || !log) return;

  const text = input.value.trim();

  if (!text) return;

  log.innerText += "\nYOU: " + text;

  input.value = "";

  const replies = [
    "STAFF: Copy that.",
    "STAFF: Sector secured.",
    "STAFF: Unknown signal detected.",
    "STAFF: Access confirmed.",
    "SYS: WARNING.",
    "STAFF: Entity movement reported."
  ];

  setTimeout(() => {

    const reply = replies[
      Math.floor(Math.random() * replies.length)
    ];

    log.innerText += "\n" + reply;

    log.scrollTop = log.scrollHeight;

  }, 700);
}
