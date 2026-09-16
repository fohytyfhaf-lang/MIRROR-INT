
/* ==========================================================
   MR.SMILE CHAT — STABLE CHAT BRIDGE
   OMEGA / MIRROR-INT

   RESPONSIBILITY:

   - bridge the real OMEGA chat UI
   - receive operator messages
   - pass them through ONE dialogue/core pipeline
   - preserve First Contact
   - preserve idle behaviour
   - preserve operator actions
   - preserve MIRROR-00 access
   - serialize incoming operator messages
   - prevent duplicate events
   - keep channel initialization singular

   ARCHITECTURE:

       OPERATOR
          ↓
       chats.js
          ↓
       mrsmile:operatorMessage
          ↓
       mrsmileChat.js
          ↓
       processMrSmileDialogue()
          ↓
       mrSmileSay()
          ↓
       ONE RESULT
          ↓
       ONE visible MR.SMILE message

   IMPORTANT:

   This file does NOT:
   - generate MR.SMILE personality
   - replace Core responses
   - rewrite memory
   - call Core twice
   - create fake operator messages
   - use idle prompts as operator input

   MR.SMILE personality remains inside:
       mrsmileCore.js

   Dialogue/context analysis remains inside:
       mrsmileDialogue.js
========================================================== */


/* ==========================================================
   IMPORTS
========================================================== */

import {
    processMrSmileDialogue
} from "./mrsmileDialogue.js";

import {
    reactToAction
} from "./mrsmileCore.js";

import {
    on
} from "./eventManager.js";

import {
    grantMirrorArchiveAccess,
    hasPendingMirrorArchiveAccess
} from "./mrsmileProgress.js";


/* ==========================================================
   STATE
========================================================== */

const STATE = {

    initialized: false,

    chatBridgeReady: false,

    channelInitializationPending: false,

    channelInitialized: false,

    channel: "mrsmile",

    /* ------------------------------------------------------
       FIRST CONTACT
    ------------------------------------------------------ */

    firstContactPlayed: false,

    firstContactRunning: false,

    firstContactPromise: null,

    /* ------------------------------------------------------
       OPERATOR PIPELINE
    ------------------------------------------------------ */

    operatorProcessing: false,

    operatorQueue: Promise.resolve(),

    responseSequence: 0,

    /* ------------------------------------------------------
       IDLE
    ------------------------------------------------------ */

    idleTimer: null,

    idleEnabled: true,

    idleRunning: false,

    lastIdleTime: 0,

    /* ------------------------------------------------------
       LAST MESSAGE STATE
    ------------------------------------------------------ */

    lastOperatorMessage: "",

    lastMrSmileMessage: "",

    lastOperatorTime: 0,

    lastMrSmileTime: 0,

    lastOperatorLanguage: "ru",

    /* ------------------------------------------------------
       RESPONSE CONTROL
    ------------------------------------------------------ */

    responseCooldownUntil: 0,

    /* ------------------------------------------------------
       EVENT REGISTRATION
    ------------------------------------------------------ */

    eventHandlersRegistered: false,

    archiveHandlerRegistered: false,

    operatorHandlerRegistered: false,

    actionHandlerRegistered: false,

    /* ------------------------------------------------------
       DUPLICATE EVENT PROTECTION
    ------------------------------------------------------ */

    lastIncomingEventText: "",

    lastIncomingEventTime: 0
};


/* ==========================================================
   CONFIG
========================================================== */

const CONFIG = {

    channel: "mrsmile",

    /*
     * Small delay between visible MR.SMILE responses.
     * This is NOT used for duplicate question detection.
     */
    responseCooldown: 900,

    /*
     * Core response delay bounds.
     */
    minResponseDelay: 500,

    maxResponseDelay: 4500,

    /*
     * Idle timing.
     */
    idleMinDelay: 60000,

    idleMaxDelay: 150000,

    /*
     * First Contact.
     */
    firstContactEnabled: true,

    /*
     * Idle globally enabled.
     */
    idleEnabled: true,

    /*
     * Duplicate EVENT protection only.
     *
     * This prevents:
     *
     * sendMessage()
     * +
     * eventManager event
     *
     * from processing the same event twice.
     *
     * It does NOT suppress a real repeated question
     * after the operator intentionally asks it again.
     */
    preventDuplicateEventMs: 1200,

    /*
     * If several operator events arrive almost together,
     * they are serialized through the queue.
     */
    operatorQueueDelay: 50
};


/* ==========================================================
   BASIC UTILITIES
========================================================== */

function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(
            resolve,
            Math.max(
                0,
                Number(ms) || 0
            )
        )
    );
}


