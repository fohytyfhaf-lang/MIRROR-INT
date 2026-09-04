/* ==========================================================
   NULL SPACE
   MIRROR-INT / OMEGA
   ========================================================== */

let nullSpaceActive = false;
let nullSpaceInitialized = false;
let nullSpacePreviousUI = null;

const NULL_STORAGE = {
    active: "null_space_active",
    entered: "null_space_entered",
    flags: "null_space_flags",
    state: "null_space_state"
};

const DEFAULT_NULL_STATE = {
    room: "ROOM_000",
    visits: 0,

    consoleUsed: false,
    nullSeen: false,
    itFound: false,
    disruptionFound: false,
    exitFound: false,

    anomalyLevel: 0,
    lightsOff: false,
    doorOpened: false,

    lastEvent: "NOTHING IS WRONG."
};

let nullState = loadNullState();


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
   STATE
   ========================================================== */

function loadNullState() {

    try {

        const raw = localStorage.getItem(NULL_STORAGE.state);

        if (!raw) {
            return { ...DEFAULT_NULL_STATE };
        }

        return {
            ...DEFAULT_NULL_STATE,
            ...JSON.parse(raw)
        };

    } catch (error) {

        console.warn("[NULL SPACE] State corrupted.");

        return {
            ...DEFAULT_NULL_STATE
        };
    }
}


function saveNullState() {

    try {

        localStorage.setItem(
            NULL_STORAGE.state,
            JSON.stringify(nullState)
        );

    } catch (error) {

        console.warn(
            "[NULL SPACE] Could not save state.",
            error
        );
    }
}


function increaseAnomaly(amount = 1) {

    nullState.anomalyLevel = Math.min(
        10,
        nullState.anomalyLevel + amount
    );

    saveNullState();

    updateNullStatus();
}


