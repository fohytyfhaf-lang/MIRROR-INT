/* ==========================================================
   NULL SPACE
   Alternate OMEGA interface controlled by NULL

   VOID ENVIRONMENT
   ----------------------------------------------------------
   - Persistent NULL Space
   - Existing windows preserved
   - Existing chat preserved
   - Existing console preserved
   - Void environment objects
   - Interactive door
   - Physical console node
   - Void lights
   - Structures / pillars
   - Anomaly system
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

    if (
        localStorage.getItem(NULL_STORAGE.active) === "1"
    ) {

        setTimeout(() => {
            enterNullSpace(false);
        }, 300);

    }

}


/* ==========================================================
   CREATE ROOT
========================================================== */

function createNullSpace() {

    let root =
        document.getElementById("nullSpaceRoot");


    if (!root) {

        root =
            document.createElement("div");

        root.id =
            "nullSpaceRoot";

        document.body.appendChild(root);

    }


    root.className = "hidden";


    root.innerHTML = `

        <div class="nullSpace">


            <!-- ==================================================
                 VOID ENVIRONMENT
            =================================================== -->

            <div
                class="nullVoidEnvironment"
                aria-hidden="true">


                <!-- distant structures -->

                <div class="nullVoidStructure structureLeft">
                    <div class="structureFace"></div>
                    <div class="structureFace"></div>
                    <div class="structureFace"></div>
                </div>


                <div class="nullVoidStructure structureRight">
                    <div class="structureFace"></div>
                    <div class="structureFace"></div>
                </div>


                <!-- pillars -->

                <div class="nullVoidPillar pillar01"></div>

                <div class="nullVoidPillar pillar02"></div>

                <div class="nullVoidPillar pillar03"></div>


                <!-- lights -->

                <div
                    class="nullVoidLight light01">

                    <span></span>

                </div>


                <div
                    class="nullVoidLight light02">

                    <span></span>

                </div>


                <div
                    class="nullVoidLight light03">

                    <span></span>

                </div>


                <!-- floor -->

                <div class="nullVoidFloor"></div>


                <!-- ==================================================
                     VOID DOOR
                =================================================== -->

                <button
                    id="nullVoidDoor"
                    class="nullVoidDoor"
                    type="button"
                    aria-label="Void Door">

                    <span
                        class="voidDoorFrame">
                    </span>

                    <span
                        class="voidDoorSurface">
                    </span>

                    <span
                        class="voidDoorLight">
                    </span>

                    <span
                        class="voidDoorLabel">

                        VOID_01

                    </span>

                </button>


                <!-- ==================================================
                     PHYSICAL CONSOLE
                =================================================== -->

                <section
                    id="nullConsoleNode"
                    class="nullConsoleNode">

                    <div class="nullConsoleTop">

                        <span>
                            CONSOLE
                        </span>

                        <span
                            class="consoleStatus">

                            ●

                        </span>

                    </div>


                    <div class="nullConsoleScreen">

                        <div class="consoleLine">

                            <span>
                                &gt;
                            </span>

                            <span
                                id="nullConsoleOutput">

                                READY

                            </span>

                        </div>


                        <div class="consoleCursor">
                            _
                        </div>

                    </div>


                    <div class="nullConsoleBase"></div>

                </section>


                <!-- ==================================================
                     ANOMALIES
                =================================================== -->

                <div
                    class="nullVoidAnomaly anomaly01">

                    000

                </div>


                <div
                    class="nullVoidAnomaly anomaly02">

                    null.err

                </div>


                <div
                    class="nullVoidAnomaly anomaly03">

                    []

                </div>


                <div
                    class="nullVoidAnomaly anomaly04">

                    HELP

                </div>


                <div
                    class="nullVoidAnomaly anomaly05">

                    0

                </div>


                <div
                    class="nullVoidAnomaly anomaly06">

                    ...

                </div>


            </div>


            <!-- ==================================================
                 NULL MOON
                 Kept for future use
            =================================================== -->

            <div
                class="nullMoonVisual"
                aria-hidden="true">

                <div class="nullMoonGlow"></div>

                <div class="nullMoonBody">

                    <div class="nullMoonSurface"></div>

                    <div class="nullMoonShadow"></div>

                    <div class="nullMoonVoid">

                        <span
                            class="nullVoidThread thread1">
                        </span>

                        <span
                            class="nullVoidThread thread2">
                        </span>

                        <span
                            class="nullVoidThread thread3">
                        </span>

                        <span
                            class="nullVoidThread thread4">
                        </span>

                        <span
                            class="nullVoidThread thread5">
                        </span>

                    </div>

                </div>

            </div>


            <!-- ==================================================
                 TOP BAR
            =================================================== -->

            <header class="nullTopBar">


                <div class="nullBrand">


                    <div class="nullBrandMark">
                        0
                    </div>


                    <div class="nullBrandText">

                        <div class="nullBrandTitle">
                            NULL
                        </div>


                        <div class="nullBrandSubtitle">
                            VOID INSTANCE
                        </div>

                    </div>

                </div>


                <div class="nullTopStatus">

                    <span class="nullStatusLabel">
                        STATUS
                    </span>


                    <span
                        id="nullStatusValue"
                        class="nullStatusValue">

                        CONNECTED

                    </span>

                </div>


            </header>


            <!-- ==================================================
                 MAIN AREA
            =================================================== -->

            <main class="nullWorkspace">


                <!-- ==================================================
                     NAVIGATION
                =================================================== -->

                <aside class="nullNavigation">


                    <div class="nullNavTitle">
                        INSTANCE
                    </div>


                    <button
                        class="nullNavButton"
                        data-null-window="archive">

                        <span>01</span>

                        ARCHIVE

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
                        class="
                            nullNavButton
                            nullUnknownButton
                        "
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


                <!-- ==================================================
                     CONTENT
                =================================================== -->

                <section class="nullMain">


                    <!-- EMPTY -->

                    <div
                        id="nullEmptyState"
                        class="nullEmptyState">

                        <div class="nullZero">
                            0
                        </div>


                        <div class="nullEmptyTitle">
                            VOID INSTANCE
                        </div>


                        <div class="nullEmptyText">
                            NOTHING HAS BEEN SELECTED
                        </div>

                    </div>


                    <!-- ==================================================
                         ARCHIVE
                    =================================================== -->

                    <section
                        id="nullWindowArchive"
                        class="
                            nullInternalWindow
                            hidden
                        ">


                        <div class="nullWindowHeader">

                            <div>
                                ARCHIVE
                            </div>

                            <span>
                                00 / —
                            </span>

                        </div>


                        <div class="nullArchive">


                            <div class="nullArchiveItem">

                                <span>
                                    FILE_000
                                </span>

                                <strong>
                                    ---
                                </strong>

                            </div>


                            <div class="nullArchiveItem">

                                <span>
                                    FILE_001
                                </span>

                                <strong>
                                    ---
                                </strong>

                            </div>


                            <div class="nullArchiveItem">

                                <span>
                                    FILE_002
                                </span>

                                <strong>
                                    ---
                                </strong>

                            </div>


                            <div
                                class="
                                    nullArchiveItem
                                    nullCorrupt
                                ">

                                <span>
                                    FILE_003
                                </span>

                                <strong>
                                    NULL
                                </strong>

                            </div>


                            <div class="nullArchiveItem">

                                <span>
                                    FILE_004
                                </span>

                                <strong>
                                    ---
                                </strong>

                            </div>


                        </div>

                    </section>


                    <!-- ==================================================
                         CHAT
                    =================================================== -->

                    <section
                        id="nullWindowChat"
                        class="
                            nullInternalWindow
                            hidden
                        ">


                        <div class="nullWindowHeader">

                            <div>
                                CHAT
                            </div>

                            <span>
                                PRIVATE
                            </span>

                        </div>


                        <div
                            id="nullChatMessages"
                            class="nullChatMessages">


                            <div
                                class="
                                    nullMessage
                                    nullSystem
                                ">

                                <span>
                                    SYSTEM
                                </span>

                                CONNECTION ESTABLISHED.

                            </div>


                            <div
                                class="
                                    nullMessage
                                    nullUnknownMessage
                                ">

                                <span>
                                    NULL
                                </span>

                                ...

                            </div>


                        </div>


                        <div class="nullChatInput">


                            <input
                                id="nullChatInput"
                                type="text"
                                autocomplete="off"
                                placeholder="TYPE A MESSAGE">


                            <button
                                id="nullChatSend">

                                →

                            </button>


                        </div>


                    </section>


                    <!-- ==================================================
                         MEMORY
                    =================================================== -->

                    <section
                        id="nullWindowMemory"
                        class="
                            nullInternalWindow
                            hidden
                        ">


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

                                <span>
                                    MEM_000
                                </span>

                                <b>
                                    PLAYER
                                </b>

                            </div>


                            <div class="nullMemoryLine">

                                <span>
                                    MEM_001
                                </span>

                                <b>
                                    OMEGA
                                </b>

                            </div>


                            <div class="nullMemoryLine">

                                <span>
                                    MEM_002
                                </span>

                                <b>
                                    MR.SMILE
                                </b>

                            </div>


                            <div class="nullMemoryLine">

                                <span>
                                    MEM_003
                                </span>

                                <b>
                                    NULL
                                </b>

                            </div>


                            <div
                                class="
                                    nullMemoryLine
                                    nullMemoryBroken
                                ">

                                <span>
                                    MEM_004
                                </span>

                                <b>
                                    ????????
                                </b>

                            </div>


                        </div>

                    </section>


                    <!-- ==================================================
                         CONSOLE
                    =================================================== -->

                    <section
                        id="nullWindowConsole"
                        class="
                            nullInternalWindow
                            hidden
                        ">


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
                            class="nullConsoleOutput">NULL INSTANCE
-------------

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


                    <!-- ==================================================
                         OBJECTS
                    =================================================== -->

                    <section
                        id="nullWindowObjects"
                        class="
                            nullInternalWindow
                            hidden
                        ">


                        <div class="nullWindowHeader">

                            <div>
                                OBJECTS
                            </div>

                            <span>
                                VOID
                            </span>

                        </div>


                        <div class="nullObjectsGrid">


                            <button class="nullObject">

                                <span>
                                    01
                                </span>

                                MIRROR

                            </button>


                            <button class="nullObject">

                                <span>
                                    02
                                </span>

                                CHAIR

                            </button>


                            <button class="nullObject">

                                <span>
                                    03
                                </span>

                                DOOR

                            </button>


                            <button class="nullObject">

                                <span>
                                    04
                                </span>

                                SIGNAL

                            </button>


                            <button class="nullObject">

                                <span>
                                    05
                                </span>

                                PLAYER

                            </button>


                            <button
                                class="
                                    nullObject
                                    nullImpossibleObject
                                ">

                                <span>
                                    00
                                </span>

                                NULL

                            </button>


                        </div>

                    </section>


                    <!-- ==================================================
                         ROOM
                    =================================================== -->

                    <section
                        id="nullWindowRoom"
                        class="
                            nullInternalWindow
                            hidden
                        ">


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

                                    <span>
                                        EXIT
                                    </span>

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


                    <!-- ==================================================
                         UNKNOWN
                    =================================================== -->

                    <section
                        id="nullWindowUnknown"
                        class="
                            nullInternalWindow
                            hidden
                        ">


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

                                <p>
                                    YOU ARE NOT SUPPOSED
                                    TO SEE THIS.
                                </p>


                                <p>
                                    THIS IS NOT PART OF OMEGA.
                                </p>


                                <p class="nullUnknownFinal">
                                    ...
                                </p>

                            </div>


                        </div>


                    </section>


                </section>


            </main>


            <!-- ==================================================
                 TASKBAR
            =================================================== -->

            <footer class="nullTaskbar">


                <div class="nullTaskLeft">

                    <span>
                        NULL
                    </span>

                    <span>
                        /
                    </span>

                    <span>
                        VOID
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


            <!-- ==================================================
                 BACKGROUND DATA
            =================================================== -->

            <div
                class="nullBackgroundCode"
                aria-hidden="true">

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
                    0000
                </span>

                <span>
                    NULL
                </span>

            </div>


        </div>

    `;


    createNullVoidEnvironment(root);

    bindNullSpaceEvents();

}


