// =======================================
// MR.SMILE EVENT SYSTEM
// OMEGA — CENTRAL EVENT CONTROLLER
// =======================================

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


// =======================================
// STATE
// =======================================

let running = false;

let firstContactRunning = false;

let sys00HandshakeArmed = false;
let sys00HandshakeTriggered = false;

let integrityEventRunning = false;
let falseRecoveryRunning = false;


// =======================================
// INIT
// =======================================

export function initMrSmileEvents() {

    if (running) {
        console.log(
            "[MR.SMILE EVENTS] Already running."
        );
        return;
    }

    running = true;

    loadTrust();

    console.log(
        "[MR.SMILE EVENTS] Started."
    );


    // -----------------------------------
    // BACKGROUND SYSTEMS
    // -----------------------------------

    nightLoop();
    glitchLoop();
    idleLoop();
    observationLoop();

    initMrSmileProgress();


    // -----------------------------------
    // FIRST CONTACT
    // -----------------------------------

    once(
        "mrsmile:firstContact",
        triggerFirstContact
    );


    // -----------------------------------
    // SYS_00
    // -----------------------------------

    on(
        "mrsmile:sys00Accepted",
        handleSys00Accepted
    );


    // -----------------------------------
    // HANDSHAKE
    // -----------------------------------

    on(
        "mrsmile:handshakeAccepted",
        handleHandshakeAccepted
    );
}


// =======================================
// SYS_00 ACCEPTED
// =======================================

function handleSys00Accepted() {

    console.log(
        "[MR.SMILE] SYS_00 accepted."
    );

    sys00HandshakeArmed = true;

    console.log(
        "[MR.SMILE] SYS_00 channel active."
    );


    setTimeout(() => {

        triggerSys00Handshake();

    }, 1500);
}


// =======================================
// SYS_00 HANDSHAKE
// =======================================

function triggerSys00Handshake() {

    if (!sys00HandshakeArmed)
        return;

    if (sys00HandshakeTriggered)
        return;


    // -----------------------------------
    // PERSISTENT CHECK
    // -----------------------------------

    if (
        localStorage.getItem(
            "mrsmile_handshake"
        ) === "1"
    ) {

        sys00HandshakeTriggered = true;

        console.log(
            "[MR.SMILE] Handshake already completed."
        );

        return;
    }


    sys00HandshakeTriggered = true;


    console.log(
        "[MR.SMILE] UNKNOWN HANDSHAKE DETECTED."
    );


    localStorage.setItem(
        "mrsmile_handshake",
        "1"
    );


    trigger(
        "mrsmile:handshakeDetected"
    );


    showHandshakeSequence();
}


// =======================================
// HANDSHAKE SEQUENCE
// =======================================

async function showHandshakeSequence() {

    typeSystemMessage(
        "SYSTEM NOTICE: Unauthorized handshake detected."
    );

    await sleep(900);


    typeSystemMessage(
        "CHANNEL: SYS_00"
    );

    await sleep(600);


    typeSystemMessage(
        "SOURCE: UNKNOWN"
    );

    await sleep(700);


    glitch(
        "screenGlitch",
        300
    );

    await sleep(500);


    typeSystemMessage(
        "CONNECTION STATUS: ACTIVE"
    );

    await sleep(900);


    typeSystemMessage(
        "REMOTE HANDSHAKE ACCEPTED."
    );


    console.log(
        "[MR.SMILE] HANDSHAKE ACCEPTED."
    );


    trigger(
        "mrsmile:handshakeAccepted"
    );
}


// =======================================
// HANDSHAKE → OMEGA INTEGRITY
// =======================================

function handleHandshakeAccepted() {

    if (integrityEventRunning)
        return;

    console.log(
        "[MR.SMILE] Preparing OMEGA intrusion..."
    );

    startOmegaIntegrityEvent();
}


// =======================================
// OMEGA INTEGRITY FAILURE
// =======================================

