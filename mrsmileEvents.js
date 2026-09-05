/* ==========================================================
   MR.SMILE — OMEGA FIRST CONTACT EVENTS
   ----------------------------------------------------------
   MR.SMILE не "ломает экран".
   Он получает контроль над OMEGA.

   FIRST CONTACT:

   NORMAL OMEGA
        ↓
   UNAUTHORIZED AUTHORIZATION
        ↓
   MR_SMILE ACCOUNT
        ↓
   ACCESS GRANTED
        ↓
   OMEGA BEGINS LOSING CONTROL
        ↓
   INTERFACE COLLAPSE
        ↓
   BLACK / DIAGNOSTICS
        ↓
   EYES
        ↓
   FACE
        ↓
   PLAYER INTERACTION
        ↓
   CURSOR OBSERVED
        ↓
   CURSOR CONTROL
        ↓
   OMEGA WINDOW
        ↓
   SUBTLE DISTORTION
        ↓
   MR.SMILE DISAPPEARS
        ↓
   INPUT LOST
        ↓
   OMEGA RESTORED
========================================================== */

import {
    typeSystemMessage,
    playFirstContactMessage
} from "./mrsmileChat.js";

import {
    getTrust,
    loadTrust
} from "./mrsmileTrust.js";

import {
    getMemory
} from "./mrsmileMemory.js";

import {
    triggerMrSmileManifestation,
    showMrSmileFirstContactFace
} from "./mrsmileAppearance.js";

import {
    revealMrSmileChat
} from "./chats.js";

import {
    initMrSmileProgress,
    evaluateProgress
} from "./mrsmileProgress.js";

import {
    on,
    once,
    trigger
} from "./eventManager.js";


/* ==========================================================
   STATE
========================================================== */

let running = false;
let firstContactRunning = false;

let ambientEventRunning = false;
let lastAmbientEventTime = 0;

const AMBIENT_COOLDOWN = 45000;

let sys00HandshakeArmed = false;
let sys00HandshakeTriggered = false;

let integrityEventRunning = false;
let falseRecoveryRunning = false;

let firstContactTimers = [];

let originalCursor = "";

let controlledCursor = null;
let cursorMouseHandler = null;


/* ==========================================================
   TIMING
========================================================== */

const TIMING = {

    authAppear: 900,
    authAccount: 900,
    authPassword: 700,
    authProcess: 1000,
    authGranted: 900,

    collapseStep: 550,

    darkness: 1000,
    diagnostics: 2100,

    eyesAppear: 1700,
    faceAppear: 2200,

    playerInteraction: 2600,
    cursorTransfer: 1800,

    intrusionWindow: 1600,
    distortion: 1200,

    inputLost: 1000,
    recovery: 2500
};


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileEvents() {

    if (running) return;

    running = true;

    try {
        loadTrust();
    } catch (error) {

        console.warn(
            "[MR.SMILE] Trust initialization failed:",
            error
        );
    }


    try {

        initMrSmileProgress();

    } catch (error) {

        console.warn(
            "[MR.SMILE] Progress initialization failed:",
            error
        );
    }


    /*
     * Background behaviour.
     */

    nightLoop();
    glitchLoop();
    idleLoop();
    observationLoop();
   
    initAmbientEvents();

   
    function initAmbientEvents() {

    on("mrsmile:nightEvent", () => {
        runAmbientEvent(ambientNightEvent);
    });

    on("mrsmile:glitchEvent", () => {
        runAmbientEvent(ambientGlitchEvent);
    });

    on("mrsmile:idleEvent", () => {
        runAmbientEvent(ambientIdleEvent);
    });

    on("mrsmile:observationEvent", () => {
        runAmbientEvent(ambientObservationEvent);
    });

}
   
async function ambientIdleEvent() {
    await sleep(randomBetween(400, 1200));

    await systemMessage("OMEGA: background process check...");

    await sleep(900);

    await systemMessage("OMEGA: no irregularities detected.");
}

async function ambientObservationEvent() {

    const trace = document.createElement("div");

    trace.id = "mrSmileAmbientObservation";
    trace.className = "mrSmileAmbientObservation";
    trace.textContent = "OBSERVED";

    document.body.appendChild(trace);

    requestAnimationFrame(() => {
        trace.classList.add("visible");
    });

    await sleep(1200);

    trace.classList.add("fade");

    await sleep(900);

    trace.remove();
}

async function ambientNightEvent() {

    const chance = Math.random();

    if (chance < 0.5) {

        await systemMessage("CLOCK SYNC: DELAYED");

        await sleep(700);

        await systemMessage("CLOCK SYNC: RESTORED");

        return;
    }

    await systemMessage("BACKGROUND MONITOR: ACTIVE");

    await sleep(1000);

    await systemMessage("BACKGROUND MONITOR: IDLE");
}
    /* ------------------------------------------------------
       FIRST CONTACT
    ------------------------------------------------------ */

    once(
        "mrsmile:firstContact",
        () => {
            triggerFirstContact();
        }
    );


    /* ------------------------------------------------------
       SYS_00
    ------------------------------------------------------ */

    on(
        "mrsmile:sys00Accepted",
        () => {
            handleSys00Accepted();
        }
    );


    /* ------------------------------------------------------
       HANDSHAKE
    ------------------------------------------------------ */

    on(
        "mrsmile:handshakeAccepted",
        () => {
            handleHandshakeAccepted();
        }
    );


    console.log(
        "[MR.SMILE] Event system initialized."
    );
}


