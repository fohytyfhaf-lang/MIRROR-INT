/* ==========================================================
   NULL SPACE
   CLEAN REBUILD
   ========================================================== */

"use strict";

/* ==========================================================
   STATE
   ========================================================== */

const nullState = {
    initialized: false,
    active: false,

    root: null,
    container: null,
    world: null,
    room: null,

    roomType: "large",

    animationFrame: null,
    eventTimer: null,

    time: 0,
    anomaly: 0
};


/* ==========================================================
   ROOM TYPES
   ========================================================== */

const NULL_ROOMS = {
    large: {
        name: "LARGE ROOM",
        description: "PROTECTED VOID CHAMBER"
    },

    hallway: {
        name: "HALLWAY",
        description: "GENERATED PASSAGE"
    },

    console: {
        name: "CONSOLE ROOM",
        description: "UNKNOWN SYSTEM CHAMBER"
    },

    pillar: {
        name: "PILLAR ROOM",
        description: "IRREGULAR VOID STRUCTURE"
    }
};


/* ==========================================================
   DOM HELPERS
   ========================================================== */

function nullCreate(tag, className, parent = null) {

    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (parent) {
        parent.appendChild(element);
    }

    return element;
}


/* ==========================================================
   ROOT
   ========================================================== */

function nullGetRoot() {

    const root =
        document.getElementById("nullSpaceRoot");

    if (!root) {

        console.error(
            "[NULL SPACE] #nullSpaceRoot not found."
        );

        return null;
    }

    return root;
}


/* ==========================================================
   BUILD
   ========================================================== */

function nullBuild() {

    const root = nullGetRoot();

    if (!root) {
        return false;
    }

    nullState.root = root;

    /*
        Completely remove anything previously
        created by NULL SPACE.
    */

    root.innerHTML = "";

    root.classList.remove("hidden");
    root.classList.add("nullSpaceRoot");


    /* ------------------------------------------------------
       MAIN CONTAINER
    ------------------------------------------------------ */

    const container =
        nullCreate(
            "div",
            "nullSpace",
            root
        );

    nullState.container = container;


    /* ------------------------------------------------------
       WORLD
    ------------------------------------------------------ */

    const world =
        nullCreate(
            "div",
            "nullWorld",
            container
        );

    nullState.world = world;


    /* ------------------------------------------------------
       BACKGROUND
    ------------------------------------------------------ */

    nullCreate(
        "div",
        "nullWorldBackground",
        world
    );


    /* ------------------------------------------------------
       ROOM
    ------------------------------------------------------ */

    const room =
        nullCreate(
            "div",
            "nullRoom",
            world
        );

    nullState.room = room;

    room.dataset.room =
        nullState.roomType;


    /* ------------------------------------------------------
       ROOM SURFACES
    ------------------------------------------------------ */

    nullCreate(
        "div",
        "nullRoomBack",
        room
    );

    nullCreate(
        "div",
        "nullRoomLeft",
        room
    );

    nullCreate(
        "div",
        "nullRoomRight",
        room
    );

    nullCreate(
        "div",
        "nullRoomFloor",
        room
    );

    nullCreate(
        "div",
        "nullRoomCeiling",
        room
    );


    /* ------------------------------------------------------
       LIGHTS
    ------------------------------------------------------ */

    const lights =
        nullCreate(
            "div",
            "nullRoomLights",
            room
        );

    for (let i = 0; i < 5; i++) {

        const light =
            nullCreate(
                "div",
                "nullVoidLight",
                lights
            );

        light.style.left =
            `${10 + Math.random() * 80}%`;

        light.style.top =
            `${5 + Math.random() * 75}%`;

        light.style.opacity =
            String(
                0.25 +
                Math.random() * 0.55
            );
    }


    /* ------------------------------------------------------
       VOID BLOCKS
    ------------------------------------------------------ */

    const blocks =
        nullCreate(
            "div",
            "nullRoomBlocks",
            room
        );

    for (let i = 0; i < 8; i++) {

        const block =
            nullCreate(
                "div",
                "nullVoidBlock",
                blocks
            );

        block.style.left =
            `${5 + Math.random() * 90}%`;

        block.style.top =
            `${15 + Math.random() * 70}%`;

        block.style.width =
            `${20 + Math.random() * 70}px`;

        block.style.height =
            `${20 + Math.random() * 70}px`;

        block.style.opacity =
            String(
                0.2 +
                Math.random() * 0.45
            );
    }


    /* ------------------------------------------------------
       NULL ENTITY
    ------------------------------------------------------ */

    const entity =
        nullCreate(
            "div",
            "nullEntity",
            room
        );

    entity.id = "nullEntity";


    nullCreate(
        "div",
        "nullEntityHead",
        entity
    );

    nullCreate(
        "div",
        "nullEntityBody",
        entity
    );


    /* ------------------------------------------------------
       ANOMALY
    ------------------------------------------------------ */

    nullCreate(
        "div",
        "nullAnomalyLayer",
        container
    );


    /* ------------------------------------------------------
       INTERFACE
    ------------------------------------------------------ */

    nullBuildInterface(container);


    console.log(
        "[NULL SPACE] World created."
    );

    return true;
}