/* ==========================================================
   VOID ENVIRONMENT
========================================================== */

function createNullVoidEnvironment(root) {

    const environment =
        root.querySelector(
            ".nullVoidEnvironment"
        );

    if (!environment) return;


    /* ======================================================
       DOOR
    ====================================================== */

    const door =
        environment.querySelector(
            "#nullVoidDoor"
        );


    if (door) {

        door.addEventListener(
            "click",
            handleVoidDoor
        );

    }


    /* ======================================================
       PHYSICAL CONSOLE
    ====================================================== */

    const consoleNode =
        environment.querySelector(
            "#nullConsoleNode"
        );


    if (consoleNode) {

        consoleNode.addEventListener(
            "click",
            handleVoidConsole
        );

    }


    /* ======================================================
       VERY SLOW ENVIRONMENT MOTION
    ====================================================== */

    let time = 0;


    function animateVoid() {

        if (!nullSpaceActive) {

            requestAnimationFrame(
                animateVoid
            );

            return;

        }


        time += 0.00035;


        environment.style.setProperty(
            "--nullVoidOffset",
            `${Math.sin(time) * 5}px`
        );


        requestAnimationFrame(
            animateVoid
        );

    }


    animateVoid();

}


/* ==========================================================
   VOID DOOR
========================================================== */