/* ==========================================================
   SYS_00
========================================================== */

function handleSys00Accepted() {

    if (sys00HandshakeArmed) return;
    if (sys00HandshakeTriggered) return;

    sys00HandshakeArmed = true;

    scheduleFirstContactTimer(
        () => {

            if (
                localStorage.getItem(
                    "mrsmile_handshake"
                ) === "1"
            ) {
                return;
            }

            triggerSys00Handshake();

        },
        1500
    );
}


/* ==========================================================
   SYS_00 HANDSHAKE
========================================================== */

async function triggerSys00Handshake() {

    if (sys00HandshakeTriggered) return;

    sys00HandshakeTriggered = true;

    localStorage.setItem(
        "mrsmile_handshake",
        "1"
    );

    trigger(
        "mrsmile:handshakeDetected"
    );

    await showHandshakeSequence();

    trigger(
        "mrsmile:handshakeAccepted"
    );
}


/* ==========================================================
   HANDSHAKE SEQUENCE
========================================================== */

async function showHandshakeSequence() {

    await systemMessage(
        "SYSTEM NOTICE: Unauthorized handshake detected."
    );

    await sleep(500);

    await systemMessage(
        "CHANNEL: SYS_00"
    );

    await sleep(350);

    await systemMessage(
        "SOURCE: UNKNOWN"
    );

    await sleep(500);

    const overlay =
        createSystemOverlay();

    overlay.classList.add(
        "mrSmileHandshake"
    );

    await sleep(300);

    overlay.classList.add(
        "accepted"
    );

    await sleep(500);

    overlay.remove();

    await systemMessage(
        "CONNECTION STATUS: ACTIVE"
    );

    await sleep(400);

    await systemMessage(
        "REMOTE HANDSHAKE ACCEPTED."
    );
}


/* ==========================================================
   HANDSHAKE ACCEPTED
========================================================== */

function handleHandshakeAccepted() {

    if (integrityEventRunning) return;

    startOmegaIntegrityEvent();
}


/* ==========================================================
   OMEGA INTEGRITY EVENT
========================================================== */

async function startOmegaIntegrityEvent() {

    if (integrityEventRunning) return;

    integrityEventRunning = true;

    try {

        await systemMessage(
            "OMEGA SYSTEM INTEGRITY: 99.8%"
        );

        await sleep(900);

        await systemMessage(
            "OMEGA SYSTEM INTEGRITY: 99.6%"
        );

        await sleep(850);

        await systemMessage(
            "OMEGA SYSTEM INTEGRITY: 99.3%"
        );

        await sleep(700);

        await systemMessage(
            "BACKGROUND PROCESS: UNKNOWN"
        );

        await sleep(650);

        await systemMessage(
            "REMOTE PROCESS DETECTED."
        );

        await sleep(900);

        await systemMessage(
            "PROCESS TERMINATION REQUESTED."
        );

        await sleep(800);

        await systemMessage(
            "PROCESS TERMINATED."
        );

        await sleep(1000);

        await systemMessage(
            "SYSTEM INTEGRITY: NORMAL"
        );

        await sleep(1800);

        await falseRecovery();

    } catch (error) {

        console.error(
            "[MR.SMILE] Integrity event failed:",
            error
        );

    } finally {

        integrityEventRunning = false;
    }
}


/* ==========================================================
   FALSE RECOVERY
========================================================== */

async function falseRecovery() {

    if (falseRecoveryRunning) return;

    falseRecoveryRunning = true;

    try {

        await systemMessage(
            "BACKGROUND PROCESS: 01 UNKNOWN"
        );

        await sleep(800);

        await systemMessage(
            "BACKGROUND PROCESS: 00 UNKNOWN"
        );

        await sleep(900);

        await systemMessage(
            "SYSTEM INTEGRITY: NORMAL"
        );

        await sleep(3000);

        trigger(
            "mrsmile:firstContact"
        );

    } finally {

        falseRecoveryRunning = false;
    }
}


/* ==========================================================
   FIRST CONTACT
========================================================== */

