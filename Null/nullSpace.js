/* ==========================================================
   NULL SPACE
   New World System
   Forest + Red Fog + Entity + Errors + Events
   ========================================================== */


/* ==========================================================
   AREA DATABASE
   ========================================================== */

const NULL_ROOMS = {

    large: {
        name: "OPEN VOID",
        description: "UNDEFINED OPEN SPACE"
    },

    hallway: {
        name: "TREE PASSAGE",
        description: "GENERATED FOREST CORRIDOR"
    },

    console: {
        name: "DEAD AREA",
        description: "NO STRUCTURE DETECTED"
    },

    pillar: {
        name: "DISTANT STRUCTURE",
        description: "IRREGULAR VOID FORMATION"
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

        space: null,
        world: null,
        background: null,
        environment: null,

        distantTrees: null,
        trees: null,
        ground: null,

        fogBack: null,
        fogMiddle: null,
        fogFront: null,

        entity: null,
        entityHead: null,
        entityBody: null,

        anomaly: null,

        errorLayer: null,
        errorText: null,
        errorSubtext: null,

        windows: null,

        roomInfo: null,
        eventMessage: null,
        status: null,

        navigation: null

    }

};


/* ==========================================================
   ERROR DATABASE
   ========================================================== */

const NULL_ERRORS = [

    /* ------------------------------------------------------
       NORMAL
       ------------------------------------------------------ */

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


    /* ------------------------------------------------------
       SYSTEM
       ------------------------------------------------------ */

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


    /* ------------------------------------------------------
       CORRUPTED
       ------------------------------------------------------ */

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


    /* ------------------------------------------------------
       RARE
       ------------------------------------------------------ */

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

    return Math.floor(
        random(min, max + 1)
    );

}


function pickRandom(array) {

    if (!array || !array.length) {
        return null;
    }

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];

}


/* ==========================================================
   ROOT
   ========================================================== */

function getRoot() {

    return document.getElementById(
        "nullSpaceRoot"
    );

}


/* ==========================================================
   TREE GENERATOR
   ========================================================== */

function createNullTree(
    x,
    y,
    scale,
    distant = false
) {

    const tree =
        document.createElement("div");


    tree.className =
        distant
            ? "nullTree nullTreeDistant"
            : "nullTree";


    tree.style.setProperty(
        "--tree-x",
        `${x}%`
    );


    tree.style.setProperty(
        "--tree-y",
        `${y}%`
    );


    tree.style.setProperty(
        "--tree-scale",
        scale.toFixed(2)
    );


    tree.style.setProperty(
        "--tree-rotation",
        `${randomInt(-5, 5)}deg`
    );


    tree.style.setProperty(
        "--tree-height",
        `${randomInt(180, 340)}px`
    );


    /* ------------------------------------------------------
       TRUNK
       ------------------------------------------------------ */

    const trunk =
        document.createElement("div");


    trunk.className =
        "nullTreeTrunk";


    /* ------------------------------------------------------
       BRANCHES
       ------------------------------------------------------ */

    const branchCount =
        distant
            ? randomInt(3, 5)
            : randomInt(5, 9);


    for (
        let i = 0;
        i < branchCount;
        i++
    ) {

        const branch =
            document.createElement("div");


        branch.className =
            "nullTreeBranch";


        branch.style.setProperty(
            "--branch-y",
            `${12 + i * random(9, 13)}%`
        );


        branch.style.setProperty(
            "--branch-angle",
            `${randomInt(12, 50)}deg`
        );


        branch.style.setProperty(
            "--branch-length",
            distant
                ? `${randomInt(35, 75)}px`
                : `${randomInt(55, 125)}px`
        );


        branch.style.setProperty(
            "--branch-width",
            distant
                ? `${randomInt(2, 5)}px`
                : `${randomInt(3, 8)}px`
        );


        if (i % 2 === 0) {

            branch.classList.add(
                "branch-left"
            );

        } else {

            branch.classList.add(
                "branch-right"
            );

        }


        trunk.appendChild(
            branch
        );

    }


    tree.appendChild(
        trunk
    );


    return tree;

}


/* ==========================================================
   TREE VARIATION
   ========================================================== */