/* ==========================================================
   CREATE SPACE
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
                 VOID ENVIRONMENT
            =========================================== -->

            <div class="nullVoidEnvironment">

                <div class="nullVoidCeiling"></div>

                <div class="nullVoidBackWall"></div>

                <div class="nullVoidWall nullVoidWallLeft"></div>
                <div class="nullVoidWall nullVoidWallRight"></div>

                <div class="nullVoidFloor"></div>

                <!-- PILLARS -->

                <div class="nullVoidPillar pillar01"></div>
                <div class="nullVoidPillar pillar02"></div>
                <div class="nullVoidPillar pillar03"></div>
                <div class="nullVoidPillar pillar04"></div>
                <div class="nullVoidPillar pillar05"></div>

                <!-- UNEVEN VOID LIGHT -->

                <button
                    class="nullVoidLight light01"
                    data-null-world="light"
                    aria-label="Void Light"
                    type="button"
                ></button>

                <button
                    class="nullVoidLight light02"
                    data-null-world="light"
                    aria-label="Void Light"
                    type="button"
                ></button>

                <button
                    class="nullVoidLight light03"
                    data-null-world="light"
                    aria-label="Void Light"
                    type="button"
                ></button>


                <!-- VOID DOOR -->

                <button
                    class="nullWorldObject nullWorldDoor"
                    data-null-world="door"
                    type="button"
                >

                    <span class="voidDoorFrame"></span>
                    <span class="voidDoorCore"></span>

                    <span class="worldObjectLabel">
                        VOID DOOR
                    </span>

                </button>


                <!-- CONSOLE -->

                <button
                    class="nullWorldObject nullWorldConsole"
                    data-null-world="console"
                    type="button"
                >

                    <span class="worldConsoleBase"></span>

                    <span class="worldConsoleScreen">
                        <span>CONSOLE</span>
                        <span>READY</span>
                    </span>

                    <span class="worldConsoleLight"></span>

                    <span class="worldObjectLabel">
                        CONSOLE_01
                    </span>

                </button>


                <!-- 431434 -->

                <button
                    class="nullWorldObject nullWorldBlackBlock"
                    data-null-world="black"
                    type="button"
                >

                    <span class="blackBlockCore"></span>
                    <span class="blackBlockEdge"></span>

                    <span class="worldObjectLabel">
                        431434
                    </span>

                </button>


                <!-- IT -->

                <button
                    class="nullWorldObject nullWorldIt"
                    data-null-world="it"
                    type="button"
                >

                    <span class="itGlass"></span>

                    <span class="itScratch scratch01"></span>
                    <span class="itScratch scratch02"></span>
                    <span class="itScratch scratch03"></span>

                    <span class="it404">
                        404
                    </span>

                    <span class="worldObjectLabel">
                        IT
                    </span>

                </button>


                <!-- DISRUPTION -->

                <button
                    class="nullWorldObject nullWorldDisruption"
                    data-null-world="disruption"
                    type="button"
                >

                    <span class="disruptionNoise">
                        ×
                    </span>

                    <span class="disruptionNoise">
                        ?
                    </span>

                    <span class="disruptionNoise">
                        #
                    </span>

                    <span class="worldObjectLabel">
                        DISRUPTION
                    </span>

                </button>


                <!-- EXIT -->

                <button
                    class="nullWorldObject nullWorldExit"
                    data-null-world="exit"
                    type="button"
                >

                    <span class="exitCore">
                        EXIT
                    </span>

                    <span class="exitGlow"></span>

                    <span class="worldObjectLabel">
                        53135Exit6436
                    </span>

                </button>


                <!-- SCRATCHED PANEL -->

                <div class="nullVoidScratchPanel">

                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>

                </div>


                <!-- BACKGROUND CODE -->

                <div class="nullWorldCode code01">
                    000
                </div>

                <div class="nullWorldCode code02">
                    null
                </div>

                <div class="nullWorldCode code03">
                    431434
                </div>

                <div class="nullWorldCode code04">
                    ERR.NULL
                </div>

            </div>


            <!-- ==========================================
                 ATMOSPHERIC NULL
            =========================================== -->

            <div class="nullPresence">

                <div class="nullPresenceBody"></div>

                <div class="nullPresenceEyes">
                    <span></span>
                    <span></span>
                </div>

            </div>


            <!-- ==========================================
                 MAIN INTERFACE
            =========================================== -->

            <div class="nullInterface">


                <!-- TOP -->

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
                            class="nullStatusValue"
                            id="nullStatusValue"
                        >
                            PRESENT
                        </span>

                    </div>


                    <div class="nullCoordinates">

                        <span>
                            ROOM
                        </span>

                        <strong id="nullRoomID">
                            ROOM_000
                        </strong>

                    </div>

                </header>


                <!-- WORKSPACE -->

                <main class="nullWorkspace">


                    <!-- ==================================
                         NAVIGATION
                    =================================== -->

                    <aside class="nullNavigation">

                        <div class="nullNavigationHeader">

                            <span>
                                VOID
                            </span>

                            <small>
                                OBJECTS
                            </small>

                        </div>


                        <button
                            class="nullNavButton"
                            data-null-window="archive"
                            type="button"
                        >

                            <span class="navNumber">
                                01
                            </span>

                            <span class="navName">
                                ARCHIVE
                            </span>

                        </button>


                        <button
                            class="nullNavButton"
                            data-null-window="chat"
                            type="button"
                        >

                            <span class="navNumber">
                                02
                            </span>

                            <span class="navName">
                                SIGNAL
                            </span>

                        </button>


                        <button
                            class="nullNavButton"
                            data-null-window="memory"
                            type="button"
                        >

                            <span class="navNumber">
                                03
                            </span>

                            <span class="navName">
                                MEMORY
                            </span>

                        </button>


                        <button
                            class="nullNavButton"
                            data-null-window="console"
                            type="button"
                        >

                            <span class="navNumber">
                                04
                            </span>

                            <span class="navName">
                                CONSOLE
                            </span>

                        </button>


                        <button
                            class="nullNavButton"
                            data-null-window="objects"
                            type="button"
                        >

                            <span class="navNumber">
                                05
                            </span>

                            <span class="navName">
                                OBJECTS
                            </span>

                        </button>


                        <button
                            class="nullNavButton"
                            data-null-window="room"
                            type="button"
                        >

                            <span class="navNumber">
                                06
                            </span>

                            <span class="navName">
                                ROOM
                            </span>

                        </button>


                        <button
                            class="nullNavButton nullUnknownNav"
                            data-null-window="unknown"
                            type="button"
                        >

                            <span class="navNumber">
                                ??
                            </span>

                            <span class="navName">
                                UNKNOWN
                            </span>

                        </button>


                        <div class="nullConnection">

                            <span>
                                CONNECTION
                            </span>

                            <strong>
                                00000000
                            </strong>

                        </div>

                    </aside>


                    <!-- ==================================
                         MAIN TERMINAL
                    =================================== -->

                    <section class="nullMain">


                        <!-- EMPTY -->

                        <div
                            class="nullEmptyState"
                            id="nullEmptyState"
                        >

                            <div class="nullEmptyRoom">

                                <div class="emptyLight"></div>

                                <div class="emptyDoor"></div>

                                <div class="emptyText">

                                    <span>
                                        SELECT A TERMINAL
                                    </span>

                                    <small>
                                        THERE IS NO REASON TO BE HERE.
                                    </small>

                                </div>

                            </div>

                        </div>


                        <!-- ==================================
                             ARCHIVE
                        =================================== -->

                        <section
                            class="nullInternalWindow"
                            id="nullWindowArchive"
                        >

                            <div class="nullWindowHeader">

                                <div>
                                    ARCHIVE
                                </div>

                                <span>
                                    STORAGE / VOID
                                </span>

                            </div>


                            <div class="nullArchiveGrid">

                                <button class="nullArchiveItem" type="button">

                                    <strong>
                                        FILE_000
                                    </strong>

                                    <span>
                                        ROOM_000
                                    </span>

                                    <small>
                                        INTEGRITY: OK
                                    </small>

                                </button>


                                <button class="nullArchiveItem" type="button">

                                    <strong>
                                        FILE_001
                                    </strong>

                                    <span>
                                        ROOM_001
                                    </span>

                                    <small>
                                        INTEGRITY: OK
                                    </small>

                                </button>


                                <button class="nullArchiveItem" type="button">

                                    <strong>
                                        FILE_002
                                    </strong>

                                    <span>
                                        CONSOLE
                                    </span>

                                    <small>
                                        INTEGRITY: UNKNOWN
                                    </small>

                                </button>


                                <button class="nullArchiveItem" type="button">

                                    <strong>
                                        FILE_003
                                    </strong>

                                    <span>
                                        PLAYER
                                    </span>

                                    <small>
                                        INTEGRITY: OBSERVED
                                    </small>

                                </button>


                                <button class="nullArchiveItem nullCorruptFile" type="button">

                                    <strong>
                                        FILE_004
                                    </strong>

                                    <span>
                                        NULL
                                    </span>

                                    <small>
                                        INTEGRITY: █████
                                    </small>

                                </button>

                            </div>

                        </section>


                        <!-- ==================================
                             SIGNAL / CHAT
                        =================================== -->

                        <section
                            class="nullInternalWindow"
                            id="nullWindowChat"
                        >

                            <div class="nullWindowHeader">

                                <div>
                                    SIGNAL
                                </div>

                                <span>
                                    LOCAL TRANSMISSION
                                </span>

                            </div>


                            <div
                                class="nullSignalLog"
                                id="nullChatMessages"
                            >

                                <div class="nullSignalMessage system">

                                    <span class="signalTime">
                                        00:00:00
                                    </span>

                                    <div>

                                        <strong>
                                            SYSTEM
                                        </strong>

                                        <p>
                                            CHANNEL ESTABLISHED.
                                        </p>

                                    </div>

                                </div>


                                <div class="nullSignalMessage null">

                                    <span class="signalTime">
                                        --:--:--
                                    </span>

                                    <div>

                                        <strong>
                                            NULL
                                        </strong>

                                        <p>
                                            Hello.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div class="nullSignalInput">

                                <span>
                                    &gt;
                                </span>

                                <input
                                    id="nullChatInput"
                                    type="text"
                                    autocomplete="off"
                                    spellcheck="false"
                                    placeholder="TRANSMIT..."
                                >

                                <button
                                    id="nullChatSend"
                                    type="button"
                                >
                                    SEND
                                </button>

                            </div>

                        </section>


                        <!-- ==================================
                             MEMORY
                        =================================== -->

                        <section
                            class="nullInternalWindow"
                            id="nullWindowMemory"
                        >

                            <div class="nullWindowHeader">

                                <div>
                                    MEMORY
                                </div>

                                <span>
                                    FRAGMENTS
                                </span>

                            </div>


                            <div class="nullMemoryList">

                                <div class="nullMemoryEntry">

                                    <strong>
                                        MEM_000
                                    </strong>

                                    <span>
                                        PLAYER
                                    </span>

                                    <small>
                                        YOU ENTERED THE SPACE.
                                    </small>

                                </div>


                                <div class="nullMemoryEntry">

                                    <strong>
                                        MEM_001
                                    </strong>

                                    <span>
                                        OMEGA
                                    </span>

                                    <small>
                                        THIS IS NOT OMEGA.
                                    </small>

                                </div>


                                <div class="nullMemoryEntry">

                                    <strong>
                                        MEM_002
                                    </strong>

                                    <span>
                                        MR.SMILE
                                    </span>

                                    <small>
                                        OBSERVER.
                                    </small>

                                </div>


                                <div class="nullMemoryEntry">

                                    <strong>
                                        MEM_003
                                    </strong>

                                    <span>
                                        NULL
                                    </span>

                                    <small>
                                        MEMORY DOES NOT BELONG HERE.
                                    </small>

                                </div>


                                <div class="nullMemoryEntry nullMemoryCorrupt">

                                    <strong>
                                        MEM_004
                                    </strong>

                                    <span>
                                        ????????
                                    </span>

                                    <small>
                                        READ FAILURE.
                                    </small>

                                </div>

                            </div>

                        </section>


                        <!-- ==================================
                             CONSOLE
                        =================================== -->

                        <section
                            class="nullInternalWindow"
                            id="nullWindowConsole"
                        >

                            <div class="nullWindowHeader consoleHeader">

                                <div>
                                    CONSOLE
                                </div>

                                <span>
                                    VOID TERMINAL
                                </span>

                            </div>


                            <div
                                class="nullConsoleOutput"
                                id="nullConsoleOutput"
                            >
                                NULL CONSOLE
                                ----------------

                                TYPE "help"

                            </div>


                            <div class="nullConsoleInput">

                                <span>
                                    &gt;
                                </span>

                                <input
                                    id="nullConsoleCommand"
                                    type="text"
                                    autocomplete="off"
                                    spellcheck="false"
                                    placeholder="ENTER COMMAND"
                                >

                            </div>


                            <div class="nullConsoleHints">

                                <span>
                                    help
                                </span>

                                <span>
                                    null
                                </span>

                                <span>
                                    integrity
                                </span>

                                <span>
                                    memory
                                </span>

                                <span>
                                    exit
                                </span>

                            </div>

                        </section>


                        <!-- ==================================
                             OBJECTS
                        =================================== -->

                        <section
                            class="nullInternalWindow"
                            id="nullWindowObjects"
                        >

                            <div class="nullWindowHeader">

                                <div>
                                    OBJECTS
                                </div>

                                <span>
                                    DETECTED STRUCTURES
                                </span>

                            </div>


                            <div class="nullObjectGrid">


                                <button
                                    class="nullObject"
                                    data-null-object="MIRROR"
                                    type="button"
                                >

                                    <span class="objectGlyph mirrorGlyph"></span>

                                    <strong>
                                        MIRROR
                                    </strong>

                                    <small>
                                        REFLECTIVE
                                    </small>

                                </button>


                                <button
                                    class="nullObject"
                                    data-null-object="CHAIR"
                                    type="button"
                                >

                                    <span class="objectGlyph chairGlyph"></span>

                                    <strong>
                                        CHAIR
                                    </strong>

                                    <small>
                                        STATIC
                                    </small>

                                </button>


                                <button
                                    class="nullObject"
                                    data-null-object="DOOR"
                                    type="button"
                                >

                                    <span class="objectGlyph doorGlyph"></span>

                                    <strong>
                                        DOOR
                                    </strong>

                                    <small>
                                        OPENABLE
                                    </small>

                                </button>


                                <button
                                    class="nullObject"
                                    data-null-object="SIGNAL"
                                    type="button"
                                >

                                    <span class="objectGlyph signalGlyph"></span>

                                    <strong>
                                        SIGNAL
                                    </strong>

                                    <small>
                                        UNKNOWN
                                    </small>

                                </button>


                                <button
                                    class="nullObject"
                                    data-null-object="PLAYER"
                                    type="button"
                                >

                                    <span class="objectGlyph playerGlyph"></span>

                                    <strong>
                                        PLAYER
                                    </strong>

                                    <small>
                                        OBSERVED
                                    </small>

                                </button>


                                <button
                                    class="nullObject nullImpossibleObject"
                                    data-null-object="NULL"
                                    type="button"
                                >

                                    <span class="objectGlyph nullGlyph"></span>

                                    <strong>
                                        NULL
                                    </strong>

                                    <small>
                                        DOES NOT EXIST
                                    </small>

                                </button>

                            </div>

                        </section>


                        <!-- ==================================
                             ROOM
                        =================================== -->

                        <section
                            class="nullInternalWindow"
                            id="nullWindowRoom"
                        >

                            <div class="nullWindowHeader">

                                <div>
                                    ROOM
                                </div>

                                <span id="nullRoomHeaderID">
                                    ROOM_000
                                </span>

                            </div>


                            <div class="nullRoom">

                                <div class="roomPerspective">

                                    <div class="roomBackWall"></div>

                                    <div class="roomFloor"></div>

                                    <div class="roomCeiling"></div>

                                    <div class="roomPillar roomPillarA"></div>
                                    <div class="roomPillar roomPillarB"></div>

                                    <div class="roomDoor">
                                        <span></span>
                                    </div>

                                    <div class="roomConsole">
                                        <span></span>
                                    </div>

                                    <div class="roomLight"></div>

                                    <div class="roomText">
                                        THERE IS NO REASON
                                        <br>
                                        TO BE HERE.
                                    </div>

                                </div>

                            </div>

                        </section>


                        <!-- ==================================
                             UNKNOWN
                        =================================== -->

                        <section
                            class="nullInternalWindow"
                            id="nullWindowUnknown"
                        >

                            <div class="nullUnknownScreen">

                                <div class="unknownNumber">
                                    0
                                </div>

                                <div class="unknownVoid"></div>

                                <div class="unknownText">

                                    <strong>
                                        YOU ARE NOT SUPPOSED TO SEE THIS.
                                    </strong>

                                    <span>
                                        THIS IS NOT PART OF OMEGA.
                                    </span>

                                    <small>
                                        ...
                                    </small>

                                </div>

                            </div>

                        </section>


                    </section>

                </main>


                <!-- ==================================
                     FOOTER
                =================================== -->

                <footer class="nullTaskbar">

                    <div class="nullTaskIdentity">

                        <span>
                            NULL
                        </span>

                        <strong>
                            INSTANCE_000
                        </strong>

                    </div>


                    <div
                        id="nullTaskMessage"
                        class="nullTaskMessage"
                    >
                        NOTHING IS WRONG.
                    </div>


                    <button
                        id="nullReturnButton"
                        type="button"
                    >
                        RETURN
                    </button>

                </footer>


            </div>


            <!-- ==========================================
                 MOON
                 KEPT FOR FUTURE EVENTS
            =========================================== -->

            <div class="nullMoonVisual">

                <div class="nullMoonGlow"></div>

                <div class="nullMoonBody"></div>

                <div class="nullMoonSurface"></div>

                <div class="nullMoonShadow"></div>

                <div class="nullMoonVoid"></div>

                <div class="nullMoonThread"></div>

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


    /* ==========================================
       REMEMBER NORMAL UI
    =========================================== */

    nullSpacePreviousUI = [];

    const uiElements = [
        desktop,
        publicSite,
        loginScreen,

        document.getElementById("notificationArea"),
        document.getElementById("mrsmileEntity"),
        document.getElementById("glitchLayer"),
        document.getElementById("eyesLayer")
    ];

    uiElements.forEach(element => {

        if (!element) return;

        nullSpacePreviousUI.push({
            element,
            hidden: element.classList.contains("hidden"),
            display: element.style.display
        });

        element.classList.add("hidden");
        element.style.display = "none";
    });


    /* ==========================================
       SHOW NULL
    =========================================== */

    root.classList.remove("hidden");
    root.style.display = "block";

    document.body.classList.add("nullSpaceActive");


    /* ==========================================
       STATE
    =========================================== */

    nullState.visits++;

    saveNullState();

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

    updateNullRoom();

    updateNullStatus();

    playNullEntry();

    maybeTriggerEntryEvent();
}


