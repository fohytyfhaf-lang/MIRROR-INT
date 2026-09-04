/* ==========================================================
   NULL SPACE
   Atmosphere + Rooms + Error System
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
   STATE
   ========================================================== */

const nullState = {
    initialized: false,
    active: false,

    roomType: "large",
    roomIndex: 0,

    eventTimer: null,
    errorTimer: null,

    currentError: null,

    errorCooldown: false,

    roomElements: {
        room: null,
        lights: null,
        blocks: null,
        entity: null,
        anomaly: null,
        windows: null
    }
};


/* ==========================================================
   ERROR DATABASE
   ========================================================== */

const NULL_ERRORS = [

    // ------------------------------------------------------
    // LOW LEVEL
    // ------------------------------------------------------

    {
        text: "err.null",
        type: "normal",
        duration: 900,
        weight: 30
    },

    {
        text: "null.err",
        type: "normal",
        duration: 800,
        weight: 25
    },

    {
        text: "ERR.UNKNOWN",
        type: "normal",
        duration: 850,
        weight: 20
    },

    {
        text: "ERR.000",
        type: "normal",
        duration: 700,
        weight: 18
    },

    {
        text: "ERR.VOID",
        type: "normal",
        duration: 900,
        weight: 12
    },

    {
        text: "RETURNEDVALUE=-1",
        type: "normal",
        duration: 1000,
        weight: 10
    },

    // ------------------------------------------------------
    // SYSTEM ERRORS
    // ------------------------------------------------------

    {
        text: "IMPORT minecraft.chatengine",
        type: "system",
        duration: 1100,
        weight: 10
    },

    {
        text: "Unexpected_error.returnedvalue=-1",
        type: "system",
        duration: 1300,
        weight: 8
    },

    {
        text: "ENTITYTYPE: NULL",
        type: "system",
        duration: 1100,
        weight: 8
    },

    {
        text: "ENTITY ID = 00000000",
        type: "system",
        duration: 1000,
        weight: 6
    },

    {
        text: "PLAYER STATE: NULL",
        type: "system",
        duration: 1000,
        weight: 6
    },

    {
        text: "OBJECT.NULL",
        type: "system",
        duration: 900,
        weight: 7
    },

    // ------------------------------------------------------
    // CORRUPTED
    // ------------------------------------------------------

    {
        text: "ERR.NU██",
        type: "corrupted",
        duration: 1000,
        weight: 5
    },

    {
        text: "ENTI█YTYPE: N█LL",
        type: "corrupted",
        duration: 1100,
        weight: 5
    },

    {
        text: "RETUR█EDVALUE=-1",
        type: "corrupted",
        duration: 1100,
        weight: 4
    },

    {
        text: "NUL█.ERR",
        type: "corrupted",
        duration: 900,
        weight: 4
    },

    {
        text: "████████",
        type: "corrupted",
        duration: 650,
        weight: 3
    },

    // ------------------------------------------------------
    // RARE
    // ------------------------------------------------------

    {
        text: "HERE I AM",
        type: "rare",
        duration: 1500,
        weight: 2
    },

    {
        text: "CAN YOU SEE ME?",
        type: "rare",
        duration: 1500,
        weight: 2
    },

    {
        text: "WE CAN HEAR YOU",
        type: "rare",
        duration: 1500,
        weight: 1
    },

    {
        text: "BEHIND YOU",
        type: "rare",
        duration: 1300,
        weight: 1
    },

    {
        text: "VOIDNULLSILUETTANOMALY",
        type: "rare",
        duration: 1600,
        weight: 1
    },

    {
        text: "YOU KNOW NOTHING",
        type: "rare",
        duration: 1300,
        weight: 1
    }
];


/* ==========================================================
   RANDOM UTILITIES
   ========================================================== */

function random(min, max) {
    return Math.random() * (max - min) + min;
}


function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}


function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}


/* ==========================================================
   ROOT
   ========================================================== */

function getRoot() {
    return document.getElementById("nullSpaceRoot");
}


/* ==========================================================
   BUILD
   ========================================================== */