function regenerateForest() {

    const elements =
        nullState.roomElements;


    if (
        !elements.distantTrees ||
        !elements.trees
    ) {
        return;
    }


    elements.distantTrees.innerHTML =
        "";


    elements.trees.innerHTML =
        "";


    /* ------------------------------------------------------
       DISTANT FOREST
       ------------------------------------------------------ */

    for (
        let i = 0;
        i < 24;
        i++
    ) {

        const tree =
            createNullTree(

                random(-10, 110),

                random(16, 58),

                random(0.25, 0.72),

                true

            );


        elements.distantTrees.appendChild(
            tree
        );

    }


    /* ------------------------------------------------------
       MAIN FOREST
       ------------------------------------------------------ */

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const tree =
            createNullTree(

                random(-8, 108),

                random(32, 91),

                random(0.60, 1.55),

                false

            );


        elements.trees.appendChild(
            tree
        );

    }

}


/* ==========================================================
   FOREST ENVIRONMENT
   ========================================================== */

function buildNullEnvironment(world) {

    const environment =
        document.createElement("div");


    environment.className =
        "nullEnvironment";


    /* ------------------------------------------------------
       DISTANT TREES
       ------------------------------------------------------ */

    const distantTrees =
        document.createElement("div");


    distantTrees.className =
        "nullDistantTrees";


    /* ------------------------------------------------------
       GROUND
       ------------------------------------------------------ */

    const ground =
        document.createElement("div");


    ground.className =
        "nullForestGround";


    /* ------------------------------------------------------
       MAIN TREES
       ------------------------------------------------------ */

    const trees =
        document.createElement("div");


    trees.className =
        "nullTrees";


    /* ------------------------------------------------------
       RED FOG
       ------------------------------------------------------ */

    const fogBack =
        document.createElement("div");


    fogBack.className =
        "nullRedFog nullRedFogBack";


    const fogMiddle =
        document.createElement("div");


    fogMiddle.className =
        "nullRedFog nullRedFogMiddle";


    const fogFront =
        document.createElement("div");


    fogFront.className =
        "nullRedFog nullRedFogFront";


    /* ------------------------------------------------------
       ASSEMBLE ENVIRONMENT
       ------------------------------------------------------ */

    environment.appendChild(
        distantTrees
    );


    environment.appendChild(
        ground
    );


    environment.appendChild(
        trees
    );


    environment.appendChild(
        fogBack
    );


    environment.appendChild(
        fogMiddle
    );


    environment.appendChild(
        fogFront
    );


    world.appendChild(
        environment
    );


    nullState.roomElements.environment =
        environment;


    nullState.roomElements.distantTrees =
        distantTrees;


    nullState.roomElements.ground =
        ground;


    nullState.roomElements.trees =
        trees;


    nullState.roomElements.fogBack =
        fogBack;


    nullState.roomElements.fogMiddle =
        fogMiddle;


    nullState.roomElements.fogFront =
        fogFront;


    regenerateForest();


    return environment;

}


/* ==========================================================
   ENTITY
   ========================================================== */

function buildEntity() {

    const entity =
        document.createElement("div");


    entity.className =
        "nullEntity";


    const entityHead =
        document.createElement("div");


    entityHead.className =
        "nullEntityHead";


    entityHead.id =
        "nullEntityHead";


    const entityBody =
        document.createElement("div");


    entityBody.className =
        "nullEntityBody";


    entity.appendChild(
        entityHead
    );


    entity.appendChild(
        entityBody
    );


    nullState.roomElements.entity =
        entity;


    nullState.roomElements.entityHead =
        entityHead;


    nullState.roomElements.entityBody =
        entityBody;


    return entity;

}


/* ==========================================================
   ANOMALY
   ========================================================== */

function buildAnomaly() {

    const anomaly =
        document.createElement("div");


    anomaly.className =
        "nullAnomalyLayer";


    nullState.roomElements.anomaly =
        anomaly;


    return anomaly;

}


/* ==========================================================
   BUILD
   ========================================================== */

