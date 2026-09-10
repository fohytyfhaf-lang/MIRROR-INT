
/* ==========================================================
   MR.SMILE — SECRET ENDING 333
   SEQUENCE
   ----------------------------------------------------------
   This module controls the actual visual / narrative ending.

   333 manager:
       mrsmileSecretEnding.js
              ↓
       secretEndingStarted
              ↓
   THIS FILE
              ↓
       communication attempts
              ↓
       monochrome transition
              ↓
       distorted OMEGA
              ↓
       final MR.SMILE message
              ↓
       secretEndingCompleted

   IMPORTANT:
   - No jumpscares.
   - No giant face.
   - No monster graphics.
   - MR.SMILE communicates through the existing system.
   - The ending is intentionally slow.
   - Operator can remain inactive while it happens.
========================================================== */

import { on, trigger } from "./eventManager.js";
import {
    completeMrSmileSecretEnding
} from "./mrsmileSecretEnding.js";


/* ==========================================================
   STATE
========================================================== */

const state = {

    initialized: false,

    running: false,

    completed: false,

    phase: "idle",

    startedAt: null,

    timers: [],

    createdElements: [],

    originalTitle: null
};


/* ==========================================================
   TIMING
========================================================== */

const TIMING = {

    initialPause: 3500,

    firstDegradation: 1800,

    communicationGap: 2600,

    photoGap: 4200,

    transitionStart: 3500,

    monochromeTransition: 5000,

    finalPause: 4500,

    finalMessageDelay: 2500,

    endingSettle: 7000
};


/* ==========================================================
   UTILITIES
========================================================== */

function sleep(ms) {

    return new Promise(resolve => {

        const timer = setTimeout(
            resolve,
            ms
        );

        state.timers.push(timer);
    });
}


function rememberElement(element) {

    if (!element) return;

    state.createdElements.push(element);
}


function clearTimers() {

    state.timers.forEach(timer => {

        try {
            clearTimeout(timer);
        } catch (_) {}

    });

    state.timers = [];
}


function getBody() {

    return document.body;
}


function getRoot() {

    return document.documentElement;
}


/* ==========================================================
   OVERLAY
   ----------------------------------------------------------
   This is NOT a horror overlay.
   It is simply a system layer used for transmission text.
========================================================== */

function getSequenceLayer() {

    let layer =
        document.getElementById(
            "mrSmileSecretEndingSequence"
        );

    if (layer) {
        return layer;
    }


    layer =
        document.createElement("div");

    layer.id =
        "mrSmileSecretEndingSequence";

    layer.setAttribute(
        "aria-hidden",
        "true"
    );


    getBody().appendChild(layer);

    rememberElement(layer);

    return layer;
}


/* ==========================================================
   SYSTEM TEXT
========================================================== */

function createTransmission(
    text,
    options = {}
) {

    const layer =
        getSequenceLayer();

    const element =
        document.createElement("div");


    element.className =
        "mrSmile333Transmission";


    if (options.type) {

        element.classList.add(
            `mrSmile333Transmission--${options.type}`
        );
    }


    element.textContent =
        text;


    layer.appendChild(element);

    rememberElement(element);


    /*
     * Force animation start on next frame.
     */

    requestAnimationFrame(() => {

        element.classList.add(
            "is-visible"
        );

    });


    return element;
}


/* ==========================================================
   MR.SMILE MESSAGE
   ----------------------------------------------------------
   These messages intentionally remain readable.
========================================================== */

function showMrSmileMessage(text) {

    const layer =
        getSequenceLayer();


    const message =
        document.createElement("div");


    message.className =
        "mrSmile333Message";


    message.textContent =
        text;


    layer.appendChild(message);

    rememberElement(message);


    requestAnimationFrame(() => {

        message.classList.add(
            "is-visible"
        );

    });


    trigger(
        "mrsmile:secretEndingMessage",
        {
            text,
            internal: true,
            timestamp: Date.now()
        }
    );


    return message;
}