function nullBuild() {

    const root = getRoot();

    if (!root) {
        console.error("[NULL SPACE] #nullSpaceRoot not found.");
        return false;
    }

    root.innerHTML = "";

    const space = document.createElement("div");
    space.className = "nullSpace";

    /* ------------------------------------------------------
       WORLD
       ------------------------------------------------------ */

    const world = document.createElement("div");
    world.className = "nullWorld";

    const background = document.createElement("div");
    background.className = "nullWorldBackground";

    /* ------------------------------------------------------
       ROOM
       ------------------------------------------------------ */

    const room = document.createElement("div");
    room.className = "nullRoom";

    const back = document.createElement("div");
    back.className = "nullRoomBack";

    const left = document.createElement("div");
    left.className = "nullRoomLeft";

    const right = document.createElement("div");
    right.className = "nullRoomRight";

    const floor = document.createElement("div");
    floor.className = "nullRoomFloor";

    const ceiling = document.createElement("div");
    ceiling.className = "nullRoomCeiling";

    /* ------------------------------------------------------
       LIGHTS
       ------------------------------------------------------ */

    const lights = document.createElement("div");
    lights.className = "nullRoomLights";

    for (let i = 0; i < 5; i++) {

        const light = document.createElement("div");

        light.className = "nullVoidLight";
        light.dataset.light = i;

        light.style.setProperty(
            "--light-x",
            `${random(8, 92)}%`
        );

        light.style.setProperty(
            "--light-y",
            `${random(8, 70)}%`
        );

        light.style.setProperty(
            "--light-delay",
            `${random(0, 4)}s`
        );

        light.style.setProperty(
            "--light-scale",
            random(0.75, 1.25).toFixed(2)
        );

        lights.appendChild(light);
    }

    /* ------------------------------------------------------
       BLOCKS
       ------------------------------------------------------ */

    const blocks = document.createElement("div");
    blocks.className = "nullRoomBlocks";

    for (let i = 0; i < 8; i++) {

        const block = document.createElement("div");

        block.className = "nullVoidBlock";
        block.dataset.block = i;

        block.style.setProperty(
            "--block-x",
            `${random(5, 95)}%`
        );

        block.style.setProperty(
            "--block-y",
            `${random(10, 85)}%`
        );

        block.style.setProperty(
            "--block-z",
            `${random(-100, 120)}px`
        );

        block.style.setProperty(
            "--block-scale",
            random(0.65, 1.45).toFixed(2)
        );

        block.style.setProperty(
            "--block-rotation",
            `${randomInt(-12, 12)}deg`
        );

        blocks.appendChild(block);
    }

    /* ------------------------------------------------------
       ENTITY
       ------------------------------------------------------ */

    const entity = document.createElement("div");
    entity.className = "nullEntity";

    const entityHead = document.createElement("div");
    entityHead.className = "nullEntityHead";
    entityHead.id = "nullEntityHead";

    const entityBody = document.createElement("div");
    entityBody.className = "nullEntityBody";

    entity.appendChild(entityHead);
    entity.appendChild(entityBody);

    /* ------------------------------------------------------
       ANOMALY
       ------------------------------------------------------ */

    const anomaly = document.createElement("div");
    anomaly.className = "nullAnomalyLayer";

    /* ------------------------------------------------------
       ASSEMBLE ROOM
       ------------------------------------------------------ */

    room.appendChild(back);
    room.appendChild(left);
    room.appendChild(right);
    room.appendChild(floor);
    room.appendChild(ceiling);
    room.appendChild(lights);
    room.appendChild(blocks);
    room.appendChild(entity);
    room.appendChild(anomaly);

    world.appendChild(background);
    world.appendChild(room);

    /* ------------------------------------------------------
       INTERFACE
       ------------------------------------------------------ */

    const interfaceLayer = document.createElement("div");
    interfaceLayer.className = "nullInterface";

    const topBar = document.createElement("div");
    topBar.className = "nullTopBar";

    const title = document.createElement("div");
    title.className = "nullTitle";
    title.textContent = "NULL SPACE";

    const status = document.createElement("div");
    status.className = "nullStatus";
    status.textContent = "CONNECTED";

    topBar.appendChild(title);
    topBar.appendChild(status);

    const roomInfo = document.createElement("div");
    roomInfo.className = "nullRoomInfo";

    const eventMessage = document.createElement("div");
    eventMessage.className = "nullEventMessage";

    const navigation = document.createElement("div");
    navigation.className = "nullNavigation";

    const enterButton = document.createElement("button");
    enterButton.textContent = "ENTER";

    const exitButton = document.createElement("button");
    exitButton.textContent = "EXIT";

    const nextButton = document.createElement("button");
    nextButton.textContent = "NEXT ROOM";

    enterButton.addEventListener("click", enterNullSpace);
    exitButton.addEventListener("click", exitNullSpace);
    nextButton.addEventListener("click", nextNullRoom);

    navigation.appendChild(enterButton);
    navigation.appendChild(exitButton);
    navigation.appendChild(nextButton);

    interfaceLayer.appendChild(topBar);
    interfaceLayer.appendChild(roomInfo);
    interfaceLayer.appendChild(eventMessage);
    interfaceLayer.appendChild(navigation);

    /* ------------------------------------------------------
       ERROR LAYER
       ------------------------------------------------------ */

    const errorLayer = document.createElement("div");
    errorLayer.className = "nullErrorLayer";
    errorLayer.setAttribute("aria-hidden", "true");

    const errorGlitch = document.createElement("div");
    errorGlitch.className = "nullErrorGlitch";

    const errorText = document.createElement("div");
    errorText.className = "nullErrorText";

    const errorSubtext = document.createElement("div");
    errorSubtext.className = "nullErrorSubtext";

    errorLayer.appendChild(errorGlitch);
    errorLayer.appendChild(errorText);
    errorLayer.appendChild(errorSubtext);

    /* ------------------------------------------------------
       WINDOWS
       ------------------------------------------------------ */

    const windows = document.createElement("div");
    windows.className = "nullWindows";

    /* ------------------------------------------------------
       FINAL ASSEMBLY
       ------------------------------------------------------ */

    space.appendChild(world);
    space.appendChild(errorLayer);
    space.appendChild(interfaceLayer);
    space.appendChild(windows);

    root.appendChild(space);

    /* ------------------------------------------------------
       STORE REFERENCES
       ------------------------------------------------------ */

    nullState.roomElements = {
        space,
        world,
        room,
        lights,
        blocks,
        entity,
        anomaly,
        errorLayer,
        errorText,
        errorSubtext,
        windows,
        roomInfo,
        eventMessage,
        status
    };

    updateRoomVisual();

    return true;
}