function handleVoidDoor() {

    const door =
        document.getElementById(
            "nullVoidDoor"
        );

    if (!door) return;


    const isOpen =
        door.classList.toggle("open");


    const task =
        document.getElementById(
            "nullTaskMessage"
        );


    const output =
        document.getElementById(
            "nullConsoleOutput"
        );


    if (isOpen) {

        if (task) {

            task.textContent =
                "VOID DOOR OPEN.";

        }

        if (output) {

            output.textContent +=
                "\n> door\nDOOR_OPEN\n";

        }

    }
    else {

        if (task) {

            task.textContent =
                "VOID DOOR CLOSED.";

        }

        if (output) {

            output.textContent +=
                "\n> door\nDOOR_CLOSED\n";

        }

    }

}


/* ==========================================================
   PHYSICAL VOID CONSOLE
========================================================== */

function handleVoidConsole() {

    const consoleNode =
        document.getElementById(
            "nullConsoleNode"
        );

    const output =
        document.getElementById(
            "nullConsoleOutput"
        );

    const task =
        document.getElementById(
            "nullTaskMessage"
        );


    if (!consoleNode) return;


    consoleNode.classList.add("active");


    const responses = [

        "READY",

        "000",

        "NULL",

        "OUTSIDE",

        "ERR.NULL",

        "INSTANCE",

        "..."

    ];


    const response =
        responses[
            Math.floor(
                Math.random() *
                responses.length
            )
        ];


    if (output) {

        output.textContent =
            response;

    }


    if (task) {

        task.textContent =
            `CONSOLE: ${response}`;

    }


    setTimeout(() => {

        consoleNode.classList.remove(
            "active"
        );

    }, 700);

}


