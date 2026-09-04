/* ==========================================================
   NULL SPACE
   Alternate OMEGA interface controlled by NULL
========================================================== */

let nullSpaceActive = false;
let nullSpaceInitialized = false;

const NULL_STORAGE = {
    active: "null_space_active",
    entered: "null_space_entered",
    flags: "null_space_flags"
};


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initNullSpace() {

    if (nullSpaceInitialized) return;

    nullSpaceInitialized = true;

    createNullSpace();

    if (localStorage.getItem(NULL_STORAGE.active) === "1") {
        setTimeout(() => {
            enterNullSpace(false);
        }, 300);
    }

}


/* ==========================================================
   CREATE ROOT
========================================================== */

function createNullSpace() {

    let root = document.getElementById("nullSpaceRoot");

    if (!root) {

        root = document.createElement("div");

        root.id = "nullSpaceRoot";

        document.body.appendChild(root);

    }

    root.className = "hidden";

    root.innerHTML = `

        <div class="nullSpace">

            <!-- ==========================================
                         NULL TOP BAR
            =========================================== -->

            <header class="nullTopBar">

                <div class="nullBrand">

                    <div class="nullBrandMark">
                        0
                    </div>

                    <div class="nullBrandText">

                        <div class="nullBrandTitle">
                            OMEGA
                        </div>

                        <div class="nullBrandSubtitle">
                            INSTANCE / 0
                        </div>

                    </div>

                </div>


                <div class="nullTopStatus">

                    <span class="nullStatusLabel">
                        STATUS
                    </span>

                    <span class="nullStatusValue">
                        —
                    </span>

                </div>

            </header>


            <!-- ==========================================
                         MAIN AREA
            =========================================== -->

            <main class="nullWorkspace">


                <!-- ======================================
                            LEFT NAVIGATION
                ======================================= -->

                <aside class="nullNavigation">

                    <div class="nullNavTitle">
                        OBJECTS
                    </div>


                    <button
                        class="nullNavButton"
                        data-null-window="archive">
                        <span>01</span>
                        ARCHIVE_0
                    </button>


                    <button
                        class="nullNavButton"
                        data-null-window="chat">
                        <span>02</span>
                        CHAT
                    </button>


                    <button
                        class="nullNavButton"
                        data-null-window="memory">
                        <span>03</span>
                        MEMORY
                    </button>


                    <button
                        class="nullNavButton"
                        data-null-window="console">
                        <span>04</span>
                        CONSOLE
                    </button>


                    <button
                        class="nullNavButton"
                        data-null-window="objects">
                        <span>05</span>
                        OBJECTS
                    </button>


                    <button
                        class="nullNavButton"
                        data-null-window="room">
                        <span>06</span>
                        ROOM
                    </button>


                    <div class="nullNavDivider"></div>


                    <button
                        class="nullNavButton nullUnknownButton"
                        data-null-window="unknown">
                        <span>?</span>
                        UNKNOWN
                    </button>


                    <div class="nullNavigationBottom">

                        <div>
                            CONNECTION
                        </div>

                        <strong>
                            00000000
                        </strong>

                    </div>

                </aside>


                <!-- ======================================
                              CONTENT
                ======================================= -->

                <section class="nullMain">


                    <!-- ==================================
                              EMPTY STATE
                    =================================== -->

                    <div
                        id="nullEmptyState"
                        class="nullEmptyState">

                        <div class="nullZero">
                            0
                        </div>

                        <div class="nullEmptyTitle">
                            OMEGA INSTANCE
                        </div>

                        <div class="nullEmptyText">
                            SELECT AN OBJECT
                        </div>

                    </div>


                    <!-- ==================================
                              ARCHIVE
                    =================================== -->

                    <section
                        id="nullWindowArchive"
                        class="nullInternalWindow hidden">

                        <div class="nullWindowHeader">

                            <div>
                                ARCHIVE_0
                            </div>

                            <span>
                                00 / —
                            </span>

                        </div>


                        <div class="nullArchive">

                            <div class="nullArchiveItem">
                                <span>FILE_000</span>
                                <strong>---</strong>
                            </div>

                            <div class="nullArchiveItem">
                                <span>FILE_001</span>
                                <strong>---</strong>
                            </div>

                            <div class="nullArchiveItem">
                                <span>FILE_002</span>
                                <strong>---</strong>
                            </div>

                            <div class="nullArchiveItem nullCorrupt">
                                <span>FILE_003</span>
                                <strong>NULL</strong>
                            </div>

                            <div class="nullArchiveItem">
                                <span>FILE_004</span>
                                <strong>---</strong>
                            </div>

                        </div>

                    </section>


                    <!-- ==================================
                              CHAT
                    =================================== -->

                    <section
                        id="nullWindowChat"
                        class="nullInternalWindow hidden">

                        <div class="nullWindowHeader">

                            <div>
                                CHAT
                            </div>

                            <span>
                                CHANNEL_0
                            </span>

                        </div>


                        <div
                            id="nullChatMessages"
                            class="nullChatMessages">

                            <div class="nullMessage nullSystem">
                                <span>SYSTEM</span>
                                CONNECTION ESTABLISHED.
                            </div>

                            <div class="nullMessage nullUnknownMessage">
                                <span>NULL</span>
                                ...
                            </div>

                        </div>


                        <div class="nullChatInput">

                            <input
                                id="nullChatInput"
                                type="text"
                                autocomplete="off"
                                placeholder="">

                            <button id="nullChatSend">
                                →
                            </button>

                        </div>

                    </section>


                    <!-- ==================================
                              MEMORY
                    =================================== -->

                    <section
                        id="nullWindowMemory"
                        class="nullInternalWindow hidden">

                        <div class="nullWindowHeader">

                            <div>
                                MEMORY
                            </div>

                            <span>
                                READ ONLY
                            </span>

                        </div>


                        <div class="nullMemoryContent">

                            <div class="nullMemoryLine">
                                <span>MEM_000</span>
                                <b>PLAYER</b>
                            </div>

                            <div class="nullMemoryLine">
                                <span>MEM_001</span>
                                <b>OMEGA</b>
                            </div>

                            <div class="nullMemoryLine">
                                <span>MEM_002</span>
                                <b>MR.SMILE</b>
                            </div>

                            <div class="nullMemoryLine">
                                <span>MEM_003</span>
                                <b>NULL</b>
                            </div>

                            <div class="nullMemoryLine nullMemoryBroken">
                                <span>MEM_004</span>
                                <b>????????</b>
                            </div>

                        </div>

                    </section>


                    <!-- ==================================
                              CONSOLE
                    =================================== -->

                    <section
                        id="nullWindowConsole"
                        class="nullInternalWindow hidden">

                        <div class="nullWindowHeader">

                            <div>
                                CONSOLE
                            </div>

                            <span>
                                TERMINAL
                            </span>

                        </div>


                        <pre
                            id="nullConsoleOutput"
                            class="nullConsoleOutput">OMEGA NULL INSTANCE
------------------

type "help"

</pre>


                        <div class="nullConsoleInput">

                            <span>
                                &gt;
                            </span>

                            <input
                                id="nullConsoleCommand"
                                type="text"
                                autocomplete="off">

                        </div>

                    </section>


                    <!-- ==================================
                              OBJECTS
                    =================================== -->

                    <section
                        id="nullWindowObjects"
                        class="nullInternalWindow hidden">

                        <div class="nullWindowHeader">

                            <div>
                                OBJECTS
                            </div>

                            <span>
                                UNKNOWN
                            </span>

                        </div>


                        <div class="nullObjectsGrid">

                            <button class="nullObject">
                                <span>01</span>
                                MIRROR
                            </button>

                            <button class="nullObject">
                                <span>02</span>
                                CHAIR
                            </button>

                            <button class="nullObject">
                                <span>03</span>
                                DOOR
                            </button>

                            <button class="nullObject">
                                <span>04</span>
                                SIGNAL
                            </button>

                            <button class="nullObject">
                                <span>05</span>
                                PLAYER
                            </button>

                            <button class="nullObject nullImpossibleObject">
                                <span>00</span>
                                NULL
                            </button>

                        </div>

                    </section>


                    <!-- ==================================
                              ROOM
                    =================================== -->

                    <section
                        id="nullWindowRoom"
                        class="nullInternalWindow hidden">

                        <div class="nullWindowHeader">

                            <div>
                                ROOM
                            </div>

                            <span>
                                LOCATION UNKNOWN
                            </span>

                        </div>


                        <div class="nullRoom">

                            <div class="nullRoomWall">

                                <div class="nullRoomDoor">
                                    <span>EXIT</span>
                                </div>

                            </div>


                            <div class="nullRoomFloor"></div>


                            <div class="nullRoomObject">

                                <div class="nullChair"></div>

                            </div>


                            <div class="nullRoomText">
                                THERE IS NO REASON
                                TO BE HERE.
                            </div>

                        </div>

                    </section>


                    <!-- ==================================
                              UNKNOWN
                    =================================== -->

                    <section
                        id="nullWindowUnknown"
                        class="nullInternalWindow hidden">

                        <div class="nullWindowHeader">

                            <div>
                                UNKNOWN
                            </div>

                            <span>
                                ?
                            </span>

                        </div>


                        <div class="nullUnknown">

                            <div class="nullUnknownNumber">
                                0
                            </div>

                            <div class="nullUnknownText">

                                <p>YOU ARE NOT SUPPOSED TO SEE THIS.</p>

                                <p>THIS IS NOT PART OF OMEGA.</p>

                                <p class="nullUnknownFinal">
                                    ...
                                </p>

                            </div>

                        </div>

                    </section>


                </section>

            </main>


            <!-- ==========================================
                              BOTTOM BAR
            =========================================== -->

            <footer class="nullTaskbar">

                <div class="nullTaskLeft">

                    <span>
                        OMEGA
                    </span>

                    <span>
                        /
                    </span>

                    <span>
                        INSTANCE_000
                    </span>

                </div>


                <div class="nullTaskCenter">

                    <span id="nullTaskMessage">
                        NOTHING IS WRONG.
                    </span>

                </div>


                <button
                    id="nullReturnButton"
                    class="nullReturnButton">

                    RETURN

                </button>

            </footer>


            <!-- ==========================================
                         BACKGROUND TEXT
            =========================================== -->

            <div class="nullBackgroundCode">

                <span>
                    000000000000000000
                </span>

                <span>
                    null
                </span>

                <span>
                    undefined
                </span>

                <span>
                    OMEGA
                </span>

                <span>
                    0000
                </span>

                <span>
                    NULL
                </span>

            </div>

        </div>
    `;


    bindNullSpaceEvents();

}