function now() {
    return Date.now();
}


function cleanText(value) {
    return String(
        value ?? ""
    ).trim();
}


function random(min, max) {
    const low =
        Number(min) || 0;

    const high =
        Number(max) || low;

    return (
        Math.floor(
            Math.random() *
            (high - low + 1)
        ) +
        low
    );
}


function clamp(value, min, max) {
    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );
}


/* ==========================================================
   SAFE LOCAL STORAGE
========================================================== */

function storageGet(key) {
    try {
        if (
            typeof localStorage ===
            "undefined"
        ) {
            return null;
        }

        return localStorage.getItem(key);

    } catch {
        return null;
    }
}


function storageSet(key, value) {
    try {
        if (
            typeof localStorage ===
            "undefined"
        ) {
            return false;
        }

        localStorage.setItem(
            key,
            String(value)
        );

        return true;

    } catch {
        return false;
    }
}


/* ==========================================================
   CHAT AVAILABILITY
========================================================== */

function chatAvailable() {
    return (
        typeof window !== "undefined" &&
        typeof window.addChatMessage === "function"
    );
}


/* ==========================================================
   WAIT FOR CHAT BRIDGE
========================================================== */

function waitForChatBridge(
    callback,
    attempts = 60
) {
    if (chatAvailable()) {

        STATE.chatBridgeReady = true;

        callback();

        return true;
    }

    if (attempts <= 0) {

        console.warn(
            "[MR.SMILE CHAT] OMEGA chat bridge unavailable."
        );

        return false;
    }

    STATE.channelInitializationPending =
        true;

    setTimeout(
        () =>
            waitForChatBridge(
                callback,
                attempts - 1
            ),
        100
    );

    return false;
}


/* ==========================================================
   RAW CHAT OUTPUT
========================================================== */

function pushChatMessage(
    user,
    text
) {
    const message =
        cleanText(text);

    if (
        !message ||
        !chatAvailable()
    ) {
        return false;
    }

    try {

        window.addChatMessage(
            CONFIG.channel,
            {
                user,

                time:
                    new Date()
                        .toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        ),

                text: message
            }
        );

        return true;

    } catch (error) {

        console.error(
            "[MR.SMILE CHAT] addChatMessage failed:",
            error
        );

        return false;
    }
}


/* ==========================================================
   MR.SMILE OUTPUT
========================================================== */

function addMrSmileChatMessage(
    text
) {
    const message =
        cleanText(text);

    if (!message) {
        return false;
    }

    STATE.lastMrSmileMessage =
        message;

    STATE.lastMrSmileTime =
        now();

    STATE.responseSequence += 1;

    return pushChatMessage(
        "MR.SMILE",
        message
    );
}


/* ==========================================================
   SYSTEM OUTPUT
========================================================== */

function addSystemChatMessage(
    text
) {
    return pushChatMessage(
        "SYSTEM",
        text
    );
}


/* ==========================================================
   RESULT EXTRACTION
========================================================== */

function extractResponseText(result) {

    if (
        result === null ||
        result === undefined
    ) {
        return "";
    }

    if (
        typeof result ===
        "string"
    ) {
        return cleanText(
            result
        );
    }

    if (
        typeof result !==
        "object"
    ) {
        return "";
    }

    if (
        typeof result.text ===
        "string"
    ) {
        return cleanText(
            result.text
        );
    }

    /*
     * Compatibility fallback.
     * Core normally uses result.text.
     */
    if (
        typeof result.message ===
        "string"
    ) {
        return cleanText(
            result.message
        );
    }

    if (
        typeof result.response ===
        "string"
    ) {
        return cleanText(
            result.response
        );
    }

    return "";
}


/* ==========================================================
   RESPONSE DELAY
========================================================== */

function extractResponseDelay(
    result
) {
    if (
        !result ||
        typeof result !==
        "object"
    ) {
        return CONFIG.minResponseDelay;
    }

    const delay =
        Number(result.delay);

    if (
        !Number.isFinite(delay)
    ) {
        return CONFIG.minResponseDelay;
    }

    return clamp(
        delay,
        CONFIG.minResponseDelay,
        CONFIG.maxResponseDelay
    );
}


/* ==========================================================
   DUPLICATE RESPONSE PROTECTION
========================================================== */

function isDuplicateVisibleResponse(
    text
) {
    const message =
        cleanText(text);

    if (!message) {
        return true;
    }

    const current =
        now();

    return (
        message ===
            STATE.lastMrSmileMessage &&

        current -
            STATE.lastMrSmileTime <
            CONFIG.preventDuplicateEventMs
    );
}