/* ==========================================================
   INIT
   ========================================================== */

export function initNullSpace() {

    if (nullState.initialized) {
        return;
    }

    const root = getRoot();

    if (!root) {
        console.error(
            "[NULL SPACE] Cannot initialize: #nullSpaceRoot missing."
        );

        return;
    }

    nullBuild();

    nullState.initialized = true;

    console.log("[NULL SPACE] Initialized.");
}


/* ==========================================================
   ENTER
   ========================================================== */

function enterNullSpace() {

    if (
        !nullState.initialized ||
        !document.querySelector("#nullSpaceRoot .nullSpace")
    ) {

        if (!nullBuild()) {
            return;
        }

        nullState.initialized = true;
    }

    const root = getRoot();

    if (!root) {
        return;
    }

    root.classList.add("active");

    nullState.active = true;

    updateRoomVisual();
    startAmbientEvents();
    startErrorSystem();

    console.log("[NULL SPACE] Entered.");
}


/* ==========================================================
   EXIT
   ========================================================== */

function exitNullSpace() {

    const root = getRoot();

    if (!root) {
        return;
    }

    root.classList.remove("active");

    nullState.active = false;

    stopAmbientEvents();
    stopErrorSystem();

    console.log("[NULL SPACE] Exited.");
}


/* ==========================================================
   ROOM CHANGE
   ========================================================== */

