
/* ==========================================================
   MR.SMILE — OMEGA FIRST CONTACT EVENTS
   ----------------------------------------------------------
   Основная идея:
   MR.SMILE не "ломает экран".
   Он получает контроль над OMEGA.

   SEQUENCE:

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
   SYSTEM COLLAPSE
        ↓
   DIAGNOSTICS
        ↓
   EYES
        ↓
   FACE
        ↓
   PLAYER INTERACTION
        ↓
   CURSOR OBSERVED
        ↓
   CURSOR CONTROL TRANSFER
        ↓
   OMEGA WINDOW OPENED
        ↓
   SUBTLE DISTORTION
        ↓
   MR.SMILE DISAPPEARS
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

let sys00HandshakeArmed = false;
let sys00HandshakeTriggered = false;

let integrityEventRunning = false;
let falseRecoveryRunning = false;


/* ==========================================================
   TIMING
========================================================== */

const TIMING = {

    authAppear: 900,
    authAccount: 1100,
    authPassword: 850,
    authProcess: 1200,
    authGranted: 1000,

    collapseStep: 650,

    darkness: 1400,
    diagnostics: 2100,

    eyesAppear: 1800,
    faceAppear: 2200,

    cursorObserve: 1700,
    cursorTransfer: 1500,

    windowOpen: 1800,
    distortion: 1700,

    recovery: 2600
};


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileEvents() {

    if (running) return;

    running = true;

    loadTrust();

    try {
        initMrSmileProgress();
    } catch (error) {
        console.warn(
            "[MR.SMILE] Progress initialization failed:",
            error
        );
    }

    /*
     * Background systems.
     * Они продолжают работать после первого контакта,
     * но сам первый контакт временно приостанавливает
     * визуальные случайные события.
     */

    nightLoop();
    glitchLoop();
    idleLoop();
    observationLoop();


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

    setTimeout(() => {

        if (
            localStorage.getItem(
                "mrsmile_handshake"
            ) === "1"
        ) {
            return;
        }

        triggerSys00Handshake();

    }, 1500);
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

    try {

        document.body.classList.add(
            "mrSmileFirstContact"
        );

        /*
         * Не блокируем pointer events.
         *
         * Игрок должен иметь возможность:
         * - двигать мышью;
         * - нажимать на интерфейс;
         * - пытаться понять, что происходит.
         *
         * Реальный захват управления произойдет позже.
         */

        await phaseAuthorization();

        await phaseOmegaCollapse();

        await phaseSystemDarkness();

        await phaseDiagnostics();

        await phaseEyes();

        await phaseFace();

        await phasePlayerInteraction();

        await phaseCursorTakeover();

        await phaseOmegaIntrusion();

        await phaseRelease();

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
   PHASE 1
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

    /*
     * ACCOUNT
     */

    const account =
        auth.querySelector(
            "[data-mrsmile-account]"
        );

    await typeIntoElement(
        account,
        "MR_SMILE",
        115
    );

    await sleep(500);

    /*
     * PASSWORD
     */

    const password =
        auth.querySelector(
            "[data-mrsmile-password]"
        );

    await typeIntoElement(
        password,
        "********",
        120
    );

    await sleep(
        TIMING.authProcess
    );

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


    /*
     * Important:
     * Мы специально оставляем окно ещё немного.
     * Игрок должен успеть понять,
     * что аккаунт существует.
     */

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
     * Начинается потеря контроля.
     */

    document.body.classList.add(
        "mrSmileSystemTaken"
    );

    await sleep(800);
}


/* ==========================================================
   AUTHORIZATION UI
========================================================== */

function createMrSmileAuthorization() {

    let existing =
        document.querySelector(
            "#mrSmileAuthorization"
        );

    if (existing) {
        existing.remove();
    }

    const auth =
        document.createElement("div");

    auth.id =
        "mrSmileAuthorization";

    auth.className =
        "mrSmileAuthorization";

    auth.innerHTML = `

        <div class="mrSmileAuthorizationHeader">
            <span>OMEGA SECURE AUTHENTICATION</span>
            <span class="mrSmileAuthCode">
                AUTH-REMOTE
            </span>
        </div>

        <div class="mrSmileAuthorizationBody">

            <div class="mrSmileAuthLogo">
                OMEGA
            </div>

            <div class="mrSmileAuthField">

                <label>ACCOUNT</label>

                <div
                    class="mrSmileAuthInput"
                    data-mrsmile-account
                ></div>

            </div>

            <div class="mrSmileAuthField">

                <label>PASSWORD</label>

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

    document.body.appendChild(auth);

    return auth;
}


/* ==========================================================
   PHASE 2
   OMEGA COLLAPSE
========================================================== */

async function phaseOmegaCollapse() {

    document.body.classList.add(
        "mrSmileCollapsePhase"
    );

    const targets = [

        "#notifications",
        "#notificationArea",

        "#icons",

        "#sidebar",

        "#topBar",

        "#desktopBackground",

        ".desktopWatermark"

    ];

    for (const selector of targets) {

        const elements =
            document.querySelectorAll(
                selector
            );

        if (!elements.length) {
            continue;
        }

        for (const element of elements) {

            element.classList.add(
                "mrSmileSystemDisappearing"
            );
        }

        await sleep(
            TIMING.collapseStep
        );
    }


    /*
     * Реальные окна OMEGA.
     */

    const windows =
        document.querySelectorAll(
            ".window"
        );

    for (const window of windows) {

        if (
            window.id ===
            "mrSmileAuthorization"
        ) {
            continue;
        }

        window.classList.add(
            "mrSmileSystemDisappearing"
        );

        await sleep(
            350
        );
    }

    await sleep(1000);
}


/* ==========================================================
   PHASE 3
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

        await sleep(900);

        auth.remove();
    }

    await sleep(600);
}


/* ==========================================================
   PHASE 4
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

        await sleep(
            90
        );
    }

    await sleep(600);

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
   PHASE 5
   EYES
========================================================== */

async function phaseEyes() {

    document.body.classList.add(
        "mrSmileEyesPhase"
    );

    await sleep(500);

    await showMrSmileFirstContactFace(
        "presence"
    );

    await sleep(
        TIMING.eyesAppear
    );
}


/* ==========================================================
   PHASE 6
   FACE
========================================================== */

async function phaseFace() {

    /*
     * Второе появление должно быть очень небольшим.
     *
     * Если appearance.js уже держит лицо,
     * просто даём ему время проявиться.
     */

    document.body.classList.add(
        "mrSmileFacePhase"
    );

    await sleep(
        TIMING.faceAppear
    );
}


/* ==========================================================
   PHASE 7
   PLAYER INTERACTION
========================================================== */

async function phasePlayerInteraction() {

    document.body.classList.add(
        "mrSmileInteractionPhase"
    );

    /*
     * Здесь ничего не блокируем.
     *
     * Игрок может:
     * - двигать мышью;
     * - нажимать кнопки;
     * - пытаться открыть окна;
     * - пытаться вернуть интерфейс.
     *
     * MR.SMILE наблюдает.
     */

    await sleep(
        TIMING.cursorObserve
    );
}


/* ==========================================================
   PHASE 8
   CURSOR TAKEOVER
========================================================== */

async function phaseCursorTakeover() {

    document.body.classList.add(
        "mrSmileCursorTransfer"
    );

    await sleep(500);

    /*
     * Сам визуальный захват курсора
     * выполняется appearance.js.
     */

    await triggerMrSmileManifestation();

    await sleep(
        TIMING.cursorTransfer
    );
}


/* ==========================================================
   PHASE 9
   OMEGA INTRUSION
========================================================== */

async function phaseOmegaIntrusion() {

    document.body.classList.add(
        "mrSmileIntrusionPhase"
    );

    await sleep(700);

    /*
     * Ищем существующее окно Console.
     *
     * Если оно существует — используем его.
     * Если нет — создаём минимальный системный
     * intrusion window.
     */

    let target =
        document.querySelector(
            "#consoleWindow"
        );

    if (!target) {

        target =
            createIntrusionWindow();

        document.body.appendChild(
            target
        );
    }

    target.classList.add(
        "mrSmileIntrusionTarget"
    );

    await sleep(
        TIMING.windowOpen
    );

    /*
     * Система слегка теряет геометрию.
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
                <span class="windowIcon">▣</span>
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

            <div
                class="mrSmileIntrusionContent"
            >

                <div>
                    OMEGA SYSTEM CONSOLE
                </div>

                <div>
                    INPUT CHANNEL: LOCAL
                </div>

                <div>
                    REMOTE PROCESS: ACTIVE
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
     * Позиция относительно workspace.
     */

    windowElement.style.left =
        "50%";

    windowElement.style.top =
        "50%";

    windowElement.style.transform =
        "translate(-50%, -50%)";

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

    await sleep(
        TIMING.recovery
    );
}


/* ==========================================================
   FINISH
========================================================== */

async function finishFirstContact() {

    /*
     * Сначала возвращаем OMEGA.
     */

    restoreOmegaInterface();

    await sleep(1000);

    /*
     * Сохраняем факт первого контакта.
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
     * После возвращения системы
     * открываем MR.SMILE channel.
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
     * Небольшой остаточный след.
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

    setTimeout(() => {

        trace.classList.add(
            "visible"
        );

    }, 50);
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

    setTimeout(() => {

        trace.remove();

    }, 700);
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
   DEBUG
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

    console.log(
        "[MR.SMILE] First contact state reset."
    );
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

        /*
         * Чем выше trust,
         * тем чаще MR.SMILE может проявляться.
         */

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

    element.textContent = "";

    for (const character of text) {

        element.textContent +=
            character;

        await sleep(speed);
    }
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
   ----------------------------------------------------------
   Оставлены намеренно.
   Если другие части системы используют эти события,
   они продолжают существовать.
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