/* ==========================================================
   OUTPUT ONE RESPONSE
========================================================== */

async function outputMrSmile(
    result,
    options = {}
) {
    const text =
        extractResponseText(
            result
        );

    if (!text) {
        return false;
    }

    /*
     * The same visible message cannot be emitted twice
     * inside the duplicate-event protection window.
     */
    if (
        isDuplicateVisibleResponse(
            text
        )
    ) {
        return false;
    }

    const requestedDelay =
        options.instant === true
            ? 0
            : extractResponseDelay(
                result
            );

    const extraDelay =
        Number(
            options.extraDelay
        ) || 0;

    const delay =
        clamp(
            requestedDelay +
                extraDelay,
            0,
            CONFIG.maxResponseDelay
        );

    if (delay > 0) {
        await sleep(delay);
    }

    /*
     * Respect the visible response cooldown.
     */
    const current =
        now();

    if (
        current <
        STATE.responseCooldownUntil
    ) {
        await sleep(
            STATE.responseCooldownUntil -
            current
        );
    }

    const sent =
        addMrSmileChatMessage(
            text
        );

    if (sent) {

        STATE.responseCooldownUntil =
            now() +
            CONFIG.responseCooldown;
    }

    return sent;
}


/* ==========================================================
   DUPLICATE OPERATOR EVENT DETECTION
========================================================== */

function isDuplicateOperatorEvent(
    text
) {
    const input =
        cleanText(text);

    if (!input) {
        return true;
    }

    const current =
        now();

    return (
        input ===
            STATE.lastIncomingEventText &&

        current -
            STATE.lastIncomingEventTime <
            CONFIG.preventDuplicateEventMs
    );
}


/* ==========================================================
   REMEMBER LAST OPERATOR EVENT
========================================================== */

function markIncomingOperatorEvent(
    text
) {
    STATE.lastIncomingEventText =
        cleanText(text);

    STATE.lastIncomingEventTime =
        now();
}


/* ==========================================================
   OPERATOR MESSAGE PIPELINE
========================================================== */

async function processOperatorMessage(
    text,
    options = {}
) {
    const input =
        cleanText(text);

    if (!input) {
        return null;
    }

    /*
     * Ignore only duplicate EVENT delivery.
     *
     * An intentionally repeated question later is NOT blocked.
     */
    if (
        options.skipDuplicateCheck !== true &&
        isDuplicateOperatorEvent(input)
    ) {
        console.warn(
            "[MR.SMILE CHAT] Duplicate operator event ignored."
        );

        return null;
    }

    if (
        options.skipDuplicateCheck !== true
    ) {
        markIncomingOperatorEvent(
            input
        );
    }

    /*
     * Pause idle while the operator is actively speaking.
     */
    pauseIdleMessages();

    STATE.operatorProcessing =
        true;

    try {

        await sleep(
            CONFIG.operatorQueueDelay
        );

        /*
         * ====================================================
         * ONE AND ONLY ONE DIALOGUE CALL
         * ====================================================
         */
        const result =
            processMrSmileDialogue(
                input,
                {
                    instant:
                        options.instant === true,

                    language:
                        options.language
                }
            );

        if (!result) {
            return null;
        }

        /*
         * Preserve language information from the dialogue layer.
         */
        const detectedLanguage =
            result?.dialogueContext?.language;

        if (
            typeof detectedLanguage ===
            "string" &&
            detectedLanguage
        ) {
            STATE.lastOperatorLanguage =
                detectedLanguage;
        }

        /*
         * ====================================================
         * ONE AND ONLY ONE VISIBLE RESPONSE
         * ====================================================
         */
        const response =
            await outputMrSmile(
                result,
                options
            );

        return {
            input,

            result,

            response,

            sequence:
                STATE.responseSequence
        };

    } catch (error) {

        console.error(
            "[MR.SMILE CHAT] Dialogue processing error:",
            error
        );

        /*
         * Emergency fallback is used only if Core actually
         * throws. It is never generated alongside a valid result.
         */
        const fallback = {
            ok: true,

            text:
                "I see.",

            delay:
                900,

            intent:
                "unknown_statement",

            emergency:
                true
        };

        const fallbackSent =
            await outputMrSmile(
                fallback,
                {
                    extraDelay:
                        200,

                    skipDuplicateCheck:
                        true
                }
            );

        return {
            input,

            result:
                fallback,

            response:
                fallbackSent,

            error
        };

    } finally {

        STATE.operatorProcessing =
            false;

        /*
         * Idle is resumed only after the operator response
         * has completely finished.
         */
        if (
            STATE.idleEnabled
        ) {
            scheduleIdleMessages();
        }
    }
}


