// =======================================
// MR.SMILE EVENT SYSTEM
// =======================================

import {
    typeSystemMessage,
    playFirstContactMessage
} from "./mrsmileChat.js";

import { getTrust } from "./mrsmileTrust.js";
import { getMemory } from "./mrsmileMemory.js";
import { revealMrSmileChat } from "./chats.js";

import {
    on,
    once,
    trigger
} from "./eventManager.js";

let running = false;
let firstContactRunning = false;


// =======================================
// INIT
// =======================================

export function initMrSmileEvents() {

    if (running) return;

    running = true;

    console.log("[MR.SMILE EVENTS] Started");

    nightLoop();
    glitchLoop();
    idleLoop();
    observationLoop();

    once(
        "mrsmile:firstContact",
        triggerFirstContact
    );


    // ===================================
    // FIRST CONTACT EVENT
    // ===================================

   
once("mrsmile:firstContact", triggerFirstContact);
    
}


// =======================================
// FIRST CONTACT
// =======================================

async function triggerFirstContact() {

    if (firstContactRunning) return;

    if (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1"
    ) {

        console.log(
            "[MR.SMILE] First contact already completed"
        );

        return;

    }

    firstContactRunning = true;

    console.log(
        "[MR.SMILE] FIRST CONTACT STARTED"
    );


    // ===================================
    // GLOBAL LOCK
    // ===================================

    document.body.classList.add(
        "mrSmileFirstContact"
    );


    // ===================================
    // PHASE 1
    // 0–10 SEC
    // INTERRUPTION
    // ===================================

    console.log(
        "[MR.SMILE] PHASE 1 — INTERRUPTION"
    );

    document.body.classList.add(
        "mrSmilePhase1"
    );

    await sleep(1000);

    document.body.classList.add(
        "mrSmileFlash"
    );

    await sleep(120);

    document.body.classList.remove(
        "mrSmileFlash"
    );

    await sleep(1800);

    document.body.classList.add(
        "mrSmileMicroGlitch"
    );

    await sleep(450);

    document.body.classList.remove(
        "mrSmileMicroGlitch"
    );

    await sleep(1200);

    document.body.classList.add(
        "mrSmileFlash"
    );

    await sleep(80);

    document.body.classList.remove(
        "mrSmileFlash"
    );

    await sleep(2200);

    document.body.classList.remove(
        "mrSmilePhase1"
    );


    // ===================================
    // PHASE 2
    // 10–20 SEC
    // CORRUPTION
    // ===================================

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


    // ===================================
    // PHASE 3
    // 20–30 SEC
    // PRESENCE
    // ===================================

    console.log(
        "[MR.SMILE] PHASE 3 — PRESENCE"
    );

    document.body.classList.add(
        "mrSmilePhase3"
    );


    await sleep(1300);


    // SHORT BLACKOUT

    document.body.classList.add(
        "mrSmileBlackout"
    );

    await sleep(900);


    // SMILE

    const smile =
        createFirstContactSmile();


    await sleep(1800);


    // SMILE DISAPPEARS

    if (smile) {

        smile.style.opacity = "0";

    }

    await sleep(700);


    if (smile) {

        smile.remove();

    }


    document.body.classList.remove(
        "mrSmileBlackout"
    );


    await sleep(1100);


    // SECOND APPEARANCE

    document.body.classList.add(
        "mrSmileBlackout"
    );

    await sleep(400);


    const smile2 =
        createFirstContactSmile();


    await sleep(1200);


    if (smile2) {

        smile2.style.opacity = "0";

    }

    await sleep(500);


    if (smile2) {

        smile2.remove();

    }


    document.body.classList.remove(
        "mrSmileBlackout"
    );


    await sleep(700);

    document.body.classList.remove(
        "mrSmilePhase3"
    );


    // ===================================
    // PHASE 4
    // 30–40 SEC
    // INTRUSION
    // ===================================

    console.log(
        "[MR.SMILE] PHASE 4 — INTRUSION"
    );

    document.body.classList.add(
        "mrSmilePhase4"
    );


    await sleep(1200);


    document.body.classList.add(
        "mrSmileSevereGlitch"
    );


    await sleep(2400);


    document.body.classList.remove(
        "mrSmileSevereGlitch"
    );


    await sleep(700);


    document.body.classList.add(
        "mrSmileHardShake"
    );


    await sleep(1600);


    document.body.classList.remove(
        "mrSmileHardShake"
    );


    await sleep(1200);


    document.body.classList.add(
        "mrSmileSevereGlitch"
    );


    await sleep(1700);


    document.body.classList.remove(
        "mrSmileSevereGlitch"
    );


    await sleep(900);


    document.body.classList.remove(
        "mrSmilePhase4"
    );


    // ===================================
    // PHASE 5
    // 40–50 SEC
    // COLLAPSE
    // ===================================

    console.log(
        "[MR.SMILE] PHASE 5 — COLLAPSE"
    );

    document.body.classList.add(
        "mrSmilePhase5"
    );


    await sleep(900);


    document.body.classList.add(
        "mrSmileSevereGlitch"
    );


    await sleep(4200);


    document.body.classList.remove(
        "mrSmileSevereGlitch"
    );


    await sleep(600);


    document.body.classList.add(
        "mrSmileBlackout"
    );


    await sleep(500);


    document.body.classList.remove(
        "mrSmileBlackout"
    );


    await sleep(300);


    document.body.classList.add(
        "mrSmileBlackout"
    );


    await sleep(700);


    document.body.classList.remove(
        "mrSmileBlackout"
    );


    await sleep(1200);


    document.body.classList.remove(
        "mrSmilePhase5"
    );


    // ===================================
    // PHASE 6
    // 50–57 SEC
    // SILENCE
    // ===================================

    console.log(
        "[MR.SMILE] PHASE 6 — SILENCE"
    );

    document.body.classList.add(
        "mrSmilePhase6"
    );


    await sleep(1500);


    // Almost complete black

    document.body.classList.add(
        "mrSmileFinalDarkness"
    );


    await sleep(3000);


    // One final smile

    const finalSmile =
        createFirstContactSmile();


    await sleep(1600);


    if (finalSmile) {

        finalSmile.style.opacity = "0";

    }


    await sleep(500);


    if (finalSmile) {

        finalSmile.remove();

    }


    document.body.classList.remove(
        "mrSmileFinalDarkness"
    );


    await sleep(700);


    document.body.classList.remove(
        "mrSmilePhase6"
    );


    // ===================================
    // RECOVERY
    // ===================================

    console.log(
        "[MR.SMILE] OMEGA RECOVERY"
    );


    document.body.classList.remove(
        "mrSmileFirstContact"
    );


    document.body.classList.remove(
        "mrSmileBlackout"
    );

    document.body.classList.remove(
        "mrSmileSevereGlitch"
    );

    document.body.classList.remove(
        "mrSmileHardShake"
    );

    document.body.classList.remove(
        "mrSmileDistortion"
    );

    document.body.classList.remove(
        "mrSmileTextCorruption"
    );


    // ===================================
    // SAVE CONTACT
    // ===================================

    localStorage.setItem(
        "mrsmile_first_contact",
        "1"
    );


    // ===================================
    // FALSE NORMALITY
    // ===================================

    await sleep(2500);


    // ===================================
    // MR.SMILE ENTERS CHAT
    // ===================================

    await playFirstContactMessage();


    console.log(
        "[MR.SMILE] FIRST CONTACT COMPLETE"
    );

    firstContactRunning = false;

}