export async function triggerFirstContact() {

    if (firstContactRunning) return;

    if (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1"
    ) {
        return;
    }

    firstContactRunning = true;

    clearFirstContactTimers();

    try {

        document.body.classList.add(
            "mrSmileFirstContact"
        );


        /* --------------------------------------------------
           01 — AUTHORIZATION
        -------------------------------------------------- */

        await phaseAuthorization();


        /* --------------------------------------------------
           02 — OMEGA COLLAPSE
        -------------------------------------------------- */

        await phaseOmegaCollapse();


        /* --------------------------------------------------
           03 — DARKNESS
        -------------------------------------------------- */

        await phaseSystemDarkness();


        /* --------------------------------------------------
           04 — DIAGNOSTICS
        -------------------------------------------------- */

        await phaseDiagnostics();


        /* --------------------------------------------------
           05 — EYES
        -------------------------------------------------- */

        await phaseEyes();


        /* --------------------------------------------------
           06 — FACE
        -------------------------------------------------- */

        await phaseFace();


        /* --------------------------------------------------
           07 — PLAYER INTERACTION
        -------------------------------------------------- */

        await phasePlayerInteraction();


        /* --------------------------------------------------
           08 — CURSOR TAKEOVER
        -------------------------------------------------- */

        await phaseCursorTakeover();


        /* --------------------------------------------------
           09 — OMEGA INTRUSION
        -------------------------------------------------- */

        await phaseOmegaIntrusion();


        /* --------------------------------------------------
           10 — RELEASE
        -------------------------------------------------- */

        await phaseRelease();


        /* --------------------------------------------------
           11 — FINISH
        -------------------------------------------------- */

        await finishFirstContact();

    } catch (error) {

        console.error(
            "[MR.SMILE] First contact failed:",
            error
        );

    } finally {

        cleanupFirstContact();

        firstContactRunning = false;
    }
}


/* ==========================================================
   PHASE 01
   UNAUTHORIZED AUTHORIZATION
========================================================== */

async function phaseAuthorization() {

    document.body.classList.add(
        "mrSmileAuthPhase"
    );

    const auth =
        createMrSmileAuthorization();


    await sleep(
        TIMING.authAppear
    );


    /* ------------------------------------------------------
       ACCOUNT
    ------------------------------------------------------ */

    const account =
        auth.querySelector(
            "[data-mrsmile-account]"
        );

    await typeIntoElement(
        account,
        "MR_SMILE",
        115
    );


    await sleep(450);


    /* ------------------------------------------------------
       PASSWORD
    ------------------------------------------------------ */

    const password =
        auth.querySelector(
            "[data-mrsmile-password]"
        );

    await typeIntoElement(
        password,
        "••••••••",
        120
    );


    await sleep(
        TIMING.authProcess
    );


    /* ------------------------------------------------------
       AUTHORIZATION
    ------------------------------------------------------ */

    const status =
        auth.querySelector(
            "[data-mrsmile-status]"
        );

    status.textContent =
        "AUTHORIZING...";


    await sleep(700);


    status.textContent =
        "AUTHENTICATION SUCCESSFUL";

    status.classList.add(
        "success"
    );


    await sleep(450);


    status.textContent =
        "ACCESS GRANTED";


    await sleep(
        TIMING.authGranted
    );


    /* ------------------------------------------------------
       ACCOUNT OWNER
    ------------------------------------------------------ */

    const warning =
        auth.querySelector(
            "[data-mrsmile-warning]"
        );

    warning.textContent =
        "ACCOUNT OWNER: UNKNOWN";

    warning.classList.add(
        "warning"
    );


    await sleep(1300);


    /*
     * Теперь игрок должен понять:
     *
     * это не его авторизация.
     */

    document.body.classList.add(
        "mrSmileSystemTaken"
    );


    await sleep(700);
}


/* ==========================================================
   AUTHORIZATION UI
========================================================== */

function createMrSmileAuthorization() {

    const old =
        document.querySelector(
            "#mrSmileAuthorization"
        );

    if (old) {
        old.remove();
    }


    const auth =
        document.createElement("div");

    auth.id =
        "mrSmileAuthorization";

    auth.className =
        "mrSmileAuthorization";


    auth.innerHTML = `

        <div class="mrSmileAuthorizationHeader">

            <span>
                OMEGA SECURE AUTHENTICATION
            </span>

            <span class="mrSmileAuthCode">
                AUTH-REMOTE
            </span>

        </div>


        <div class="mrSmileAuthorizationBody">

            <div class="mrSmileAuthLogo">
                OMEGA
            </div>


            <div class="mrSmileAuthField">

                <label>
                    ACCOUNT
                </label>

                <div
                    class="mrSmileAuthInput"
                    data-mrsmile-account
                ></div>

            </div>


            <div class="mrSmileAuthField">

                <label>
                    PASSWORD
                </label>

                <div
                    class="mrSmileAuthInput password"
                    data-mrsmile-password
                ></div>

            </div>


            <div
                class="mrSmileAuthStatus"
                data-mrsmile-status
            >
                WAITING...
            </div>


            <div
                class="mrSmileAuthWarning"
                data-mrsmile-warning
            >
                AUTHORIZATION REQUEST RECEIVED
            </div>

        </div>
    `;


    document.body.appendChild(
        auth
    );


    return auth;
}