/* ==========================================================
   SERIALIZED OPERATOR QUEUE
========================================================== */
function enqueueOperatorMessage(
    text,
    options = {}
) {
    const input =
        cleanText(text);

    if (!input) {
        return Promise.resolve(null);
    }

    /*
     * Duplicate EVENT protection happens
     * BEFORE entering the queue.
     *
     * This is important because the first task
     * may take several seconds.
     */

    if (
        options.skipDuplicateCheck !== true &&
        isDuplicateOperatorEvent(input)
    ) {
        console.warn(
            "[MR.SMILE CHAT] Duplicate operator event ignored before queue."
        );

        return Promise.resolve(null);
    }

    if (
        options.skipDuplicateCheck !== true
    ) {
        markIncomingOperatorEvent(
            input
        );
    }

    /*
     * Every operator event enters the same queue.
     *
     * This prevents two legitimate messages
     * from reaching the Core simultaneously.
     */

    const task =
        STATE.operatorQueue.then(
            () =>
                processOperatorMessage(
                    input,
                    {
                        ...options,

                        /*
                         * Duplicate check has already
                         * happened at queue entry.
                         */
                        skipDuplicateCheck:
                            true
                    }
                )
        );

    /*
     * Keep the queue alive even if one task throws.
     */

    STATE.operatorQueue =
        task.catch(
            error => {

                console.error(
                    "[MR.SMILE CHAT] Operator queue error:",
                    error
                );

                return null;
            }
        );

    return task;
}

/* ==========================================================
   PUBLIC OPERATOR API
========================================================== */

export function sendOperatorMessage(
    text,
    options = {}
) {
    return enqueueOperatorMessage(
        text,
        options
    );
}


export function sendMessage(
    text
) {
    return enqueueOperatorMessage(
        text,
        {}
    );
}


/* ==========================================================
   MANUAL MESSAGE OUTPUT
   These functions intentionally DO NOT call Core.
========================================================== */

export async function typeMessage(
    text
) {
    const message =
        cleanText(text);

    if (!message) {
        return false;
    }

    await sleep(50);

    return addMrSmileChatMessage(
        message
    );
}


export async function typeSystemMessage(
    text
) {
    const message =
        cleanText(text);

    if (!message) {
        return false;
    }

    await sleep(50);

    return addSystemChatMessage(
        message
    );
}


/* ==========================================================
   FIRST CONTACT
========================================================== */

async function playFirstContactSequence() {

    /*
     * One Promise controls the entire sequence.
     *
     * If an event and auto-init happen simultaneously,
     * they share the same running sequence.
     */
    if (
        STATE.firstContactPromise
    ) {
        return STATE.firstContactPromise;
    }

    STATE.firstContactRunning =
        true;

    STATE.firstContactPromise =
        (async () => {

            try {

                if (
                    STATE.firstContactPlayed
                ) {
                    return false;
                }

                STATE.firstContactPlayed =
                    true;

                storageSet(
                    "mrsmile_first_contact",
                    "1"
                );

                pauseIdleMessages();

                /*
                 * SYSTEM CHANNEL INITIALIZATION
                 */

                await sleep(500);

                addSystemChatMessage(
                    "PRIVATE COMMUNICATION CHANNEL INITIALIZED."
                );

                await sleep(700);

                addSystemChatMessage(
                    "REMOTE PARTICIPANT PRESENT."
                );

                /*
                 * MR.SMILE FIRST CONTACT
                 */

                await sleep(900);

                addMrSmileChatMessage(
                    "Good evening."
                );

                await sleep(1600);

                addMrSmileChatMessage(
                    "I believe we have interrupted one another."
                );

                await sleep(1800);

                addMrSmileChatMessage(
                    "Please, take your time."
                );

                /*
                 * After First Contact the normal idle scheduler
                 * takes over.
                 */
                startIdleMessages();

                return true;

            } catch (error) {

                console.error(
                    "[MR.SMILE CHAT] First Contact failed:",
                    error
                );

                return false;

            } finally {

                STATE.firstContactRunning =
                    false;

                STATE.firstContactPromise =
                    null;
            }
        })();

    return STATE.firstContactPromise;
}


export async function playFirstContactMessage(
    options = {}
) {
    if (
        options.force !== true &&
        STATE.firstContactPlayed
    ) {
        return false;
    }

    if (
        options.force === true
    ) {
        /*
         * Force is intentionally explicit.
         * It clears only this runtime guard.
         */
        STATE.firstContactPlayed =
            false;
    }

    return playFirstContactSequence();
}