/* ==========================================================
   EXIT
   ========================================================== */

export function exitNullSpace() {

    if (!nullSpaceActive) return;

    const root = document.getElementById("nullSpaceRoot");

    if (root) {

        root.classList.add("hidden");
        root.style.display = "none";
    }


    /* ==========================================
       RESTORE EXACT PREVIOUS UI
    =========================================== */

    if (nullSpacePreviousUI) {

        nullSpacePreviousUI.forEach(item => {

            const {
                element,
                hidden,
                display
            } = item;

            if (!element) return;

            element.classList.toggle(
                "hidden",
                hidden
            );

            element.style.display = display;
        });
    }


    document.body.classList.remove(
        "nullSpaceActive"
    );

    nullSpaceActive = false;


    localStorage.removeItem(
        NULL_STORAGE.active
    );

    localStorage.setItem(
        NULL_STORAGE.flags,
        "returned"
    );

    nullSpacePreviousUI = null;
}


/* ==========================================================
   WINDOW MANAGEMENT
   ========================================================== */

export function openNullWindow(name) {

    const root = document.getElementById(
        "nullSpaceRoot"
    );

    if (!root) return;

    const windows = root.querySelectorAll(
        ".nullInternalWindow"
    );

    windows.forEach(window => {
        window.classList.remove("isOpen");
    });


    const empty = root.querySelector(
        "#nullEmptyState"
    );

    if (empty) {
        empty.classList.add("isHidden");
    }


    const target = root.querySelector(
        `#nullWindow${capitalize(name)}`
    );

    if (!target) return;

    target.classList.add("isOpen");


    const messages = {

        archive:
            "ARCHIVE OPEN.",

        chat:
            "CHANNEL OPEN.",

        memory:
            "MEMORY ACCESS.",

        console:
            "CONSOLE READY.",

        objects:
            "OBJECT DATABASE.",

        room:
            "LOCATION: UNKNOWN.",

        unknown:
            "YOU FOUND IT."
    };


    setNullTask(
        messages[name] ||
        "UNKNOWN."
    );


    if (name === "room") {
        updateNullRoom();
    }

    if (name === "memory") {
        updateMemoryState();
    }
}


