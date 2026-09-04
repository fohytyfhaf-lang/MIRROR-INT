/* ==========================================================
   NULL SPACE
   Anomalous World Controller
   ========================================================== */

let nullSpaceActive = false;
let nullSpaceInitialized = false;
let nullEventTimer = null;
let nullEyeTimer = null;
let nullAnomalyLevel = 0;
let nullInsultCount = 0;
let nullBanned = false;
let nullDoorOpen = false;
let nullCurrentRoom = "main";

const NULL_STORAGE = {
    active: "null_space_active",
    entered: "null_space_entered",
    flags: "null_space_flags",
    reputation: "null_space_reputation",
    banned: "null_space_banned"
};


/* ==========================================================
   INIT
========================================================== */

export function initNullSpace() {
    if (nullSpaceInitialized) return;

    nullSpaceInitialized = true;

    loadNullState();
    createNullSpace();
    bindNullSpaceEvents();

    if (localStorage.getItem(NULL_STORAGE.active) === "1") {
        setTimeout(() => enterNullSpace(false), 300);
    }
}


/* ==========================================================
   STATE
========================================================== */

function loadNullState() {
    nullInsultCount = Number(
        localStorage.getItem(NULL_STORAGE.reputation) || 0
    );

    nullBanned =
        localStorage.getItem(NULL_STORAGE.banned) === "1";
}


function saveNullState() {
    localStorage.setItem(
        NULL_STORAGE.reputation,
        String(nullInsultCount)
    );

    localStorage.setItem(
        NULL_STORAGE.banned,
        nullBanned ? "1" : "0"
    );
}