/* ==========================================================
   PHASE 02
   OMEGA COLLAPSE
========================================================== */

async function phaseOmegaCollapse() {

    document.body.classList.add(
        "mrSmileCollapsePhase"
    );


    /*
     * Только реальные части OMEGA.
     *
     * Никаких body > *.
     */

    const targets = [

        "#notificationArea",

        "#icons",

        ".desktopWatermark",

        "#sidebar",

        "#topBar",

        "#desktopBackground"

    ];


    for (const selector of targets) {

        const elements =
            document.querySelectorAll(
                selector
            );


        if (!elements.length) {
            continue;
        }


        elements.forEach(
            element => {

                element.classList.add(
                    "mrSmileSystemDisappearing"
                );

            }
        );


        await sleep(
            TIMING.collapseStep
        );
    }


    /*
     * Workspace остается дольше.
     */

    const workspace =
        document.querySelector(
            "#workspace"
        );

    if (workspace) {

        workspace.classList.add(
            "mrSmileSystemDisappearing"
        );

        await sleep(
            TIMING.collapseStep
        );
    }


    /*
     * Только реальные OMEGA windows.
     */

    const windows =
        document.querySelectorAll(
            ".window"
        );


    for (const windowElement of windows) {

        if (
            windowElement.id ===
            "mrSmileAuthorization"
        ) {
            continue;
        }

        windowElement.classList.add(
            "mrSmileSystemDisappearing"
        );

        await sleep(300);
    }


    await sleep(700);
}


/* ==========================================================
   PHASE 03
   SYSTEM DARKNESS
========================================================== */

async function phaseSystemDarkness() {

    document.body.classList.add(
        "mrSmileSystemDarkness"
    );


    await sleep(
        TIMING.darkness
    );


    /*
     * Authorization исчезает последней.
     */

    const auth =
        document.querySelector(
            "#mrSmileAuthorization"
        );


    if (auth) {

        auth.classList.add(
            "mrSmileSystemDisappearing"
        );


        await sleep(850);


        auth.remove();
    }


    await sleep(500);
}


/* ==========================================================
   PHASE 04
   DIAGNOSTICS
========================================================== */

async function phaseDiagnostics() {

    const diagnostics =
        createDiagnostics();


    document.body.appendChild(
        diagnostics
    );


    const lines = [

        "OMEGA CORE",
        "--------------------------------",
        "",
        "DISPLAY............. OK",
        "INPUT............... OK",
        "NETWORK............. OK",
        "AUTH................ UNKNOWN",
        "",
        "PROCESS............. UNKNOWN",
        "SOURCE.............. UNKNOWN",
        "",
        "SYSTEM CONTROL...... LOST",
        "",
        "OBSERVER............"

    ];


    for (const line of lines) {

        const row =
            document.createElement("div");

        row.textContent =
            line;

        diagnostics.appendChild(
            row
        );


        await sleep(90);
    }


    await sleep(550);


    const present =
        document.createElement("div");


    present.textContent =
        "PRESENT";


    present.className =
        "mrSmileDiagnosticPresent";


    diagnostics.appendChild(
        present
    );


    await sleep(
        TIMING.diagnostics
    );
}


/* ==========================================================
   DIAGNOSTICS
========================================================== */

function createDiagnostics() {

    const diagnostics =
        document.createElement("div");

    diagnostics.id =
        "mrSmileDiagnostics";

    diagnostics.className =
        "mrSmileDiagnostics";

    return diagnostics;
}


/* ==========================================================
   PHASE 05
   EYES
========================================================== */

async function phaseEyes() {

    document.body.classList.add(
        "mrSmileEyesPhase"
    );


    await sleep(400);


    /*
     * Appearance module отвечает только
     * за физическое появление сущности.
     */

    await showMrSmileFirstContactFace(
        "presence"
    );


    await sleep(
        TIMING.eyesAppear
    );
}


/* ==========================================================
   PHASE 06
   FACE
========================================================== */

async function phaseFace() {

    document.body.classList.add(
        "mrSmileFacePhase"
    );


    /*
     * Не запускаем вторую manifestation-сцену.
     *
     * Лицо уже появляется внутри appearance.js.
     * Здесь только даём ему время.
     */

    await sleep(
        TIMING.faceAppear
    );
}