/* ==========================================================
   RESET
   ========================================================== */

function resetNullWindows() {

    const root = document.getElementById(
        "nullSpaceRoot"
    );

    if (!root) return;

    root.querySelectorAll(
        ".nullInternalWindow"
    ).forEach(window => {

        window.classList.remove(
            "isOpen"
        );
    });


    const empty = root.querySelector(
        "#nullEmptyState"
    );

    if (empty) {

        empty.classList.remove(
            "isHidden"
        );
    }


    setNullTask(
        "NOTHING IS WRONG."
    );
}


/* ==========================================================
   TASK MESSAGE
   ========================================================== */

function setNullTask(
    message,
    temporary = false
) {

    const element = document.getElementById(
        "nullTaskMessage"
    );

    if (!element) return;

    element.textContent = message;

    element.classList.remove(
        "taskPulse"
    );

    void element.offsetWidth;

    element.classList.add(
        "taskPulse"
    );


    nullState.lastEvent = message;

    saveNullState();


    if (temporary) {

        setTimeout(() => {

            if (!nullSpaceActive) return;

            element.textContent =
                "NOTHING IS WRONG.";

        }, 2200);
    }
}


/* ==========================================================
   STATUS
   ========================================================== */

function updateNullStatus() {

    const status = document.getElementById(
        "nullStatusValue"
    );

    const room = document.getElementById(
        "nullRoomID"
    );

    const roomHeader = document.getElementById(
        "nullRoomHeaderID"
    );


    if (status) {

        let value = "PRESENT";

        if (nullState.anomalyLevel >= 7) {
            value = "OBSERVED";
        }
        else if (nullState.anomalyLevel >= 4) {
            value = "UNSTABLE";
        }
        else if (nullState.nullSeen) {
            value = "WATCHED";
        }

        status.textContent = value;
    }


    if (room) {
        room.textContent =
            nullState.room;
    }

    if (roomHeader) {
        roomHeader.textContent =
            nullState.room;
    }
}