async function handleFirstContact(
    data = {}
) {
    await playFirstContactMessage(
        data || {}
    );
}


/* ==========================================================
   IDLE LANGUAGE
========================================================== */

function getIdleLanguage() {

    const language =
        STATE.lastOperatorLanguage;

    if (
        language === "en" ||
        language === "uk" ||
        language === "ru"
    ) {
        return language;
    }

    return "ru";
}


/* ==========================================================
   IDLE MESSAGE BANK
   IMPORTANT:
   These are DIRECT MR.SMILE idle lines.

   They are NOT sent through:
       processMrSmileDialogue()
       mrSmileSay()

   Therefore idle cannot:
   - create fake operator memory
   - create fake questions
   - trigger repeat detection
   - trigger relationship changes
   - create a second Core response
========================================================== */

function getIdleMessage() {

    const language =
        getIdleLanguage();

    const banks = {

        ru: [
            "Вы всё ещё здесь.",
            "Не спешите.",
            "Я всё ещё здесь.",
            "Можете продолжить, когда будете готовы.",
            "Похоже, вы о чём-то задумались.",
            "Полагаю, у вас есть ещё вопрос.",
            "Тишина тоже может быть частью разговора.",
            "Я подожду."
        ],

        uk: [
            "Ви все ще тут.",
            "Не поспішайте.",
            "Я все ще тут.",
            "Можете продовжити, коли будете готові.",
            "Схоже, ви про щось замислилися.",
            "Гадаю, у вас є ще одне питання.",
            "Тиша теж може бути частиною розмови.",
            "Я зачекаю."
        ],

        en: [
            "You are still here.",
            "Take your time.",
            "I am still here.",
            "You may continue when you are ready.",
            "You seem to be thinking.",
            "Perhaps you have another question.",
            "Silence can be part of a conversation as well.",
            "I can wait."
        ]
    };

    const bank =
        banks[language] ||
        banks.ru;

    return bank[
        random(
            0,
            bank.length - 1
        )
    ];
}


/* ==========================================================
   IDLE SCHEDULING
========================================================== */

function scheduleIdleMessages() {

    clearTimeout(
        STATE.idleTimer
    );

    STATE.idleTimer =
        null;

    if (
        !CONFIG.idleEnabled ||
        !STATE.idleEnabled ||
        !STATE.firstContactPlayed ||
        STATE.operatorProcessing ||
        STATE.firstContactRunning
    ) {
        return;
    }

    const delay =
        random(
            CONFIG.idleMinDelay,
            CONFIG.idleMaxDelay
        );

    STATE.idleTimer =
        setTimeout(
            async () => {

                STATE.idleTimer =
                    null;

                await performIdleMessage();

                /*
                 * Continue scheduling only if idle is still enabled.
                 */
                if (
                    STATE.idleEnabled
                ) {
                    scheduleIdleMessages();
                }
            },
            delay
        );
}


/* ==========================================================
   PERFORM ONE IDLE MESSAGE
========================================================== */

async function performIdleMessage() {

    if (
        STATE.idleRunning ||
        STATE.operatorProcessing ||
        STATE.firstContactRunning
    ) {
        return false;
    }

    if (
        !STATE.firstContactPlayed
    ) {
        return false;
    }

    STATE.idleRunning =
        true;

    try {

        const text =
            getIdleMessage();

        if (!text) {
            return false;
        }

        /*
         * No Core.
         * No Dialogue.
         * No fake operator message.
         *
         * This is a true autonomous MR.SMILE line.
         */
        await sleep(
            random(
                900,
                2200
            )
        );

        const sent =
            addMrSmileChatMessage(
                text
            );

        if (sent) {
            STATE.lastIdleTime =
                now();
        }

        return sent;

    } catch (error) {

        console.error(
            "[MR.SMILE CHAT] Idle error:",
            error
        );

        return false;

    } finally {

        STATE.idleRunning =
            false;
    }
}


/* ==========================================================
   IDLE CONTROL
========================================================== */

export function startIdleMessages() {

    STATE.idleEnabled =
        true;

    scheduleIdleMessages();

    return true;
}


export function stopIdleMessages() {

    STATE.idleEnabled =
        false;

    clearTimeout(
        STATE.idleTimer
    );

    STATE.idleTimer =
        null;

    return true;
}


export function pauseIdleMessages() {

    clearTimeout(
        STATE.idleTimer
    );

    STATE.idleTimer =
        null;
}


export function resumeIdleMessages() {

    STATE.idleEnabled =
        true;

    scheduleIdleMessages();

    return true;
}


/* ==========================================================
   CHAT MESSAGE EVENTS
========================================================== */

