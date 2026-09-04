/* ==========================================================
   NULL SPACE
   CLEAN VERSION
   No external dependencies
========================================================== */

const NullSpace = (() => {

    // ------------------------------------------------------
    // STATE
    // ------------------------------------------------------

    const state = {
        initialized: false,
        active: false,

        root: null,
        world: null,

        animationFrame: null,
        eventTimer: null,

        time: 0,
        roomType: "large",

        anomaly: 0,
        darkness: 0,

        windows: new Map()
    };


    // ------------------------------------------------------
    // ROOM TYPES
    // ------------------------------------------------------

    const ROOM_TYPES = {
        large: {
            name: "LARGE ROOM",
            description: "Protected void chamber"
        },

        hallway: {
            name: "HALLWAY",
            description: "Generated passage"
        },

        console: {
            name: "CONSOLE ROOM",
            description: "Unknown system chamber"
        },

        pillar: {
            name: "PILLAR ROOM",
            description: "Irregular void structure"
        }
    };


    // ------------------------------------------------------
    // UTILITY
    // ------------------------------------------------------

    function createElement(tag, className, parent = null) {

        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (parent) {
            parent.appendChild(element);
        }

        return element;
    }


    function clearRoot() {

        if (!state.root) return;

        state.root.innerHTML = "";
    }


    function random(min, max) {

        return Math.random() * (max - min) + min;
    }


    function clamp(value, min, max) {

        return Math.max(min, Math.min(max, value));
    }


    // ------------------------------------------------------
    // BUILD ROOT
    // ------------------------------------------------------

    function buildRoot() {

        state.root = document.getElementById("nullSpaceRoot");

        if (!state.root) {

            console.error(
                "[NULL SPACE] #nullSpaceRoot was not found."
            );

            return false;
        }

        clearRoot();

        state.root.classList.remove("hidden");
        state.root.classList.add("nullSpaceRoot");

        return true;
    }


    // ------------------------------------------------------
    // BUILD WORLD
    // ------------------------------------------------------

    function buildWorld() {

        if (!state.root) return;

        // Main container
        const space = createElement(
            "div",
            "nullSpace"
        );

        state.world = space;


        // --------------------------------------------------
        // WORLD
        // --------------------------------------------------

        const world = createElement(
            "div",
            "nullWorld",
            space
        );


        // Background
        createElement(
            "div",
            "nullWorldBackground",
            world
        );


        // Room
        const room = createElement(
            "div",
            "nullRoom",
            world
        );

        room.dataset.room = state.roomType;


        // --------------------------------------------------
        // ROOM SURFACES
        // --------------------------------------------------

        createElement(
            "div",
            "nullRoomBack",
            room
        );

        createElement(
            "div",
            "nullRoomLeft",
            room
        );

        createElement(
            "div",
            "nullRoomRight",
            room
        );

        createElement(
            "div",
            "nullRoomFloor",
            room
        );

        createElement(
            "div",
            "nullRoomCeiling",
            room
        );


        // --------------------------------------------------
        // LIGHTS
        // --------------------------------------------------

        const lights = createElement(
            "div",
            "nullRoomLights",
            room
        );

        for (let i = 0; i < 5; i++) {

            const light = createElement(
                "div",
                "nullVoidLight",
                lights
            );

            light.style.left = `${random(10, 90)}%`;
            light.style.top = `${random(10, 70)}%`;

            light.style.opacity =
                random(0.25, 0.8).toFixed(2);
        }


        // --------------------------------------------------
        // RANDOM VOID BLOCKS
        // --------------------------------------------------

        const blocks = createElement(
            "div",
            "nullRoomBlocks",
            room
        );

        for (let i = 0; i < 8; i++) {

            const block = createElement(
                "div",
                "nullVoidBlock",
                blocks
            );

            block.style.left =
                `${random(5, 95)}%`;

            block.style.top =
                `${random(15, 85)}%`;

            block.style.width =
                `${random(20, 80)}px`;

            block.style.height =
                `${random(20, 80)}px`;

            block.style.opacity =
                random(0.25, 0.65).toFixed(2);
        }


        // --------------------------------------------------
        // NULL ENTITY
        // --------------------------------------------------

        const entity = createElement(
            "div",
            "nullEntity",
            room
        );

        entity.id = "nullEntity";

        createElement(
            "div",
            "nullEntityHead",
            entity
        );

        createElement(
            "div",
            "nullEntityBody",
            entity
        );


        // --------------------------------------------------
        // ANOMALY LAYER
        // --------------------------------------------------

        createElement(
            "div",
            "nullAnomalyLayer",
            space
        );


        // --------------------------------------------------
        // UI
        // --------------------------------------------------

        buildInterface(space);
    }


    // ------------------------------------------------------
    // INTERFACE
    // ------------------------------------------------------

    function buildInterface(parent) {

        const ui = createElement(
            "div",
            "nullInterface",
            parent
        );


        // --------------------------------------------------
        // TOP BAR
        // --------------------------------------------------

        const top = createElement(
            "div",
            "nullTopBar",
            ui
        );


        const title = createElement(
            "div",
            "nullTitle",
            top
        );

        title.textContent = "NULL SPACE";


        const status = createElement(
            "div",
            "nullStatus",
            top
        );

        status.id = "nullSpaceStatus";

        status.textContent = "DISCONNECTED";


        // --------------------------------------------------
        // ROOM INFO
        // --------------------------------------------------

        const info = createElement(
            "div",
            "nullRoomInfo",
            ui
        );

        info.id = "nullRoomInfo";

        updateRoomInfo(info);


        // --------------------------------------------------
        // EVENT MESSAGE
        // --------------------------------------------------

        const event = createElement(
            "div",
            "nullEventMessage",
            ui
        );

        event.id = "nullEventMessage";


        // --------------------------------------------------
        // NAVIGATION
        // --------------------------------------------------

        const navigation = createElement(
            "div",
            "nullNavigation",
            ui
        );


        createNavigationButton(
            navigation,
            "ENTER",
            enterNullSpace
        );


        createNavigationButton(
            navigation,
            "EXIT",
            exitNullSpace
        );


        createNavigationButton(
            navigation,
            "NEXT ROOM",
            nextRoom
        );


        // --------------------------------------------------
        // WINDOWS
        // --------------------------------------------------

        const windows = createElement(
            "div",
            "nullWindows",
            ui
        );

        windows.id = "nullWindows";
    }


    function createNavigationButton(parent, text, callback) {

        const button = createElement(
            "button",
            "nullNavigationButton",
            parent
        );

        button.type = "button";
        button.textContent = text;

        button.addEventListener(
            "click",
            callback
        );

        return button;
    }


    // ------------------------------------------------------
    // ROOM INFO
    // ------------------------------------------------------

    function updateRoomInfo(element = null) {

        if (!element) {

            element = document.getElementById(
                "nullRoomInfo"
            );
        }

        if (!element) return;

        const room =
            ROOM_TYPES[state.roomType] ||
            ROOM_TYPES.large;

        element.innerHTML = `
            <div class="nullRoomType">
                ${room.name}
            </div>

            <div class="nullRoomDescription">
                ${room.description}
            </div>
        `;
    }


    // ------------------------------------------------------
    // ENTER
    // ------------------------------------------------------

    function enterNullSpace() {

        if (!state.initialized) {

            initNullSpace();
        }

        if (!state.root) return;

        state.active = true;

        state.root.classList.remove(
            "hidden"
        );

        state.root.classList.add(
            "active"
        );


        const status =
            document.getElementById(
                "nullSpaceStatus"
            );

        if (status) {

            status.textContent = "CONNECTED";
        }


        startWorldLoop();

        showEvent(
            "CONNECTION ESTABLISHED"
        );
    }


    // ------------------------------------------------------
    // EXIT
    // ------------------------------------------------------

    function exitNullSpace() {

        state.active = false;

        stopWorldLoop();

        if (!state.root) return;

        state.root.classList.remove(
            "active"
        );

        state.root.classList.add(
            "hidden"
        );


        const status =
            document.getElementById(
                "nullSpaceStatus"
            );

        if (status) {

            status.textContent =
                "DISCONNECTED";
        }
    }


    // ------------------------------------------------------
    // NEXT ROOM
    // ------------------------------------------------------

    function nextRoom() {

        const types = Object.keys(
            ROOM_TYPES
        );

        const currentIndex =
            types.indexOf(
                state.roomType
            );

        const nextIndex =
            (currentIndex + 1) %
            types.length;

        state.roomType =
            types[nextIndex];


        rebuildRoom();

        showEvent(
            `ROOM TYPE: ${ROOM_TYPES[state.roomType].name}`
        );
    }


    // ------------------------------------------------------
    // REBUILD ROOM
    // ------------------------------------------------------

    function rebuildRoom() {

        if (!state.root) return;

        const oldSpace =
            state.root.querySelector(
                ".nullSpace"
            );

        if (!oldSpace) {

            buildWorld();
            return;
        }


        oldSpace.remove();

        buildWorld();
    }


    // ------------------------------------------------------
    // WORLD LOOP
    // ------------------------------------------------------

    function startWorldLoop() {

        stopWorldLoop();

        function loop(timestamp) {

            if (!state.active) {

                state.animationFrame = null;

                return;
            }

            state.time = timestamp;

            updateWorld(timestamp);

            state.animationFrame =
                requestAnimationFrame(loop);
        }

        state.animationFrame =
            requestAnimationFrame(loop);


        startRandomEvents();
    }


    function stopWorldLoop() {

        if (state.animationFrame) {

            cancelAnimationFrame(
                state.animationFrame
            );

            state.animationFrame = null;
        }


        if (state.eventTimer) {

            clearTimeout(
                state.eventTimer
            );

            state.eventTimer = null;
        }
    }


    // ------------------------------------------------------
    // WORLD UPDATE
    // ------------------------------------------------------

    function updateWorld(timestamp) {

        if (!state.world) return;


        const entity =
            document.getElementById(
                "nullEntity"
            );

        if (entity) {

            const movement =
                Math.sin(
                    timestamp * 0.0004
                );

            entity.style.transform =
                `translateX(${movement * 3}px)`;
        }


        const anomalyLayer =
            state.world.querySelector(
                ".nullAnomalyLayer"
            );

        if (anomalyLayer) {

            const flicker =
                Math.sin(
                    timestamp * 0.002
                ) * 0.5 + 0.5;

            anomalyLayer.style.opacity =
                (
                    state.anomaly *
                    flicker *
                    0.15
                ).toFixed(3);
        }
    }


    // ------------------------------------------------------
    // RANDOM EVENTS
    // ------------------------------------------------------

    function startRandomEvents() {

        if (!state.active) return;


        const delay =
            random(7000, 18000);


        state.eventTimer =
            setTimeout(() => {

                if (!state.active) return;

                triggerAnomaly();

                startRandomEvents();

            }, delay);
    }


    function triggerAnomaly() {

        state.anomaly =
            clamp(
                state.anomaly +
                random(0.05, 0.2),
                0,
                1
            );


        const events = [

            "LIGHT INSTABILITY",

            "UNKNOWN MOVEMENT",

            "ROOM GEOMETRY SHIFT",

            "SIGNAL INTERRUPTION",

            "UNIDENTIFIED PRESENCE",

            "VOID ACTIVITY",

            "NOISE DETECTED"

        ];


        const message =
            events[
                Math.floor(
                    Math.random() *
                    events.length
                )
            ];


        showEvent(message);
    }


    // ------------------------------------------------------
    // EVENT MESSAGE
    // ------------------------------------------------------

    function showEvent(message) {

        const element =
            document.getElementById(
                "nullEventMessage"
            );

        if (!element) return;


        element.textContent = message;

        element.classList.add(
            "visible"
        );


        setTimeout(() => {

            element.classList.remove(
                "visible"
            );

        }, 3500);
    }


    // ------------------------------------------------------
    // WINDOWS
    // ------------------------------------------------------

    function openNullWindow(type = "SYSTEM") {

        const container =
            document.getElementById(
                "nullWindows"
            );

        if (!container) return null;


        if (state.windows.has(type)) {

            const existing =
                state.windows.get(type);

            existing.classList.add(
                "active"
            );

            return existing;
        }


        const windowElement =
            createElement(
                "div",
                "nullWindow",
                container
            );


        const header =
            createElement(
                "div",
                "nullWindowHeader",
                windowElement
            );

        header.textContent = type;


        const content =
            createElement(
                "div",
                "nullWindowContent",
                windowElement
            );

        content.textContent =
            "NO DATA";


        const close =
            createElement(
                "button",
                "nullWindowClose",
                header
            );

        close.type = "button";
        close.textContent = "×";


        close.addEventListener(
            "click",
            () => {

                windowElement.remove();

                state.windows.delete(
                    type
                );
            }
        );


        state.windows.set(
            type,
            windowElement
        );


        return windowElement;
    }


    // ------------------------------------------------------
    // INITIALIZATION
    // ------------------------------------------------------

    function initNullSpace() {

        if (state.initialized) {

            return NullSpace;
        }


        if (!buildRoot()) {

            return NullSpace;
        }


        buildWorld();


        state.initialized = true;
        state.active = false;


        return NullSpace;
    }


    // ------------------------------------------------------
    // PUBLIC API
    // ------------------------------------------------------

    return {

        init: initNullSpace,

        enter: enterNullSpace,

        exit: exitNullSpace,

        nextRoom,

        openWindow: openNullWindow,

        getState() {

            return {
                initialized:
                    state.initialized,

                active:
                    state.active,

                roomType:
                    state.roomType,

                anomaly:
                    state.anomaly
            };
        }
    };

})();


// ==========================================================
// GLOBAL ACCESS
// ==========================================================
//
// IMPORTANT:
// The module itself remains modular,
// but the public controller is also exposed
// globally for console/testing.
//

window.NullSpace = NullSpace;


// ==========================================================
// OPTIONAL GLOBAL SHORTCUTS
// ==========================================================

window.initNullSpace = () =>
    NullSpace.init();

window.enterNullSpace = () =>
    NullSpace.enter();

window.exitNullSpace = () =>
    NullSpace.exit();

window.openNullWindow = (type) =>
    NullSpace.openWindow(type);


// ==========================================================
// ES MODULE EXPORT
// ==========================================================
//
// These are REAL top-level functions.
// No fake exports.
// No references to functions hidden
// inside the IIFE.
//

export function initNullSpace() {

    return NullSpace.init();
}

export function enterNullSpace() {

    return NullSpace.enter();
}

export function exitNullSpace() {

    return NullSpace.exit();
}

export function openNullWindow(type) {

    return NullSpace.openWindow(type);
}