/* ==========================================================
   ROOM SYSTEM
   ========================================================== */

const NULL_ROOMS = [
    "ROOM_000",
    "ROOM_001",
    "ROOM_002",
    "ROOM_003",
    "ROOM_404",
    "ROOM_NULL"
];


function nextNullRoom() {

    const current =
        NULL_ROOMS.indexOf(
            nullState.room
        );

    const next =
        (current + 1) %
        NULL_ROOMS.length;

    nullState.room =
        NULL_ROOMS[next];

    nullState.doorOpened = true;

    increaseAnomaly(
        nullState.room === "ROOM_404"
            ? 2
            : 1
    );

    saveNullState();

    updateNullRoom();

    setNullTask(
        `LOCATION: ${nullState.room}.`,
        true
    );

    triggerRoomEvent();
}


function updateNullRoom() {

    updateNullStatus();

    const root = document.getElementById(
        "nullSpaceRoot"
    );

    if (!root) return;

    const environment =
        root.querySelector(
            ".nullVoidEnvironment"
        );

    if (!environment) return;


    environment.dataset.room =
        nullState.room;


    environment.classList.toggle(
        "room404",
        nullState.room === "ROOM_404"
    );

    environment.classList.toggle(
        "roomNull",
        nullState.room === "ROOM_NULL"
    );
}