/* ==========================================================
   PHASE 07
   PLAYER INTERACTION
========================================================== */

async function phasePlayerInteraction() {

    document.body.classList.add(
        "mrSmileInteractionPhase"
    );


    /*
     * ВАЖНО:
     *
     * Здесь интерфейс НЕ блокируется.
     *
     * Игрок действительно может:
     *
     * - двигать мышью;
     * - нажимать кнопки;
     * - открывать окна;
     * - пытаться восстановить OMEGA.
     *
     * MR.SMILE пока только наблюдает.
     */

    await sleep(
        TIMING.playerInteraction
    );
}


/* ==========================================================
   PHASE 08
   CURSOR TAKEOVER
========================================================== */

async function phaseCursorTakeover() {

    document.body.classList.add(
        "mrSmileCursorTransfer"
    );


    /*
     * Теперь MR.SMILE замечает курсор.
     */

    await observeCursor();


    await sleep(500);


    /*
     * Передаём визуальное управление
     * отдельному cursor layer.
     */

    await transferCursorControl();


    await sleep(
        TIMING.cursorTransfer
    );
}


/* ==========================================================
   CURSOR OBSERVATION
========================================================== */

async function observeCursor() {

    const face =
        document.querySelector(
            ".mrSmileFace"
        );


    if (!face) {

        await sleep(700);

        return;
    }


    face.classList.add(
        "mrSmileCursorNoticed"
    );


    await sleep(900);


    face.classList.remove(
        "mrSmileCursorNoticed"
    );
}


/* ==========================================================
   CURSOR CONTROL
========================================================== */

async function transferCursorControl() {

    createControlledCursor();


    /*
     * Сначала он продолжает следовать
     * настоящей мыши.
     */

    document.body.classList.add(
        "mrSmileCursorObserved"
    );


    await sleep(700);


    /*
     * Реальный cursor становится невидимым.
     *
     * Это только визуальное управление.
     * Браузерный pointer физически переместить
     * невозможно.
     */

    originalCursor =
        document.body.style.cursor || "";

    document.body.style.cursor =
        "none";


    document.body.classList.add(
        "mrSmileCursorControlled"
    );


    await animateControlledCursor();


    await sleep(350);
}


/* ==========================================================
   CREATE CONTROLLED CURSOR
========================================================== */

function createControlledCursor() {

    if (controlledCursor) {
        controlledCursor.remove();
    }


    controlledCursor =
        document.createElement("div");


    controlledCursor.id =
        "mrSmileControlledCursor";


    controlledCursor.className =
        "mrSmileControlledCursor";


    controlledCursor.innerHTML = `

        <div class="mrCursorArrow"></div>

        <div class="mrCursorCore"></div>

    `;


    document.body.appendChild(
        controlledCursor
    );


    cursorMouseHandler =
        event => {

            if (
                !document.body.classList.contains(
                    "mrSmileCursorControlled"
                )
            ) {

                controlledCursor.style.left =
                    `${event.clientX}px`;

                controlledCursor.style.top =
                    `${event.clientY}px`;
            }
        };


    document.addEventListener(
        "mousemove",
        cursorMouseHandler,
        true
    );
}


/* ==========================================================
   CONTROLLED CURSOR MOVEMENT
========================================================== */

async function animateControlledCursor() {

    if (!controlledCursor) {
        return;
    }


    const startX =
        window.innerWidth * 0.5;

    const startY =
        window.innerHeight * 0.55;


    moveControlledCursor(
        startX,
        startY
    );


    await sleep(500);


    /*
     * Курсор двигается самостоятельно.
     */

    moveControlledCursor(
        window.innerWidth * 0.38,
        window.innerHeight * 0.48
    );


    await sleep(650);


    moveControlledCursor(
        window.innerWidth * 0.62,
        window.innerHeight * 0.48
    );


    await sleep(650);


    moveControlledCursor(
        window.innerWidth * 0.5,
        window.innerHeight * 0.5
    );


    await sleep(600);
}


/* ==========================================================
   MOVE CONTROLLED CURSOR
========================================================== */

function moveControlledCursor(
    x,
    y
) {

    if (!controlledCursor) {
        return;
    }


    controlledCursor.style.left =
        `${x}px`;

    controlledCursor.style.top =
        `${y}px`;
}


/* ==========================================================
   PHASE 09
   OMEGA INTRUSION
========================================================== */