/* ==========================================================
   INTERFACE
   ========================================================== */

function nullBuildInterface(parent) {

    const interfaceRoot =
        nullCreate(
            "div",
            "nullInterface",
            parent
        );


    /* ------------------------------------------------------
       TOP BAR
    ------------------------------------------------------ */

    const topBar =
        nullCreate(
            "div",
            "nullTopBar",
            interfaceRoot
        );


    const title =
        nullCreate(
            "div",
            "nullTitle",
            topBar
        );

    title.textContent =
        "NULL SPACE";


    const status =
        nullCreate(
            "div",
            "nullStatus",
            topBar
        );

    status.id =
        "nullSpaceStatus";

    status.textContent =
        "DISCONNECTED";


    /* ------------------------------------------------------
       ROOM INFO
    ------------------------------------------------------ */

    const roomInfo =
        nullCreate(
            "div",
            "nullRoomInfo",
            interfaceRoot
        );

    roomInfo.id =
        "nullRoomInfo";

    nullUpdateRoomInfo(roomInfo);


    /* ------------------------------------------------------
       EVENT
    ------------------------------------------------------ */

    const event =
        nullCreate(
            "div",
            "nullEventMessage",
            interfaceRoot
        );

    event.id =
        "nullEventMessage";


    /* ------------------------------------------------------
       NAVIGATION
    ------------------------------------------------------ */

    const navigation =
        nullCreate(
            "div",
            "nullNavigation",
            interfaceRoot
        );


    nullCreateButton(
        navigation,
        "ENTER",
        enterNullSpace
    );


    nullCreateButton(
        navigation,
        "EXIT",
        exitNullSpace
    );


    nullCreateButton(
        navigation,
        "NEXT ROOM",
        nextNullRoom
    );


    /* ------------------------------------------------------
       WINDOWS
    ------------------------------------------------------ */

    const windows =
        nullCreate(
            "div",
            "nullWindows",
            interfaceRoot
        );

    windows.id =
        "nullWindows";
}


/* ==========================================================
   BUTTON
   ========================================================== */