async function handleChatMessage(
    data
) {
    if (!data) {
        return;
    }

    const text =
        cleanText(
            data.text ??
            data.message
        );

    if (!text) {
        return;
    }

    if (
        data.stopIdle === true
    ) {
        pauseIdleMessages();
    }

    const delay =
        Number.isFinite(
            Number(data.delay)
        )
            ? Number(data.delay)
            : 0;

    if (delay > 0) {
        await sleep(
            delay
        );
    }

    if (
        data.type === "system"
    ) {
        addSystemChatMessage(
            text
        );
    } else {
        addMrSmileChatMessage(
            text
        );
    }

    if (
        data.resumeIdle === true
    ) {
        resumeIdleMessages();
    }
}


/* ==========================================================
   CHAT SEQUENCE
========================================================== */

async function handleChatSequence(
    data
) {
    if (
        !data ||
        !Array.isArray(
            data.messages
        )
    ) {
        return;
    }

    pauseIdleMessages();

    for (
        const item of data.messages
    ) {

        if (!item) {
            continue;
        }

        await handleChatMessage(
            {
                ...item,

                stopIdle: false,

                resumeIdle: false
            }
        );
    }

    if (
        data.resumeIdle !== false
    ) {
        resumeIdleMessages();
    }
}


/* ==========================================================
   OPERATOR EVENT
========================================================== */

async function handleOperatorEvent(
    data
) {
    if (!data) {
        return;
    }

    const text =
        cleanText(
            data.text ??
            data.message
        );

    if (!text) {
        return;
    }

    /*
     * Prevent MR.SMILE-generated events from
     * accidentally entering the operator pipeline.
     */
    if (
        data.source === "mrsmile" ||
        data.user === "MR.SMILE" ||
        data.author === "mrsmile"
    ) {
        return;
    }

    return enqueueOperatorMessage(
        text,
        {
            instant:
                data.instant === true,

            /*
             * Event handler owns duplicate detection.
             */
            skipDuplicateCheck:
                false
        }
    );
}


/* ==========================================================
   OPERATOR ACTION
========================================================== */

async function handleOperatorAction(
    data
) {
    if (!data) {
        return;
    }

    try {

        /*
         * One action → one reactToAction() call.
         */
        const result =
            reactToAction(
                data
            );

        if (
            !result ||
            result.speak !== true
        ) {
            return;
        }

        const text =
            extractResponseText(
                result
            );

        if (!text) {
            return;
        }

        await outputMrSmile(
            result
        );

    } catch (error) {

        console.error(
            "[MR.SMILE CHAT] Action reaction error:",
            error
        );
    }
}


/* ==========================================================
   MIRROR-00 ACCESS
========================================================== */

async function handleMirrorArchiveAccess() {

    try {

        if (
            !hasPendingMirrorArchiveAccess()
        ) {
            return;
        }

        pauseIdleMessages();

        await sleep(900);

        addMrSmileChatMessage(
            "You were looking for the Mirror."
        );

        await sleep(1200);

        addMrSmileChatMessage(
            "I've given you access."
        );

        await sleep(700);

        grantMirrorArchiveAccess();

        resumeIdleMessages();

    } catch (error) {

        console.error(
            "[MR.SMILE CHAT] MIRROR-00 error:",
            error
        );

        resumeIdleMessages();
    }
}


/* ==========================================================
   EVENT REGISTRATION
========================================================== */

function registerEvents() {

    if (
        STATE.eventHandlersRegistered
    ) {
        return;
    }

    /*
     * Set guard BEFORE registration.
     * This prevents duplicate registration if another
     * initialization path runs during startup.
     */
    STATE.eventHandlersRegistered =
        true;


    /* ------------------------------------------------------
       FIRST CONTACT
    ------------------------------------------------------ */

    try {

        on(
            "mrsmile:firstContact",
            handleFirstContact
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE CHAT] First Contact listener failed:",
            error
        );
    }


    /* ------------------------------------------------------
       DIRECT CHAT MESSAGE
    ------------------------------------------------------ */

    try {

        on(
            "mrsmile:chatMessage",
            handleChatMessage
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE CHAT] chatMessage listener failed:",
            error
        );
    }


    /* ------------------------------------------------------
       CHAT SEQUENCE
    ------------------------------------------------------ */

    try {

        on(
            "mrsmile:chatSequence",
            handleChatSequence
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE CHAT] chatSequence listener failed:",
            error
        );
    }


    /* ------------------------------------------------------
       OPERATOR MESSAGE
    ------------------------------------------------------ */

    try {

        on(
            "mrsmile:operatorMessage",
            handleOperatorEvent
        );

        STATE.operatorHandlerRegistered =
            true;

    } catch (error) {

        console.warn(
            "[MR.SMILE CHAT] operatorMessage listener failed:",
            error
        );
    }


    /* ------------------------------------------------------
       OPERATOR ACTION
    ------------------------------------------------------ */

    try {

        on(
            "mrsmile:operatorAction",
            handleOperatorAction
        );

        STATE.actionHandlerRegistered =
            true;

    } catch (error) {

        console.warn(
            "[MR.SMILE CHAT] operatorAction listener failed:",
            error
        );
    }


    /* ------------------------------------------------------
       MIRROR ARCHIVE
    ------------------------------------------------------ */

    try {
        on(
            "mrsmile:archiveAccessRequested",
           handleMirrorArchiveAccess
         );

        STATE.archiveHandlerRegistered =
            true;

    } catch (error) {

        console.warn(
            "[MR.SMILE CHAT] Mirror Archive listener failed:",
            error
        );
    }
}