async function phaseOmegaIntrusion() {

    document.body.classList.add(
        "mrSmileIntrusionPhase"
    );


    await sleep(450);


    /*
     * Теперь курсор выбирает системное окно.
     */

    const target =
        createIntrusionWindow();


    document.body.appendChild(
        target
    );


    await sleep(
        TIMING.intrusionWindow
    );


    /*
     * Небольшая геометрическая ошибка.
     *
     * Не screen shake.
     * Не RGB glitch.
     *
     * Просто OMEGA на мгновение
     * перестаёт идеально совпадать сама с собой.
     */

    document.body.classList.add(
        "mrSmileGeometryDistortion"
    );


    await sleep(
        TIMING.distortion
    );


    document.body.classList.remove(
        "mrSmileGeometryDistortion"
    );


    /*
     * Cursor click.
     */

    if (controlledCursor) {

        controlledCursor.classList.add(
            "mrSmileCursorClick"
        );

        await sleep(180);

        controlledCursor.classList.remove(
            "mrSmileCursorClick"
        );
    }


    await sleep(450);


    /*
     * Окно больше не нужно.
     */

    target.classList.add(
        "mrSmileIntrusionClosing"
    );


    await sleep(650);


    target.remove();
}


/* ==========================================================
   INTRUSION WINDOW
========================================================== */

function createIntrusionWindow() {

    const windowElement =
        document.createElement("div");


    windowElement.className =
        "window mrSmileIntrusionWindow";


    windowElement.innerHTML = `

        <div class="windowHeader">

            <div class="windowTitle">

                <span class="windowIcon">
                    ▣
                </span>

                SYSTEM CONSOLE

            </div>


            <div class="windowControls">

                <button
                    type="button"
                    disabled
                >
                    —
                </button>

                <button
                    type="button"
                    disabled
                >
                    ×
                </button>

            </div>

        </div>


        <div class="windowBody">

            <div class="mrSmileIntrusionContent">

                <div>
                    OMEGA SYSTEM CONSOLE
                </div>

                <div>
                    INPUT CHANNEL: LOCAL
                </div>

                <div>
                    RESPONSE: DELAYED
                </div>

                <div>
                    SESSION: SYS_00
                </div>

                <div>
                    PROCESS: UNKNOWN
                </div>

                <div>
                    CONTROL OWNER: UNKNOWN
                </div>

            </div>

        </div>


        <div class="windowStatus">

            CONNECTION: ACTIVE

        </div>

    `;


    /*
     * Центрируем как настоящее OMEGA window.
     */

    windowElement.style.left =
        "50%";

    windowElement.style.top =
        "50%";

    windowElement.style.transform =
        "translate(-50%, -50%)";


    windowElement.classList.add(
        "mrSmileIntrusionTarget"
    );


    return windowElement;
}


/* ==========================================================
   PHASE 10
   RELEASE
========================================================== */

async function phaseRelease() {

    document.body.classList.add(
        "mrSmileReleasePhase"
    );


    /*
     * MR.SMILE прекращает вмешательство.
     *
     * Сначала исчезает его визуальный слой.
     * Потом возвращается input.
     */

    await sleep(500);


    if (controlledCursor) {

        controlledCursor.classList.add(
            "mrSmileCursorLost"
        );
    }


    await sleep(
        TIMING.inputLost
    );


    await releaseCursorControl();


    await sleep(
        TIMING.recovery
    );
}


/* ==========================================================
   RELEASE CURSOR
========================================================== */

async function releaseCursorControl() {

    document.body.classList.remove(
        "mrSmileCursorControlled"
    );


    document.body.classList.remove(
        "mrSmileCursorObserved"
    );


    document.body.style.cursor =
        originalCursor;


    if (cursorMouseHandler) {

        document.removeEventListener(
            "mousemove",
            cursorMouseHandler,
            true
        );

        cursorMouseHandler = null;
    }


    if (controlledCursor) {

        controlledCursor.classList.add(
            "mrSmileCursorRelease"
        );


        await sleep(500);


        controlledCursor.remove();

        controlledCursor = null;
    }
}


/* ==========================================================
   FINISH
========================================================== */

async function finishFirstContact() {

    /*
     * Восстанавливаем OMEGA.
     */

    restoreOmegaInterface();


    await sleep(1000);


    /*
     * Фиксируем первый контакт.
     */

    localStorage.setItem(
        "mrsmile_first_contact",
        "1"
    );


    try {

        evaluateProgress();

    } catch (error) {

        console.warn(
            "[MR.SMILE] Progress evaluation failed:",
            error
        );
    }


    await sleep(1500);


    /*
     * Теперь игрок снова видит обычную OMEGA.
     */

    try {

        revealMrSmileChat();

    } catch (error) {

        console.warn(
            "[MR.SMILE] Chat reveal failed:",
            error
        );
    }


    await sleep(1000);


    try {

        playFirstContactMessage();

    } catch (error) {

        console.warn(
            "[MR.SMILE] First contact message failed:",
            error
        );
    }


    await sleep(1300);


    /*
     * Очень маленький остаточный след.
     */

    createObserverTrace();


    await sleep(2500);


    removeObserverTrace();
}


