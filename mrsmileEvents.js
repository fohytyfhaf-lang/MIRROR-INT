/* ==========================================================
   MR.SMILE — OMEGA FIRST CONTACT EVENTS
   ----------------------------------------------------------
   ACTIVE ARCHITECTURE:

       OMEGA
          ↓
       SYS_00
          ↓
       mrsmile:firstContact
          ↓
       State + Presence synchronization
          ↓
       MR.SMILE Appearance intrusion
          ↓
       OMEGA recovery
          ↓
       First Contact completed

   IMPORTANT:

   Старый визуальный First Contact больше НЕ используется.

   Никаких:
   - giant face
   - eyes
   - black-screen takeover
   - legacy cursor takeover
   - старого полного collapse sequence

   Визуальный First Contact полностью передан
   mrsmileAppearance.js.
========================================================== */


/* ==========================================================
   IMPORTS
========================================================== */

import {
    typeSystemMessage,
    playFirstContactMessage
} from "./mrsmileChat.js";

import {
    getTrust,
    loadTrust,
    addTrust
} from "./mrsmileTrust.js";

import {
    revealMrSmileChat
} from "./chats.js";

import {
    initMrSmileProgress,
    evaluateProgress
} from "./mrsmileProgress.js";

import {
    showMrSmileFirstContactFace
} from "./mrsmileAppearance.js";

import {
    on,
    trigger
} from "./eventManager.js";

import {
    initMrSmileIntrusionUI
} from "./mrsmileIntrusionUI.js";

import {
    initMrSmileBehavior
} from "./mrsmileBehavior.js";

import {
    initMrSmileActions
} from "./mrsmileActions.js";

import {
    initMrSmileContext
} from "./mrsmileContext.js";


/* ==========================================================
   MODULE STATE
========================================================== */

let running = false;

let firstContactRunning = false;

let sys00HandshakeArmed = false;
let sys00HandshakeTriggered = false;

let integrityEventRunning = false;
let falseRecoveryRunning = false;

let firstContactTimers = [];


/* ==========================================================
   AMBIENT STATE
========================================================== */

let ambientEventRunning = false;
let lastAmbientEventTime = 0;

const AMBIENT_COOLDOWN = 45000;


/* ==========================================================
   LEGACY OPERATOR STATE
   ----------------------------------------------------------
   Оставлено только для совместимости со старыми событиями.

   Explorer / Camera / Console / Window Manager должны
   проходить через:

       operatorAction
              ↓
       mrsmileContext
              ↓
       mrsmileBehavior
              ↓
       mrsmileActions
========================================================== */

