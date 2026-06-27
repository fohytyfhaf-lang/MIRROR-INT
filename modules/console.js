const log = document.getElementById("consoleLog");

function print(text) {
  if (!log) return;
  log.textContent += "\n" + text;
}

export function runCommand() {
  const input = document.getElementById("consoleInput");
  if (!input) return;

  const cmd = input.value.trim().toLowerCase();
  input.value = "";

  print("> " + cmd);

  switch (cmd) {

    case "help":
      print("COMMANDS: help, time, clear, status, mrsmile");
      break;

    case "time":
      print(new Date().toString());
      break;

    case "clear":
      log.textContent = "";
      break;

    case "status":
      print("SYSTEM: OK");
      print("CAMERA: ONLINE");
      print("MR.SMILE: UNKNOWN");
      break;

    case "mrsmile":
      print("...he is watching you.");
      break;

    default:
      print("UNKNOWN COMMAND");
  }
}