async function startOmegaIntegrityEvent() {

    if (integrityEventRunning)
        return;

    integrityEventRunning = true;


    console.log(
        "[MR.SMILE] OMEGA integrity event started."
    );


    try {

        await sleep(1200);

        typeSystemMessage(
            "SYSTEM INTEGRITY: 99.8%"
        );


        await sleep(900);

        typeSystemMessage(
            "SYSTEM INTEGRITY: 99.6%"
        );


        await sleep(900);

        typeSystemMessage(
            "SYSTEM INTEGRITY: 99.3%"
        );


        await sleep(700);

        typeSystemMessage(
            "UNKNOWN PROCESS DETECTED."
        );


        await sleep(1200);


        glitch(
            "screenGlitch",
            350
        );


        await sleep(700);


        typeSystemMessage(
            "PROCESS TERMINATED."
        );


        await sleep(1000);


        typeSystemMessage(
            "SYSTEM INTEGRITY: NORMAL"
        );


        console.log(
            "[MR.SMILE] OMEGA integrity event complete."
        );


        startOmegaFalseRecovery();

    } finally {

        integrityEventRunning = false;
    }
}


// =======================================
// FALSE RECOVERY
// =======================================

async function startOmegaFalseRecovery() {

    if (falseRecoveryRunning)
        return;

    falseRecoveryRunning = true;


    try {

        await sleep(2500);


        typeSystemMessage(
            "BACKGROUND PROCESS: 1 UNKNOWN"
        );


        await sleep(1200);


        typeSystemMessage(
            "BACKGROUND PROCESS: 0 UNKNOWN"
        );


        await sleep(1800);


        typeSystemMessage(
            "SYSTEM INTEGRITY: NORMAL"
        );


        await sleep(3000);


        console.log(
            "[MR.SMILE] False recovery complete."
        );


        // -----------------------------------
        // NOW THE REAL EVENT STARTS
        // -----------------------------------

        trigger(
            "mrsmile:firstContact"
        );

    } finally {

        falseRecoveryRunning = false;
    }
}


// =======================================
// FIRST CONTACT
// =======================================

async function triggerFirstContact() {

    if (firstContactRunning)
        return;


    // -----------------------------------
    // ALREADY COMPLETED
    // -----------------------------------

    if (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1"
    ) {

        console.log(
            "[MR.SMILE] First contact already completed."
        );

        return;
    }


    firstContactRunning = true;


    console.log(
        "[MR.SMILE] ================================="
    );

    console.log(
        "[MR.SMILE] FIRST CONTACT STARTED"
    );

    console.log(
        "[MR.SMILE] ================================="
    );


    try {

        // ===================================
        // GLOBAL LOCK
        // ===================================

        document.body.classList.add(
            "mrSmileFirstContact"
        );


        // ===================================
        // PHASE 1
        // INTERRUPTION
        // ===================================

        await phaseInterruption();


        // ===================================
        // PHASE 2
        // CORRUPTION
        // ===================================

        await phaseCorruption();


        // ===================================
        // PHASE 3
        // PRESENCE
        // ===================================

        await phasePresence();


        // ===================================
        // PHASE 4
        // INTRUSION
        // ===================================

        await phaseIntrusion();


        // ===================================
        // PHASE 5
        // COLLAPSE
        // ===================================

        await phaseCollapse();


        // ===================================
        // PHASE 6
        // SILENCE
        // ===================================

        await phaseSilence();


        // ===================================
        // RECOVERY
        // ===================================

        await finishFirstContact();


    } catch (error) {

        console.error(
            "[MR.SMILE] FIRST CONTACT ERROR:",
            error
        );

    } finally {

        cleanupFirstContact();

        firstContactRunning = false;


        console.log(
            "[MR.SMILE] FIRST CONTACT SEQUENCE ENDED."
        );
    }
}


// =======================================
// PHASE 1 — INTERRUPTION
// =======================================