let mrSmileReactionRunning = false;


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileEvents() {

    if (running) {
        return;
    }

    running = true;


    /* ------------------------------------------------------
       TRUST
    ------------------------------------------------------ */

    try {

        loadTrust();

    } catch (error) {

        console.warn(
            "[MR.SMILE] Trust initialization failed:",
            error
        );
    }


    /* ------------------------------------------------------
       PROGRESS
    ------------------------------------------------------ */

    try {

        initMrSmileProgress();

    } catch (error) {

        console.warn(
            "[MR.SMILE] Progress initialization failed:",
            error
        );
    }


    /* ------------------------------------------------------
       BACKGROUND LOOPS
    ------------------------------------------------------ */

    nightLoop();
    glitchLoop();
    idleLoop();
    observationLoop();

    initAmbientEvents();


    /* ------------------------------------------------------
       CORE MR.SMILE SYSTEMS

       Context → Behavior → Actions
    ------------------------------------------------------ */

    initMrSmileIntrusionUI();

    initMrSmileBehavior();

    initMrSmileActions();

    initMrSmileContext();


    /* ======================================================
       FIRST CONTACT EVENT

       ВАЖНО:

       Здесь используется ON, а не ONCE.

       Причина:
       resetMrSmileFirstContact() должен позволять
       тестировать First Contact повторно в рамках
       одной загрузки страницы.

       Сам runner защищён firstContactRunning +
       localStorage.
    ====================================================== */

    on(
        "mrsmile:firstContact",
        data => {

            synchronizeFirstContactState(data);

            void startFirstContact(data);

        }
    );


    /* ------------------------------------------------------
       OPERATOR — READ FILE
    ------------------------------------------------------ */

    on(
        "mrsmile:operatorReadFile",
        data => {

            handleOperatorReadFile(data);

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
   FIRST CONTACT STATE SYNCHRONIZATION
   ----------------------------------------------------------
   Гарантирует, что прямой вызов:

       window.triggerMrSmileFirstContact()

   проходит через тот же State/Presence flow, что и
   автоматический event path.
========================================================== */

function synchronizeFirstContactState(data = null) {

    /* ------------------------------------------------------
       MASTER STATE
    ------------------------------------------------------ */

    try {

        const state =
            window.MRSMILE_STATE?.get?.();

        if (
            state &&
            !state.firstContact &&
            typeof window.MRSMILE_STATE?.firstContact ===
                "function"
        ) {

            window.MRSMILE_STATE.firstContact(false);

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE] State synchronization failed:",
            error
        );
    }


    /* ------------------------------------------------------
       PRESENCE
    ------------------------------------------------------ */

    try {

        const presenceStatus =
            window.MRSMILE_PRESENCE?.status?.();

        const presenceState =
            presenceStatus?.state;

        if (
            presenceState &&
            !presenceState.firstContact &&
            typeof window.MRSMILE_PRESENCE?.firstContact ===
                "function"
        ) {

            /*
             * false = контакт произошёл,
             * но оператор ещё НЕ "accepted" MR.SMILE.
             */

            window.MRSMILE_PRESENCE.firstContact(false);

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE] Presence synchronization failed:",
            error
        );
    }


    /* ------------------------------------------------------
       DEBUG EVENT
    ------------------------------------------------------ */

    trigger(
        "mrsmile:firstContactStateSynchronized",
        {
            source:
                data?.source ||
                "event",

            timestamp:
                Date.now()
        }
    );
}


/* ==========================================================
   OPERATOR — READ FILE
   ----------------------------------------------------------
   TRUST ONLY

   Behavior НЕ вызывается здесь.

   Основной путь:

       Explorer
           ↓
       operatorAction
           ↓
       mrsmileContext
           ↓
       mrsmileBehavior
           ↓
       mrsmileActions
========================================================== */

function handleOperatorReadFile(data) {

    if (!data) {
        return;
    }

    const path =
        data.path || "";

    console.log(
        "[MR.SMILE] Operator read file:",
        path
    );


    /* ------------------------------------------------------
       TRUST
    ------------------------------------------------------ */

    if (
        path === "/files/entity_mrsmile.txt"
    ) {

        addTrust(
            2,
            `READ_SECRET: ${path}`
        );

    } else {

        addTrust(
            1,
            `READ_FILE: ${path}`
        );
    }
}


/* ==========================================================
   SYS_00 ACCEPTED
========================================================== */

function handleSys00Accepted() {

    if (sys00HandshakeArmed) {
        return;
    }

    if (sys00HandshakeTriggered) {
        return;
    }


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

    if (sys00HandshakeTriggered) {
        return;
    }

    sys00HandshakeTriggered = true;


    localStorage.setItem(
        "mrsmile_handshake",
        "1"
    );


    trigger(
        "mrsmile:handshakeDetected",
        {
            source: "sys00",
            timestamp: Date.now()
        }
    );


    await showHandshakeSequence();


    trigger(
        "mrsmile:handshakeAccepted",
        {
            source: "sys00",
            timestamp: Date.now()
        }
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


    if (overlay.parentNode) {
        overlay.remove();
    }


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

    if (integrityEventRunning) {
        return;
    }

    startOmegaIntegrityEvent();
}


/* ==========================================================
   OMEGA INTEGRITY EVENT
========================================================== */

async function startOmegaIntegrityEvent() {

    if (integrityEventRunning) {
        return;
    }


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

    if (falseRecoveryRunning) {
        return;
    }


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


        /*
         * ВАЖНО:

         * Не вызываем startFirstContact() напрямую.
         *
         * Мы создаём единый официальный event path.
         */

        trigger(
            "mrsmile:firstContact",
            {
                source: "sys00",
                type: "first_contact",
                timestamp: Date.now()
            }
        );

    } finally {

        falseRecoveryRunning = false;
    }
}


/* ==========================================================
   FIRST CONTACT — INTERNAL RUNNER
   ----------------------------------------------------------
   Единственная функция, которая реально выполняет
   последовательность First Contact.
========================================================== */

async function startFirstContact(data = null) {

    /* ------------------------------------------------------
       DUPLICATE GUARD
    ------------------------------------------------------ */

    if (firstContactRunning) {

        console.log(
            "[MR.SMILE] First Contact already running."
        );

        return;
    }


    /* ------------------------------------------------------
       PERSISTENT COMPLETION GUARD
    ------------------------------------------------------ */

    if (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1"
    ) {

        console.log(
            "[MR.SMILE] First Contact already completed."
        );

        return;
    }


    firstContactRunning = true;

    mrSmileReactionRunning = true;

    clearFirstContactTimers();


    try {

        console.log(
            "[MR.SMILE] Starting new OMEGA First Contact.",
            data
        );


        /* --------------------------------------------------
           EVENT
        -------------------------------------------------- */

        trigger(
            "mrsmile:firstContactStarted",
            {
                source:
                    data?.source ||
                    "event",

                type:
                    data?.type ||
                    "system_intrusion",

                timestamp:
                    Date.now()
            }
        );


        /* --------------------------------------------------
           VISUAL / SYSTEM INTRUSION

           Вся новая визуальная логика находится здесь:

               mrsmileAppearance.js

           Никаких legacy face/eyes phases.
        -------------------------------------------------- */

        await showMrSmileFirstContactFace(
            "presence"
        );


        /* --------------------------------------------------
           PROGRESS
        -------------------------------------------------- */

        try {

            evaluateProgress();

        } catch (error) {

            console.warn(
                "[MR.SMILE] Progress evaluation failed:",
                error
            );
        }


        /* --------------------------------------------------
           CHAT REVEAL
        -------------------------------------------------- */

        try {

            revealMrSmileChat();

        } catch (error) {

            console.warn(
                "[MR.SMILE] Chat reveal failed:",
                error
            );
        }


        /* --------------------------------------------------
           FIRST CONTACT CHAT MESSAGE
        -------------------------------------------------- */

        await sleep(700);


        try {

            playFirstContactMessage();

        } catch (error) {

            console.warn(
                "[MR.SMILE] First contact message failed:",
                error
            );
        }


        /* --------------------------------------------------
           PERSIST COMPLETION

           Флаг ставится только ПОСЛЕ успешного завершения
           основного intrusion sequence.
        -------------------------------------------------- */

        localStorage.setItem(
            "mrsmile_first_contact",
            "1"
        );


        /* --------------------------------------------------
           COMPLETED EVENT
        -------------------------------------------------- */

        trigger(
            "mrsmile:firstContactCompleted",
            {
                source:
                    data?.source ||
                    "mrsmile",

                type:
                    data?.type ||
                    "system_intrusion",

                timestamp:
                    Date.now()
            }
        );


        console.log(
            "[MR.SMILE] New First Contact completed."
        );


    } catch (error) {

        console.error(
            "[MR.SMILE] First Contact failed:",
            error
        );


        /*
         * ВАЖНО:

         * При ошибке НЕ устанавливаем
         * mrsmile_first_contact = 1.
         *
         * Благодаря этому First Contact можно
         * повторить после устранения ошибки.
         */

        trigger(
            "mrsmile:firstContactFailed",
            {
                source:
                    data?.source ||
                    "mrsmile",

                error:
                    error?.message ||
                    String(error),

                timestamp:
                    Date.now()
            }
        );


    } finally {

        cleanupFirstContact();

        mrSmileReactionRunning = false;

        firstContactRunning = false;
    }
}


/* ==========================================================
   PUBLIC FIRST CONTACT TRIGGER
   ----------------------------------------------------------
   ВАЖНО:

   Это НЕ запускает runner напрямую.

   Он создаёт событие.

   Поэтому:

       window.triggerMrSmileFirstContact()

   и:

       trigger("mrsmile:firstContact")

   используют один и тот же путь.
========================================================== */

export function triggerMrSmileFirstContact() {

    if (firstContactRunning) {

        console.log(
            "[MR.SMILE] First Contact is already running."
        );

        return;
    }


    if (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1"
    ) {

        console.log(
            "[MR.SMILE] First Contact already completed."
        );

        return;
    }


    trigger(
        "mrsmile:firstContact",
        {
            source: "manual",
            type: "debug",
            timestamp: Date.now()
        }
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


    trigger(
        "mrsmile:firstContactReset",
        {
            source: "debug",
            timestamp: Date.now()
        }
    );
}


/* ==========================================================
   AMBIENT EVENTS
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

    /* ------------------------------------------------------
       NEVER RUN DURING FIRST CONTACT
    ------------------------------------------------------ */

    if (firstContactRunning) {
        return;
    }


    /* ------------------------------------------------------
       ONLY AFTER FIRST CONTACT
    ------------------------------------------------------ */

    if (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) !== "1"
    ) {

        return;
    }


    /* ------------------------------------------------------
       OPERATOR REACTION HAS PRIORITY
    ------------------------------------------------------ */

    if (mrSmileReactionRunning) {
        return;
    }


    /* ------------------------------------------------------
       NO OVERLAPPING AMBIENT EVENTS
    ------------------------------------------------------ */

    if (ambientEventRunning) {
        return;
    }


    /* ------------------------------------------------------
       GLOBAL COOLDOWN
    ------------------------------------------------------ */

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
   LEGACY OPERATOR REACTION RUNNER
========================================================== */

async function runMrSmileOperatorReaction(
    reactionFunction
) {

    if (
        typeof reactionFunction !==
        "function"
    ) {

        return;
    }


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


    if (mrSmileReactionRunning) {
        return;
    }


    mrSmileReactionRunning = true;


    try {

        await reactionFunction();

    } catch (error) {

        console.warn(
            "[MR.SMILE] Operator reaction failed:",
            error
        );

    } finally {

        mrSmileReactionRunning = false;
    }
}


/* ==========================================================
   AMBIENT — IDLE
========================================================== */

async function ambientIdleEvent() {

    await sleep(
        randomBetween(
            400,
            1200
        )
    );


    await systemMessage(
        "OMEGA: background process check..."
    );


    await sleep(900);


    await systemMessage(
        "OMEGA: no irregularities detected."
    );
}


/* ==========================================================
   AMBIENT — OBSERVATION
========================================================== */

async function ambientObservationEvent() {

    const old =
        document.querySelector(
            "#mrSmileAmbientObservation"
        );


    if (old) {
        old.remove();
    }


    const trace =
        document.createElement("div");


    trace.id =
        "mrSmileAmbientObservation";


    trace.className =
        "mrSmileAmbientObservation";


    trace.textContent =
        "OBSERVED";


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


    await sleep(1200);


    trace.classList.add(
        "fade"
    );


    await sleep(900);


    if (trace.parentNode) {
        trace.remove();
    }
}


/* ==========================================================
   AMBIENT — NIGHT
========================================================== */

async function ambientNightEvent() {

    const chance =
        Math.random();


    if (chance < 0.5) {

        await systemMessage(
            "CLOCK SYNC: DELAYED"
        );


        await sleep(700);


        await systemMessage(
            "CLOCK SYNC: RESTORED"
        );


        return;
    }


    await systemMessage(
        "BACKGROUND MONITOR: ACTIVE"
    );


    await sleep(1000);


    await systemMessage(
        "BACKGROUND MONITOR: IDLE"
    );
}


/* ==========================================================
   AMBIENT — GLITCH
========================================================== */

async function ambientGlitchEvent() {

    const chance =
        Math.random();


    if (chance < 0.65) {

        document.body.classList.add(
            "mrSmileAmbientGlitch"
        );


        await sleep(
            randomBetween(
                180,
                400
            )
        );


        document.body.classList.remove(
            "mrSmileAmbientGlitch"
        );


        return;
    }


    await systemMessage(
        "INPUT CHANNEL: RESPONSE DELAYED"
    );


    await sleep(500);


    await systemMessage(
        "INPUT CHANNEL: NORMAL"
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


        if (mrSmileReactionRunning) {
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


        if (mrSmileReactionRunning) {
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


        if (mrSmileReactionRunning) {
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


        if (mrSmileReactionRunning) {
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

    if (!element) {
        return;
    }


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


    if (mrSmileReactionRunning) {
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


    if (mrSmileReactionRunning) {
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


    if (mrSmileReactionRunning) {
        return;
    }


    trigger(
        "mrsmile:nightEvent"
    );
}


/* ==========================================================
   DEBUG STATUS
========================================================== */

export function getMrSmileFirstContactStatus() {

    return {

        running,

        firstContactRunning,

        completed:
            localStorage.getItem(
                "mrsmile_first_contact"
            ) === "1",

        handshakeTriggered:
            sys00HandshakeTriggered,

        integrityEventRunning,

        ambientEventRunning
    };
}


/* ==========================================================
   GLOBAL DEBUG API
========================================================== */

window.triggerMrSmileFirstContact =
    triggerMrSmileFirstContact;


window.resetMrSmileFirstContact =
    resetMrSmileFirstContact;


window.MRSMILE_FIRST_CONTACT = {

    status:
        getMrSmileFirstContactStatus,

    start:
        triggerMrSmileFirstContact,

    reset:
        resetMrSmileFirstContact
};