/* ==========================================================
   RESTORE OMEGA
========================================================== */

function restoreOmegaInterface() {

    const disappearing =
        document.querySelectorAll(
            ".mrSmileSystemDisappearing"
        );


    disappearing.forEach(
        element => {

            element.classList.remove(
                "mrSmileSystemDisappearing"
            );

            element.style.removeProperty(
                "opacity"
            );

            element.style.removeProperty(
                "visibility"
            );

            element.style.removeProperty(
                "transform"
            );

        }
    );


    document.body.classList.remove(
        "mrSmileSystemTaken"
    );


    document.body.classList.remove(
        "mrSmileSystemDarkness"
    );
}


/* ==========================================================
   OBSERVER TRACE
========================================================== */

function createObserverTrace() {

    if (
        document.querySelector(
            "#mrSmileObserverTrace"
        )
    ) {
        return;
    }


    const trace =
        document.createElement("div");


    trace.id =
        "mrSmileObserverTrace";


    trace.className =
        "mrSmileObserverTrace";


    trace.textContent =
        "OBSERVER: 01";


    document.body.appendChild(
        trace
    );


    requestAnimationFrame(
        () => {

            trace.classList.add(
                "visible"
            );

        }
    );
}


function removeObserverTrace() {

    const trace =
        document.querySelector(
            "#mrSmileObserverTrace"
        );


    if (!trace) return;


    trace.classList.add(
        "fade"
    );


    scheduleFirstContactTimer(
        () => {

            trace.remove();

        },
        700
    );
}


/* ==========================================================
   CLEANUP
========================================================== */

function cleanupFirstContact() {

    const classes = [

        "mrSmileFirstContact",
        "mrSmileAuthPhase",
        "mrSmileSystemTaken",
        "mrSmileCollapsePhase",
        "mrSmileSystemDarkness",
        "mrSmileEyesPhase",
        "mrSmileFacePhase",
        "mrSmileInteractionPhase",
        "mrSmileCursorTransfer",
        "mrSmileCursorObserved",
        "mrSmileCursorControlled",
        "mrSmileIntrusionPhase",
        "mrSmileGeometryDistortion",
        "mrSmileReleasePhase"

    ];


    classes.forEach(
        className => {

            document.body.classList.remove(
                className
            );

        }
    );


    releaseCursorControl();


    const auth =
        document.querySelector(
            "#mrSmileAuthorization"
        );


    if (auth) {
        auth.remove();
    }


    const diagnostics =
        document.querySelector(
            "#mrSmileDiagnostics"
        );


    if (diagnostics) {
        diagnostics.remove();
    }


    const intrusion =
        document.querySelector(
            ".mrSmileIntrusionWindow"
        );


    if (intrusion) {
        intrusion.remove();
    }


    restoreOmegaInterface();


    clearFirstContactTimers();
}


/* ==========================================================
   PUBLIC TRIGGER
========================================================== */

export function triggerMrSmileFirstContact() {

    trigger(
        "mrsmile:firstContact"
    );
}


/* ==========================================================
   DEBUG RESET
========================================================== */

export function resetMrSmileFirstContact() {

    localStorage.removeItem(
        "mrsmile_first_contact"
    );

    localStorage.removeItem(
        "mrsmile_handshake"
    );


    sys00HandshakeArmed = false;
    sys00HandshakeTriggered = false;


    cleanupFirstContact();


    console.log(
        "[MR.SMILE] First contact state reset."
    );
}


/* ==========================================================
   AMBIENT EVENTS
   ----------------------------------------------------------
   Небольшие появления MR.SMILE после FIRST CONTACT.
   
   Эти события не должны ломать OMEGA.
   Они создают ощущение постоянного присутствия.
========================================================== */

function initAmbientEvents() {

    on(
        "mrsmile:nightEvent",
        () => {
            runAmbientEvent(
                ambientNightEvent
            );
        }
    );


    on(
        "mrsmile:glitchEvent",
        () => {
            runAmbientEvent(
                ambientGlitchEvent
            );
        }
    );


    on(
        "mrsmile:idleEvent",
        () => {
            runAmbientEvent(
                ambientIdleEvent
            );
        }
    );


    on(
        "mrsmile:observationEvent",
        () => {
            runAmbientEvent(
                ambientObservationEvent
            );
        }
    );


    console.log(
        "[MR.SMILE] Ambient events registered."
    );
}


/* ==========================================================
   AMBIENT EVENT RUNNER
========================================================== */

async function runAmbientEvent(
    eventFunction
) {

    if (firstContactRunning) {
        return;
    }


    if (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) !== "1"
    ) {
        return;
    }


    if (ambientEventRunning) {
        return;
    }


    const now =
        Date.now();


    if (
        now - lastAmbientEventTime <
        AMBIENT_COOLDOWN
    ) {
        return;
    }


    ambientEventRunning = true;
    lastAmbientEventTime = now;


    try {

        await eventFunction();

    } catch (error) {

        console.warn(
            "[MR.SMILE] Ambient event failed:",
            error
        );

    } finally {

        ambientEventRunning = false;
    }
}

