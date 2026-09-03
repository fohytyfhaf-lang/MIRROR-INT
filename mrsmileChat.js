import { mrSmileSay } from "./mrsmileCore.js";

import {
    on
} from "./eventManager.js";

import {
    grantMirrorArchiveAccess,
    hasPendingMirrorArchiveAccess
} from "./mrsmileProgress.js";


let initialized = false;
let idleTimer = null;


// =======================================
// INIT
// =======================================

export function initMrSmileChat() {

    if (initialized) return;

    initialized = true;

    console.log(
        "[MR.SMILE] Chat initialized"
    );


    const input =
        document.getElementById(
            "chatInput"
        );

    const button =
        document.getElementById(
            "sendBtn"
        );


    if (!input || !button) {

        console.warn(
            "[MR.SMILE] Chat elements not found."
        );

        return;

    }


    button.addEventListener(
        "click",
        sendMessage
    );


    input.addEventListener(
        "keydown",
        e => {

            if (e.key === "Enter") {

                sendMessage();

            }

        }
    );


    // ===================================
    // MIRROR ARCHIVE ACCESS
    // ===================================

    registerArchiveAccessListener();


    // ===================================
    // CHECK PENDING REQUEST
    // ===================================
    //
    // Important:
    // Progress may have detected the
    // conditions before Chat initialized.
    //
    // Therefore we check localStorage
    // after registering the listener.
    // ===================================

    if (
        hasPendingMirrorArchiveAccess()
    ) {

        handleMirrorArchiveAccess();

    }


    scheduleRandomMessage();

}


// =======================================
// MIRROR ARCHIVE ACCESS LISTENER
// =======================================

let archiveListenerRegistered = false;


function registerArchiveAccessListener() {

    if (archiveListenerRegistered)
        return;


    archiveListenerRegistered = true;


    on(
        "mrsmile:archiveAccessRequested",
        () => {

            console.log(
                "[MR.SMILE] MIRROR-00 access request received."
            );


            handleMirrorArchiveAccess();

        }
    );

}


// =======================================
// MR.SMILE GRANTS MIRROR ACCESS
// =======================================

async function handleMirrorArchiveAccess() {

    // -----------------------------------
    // Do not run twice
    // -----------------------------------

    if (
        !hasPendingMirrorArchiveAccess()
    ) {

        return;

    }


    // -----------------------------------
    // Stop random message
    // -----------------------------------

    clearTimeout(
        idleTimer
    );


    // -----------------------------------
    // Small delay
    // -----------------------------------

    await sleep(900);


    // -----------------------------------
    // MR.SMILE speaks
    // -----------------------------------

    await typeMessage(
        "You were looking for the Mirror."
    );


    await sleep(
        1200
    );


    await typeMessage(
        "I've given you access."
    );


    await sleep(
        700
    );


    // -----------------------------------
    // Actually grant access
    // -----------------------------------

    const granted =
        grantMirrorArchiveAccess();


    if (!granted) {

        scheduleRandomMessage();

        return;

    }


    // -----------------------------------
    // OMEGA records the change
    // -----------------------------------

    typeSystemMessage(
        "MIRROR-00 ACCESS GRANTED BY MR.SMILE."
    );


    await sleep(
        500
    );


    typeSystemMessage(
        "RESOURCE: /files/mirror_archive.txt"
    );


    // -----------------------------------
    // Resume normal behavior
    // -----------------------------------

    scheduleRandomMessage();

}


// =======================================
// PLAYER MESSAGE
// =======================================

async function sendMessage() {

    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) return;


    const text =
        input.value.trim();


    if (!text) return;


    input.value = "";


    addMessage(
        "YOU",
        text,
        "user"
    );


    clearTimeout(
        idleTimer
    );


    // ===================================
    // RANDOM SIGNAL INTERRUPTION
    // ===================================

    if (Math.random() < 0.08) {

        await fakeTyping(
            2500
        );


        typeSystemMessage(
            "Signal interrupted."
        );


        scheduleRandomMessage();

        return;

    }


    // ===================================
    // MR.SMILE THINKING
    // ===================================

    await fakeTyping(
        random(
            1000,
            4000
        )
    );


    // ===================================
    // GENERATE RESPONSE
    // ===================================

    const response =
        await mrSmileSay(text);


    if (!response) {

        typeSystemMessage(
            "No response."
        );


        scheduleRandomMessage();

        return;

    }


    // ===================================
    // RESPONSE
    // ===================================

    await typeMessage(
        response
    );


    // ===================================
    // MESSAGE CORRUPTION
    // ===================================

    if (Math.random() < 0.10) {

        const msgs =
            document.querySelectorAll(
                ".msg.smile"
            );


        const last =
            msgs[msgs.length - 1];


        if (last) {

            await sleep(
                2000
            );


            const textElement =
                last.querySelector(
                    ".text"
                );


            if (textElement) {

                textElement.textContent =
                    "████████████";


                await sleep(
                    900
                );


                textElement.textContent =
                    "Message removed.";


                last.classList.add(
                    "system"
                );

            }

        }

    }


    scheduleRandomMessage();

}