async function phaseInterruption() {

    console.log(
        "[MR.SMILE] PHASE 1 — INTERRUPTION"
    );


    document.body.classList.add(
        "mrSmilePhase1"
    );


    await sleep(1000);


    flash(
        "mrSmileFlash",
        120
    );


    await sleep(1800);


    microGlitch();


    await sleep(1200);


    flash(
        "mrSmileFlash",
        80
    );


    await sleep(2200);


    document.body.classList.remove(
        "mrSmilePhase1"
    );
}


// =======================================
// PHASE 2 — CORRUPTION
// =======================================

async function phaseCorruption() {

    console.log(
        "[MR.SMILE] PHASE 2 — CORRUPTION"
    );


    document.body.classList.add(
        "mrSmilePhase2"
    );


    await sleep(1500);


    document.body.classList.add(
        "mrSmileDistortion"
    );


    await sleep(2200);


    document.body.classList.remove(
        "mrSmileDistortion"
    );


    await sleep(800);


    document.body.classList.add(
        "mrSmileTextCorruption"
    );


    await sleep(1800);


    document.body.classList.remove(
        "mrSmileTextCorruption"
    );


    await sleep(1800);


    document.body.classList.remove(
        "mrSmilePhase2"
    );
}


// =======================================
// PHASE 3 — PRESENCE
// =======================================

async function phasePresence() {

    console.log(
        "[MR.SMILE] PHASE 3 — PRESENCE"
    );


    document.body.classList.add(
        "mrSmilePhase3"
    );


    await sleep(1300);


    // -----------------------------------
    // BLACKOUT
    // -----------------------------------

    document.body.classList.add(
        "mrSmileBlackout"
    );


    await sleep(900);


    // -----------------------------------
    // FIRST APPEARANCE
    // -----------------------------------

    console.log(
        "[MR.SMILE] First visual manifestation."
    );


    await showMrSmileFirstContactFace(
        "presence"
    );


    document.body.classList.remove(
        "mrSmileBlackout"
    );


    await sleep(1100);


    // -----------------------------------
    // SHORT ECHO
    // -----------------------------------

    document.body.classList.add(
        "mrSmileBlackout"
    );


    await sleep(400);


    console.log(
        "[MR.SMILE] Visual echo detected."
    );


    await showMrSmileFirstContactFace(
        "echo"
    );


    document.body.classList.remove(
        "mrSmileBlackout"
    );


    await sleep(700);


    document.body.classList.remove(
        "mrSmilePhase3"
    );
}


// =======================================
// PHASE 4 — INTRUSION
// =======================================

async function phaseIntrusion() {

    console.log(
        "[MR.SMILE] PHASE 4 — INTRUSION"
    );


    document.body.classList.add(
        "mrSmilePhase4"
    );


    await sleep(1200);


    severeGlitch(
        2400
    );


    await sleep(700);


    hardShake(
        1600
    );


    await sleep(1200);


    severeGlitch(
        1700
    );


    await sleep(900);


    document.body.classList.remove(
        "mrSmilePhase4"
    );
}


// =======================================
// PHASE 5 — COLLAPSE
// =======================================

async function phaseCollapse() {

    console.log(
        "[MR.SMILE] PHASE 5 — COLLAPSE"
    );


    document.body.classList.add(
        "mrSmilePhase5"
    );


    await sleep(900);


    severeGlitch(
        4200
    );


    await sleep(600);


    // -----------------------------------
    // BLACKOUT PULSES
    // -----------------------------------

    await blackoutPulse(500);

    await sleep(300);

    await blackoutPulse(700);


    await sleep(1200);


    document.body.classList.remove(
        "mrSmilePhase5"
    );
}


// =======================================
// PHASE 6 — SILENCE
// =======================================

async function phaseSilence() {

    console.log(
        "[MR.SMILE] PHASE 6 — SILENCE"
    );


    document.body.classList.add(
        "mrSmilePhase6"
    );


    await sleep(1500);


    document.body.classList.add(
        "mrSmileFinalDarkness"
    );


    await sleep(3000);


    // -----------------------------------
    // FINAL FACE
    // -----------------------------------

    console.log(
        "[MR.SMILE] Final visual manifestation."
    );


    await showMrSmileFirstContactFace(
        "silence"
    );


    document.body.classList.remove(
        "mrSmileFinalDarkness"
    );


    await sleep(700);


    document.body.classList.remove(
        "mrSmilePhase6"
    );
}


