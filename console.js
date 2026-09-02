import {
    getRole,
    getClearance,
    canAccess
} from "./security.js";

import { trigger } from "./eventManager.js";


/* =========================================================
   OMEGA SYSTEM CONSOLE
========================================================= */

let commandHistory = [];
let historyIndex = -1;


/* =========================================================
   COMMAND DATABASE
========================================================= */

const commands = {

    help: {
        clearance: 0,
        description: "Show available commands"
    },

    status: {
        clearance: 0,
        description: "Show system status"
    },

    time: {
        clearance: 0,
        description: "Show current time"
    },

    clear: {
        clearance: 0,
        description: "Clear console"
    },

    events: {
        clearance: 0,
        description: "Show recent system events"
    },

    diagnostics: {
        clearance: 0,
        description: "Run system diagnostics"
    },
    
    sys_00: {
        clearance: 0,
        description: "Initialize unknown system channel"
    },

    files: {
        clearance: 0,
        description: "Show filesystem status"
    },

    personnel: {
        clearance: 0,
        description: "Show personnel"
    },

    messages: {
        clearance: 0,
        description: "Show communication channels"
    },

    security: {
        clearance: 2,
        description: "Show security status"
    },

    users: {
        clearance: 5,
        description: "Show registered users"
    },

    permissions: {
        clearance: 5,
        description: "Show clearance levels"
    },

    system: {
        clearance: 5,
        description: "Show administrative system"
    }

};


/* =========================================================
   CONSOLE OUTPUT
========================================================= */

function print(text = "", type = "normal") {

    const log =
        document.getElementById("consoleLog");

    if (!log) return;


    const line =
        document.createElement("div");

    line.className =
        `consoleLine console-${type}`;

    line.textContent =
        text;


    log.appendChild(line);


    log.scrollTop =
        log.scrollHeight;

}


/* =========================================================
   PROMPT
========================================================= */

function showPrompt() {

    print(
        `OMEGA://${getRole()}>`,
        "prompt"
    );

}


/* =========================================================
   HISTORY
========================================================= */

function addHistory(command) {

    if (!command) return;


    commandHistory.push(command);


    if (commandHistory.length > 50) {

        commandHistory.shift();

    }


    historyIndex =
        commandHistory.length;

}


/* =========================================================
   STATUS
========================================================= */

function showStatus() {

    print("");
    print("OMEGA SYSTEM STATUS");
    print("--------------------------------");

    print("CORE ................. ONLINE");
    print("DATABASE ............. ONLINE");
    print("NETWORK .............. ONLINE");
    print("FILE SYSTEM .......... ONLINE");
    print("COMMUNICATION ........ ONLINE");
    print("SECURITY ............. ACTIVE");
    print("CAMERAS .............. 24/28");

    print("");

    print(
        `ROLE: ${getRole().toUpperCase()}`
    );

    print(
        `CLEARANCE: ${getClearance()}`
    );

    if (getClearance() >= 5) {

        print(
            "ADMINISTRATIVE CORE .. AVAILABLE"
        );

    }

    print("--------------------------------");

}


/* =========================================================
   TIME
========================================================= */

function showTime() {

    const now =
        new Date();

    print(
        "OMEGA SYSTEM TIME: " +
        now.toLocaleString()
    );

}


/* =========================================================
   DIAGNOSTICS
========================================================= */

function diagnostics() {

    print("");
    print("RUNNING SYSTEM DIAGNOSTICS...");
    print("");

    print("[CORE] ............... OK");
    print("[DATABASE] ........... OK");
    print("[NETWORK] ............ OK");
    print("[FILESYSTEM] ......... OK");
    print("[COMMUNICATION] ...... OK");
    print("[SECURITY] ........... OK");
    print("[CAMERAS] ............ WARNING");

    if (getClearance() >= 2) {

        print(
            "[RESTRICTED] ......... ACCESSIBLE"
        );

    }

    /*
       Небольшая вероятность
       обнаружить неизвестный процесс.
    */

    if (Math.random() < 0.08) {

        print(
            "[UNKNOWN] ............ DETECTED",
            "warning"
        );

        print(
            "Unregistered process detected.",
            "warning"
        );

    }

    print("");

}


/* =========================================================
   FILE SYSTEM
========================================================= */