/* ==========================================================
   WORLD OBJECT EVENTS
   ========================================================== */

function handleWorldObject(type) {

    switch (type) {

        case "console":

            nullState.consoleUsed = true;

            saveNullState();

            increaseAnomaly(1);

            openNullWindow("console");

            setNullTask(
                "CONSOLE_01 CONNECTED."
            );

            break;


        case "door":

            nextNullRoom();

            break;


        case "black":

            nullState.nullSeen = true;

            increaseAnomaly(2);

            saveNullState();

            openNullWindow("unknown");

            setNullTask(
                "OBJECT 431434 DETECTED.",
                true
            );

            triggerBlackBlockEvent();

            break;


        case "it":

            nullState.itFound = true;

            increaseAnomaly(1);

            saveNullState();

            openNullWindow("objects");

            setNullTask(
                "OBJECT: IT.",
                true
            );

            triggerItEvent();

            break;


        case "disruption":

            nullState.disruptionFound = true;

            increaseAnomaly(2);

            saveNullState();

            setNullTask(
                "DISRUPTION DETECTED.",
                true
            );

            triggerDisruptionEvent();

            break;


        case "exit":

            nullState.exitFound = true;

            saveNullState();

            setNullTask(
                "EXIT PATH FOUND.",
                true
            );

            triggerExitEvent();

            break;


        case "light":

            toggleVoidLight();

            break;
    }
}


/* ==========================================================
   LIGHT
   ========================================================== */

function toggleVoidLight() {

    const root = document.getElementById(
        "nullSpaceRoot"
    );

    if (!root) return;

    const lights = root.querySelectorAll(
        ".nullVoidLight"
    );

    nullState.lightsOff =
        !nullState.lightsOff;

    lights.forEach(light => {

        light.classList.toggle(
            "lightOff",
            nullState.lightsOff
        );
    });


    setNullTask(
        nullState.lightsOff
            ? "VOID LIGHT: OFF."
            : "VOID LIGHT: ON.",
        true
    );


    if (nullState.lightsOff) {

        increaseAnomaly(1);
    }

    saveNullState();
}


/* ==========================================================
   ENTRY EVENT
   ========================================================== */

function playNullEntry() {

    const root = document.getElementById(
        "nullSpaceRoot"
    );

    if (!root) return;

    const space = root.querySelector(
        ".nullSpace"
    );

    if (!space) return;

    space.classList.remove(
        "nullSpaceEntering"
    );

    void space.offsetWidth;

    space.classList.add(
        "nullSpaceEntering"
    );


    setTimeout(() => {

        space.classList.remove(
            "nullSpaceEntering"
        );

    }, 1800);
}


function maybeTriggerEntryEvent() {

    if (nullState.visits <= 1) {

        setTimeout(() => {

            if (!nullSpaceActive) return;

            setNullTask(
                "SIGNAL ESTABLISHED."
            );

        }, 2300);

        return;
    }


    if (
        nullState.anomalyLevel >= 4 &&
        Math.random() < 0.35
    ) {

        setTimeout(() => {

            if (!nullSpaceActive) return;

            triggerObservation();

        }, 1800);
    }
}


/* ==========================================================
   NULL OBSERVATION
   ========================================================== */

function triggerObservation() {

    const root = document.getElementById(
        "nullSpaceRoot"
    );

    if (!root) return;

    const presence =
        root.querySelector(
            ".nullPresence"
        );

    if (!presence) return;


    nullState.nullSeen = true;

    increaseAnomaly(1);

    saveNullState();


    presence.classList.add(
        "presenceVisible"
    );


    setNullTask(
        "HERE I AM."
    );


    setTimeout(() => {

        presence.classList.remove(
            "presenceVisible"
        );

    }, 1800);


    setTimeout(() => {

        if (!nullSpaceActive) return;

        setNullTask(
            "NOTHING IS WRONG."
        );

    }, 3000);
}


/* ==========================================================
   ROOM EVENT
   ========================================================== */