// =======================================
// FINISH FIRST CONTACT
// =======================================

async function finishFirstContact() {

    console.log(
        "[MR.SMILE] OMEGA recovery initiated."
    );


    // -----------------------------------
    // REMOVE GLOBAL EVENT STATE
    // -----------------------------------

    cleanupFirstContact();


    // -----------------------------------
    // SAVE FIRST CONTACT
    // -----------------------------------

    localStorage.setItem(
        "mrsmile_first_contact",
        "1"
    );


    evaluateProgress();


    console.log(
        "[MR.SMILE] First contact saved."
    );


    // -----------------------------------
    // FALSE NORMALITY
    // -----------------------------------

    await sleep(2500);


    // -----------------------------------
    // MR.SMILE CHAT APPEARS
    // -----------------------------------

    console.log(
        "[MR.SMILE] Revealing MR.SMILE chat."
    );


    revealMrSmileChat();


    await playFirstContactMessage();


    // -----------------------------------
    // FINAL INTERFACE MANIFESTATION
    // -----------------------------------

    await sleep(1200);


    console.log(
        "[MR.SMILE] Starting full interface manifestation."
    );


    await triggerMrSmileManifestation();


    console.log(
        "[MR.SMILE] ================================="
    );

    console.log(
        "[MR.SMILE] FIRST CONTACT COMPLETE"
    );

    console.log(
        "[MR.SMILE] ================================="
    );
}


// =======================================
// CLEANUP
// =======================================

function cleanupFirstContact() {

    const classes = [

        "mrSmileFirstContact",

        "mrSmilePhase1",
        "mrSmilePhase2",
        "mrSmilePhase3",
        "mrSmilePhase4",
        "mrSmilePhase5",
        "mrSmilePhase6",

        "mrSmileFlash",
        "mrSmileMicroGlitch",

        "mrSmileDistortion",
        "mrSmileTextCorruption",

        "mrSmileBlackout",
        "mrSmileSevereGlitch",
        "mrSmileHardShake",

        "mrSmileFinalDarkness"
    ];


    classes.forEach(
        className => {

            document.body.classList.remove(
                className
            );

        }
    );
}


// =======================================
// NIGHT EVENTS
// =======================================

function nightLoop() {

    setInterval(() => {

        const hour =
            new Date().getHours();


        if (
            hour >= 22 ||
            hour <= 5
        ) {

            if (
                Math.random() < 0.20
            ) {

                typeSystemMessage(
                    pick([

                        "Unusual activity detected.",

                        "Someone is moving.",

                        "Security cameras lost signal.",

                        "An unknown process has awakened."

                    ])
                );
            }
        }

    }, 30000);
}


// =======================================
// RANDOM GLITCH
// =======================================

function glitchLoop() {

    setInterval(() => {

        // Don't interrupt First Contact.
        if (firstContactRunning)
            return;


        if (
            Math.random() > 0.08
        )
            return;


        glitch(
            "screenGlitch",
            250
        );


        typeSystemMessage(
            pick([

                "Signal unstable.",

                "Connection interrupted.",

                "Data corruption detected.",

                "Unknown interference."

            ])
        );

    }, 45000);
}


// =======================================
// PLAYER OBSERVATION
// =======================================

function observationLoop() {

    setInterval(() => {

        const memory =
            getMemory();


        if (!memory)
            return;


        let openedFiles = [];


        // -----------------------------------
        // SUPPORT BOTH MEMORY FORMATS
        // -----------------------------------

        if (
            Array.isArray(memory)
        ) {

            openedFiles =
                memory.filter(
                    entry =>
                        entry &&
                        (
                            entry.type === "file_opened" ||
                            entry.type === "openedFile"
                        )
                );

        } else if (
            Array.isArray(
                memory.openedFiles
            )
        ) {

            openedFiles =
                memory.openedFiles;
        }


        if (
            openedFiles.length <= 5
        )
            return;


        if (
            Math.random() < 0.25
        ) {

            typeSystemMessage(
                "MR.SMILE: You seem interested in our archives."
            );
        }

    }, 60000);
}


