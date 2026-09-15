/* ==========================================================
   MR.SMILE CHAT — COMPLETE REBUILD
   OMEGA / MIRROR-INT

   Responsibility:
   - bridge the real OMEGA chat UI
   - receive operator messages
   - pass them through the living dialogue layer
   - preserve First Contact
   - preserve idle behaviour
   - preserve operator actions
   - preserve MIRROR-00 access
   - prevent duplicate Core calls

   MR.SMILE is an inhabitant of reflections, not an ordinary AI.
   The chat layer must never invent his personality.
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


const STATE = {
    initialized: false,
    chatBridgeReady: false,
    channelInitializationPending: false,
    channelInitialized: false,

    channel: "mrsmile",

    firstContactPlayed: false,

    operatorProcessing: false,
    responseSequence: 0,

    idleTimer: null,
    idleEnabled: true,
    idleRunning: false,

    lastOperatorMessage: "",
    lastMrSmileMessage: "",

    lastOperatorTime: 0,
    lastMrSmileTime: 0,

    responseCooldownUntil: 0,
    lastIdleTime: 0,

    eventHandlersRegistered: false,
    archiveHandlerRegistered: false,
    operatorHandlerRegistered: false,
    actionHandlerRegistered: false
};


const CONFIG = {
    channel: "mrsmile",

    responseCooldown: 900,

    minResponseDelay: 500,
    maxResponseDelay: 4500,

    idleMinDelay: 60000,
    idleMaxDelay: 150000,

    firstContactEnabled: true,
    idleEnabled: true,

    preventDuplicateMessageMs: 1200
};


function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(
            resolve,
            Math.max(0, Number(ms) || 0)
        )
    );
}


function now() {
    return Date.now();
}


function cleanText(value) {
    return String(value ?? "").trim();
}


function random(min, max) {
    return (
        Math.floor(
            Math.random() * (max - min + 1)
        ) + min
    );
}


function clamp(value, min, max) {
    return Math.max(
        min,
        Math.min(max, value)
    );
}


function chatAvailable() {
    return (
        typeof window !== "undefined" &&
        typeof window.addChatMessage === "function"
    );
}


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

    STATE.channelInitializationPending = true;

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


function pushChatMessage(
    user,
    text
) {
    const message =
        cleanText(text);

    if (!message || !chatAvailable()) {
        return false;
    }

    try {
        window.addChatMessage(
            CONFIG.channel,
            {
                user,
                time:
                    new Date().toLocaleTimeString(
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


function addMrSmileChatMessage(text) {
    const message =
        cleanText(text);

    if (!message) {
        return false;
    }

    STATE.lastMrSmileMessage =
        message;

    STATE.lastMrSmileTime =
        now();

    return pushChatMessage(
        "MR.SMILE",
        message
    );
}


function addSystemChatMessage(text) {
    return pushChatMessage(
        "SYSTEM",
        text
    );
}


function extractResponseText(result) {
    if (
        result === null ||
        result === undefined
    ) {
        return "";
    }

    if (typeof result === "string") {
        return cleanText(result);
    }

    if (typeof result === "object") {
        if (typeof result.text === "string") {
            return cleanText(result.text);
        }

        if (typeof result.message === "string") {
            return cleanText(result.message);
        }

        if (typeof result.response === "string") {
            return cleanText(result.response);
        }
    }

    return "";
}


function extractResponseDelay(result) {
    if (!result || typeof result !== "object") {
        return CONFIG.minResponseDelay;
    }

    const delay =
        Number(result.delay);

    if (!Number.isFinite(delay)) {
        return CONFIG.minResponseDelay;
    }

    return clamp(
        delay,
        CONFIG.minResponseDelay,
        CONFIG.maxResponseDelay
    );
}


function isDuplicateIncoming(text) {
    const message =
        cleanText(text);

    if (!message) {
        return true;
    }

    const current =
        now();

    return (
        message === STATE.lastMrSmileMessage &&
        current - STATE.lastMrSmileTime <
            CONFIG.preventDuplicateMessageMs
    );
}


async function outputMrSmile(
    result,
    options = {}
) {
    const text =
        extractResponseText(result);

    if (!text) {
        return false;
    }

    if (isDuplicateIncoming(text)) {
        return false;
    }

    const requestedDelay =
        options.instant
            ? 0
            : extractResponseDelay(result);

    const extraDelay =
        Number(options.extraDelay) || 0;

    const delay =
        clamp(
            requestedDelay + extraDelay,
            0,
            CONFIG.maxResponseDelay
        );

    if (delay > 0) {
        await sleep(delay);
    }

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
        addMrSmileChatMessage(text);

    if (sent) {
        STATE.responseCooldownUntil =
            now() +
            CONFIG.responseCooldown;
    }

    return sent;
}


/* ==========================================================
   OPERATOR PROCESSING
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

    const current =
        now();

    if (
        input === STATE.lastOperatorMessage &&
        current - STATE.lastOperatorTime <
            CONFIG.responseCooldown
    ) {
        console.warn(
            "[MR.SMILE CHAT] Duplicate operator event ignored."
        );

        return null;
    }

    STATE.lastOperatorMessage =
        input;

    STATE.lastOperatorTime =
        current;

    if (STATE.operatorProcessing) {
        await sleep(150);
    }

    STATE.operatorProcessing =
        true;

    try {
        /*
           ONE and only ONE call into the dialogue/Core pipeline.
        */
        const result =
            processMrSmileDialogue(
                input,
                {
                    instant:
                        options.instant === true
                }
            );

        if (!result) {
            return null;
        }

        const response =
            await outputMrSmile(
                result,
                options
            );

        return {
            input,
            result,
            response
        };

    } catch (error) {
        console.error(
            "[MR.SMILE CHAT] Dialogue processing error:",
            error
        );

        const fallback = {
            ok: true,
            text: "I see.",
            delay: 900,
            intent: "unknown_statement",
            emergency: true
        };

        await outputMrSmile(
            fallback,
            {
                extraDelay: 200
            }
        );

        return {
            input,
            result: fallback,
            response: true,
            error
        };

    } finally {
        STATE.operatorProcessing =
            false;
    }
}