/* ==========================================================
   REVEAL MR.SMILE CHAT
========================================================== */

export function revealMrSmileChat() {

    try {

        if (
            typeof window !==
                "undefined" &&
            typeof window.openChat ===
                "function"
        ) {

            window.openChat(
                "mrsmile"
            );

            return true;
        }

        if (
            typeof document !==
                "undefined"
        ) {

            const channel =
                document.querySelector(
                    '[data-chat="mrsmile"]'
                );

            if (channel) {
                channel.click();
                return true;
            }
        }

    } catch (error) {

        console.warn(
            "[MR.SMILE CHAT] reveal failed:",
            error
        );
    }

    return false;
}


/* ==========================================================
   CHANNEL INITIALIZATION
========================================================== */

/*
 * IMPORTANT:
 *
 * Channel initialization does NOT print messages.
 *
 * First Contact is responsible for the visible introduction.
 *
 * This prevents:
 *
 * initializeChannel()
 *   ↓
 * SYSTEM init
 *
 * + firstContact
 *   ↓
 * SYSTEM init AGAIN
 *
 * from happening.
 */

function initializeChannel() {

    if (
        STATE.channelInitialized
    ) {
        return true;
    }

    if (
        !chatAvailable()
    ) {

        STATE.channelInitializationPending =
            true;

        waitForChatBridge(
            () =>
                initializeChannel()
        );

        return false;
    }

    STATE.chatBridgeReady =
        true;

    STATE.channelInitializationPending =
        false;


    /*
     * Compatibility check:
     * see whether chats.js already has the channel.
     */
    try {

        if (
            typeof window !==
                "undefined" &&
            typeof window.getChat ===
                "function"
        ) {

            const chat =
                window.getChat(
                    "mrsmile"
                );

            if (chat) {

                STATE.channelInitialized =
                    true;

                return true;
            }
        }

    } catch {
        /*
         * Optional compatibility lookup.
         */
    }


    /*
     * The bridge itself is sufficient.
     *
     * chats.js remains the owner of chat data.
     */
    STATE.channelInitialized =
        true;

    return true;
}


/* ==========================================================
   FIRST CONTACT AUTO-START
========================================================== */

function shouldStartFirstContact() {

    if (
        !CONFIG.firstContactEnabled
    ) {
        return false;
    }

    if (
        STATE.firstContactPlayed
    ) {
        return false;
    }

    const persisted =
        storageGet(
            "mrsmile_first_contact"
        );

    return persisted !== "1";
}


/* ==========================================================
   INIT
========================================================== */

export function initMrSmileChat(
    options = {}
) {

    if (
        STATE.initialized
    ) {

        return {
            ok: true,

            alreadyInitialized:
                true,

            state:
                getMrSmileChatStatus()
        };
    }

    STATE.initialized =
        true;


    /* ------------------------------------------------------
       EVENTS
    ------------------------------------------------------ */

    registerEvents();


    /* ------------------------------------------------------
       CHANNEL
    ------------------------------------------------------ */

    if (
        options.initializeChannel !== false
    ) {
        initializeChannel();
    }


    /* ------------------------------------------------------
       PERSISTED FIRST CONTACT
    ------------------------------------------------------ */

    const firstContactWasPlayed =
        storageGet(
            "mrsmile_first_contact"
        ) === "1";

    if (
        firstContactWasPlayed
    ) {

        STATE.firstContactPlayed =
            true;

        if (
            options.startIdle !== false &&
            CONFIG.idleEnabled
        ) {

            startIdleMessages();
        }

    } else if (
        options.autoFirstContact !== false &&
        CONFIG.firstContactEnabled
    ) {

        /*
         * Exactly one startup path can start First Contact.
         * Event listener is still safe because the sequence
         * is controlled by firstContactPromise.
         */

        if (
            shouldStartFirstContact()
        ) {
            playFirstContactMessage();
        }
    }


    console.log(
        "[MR.SMILE CHAT] Stable dialogue bridge initialized."
    );


    return {
        ok: true,

        initialized:
            true,

        state:
            getMrSmileChatStatus()
    };
}


