function sendStaffMessage() {

  const input = $("staffInput");
  const log = $("staffLog");

  if (!input || !log) return;

  const text = input.value.trim();

  if (!text) return;

  log.innerText += "\nYOU: " + text;

  input.value = "";

  const replies = [
    "STAFF: Copy.",
    "STAFF: Access confirmed.",
    "STAFF: Unknown signal.",
    "SYS: WARNING.",
    "STAFF: Movement detected."
  ];

  setTimeout(() => {

    const reply = replies[
      Math.floor(Math.random() * replies.length)
    ];

    log.innerText += "\n" + reply;

    log.scrollTop = log.scrollHeight;

  }, 600);
}