function nextNullRoom() {

    const roomTypes = Object.keys(NULL_ROOMS);

    nullState.roomIndex++;

    if (nullState.roomIndex >= roomTypes.length) {
        nullState.roomIndex = 0;
    }

    nullState.roomType = roomTypes[nullState.roomIndex];

    updateRoomVisual();

    /*
       Small chance of a room-change error.
    */

    if (Math.random() < 0.22) {

        setTimeout(() => {

            if (!nullState.active) {
                return;
            }

            showNullError({
                text: "ROOMTYPE MISMATCH",
                type: "system",
                duration: 1100
            });

        }, randomInt(400, 1000));
    }
}


/* ==========================================================
   ROOM VISUAL
   ========================================================== */

function updateRoomVisual() {

    const data = NULL_ROOMS[nullState.roomType];

    const elements = nullState.roomElements;

    if (!elements.room) {
        return;
    }

    elements.room.classList.remove(
        "room-large",
        "room-hallway",
        "room-console",
        "room-pillar"
    );

    elements.room.classList.add(
        `room-${nullState.roomType}`
    );

    if (elements.roomInfo) {

        elements.roomInfo.innerHTML = `
            <div>${data.name}</div>
            <span>${data.description}</span>
        `;
    }

    if (elements.status) {
        elements.status.textContent =
            nullState.active
                ? "CONNECTED"
                : "STANDBY";
    }

    updateRoomDetails();
}


/* ==========================================================
   ROOM DETAILS
   ========================================================== */

function updateRoomDetails() {

    const elements = nullState.roomElements;

    if (!elements.room) {
        return;
    }

    const lights =
        elements.room.querySelectorAll(".nullVoidLight");

    const blocks =
        elements.room.querySelectorAll(".nullVoidBlock");

    /*
       Reset.
    */

    lights.forEach(light => {
        light.style.opacity = "";
        light.style.display = "";
    });

    blocks.forEach(block => {
        block.style.display = "";
    });

    /*
       HALLWAY
    */

    if (nullState.roomType === "hallway") {

        lights.forEach((light, index) => {

            light.style.setProperty(
                "--light-x",
                `${20 + index * 16}%`
            );

            light.style.setProperty(
                "--light-y",
                `${18 + (index % 2) * 7}%`
            );
        });
    }

    /*
       CONSOLE
    */

    if (nullState.roomType === "console") {

        blocks.forEach((block, index) => {

            block.style.setProperty(
                "--block-x",
                `${20 + (index % 4) * 20}%`
            );

            block.style.setProperty(
                "--block-y",
                `${55 + Math.floor(index / 4) * 15}%`
            );
        });
    }

    /*
       PILLAR
    */

    if (nullState.roomType === "pillar") {

        blocks.forEach((block, index) => {

            block.style.setProperty(
                "--block-x",
                `${12 + (index % 4) * 25}%`
            );

            block.style.setProperty(
                "--block-y",
                `${45 + Math.floor(index / 4) * 22}%`
            );

            block.style.setProperty(
                "--block-scale",
                "1.6"
            );
        });
    }
}


/* ==========================================================
   AMBIENT EVENTS
   ========================================================== */

function startAmbientEvents() {

    stopAmbientEvents();

    const schedule = () => {

        if (!nullState.active) {
            return;
        }

        triggerAmbientEvent();

        nullState.eventTimer = setTimeout(
            schedule,
            randomInt(9000, 22000)
        );
    };

    nullState.eventTimer = setTimeout(
        schedule,
        randomInt(5000, 11000)
    );
}


function stopAmbientEvents() {

    if (nullState.eventTimer) {

        clearTimeout(nullState.eventTimer);

        nullState.eventTimer = null;
    }
}


/* ==========================================================
   AMBIENT EVENT
   ========================================================== */