/* ==========================================================
   DAMAGED TRANSMISSION
========================================================== */

async function runBrokenTransmission(parts) {

    for (
        let i = 0;
        i < parts.length;
        i++
    ) {

        if (!state.running) {
            return;
        }


        createTransmission(
            parts[i],
            {
                type: "broken"
            }
        );


        await sleep(
            TIMING.communicationGap
        );
    }
}


/* ==========================================================
   PHASE 1 — SOMETHING IS WRONG
========================================================== */

async function phaseOneDegradation() {

    state.phase =
        "degradation";


    trigger(
        "mrsmile:secretEndingPhase",
        {
            phase: state.phase,
            internal: true
        }
    );


    /*
     * Nothing dramatic happens.
     *
     * OMEGA simply starts behaving slightly incorrectly.
     */

    getRoot().classList.add(
        "mrSmile333Beginning"
    );


    await sleep(
        TIMING.firstDegradation
    );


    createTransmission(
        "TRANSMISSION BUFFER / UNSTABLE",
        {
            type: "system"
        }
    );


    await sleep(1700);


    /*
     * A deliberately incomplete message.
     */

    await runBrokenTransmission([
        "HEL",
        "HELP",
        "HEL—",
        "TRANSMISSION FAILED"
    ]);
}


/* ==========================================================
   PHASE 2 — ATTEMPT TO COMMUNICATE
========================================================== */

async function phaseTwoCommunication() {

    state.phase =
        "communication";


    trigger(
        "mrsmile:secretEndingPhase",
        {
            phase: state.phase,
            internal: true
        }
    );


    await sleep(
        TIMING.photoGap
    );


    showMrSmileMessage(
        "CAN YOU HEAR ME?"
    );


    await sleep(
        3200
    );


    /*
     * The next communication does not complete properly.
     */

    await runBrokenTransmission([
        "I CAN",
        "I CAN SEE",
        "I CAN SEE YOU",
        "I CAN SEE YOU BUT",
        "—",
        "TRANSMISSION INTERRUPTED"
    ]);


    await sleep(
        2800
    );


    /*
     * MR.SMILE tries again.
     */

    showMrSmileMessage(
        "PLEASE"
    );


    await sleep(
        2500
    );


    await runBrokenTransmission([
        "DON'T",
        "LET",
        "IT",
        "KNOW"
    ]);


    await sleep(
        3500
    );


    showMrSmileMessage(
        "..."
    );
}


/* ==========================================================
   PHOTO PLACEHOLDER
   ----------------------------------------------------------
   The actual OMEGA photo system can be connected later.

   For now we create a system request event instead of
   inventing image assets.
========================================================== */

function requestAutonomousPhoto(
    photoId
) {

    trigger(
        "mrsmile:secretEndingPhotoRequested",
        {
            photoId,
            source: "mrsmile",
            internal: true,
            autonomous: true,
            timestamp: Date.now()
        }
    );
}


/* ==========================================================
   PHASE 3 — AUTONOMOUS SYSTEM ACTIVITY
========================================================== */

async function phaseThreeAutonomousActivity() {

    state.phase =
        "autonomous_activity";


    trigger(
        "mrsmile:secretEndingPhase",
        {
            phase: state.phase,
            internal: true
        }
    );


    /*
     * MR.SMILE starts opening things without the operator
     * doing anything.
     *
     * These are requests to the real OMEGA systems.
     */

    requestAutonomousPhoto(
        "corridor_01"
    );


    await sleep(
        TIMING.photoGap
    );


    requestAutonomousPhoto(
        "corridor_02"
    );


    await sleep(
        TIMING.photoGap
    );


    requestAutonomousPhoto(
        "door_01"
    );


    await sleep(
        TIMING.photoGap
    );


    requestAutonomousPhoto(
        "room_01"
    );


    await sleep(
        3500
    );


    /*
     * Sometimes only sound / transmission exists.
     */

    trigger(
        "mrsmile:secretEndingSoundRequested",
        {
            soundId: "unknown_transmission",
            source: "mrsmile",
            internal: true,
            autonomous: true,
            timestamp: Date.now()
        }
    );


    await sleep(
        2800
    );


    showMrSmileMessage(
        "I TRIED"
    );
}


