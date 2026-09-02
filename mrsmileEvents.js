
// =======================================
// MR.SMILE EVENT SYSTEM
// =======================================

import {
    typeSystemMessage,
    playFirstContactMessage
} from "./mrsmileChat.js";

import { getTrust } from "./mrsmileTrust.js";
import { getMemory } from "./mrsmileMemory.js";

import {
    on,
    once
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

    // Existing events
    nightLoop();
    glitchLoop();
    idleLoop();
    observationLoop();

    // First contact
    once(
        "mrsmile:firstContact",
        triggerFirstContact
    );
    
    on("mirror.command", () => {

    console.log("[MR.SMILE] Condition detected: mirror.command");

    triggerMrSmileFirstContact();

});
    

}


// =======================================
// FIRST CONTACT
// =======================================

async function triggerFirstContact() {

    // Prevent duplicate execution
    if (firstContactRunning) return;

    // Already completed on a previous visit
    if (localStorage.getItem("mrsmile_first_contact") === "1") {

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
    // LOCK EVENT
    // ===================================

    document.body.classList.add(
        "mrSmileFirstContact"
    );


    // ===================================
    // SHORT DELAY
    // ===================================

    await sleep(700);


    // ===================================
    // BLACK SCREEN
    // ===================================

    document.body.classList.add(
        "mrSmileBlackout"
    );


    await sleep(900);


    // ===================================
    // SMILE APPEARS
    // ===================================

    const smile = createFirstContactSmile();


    await sleep(1200);


    // ===================================
    // HEAVY INTERFERENCE
    // ===================================

    document.body.classList.add(
        "mrSmileSevereGlitch"
    );


    await sleep(2500);


    // ===================================
    // REMOVE SMILE
    // ===================================

    if (smile) {

        smile.remove();

    }


    // ===================================
    // RECOVERY
    // ===================================

    document.body.classList.remove(
        "mrSmileSevereGlitch"
    );

    await sleep(500);

    document.body.classList.remove(
        "mrSmileBlackout"
    );

    document.body.classList.remove(
        "mrSmileFirstContact"
    );


    // ===================================
    // SAVE PERMANENT CONTACT
    // ===================================

    localStorage.setItem(
        "mrsmile_first_contact",
        "1"
    );


    // ===================================
    // MR.SMILE ENTERS CHAT
    // ===================================

    await sleep(900);

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

    smile.style.zIndex = "999999";

    smile.style.color = "#ffffff";

    smile.style.fontFamily =
        "monospace";

    smile.style.fontSize =
        "clamp(32px, 6vw, 90px)";

    smile.style.fontWeight =
        "normal";

    smile.style.opacity = "0";

    smile.style.pointerEvents =
        "none";

    smile.style.transition =
        "opacity 1.2s ease";


    document.body.appendChild(smile);


    // Force browser to register initial state
    requestAnimationFrame(() => {

        smile.style.opacity = "1";

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


    import("./eventManager.js")
        .then(({ trigger }) => {

            trigger(
                "mrsmile:firstContact"
            );

        })
        .catch(error => {

            console.error(
                "[MR.SMILE] Failed to trigger first contact:",
                error
            );

        });

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