function triggerAmbientEvent() {

    if (!nullState.active) {
        return;
    }

    const events = [
        "LIGHT INSTABILITY",
        "UNKNOWN MOVEMENT",
        "GEOMETRY SHIFT",
        "SIGNAL INTERRUPTION",
        "UNIDENTIFIED PRESENCE",
        "VOID ACTIVITY",
        "NOISE DETECTED"
    ];

    const message = pickRandom(events);

    const eventElement =
        nullState.roomElements.eventMessage;

    if (!eventElement) {
        return;
    }

    eventElement.textContent = message;

    eventElement.classList.remove("active");

    void eventElement.offsetWidth;

    eventElement.classList.add("active");

    setTimeout(() => {

        eventElement.classList.remove("active");

    }, randomInt(800, 1800));


    /*
       Occasionally affect lighting.
    */

    if (Math.random() < 0.35) {
        flickerLights();
    }


    /*
       Occasionally disturb a block.
    */

    if (Math.random() < 0.25) {
        disturbBlock();
    }
}


/* ==========================================================
   LIGHT FLICKER
   ========================================================== */

function flickerLights() {

    const lights =
        nullState.roomElements.lights;

    if (!lights) {
        return;
    }

    const lightElements =
        lights.querySelectorAll(".nullVoidLight");

    if (!lightElements.length) {
        return;
    }

    const target = pickRandom(
        Array.from(lightElements)
    );

    target.classList.add("disturbed");

    setTimeout(() => {

        target.classList.remove("disturbed");

    }, randomInt(500, 1800));
}


/* ==========================================================
   BLOCK DISTURBANCE
   ========================================================== */

function disturbBlock() {

    const blocks =
        nullState.roomElements.blocks;

    if (!blocks) {
        return;
    }

    const blockElements =
        blocks.querySelectorAll(".nullVoidBlock");

    if (!blockElements.length) {
        return;
    }

    const target =
        pickRandom(Array.from(blockElements));

    target.classList.add("disturbed");

    setTimeout(() => {

        target.classList.remove("disturbed");

    }, randomInt(900, 2200));
}


/* ==========================================================
   ERROR SYSTEM
   ========================================================== */

function startErrorSystem() {

    stopErrorSystem();

    scheduleNextError();
}


function stopErrorSystem() {

    if (nullState.errorTimer) {

        clearTimeout(nullState.errorTimer);

        nullState.errorTimer = null;
    }

    hideNullError();
}


/* ==========================================================
   ERROR SCHEDULER
   ========================================================== */

function scheduleNextError() {

    if (!nullState.active) {
        return;
    }

    /*
       Large gaps between errors.
       The silence is intentional.
    */

    const delay = randomInt(
        14000,
        42000
    );

    nullState.errorTimer = setTimeout(() => {

        if (!nullState.active) {
            return;
        }

        /*
           Most errors are normal.
           Rare events are intentionally rare.
        */

        if (Math.random() < 0.72) {

            showRandomNullError();

        } else if (Math.random() < 0.94) {

            showRandomNullError("corrupted");

        } else {

            showRandomNullError("rare");
        }

        scheduleNextError();

    }, delay);
}


/* ==========================================================
   PICK ERROR
   ========================================================== */

function getWeightedError(type = null) {

    let pool = NULL_ERRORS;

    if (type) {

        pool = NULL_ERRORS.filter(
            error => error.type === type
        );

        if (!pool.length) {
            pool = NULL_ERRORS;
        }
    }

    const totalWeight =
        pool.reduce(
            (sum, error) => sum + error.weight,
            0
        );

    let value =
        Math.random() * totalWeight;

    for (const error of pool) {

        value -= error.weight;

        if (value <= 0) {
            return error;
        }
    }

    return pool[pool.length - 1];
}


/* ==========================================================
   SHOW RANDOM ERROR
   ========================================================== */

function showRandomNullError(type = null) {

    if (!nullState.active) {
        return;
    }

    if (nullState.errorCooldown) {
        return;
    }

    const error =
        getWeightedError(type);

    showNullError(error);
}


/* ==========================================================
   SHOW ERROR
   ========================================================== */