/* ==========================================================
   ENTER
========================================================== */

export function enterNullSpace(saveState = true) {

    if (nullSpaceActive) return;

    const root = document.getElementById("nullSpaceRoot");
    const desktop = document.getElementById("desktop");
    const publicSite = document.getElementById("publicSite");
    const loginScreen = document.getElementById("loginScreen");

    if (!root) return;


    nullSpaceActive = true;


    /* Hide normal OMEGA */

    if (desktop) {
        desktop.classList.add("hidden");
        desktop.style.display = "none";
    }

    if (publicSite) {
        publicSite.classList.add("hidden");
        publicSite.style.display = "none";
    }

    if (loginScreen) {
        loginScreen.classList.add("hidden");
        loginScreen.style.display = "none";
    }


    /* Hide normal overlays */

    const overlays = [
        "notificationArea",
        "mrsmileEntity",
        "glitchLayer",
        "eyesLayer"
    ];

    overlays.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.style.display = "none";
        }

    });


    root.classList.remove("hidden");
    root.style.display = "block";


    if (saveState) {
        localStorage.setItem(NULL_STORAGE.active, "1");
        localStorage.setItem(NULL_STORAGE.entered, "1");
    }


    resetNullWindows();

    playNullEntry();


    document.body.classList.add("nullSpaceActive");

}