function triggerRoomEvent() {

    if (!nullSpaceActive) return;

    const room =
        nullState.room;


    if (room === "ROOM_404") {

        const root =
            document.getElementById(
                "nullSpaceRoot"
            );

        if (root) {

            root.classList.add(
                "nullRoom404Event"
            );

            setTimeout(() => {

                root.classList.remove(
                    "nullRoom404Event"
                );

            }, 900);
        }

        setNullTask(
            "ERR.404."
        );

        return;
    }


    if (room === "ROOM_NULL") {

        setTimeout(() => {

            triggerObservation();

        }, 800);

        return;
    }


    if (
        nullState.anomalyLevel >= 3 &&
        Math.random() < 0.3
    ) {

        setTimeout(() => {

            triggerLightFlicker();

        }, 600);
    }
}


/* ==========================================================
   431434 EVENT
   ========================================================== */

function triggerBlackBlockEvent() {

    const root =
        document.getElementById(
            "nullSpaceRoot"
        );

    if (!root) return;


    root.classList.add(
        "nullBlackBlockEvent"
    );


    setTimeout(() => {

        root.classList.remove(
            "nullBlackBlockEvent"
        );

    }, 700);


    setTimeout(() => {

        if (!nullSpaceActive) return;

        setNullTask(
            "OUTSIDE."
        );

    }, 900);
}


/* ==========================================================
   IT EVENT
   ========================================================== */

function triggerItEvent() {

    const root =
        document.getElementById(
            "nullSpaceRoot"
        );

    if (!root) return;

    const it =
        root.querySelector(
            ".nullWorldIt"
        );

    if (!it) return;


    it.classList.add(
        "itActive"
    );


    setTimeout(() => {

        it.classList.remove(
            "itActive"
        );

    }, 1300);
}


/* ==========================================================
   DISRUPTION EVENT
   ========================================================== */

function triggerDisruptionEvent() {

    const root =
        document.getElementById(
            "nullSpaceRoot"
        );

    if (!root) return;


    const disruption =
        root.querySelector(
            ".nullWorldDisruption"
        );

    if (!disruption) return;


    disruption.classList.add(
        "disruptionActive"
    );


    setTimeout(() => {

        disruption.classList.remove(
            "disruptionActive"
        );

        disruption.classList.add(
            "disruptionGone"
        );

    }, 2200);


    setTimeout(() => {

        disruption.classList.remove(
            "disruptionGone"
        );

    }, 6000);


    setNullTask(
        "NAME.NULL",
        true
    );
}


/* ==========================================================
   EXIT EVENT
   ========================================================== */

function triggerExitEvent() {

    const root =
        document.getElementById(
            "nullSpaceRoot"
        );

    if (!root) return;


    const exit =
        root.querySelector(
            ".nullWorldExit"
        );

    if (!exit) return;


    exit.classList.add(
        "exitActive"
    );


    setTimeout(() => {

        exit.classList.remove(
            "exitActive"
        );

    }, 1600);


    setTimeout(() => {

        if (!nullSpaceActive) return;

        setNullTask(
            "OUTSIDE NOT FOUND."
        );

    }, 900);
}


/* ==========================================================
   LIGHT FLICKER
   ========================================================== */

function triggerLightFlicker() {

    const root =
        document.getElementById(
            "nullSpaceRoot"
        );

    if (!root) return;


    const lights =
        root.querySelectorAll(
            ".nullVoidLight"
        );

    if (!lights.length) return;


    const light =
        lights[
            Math.floor(
                Math.random() *
                lights.length
            )
        ];


    light.classList.add(
        "lightFlicker"
    );


    setTimeout(() => {

        light.classList.remove(
            "lightFlicker"
        );

    }, 850);
}


/* ==========================================================
   CHAT
   ========================================================== */

function sendNullMessage() {

    const input =
        document.getElementById(
            "nullChatInput"
        );

    if (!input) return;


    const text =
        input.value.trim();

    if (!text) return;


    addNullChatMessage(
        "YOU",
        text,
        false
    );


    input.value = "";


    increaseAnomaly(1);


    setTimeout(() => {

        respondToNullChat(text);

    }, 700);
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
        "nullSignalMessage";


    if (unknown) {

        message.classList.add(
            "nullUnknownMessage"
        );
    }


    const time =
        new Date()
            .toLocaleTimeString(
                "en-GB",
                {
                    hour12: false
                }
            );


    message.innerHTML = `
        <span class="signalTime">
            ${escapeNullHTML(time)}
        </span>

        <div>

            <strong>
                ${escapeNullHTML(user)}
            </strong>

            <p>
                ${escapeNullHTML(text)}
            </p>

        </div>
    `;


    container.appendChild(
        message
    );


    container.scrollTop =
        container.scrollHeight;
}