function nullBuild() {

    const root =
        getRoot();


    if (!root) {

        console.error(
            "[NULL SPACE] #nullSpaceRoot not found."
        );

        return false;

    }


    /* ------------------------------------------------------
       CLEAN PREVIOUS BUILD
       ------------------------------------------------------ */

    root.innerHTML =
        "";


    /* ------------------------------------------------------
       RESET REFERENCES
       ------------------------------------------------------ */

    nullState.roomElements = {

        space: null,
        world: null,
        background: null,
        environment: null,

        distantTrees: null,
        trees: null,
        ground: null,

        fogBack: null,
        fogMiddle: null,
        fogFront: null,

        entity: null,
        entityHead: null,
        entityBody: null,

        anomaly: null,

        errorLayer: null,
        errorText: null,
        errorSubtext: null,

        windows: null,

        roomInfo: null,
        eventMessage: null,
        status: null,

        navigation: null

    };


    /* ======================================================
       SPACE
       ====================================================== */

    const space =
        document.createElement("div");


    space.className =
        "nullSpace";


    /* ======================================================
       WORLD
       ====================================================== */

    const world =
        document.createElement("div");


    world.className =
        "nullWorld";


    /* ======================================================
       BACKGROUND
       ====================================================== */

    const background =
        document.createElement("div");


    background.className =
        "nullWorldBackground";


    world.appendChild(
        background
    );


    /* ======================================================
       FOREST
       ====================================================== */

    buildNullEnvironment(
        world
    );


    /* ======================================================
       ENTITY
       ====================================================== */

    const entity =
        buildEntity();


    world.appendChild(
        entity
    );


    /* ======================================================
       ANOMALY
       ====================================================== */

    const anomaly =
        buildAnomaly();


    world.appendChild(
        anomaly
    );


    /* ======================================================
       INTERFACE
       ====================================================== */

    const interfaceLayer =
        document.createElement("div");


    interfaceLayer.className =
        "nullInterface";


    /* ------------------------------------------------------
       TOP BAR
       ------------------------------------------------------ */

    const topBar =
        document.createElement("div");


    topBar.className =
        "nullTopBar";


    const title =
        document.createElement("div");


    title.className =
        "nullTitle";


    title.textContent =
        "NULL SPACE";


    const status =
        document.createElement("div");


    status.className =
        "nullStatus";


    status.textContent =
        "STANDBY";


    topBar.appendChild(
        title
    );


    topBar.appendChild(
        status
    );


    /* ------------------------------------------------------
       ROOM / AREA INFO
       ------------------------------------------------------ */

    const roomInfo =
        document.createElement("div");


    roomInfo.className =
        "nullRoomInfo";


    /* ------------------------------------------------------
       EVENT MESSAGE
       ------------------------------------------------------ */

    const eventMessage =
        document.createElement("div");


    eventMessage.className =
        "nullEventMessage";


    /* ------------------------------------------------------
       NAVIGATION
       ------------------------------------------------------ */

    const navigation =
        document.createElement("div");


    navigation.className =
        "nullNavigation";


    const enterButton =
        document.createElement("button");


    enterButton.type =
        "button";


    enterButton.textContent =
        "ENTER";


    const nextButton =
        document.createElement("button");


    nextButton.type =
        "button";


    nextButton.textContent =
        "NEXT AREA";


    enterButton.addEventListener(
        "click",
        enterNullSpace
    );


    nextButton.addEventListener(
        "click",
        nextNullRoom
    );


    navigation.appendChild(
        enterButton
    );


    navigation.appendChild(
        nextButton
    );


    interfaceLayer.appendChild(
        topBar
    );


    interfaceLayer.appendChild(
        roomInfo
    );


    interfaceLayer.appendChild(
        eventMessage
    );


    interfaceLayer.appendChild(
        navigation
    );


    /* ======================================================
       ERROR LAYER
       ====================================================== */

    const errorLayer =
        document.createElement("div");


    errorLayer.className =
        "nullErrorLayer";


    errorLayer.setAttribute(
        "aria-hidden",
        "true"
    );


    const errorGlitch =
        document.createElement("div");


    errorGlitch.className =
        "nullErrorGlitch";


    const errorText =
        document.createElement("div");


    errorText.className =
        "nullErrorText";


    const errorSubtext =
        document.createElement("div");


    errorSubtext.className =
        "nullErrorSubtext";


    errorLayer.appendChild(
        errorGlitch
    );


    errorLayer.appendChild(
        errorText
    );


    errorLayer.appendChild(
        errorSubtext
    );


    /* ======================================================
       WINDOWS
       ====================================================== */

    const windows =
        document.createElement("div");


    windows.className =
        "nullWindows";


    /* ======================================================
       FINAL ASSEMBLY
       ====================================================== */

    space.appendChild(
        world
    );


    space.appendChild(
        errorLayer
    );


    space.appendChild(
        interfaceLayer
    );


    space.appendChild(
        windows
    );


    root.appendChild(
        space
    );


    /* ======================================================
       STORE REFERENCES
       ====================================================== */

    nullState.roomElements.space =
        space;


    nullState.roomElements.world =
        world;


    nullState.roomElements.background =
        background;


    nullState.roomElements.errorLayer =
        errorLayer;


    nullState.roomElements.errorText =
        errorText;


    nullState.roomElements.errorSubtext =
        errorSubtext;


    nullState.roomElements.windows =
        windows;


    nullState.roomElements.roomInfo =
        roomInfo;


    nullState.roomElements.eventMessage =
        eventMessage;


    nullState.roomElements.status =
        status;


    nullState.roomElements.navigation =
        navigation;


    updateRoomVisual();


    return true;

}