/* ==========================================================
   EXIT
========================================================== */

export function exitNullSpace() {

    if (!nullSpaceActive) return;

    const root = document.getElementById("nullSpaceRoot");
    const desktop = document.getElementById("desktop");

    nullSpaceActive = false;


    if (root) {

        root.classList.add("hidden");
        root.style.display = "none";

    }


    if (desktop) {

        desktop.classList.remove("hidden");
        desktop.style.display = "";

    }


    const overlays = [
        "notificationArea",
        "mrsmileEntity",
        "glitchLayer",
        "eyesLayer"
    ];

    overlays.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.style.display = "";
        }

    });


    document.body.classList.remove("nullSpaceActive");

    localStorage.removeItem(NULL_STORAGE.active);
    localStorage.setItem(NULL_STORAGE.flags, "returned");

}


/* ==========================================================
   WINDOWS
========================================================== */

function openNullWindow(name) {

    const windows = document.querySelectorAll(
        ".nullInternalWindow"
    );

    windows.forEach(window => {

        window.classList.add("hidden");

    });


    const empty = document.getElementById(
        "nullEmptyState"
    );

    if (empty) {
        empty.classList.add("hidden");
    }


    const target = document.getElementById(
        `nullWindow${capitalize(name)}`
    );

    if (!target) return;

    target.classList.remove("hidden");


    const taskMessage =
        document.getElementById("nullTaskMessage");


    const messages = {

        archive: "ARCHIVE OPEN.",

        chat: "CHANNEL OPEN.",

        memory: "MEMORY ACCESS.",

        console: "CONSOLE READY.",

        objects: "OBJECT DATABASE.",

        room: "LOCATION: UNKNOWN.",

        unknown: "YOU FOUND IT."

    };


    if (taskMessage) {
        taskMessage.textContent =
            messages[name] || "—";
    }

}