function nullCreateButton(
    parent,
    text,
    callback
) {

    const button =
        nullCreate(
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


/* ==========================================================
   ROOM INFO
   ========================================================== */

function nullUpdateRoomInfo(element = null) {

    if (!element) {

        element =
            document.getElementById(
                "nullRoomInfo"
            );
    }

    if (!element) {
        return;
    }


    const room =
        NULL_ROOMS[
            nullState.roomType
        ];


    element.innerHTML = `
        <div class="nullRoomType">
            ${room.name}
        </div>

        <div class="nullRoomDescription">
            ${room.description}
        </div>
    `;
}


/* ==========================================================
   ENTER
   ========================================================== */

function enterNullSpace() {

    /*
        If the world doesn't exist,
        build it now.
    */

    if (
        !nullState.initialized ||
        !document.querySelector(
            "#nullSpaceRoot .nullSpace"
        )
    ) {

        if (!nullBuild()) {

            return;
        }

        nullState.initialized = true;
    }


    nullState.active = true;


    if (nullState.root) {

        nullState.root.classList.remove(
            "hidden"
        );

        nullState.root.classList.add(
            "active"
        );
    }


    const status =
        document.getElementById(
            "nullSpaceStatus"
        );

    if (status) {

        status.textContent =
            "CONNECTED";
    }


    nullStartLoop();


    nullShowEvent(
        "CONNECTION ESTABLISHED"
    );


    console.log(
        "[NULL SPACE] Entered."
    );
}


/* ==========================================================
   EXIT
   ========================================================== */

function exitNullSpace() {

    nullState.active = false;

    nullStopLoop();


    if (nullState.root) {

        nullState.root.classList.remove(
            "active"
        );

        nullState.root.classList.add(
            "hidden"
        );
    }


    const status =
        document.getElementById(
            "nullSpaceStatus"
        );

    if (status) {

        status.textContent =
            "DISCONNECTED";
    }


    console.log(
        "[NULL SPACE] Exited."
    );
}


/* ==========================================================
   NEXT ROOM
   ========================================================== */

function nextNullRoom() {

    const rooms =
        Object.keys(NULL_ROOMS);


    const current =
        rooms.indexOf(
            nullState.roomType
        );


    const next =
        (current + 1) %
        rooms.length;


    nullState.roomType =
        rooms[next];


    nullBuild();

    nullState.initialized = true;


    if (nullState.active) {

        const status =
            document.getElementById(
                "nullSpaceStatus"
            );

        if (status) {

            status.textContent =
                "CONNECTED";
        }
    }


    nullShowEvent(
        `ROOM: ${NULL_ROOMS[nullState.roomType].name}`
    );
}


/* ==========================================================
   WORLD LOOP
   ========================================================== */

function nullStartLoop() {

    nullStopLoop();


    function frame(timestamp) {

        if (!nullState.active) {

            nullState.animationFrame =
                null;

            return;
        }


        nullState.time =
            timestamp;


        nullUpdateWorld(
            timestamp
        );


        nullState.animationFrame =
            requestAnimationFrame(
                frame
            );
    }


    nullState.animationFrame =
        requestAnimationFrame(
            frame
        );


    nullStartEvents();
}


/* ==========================================================
   STOP LOOP
   ========================================================== */

function nullStopLoop() {

    if (
        nullState.animationFrame !== null
    ) {

        cancelAnimationFrame(
            nullState.animationFrame
        );

        nullState.animationFrame =
            null;
    }


    if (
        nullState.eventTimer !== null
    ) {

        clearTimeout(
            nullState.eventTimer
        );

        nullState.eventTimer =
            null;
    }
}


/* ==========================================================
   WORLD UPDATE
   ========================================================== */

function nullUpdateWorld(timestamp) {

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


    const anomaly =
        nullState.container?.querySelector(
            ".nullAnomalyLayer"
        );


    if (anomaly) {

        const flicker =
            (
                Math.sin(
                    timestamp * 0.002
                ) + 1
            ) / 2;


        anomaly.style.opacity =
            String(
                nullState.anomaly *
                flicker *
                0.15
            );
    }
}


/* ==========================================================
   EVENTS
   ========================================================== */

function nullStartEvents() {

    if (!nullState.active) {
        return;
    }


    const delay =
        7000 +
        Math.random() * 11000;


    nullState.eventTimer =
        setTimeout(
            () => {

                if (!nullState.active) {
                    return;
                }


                nullTriggerAnomaly();

                nullStartEvents();

            },
            delay
        );
}


/* ==========================================================
   ANOMALY
   ========================================================== */

function nullTriggerAnomaly() {

    nullState.anomaly =
        Math.min(
            1,
            nullState.anomaly +
            0.05 +
            Math.random() * 0.15
        );


    const events = [

        "LIGHT INSTABILITY",

        "UNKNOWN MOVEMENT",

        "GEOMETRY SHIFT",

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


    nullShowEvent(
        message
    );
}


/* ==========================================================
   EVENT MESSAGE
   ========================================================== */

function nullShowEvent(message) {

    const element =
        document.getElementById(
            "nullEventMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.add(
        "visible"
    );


    setTimeout(
        () => {

            element.classList.remove(
                "visible"
            );

        },
        3500
    );
}


/* ==========================================================
   WINDOW
   ========================================================== */

function openNullWindow(
    type = "SYSTEM"
) {

    const container =
        document.getElementById(
            "nullWindows"
        );


    if (!container) {

        console.warn(
            "[NULL SPACE] Window container not found."
        );

        return null;
    }


    const windowElement =
        nullCreate(
            "div",
            "nullWindow",
            container
        );


    const header =
        nullCreate(
            "div",
            "nullWindowHeader",
            windowElement
        );

    header.textContent =
        type;


    const close =
        nullCreate(
            "button",
            "nullWindowClose",
            header
        );

    close.type =
        "button";

    close.textContent =
        "×";


    const content =
        nullCreate(
            "div",
            "nullWindowContent",
            windowElement
        );

    content.textContent =
        "NO DATA";


    close.addEventListener(
        "click",
        () => {

            windowElement.remove();

        }
    );


    return windowElement;
}


/* ==========================================================
   INIT
   ========================================================== */

export function initNullSpace() {

    /*
        Always make sure the root exists.
    */

    const root =
        nullGetRoot();


    if (!root) {

        return false;
    }


    nullState.root =
        root;


    /*
        If the DOM is missing,
        build it.
    */

    const existing =
        root.querySelector(
            ".nullSpace"
        );


    if (!existing) {

        if (!nullBuild()) {

            return false;
        }
    }


    nullState.initialized =
        true;


    console.log(
        "[NULL SPACE] Initialized."
    );


    return true;
}


/* ==========================================================
   GLOBAL API
   ========================================================== */

const NullSpace = {

    init: initNullSpace,

    enter: enterNullSpace,

    exit: exitNullSpace,

    nextRoom: nextNullRoom,

    openWindow: openNullWindow,

    getState() {

        return {

            initialized:
                nullState.initialized,

            active:
                nullState.active,

            roomType:
                nullState.roomType,

            anomaly:
                nullState.anomaly
        };
    }
};


/* ==========================================================
   GLOBAL EXPOSURE
   ========================================================== */

window.NullSpace =
    NullSpace;

window.initNullSpace =
    initNullSpace;

window.enterNullSpace =
    enterNullSpace;

window.exitNullSpace =
    exitNullSpace;

window.openNullWindow =
    openNullWindow;


/* ==========================================================
   END
   ========================================================== */

console.log(
    "[NULL SPACE] Module loaded."
);