/* ==========================================================
   INIT
   ========================================================== */

export function initNullSpace() {

    if (
        nullState.initialized
    ) {

        return;

    }


    const root =
        getRoot();


    if (!root) {

        console.error(
            "[NULL SPACE] Cannot initialize: #nullSpaceRoot missing."
        );

        return;

    }


    if (!nullBuild()) {

        return;

    }


    nullState.initialized =
        true;


    console.log(
        "[NULL SPACE] Initialized."
    );

}


/* ==========================================================
   ENTER
   ========================================================== */

function enterNullSpace() {

    if (
        !nullState.initialized
    ) {

        initNullSpace();

    }


    if (
        !document.querySelector(
            "#nullSpaceRoot .nullSpace"
        )
    ) {

        if (!nullBuild()) {

            return;

        }

        nullState.initialized =
            true;

    }


    const root =
        getRoot();


    if (!root) {

        return;

    }


    root.classList.remove(
        "hidden"
    );


    root.classList.add(
        "active"
    );


    nullState.active =
        true;


    updateRoomVisual();


    startAmbientEvents();


    startErrorSystem();


    console.log(
        "[NULL SPACE] Entered."
    );

}


/* ==========================================================
   NEXT AREA
   ========================================================== */

function nextNullRoom() {

    if (
        !nullState.initialized
    ) {

        return;

    }


    const roomTypes =
        Object.keys(
            NULL_ROOMS
        );


    nullState.roomIndex++;


    if (
        nullState.roomIndex >=
        roomTypes.length
    ) {

        nullState.roomIndex =
            0;

    }


    nullState.roomType =
        roomTypes[
            nullState.roomIndex
        ];


    /* ------------------------------------------------------
       REGENERATE WORLD
       ------------------------------------------------------ */

    regenerateForest();


    updateRoomVisual();


    /* ------------------------------------------------------
       AREA MISMATCH
       ------------------------------------------------------ */

    if (
        Math.random() < 0.22 &&
        nullState.active
    ) {

        setTimeout(() => {

            if (
                !nullState.active
            ) {

                return;

            }


            showNullError({

                text:
                    "AREA TYPE MISMATCH",

                type:
                    "system",

                duration:
                    1100

            });

        }, randomInt(400, 1000));

    }

}


/* ==========================================================
   ROOM / AREA VISUAL
   ========================================================== */