/* ==========================================================
   CREATE
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

        <!-- ==================================================
             VOID WORLD
        ================================================== -->

        <div class="nullVoidWorld">

            <div class="nullVoidBackdrop"></div>

            <div class="nullVoidRoom room-main">

                <div class="nullVoidCeiling"></div>

                <div class="nullVoidWall wall-back"></div>
                <div class="nullVoidWall wall-left"></div>
                <div class="nullVoidWall wall-right"></div>

                <div class="nullVoidFloor"></div>

                <!-- LIGHTS -->

                <div class="nullVoidLight light-1"
                     data-null-light="1"></div>

                <div class="nullVoidLight light-2"
                     data-null-light="2"></div>

                <div class="nullVoidLight light-3"
                     data-null-light="3"></div>

                <div class="nullVoidLight light-4"
                     data-null-light="4"></div>

                <!-- PILLARS -->

                <div class="nullVoidPillar pillar-1"></div>
                <div class="nullVoidPillar pillar-2"></div>
                <div class="nullVoidPillar pillar-3"></div>
                <div class="nullVoidPillar pillar-4"></div>

                <!-- DOOR -->

                <div
                    class="nullWorldDoor"
                    data-null-object="door"
                    data-door="main">

                    <div class="nullDoorFrame"></div>

                    <div class="nullDoorPanel">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div class="nullDoorStatus">
                        CLOSED
                    </div>

                </div>

                <!-- BEYOND DOOR -->

                <div class="nullDoorBeyond">

                    <div class="nullBeyondLight"></div>

                    <div class="nullBeyondHall">

                        <div class="nullBeyondPillar"></div>
                        <div class="nullBeyondPillar"></div>
                        <div class="nullBeyondPillar"></div>

                        <div class="nullBeyondEyePoint"></div>

                    </div>

                </div>


                <!-- PHYSICAL CONSOLE -->

                <div
                    class="nullWorldConsole"
                    data-null-object="console">

                    <div class="nullConsoleScreen">
                        <span>NULL//CONSOLE</span>
                        <span class="nullConsoleCursor">_</span>
                    </div>

                    <div class="nullConsoleBody">
                        <i></i>
                        <i></i>
                        <i></i>
                    </div>

                </div>


                <!-- 431434 -->

                <div
                    class="nullWorldBlackBlock"
                    data-null-object="431434"
                    title="431434">

                    <span>431434</span>

                </div>


                <!-- DISRUPTION -->

                <div
                    class="nullWorldDisruption"
                    data-null-object="disruption">

                    <span>???</span>
                    <span>NULL</span>
                    <span>ERR</span>

                </div>


                <!-- IT -->

                <div
                    class="nullWorldIt"
                    data-null-object="it">

                    <span>404</span>
                    <span>!</span>
                    <span>!</span>

                </div>


                <!-- HELLO -->

                <div
                    class="nullWorldHello"
                    data-null-object="hello">

                    HELLO

                </div>


                <!-- EXIT -->

                <div
                    class="nullWorldExit"
                    data-null-object="exit">

                    <span>53135</span>
                    <span>EXIT</span>

                </div>


                <!-- NULL -->

                <div class="nullEntity">
                    <div class="nullEntityHead"></div>
                    <div class="nullEntityBody"></div>
                    <div class="nullEntityGlow"></div>
                </div>


                <!-- EYES -->

                <div class="nullEyeField"></div>


                <!-- CROSS -->

                <div class="nullHelloCross">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>


                <!-- WORLD CODE -->

                <div class="nullWorldCode">

                    <span>00000000</span>
                    <span>ERR.NULL</span>
                    <span>431434</span>
                    <span>000</span>
                    <span>VOID</span>

                </div>

            </div>


            <!-- EVENT OVERLAY -->

            <div class="nullEventOverlay"></div>

            <div class="nullEventText"></div>

            <div class="nullHeartbeat"></div>

            <div class="nullStatic"></div>

        </div>


        <!-- ==================================================
             UI
        ================================================== -->

        <div class="nullInterface">

            <header class="nullTopBar">

                <div class="nullBrand">

                    <div class="nullBrandMark">
                        0
                    </div>

                    <div>
                        <div class="nullBrandTitle">
                            NULL
                        </div>

                        <div class="nullBrandSubtitle">
                            SPACE / INSTANCE 0
                        </div>
                    </div>

                </div>


                <div class="nullStatus">

                    <span class="nullStatusLabel">
                        CONNECTION
                    </span>

                    <strong
                        class="nullStatusValue">
                        00000000
                    </strong>

                </div>

            </header>


            <main class="nullWorkspace">

                <!-- NAV -->

                <aside class="nullNavigation">

                    <div class="nullNavigationTitle">
                        OBJECTS
                    </div>

                    <button
                        class="nullNavButton"
                        data-null-window="archive">
                        01&nbsp;&nbsp;ARCHIVE_0
                    </button>

                    <button
                        class="nullNavButton"
                        data-null-window="chat">
                        02&nbsp;&nbsp;CHAT
                    </button>

                    <button
                        class="nullNavButton"
                        data-null-window="memory">
                        03&nbsp;&nbsp;MEMORY
                    </button>

                    <button
                        class="nullNavButton"
                        data-null-window="console">
                        04&nbsp;&nbsp;CONSOLE
                    </button>

                    <button
                        class="nullNavButton"
                        data-null-window="objects">
                        05&nbsp;&nbsp;OBJECTS
                    </button>

                    <button
                        class="nullNavButton"
                        data-null-window="room">
                        06&nbsp;&nbsp;ROOM
                    </button>

                    <button
                        class="nullNavButton"
                        data-null-window="unknown">
                        ?&nbsp;&nbsp;UNKNOWN
                    </button>


                    <div class="nullNavigationBottom">

                        <span>
                            CONNECTION
                        </span>

                        <strong>
                            00000000
                        </strong>

                    </div>

                </aside>


                <!-- MAIN -->

                <section class="nullMain">

                    <div class="nullEmptyState">

                        <div class="nullEmptyZero">
                            0
                        </div>

                        <div>
                            NOTHING IS WRONG.
                        </div>

                    </div>


                    <!-- ARCHIVE -->

                    <section
                        id="nullWindowArchive"
                        class="nullInternalWindow">

                        <div class="nullWindowHeader">
                            ARCHIVE_0
                        </div>

                        <div class="nullArchiveList">

                            <div>FILE_000</div>
                            <div>FILE_001</div>
                            <div>FILE_002</div>
                            <div>FILE_003</div>
                            <div class="corrupt">
                                FILE_004
                                <small>NULL</small>
                            </div>

                        </div>

                    </section>


                    <!-- CHAT -->

                    <section
                        id="nullWindowChat"
                        class="nullInternalWindow">

                        <div class="nullWindowHeader">
                            CHANNEL // NULL
                        </div>

                        <div
                            id="nullChatMessages"
                            class="nullChatMessages">

                            <div class="nullMessage nullSystemMessage">
                                <b>SYSTEM</b>
                                <span>
                                    NULL INSTANCE CONNECTED.
                                </span>
                            </div>

                        </div>

                        <div class="nullChatInputRow">

                            <input
                                id="nullChatInput"
                                autocomplete="off"
                                placeholder="message">

                            <button id="nullChatSend">
                                SEND
                            </button>

                        </div>

                    </section>


                    <!-- MEMORY -->

                    <section
                        id="nullWindowMemory"
                        class="nullInternalWindow">

                        <div class="nullWindowHeader">
                            MEMORY
                        </div>

                        <div class="nullMemoryList">

                            <div>MEM_000 — PLAYER</div>
                            <div>MEM_001 — OMEGA</div>
                            <div>MEM_002 — MR.SMILE</div>
                            <div>MEM_003 — NULL</div>
                            <div>MEM_004 — ????????</div>

                        </div>

                    </section>


                    <!-- CONSOLE -->

                    <section
                        id="nullWindowConsole"
                        class="nullInternalWindow">

                        <div class="nullWindowHeader">
                            CONSOLE
                        </div>

                        <div
                            id="nullConsoleOutput"
                            class="nullConsoleOutput">

                            OMEGA NULL INSTANCE<br>
                            TYPE "help"

                        </div>

                        <div class="nullConsoleInputRow">

                            <span>&gt;</span>

                            <input
                                id="nullConsoleCommand"
                                autocomplete="off">

                        </div>

                    </section>


                    <!-- OBJECTS -->

                    <section
                        id="nullWindowObjects"
                        class="nullInternalWindow">

                        <div class="nullWindowHeader">
                            OBJECT DATABASE
                        </div>

                        <div class="nullObjectGrid">

                            <button
                                class="nullObject"
                                data-null-object="mirror">
                                MIRROR
                            </button>

                            <button
                                class="nullObject"
                                data-null-object="chair">
                                CHAIR
                            </button>

                            <button
                                class="nullObject"
                                data-null-object="door">
                                DOOR
                            </button>

                            <button
                                class="nullObject"
                                data-null-object="signal">
                                SIGNAL
                            </button>

                            <button
                                class="nullObject"
                                data-null-object="player">
                                PLAYER
                            </button>

                            <button
                                class="nullObject nullImpossibleObject"
                                data-null-object="null">
                                NULL
                            </button>

                        </div>

                    </section>


                    <!-- ROOM -->

                    <section
                        id="nullWindowRoom"
                        class="nullInternalWindow">

                        <div class="nullWindowHeader">
                            LOCATION
                        </div>

                        <div class="nullRoomData">

                            <div>
                                ROOM:
                                <strong id="nullRoomName">
                                    MAIN
                                </strong>
                            </div>

                            <div>
                                OBJECTS:
                                <strong id="nullRoomObjects">
                                    07
                                </strong>
                            </div>

                            <div>
                                INTEGRITY:
                                <strong id="nullRoomIntegrity">
                                    UNKNOWN
                                </strong>
                            </div>

                        </div>

                    </section>


                    <!-- UNKNOWN -->

                    <section
                        id="nullWindowUnknown"
                        class="nullInternalWindow">

                        <div class="nullWindowHeader">
                            UNKNOWN
                        </div>

                        <div class="nullUnknownContent">

                            <div class="nullUnknownBig">
                                0
                            </div>

                            <p>
                                YOU ARE NOT SUPPOSED TO SEE THIS.
                            </p>

                            <p>
                                THIS IS NOT PART OF OMEGA.
                            </p>

                            <p>
                                ...
                            </p>

                        </div>

                    </section>

                </section>

            </main>


            <!-- TASKBAR -->

            <footer class="nullTaskbar">

                <span id="nullTaskMessage">
                    NOTHING IS WRONG.
                </span>

                <button id="nullReturnButton">
                    RETURN
                </button>

            </footer>

        </div>

    </div>
    `;

    root.classList.remove("hidden");

    if (nullBanned) {
        showNullBanScreen();
    }
}


/* ==========================================================
   ENTER / EXIT
========================================================== */