function respondToNullChat(text) {

    const normalized =
        text
            .toLowerCase()
            .trim();


    let response =
        "...";


    if (
        normalized === "hello" ||
        normalized === "hi" ||
        normalized === "привет"
    ) {

        response = "Hello.";
    }


    else if (
        normalized.includes("null")
    ) {

        response = "Yes.";
    }


    else if (
        normalized.includes("who are you") ||
        normalized.includes("кто ты")
    ) {

        response = "You know.";
    }


    else if (
        normalized.includes("where") ||
        normalized.includes("где")
    ) {

        response = "Here.";
    }


    else if (
        normalized.includes("omega")
    ) {

        response = "It was here.";
    }


    else if (
        normalized.includes("exit") ||
        normalized.includes("выход")
    ) {

        response = "There is one.";

        addNullChatMessage(
            "NULL",
            response
        );


        setTimeout(() => {

            addNullChatMessage(
                "NULL",
                "Wrong way."
            );

        }, 1300);

        return;
    }


    else if (
        normalized.includes("help") ||
        normalized.includes("помоги")
    ) {

        response = "I cannot.";
    }


    else if (
        normalized.includes("follow") ||
        normalized.includes("следуй")
    ) {

        response = "Is behind you.";
    }


    else if (
        normalized.includes("see me") ||
        normalized.includes("видишь меня")
    ) {

        response = "Yes.";
    }


    else if (
        normalized.includes("void")
    ) {

        response = "It's me.";
    }


    else {

        response = "...";
    }


    addNullChatMessage(
        "NULL",
        response
    );


    if (
        response === "Yes." ||
        response === "It's me."
    ) {

        nullState.nullSeen = true;

        increaseAnomaly(1);

        saveNullState();
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
        `\n\n> ${command}`;


    input.value = "";


    setTimeout(() => {

        const normalized =
            command.toLowerCase();


        let response =
            "ERR.UNKNOWN";


        if (
            normalized === "help"
        ) {

            response =
                "null\nomega\nintegrity\nexit\nmemory";
        }


        else if (
            normalized === "null"
        ) {

            response =
                "Outside";
        }


        else if (
            normalized === "omega"
        ) {

            response =
                "INSTANCE NOT FOUND";
        }


        else if (
            normalized === "integrity"
        ) {

            response =
                "ERR.NEXTNIGHT";
        }


        else if (
            normalized === "memory"
        ) {

            response =
                "ACCESS DENIED";
        }


        else if (
            normalized === "exit" ||
            normalized === "sv.exit"
        ) {

            response =
                "RETURN PATH FOUND";


            nullState.exitFound = true;

            saveNullState();


            setTimeout(() => {

                exitNullSpace();

            }, 1100);
        }


        else if (
            normalized === "room"
        ) {

            response =
                nullState.room;
        }


        else if (
            normalized === "status"
        ) {

            response =
                `ANOMALY ${nullState.anomalyLevel}/10`;
        }


        output.textContent +=
            `\n${response}`;


        output.scrollTop =
            output.scrollHeight;


        if (
            normalized !== "exit" &&
            normalized !== "sv.exit"
        ) {

            increaseAnomaly(1);
        }


    }, 250);
}


/* ==========================================================
   MEMORY
   ========================================================== */

function updateMemoryState() {

    const root =
        document.getElementById(
            "nullSpaceRoot"
        );

    if (!root) return;


    const entries =
        root.querySelectorAll(
            ".nullMemoryEntry"
        );


    entries.forEach(entry => {

        entry.classList.remove(
            "memoryActive"
        );
    });


    if (nullState.nullSeen) {

        const nullEntry =
            root.querySelector(
                ".nullMemoryEntry:nth-child(4)"
            );

        if (nullEntry) {

            nullEntry.classList.add(
                "memoryActive"
            );
        }
    }
}


/* ==========================================================
   OBJECTS
   ========================================================== */

function handleNullObject(object) {

    const name =
        object.dataset.nullObject ||
        "UNKNOWN";


    if (
        object.classList.contains(
            "nullImpossibleObject"
        )
    ) {

        setNullTask(
            "OBJECT DOES NOT EXIST."
        );


        setTimeout(() => {

            if (!nullSpaceActive) return;

            setNullTask(
                "OBJECT EXISTS."
            );

        }, 1800);


        nullState.nullSeen = true;

        increaseAnomaly(2);

        saveNullState();

        return;
    }


    setNullTask(
        `${name} SELECTED.`,
        true
    );


    if (name === "PLAYER") {

        nullState.nullSeen = true;

        increaseAnomaly(1);

        saveNullState();
    }
}


/* ==========================================================
   EVENT BINDING
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

            const nav =
                event.target.closest(
                    "[data-null-window]"
                );

            if (nav) {

                openNullWindow(
                    nav.dataset.nullWindow
                );

                return;
            }


            const world =
                event.target.closest(
                    "[data-null-world]"
                );

            if (world) {

                handleWorldObject(
                    world.dataset.nullWorld
                );

                return;
            }


            const object =
                event.target.closest(
                    ".nullObject"
                );

            if (object) {

                handleNullObject(
                    object
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
                    "#nullChatSend"
                )
            ) {

                sendNullMessage();

                return;
            }
        }
    );


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

                    event.preventDefault();

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

                    event.preventDefault();

                    executeNullCommand();
                }
            }
        );
    }
}


/* ==========================================================
   HELPERS
   ========================================================== */

function capitalize(string) {

    if (!string) return "";

    return (
        string.charAt(0).toUpperCase() +
        string.slice(1)
    );
}


function escapeNullHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
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

window.openNullWindow =
    openNullWindow;
