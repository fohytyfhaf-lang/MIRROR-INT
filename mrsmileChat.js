/* ==========================================================
   MR.SMILE CHAT — COMPLETE REBUILD
   OMEGA / MIRROR-INT

   RESPONSIBILITY:
   - Real OMEGA MR.SMILE channel bridge
   - Operator -> MR.SMILE
   - MR.SMILE -> OMEGA
   - Core integration
   - Event integration
   - First Contact
   - Autonomous idle behavior
   - MIRROR-00 access
   - Compatibility with older modules

   IMPORTANT:
   The REAL chat system owns:
       window.addChatMessage()

   This module does NOT create another chat UI.
========================================================== */


/* ==========================================================
   IMPORTS
========================================================== */

import {
    mrSmileSay,
    reactToAction
} from "./mrsmileCore.js";

import {
    on,
    trigger
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


/* ==========================================================
   CONFIG
========================================================== */

const CONFIG = {

    channel:
        "mrsmile",

    responseCooldown:
        900,

    minResponseDelay:
        500,

    maxResponseDelay:
        4500,

    idleMinDelay:
        45000,

    idleMaxDelay:
        110000,

    firstContactEnabled:
        true,

    idleEnabled:
        true,

    preventDuplicateMessageMs:
        1200

};


/* ==========================================================
   UTILS
========================================================== */

function sleep(ms) {

    const safeMs =
        Math.max(
            0,
            Number(ms) || 0
        );

    return new Promise(resolve => {

        setTimeout(
            resolve,
            safeMs
        );

    });

}


function now() {

    return Date.now();

}


function cleanText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim();

}


function isValidText(value) {

    return cleanText(value).length > 0;

}


function random(min, max) {

    return (
        Math.floor(
            Math.random() *
            (max - min + 1)
        ) +
        min
    );

}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );

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
   CHAT BRIDGE
========================================================== */