function showNullError(error) {

    const elements =
        nullState.roomElements;

    if (!elements.errorLayer) {
        return;
    }

    nullState.currentError = error;
    nullState.errorCooldown = true;

    const layer = elements.errorLayer;
    const text = elements.errorText;
    const subtext = elements.errorSubtext;

    layer.classList.remove(
        "active",
        "error-normal",
        "error-system",
        "error-corrupted",
        "error-rare"
    );

    void layer.offsetWidth;

    layer.classList.add("active");
    layer.classList.add(`error-${error.type || "normal"}`);

    text.textContent = error.text;

    /*
       Secondary system information.
    */

    if (error.type === "system") {

        subtext.textContent =
            pickRandom([
                "UNEXPECTED RETURN VALUE",
                "OBJECT COULD NOT BE RESOLVED",
                "REFERENCE LOST",
                "INVALID ENTITY STATE",
                "PROCESS INTERRUPTED"
            ]);

    } else if (error.type === "corrupted") {

        subtext.textContent =
            pickRandom([
                "READ FAILURE",
                "MEMORY CORRUPTED",
                "DATA INCOMPLETE",
                "REFERENCE DAMAGED"
            ]);

    } else if (error.type === "rare") {

        subtext.textContent = "";

    } else {

        subtext.textContent = "";
    }

    /*
       Rare errors disturb the environment.
    */

    if (error.type === "rare") {

        triggerRareErrorEffect();
    }

    setTimeout(() => {

        hideNullError();

    }, error.duration || 900);

    /*
       Prevent immediate repeat.
    */

    setTimeout(() => {

        nullState.errorCooldown = false;

    }, 2500);
}


/* ==========================================================
   HIDE ERROR
   ========================================================== */

function hideNullError() {

    const layer =
        nullState.roomElements.errorLayer;

    if (!layer) {
        return;
    }

    layer.classList.remove("active");

    nullState.currentError = null;
}


/* ==========================================================
   RARE ERROR EFFECT
   ========================================================== */

function triggerRareErrorEffect() {

    const anomaly =
        nullState.roomElements.anomaly;

    if (!anomaly) {
        return;
    }

    anomaly.classList.add("rareError");

    setTimeout(() => {

        anomaly.classList.remove("rareError");

    }, 900);


    /*
       Very small chance of a light disturbance.
    */

    if (Math.random() < 0.65) {
        flickerLights();
    }


    /*
       Very small chance of the entity becoming visible.
    */

    const entity =
        nullState.roomElements.entity;

    if (
        entity &&
        Math.random() < 0.35
    ) {

        entity.classList.add("noticed");

        setTimeout(() => {

            entity.classList.remove("noticed");

        }, randomInt(700, 1600));
    }
}


/* ==========================================================
   OPEN WINDOW
   ========================================================== */

function openNullWindow(type = "SYSTEM") {

    const windows =
        nullState.roomElements.windows;

    if (!windows) {
        return null;
    }

    const win =
        document.createElement("div");

    win.className = "nullWindow";

    win.innerHTML = `
        <div class="nullWindowHeader">
            <span>${type}</span>
            <button type="button">×</button>
        </div>

        <div class="nullWindowBody">
            <div class="nullWindowCursor">_</div>
        </div>
    `;

    const close =
        win.querySelector("button");

    close.addEventListener(
        "click",
        () => win.remove()
    );

    windows.appendChild(win);

    return win;
}


/* ==========================================================
   PUBLIC API
   ========================================================== */

const NullSpace = {

    init: initNullSpace,

    enter: enterNullSpace,

    exit: exitNullSpace,

    nextRoom: nextNullRoom,

    openWindow: openNullWindow,

    showError(error) {
        showNullError(error);
    },

    randomError(type = null) {
        showRandomNullError(type);
    },

    getState() {

        return {
            initialized: nullState.initialized,
            active: nullState.active,
            roomType: nullState.roomType,
            roomIndex: nullState.roomIndex,
            currentError: nullState.currentError
        };
    }
};


window.NullSpace = NullSpace;

window.initNullSpace =
    initNullSpace;

window.enterNullSpace =
    enterNullSpace;

window.exitNullSpace =
    exitNullSpace;

window.openNullWindow =
    openNullWindow;


/* ==========================================================
   AUTO INIT
   ========================================================== */

console.log("[NULL SPACE] Module loaded.");