function updateRoomVisual() {

    const data =
        NULL_ROOMS[
            nullState.roomType
        ];


    const elements =
        nullState.roomElements;


    if (
        elements.space
    ) {

        elements.space.classList.remove(

            "room-large",
            "room-hallway",
            "room-console",
            "room-pillar"

        );


        elements.space.classList.add(

            `room-${nullState.roomType}`

        );

    }


    if (
        elements.roomInfo
    ) {

        elements.roomInfo.innerHTML = `

            <div>
                ${data.name}
            </div>

            <span>
                ${data.description}
            </span>

        `;

    }


    if (
        elements.status
    ) {

        elements.status.textContent =
            nullState.active
                ? "CONNECTED"
                : "STANDBY";

    }


    updateWorldVariation();

}


/* ==========================================================
   WORLD VARIATION
   ========================================================== */

function updateWorldVariation() {

    const elements =
        nullState.roomElements;


    if (
        !elements.space
    ) {

        return;

    }


    elements.space.classList.remove(

        "nullAreaLarge",
        "nullAreaHallway",
        "nullAreaConsole",
        "nullAreaPillar"

    );


    elements.space.classList.add(

        `nullArea${

            nullState.roomType
                .charAt(0)
                .toUpperCase() +

            nullState.roomType
                .slice(1)

        }`

    );


    /* ------------------------------------------------------
       SPECIAL TREE DISTRIBUTION
       ------------------------------------------------------ */

    if (
        elements.trees
    ) {

        elements.trees.style.setProperty(

            "--tree-density",

            nullState.roomType === "hallway"
                ? "1.12"
                : nullState.roomType === "console"
                    ? "0.72"
                    : nullState.roomType === "pillar"
                        ? "0.88"
                        : "1"

        );

    }

}


/* ==========================================================
   AMBIENT EVENTS
   ========================================================== */

function startAmbientEvents() {

    stopAmbientEvents();


    const schedule = () => {

        if (
            !nullState.active
        ) {

            return;

        }


        triggerAmbientEvent();


        nullState.eventTimer =
            setTimeout(

                schedule,

                randomInt(
                    9000,
                    22000
                )

            );

    };


    nullState.eventTimer =
        setTimeout(

            schedule,

            randomInt(
                5000,
                11000
            )

        );

}


/* ==========================================================
   STOP AMBIENT EVENTS
   ========================================================== */

function stopAmbientEvents() {

    if (
        nullState.eventTimer
    ) {

        clearTimeout(
            nullState.eventTimer
        );


        nullState.eventTimer =
            null;

    }

}


/* ==========================================================
   AMBIENT EVENT
   ========================================================== */

function triggerAmbientEvent() {

    if (
        !nullState.active
    ) {

        return;

    }


    const events = [

        "LIGHT INSTABILITY",
        "UNKNOWN MOVEMENT",
        "GEOMETRY SHIFT",
        "SIGNAL INTERRUPTION",
        "UNIDENTIFIED PRESENCE",
        "VOID ACTIVITY",
        "NOISE DETECTED",
        "DISTANT MOVEMENT",
        "FOREST RESPONSE",
        "POSITION DRIFT",
        "VISUAL DESYNC"

    ];


    const message =
        pickRandom(events);


    const eventElement =
        nullState.roomElements.eventMessage;


    if (!eventElement) {

        return;

    }


    eventElement.textContent =
        message;


    eventElement.classList.remove(
        "active"
    );


    void eventElement.offsetWidth;


    eventElement.classList.add(
        "active"
    );


    setTimeout(() => {

        eventElement.classList.remove(
            "active"
        );

    }, randomInt(800, 1800));


    /* ------------------------------------------------------
       FOREST MOVEMENT
       ------------------------------------------------------ */

    if (
        Math.random() < 0.42
    ) {

        disturbForest();

    }


    /* ------------------------------------------------------
       ENTITY
       ------------------------------------------------------ */

    if (
        Math.random() < 0.08
    ) {

        disturbEntity();

    }

}


/* ==========================================================
   FOREST DISTURBANCE
   ========================================================== */

function disturbForest() {

    const trees =
        nullState.roomElements.trees;


    if (!trees) {

        return;

    }


    const treeElements =
        trees.querySelectorAll(
            ".nullTree"
        );


    if (
        !treeElements.length
    ) {

        return;

    }


    const targets =
        Array.from(
            treeElements
        );


    const target =
        pickRandom(
            targets
        );


    if (!target) {

        return;

    }


    target.classList.add(
        "disturbed"
    );


    setTimeout(() => {

        target.classList.remove(
            "disturbed"
        );

    }, randomInt(700, 1800));

}