/* ==========================================================
   RESET WINDOWS
========================================================== */

function resetNullWindows() {

    document
        .querySelectorAll(".nullInternalWindow")
        .forEach(window => {

            window.classList.add("hidden");

        });


    const empty =
        document.getElementById("nullEmptyState");

    if (empty) {
        empty.classList.remove("hidden");
    }


    const task =
        document.getElementById("nullTaskMessage");

    if (task) {
        task.textContent =
            "NOTHING IS WRONG.";
    }

}


/* ==========================================================
   CHAT
========================================================== */

function sendNullMessage() {

    const input =
        document.getElementById("nullChatInput");

    const messages =
        document.getElementById("nullChatMessages");

    if (!input || !messages) return;

    const text =
        input.value.trim();

    if (!text) return;


    addNullChatMessage(
        "YOU",
        text,
        false
    );


    input.value = "";


    setTimeout(() => {

        respondToNullChat(text);

    }, 900);

}


function addNullChatMessage(
    user,
    text,
    unknown = false
) {

    const messages =
        document.getElementById("nullChatMessages");

    if (!messages) return;


    const element =
        document.createElement("div");

    element.className =
        "nullMessage" +
        (unknown
            ? " nullUnknownMessage"
            : "");


    element.innerHTML = `
        <span>${escapeNullHTML(user)}</span>
        ${escapeNullHTML(text)}
    `;


    messages.appendChild(element);

    messages.scrollTop =
        messages.scrollHeight;

}


function respondToNullChat(text) {

    const message =
        text.toLowerCase().trim();


    let response = "...";


    if (
        message === "hello" ||
        message === "hi" ||
        message === "привет"
    ) {

        response = "Hello.";

    }
    else if (
        message === "null"
    ) {

        response = "Yes.";

    }
    else if (
        message.includes("who are you") ||
        message.includes("кто ты")
    ) {

        response = "You know.";

    }
    else if (
        message.includes("where") ||
        message.includes("где")
    ) {

        response = "Here.";

    }
    else if (
        message.includes("omega")
    ) {

        response = "It was here.";

    }
    else if (
        message.includes("exit") ||
        message.includes("выход")
    ) {

        response = "There is one.";

    }
    else if (
        message.includes("help") ||
        message.includes("помоги")
    ) {

        response = "I cannot.";

    }


    addNullChatMessage(
        "NULL",
        response,
        true
    );


    if (
        message === "exit" ||
        message === "выход"
    ) {

        setTimeout(() => {

            addNullChatMessage(
                "NULL",
                "Wrong way.",
                true
            );

        }, 1300);

    }

}