/* ==========================================================
   ENTER
========================================================== */

export function enterNullSpace(
    saveState = true
) {

    if (nullSpaceActive) return;


    const root =
        document.getElementById(
            "nullSpaceRoot"
        );


    const desktop =
        document.getElementById(
            "desktop"
        );


    const publicSite =
        document.getElementById(
            "publicSite"
        );


    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    if (!root) return;


    nullSpaceActive = true;


    /* ======================================================
       HIDE NORMAL OMEGA
    ====================================================== */

    if (desktop) {

        desktop.classList.add("hidden");

        desktop.style.display =
            "none";

    }


    if (publicSite) {

        publicSite.classList.add("hidden");

        publicSite.style.display =
            "none";

    }


    if (loginScreen) {

        loginScreen.classList.add("hidden");

        loginScreen.style.display =
            "none";

    }


    /* ======================================================
       HIDE NORMAL OVERLAYS
    ====================================================== */

    const overlays = [

        "notificationArea",

        "mrsmileEntity",

        "glitchLayer",

        "eyesLayer"

    ];


    overlays.forEach(id => {

        const element =
            document.getElementById(id);


        if (element) {

            element.style.display =
                "none";

        }

    });


    /* ======================================================
       SHOW NULL
    ====================================================== */

    root.classList.remove(
        "hidden"
    );


    root.style.display =
        "block";


    /* ======================================================
       STATE
    ====================================================== */

    if (saveState) {

        localStorage.setItem(
            NULL_STORAGE.active,
            "1"
        );


        localStorage.setItem(
            NULL_STORAGE.entered,
            "1"
        );

    }


    resetNullWindows();

    resetVoidEnvironment();

    playNullEntry();


    document.body.classList.add(
        "nullSpaceActive"
    );

}


/* ==========================================================
   EXIT
========================================================== */

export function exitNullSpace() {

    if (!nullSpaceActive) return;


    const root =
        document.getElementById(
            "nullSpaceRoot"
        );


    const desktop =
        document.getElementById(
            "desktop"
        );


    nullSpaceActive = false;


    /* ======================================================
       HIDE NULL
    ====================================================== */

    if (root) {

        root.classList.add(
            "hidden"
        );

        root.style.display =
            "none";

    }


    /* ======================================================
       RESTORE OMEGA
    ====================================================== */

    if (desktop) {

        desktop.classList.remove(
            "hidden"
        );

        desktop.style.display =
            "";

    }


    /* ======================================================
       RESTORE OVERLAYS
    ====================================================== */

    const overlays = [

        "notificationArea",

        "mrsmileEntity",

        "glitchLayer",

        "eyesLayer"

    ];


    overlays.forEach(id => {

        const element =
            document.getElementById(id);


        if (element) {

            element.style.display =
                "";

        }

    });


    document.body.classList.remove(
        "nullSpaceActive"
    );


    localStorage.removeItem(
        NULL_STORAGE.active
    );


    localStorage.setItem(
        NULL_STORAGE.flags,
        "returned"
    );

}