/* ==========================================================
   STATUS
========================================================== */

export function getMrSmileChatStatus() {

    return {

        initialized:
            STATE.initialized,

        chatBridgeReady:
            STATE.chatBridgeReady,

        channelInitialized:
            STATE.channelInitialized,

        channelInitializationPending:
            STATE.channelInitializationPending,

        firstContactPlayed:
            STATE.firstContactPlayed,

        firstContactRunning:
            STATE.firstContactRunning,

        operatorProcessing:
            STATE.operatorProcessing,

        responseSequence:
            STATE.responseSequence,

        idleEnabled:
            STATE.idleEnabled,

        idleRunning:
            STATE.idleRunning,

        lastIdleTime:
            STATE.lastIdleTime,

        lastOperatorMessage:
            STATE.lastOperatorMessage,

        lastMrSmileMessage:
            STATE.lastMrSmileMessage,

        lastOperatorTime:
            STATE.lastOperatorTime,

        lastMrSmileTime:
            STATE.lastMrSmileTime,

        lastOperatorLanguage:
            STATE.lastOperatorLanguage,

        responseCooldownUntil:
            STATE.responseCooldownUntil,

        eventHandlersRegistered:
            STATE.eventHandlersRegistered,

        operatorHandlerRegistered:
            STATE.operatorHandlerRegistered,

        actionHandlerRegistered:
            STATE.actionHandlerRegistered,

        archiveHandlerRegistered:
            STATE.archiveHandlerRegistered,

        channel:
            STATE.channel
    };
}


/* ==========================================================
   RESET
========================================================== */

export function resetMrSmileChat(
    options = {}
) {

    stopIdleMessages();

    STATE.firstContactPlayed =
        false;

    STATE.firstContactRunning =
        false;

    STATE.firstContactPromise =
        null;

    STATE.operatorProcessing =
        false;

    STATE.operatorQueue =
        Promise.resolve();

    STATE.responseSequence =
        0;

    STATE.lastOperatorMessage =
        "";

    STATE.lastMrSmileMessage =
        "";

    STATE.lastOperatorTime =
        0;

    STATE.lastMrSmileTime =
        0;

    STATE.lastOperatorLanguage =
        "ru";

    STATE.lastIncomingEventText =
        "";

    STATE.lastIncomingEventTime =
        0;

    STATE.responseCooldownUntil =
        0;


    if (
        options.clearFirstContactPersistence === true
    ) {

        try {

            if (
                typeof localStorage !==
                    "undefined"
            ) {

                localStorage.removeItem(
                    "mrsmile_first_contact"
                );
            }

        } catch {
            /* Optional persistence only. */
        }
    }


    if (
        options.restartIdle === true &&
        STATE.firstContactPlayed
    ) {
        startIdleMessages();
    }


    return getMrSmileChatStatus();
}


/* ==========================================================
   GLOBAL API
========================================================== */

const API = {

    init:
        initMrSmileChat,

    send:
        sendMessage,

    sendOperatorMessage,

    typeMessage,

    typeSystemMessage,

    firstContact:
        playFirstContactMessage,

    startIdle:
        startIdleMessages,

    stopIdle:
        stopIdleMessages,

    pauseIdle:
        pauseIdleMessages,

    resumeIdle:
        resumeIdleMessages,

    reveal:
        revealMrSmileChat,

    status:
        getMrSmileChatStatus,

    reset:
        resetMrSmileChat
};


/* ==========================================================
   GLOBAL WINDOW EXPORTS
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_CHAT =
        API;

    window.mrSmileChatSend =
        sendMessage;

    window.mrSmileChatSendOperator =
        sendOperatorMessage;

    window.revealMrSmileChat =
        revealMrSmileChat;

    window.initMrSmileChat =
        initMrSmileChat;

    window.MRSMILE_CHAT_STATUS =
        getMrSmileChatStatus;

    console.log(
        "[MR.SMILE CHAT] Global API ready."
    );
}


/* ==========================================================
   AUTOMATIC INITIALIZATION
========================================================== */

try {

    initMrSmileChat();

} catch (error) {

    console.error(
        "[MR.SMILE CHAT] Initialization failed:",
        error
    );
}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default API;