/* ==========================================================
   CONSOLE
========================================================== */

function executeNullCommand() {

    const input =
        document.getElementById(
            "nullConsoleCommand"
        );

    const output =
        document.getElementById(
            "nullConsoleOutput"
        );

    if (!input || !output) return;


    const command =
        input.value.trim();


    if (!command) return;


    output.textContent +=
        `> ${command}\n`;


    input.value = "";


    let response = "";


    switch (command.toLowerCase()) {

        case "help":

            response =
                "null\n" +
                "omega\n" +
                "integrity\n" +
                "exit\n" +
                "memory\n";

            break;


        case "null":

            response =
                "Outside\n";

            break;


        case "omega":

            response =
                "INSTANCE NOT FOUND\n";

            break;


        case "integrity":

            response =
                "ERR.NEXTNIGHT\n";

            break;


        case "memory":

            response =
                "ACCESS DENIED\n";

            break;


        case "exit":

            response =
                "RETURN PATH FOUND\n";

            setTimeout(
                exitNullSpace,
                1000
            );

            break;


        default:

            response =
                "ERR.UNKNOWN\n";

            break;

    }


    setTimeout(() => {

        output.textContent +=
            response;

        output.scrollTop =
            output.scrollHeight;

    }, 250);

}


/* ==========================================================
   ENTRY EFFECT
========================================================== */

function playNullEntry() {

    const root =
        document.getElementById(
            "nullSpaceRoot"
        );

    if (!root) return;


    root.classList.remove(
        "nullSpaceEntering"
    );


    void root.offsetWidth;


    root.classList.add(
        "nullSpaceEntering"
    );


    setTimeout(() => {

        root.classList.remove(
            "nullSpaceEntering"
        );

    }, 1800);

}


/* ==========================================================
   EVENTS
========================================================== */

function bindNullSpaceEvents() {

    const root =
        document.getElementById(
            "nullSpaceRoot"
        );

    if (!root) return;


    root.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-null-window]"
                );


            if (!button) return;


            const windowName =
                button.dataset.nullWindow;


            openNullWindow(
                windowName
            );

        }
    );


    const returnButton =
        document.getElementById(
            "nullReturnButton"
        );


    if (returnButton) {

        returnButton.addEventListener(
            "click",
            exitNullSpace
        );

    }


    const chatSend =
        document.getElementById(
            "nullChatSend"
        );


    if (chatSend) {

        chatSend.addEventListener(
            "click",
            sendNullMessage
        );

    }


    const chatInput =
        document.getElementById(
            "nullChatInput"
        );


    if (chatInput) {

        chatInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    sendNullMessage();

                }

            }
        );

    }


    const consoleInput =
        document.getElementById(
            "nullConsoleCommand"
        );


    if (consoleInput) {

        consoleInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    executeNullCommand();

                }

            }
        );

    }


    root
        .querySelectorAll(".nullObject")
        .forEach(object => {

            object.addEventListener(
                "click",
                () => {

                    const task =
                        document.getElementById(
                            "nullTaskMessage"
                        );

                    if (!task) return;


                    if (
                        object.classList.contains(
                            "nullImpossibleObject"
                        )
                    ) {

                        task.textContent =
                            "OBJECT DOES NOT EXIST.";

                        setTimeout(() => {

                            task.textContent =
                                "OBJECT EXISTS.";

                        }, 1800);

                        return;

                    }


                    task.textContent =
                        `${object.textContent.trim()} SELECTED.`;

                }
            );

        });

}


/* ==========================================================
   HELPERS
========================================================== */

function capitalize(value) {

    return value.charAt(0).toUpperCase() +
           value.slice(1);

}


function escapeNullHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ==========================================================
   GLOBAL API
========================================================== */

window.enterNullSpace =
    enterNullSpace;

window.exitNullSpace =
    exitNullSpace;

window.initNullSpace =
    initNullSpace;