/* ==========================================================
   RESET VOID
========================================================== */

function resetVoidEnvironment() {

    const door =
        document.getElementById(
            "nullVoidDoor"
        );


    const output =
        document.getElementById(
            "nullConsoleOutput"
        );


    const task =
        document.getElementById(
            "nullTaskMessage"
        );


    const consoleNode =
        document.getElementById(
            "nullConsoleNode"
        );


    if (door) {

        door.classList.remove(
            "open"
        );

    }


    if (consoleNode) {

        consoleNode.classList.remove(
            "active"
        );

    }


    if (output) {

        output.textContent =
            "NULL INSTANCE\n" +
            "-------------\n\n" +
            'type "help"\n\n';

    }


    if (task) {

        task.textContent =
            "NOTHING IS WRONG.";

    }

}


/* ==========================================================
   WINDOWS
========================================================== */

function openNullWindow(name) {

    const windows =
        document.querySelectorAll(
            ".nullInternalWindow"
        );


    windows.forEach(window => {

        window.classList.add(
            "hidden"
        );

    });


    const empty =
        document.getElementById(
            "nullEmptyState"
        );


    if (empty) {

        empty.classList.add(
            "hidden"
        );

    }


    const target =
        document.getElementById(
            `nullWindow${capitalize(name)}`
        );


    if (!target) return;


    target.classList.remove(
        "hidden"
    );


    const taskMessage =
        document.getElementById(
            "nullTaskMessage"
        );


    const messages = {

        archive:
            "ARCHIVE OPEN.",

        chat:
            "PRIVATE CHANNEL OPEN.",

        memory:
            "MEMORY ACCESS.",

        console:
            "CONSOLE READY.",

        objects:
            "OBJECT DATABASE.",

        room:
            "LOCATION UNKNOWN.",

        unknown:
            "YOU FOUND IT."

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
        .querySelectorAll(
            ".nullInternalWindow"
        )
        .forEach(window => {

            window.classList.add(
                "hidden"
            );

        });


    const empty =
        document.getElementById(
            "nullEmptyState"
        );


    if (empty) {

        empty.classList.remove(
            "hidden"
        );

    }


    const task =
        document.getElementById(
            "nullTaskMessage"
        );


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
        document.getElementById(
            "nullChatInput"
        );


    const messages =
        document.getElementById(
            "nullChatMessages"
        );


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


/* ==========================================================
   ADD CHAT MESSAGE
========================================================== */

function addNullChatMessage(
    user,
    text,
    unknown = false
) {

    const messages =
        document.getElementById(
            "nullChatMessages"
        );


    if (!messages) return;


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "nullMessage" +
        (
            unknown
                ? " nullUnknownMessage"
                : ""
        );


    element.innerHTML = `

        <span>
            ${escapeNullHTML(user)}
        </span>

        ${escapeNullHTML(text)}

    `;


    messages.appendChild(
        element
    );


    messages.scrollTop =
        messages.scrollHeight;

}


/* ==========================================================
   NULL CHAT RESPONSE
========================================================== */

function respondToNullChat(text) {

    const message =
        text.toLowerCase().trim();


    let response = "...";


    if (
        message === "hello" ||
        message === "hi" ||
        message === "привет"
    ) {

        response =
            "Hello.";

    }


    else if (
        message === "null"
    ) {

        response =
            "Yes.";

    }


    else if (
        message.includes("who are you") ||
        message.includes("кто ты")
    ) {

        response =
            "You know.";

    }


    else if (
        message.includes("where") ||
        message.includes("где")
    ) {

        response =
            "Here.";

    }


    else if (
        message.includes("omega")
    ) {

        response =
            "It was here.";

    }


    else if (
        message.includes("exit") ||
        message.includes("выход")
    ) {

        response =
            "There is one.";

    }


    else if (
        message.includes("help") ||
        message.includes("помоги")
    ) {

        response =
            "I cannot.";

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


    switch (
        command.toLowerCase()
    ) {


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


    /* ======================================================
       NAVIGATION
    ====================================================== */

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


    /* ======================================================
       RETURN
    ====================================================== */

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


    /* ======================================================
       CHAT
    ====================================================== */

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


    /* ======================================================
       CONSOLE
    ====================================================== */

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


    /* ======================================================
       OBJECTS
    ====================================================== */

    root
        .querySelectorAll(
            ".nullObject"
        )
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

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

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