function showFiles() {

    print("");
    print("OMEGA FILE SYSTEM");
    print("--------------------------------");

    print("/files/");
    print("  readme.txt");
    print("  memo.txt");
    print("  entity_mrsmile.txt");

    if (getClearance() >= 4) {

        print("  experiment_Ten.pdf");
        print("  experiment_Alexey.pdf");

    }
    else {

        print(
            "  [RESTRICTED FILES HIDDEN]",
            "warning"
        );

    }

    print("--------------------------------");

}


/* =========================================================
   PERSONNEL
========================================================= */

function showPersonnel() {

    print("");
    print("PERSONNEL DATABASE");
    print("--------------------------------");

    print("SECURITY_01 ......... ONLINE");
    print("SECURITY_03 ......... ONLINE");
    print("OPERATOR_04 ......... ONLINE");
    print("DR_KLINE ............ ONLINE");
    print("DR_MILLER ........... OFFLINE");
    print("MEDICAL_02 .......... ONLINE");

    print("--------------------------------");

}


/* =========================================================
   COMMUNICATION
========================================================= */

function showMessages() {

    print("");
    print("COMMUNICATION CHANNELS");
    print("--------------------------------");

    print("GENERAL ............. AVAILABLE");
    print("SECURITY ............ AVAILABLE");

    if (getClearance() >= 2) {

        print("RESEARCH ............ AVAILABLE");

    }

    if (getClearance() >= 3) {

        print("MEDICAL ............. AVAILABLE");
        print("INCIDENTS ........... AVAILABLE");

    }

    if (getClearance() >= 5) {

        print("ADMINISTRATION ...... AVAILABLE");

    }

    if (getClearance() >= 2) {

        print(
            "MR.SMILE ............ UNKNOWN",
            "warning"
        );

    }

    print("--------------------------------");

}


/* =========================================================
   SECURITY
========================================================= */

function showSecurity() {

    if (!canAccess(2)) {

        accessDenied(2);

        return;

    }


    print("");
    print("OMEGA SECURITY");
    print("--------------------------------");

    print("SECURITY SYSTEM ..... ACTIVE");
    print("INTRUSION SYSTEM .... ONLINE");
    print("SURVEILLANCE ........ ACTIVE");
    print("ARCHIVE LOCK ........ ACTIVE");

    if (getClearance() >= 5) {

        print("");
        print(
            "ADMIN OVERRIDE ...... AVAILABLE"
        );

    }

    print("--------------------------------");

}


/* =========================================================
   USERS
========================================================= */

function showUsers() {

    if (!canAccess(5)) {

        accessDenied(5);

        return;

    }


    print("");
    print("REGISTERED USERS");
    print("--------------------------------");

    print("admin ............... ADMIN");
    print("operator_04 ......... OPERATOR");
    print("tester_01 ........... TESTER");
    print("guest ............... GUEST");

    print("--------------------------------");

}


/* =========================================================
   PERMISSIONS
========================================================= */

function showPermissions() {

    if (!canAccess(5)) {

        accessDenied(5);

        return;

    }


    print("");
    print("OMEGA CLEARANCE MATRIX");
    print("--------------------------------");

    print("GUEST ............... 0");
    print("TESTER .............. 1");
    print("OPERATOR ............ 2");
    print("ADMIN ............... 5");

    print("--------------------------------");

}


/* =========================================================
   EVENTS
========================================================= */

function showEvents() {

    print("");
    print("RECENT SYSTEM EVENTS");
    print("--------------------------------");

    print(
        "[SYSTEM] OMEGA CORE INITIALIZED"
    );

    print(
        "[SYSTEM] COMMUNICATION ONLINE"
    );

    print(
        "[SYSTEM] FILESYSTEM ONLINE"
    );

    if (getClearance() >= 2) {

        print(
            "[SECURITY] RESTRICTED ACCESS ENABLED"
        );

    }

    print("--------------------------------");

}


/* =========================================================
   ADMIN SYSTEM
========================================================= */

function showSystem() {

    if (!canAccess(5)) {

        accessDenied(5);

        return;

    }


    print("");
    print("OMEGA ADMINISTRATIVE SYSTEM");
    print("--------------------------------");

    print("system restart");
    print("system shutdown");
    print("system lockdown");

    print("--------------------------------");

}


/* =========================================================
   ACCESS DENIED
========================================================= */

function accessDenied(required) {

    print("");

    print(
        "ACCESS DENIED",
        "error"
    );

    print(
        `REQUIRED CLEARANCE: ${required}`,
        "error"
    );

    print(
        `CURRENT CLEARANCE: ${getClearance()}`,
        "error"
    );

    print("");

}


