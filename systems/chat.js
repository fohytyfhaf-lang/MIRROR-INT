function sendStaffMessage(){
  const input = $("staffInput");
  const log = $("staffLog");

  if (!input.value.trim()) return;

  log.innerText += "\nYOU: " + input.value;

  const replies = [
    "SYS: OK",
    "SYS: SIGNAL RECEIVED",
    "SYS: ENTITY ACTIVE",
    "SYS: LOG STORED"
  ];

  setTimeout(() => {
    log.innerText += "\n" + replies[Math.floor(Math.random()*replies.length)];
    log.scrollTop = log.scrollHeight;
  }, 400);

  input.value = "";
}