/* ==========================================================
   ENTITY DISTURBANCE
   ========================================================== */

function disturbEntity() {

    const entity =
        nullState.roomElements.entity;


    if (!entity) {

        return;

    }


    entity.classList.add(
        "noticed"
    );


    setTimeout(() => {

        entity.classList.remove(
            "noticed"
        );

    }, randomInt(500, 1500));

}


/* ==========================================================
   ERROR SYSTEM
   ========================================================== */

function startErrorSystem() {

    stopErrorSystem();


    scheduleNextError();

}


/* ==========================================================
   STOP ERROR SYSTEM
   ========================================================== */

function stopErrorSystem() {

    if (
        nullState.errorTimer
    ) {

        clearTimeout(
            nullState.errorTimer
        );


        nullState.errorTimer =
            null;

    }


    hideNullError();

}


/* ==========================================================
   ERROR SCHEDULER
   ========================================================== */

function scheduleNextError() {

    if (
        !nullState.active
    ) {

        return;

    }


    const delay =
        randomInt(
            14000,
            42000
        );


    nullState.errorTimer =
        setTimeout(() => {

            if (
                !nullState.active
            ) {

                return;

            }


            const roll =
                Math.random();


            if (
                roll < 0.72
            ) {

                showRandomNullError();

            }

            else if (
                roll < 0.94
            ) {

                showRandomNullError(
                    "corrupted"
                );

            }

            else {

                showRandomNullError(
                    "rare"
                );

            }


            scheduleNextError();


        }, delay);

}


/* ==========================================================
   WEIGHTED ERROR
   ========================================================== */

function getWeightedError(
    type = null
) {

    let pool =
        NULL_ERRORS;


    if (type) {

        pool =
            NULL_ERRORS.filter(
                error =>
                    error.type === type
            );


        if (
            !pool.length
        ) {

            pool =
                NULL_ERRORS;

        }

    }


    const totalWeight =
        pool.reduce(

            (sum, error) =>
                sum + error.weight,

            0

        );


    let value =
        Math.random() *
        totalWeight;


    for (
        const error of pool
    ) {

        value -=
            error.weight;


        if (
            value <= 0
        ) {

            return error;

        }

    }


    return pool[
        pool.length - 1
    ];

}


/* ==========================================================
   RANDOM ERROR
   ========================================================== */

function showRandomNullError(
    type = null
) {

    if (
        !nullState.active
    ) {

        return;

    }


    if (
        nullState.errorCooldown
    ) {

        return;

    }


    const error =
        getWeightedError(
            type
        );


    showNullError(
        error
    );

}


/* ==========================================================
   SHOW ERROR
   ========================================================== */