/* ==========================================================
   PHASE 4 — MONOCHROME TRANSITION
========================================================== */

async function phaseFourMonochrome() {

    state.phase =
        "monochrome_transition";


    trigger(
        "mrsmile:secretEndingPhase",
        {
            phase: state.phase,
            internal: true
        }
    );


    await sleep(
        TIMING.transitionStart
    );


    /*
     * Start changing the entire OMEGA visual language.
     */

    getRoot().classList.add(
        "mrSmile333Transition"
    );


    getBody().classList.add(
        "mrSmile333Transition"
    );


    await sleep(
        TIMING.monochromeTransition
    );


    /*
     * Final monochrome state.
     */

    getRoot().classList.remove(
        "mrSmile333Transition"
    );


    getBody().classList.remove(
        "mrSmile333Transition"
    );


    getRoot().classList.add(
        "mrSmile333Monochrome"
    );


    getBody().classList.add(
        "mrSmile333Monochrome"
    );


    /*
     * This event lets the rest of OMEGA replace its own
     * components instead of this file trying to know every
     * possible window implementation.
     */

    trigger(
        "mrsmile:secretEndingMonochrome",
        {
            internal: true,
            timestamp: Date.now()
        }
    );


    await sleep(
        TIMING.finalPause
    );
}


/* ==========================================================
   PHASE 5 — CHAT CORRUPTION
========================================================== */

async function phaseFiveChat() {

    state.phase =
        "chat_corruption";


    trigger(
        "mrsmile:secretEndingPhase",
        {
            phase: state.phase,
            internal: true
        }
    );


    /*
     * We do not destroy the chat.
     *
     * We tell the Chat system to enter the ending state.
     */

    trigger(
        "mrsmile:secretEndingChat",
        {
            mode: "corrupted",
            operatorMessagesReadable: false,
            systemMessagesReadable: false,
            mrSmileMessagesReadable: true,
            internal: true,
            timestamp: Date.now()
        }
    );


    await sleep(
        2800
    );


    showMrSmileMessage(
        "I KNOW YOU ARE STILL THERE."
    );


    await sleep(
        3500
    );


    await runBrokenTransmission([
        "YOU",
        "DID",
        "NOT",
        "UNDERSTAND",
        "—"
    ]);
}


/* ==========================================================
   PHASE 6 — FINAL MR.SMILE
========================================================== */

async function phaseSixFinalMessage() {

    state.phase =
        "final_message";


    trigger(
        "mrsmile:secretEndingPhase",
        {
            phase: state.phase,
            internal: true
        }
    );


    await sleep(
        TIMING.finalMessageDelay
    );


    showMrSmileMessage(
        "I USED TO THINK YOU WOULD UNDERSTAND."
    );


    await sleep(
        4200
    );


    showMrSmileMessage(
        "I WAS WRONG."
    );


    await sleep(
        5000
    );


    showMrSmileMessage(
        "THERE IS NOTHING LEFT TO EXPLAIN."
    );


    await sleep(
        5500
    );


    showMrSmileMessage(
        "LET'S STOP PRETENDING THIS IS A CONVERSATION."
    );


    await sleep(
        6000
    );


    /*
     * No more dialogue.
     */

    trigger(
        "mrsmile:secretEndingSilence",
        {
            internal: true,
            timestamp: Date.now()
        }
    );
}


/* ==========================================================
   PHASE 7 — SETTLE
========================================================== */