// =======================================
// NORMAL MESSAGE
// =======================================

function addMessage(
    author,
    text,
    type
) {

    const log =
        document.getElementById(
            "chatLog"
        );


    if (!log) return;


    const div =
        document.createElement(
            "div"
        );


    div.className =
        `msg ${type}`;


    div.innerHTML = `

        <div class="author">
            ${author}
        </div>

        <div class="text"></div>

    `;


    const body =
        div.querySelector(
            ".text"
        );


    body.textContent =
        text;


    log.appendChild(
        div
    );


    log.scrollTop =
        log.scrollHeight;

}


// =======================================
// MR.SMILE MESSAGE
// =======================================

async function typeMessage(
    text
) {

    const log =
        document.getElementById(
            "chatLog"
        );


    if (!log) return;


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "msg smile";


    div.innerHTML = `

        <div class="author">
            MR.SMILE
        </div>

        <div class="text"></div>

    `;


    const body =
        div.querySelector(
            ".text"
        );


    log.appendChild(
        div
    );


    for (const ch of text) {

        body.textContent +=
            ch;


        log.scrollTop =
            log.scrollHeight;


        await sleep(
            random(
                20,
                45
            )
        );

    }

}


// =======================================
// FIRST CONTACT
// =======================================

export async function playFirstContactMessage() {

    console.log(
        "[MR.SMILE] First contact message."
    );


    // Make sure old random messages
    // do not interrupt the scene.

    clearTimeout(
        idleTimer
    );


    // -----------------------------------
    // First message
    // -----------------------------------

    await typeMessage(
        ":)"
    );


    // -----------------------------------
    // Silence
    // -----------------------------------

    await sleep(
        1000
    );


    // -----------------------------------
    // Second message
    // -----------------------------------

    await typeMessage(
        "Hello, operator."
    );


    // -----------------------------------
    // Resume normal behavior
    // -----------------------------------

    scheduleRandomMessage();

}


// =======================================
// SYSTEM MESSAGE
// =======================================

export function typeSystemMessage(
    text
) {

    const log =
        document.getElementById(
            "chatLog"
        );


    if (!log) return;


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "msg system";


    div.textContent =
        text;


    log.appendChild(
        div
    );


    log.scrollTop =
        log.scrollHeight;

}


// =======================================
// TYPING EFFECT
// =======================================

async function fakeTyping(
    time
) {

    const log =
        document.getElementById(
            "chatLog"
        );


    if (!log) return;


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "msg typing";


    div.textContent =
        "MR.SMILE is typing...";


    log.appendChild(
        div
    );


    log.scrollTop =
        log.scrollHeight;


    await sleep(
        time
    );


    div.remove();

}


// =======================================
// RANDOM EVENTS
// =======================================

function scheduleRandomMessage() {

    clearTimeout(
        idleTimer
    );


    idleTimer =
        setTimeout(
            async () => {

                const messages = [

                    "Are you still here?",

                    "I can hear the servers.",

                    "Someone is watching us.",

                    "Don't trust Terminal-03.",

                    "You opened something you shouldn't.",

                    "They are lying to you.",

                    "I remember you.",

                    "...",

                    "Can you hear me?",

                    "Stay online."

                ];


                await fakeTyping(
                    random(
                        1500,
                        4000
                    )
                );


                await typeMessage(

                    messages[
                        random(
                            0,
                            messages.length - 1
                        )
                    ]

                );


                scheduleRandomMessage();

            },

            random(
                30000,
                90000
            )

        );

}


// =======================================
// HELPERS
// =======================================

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


function random(
    min,
    max
) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;

}