function showNullError(error) {

    if (!error) {

        return;

    }


    const elements =
        nullState.roomElements;


    if (
        !elements.errorLayer
    ) {

        return;

    }


    nullState.currentError =
        error;


    nullState.errorCooldown =
        true;


    const layer =
        elements.errorLayer;


    const text =
        elements.errorText;


    const subtext =
        elements.errorSubtext;


    layer.classList.remove(

        "active",
        "error-normal",
        "error-system",
        "error-corrupted",
        "error-rare"

    );


    void layer.offsetWidth;


    layer.classList.add(
        "active"
    );


    layer.classList.add(
        `error-${error.type || "normal"}`
    );


    layer.setAttribute(
        "aria-hidden",
        "false"
    );


    text.textContent =
        error.text;


    /* ------------------------------------------------------
       SYSTEM
       ------------------------------------------------------ */

    if (
        error.type === "system"
    ) {

        subtext.textContent =
            pickRandom([

                "UNEXPECTED RETURN VALUE",
                "OBJECT COULD NOT BE RESOLVED",
                "REFERENCE LOST",
                "INVALID ENTITY STATE",
                "PROCESS INTERRUPTED",
                "WORLD STATE UNDEFINED",
                "LOCATION REFERENCE LOST"

            ]);

    }


    /* ------------------------------------------------------
       CORRUPTED
       ------------------------------------------------------ */

    else if (
        error.type === "corrupted"
    ) {

        subtext.textContent =
            pickRandom([

                "READ FAILURE",
                "MEMORY CORRUPTED",
                "DATA INCOMPLETE",
                "REFERENCE DAMAGED",
                "VISUAL DATA LOST",
                "WORLD INDEX CORRUPTED"

            ]);

    }


    /* ------------------------------------------------------
       NORMAL / RARE
       ------------------------------------------------------ */

    else {

        subtext.textContent =
            "";

    }


    /* ------------------------------------------------------
       RARE
       ------------------------------------------------------ */

    if (
        error.type === "rare"
    ) {

        triggerRareErrorEffect();

    }


    setTimeout(() => {

        hideNullError();

    }, error.duration || 900);


    /* ------------------------------------------------------
       COOLDOWN
       ------------------------------------------------------ */

    setTimeout(() => {

        nullState.errorCooldown =
            false;

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


    layer.classList.remove(
        "active"
    );


    layer.setAttribute(
        "aria-hidden",
        "true"
    );


    nullState.currentError =
        null;

}


/* ==========================================================
   RARE ERROR EFFECT
   ========================================================== */

function triggerRareErrorEffect() {

    const anomaly =
        nullState.roomElements.anomaly;


    if (anomaly) {

        anomaly.classList.add(
            "rareError"
        );


        setTimeout(() => {

            anomaly.classList.remove(
                "rareError"
            );

        }, 900);

    }


    /* ------------------------------------------------------
       FOREST DISTURBANCE
       ------------------------------------------------------ */

    if (
        Math.random() < 0.65
    ) {

        disturbForest();

    }


    /* ------------------------------------------------------
       ENTITY
       ------------------------------------------------------ */

    const entity =
        nullState.roomElements.entity;


    if (
        entity &&
        Math.random() < 0.45
    ) {

        entity.classList.add(
            "noticed"
        );


        setTimeout(() => {

            entity.classList.remove(
                "noticed"
            );

        }, randomInt(700, 1600));

    }

}


/* ==========================================================
   OPEN NULL WINDOW
   ========================================================== */

function openNullWindow(
    type = "SYSTEM"
) {

    const windows =
        nullState.roomElements.windows;


    if (!windows) {

        return null;

    }


    const win =
        document.createElement("div");


    win.className =
        "nullWindow";


    win.innerHTML = `

        <div class="nullWindowHeader">

            <span>
                ${type}
            </span>

            <button
                type="button"
                aria-label="Close"
            >
                ×
            </button>

        </div>

        <div class="nullWindowBody">

            <div class="nullWindowCursor">
                _
            </div>

        </div>

    `;


    const close =
        win.querySelector(
            "button"
        );


    if (close) {

        close.addEventListener(
            "click",
            () => win.remove()
        );

    }


    windows.appendChild(
        win
    );


    return win;

}


/* ==========================================================
   PUBLIC API
   ========================================================== */

const NullSpace = {

    init:
        initNullSpace,


    enter:
        enterNullSpace,


    /*
       EXIT INTENTIONALLY REMOVED.
       NULL SPACE IS NOT DESIGNED TO PROVIDE
       A USER EXIT MECHANISM.
    */


    nextRoom:
        nextNullRoom,


    openWindow:
        openNullWindow,


    showError(error) {

        showNullError(
            error
        );

    },


    randomError(
        type = null
    ) {

        showRandomNullError(
            type
        );

    },


    getState() {

        return {

            initialized:
                nullState.initialized,

            active:
                nullState.active,

            roomType:
                nullState.roomType,

            roomIndex:
                nullState.roomIndex,

            currentError:
                nullState.currentError

        };

    }

};


/* ==========================================================
   GLOBAL API
   ========================================================== */

window.NullSpace =
    NullSpace;


window.initNullSpace =
    initNullSpace;


window.enterNullSpace =
    enterNullSpace;


window.openNullWindow =
    openNullWindow;


/* ==========================================================
   AUTO LOAD
   ========================================================== */

console.log(
    "[NULL SPACE] New world system loaded."
);