// =======================================
// FIRST CONTACT SMILE
// =======================================

function createFirstContactSmile() {

    const existing =
        document.getElementById(
            "mrSmileFirstContactSmile"
        );

    if (existing) {

        existing.remove();

    }


    const smile =
        document.createElement("div");


    smile.id =
        "mrSmileFirstContactSmile";


    smile.textContent = ":)";


    smile.style.position = "fixed";

    smile.style.left = "50%";

    smile.style.top = "50%";


    smile.style.transform =
        "translate(-50%, -50%)";


    smile.style.zIndex =
        "2147483647";


    smile.style.color =
        "#ffffff";


    smile.style.fontFamily =
        '"Courier New", monospace';


    smile.style.fontSize =
        "clamp(32px, 6vw, 90px)";


    smile.style.fontWeight =
        "normal";


    smile.style.lineHeight =
        "1";


    smile.style.opacity =
        "0";


    smile.style.pointerEvents =
        "none";


    smile.style.userSelect =
        "none";


    smile.style.transition =
        "opacity 1.2s ease";


    smile.style.textShadow =
        "0 0 8px rgba(255,255,255,.35), 0 0 25px rgba(255,255,255,.2)";


    document.body.appendChild(
        smile
    );


    requestAnimationFrame(() => {

        smile.style.opacity =
            "1";

    });


    return smile;

}


// =======================================
// NIGHT
// =======================================

function nightLoop() {

    setInterval(() => {

        const hour =
            new Date().getHours();


        if (
            hour >= 22 ||
            hour <= 5
        ) {

            if (Math.random() < 0.20) {

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
// GLITCH
// =======================================

function glitchLoop() {

    setInterval(() => {

        if (Math.random() > 0.08)
            return;


        document.body.classList.add(
            "screenGlitch"
        );


        setTimeout(() => {

            document.body.classList.remove(
                "screenGlitch"
            );

        }, 250);


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


        if (
            memory &&
            memory.openedFiles &&
            memory.openedFiles.length > 5
        ) {

            if (Math.random() < 0.25) {

                typeSystemMessage(
                    "MR.SMILE: You seem interested in our archives."
                );

            }

        }

    }, 60000);

}


// =======================================
// IDLE
// =======================================

function idleLoop() {

    setInterval(() => {

        if (Math.random() > 0.12)
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
// MANUAL EVENT API
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
// HELPERS
// =======================================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );

}


function pick(arr) {

    return arr[
        Math.floor(
            Math.random() * arr.length
        )
    ];

}