// =======================================
// IDLE
// =======================================

function idleLoop() {

    setInterval(() => {

        if (firstContactRunning)
            return;


        if (
            Math.random() > 0.12
        )
            return;


        const trust =
            getTrust();


        if (trust > 70) {

            typeSystemMessage(
                "MR.SMILE: I was wondering when you would return."
            );

        } else {

            typeSystemMessage(
                "..."
            );
        }

    }, 90000);
}


// =======================================
// MANUAL FIRST CONTACT API
// =======================================

export function triggerMrSmileFirstContact() {

    if (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1"
    ) {

        console.log(
            "[MR.SMILE] First contact already completed."
        );

        return;
    }


    if (firstContactRunning) {

        console.log(
            "[MR.SMILE] First contact is already running."
        );

        return;
    }


    console.log(
        "[MR.SMILE] Manual First Contact trigger."
    );


    trigger(
        "mrsmile:firstContact"
    );
}


// =======================================
// RESET — DEBUG ONLY
// =======================================

export function resetMrSmileFirstContact() {

    localStorage.removeItem(
        "mrsmile_first_contact"
    );


    console.log(
        "[MR.SMILE] First contact reset."
    );
}


// =======================================
// RESET COMPLETE MR.SMILE EVENT STATE
// DEBUG ONLY
// =======================================

export function resetMrSmileEventState() {

    localStorage.removeItem(
        "mrsmile_first_contact"
    );

    localStorage.removeItem(
        "mrsmile_handshake"
    );


    sys00HandshakeArmed = false;
    sys00HandshakeTriggered = false;

    integrityEventRunning = false;
    falseRecoveryRunning = false;
    firstContactRunning = false;


    console.log(
        "[MR.SMILE] Complete event state reset."
    );
}


// =======================================
// VISUAL HELPERS
// =======================================

function glitch(
    className,
    duration
) {

    document.body.classList.add(
        className
    );


    setTimeout(() => {

        document.body.classList.remove(
            className
        );

    }, duration);
}


// =======================================
// FLASH
// =======================================

function flash(
    className,
    duration
) {

    document.body.classList.add(
        className
    );


    setTimeout(() => {

        document.body.classList.remove(
            className
        );

    }, duration);
}


// =======================================
// MICRO GLITCH
// =======================================

function microGlitch() {

    flash(
        "mrSmileMicroGlitch",
        450
    );
}


// =======================================
// SEVERE GLITCH
// =======================================

function severeGlitch(
    duration
) {

    return new Promise(
        resolve => {

            document.body.classList.add(
                "mrSmileSevereGlitch"
            );


            setTimeout(() => {

                document.body.classList.remove(
                    "mrSmileSevereGlitch"
                );


                resolve();

            }, duration);
        }
    );
}


// =======================================
// HARD SHAKE
// =======================================

function hardShake(
    duration
) {

    return new Promise(
        resolve => {

            document.body.classList.add(
                "mrSmileHardShake"
            );


            setTimeout(() => {

                document.body.classList.remove(
                    "mrSmileHardShake"
                );


                resolve();

            }, duration);
        }
    );
}


// =======================================
// BLACKOUT PULSE
// =======================================

function blackoutPulse(
    duration
) {

    return new Promise(
        resolve => {

            document.body.classList.add(
                "mrSmileBlackout"
            );


            setTimeout(() => {

                document.body.classList.remove(
                    "mrSmileBlackout"
                );


                resolve();

            }, duration);
        }
    );
}


// =======================================
// HELPERS
// =======================================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


function pick(arr) {

    return arr[
        Math.floor(
            Math.random() * arr.length
        )
    ];
}