/* =========================================================
   EASTER EGGS
========================================================= */

function easterEgg(command) {

    switch (command) {


        /* -----------------------------------------
           HELLO
        ----------------------------------------- */

        case "hello":

            print(
                "OMEGA CORE: Hello, operator."
            );

            return true;


        /* -----------------------------------------
           WHOAMI
        ----------------------------------------- */

        case "whoami":

            print(
                `ROLE: ${getRole().toUpperCase()}`
            );

            print(
                `CLEARANCE: ${getClearance()}`
            );

            return true;


        /* -----------------------------------------
           COFFEE
        ----------------------------------------- */

        case "coffee":

            print(
                "COFFEE MACHINE: OFFLINE."
            );

            print(
                "Please stop asking."
            );

            return true;


        /* -----------------------------------------
           SUDO
        ----------------------------------------- */

        case "sudo":

            print(
                "Nice try.",
                "warning"
            );

            return true;


        /* -----------------------------------------
           SMILE
        ----------------------------------------- */

        case "smile":

            print(
                ":)"
            );

            if (Math.random() < 0.4) {

                print(
                    "UNKNOWN PROCESS DETECTED.",
                    "warning"
                );

            }

            return true;


        /* -----------------------------------------
           MR.SMILE
        ----------------------------------------- */

        case "mrsmile":

            print(
                "SEARCHING..."
            );

            print("");

            print(
                "MR.SMILE"
            );

            print(
                "STATUS: NOT FOUND"
            );

            print("");

            print(
                "..."
            );

            print("");

            print(
                "STATUS: FOUND",
                "warning"
            );


            /*
               Передаём событие остальной системе.
            */

            trigger(
                "mrsmile.console",
                {
                    command: command,
                    role: getRole()
                }
            );


            return true;


        /* -----------------------------------------
           MIRROR
        ----------------------------------------- */

        case "mirror":

            print(
                "MIRROR PROTOCOL"
            );

            print(
                "STATUS: LOCKED"
            );


            trigger(
                "mirror.command"
            );


            return true;


        /* -----------------------------------------
           SOURCE
        ----------------------------------------- */

        case "source":

            print(
                "SOURCE"
            );

            print(
                "STATUS: UNKNOWN"
            );

            print(
                "LOCATION: UNKNOWN"
            );


            trigger(
                "source.command"
            );


            return true;


        default:

            return false;

    }

}


/* =========================================================
   HELP
========================================================= */

function showHelp() {

    print("");
    print("AVAILABLE COMMANDS");
    print("--------------------------------");


    Object.entries(commands)
        .forEach(
            ([name, data]) => {

                if (
                    canAccess(
                        data.clearance
                    )
                ) {

                    print(
                        `${name.padEnd(15)} ${data.description}`
                    );

                }

            }
        );


    print("--------------------------------");

}


/* ==========================================================
   SYS_00 — UNKNOWN SYSTEM CHANNEL
========================================================== */