export function enterNullSpace(saveState = true) {

    if (nullSpaceActive) return;

    const root = document.getElementById("nullSpaceRoot");

    if (!root) return;

    nullSpaceActive = true;

    const desktop =
        document.getElementById("desktop");

    const publicSite =
        document.getElementById("publicSite");

    const loginScreen =
        document.getElementById("loginScreen");

    if (desktop) desktop.classList.add("hidden");
    if (publicSite) publicSite.classList.add("hidden");
    if (loginScreen) loginScreen.classList.add("hidden");

    const overlays = [
        "notificationArea",
        "mrsmileEntity",
        "glitchLayer",
        "eyesLayer"
    ];

    overlays.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    root.classList.remove("hidden");

    document.body.classList.add("nullSpaceActive");

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
    playNullEntry();

    if (nullBanned) {
        showNullBanScreen();
        return;
    }

    startNullEvents();
}


export function exitNullSpace() {

    if (!nullSpaceActive) return;

    nullSpaceActive = false;

    stopNullEvents();

    const root =
        document.getElementById("nullSpaceRoot");

    if (root) root.classList.add("hidden");

    const desktop =
        document.getElementById("desktop");

    const publicSite =
        document.getElementById("publicSite");

    const loginScreen =
        document.getElementById("loginScreen");

    if (desktop) desktop.classList.remove("hidden");

    if (publicSite)
        publicSite.classList.remove("hidden");

    if (loginScreen)
        loginScreen.classList.remove("hidden");

    [
        "notificationArea",
        "mrsmileEntity",
        "glitchLayer",
        "eyesLayer"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "";
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
   WINDOWS
========================================================== */

export function openNullWindow(name) {

    if (nullBanned) return;

    const root =
        document.getElementById("nullSpaceRoot");

    if (!root) return;

    root.querySelectorAll(
        ".nullInternalWindow"
    ).forEach(window => {
        window.classList.remove("active");
    });

    const empty =
        root.querySelector(".nullEmptyState");

    if (empty)
        empty.classList.add("hidden");

    const id =
        "nullWindow" +
        capitalize(name);

    const target =
        document.getElementById(id);

    if (target)
        target.classList.add("active");

    setNullTask({
        archive: "ARCHIVE OPEN.",
        chat: "CHANNEL OPEN.",
        memory: "MEMORY ACCESS.",
        console: "CONSOLE READY.",
        objects: "OBJECT DATABASE.",
        room: `LOCATION: ${nullCurrentRoom.toUpperCase()}.`,
        unknown: "YOU FOUND IT."
    }[name] || "UNKNOWN.");
}


function resetNullWindows() {

    const root =
        document.getElementById("nullSpaceRoot");

    if (!root) return;

    root.querySelectorAll(
        ".nullInternalWindow"
    ).forEach(window => {
        window.classList.remove("active");
    });

    const empty =
        root.querySelector(".nullEmptyState");

    if (empty)
        empty.classList.remove("hidden");

    setNullTask("NOTHING IS WRONG.");
}


/* ==========================================================
   DOOR
========================================================== */

function toggleNullDoor() {

    if (nullBanned) return;

    const door =
        document.querySelector(".nullWorldDoor");

    if (!door) return;

    nullDoorOpen = !nullDoorOpen;

    door.classList.toggle(
        "is-open",
        nullDoorOpen
    );

    const status =
        door.querySelector(".nullDoorStatus");

    if (status) {
        status.textContent =
            nullDoorOpen
                ? "OPEN"
                : "CLOSED";
    }

    triggerScreenPulse(
        nullDoorOpen ? "door-open" : "door-close"
    );

    if (nullDoorOpen) {

        setNullTask(
            "DOOR OPENED. LOCATION BEHIND: UNKNOWN."
        );

        revealDoorBeyond();

        setTimeout(() => {

            if (Math.random() < 0.35) {
                spawnEyeCluster(true);
            }

        }, 800);

    } else {

        setNullTask("DOOR CLOSED.");

        hideDoorBeyond();
    }
}


function revealDoorBeyond() {

    const beyond =
        document.querySelector(
            ".nullDoorBeyond"
        );

    if (beyond)
        beyond.classList.add("visible");
}


function hideDoorBeyond() {

    const beyond =
        document.querySelector(
            ".nullDoorBeyond"
        );

    if (beyond)
        beyond.classList.remove("visible");
}


/* ==========================================================
   EYES
========================================================== */

function spawnNullEye(behindDoor = false) {

    const field =
        document.querySelector(
            ".nullEyeField"
        );

    if (!field) return;

    const eye =
        document.createElement("button");

    eye.className = "nullEye";

    if (behindDoor)
        eye.classList.add("behind-door");

    eye.style.left =
        `${10 + Math.random() * 80}%`;

    eye.style.top =
        `${12 + Math.random() * 65}%`;

    eye.innerHTML = `
        <span class="nullEyeOuter">
            <span class="nullEyePupil"></span>
        </span>
    `;

    field.appendChild(eye);

    eye.addEventListener("mouseenter", () => {

        if (Math.random() < 0.75) {

            eye.classList.add(
                "eye-flee"
            );

            setTimeout(() => {
                eye.remove();
            }, 220);

        }

    });

    eye.addEventListener("click", event => {

        event.stopPropagation();

        setNullTask("IT SAW YOU.");

        triggerScreenPulse("eye");

        eye.classList.add(
            "eye-destroy"
        );

        setTimeout(() => {
            eye.remove();
        }, 250);
    });

    setTimeout(() => {

        if (eye.isConnected) {
            eye.classList.add(
                "eye-fade"
            );

            setTimeout(
                () => eye.remove(),
                700
            );
        }

    }, 2500 + Math.random() * 5000);
}


function spawnEyeCluster(behindDoor = false) {

    const count =
        1 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {

        setTimeout(() => {
            spawnNullEye(behindDoor);
        }, i * 170);
    }

    setNullTask(
        count === 1
            ? "SOMETHING IS WATCHING."
            : "THEY ARE WATCHING."
    );
}


function clearEyes() {

    document
        .querySelectorAll(".nullEye")
        .forEach(eye => eye.remove());
}


/* ==========================================================
   LIGHTS
========================================================== */

function flickerNullLights(force = false) {

    const lights =
        [...document.querySelectorAll(
            ".nullVoidLight"
        )];

    if (!lights.length) return;

    const selected =
        force
            ? lights
            : lights.filter(
                () => Math.random() < 0.55
            );

    selected.forEach((light, index) => {

        setTimeout(() => {

            light.classList.toggle(
                "is-off"
            );

        }, index * 120);

    });

    setNullTask("LIGHTING INSTABILITY.");

    setTimeout(() => {

        selected.forEach(light => {
            light.classList.remove(
                "is-off"
            );
        });

    }, 900 + Math.random() * 1400);
}


/* ==========================================================
   DISRUPTION
========================================================== */

function triggerDisruption() {

    const object =
        document.querySelector(
            ".nullWorldDisruption"
        );

    if (!object) return;

    object.classList.add(
        "is-active"
    );

    setNullTask(
        "TEXTURE NOT FOUND."
    );

    triggerScreenPulse(
        "disruption"
    );

    setTimeout(() => {

        object.classList.remove(
            "is-active"
        );

    }, 9000);
}


/* ==========================================================
   431434
========================================================== */

function trigger431434() {

    const object =
        document.querySelector(
            ".nullWorldBlackBlock"
        );

    if (!object) return;

    object.classList.add(
        "is-active"
    );

    setNullTask(
        "OBJECT 431434 DETECTED."
    );

    triggerScreenPulse(
        "blackout"
    );

    setTimeout(() => {

        object.classList.remove(
            "is-active"
        );

        if (Math.random() < 0.35) {
            triggerAnomaly(
                "outside"
            );
        }

    }, 1800);
}


/* ==========================================================
   HELLO
========================================================== */

function triggerHello() {

    const hello =
        document.querySelector(
            ".nullWorldHello"
        );

    if (!hello) return;

    hello.classList.add(
        "is-broken"
    );

    setNullTask(
        "HELLO."
    );

    triggerHeartbeat();

    setTimeout(() => {

        const cross =
            document.querySelector(
                ".nullHelloCross"
            );

        if (cross)
            cross.classList.add(
                "visible"
            );

        setNullTask(
            "HELLO IS NO LONGER HERE."
        );

    }, 1300);

    setTimeout(() => {

        hello.remove();

    }, 1800);
}


/* ==========================================================
   IT
========================================================== */

function triggerIt() {

    const object =
        document.querySelector(
            ".nullWorldIt"
        );

    if (!object) return;

    object.classList.add(
        "is-active"
    );

    triggerScreenPulse(
        "it"
    );

    setNullTask(
        "404 // OBJECT EXISTS."
    );

    setTimeout(() => {

        object.classList.remove(
            "is-active"
        );

    }, 2500);
}


/* ==========================================================
   EXIT
========================================================== */

function triggerNullExit() {

    setNullTask(
        "53135Exit6436 DETECTED."
    );

    triggerScreenPulse(
        "exit"
    );

    setTimeout(() => {

        setNullTask(
            "EXIT PATH FOUND."
        );

    }, 600);
}


/* ==========================================================
   CONSOLE
========================================================== */

function executeNullCommand() {

    if (nullBanned) return;

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

    input.value = "";

    output.innerHTML +=
        `<br>&gt; ${escapeNullHTML(command)}`;

    const cmd =
        command.toLowerCase();

    setTimeout(() => {

        let response = "";

        if (cmd === "help") {

            response =
                "null<br>" +
                "omega<br>" +
                "integrity<br>" +
                "exit<br>" +
                "memory<br>" +
                "431434";

        } else if (cmd === "null") {

            response = "Outside";

            triggerNullCall(
                "null"
            );

        } else if (
            cmd === "xxram2diexx"
        ) {

            response = "Error";

            triggerNullCall(
                "xxram2diexx"
            );

        } else if (
            cmd === "integrity"
        ) {

            response =
                "ERR.NEXTNIGHT";

            triggerAnomaly(
                "integrity"
            );

        } else if (
            cmd === "memory"
        ) {

            response =
                "ACCESS DENIED";

        } else if (
            cmd === "431434"
        ) {

            response =
                "OBJECT";

            trigger431434();

        } else if (
            cmd === "exit" ||
            cmd === "sv.exit"
        ) {

            response =
                "RETURN PATH FOUND";

            setTimeout(
                () => exitNullSpace(),
                1400
            );

        } else {

            response =
                "ERR.UNKNOWN";
        }

        output.innerHTML +=
            `<br>${response}`;

        output.scrollTop =
            output.scrollHeight;

    }, 250);
}


/* ==========================================================
   CHAT
========================================================== */

function sendNullMessage() {

    if (nullBanned) return;

    const input =
        document.getElementById(
            "nullChatInput"
        );

    if (!input) return;

    const text =
        input.value.trim();

    if (!text) return;

    input.value = "";

    addNullChatMessage(
        "YOU",
        text
    );

    setTimeout(() => {

        respondToNullChat(text);

    }, 600 + Math.random() * 500);
}


function addNullChatMessage(
    user,
    text,
    unknown = false
) {

    const container =
        document.getElementById(
            "nullChatMessages"
        );

    if (!container) return;

    const message =
        document.createElement("div");

    message.className =
        "nullMessage";

    if (unknown)
        message.classList.add(
            "nullUnknownMessage"
        );

    message.innerHTML = `
        <b>${escapeNullHTML(user)}</b>
        <span>${escapeNullHTML(text)}</span>
    `;

    container.appendChild(message);

    container.scrollTop =
        container.scrollHeight;
}


/* ==========================================================
   NULL CHAT RESPONSES
========================================================== */

function respondToNullChat(text) {

    const lower =
        text.trim().toLowerCase();


    /* ------------------------------
       INSULTS
    ------------------------------ */

    const insults = [
        "fuck you",
        "fucker",
        "asshole",
        "ass hole",
        "piece of shit",
        "иди нахуй",
        "пошел нахуй",
        "пошёл нахуй",
        "иди на хуй",
        "мудак",
        "дебил",
        "ублюдок"
    ];

    if (
        insults.some(
            insult =>
                lower === insult
        )
    ) {

        handleNullInsult();
        return;
    }


    /* ------------------------------
       HELLO
    ------------------------------ */

    if (
        lower === "hello" ||
        lower === "hello?" ||
        lower === "hi?" ||
        lower === "hi" ||
        lower === "привет"
    ) {

        addNullChatMessage(
            "NULL",
            "err.type=null.hello"
        );

        return;
    }


    /* ------------------------------
       VOID
    ------------------------------ */

    if (lower === "void") {

        addNullChatMessage(
            "NULL",
            "It's me."
        );

        return;
    }


    /* ------------------------------
       WHO
    ------------------------------ */

    if (
        lower.includes(
            "who are you"
        ) ||
        lower.includes(
            "кто ты"
        )
    ) {

        addNullChatMessage(
            "NULL",
            "You know."
        );

        return;
    }


    /* ------------------------------
       WHAT DO YOU WANT
    ------------------------------ */

    if (
        lower.includes(
            "what do you want"
        ) ||
        lower.includes(
            "чего ты хочешь"
        )
    ) {

        addNullChatMessage(
            "NULL",
            "err.type=null.freedom"
        );

        return;
    }


    /* ------------------------------
       NULL
    ------------------------------ */

    if (lower === "null") {

        addNullChatMessage(
            "NULL",
            "The end is nigh."
        );

        setTimeout(() => {

            addNullChatMessage(
                "NULL",
                "The end is null."
            );

        }, 700);

        setTimeout(() => {

            triggerNullCall(
                "null"
            );

        }, 1200);

        return;
    }


    /* ------------------------------
       CAN YOU SEE ME
    ------------------------------ */

    if (
        lower === "can you see me?" ||
        lower === "can you see me" ||
        lower === "ты меня видишь?"
    ) {

        addNullChatMessage(
            "NULL",
            "Yes."
        );

        setTimeout(() => {

            addNullChatMessage(
                "NULL",
                "Hello."
            );

            triggerEyes();
            triggerHeartbeat();

        }, 700);

        return;
    }


    /* ------------------------------
       FRIEND
    ------------------------------ */

    if (
        lower === "friend?" ||
        lower === "friend"
    ) {

        addNullChatMessage(
            "NULL",
            "..."
        );

        setTimeout(() => {

            triggerNullCall(
                "friend"
            );

        }, 900);

        return;
    }


    /* ------------------------------
       FOLLOW
    ------------------------------ */

    if (
        lower === "follow"
    ) {

        addNullChatMessage(
            "NULL",
            "Is behind you."
        );

        setTimeout(() => {

            triggerBehindYou();

        }, 700);

        return;
    }


    /* ------------------------------
       xXram2dieXx
    ------------------------------ */

    if (
        lower === "xxram2diexx"
    ) {

        addNullChatMessage(
            "NULL",
            "Rot in hell."
        );

        setTimeout(() => {

            triggerNullCall(
                "xxram2diexx"
            );

        }, 1000);

        return;
    }


    /* ------------------------------
       NOTHING IS WATCHING
    ------------------------------ */

    if (
        lower === "nothingiswatching" ||
        lower === "nothing is watching"
    ) {

        addNullChatMessage(
            "NULL",
            "A broken promise."
        );

        triggerEyes();

        return;
    }


    /* ------------------------------
       HELP
    ------------------------------ */

    if (
        lower === "help" ||
        lower === "помоги"
    ) {

        addNullChatMessage(
            "NULL",
            "I cannot."
        );

        return;
    }


    /* ------------------------------
       DEFAULT
    ------------------------------ */

    addNullChatMessage(
        "NULL",
        "..."
    );
}


/* ==========================================================
   INSULT / BAN
========================================================== */

function handleNullInsult() {

    nullInsultCount++;

    saveNullState();

    addNullChatMessage(
        "NULL",
        "..."
    );

    nullAnomalyLevel =
        Math.min(
            5,
            nullInsultCount
        );

    if (nullInsultCount === 1) {

        setNullTask(
            "NULL IS NOT AMUSED."
        );

        triggerScreenPulse(
            "warning"
        );

        setTimeout(() => {

            addNullChatMessage(
                "NULL",
                "Don't."
            );

        }, 900);

        return;
    }


    if (nullInsultCount === 2) {

        setNullTask(
            "WARNING: NULL REPUTATION LOW."
        );

        flickerNullLights(true);
        spawnEyeCluster();

        setTimeout(() => {

            addNullChatMessage(
                "NULL",
                "You should stop."
            );

        }, 700);

        return;
    }


    if (nullInsultCount === 3) {

        setNullTask(
            "NULL INSTANCE ANGRY."
        );

        triggerHeartbeat();
        triggerDisruption();
        triggerNullAppearance();

        setTimeout(() => {

            addNullChatMessage(
                "NULL",
                "You were warned."
            );

        }, 900);

        return;
    }


    if (nullInsultCount >= 4) {

        setTimeout(() => {

            banByNull();

        }, 1100);

    }
}


function banByNull() {

    nullBanned = true;

    saveNullState();

    stopNullEvents();

    triggerScreenPulse(
        "ban"
    );

    setTimeout(() => {

        showNullBanScreen();

    }, 600);
}


/* ==========================================================
   BAN SCREEN
========================================================== */

function showNullBanScreen() {

    const root =
        document.getElementById(
            "nullSpaceRoot"
        );

    if (!root) return;

    root.innerHTML = `

        <div class="nullBanScreen">

            <div class="nullBanNoise"></div>

            <div class="nullBanBox">

                <div class="nullBanTitle">
                    NULL
                </div>

                <div class="nullBanLine">
                    CONNECTION TERMINATED
                </div>

                <div class="nullBanReason">
                    YOU HAVE BEEN BANNED
                </div>

                <div class="nullBanReason">
                    REASON: DISRESPECT
                </div>

                <div class="nullBanCode">
                    ERR.NULL.BAN
                </div>

                <button
                    id="nullBanReturn">
                    RETURN
                </button>

            </div>

        </div>
    `;

    root.classList.remove(
        "hidden"
    );

    const button =
        document.getElementById(
            "nullBanReturn"
        );

    if (button) {

        button.addEventListener(
            "click",
            () => {

                exitNullSpace();

            }
        );
    }
}


/* ==========================================================
   NULL CALLS
========================================================== */

function triggerNullCall(type) {

    triggerScreenPulse(
        "null-call"
    );

    flickerNullLights(true);

    spawnEyeCluster();

    setTimeout(() => {

        triggerNullAppearance();

    }, 900);

    if (
        type === "xxram2diexx"
    ) {

        setTimeout(() => {

            startNullHereEvent();

        }, 1500);
    }
}


/* ==========================================================
   NULL ENTITY
========================================================== */

function triggerNullAppearance() {

    const entity =
        document.querySelector(
            ".nullEntity"
        );

    if (!entity) return;

    entity.classList.add(
        "visible"
    );

    setNullTask(
        "NULL INSTANCE ACTIVE."
    );

    setTimeout(() => {

        if (
            Math.random() < 0.7
        ) {

            entity.classList.remove(
                "visible"
            );

        }

    }, 3200);
}


function startNullHereEvent() {

    const entity =
        document.querySelector(
            ".nullEntity"
        );

    if (!entity) return;

    entity.classList.add(
        "is-chasing"
    );

    const messages = [
        "You know nothing",
        "Worship me",
        "Follow me",
        "Join us",
        "Corrupted",
        "Go away",
        "Null",
        "We can hear you",
        "Can you see me?",
        "0",
        "Behind you",
        "Help me",
        "Nothing can be changed",
        "Close your eyes",
        "One of us"
    ];

    let index = 0;

    const interval =
        setInterval(() => {

            if (!nullSpaceActive) {
                clearInterval(interval);
                return;
            }

            showNullEventText(
                messages[
                    index %
                    messages.length
                ]
            );

            index++;

        }, 280);

    setTimeout(() => {

        clearInterval(interval);

        entity.classList.remove(
            "is-chasing"
        );

        hideNullEventText();

    }, 5000);
}


/* ==========================================================
   BEHIND YOU
========================================================== */

function triggerBehindYou() {

    showNullEventText(
        "BEHIND YOU"
    );

    triggerScreenPulse(
        "behind"
    );

    setTimeout(() => {

        hideNullEventText();

        triggerNullAppearance();

    }, 1300);
}


/* ==========================================================
   HEARTBEAT
========================================================== */

function triggerHeartbeat() {

    const heartbeat =
        document.querySelector(
            ".nullHeartbeat"
        );

    if (!heartbeat) return;

    heartbeat.classList.remove(
        "active"
    );

    void heartbeat.offsetWidth;

    heartbeat.classList.add(
        "active"
    );

    setTimeout(() => {

        heartbeat.classList.remove(
            "active"
        );

    }, 3500);
}


/* ==========================================================
   RANDOM EVENTS
========================================================== */

function startNullEvents() {

    stopNullEvents();

    scheduleNextNullEvent();
}


function scheduleNextNullEvent() {

    if (!nullSpaceActive)
        return;

    const delay =
        9000 +
        Math.random() * 18000;

    nullEventTimer =
        setTimeout(() => {

            if (
                !nullBanned
            ) {

                runRandomNullEvent();

            }

            scheduleNextNullEvent();

        }, delay);
}


function runRandomNullEvent() {

    const events = [

        {
            weight: 22,
            fn: () => flickerNullLights()
        },

        {
            weight: 20,
            fn: () => spawnEyeCluster()
        },

        {
            weight: 14,
            fn: () => {

                if (!nullDoorOpen)
                    toggleNullDoor();

            }
        },

        {
            weight: 10,
            fn: () => triggerHeartbeat()
        },

        {
            weight: 8,
            fn: () => triggerDisruption()
        },

        {
            weight: 7,
            fn: () => triggerIt()
        },

        {
            weight: 5,
            fn: () => trigger431434()
        },

        {
            weight: 4,
            fn: () => triggerHello()
        },

        {
            weight: 4,
            fn: () => triggerBehindYou()
        },

        {
            weight: 3,
            fn: () => triggerNullAppearance()
        },

        {
            weight: 2,
            fn: () => triggerAnomaly("integrity")
        },

        {
            weight: 1,
            fn: () => triggerMajorAnomaly()
        }
    ];

    const total =
        events.reduce(
            (sum, event) =>
                sum + event.weight,
            0
        );

    let random =
        Math.random() * total;

    for (const event of events) {

        random -= event.weight;

        if (random <= 0) {

            event.fn();
            break;

        }
    }
}


/* ==========================================================
   MAJOR ANOMALY
========================================================== */

function triggerMajorAnomaly() {

    triggerScreenPulse(
        "major"
    );

    clearEyes();

    setTimeout(() => {

        showNullEventText(
            "KEEP PLAYING"
        );

    }, 300);

    setTimeout(() => {

        hideNullEventText();

        triggerNullAppearance();

    }, 2200);

    setTimeout(() => {

        flickerNullLights(true);

    }, 2800);
}


/* ==========================================================
   ANOMALY
========================================================== */

function triggerAnomaly(type) {

    nullAnomalyLevel =
        Math.min(
            5,
            nullAnomalyLevel + 1
        );

    if (type === "outside") {

        showNullEventText(
            "OUTSIDE"
        );

        triggerScreenPulse(
            "outside"
        );

        setTimeout(() => {
            hideNullEventText();
        }, 1800);

        return;
    }

    if (type === "integrity") {

        showNullEventText(
            "ERR.NEXTNIGHT"
        );

        flickerNullLights(true);

        setTimeout(() => {
            hideNullEventText();
        }, 1800);
    }
}


/* ==========================================================
   SCREEN EFFECTS
========================================================== */

function triggerScreenPulse(type = "") {

    const overlay =
        document.querySelector(
            ".nullEventOverlay"
        );

    if (!overlay) return;

    overlay.className =
        "nullEventOverlay";

    void overlay.offsetWidth;

    overlay.classList.add(
        "active",
        `effect-${type}`
    );

    setTimeout(() => {

        overlay.classList.remove(
            "active"
        );

    }, type === "major" ? 1500 : 420);
}


function showNullEventText(text) {

    const element =
        document.querySelector(
            ".nullEventText"
        );

    if (!element) return;

    element.textContent = text;

    element.classList.add(
        "active"
    );
}


function hideNullEventText() {

    const element =
        document.querySelector(
            ".nullEventText"
        );

    if (element)
        element.classList.remove(
            "active"
        );
}


/* ==========================================================
   ENTRY
========================================================== */

function playNullEntry() {

    const root =
        document.getElementById(
            "nullSpaceRoot"
        );

    if (!root) return;

    const space =
        root.querySelector(
            ".nullSpace"
        );

    if (!space) return;

    space.classList.add(
        "nullSpaceEntering"
    );

    setTimeout(() => {

        space.classList.remove(
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

            const windowButton =
                event.target.closest(
                    "[data-null-window]"
                );

            if (windowButton) {

                openNullWindow(
                    windowButton.dataset.nullWindow
                );

                return;
            }


            if (
                event.target.closest(
                    "#nullReturnButton"
                )
            ) {

                exitNullSpace();
                return;
            }


            if (
                event.target.closest(
                    "#nullBanReturn"
                )
            ) {

                exitNullSpace();
                return;
            }


            const object =
                event.target.closest(
                    "[data-null-object]"
                );

            if (!object) return;

            const type =
                object.dataset.nullObject;


            if (type === "door") {

                toggleNullDoor();
                return;
            }


            if (type === "console") {

                openNullWindow(
                    "console"
                );

                triggerScreenPulse(
                    "console"
                );

                return;
            }


            if (type === "431434") {

                trigger431434();
                return;
            }


            if (type === "disruption") {

                triggerDisruption();
                return;
            }


            if (type === "it") {

                triggerIt();
                return;
            }


            if (type === "hello") {

                triggerHello();
                return;
            }


            if (type === "exit") {

                triggerNullExit();
                return;
            }


            if (
                type === "null"
            ) {

                triggerNullAppearance();

                setNullTask(
                    "NULL SELECTED."
                );

                return;
            }


            setNullTask(
                `${String(type).toUpperCase()} SELECTED.`
            );
        }
    );


    const send =
        document.getElementById(
            "nullChatSend"
        );

    if (send) {

        send.addEventListener(
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
}


/* ==========================================================
   STOP EVENTS
========================================================== */

function stopNullEvents() {

    if (nullEventTimer) {

        clearTimeout(
            nullEventTimer
        );

        nullEventTimer = null;
    }

    if (nullEyeTimer) {

        clearTimeout(
            nullEyeTimer
        );

        nullEyeTimer = null;
    }

    clearEyes();
}


/* ==========================================================
   TASK
========================================================== */

function setNullTask(text) {

    const task =
        document.getElementById(
            "nullTaskMessage"
        );

    if (task)
        task.textContent = text;

    const status =
        document.querySelector(
            ".nullStatusValue"
        );

    if (status) {

        if (
            nullAnomalyLevel >= 4
        ) {

            status.textContent =
                "ERR0R";

        } else if (
            nullAnomalyLevel >= 2
        ) {

            status.textContent =
                "0000NULL";

        } else {

            status.textContent =
                nullDoorOpen
                    ? "00000001"
                    : "00000000";
        }
    }
}


/* ==========================================================
   HELPERS
========================================================== */

function triggerEyes() {

    spawnEyeCluster();
}


function capitalize(text) {

    return text.charAt(0).toUpperCase() +
           text.slice(1);
}


function escapeNullHTML(text) {

    return String(text)
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
