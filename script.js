let progress = 0;
        `\nMISTER SMILE: I am already here.`;
    }

    else {
      log.innerText +=
        `\nMISTER SMILE: :)`;
    }

    log.scrollTop = log.scrollHeight;

  }, 1500);
}

// =========================
// MEMORY
// =========================
function updateMemory() {

  document.getElementById("memory")
    .innerText =
`SYSTEM ONLINE
ACCESS LEVEL: ${accessLevel}
CAMERA STATUS: ACTIVE
SECTOR STATUS: UNSTABLE
ENTITY TRACKING: ENABLED`;
}

// =========================
// GAME
// =========================
function checkGame() {

  const value = document.getElementById("gameInput").value;

  if(value === "0404") {

    document.getElementById("gameText")
      .innerText =
"ACCESS TO SECRET TERMINAL GRANTED";
  }

  else {

    document.getElementById("gameText")
      .innerText =
"WRONG CODE";
  }
}

// =========================
// NIGHT EVENT
// =========================
setInterval(() => {

  const hour = new Date().getHours();

  if(hour >= 1 && hour <= 4) {

    const log = document.getElementById("chatLog");

    if(log) {
      log.innerText +=
        "\nMISTER SMILE: awake?";
    }

  }

}, 60000);
