"use strict";

/*
============================================================
 NULL SPACE
 THE BROKEN SCRIPT — NEW WORLD SYSTEM
 COMPLETE REBUILD

 No legacy door system.
 No legacy pillar system.
 No legacy background code.
 No fake sci-fi world.

 Base world:
 - Protected Void
 - empty rooms
 - uneven Void Lights
 - dark areas
 - sparse TBS objects
 - Null/entity system prepared for later
============================================================
*/

const NullSpace = (() => {

    /* ========================================================
       STATE
    ======================================================== */

    const state = {
        initialized: false,
        active: false,

        roomType: "large",

        anomaly: null,

        nullVisible: false,

        lightLevel: 1,

        worldTime: 0,

        objects: [],

        eventTimer: null
    };


    /* ========================================================
       CONSTANTS
    ======================================================== */

    const ROOM_TYPES = Object.freeze({
        LARGE: "large",
        HALLWAY: "hallway",
        CONSOLE: "console",
        PILLAR: "pillar"
    });


    /* ========================================================
       ROOT
    ======================================================== */

    function getRoot() {
        return document.getElementById("nullSpaceRoot");
    }


    function getSpace() {
        const root = getRoot();

        if (!root) {
            return null;
        }

        return root.querySelector(".nullSpace");
    }


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    function initNullSpace() {

        const root = getRoot();

        if (!root) {
            console.warn("[NULL SPACE] #nullSpaceRoot not found.");
            return;
        }

        if (state.initialized) {
            return;
        }

        state.initialized = true;

        buildWorld();

        bindEvents();

        console.log("[NULL SPACE] New world initialized.");
    }


    /* ========================================================
       WORLD CREATION
    ======================================================== */

    function buildWorld() {

        const root = getRoot();

        if (!root) {
            return;
        }

        /*
            Completely replace whatever old NULL SPACE
            HTML was previously generated.
        */

        root.innerHTML = "";

        const space = document.createElement("div");

        space.className = "nullSpace";

        space.innerHTML = `
            <div class="nullVoidWorld">

                <div class="nullVoidBackdrop"></div>

                <div class="nullVoidRoom"
                     data-room-type="large">

                    <div class="nullVoidWall wall-back"></div>
                    <div class="nullVoidWall wall-left"></div>
                    <div class="nullVoidWall wall-right"></div>

                    <div class="nullVoidCeiling"></div>
                    <div class="nullVoidFloor"></div>

                    <div class="nullVoidLight light-1"></div>
                    <div class="nullVoidLight light-2"></div>
                    <div class="nullVoidLight light-3"></div>
                    <div class="nullVoidLight light-4"></div>

                </div>

                <!--
                    Entities are generated only when required.
                -->

                <div class="nullEntity" id="nullEntity">
                    <div class="nullEntityHead"></div>
                    <div class="nullEntityBody"></div>
                </div>

                <div class="nullEventOverlay">
                    <div class="nullEventText"></div>
                </div>

            </div>

            <div class="nullInterface">

                <div class="nullTopBar">

                    <div class="nullBrand">

                        <div class="nullBrandMark"></div>

                        <div>
                            <div class="nullBrandTitle">
                                NULL SPACE
                            </div>

                            <div class="nullBrandSubtitle">
                                DAY B
                            </div>
                        </div>

                    </div>

                    <div class="nullStatus">

                        <span class="nullStatusLabel">
                            STATUS
                        </span>

                        <span
                            class="nullStatusValue"
                            id="nullStatusValue">
                            STABLE
                        </span>

                    </div>

                </div>


                <div class="nullWorkspace">

                    <aside class="nullNavigation">

                        <div class="nullNavigationTitle">
                            OBSERVATION
                        </div>

                        <button
                            class="nullNavButton active"
                            data-null-window="room">
                            ROOM
                        </button>

                        <button
                            class="nullNavButton"
                            data-null-window="archive">
                            ARCHIVE
                        </button>

                        <button
                            class="nullNavButton"
                            data-null-window="memory">
                            MEMORY
                        </button>

                        <button
                            class="nullNavButton"
                            data-null-window="objects">
                            OBJECTS
                        </button>

                    </aside>


                    <main class="nullMain">

                        <div
                            class="nullEmptyState"
                            id="nullEmptyState">

                            <div class="nullEmptyZero">
                                0
                            </div>

                            <p>
                                no active observation
                            </p>

                        </div>

                    </main>

                </div>


                <div class="nullTaskbar">

                    <span id="nullTaskMessage">
                        DAY B / LARGE ROOM
                    </span>

                    <button id="nullReturnButton">
                        RETURN
                    </button>

                </div>

            </div>
        `;

        root.appendChild(space);

        state.roomType = ROOM_TYPES.LARGE;

        updateRoomLabel();
    }


    /* ========================================================
       ENTER
    ======================================================== */

    function enterNullSpace() {

        initNullSpace();

        const root = getRoot();

        if (!root) {
            return;
        }

        state.active = true;

        root.classList.remove("hidden");

        const space = getSpace();

        if (!space) {
            return;
        }

        space.classList.remove("nullSpaceEntering");

        /*
            Restart entry animation.
        */

        void space.offsetWidth;

        space.classList.add("nullSpaceEntering");

        state.worldTime = performance.now();

        startWorldLoop();

        setStatus("STABLE");

        console.log("[NULL SPACE] Entered.");
    }


    /* ========================================================
       EXIT
    ======================================================== */

    function exitNullSpace() {

        const root = getRoot();

        if (!root) {
            return;
        }

        state.active = false;

        stopWorldLoop();

        root.classList.add("hidden");

        clearAnomaly();

        hideNull();

        console.log("[NULL SPACE] Exited.");
    }


    /* ========================================================
       WORLD LOOP
    ======================================================== */

    let animationFrame = null;

    function startWorldLoop() {

        stopWorldLoop();

        function tick(time) {

            if (!state.active) {
                return;
            }

            state.worldTime = time;

            updateWorld(time);

            animationFrame =
                requestAnimationFrame(tick);
        }

        animationFrame =
            requestAnimationFrame(tick);
    }


    function stopWorldLoop() {

        if (animationFrame !== null) {

            cancelAnimationFrame(animationFrame);

            animationFrame = null;
        }
    }


    /* ========================================================
       WORLD UPDATE
    ======================================================== */

    function updateWorld(time) {

        const space = getSpace();

        if (!space) {
            return;
        }

        /*
            Very subtle environmental movement.

            This is NOT a wave effect.
            It only changes ambient brightness slightly,
            making the room feel less like a static webpage.
        */

        const seconds = time / 1000;

        const ambient =
            0.96 +
            Math.sin(seconds * 0.17) * 0.025;

        space.style.setProperty(
            "--null-ambient",
            ambient.toFixed(3)
        );
    }


    /* ========================================================
       ROOM SYSTEM
    ======================================================== */

    function setRoom(type) {

        const space = getSpace();

        if (!space) {
            return;
        }

        const room = space.querySelector(".nullVoidRoom");

        if (!room) {
            return;
        }

        if (!Object.values(ROOM_TYPES).includes(type)) {
            type = ROOM_TYPES.LARGE;
        }

        state.roomType = type;

        room.dataset.roomType = type;

        /*
            Remove previous room modifiers.
        */

        room.classList.remove(
            "room-large",
            "room-hallway",
            "room-console",
            "room-pillar"
        );

        room.classList.add(
            `room-${type}`
        );

        updateRoomLabel();

        /*
            Important:

            Pillars are not generated here.

            If later we implement the real Pillar Room,
            it will be an actual room variant rather than
            random columns everywhere.
        */

        if (type === ROOM_TYPES.PILLAR) {
            preparePillarRoom();
        }

        if (type === ROOM_TYPES.CONSOLE) {
            prepareConsoleRoom();
        }
    }


    function updateRoomLabel() {

        const task =
            document.getElementById(
                "nullTaskMessage"
            );

        if (!task) {
            return;
        }

        const names = {
            large: "LARGE ROOM",
            hallway: "HALLWAY",
            console: "CONSOLE ROOM",
            pillar: "PILLAR ROOM"
        };

        task.textContent =
            `DAY B / ${names[state.roomType]}`;
    }


    /* ========================================================
       ROOM VARIANTS
    ======================================================== */

    function preparePillarRoom() {

        /*
            Intentionally empty for now.

            The base world contains no pillars.

            When the actual Pillar Room is implemented,
            its geometry will be generated here.
        */

        console.log(
            "[NULL SPACE] Pillar Room requested."
        );
    }


    function prepareConsoleRoom() {

        /*
            The actual TBS console room will be added later.

            The base NULL SPACE does not contain a console.
        */

        console.log(
            "[NULL SPACE] Console Room requested."
        );
    }


    /* ========================================================
       STATUS
    ======================================================== */

    function setStatus(status) {

        const element =
            document.getElementById(
                "nullStatusValue"
            );

        if (!element) {
            return;
        }

        element.textContent =
            String(status).toUpperCase();
    }


    /* ========================================================
       ANOMALIES
    ======================================================== */

    function setAnomaly(type) {

        const space = getSpace();

        if (!space) {
            return;
        }

        clearAnomaly();

        state.anomaly = type;

        space.classList.add(
            `anomaly-${type}`
        );

        setStatus(
            type === "red"
                ? "ANOMALY"
                : "UNSTABLE"
        );
    }


    function clearAnomaly() {

        const space = getSpace();

        if (!space) {
            return;
        }

        space.classList.remove(
            "anomaly-blackout",
            "anomaly-dark",
            "anomaly-distort",
            "anomaly-red"
        );

        state.anomaly = null;

        setStatus("STABLE");
    }


    /* ========================================================
       EVENT MESSAGE
    ======================================================== */

    function showEventMessage(text, duration = 2200) {

        const space = getSpace();

        if (!space) {
            return;
        }

        const overlay =
            space.querySelector(
                ".nullEventOverlay"
            );

        const message =
            space.querySelector(
                ".nullEventText"
            );

        if (!overlay || !message) {
            return;
        }

        message.textContent = text;

        overlay.style.opacity = "1";

        window.clearTimeout(
            showEventMessage.timeout
        );

        showEventMessage.timeout =
            window.setTimeout(() => {

                overlay.style.opacity = "0";

                message.textContent = "";

            }, duration);
    }


    /* ========================================================
       NULL ENTITY
    ======================================================== */

    function showNull(options = {}) {

        const space = getSpace();

        if (!space) {
            return;
        }

        const entity =
            space.querySelector(
                "#nullEntity"
            );

        if (!entity) {
            return;
        }

        state.nullVisible = true;

        entity.classList.add(
            "visible"
        );

        /*
            Position can be supplied later by event logic.
        */

        if (
            typeof options.x === "number"
        ) {
            entity.style.left =
                `${options.x}%`;
        }

        if (
            typeof options.y === "number"
        ) {
            entity.style.top =
                `${options.y}%`;
        }
    }


    function hideNull() {

        const space = getSpace();

        if (!space) {
            return;
        }

        const entity =
            space.querySelector(
                "#nullEntity"
            );

        if (!entity) {
            return;
        }

        state.nullVisible = false;

        entity.classList.remove(
            "visible",
            "is-visible"
        );
    }


    /* ========================================================
       NULL EVENTS
    ======================================================== */

    function nullStalk() {

        if (!state.active) {
            return;
        }

        showNull({
            x: 67,
            y: 52
        });

        showEventMessage(
            "NULL IS OBSERVING",
            1800
        );
    }


    function nullDisappear() {

        hideNull();

        showEventMessage(
            "",
            300
        );
    }


    function nullScare() {

        if (!state.active) {
            return;
        }

        showNull({
            x: 50,
            y: 45
        });

        setAnomaly("distort");

        showEventMessage(
            "HERE I AM",
            1100
        );

        window.setTimeout(() => {

            hideNull();

            clearAnomaly();

        }, 1400);
    }


    /* ========================================================
       WORLD OBJECTS
    ======================================================== */

    function spawnObject(type, options = {}) {

        const space = getSpace();

        if (!space) {
            return null;
        }

        const object =
            document.createElement("div");

        object.className =
            `nullWorldObject nullWorld${capitalize(type)}`;

        object.dataset.nullObject =
            type;

        if (
            typeof options.x === "number"
        ) {
            object.style.left =
                `${options.x}%`;
        }

        if (
            typeof options.y === "number"
        ) {
            object.style.top =
                `${options.y}%`;
        }

        space.appendChild(object);

        state.objects.push(object);

        return object;
    }


    function removeObject(object) {

        if (!object) {
            return;
        }

        object.remove();

        const index =
            state.objects.indexOf(object);

        if (index !== -1) {
            state.objects.splice(index, 1);
        }
    }


    function clearObjects() {

        for (
            const object of state.objects
        ) {
            object.remove();
        }

        state.objects.length = 0;
    }


    /* ========================================================
       UTILITIES
    ======================================================== */

    function capitalize(value) {

        if (!value) {
            return "";
        }

        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );
    }


    /* ========================================================
       NAVIGATION
    ======================================================== */

    function openNullWindow(type) {

        const main =
            document.querySelector(
                "#nullSpaceRoot .nullMain"
            );

        if (!main) {
            return;
        }

        /*
            Remove previous internal window.
        */

        const oldWindow =
            main.querySelector(
                ".nullInternalWindow"
            );

        if (oldWindow) {
            oldWindow.remove();
        }

        const empty =
            main.querySelector(
                ".nullEmptyState"
            );

        if (empty) {
            empty.style.display =
                "none";
        }

        const windowElement =
            document.createElement("section");

        windowElement.className =
            "nullInternalWindow";

        windowElement.innerHTML =
            createWindowContent(type);

        main.appendChild(
            windowElement
        );

        updateNavigation(type);
    }


    function createWindowContent(type) {

        switch (type) {

            case "room":
                return `
                    <div class="nullWindowHeader">
                        ROOM / DAY B
                    </div>

                    <div class="nullRoomData">

                        <div>
                            DIMENSION:
                            DAY B
                        </div>

                        <div>
                            ROOM:
                            ${state.roomType.toUpperCase()}
                        </div>

                        <div>
                            STRUCTURE:
                            PROTECTED VOID
                        </div>

                        <div>
                            LIGHT:
                            UNEVEN
                        </div>

                    </div>
                `;


            case "archive":
                return `
                    <div class="nullWindowHeader">
                        ARCHIVE
                    </div>

                    <div class="nullArchiveList">

                        <div>
                            DAY B
                        </div>

                        <div>
                            PROTECTED VOID
                        </div>

                        <div>
                            ROOM GENERATION
                        </div>

                        <div>
                            UNKNOWN
                        </div>

                    </div>
                `;


            case "memory":
                return `
                    <div class="nullWindowHeader">
                        MEMORY
                    </div>

                    <div class="nullMemoryList">

                        <div>
                            MEMORY INDEX: 000
                        </div>

                        <div>
                            NO RELIABLE DATA
                        </div>

                    </div>
                `;


            case "objects":
                return `
                    <div class="nullWindowHeader">
                        OBJECTS
                    </div>

                    <div class="nullObjectGrid">

                        <button
                            class="nullObject"
                            data-null-object="431434">

                            431434

                        </button>

                        <button
                            class="nullObject"
                            data-null-object="disruption">

                            DISRUPTION

                        </button>

                        <button
                            class="nullObject"
                            data-null-object="it">

                            IT

                        </button>

                        <button
                            class="nullObject"
                            data-null-object="hello">

                            HELLO

                        </button>

                    </div>
                `;


            default:
                return `
                    <div class="nullWindowHeader">
                        NULL
                    </div>
                `;
        }
    }


    function updateNavigation(type) {

        const root = getRoot();

        if (!root) {
            return;
        }

        root
            .querySelectorAll(
                ".nullNavButton"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.nullWindow === type
                );

            });
    }


    /* ========================================================
       CLICK EVENTS
    ======================================================== */

    function bindEvents() {

        const root = getRoot();

        if (!root) {
            return;
        }

        root.addEventListener(
            "click",
            handleClick
        );
    }


    function handleClick(event) {

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


        const object =
            event.target.closest(
                "[data-null-object]"
            );

        if (object) {

            handleObjectInteraction(
                object.dataset.nullObject
            );
        }
    }


    /* ========================================================
       OBJECT INTERACTIONS
    ======================================================== */

    function handleObjectInteraction(type) {

        switch (type) {

            case "431434":

                showEventMessage(
                    "431434",
                    1200
                );

                break;


            case "disruption":

                setAnomaly("distort");

                showEventMessage(
                    "DISRUPTION",
                    1400
                );

                window.setTimeout(
                    clearAnomaly,
                    1500
                );

                break;


            case "it":

                showEventMessage(
                    "IT",
                    1200
                );

                break;


            case "hello":

                setAnomaly("red");

                showEventMessage(
                    "HELLO",
                    1500
                );

                window.setTimeout(
                    clearAnomaly,
                    1700
                );

                break;


            default:

                console.log(
                    "[NULL SPACE] Unknown object:",
                    type
                );
        }
    }


    /* ========================================================
       PUBLIC API
    ======================================================== */

    return {

        init: initNullSpace,

        enter: enterNullSpace,

        exit: exitNullSpace,

        setRoom,

        setStatus,

        setAnomaly,

        clearAnomaly,

        showEventMessage,

        showNull,

        hideNull,

        nullStalk,

        nullDisappear,

        nullScare,

        spawnObject,

        removeObject,

        clearObjects,

        openWindow: openNullWindow,

        getState() {
            return {
                ...state,
                objects: [...state.objects]
            };
        }

    };

})();


/* ============================================================
   GLOBAL COMPATIBILITY API
============================================================ */

/*
    These names allow the rest of OMEGA to continue calling
    the NULL SPACE without requiring the old implementation.
*/

window.initNullSpace =
    () => NullSpace.init();

window.enterNullSpace =
    () => NullSpace.enter();

window.exitNullSpace =
    () => NullSpace.exit();

window.openNullWindow =
    type => NullSpace.openWindow(type);


/* ============================================================
   AUTO INITIALIZATION
============================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => NullSpace.init(),
        { once: true }
    );

} else {

    NullSpace.init();
}