function openSys00Prompt() {

    // Если окно уже существует — не создаём второе
    const existing = document.getElementById("sys00Prompt");

    if (existing) {
        existing.style.display = "flex";
        return;
    }

    const overlay = document.createElement("div");

    overlay.id = "sys00Prompt";

    overlay.innerHTML = `
        <div class="sys00Window">

            <div class="sys00Header">
                <span>OMEGA SYSTEM</span>
                <span>SYS_00</span>
            </div>

            <div class="sys00Body">

                <div class="sys00Warning">
                    UNAUTHORIZED SYSTEM CHANNEL
                </div>

                <div class="sys00Info">
                    CHANNEL: SYS_00<br>
                    STATUS: UNKNOWN<br>
                    SOURCE: LOCAL
                </div>

                <div class="sys00Text">
                    SYS_00 requests initialization.
                    <br><br>
                    Continue?
                </div>

                <div class="sys00Buttons">

                    <button id="sys00Yes">
                        YES
                    </button>

                    <button id="sys00No">
                        NO
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    /* YES */

    document
        .getElementById("sys00Yes")
        .addEventListener("click", () => {

            console.log(
                "[SYS_00] Initialization accepted."
            );

            localStorage.setItem(
                "mrsmile_sys00",
                "1"
            );

            const body =
                overlay.querySelector(".sys00Body");

            body.innerHTML = `
                <div class="sys00Warning">
                    INITIALIZING...
                </div>

                <div class="sys00Info">
                    CHANNEL: SYS_00<br>
                    STATUS: CONNECTING
                </div>
            `;

            setTimeout(() => {

                body.innerHTML = `
                    <div class="sys00Warning">
                        CONNECTION ESTABLISHED
                    </div>

                    <div class="sys00Info">
                        CHANNEL: SYS_00<br>
                        STATUS: IDLE
                    </div>
                `;

                setTimeout(() => {
                    overlay.remove();
                }, 1500);

            }, 1200);

        });


    /* NO */

    document
        .getElementById("sys00No")
        .addEventListener("click", () => {

            console.log(
                "[SYS_00] Initialization cancelled."
            );

            overlay.remove();

        });

}
/* =========================================================
   MAIN COMMAND SYSTEM
========================================================= */

export function runCommand(commandText = null) {

    const input =
        document.getElementById("consoleInput");


    /*
       Если команда не передана,
       берём её из input.
    */

    let command =
        commandText;


    if (command === null) {

        if (!input) return;

        command =
            input.value;

        input.value = "";

    }


    command =
        command.trim().toLowerCase();


    if (!command) return;


    addHistory(command);


    print(
        `> ${command}`,
        "input"
    );


    /*
       Пасхалки
    */

    if (
        easterEgg(command)
    ) {

        showPrompt();

        return;

    }


    /*
       Проверяем существование команды.
    */

    const data =
        commands[command];


    if (!data) {

        print(
            `UNKNOWN COMMAND: ${command}`,
            "error"
        );

        showPrompt();

        return;

    }


    /*
       Проверяем clearance.
    */

    if (
        !canAccess(
            data.clearance
        )
    ) {

        accessDenied(
            data.clearance
        );

        showPrompt();

        return;

    }


    /*
       Выполнение команды.
    */

    switch (command) {

        case "help":

            showHelp();

            break;


        case "status":

            showStatus();

            break;


        case "time":

            showTime();

            break;


        case "clear":

            clearConsole();

            break;


        case "events":

            showEvents();

            break;


        case "diagnostics":

            diagnostics();

            break;


        case "files":

            showFiles();

            break;

        case "sys_00":

             print("SYS_00");

             setTimeout(() => {
                 openSys00Prompt();
             }, 150);

             return true;


        case "personnel":

            showPersonnel();

            break;


        case "messages":

            showMessages();

            break;


        case "security":

            showSecurity();

            break;


        case "users":

            showUsers();

            break;


        case "permissions":

            showPermissions();

            break;


        case "system":

            showSystem();

            break;

    }


    /*
       Сообщаем eventManager,
       что команда была выполнена.
    */

    trigger(
        "console.command",
        {
            command: command,
            role: getRole(),
            clearance: getClearance()
        }
    );


    showPrompt();

}


/* =========================================================
   CLEAR
========================================================= */

function clearConsole() {

    const log =
        document.getElementById("consoleLog");

    if (!log) return;

    log.innerHTML = "";

}


/* =========================================================
   INITIALIZATION
========================================================= */

export function initConsole() {

    const input =
        document.getElementById("consoleInput");

    if (!input) {

        console.warn(
            "[OMEGA CONSOLE] consoleInput not found"
        );

        return;

    }


    /*
       Не добавляем обработчики повторно.
    */

    if (
        input.dataset.consoleInitialized
    ) {

        return;

    }


    input.dataset.consoleInitialized =
        "true";


    input.addEventListener(
        "keydown",
        event => {


            /* ENTER */

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                runCommand();

            }


            /* HISTORY UP */

            if (
                event.key === "ArrowUp"
            ) {

                event.preventDefault();


                if (
                    commandHistory.length === 0
                ) return;


                historyIndex =
                    Math.max(
                        0,
                        historyIndex - 1
                    );


                input.value =
                    commandHistory[
                        historyIndex
                    ] || "";

            }


            /* HISTORY DOWN */

            if (
                event.key === "ArrowDown"
            ) {

                event.preventDefault();


                if (
                    commandHistory.length === 0
                ) return;


                historyIndex =
                    Math.min(
                        commandHistory.length,
                        historyIndex + 1
                    );


                input.value =
                    commandHistory[
                        historyIndex
                    ] || "";

            }

        }
    );


    print(
        "OMEGA SYSTEM CONSOLE",
        "system"
    );

    print(
        "Type 'help' for available commands."
    );

    print("");

    showPrompt();

}


/* =========================================================
   GLOBAL
========================================================= */

window.runCommand =
    runCommand;

window.initConsole =
    initConsole;