function pushChatMessage(
    user,
    text
) {

    const message =
        cleanText(text);

    if (!message) {
        return false;
    }

    if (!chatAvailable()) {

        console.warn(
            "[MR.SMILE CHAT] OMEGA chat unavailable."
        );

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


function addOperatorChatMessage(text) {

    return pushChatMessage(
        "YOU",
        text
    );

}


/* ==========================================================
   CORE RESULT NORMALIZATION
========================================================== */

/*
   Новый Core возвращает:

   {
       ok: true,
       text: "...",
       intent: "...",
       language: "...",
       delay: 1200,
       ...
   }

   Старые версии могли вернуть просто string.

   Поэтому Chat принимает ОБА варианта.
*/

function extractResponseText(result) {

    if (
        result === null ||
        result === undefined
    ) {
        return "";
    }


    if (
        typeof result === "string"
    ) {
        return cleanText(
            result
        );
    }


    if (
        typeof result === "object"
    ) {

        if (
            typeof result.text === "string"
        ) {
            return cleanText(
                result.text
            );
        }

        if (
            typeof result.message === "string"
        ) {
            return cleanText(
                result.message
            );
        }

        if (
            typeof result.response === "string"
        ) {
            return cleanText(
                result.response
            );
        }

    }


    return "";
}


function extractResponseDelay(result) {

    if (
        !result ||
        typeof result !== "object"
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
   DUPLICATE PROTECTION
========================================================== */

function isDuplicateIncoming(text) {

    const message =
        cleanText(text);

    if (!message) {
        return true;
    }


    const current =
        now();


    if (
        message ===
            STATE.lastMrSmileMessage &&
        current -
            STATE.lastMrSmileTime <
            CONFIG.preventDuplicateMessageMs
    ) {
        return true;
    }


    return false;

}


/* ==========================================================
   MR.SMILE OUTPUT
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


    if (
        isDuplicateIncoming(text)
    ) {
        return false;
    }


    const requestedDelay =
        options.instant
            ? 0
            : extractResponseDelay(
                result
            );


    const extraDelay =
        Number(options.extraDelay) || 0;


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
       Avoid sending two answers
       at exactly the same moment.
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
   OPERATOR MESSAGE PROCESSING
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
       Anti-double-processing:
       if the exact same operator message
       arrives multiple times almost instantly,
       process it only once.
    */

    const current =
        now();


    if (
        input ===
            STATE.lastOperatorMessage &&
        current -
            STATE.lastOperatorTime <
            CONFIG.responseCooldown
    ) {

        console.warn(
            "[MR.SMILE CHAT] Duplicate operator message ignored."
        );

        return null;

    }


    STATE.lastOperatorMessage =
        input;

    STATE.lastOperatorTime =
        current;


    if (
        STATE.operatorProcessing
    ) {

        /*
           Do not throw the message away.
           Queue it through a micro-delay.
        */

        await sleep(150);

    }


    STATE.operatorProcessing =
        true;


    try {

        const result =
            mrSmileSay(
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
            "[MR.SMILE CHAT] Core processing error:",
            error
        );

        /*
           Emergency fallback.
           This is intentionally minimal;
           actual personality remains in Core.
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


/* ==========================================================
   PUBLIC OPERATOR MESSAGE API
========================================================== */

export async function sendOperatorMessage(
    text,
    options = {}
) {

    return processOperatorMessage(
        text,
        options
    );

}


/* ==========================================================
   LEGACY COMPATIBILITY
========================================================== */

/*
   Older systems may call:

       typeMessage()
       typeSystemMessage()

   Keep them working.
*/


export async function typeMessage(text) {

    const message =
        cleanText(text);

    if (!message) {
        return false;
    }


    await sleep(
        50
    );


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


    await sleep(
        50
    );


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


    /*
       Important:
       First Contact messages stay
       separate from ordinary Core answers.
    */

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


    /*
       Start autonomous behavior only
       after First Contact is complete.
    */

    if (
        options.startIdle !== false
    ) {
        startIdleMessages();
    }


    return true;

}


/* ==========================================================
   FIRST CONTACT EVENT
========================================================== */

async function handleFirstContact(
    data = {}
) {

    if (
        STATE.firstContactPlayed &&
        data.force !== true
    ) {
        return;
    }


    await playFirstContactMessage(
        data
    );

}


/* ==========================================================
   IDLE
========================================================== */

/*
   IMPORTANT:

   Старый Chat имел собственный массив:

       idleMessages = [...]

   Он удалён.

   Теперь idle-сообщение формируется
   ЧЕРЕЗ CORE.

   Это значит:

       язык оператора
       текущее состояние Core
       память
       личность
       логика ответа

   остаются едиными.
*/


function getIdlePrompt() {

    const prompts = [

        "Please say something when you are ready.",

        "What are you thinking about?",

        "Is there something you would like to ask me?",

        "You have been quiet.",

        "Take your time.",

        "I am still here.",

        "Continue.",

        "You may speak.",

        "Perhaps there is another question.",

        "What would you like to know?"

    ];


    return (
        prompts[
            random(
                0,
                prompts.length - 1
            )
        ]
    );

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

    if (
        STATE.idleRunning
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

        /*
           Idle is still processed by Core.
           Это даёт ему возможность отвечать
           в текущем языке.
        */

        const prompt =
            getIdlePrompt();


        const result =
            mrSmileSay(
                prompt,
                {
                    instant: false
                }
            );


        if (!result) {
            return false;
        }


        /*
           Для idle мы не показываем
           вопрос самому оператору.
           Используем только полученный ответ.
        */

        const text =
            extractResponseText(
                result
            );


        if (!text) {
            return false;
        }


        const delay =
            Math.max(
                2500,
                extractResponseDelay(
                    result
                )
            );


        await outputMrSmile(
            result,
            {
                extraDelay:
                    delay
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


/* ==========================================================
   START IDLE
========================================================== */

export function startIdleMessages() {

    STATE.idleEnabled =
        true;

    scheduleIdleMessages();

}


/* ==========================================================
   STOP IDLE
========================================================== */

export function stopIdleMessages() {

    STATE.idleEnabled =
        false;

    clearTimeout(
        STATE.idleTimer
    );

    STATE.idleTimer =
        null;

}


/* ==========================================================
   TEMPORARY IDLE DISABLE
========================================================== */

export function pauseIdleMessages() {

    clearTimeout(
        STATE.idleTimer
    );

    STATE.idleTimer =
        null;

}


/* ==========================================================
   RESUME IDLE
========================================================== */

export function resumeIdleMessages() {

    STATE.idleEnabled =
        true;

    scheduleIdleMessages();

}


/* ==========================================================
   EVENT: DIRECT CHAT MESSAGE
========================================================== */

async function handleChatMessage(data) {

    if (!data) {
        return;
    }


    /*
       Compatibility:

       {
           text: "...",
           delay: 1000
       }

       or:

       {
           message: "..."
       }
    */

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


    await sleep(
        Math.max(
            0,
            delay
        )
    );


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
   EVENT: CHAT SEQUENCE
========================================================== */

async function handleChatSequence(data) {

    if (!data) {
        return;
    }


    if (
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
   EVENT: OPERATOR MESSAGE
========================================================== */

/*
   chats.js should do:

       trigger(
           "mrsmile:operatorMessage",
           {
               text
           }
       );

   The main chat should remain responsible
   for displaying YOU.
*/

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
       Never process MR.SMILE's own messages
       as operator input.
    */

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


/* ==========================================================
   EVENT: OPERATOR ACTION
========================================================== */

async function handleOperatorAction(
    data
) {

    if (!data) {
        return;
    }


    try {

        const result =
            reactToAction(
                data
            );


        if (!result) {
            return;
        }


        if (
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


        console.log(
            "[MR.SMILE CHAT] MIRROR-00 access pending."
        );


        pauseIdleMessages();


        await sleep(
            900
        );


        addMrSmileChatMessage(
            "You were looking for the Mirror."
        );


        await sleep(
            1200
        );


        addMrSmileChatMessage(
            "I've given you access."
        );


        await sleep(
            700
        );


        const granted =
            grantMirrorArchiveAccess();


        if (
            granted === false
        ) {

            console.log(
                "[MR.SMILE CHAT] MIRROR-00 access already granted."
            );

        }


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


    STATE.eventHandlersRegistered =
        true;


    /*
       First Contact
    */

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


    /*
       Direct MR.SMILE message
    */

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


    /*
       Multiple messages
    */

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


    /*
       Operator text
    */

    if (
        !STATE.operatorHandlerRegistered
    ) {

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

    }


    /*
       Operator actions
    */

    if (
        !STATE.actionHandlerRegistered
    ) {

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

    }


    /*
       MIRROR-00
    */

    if (
        !STATE.archiveHandlerRegistered
    ) {

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

}


/* ==========================================================
   PUBLIC INPUT BRIDGE
========================================================== */

/*
   This is intentionally NOT bound to the send button.

   The main chats.js remains responsible for UI.

   This bridge exists for compatibility with
   older modules that call:

       window.MRSMILE_CHAT.sendMessage(...)
*/


export async function sendMessage(text) {

    return processOperatorMessage(
        text
    );

}


/* ==========================================================
   REVEAL CHAT
========================================================== */

export function revealMrSmileChat() {

    try {

        /*
           Prefer existing global chat opener.
        */

        if (
            typeof window !== "undefined" &&
            typeof window.openChat === "function"
        ) {

            window.openChat(
                "mrsmile"
            );

            return true;

        }


        /*
           Fallback:
           switch known channel selectors.
        */

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
   INITIAL MESSAGE
========================================================== */

function initializeChannel() {

    /*
       Do not duplicate the initialization
       if another module already opened the channel.
    */

    try {

        if (
            typeof window !== "undefined" &&
            typeof window.getChat === "function"
        ) {

            const chat =
                window.getChat(
                    "mrsmile"
                );

            if (
                chat &&
                Array.isArray(chat.messages) &&
                chat.messages.length > 0
            ) {
                return;
            }

        }

    } catch {
        // Ignore compatibility lookup failures
    }


    addSystemChatMessage(
        "PRIVATE COMMUNICATION CHANNEL INITIALIZED."
    );


    addSystemChatMessage(
        "REMOTE PARTICIPANT PRESENT."
    );


    addMrSmileChatMessage(
        "Good evening."
    );


    addMrSmileChatMessage(
        "Please, take your time."
    );


    addMrSmileChatMessage(
        "There is no particular hurry."
    );

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

        /*
           Idle begins only after First Contact
           unless explicitly forced.
        */

        if (
            localStorage.getItem(
                "mrsmile_first_contact"
            ) === "1"
        ) {

            STATE.firstContactPlayed =
                true;

            startIdleMessages();

        }

    }


    console.log(
        "[MR.SMILE CHAT] Rebuilt chat module initialized."
    );


    return {
        ok: true,
        initialized: true,
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


/* ==========================================================
   RESET
========================================================== */

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


/* ==========================================================
   AUTO INIT
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