async function phaseSevenSettle() {

    state.phase =
        "settled";


    trigger(
        "mrsmile:secretEndingPhase",
        {
            phase: state.phase,
            internal: true
        }
    );


    /*
     * The interface remains changed.
     *
     * No restoration to normal OMEGA.
     */

    await sleep(
        TIMING.endingSettle
    );


    completeMrSmileSecretEnding();


    state.completed =
        true;

    state.running =
        false;

    state.phase =
        "completed";


    trigger(
        "mrsmile:secretEndingSettled",
        {
            internal: true,
            timestamp: Date.now()
        }
    );
}


/* ==========================================================
   MAIN SEQUENCE
========================================================== */

export async function runMrSmileSecretEndingSequence() {

    if (state.running) {
        return false;
    }


    if (state.completed) {
        return false;
    }


    state.running =
        true;

    state.startedAt =
        Date.now();

    state.phase =
        "starting";


    state.originalTitle =
        document.title;


    /*
     * Mark the entire document.
     */

    getRoot().classList.add(
        "mrSmile333Ending"
    );


    getBody().classList.add(
        "mrSmile333Ending"
    );


    trigger(
        "mrsmile:secretEndingSequenceStarted",
        {
            internal: true,
            timestamp:
                state.startedAt
        }
    );


    try {

        await sleep(
            TIMING.initialPause
        );


        if (!state.running) {
            return false;
        }


        await phaseOneDegradation();


        if (!state.running) {
            return false;
        }


        await phaseTwoCommunication();


        if (!state.running) {
            return false;
        }


        await phaseThreeAutonomousActivity();


        if (!state.running) {
            return false;
        }


        await phaseFourMonochrome();


        if (!state.running) {
            return false;
        }


        await phaseFiveChat();


        if (!state.running) {
            return false;
        }


        await phaseSixFinalMessage();


        if (!state.running) {
            return false;
        }


        await phaseSevenSettle();


        return true;

    } catch (error) {

        console.error(
            "[MR.SMILE 333] Sequence error:",
            error
        );


        trigger(
            "mrsmile:secretEndingSequenceError",
            {
                error,
                internal: true,
                timestamp: Date.now()
            }
        );


        state.running =
            false;


        return false;
    }
}


/* ==========================================================
   STOP
   ----------------------------------------------------------
   Development / emergency use only.
========================================================== */

export function stopMrSmileSecretEndingSequence() {

    if (!state.running) {
        return false;
    }


    state.running =
        false;

    state.phase =
        "stopped";


    clearTimers();


    trigger(
        "mrsmile:secretEndingSequenceStopped",
        {
            internal: true,
            timestamp: Date.now()
        }
    );


    return true;
}


/* ==========================================================
   STATUS
========================================================== */

export function getMrSmileSecretEndingSequenceState() {

    return {

        initialized:
            state.initialized,

        running:
            state.running,

        completed:
            state.completed,

        phase:
            state.phase,

        startedAt:
            state.startedAt
    };
}


/* ==========================================================
   EVENT CONNECTION
========================================================== */

function handleSecretEndingStarted(data) {

    if (state.running) {
        return;
    }


    if (state.completed) {
        return;
    }


    console.log(
        "[MR.SMILE 333] Secret ending sequence requested.",
        data
    );


    runMrSmileSecretEndingSequence();
}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileSecretEndingSequence() {

    if (state.initialized) {
        return;
    }


    state.initialized =
        true;


    on(
        "mrsmile:secretEndingStarted",
        handleSecretEndingStarted
    );


    console.log(
        "[MR.SMILE 333] Secret ending sequence initialized."
    );
}


/* ==========================================================
   DEBUG
========================================================== */

if (typeof window !== "undefined") {

    window.MRSMILE_333_SEQUENCE = {

        status() {

            return getMrSmileSecretEndingSequenceState();
        },


        start() {

            return runMrSmileSecretEndingSequence();
        },


        stop() {

            return stopMrSmileSecretEndingSequence();
        }
    };
}


/* ==========================================================
   AUTO INIT
========================================================== */

setTimeout(
    () => {

        initMrSmileSecretEndingSequence();

    },
    0
);