export async function sendOperatorMessage(
    text,
    options = {}
) {
    return processOperatorMessage(
        text,
        options
    );
}


export async function sendMessage(text) {
    return processOperatorMessage(text);
}


export async function typeMessage(text) {
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


export async function typeSystemMessage(text) {
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

export async function playFirstContactMessage(
    options = {}
) {
    if (
        STATE.firstContactPlayed &&
        options.force !== true
    ) {
        return false;
    }

    STATE.firstContactPlayed =
        true;

    try {
        localStorage.setItem(
            "mrsmile_first_contact",
            "1"
        );
    } catch {
        // Optional persistence only.
    }

    if (
        options.systemMessages !== false
    ) {
        await sleep(500);

        addSystemChatMessage(
            "PRIVATE COMMUNICATION CHANNEL INITIALIZED."
        );

        await sleep(700);

        addSystemChatMessage(
            "REMOTE PARTICIPANT PRESENT."
        );
    }

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

    if (
        options.startIdle !== false
    ) {
        startIdleMessages();
    }

    return true;
}


async function handleFirstContact(data = {}) {
    await playFirstContactMessage(data);
}


/* ==========================================================
   IDLE
========================================================== */

function getIdlePrompt() {
    const prompts = [
        "You have been quiet.",
        "Take your time.",
        "I am still here.",
        "Is there something you were considering?",
        "Perhaps you had another question.",
        "You seem to be thinking.",
        "There is no particular hurry.",
        "You may continue when you are ready."
    ];

    return prompts[
        random(
            0,
            prompts.length - 1
        )
    ];
}


function scheduleIdleMessages() {
    clearTimeout(
        STATE.idleTimer
    );

    if (
        !CONFIG.idleEnabled ||
        !STATE.idleEnabled ||
        !STATE.firstContactPlayed
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

                scheduleIdleMessages();
            },
            delay
        );
}


async function performIdleMessage() {
    if (STATE.idleRunning) {
        return false;
    }

    if (!STATE.firstContactPlayed) {
        return false;
    }

    STATE.idleRunning =
        true;

    try {
        const prompt =
            getIdlePrompt();

        const result =
            processMrSmileDialogue(
                prompt,
                {
                    instant: false
                }
            );

        if (!result) {
            return false;
        }

        const text =
            extractResponseText(result);

        if (!text) {
            return false;
        }

        await outputMrSmile(
            result,
            {
                extraDelay: 2200
            }
        );

        STATE.lastIdleTime =
            now();

        return true;

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


export function startIdleMessages() {
    STATE.idleEnabled =
        true;

    scheduleIdleMessages();
}


export function stopIdleMessages() {
    STATE.idleEnabled =
        false;

    clearTimeout(
        STATE.idleTimer
    );

    STATE.idleTimer =
        null;
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
}


/* ==========================================================
   EVENTS
========================================================== */

async function handleChatMessage(data) {
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

    if (data.stopIdle === true) {
        pauseIdleMessages();
    }

    const delay =
        Number.isFinite(
            Number(data.delay)
        )
            ? Number(data.delay)
            : 0;

    await sleep(
        Math.max(0, delay)
    );

    if (data.type === "system") {
        addSystemChatMessage(text);
    } else {
        addMrSmileChatMessage(text);
    }

    if (data.resumeIdle === true) {
        resumeIdleMessages();
    }
}


async function handleChatSequence(data) {
    if (
        !data ||
        !Array.isArray(data.messages)
    ) {
        return;
    }

    pauseIdleMessages();

    for (const item of data.messages) {
        if (!item) {
            continue;
        }

        await handleChatMessage({
            ...item,
            stopIdle: false,
            resumeIdle: false
        });
    }

    if (data.resumeIdle !== false) {
        resumeIdleMessages();
    }
}


async function handleOperatorEvent(data) {
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
        data.source === "mrsmile" ||
        data.user === "MR.SMILE"
    ) {
        return;
    }

    await processOperatorMessage(
        text,
        {
            instant:
                data.instant === true
        }
    );
}


async function handleOperatorAction(data) {
    if (!data) {
        return;
    }

    try {
        const result =
            reactToAction(data);

        if (!result || result.speak !== true) {
            return;
        }

        const text =
            extractResponseText(result);

        if (!text) {
            return;
        }

        await outputMrSmile(result);

    } catch (error) {
        console.error(
            "[MR.SMILE CHAT] Action reaction error:",
            error
        );
    }
}


async function handleMirrorArchiveAccess() {
    try {
        if (!hasPendingMirrorArchiveAccess()) {
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
    if (STATE.eventHandlersRegistered) {
        return;
    }

    STATE.eventHandlersRegistered =
        true;

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

    try {
        on(
            "mrsmile:mirrorArchiveAccess",
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
   REVEAL
========================================================== */

export function revealMrSmileChat() {
    try {
        if (
            typeof window !== "undefined" &&
            typeof window.openChat === "function"
        ) {
            window.openChat("mrsmile");
            return true;
        }

        const channel =
            document.querySelector(
                '[data-chat="mrsmile"]'
            );

        if (channel) {
            channel.click();
            return true;
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

function initializeChannel() {
    if (STATE.channelInitialized) {
        return true;
    }

    if (!chatAvailable()) {
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

    try {
        if (
            typeof window !== "undefined" &&
            typeof window.getChat === "function"
        ) {
            const chat =
                window.getChat("mrsmile");

            if (
                chat &&
                Array.isArray(chat.messages) &&
                chat.messages.length > 0
            ) {
                STATE.channelInitialized =
                    true;

                return true;
            }
        }
    } catch {
        // Compatibility lookup is optional.
    }

    const systemOne =
        addSystemChatMessage(
            "PRIVATE COMMUNICATION CHANNEL INITIALIZED."
        );

    const systemTwo =
        addSystemChatMessage(
            "REMOTE PARTICIPANT PRESENT."
        );

    const smileOne =
        addMrSmileChatMessage(
            "Good evening."
        );

    const smileTwo =
        addMrSmileChatMessage(
            "Please, take your time."
        );

    const smileThree =
        addMrSmileChatMessage(
            "There is no particular hurry."
        );

    if (
        systemOne ||
        systemTwo ||
        smileOne ||
        smileTwo ||
        smileThree
    ) {
        STATE.channelInitialized =
            true;

        return true;
    }

    STATE.channelInitializationPending =
        true;

    waitForChatBridge(
        () =>
            initializeChannel()
    );

    return false;
}


/* ==========================================================
   INIT / STATUS / RESET
========================================================== */

export function initMrSmileChat(
    options = {}
) {
    if (STATE.initialized) {
        return {
            ok: true,
            alreadyInitialized: true,
            state: getMrSmileChatStatus()
        };
    }

    STATE.initialized =
        true;

    registerEvents();

    if (
        options.initializeChannel !== false
    ) {
        initializeChannel();
    }

    if (
        options.startIdle !== false &&
        CONFIG.idleEnabled
    ) {
        try {
            if (
                localStorage.getItem(
                    "mrsmile_first_contact"
                ) === "1"
            ) {
                STATE.firstContactPlayed =
                    true;

                startIdleMessages();
            }
        } catch {
            // Optional persistence only.
        }
    }

    console.log(
        "[MR.SMILE CHAT] Living dialogue bridge initialized."
    );

    return {
        ok: true,
        initialized: true,
        state:
            getMrSmileChatStatus()
    };
}


export function getMrSmileChatStatus() {
    return {
        initialized:
            STATE.initialized,

        firstContactPlayed:
            STATE.firstContactPlayed,

        operatorProcessing:
            STATE.operatorProcessing,

        idleEnabled:
            STATE.idleEnabled,

        idleRunning:
            STATE.idleRunning,

        lastOperatorMessage:
            STATE.lastOperatorMessage,

        lastMrSmileMessage:
            STATE.lastMrSmileMessage,

        lastOperatorTime:
            STATE.lastOperatorTime,

        lastMrSmileTime:
            STATE.lastMrSmileTime,

        responseCooldownUntil:
            STATE.responseCooldownUntil,

        eventHandlersRegistered:
            STATE.eventHandlersRegistered,

        channel:
            STATE.channel
    };
}


export function resetMrSmileChat(
    options = {}
) {
    stopIdleMessages();

    STATE.firstContactPlayed =
        false;

    STATE.operatorProcessing =
        false;

    STATE.lastOperatorMessage =
        "";

    STATE.lastMrSmileMessage =
        "";

    STATE.lastOperatorTime =
        0;

    STATE.lastMrSmileTime =
        0;

    STATE.responseCooldownUntil =
        0;

    if (
        options.restartIdle === true
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


if (
    typeof window !== "undefined"
) {
    window.MRSMILE_CHAT =
        API;

    window.mrSmileChatSend =
        sendMessage;

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


try {
    initMrSmileChat();
} catch (error) {
    console.error(
        "[MR.SMILE CHAT] Initialization failed:",
        error
    );
}


export default API;