/* ==========================================================
   BACKGROUND LOOP — NIGHT
========================================================== */

async function nightLoop() {

    while (running) {

        await sleep(
            randomBetween(
                18000,
                42000
            )
        );


        if (firstContactRunning) {
            continue;
        }


        if (
            Math.random() < 0.18
        ) {

            trigger(
                "mrsmile:nightEvent"
            );
        }
    }
}


/* ==========================================================
   BACKGROUND LOOP — GLITCH
========================================================== */

async function glitchLoop() {

    while (running) {

        await sleep(
            randomBetween(
                25000,
                60000
            )
        );


        if (firstContactRunning) {
            continue;
        }


        if (
            Math.random() < 0.12
        ) {

            trigger(
                "mrsmile:glitchEvent"
            );
        }
    }
}


/* ==========================================================
   BACKGROUND LOOP — IDLE
========================================================== */

async function idleLoop() {

    while (running) {

        await sleep(
            randomBetween(
                30000,
                75000
            )
        );


        if (firstContactRunning) {
            continue;
        }


        trigger(
            "mrsmile:idleEvent"
        );
    }
}


/* ==========================================================
   BACKGROUND LOOP — OBSERVATION
========================================================== */

async function observationLoop() {

    while (running) {

        await sleep(
            randomBetween(
                22000,
                50000
            )
        );


        if (firstContactRunning) {
            continue;
        }


        const trust =
            safeTrust();


        const chance =
            Math.min(
                0.45,
                0.08 +
                trust * 0.04
            );


        if (
            Math.random() < chance
        ) {

            trigger(
                "mrsmile:observationEvent"
            );
        }
    }
}


/* ==========================================================
   TRUST
========================================================== */

function safeTrust() {

    try {

        const trust =
            getTrust();


        if (
            typeof trust ===
            "number"
        ) {
            return trust;
        }


        return 0;

    } catch {

        return 0;
    }
}


/* ==========================================================
   SYSTEM MESSAGE
========================================================== */

async function systemMessage(
    text
) {

    try {

        if (
            typeof typeSystemMessage ===
            "function"
        ) {

            await typeSystemMessage(
                text
            );

            return;
        }

    } catch (error) {

        console.warn(
            "[MR.SMILE] typeSystemMessage failed:",
            error
        );
    }


    console.log(
        "[OMEGA]",
        text
    );
}


/* ==========================================================
   SYSTEM OVERLAY
========================================================== */

function createSystemOverlay() {

    const overlay =
        document.createElement("div");


    overlay.className =
        "mrSmileSystemOverlay";


    document.body.appendChild(
        overlay
    );


    return overlay;
}


/* ==========================================================
   TYPE TEXT
========================================================== */

async function typeIntoElement(
    element,
    text,
    speed = 100
) {

    if (!element) return;


    element.textContent =
        "";


    for (
        const character
        of text
    ) {

        element.textContent +=
            character;


        await sleep(
            speed
        );
    }
}


/* ==========================================================
   SCHEDULE TIMER
   ----------------------------------------------------------
   В отличие от старой версии все временные
   callbacks первого контакта можно отменить.
========================================================== */

function scheduleFirstContactTimer(
    callback,
    delay
) {

    const timer =
        setTimeout(
            () => {

                firstContactTimers =
                    firstContactTimers.filter(
                        item =>
                            item !== timer
                    );

                callback();

            },
            delay
        );


    firstContactTimers.push(
        timer
    );


    return timer;
}


/* ==========================================================
   CLEAR TIMERS
========================================================== */

function clearFirstContactTimers() {

    firstContactTimers.forEach(
        timer => {

            clearTimeout(
                timer
            );

        }
    );


    firstContactTimers = [];
}


/* ==========================================================
   RANDOM
========================================================== */

function randomBetween(
    min,
    max
) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;
}


/* ==========================================================
   SLEEP
========================================================== */

function sleep(
    ms
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


/* ==========================================================
   LEGACY EVENT HELPERS
========================================================== */

export function mrSmileGlitch() {

    if (firstContactRunning) {
        return;
    }


    trigger(
        "mrsmile:glitchEvent"
    );
}


export function mrSmileObservation() {

    if (firstContactRunning) {
        return;
    }


    trigger(
        "mrsmile:observationEvent"
    );
}


export function mrSmileNightEvent() {

    if (firstContactRunning) {
        return;
    }


    trigger(
        "mrsmile:nightEvent"
    );
}


/* ==========================================================
   END
========================================================== */
