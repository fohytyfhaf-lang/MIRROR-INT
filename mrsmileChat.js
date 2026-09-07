
/* ==========================================================
   MR.SMILE CHAT
   OMEGA / MIRROR-INT

   RESPONSIBILITY:
   - MR.SMILE conversation layer
   - Connects MR.SMILE logic with real OMEGA chat
   - Handles direct responses
   - Handles event-driven MR.SMILE messages
   - Handles first contact
   - Handles idle messages
   - Handles MIRROR-00 access conversation

   IMPORTANT:
   The main chat system owns:
       window.addChatMessage()

   This module does NOT create another chat system.
========================================================== */

import {
    mrSmileSay
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

let initialized = false;

let idleTimer = null;

let archiveEventRegistered = false;

let chatEventRegistered = false;

let idleEnabled = true;


/* ==========================================================
   UTILS
========================================================== */

function sleep(ms) {

    return new Promise(resolve => {

        setTimeout(
            resolve,
            ms
        );

    });

}


function getCurrentTime() {

    const now =
        new Date();

    return now.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ==========================================================
   CHAT AVAILABILITY
========================================================== */

function isChatAvailable() {

    return (
        typeof window.addChatMessage === "function"
    );

}


/* ==========================================================
   REAL OMEGA CHAT BRIDGE
========================================================== */

/*
   IMPORTANT:

   This is NOT a second chat system.

   The real OMEGA chat remains responsible for:
       - chat storage
       - rendering
       - unread counters
       - active channel
       - message list

   MR.SMILE only sends messages into it.
*/


function addMrSmileChatMessage(text) {

    if (
        text === null ||
        text === undefined
    ) {
        return false;
    }


    if (!isChatAvailable()) {

        console.warn(
            "[MR.SMILE] window.addChatMessage() unavailable."
        );

        return false;
    }


    const message =
        String(text).trim();


    if (!message) {
        return false;
    }


    window.addChatMessage(
        "mrsmile",
        {
            user: "MR.SMILE",
            time: getCurrentTime(),
            text: message
        }
    );


    return true;

}


/* ==========================================================
   SYSTEM CHAT MESSAGE
========================================================== */

function addSystemChatMessage(text) {

    if (
        text === null ||
        text === undefined
    ) {
        return false;
    }


    if (!isChatAvailable()) {

        console.warn(
            "[MR.SMILE] window.addChatMessage() unavailable."
        );

        return false;
    }


    const message =
        String(text).trim();


    if (!message) {
        return false;
    }


    window.addChatMessage(
        "mrsmile",
        {
            user: "SYSTEM",
            time: getCurrentTime(),
            text: message
        }
    );


    return true;

}


/* ==========================================================
   OPERATOR / SYSTEM COMPATIBILITY
========================================================== */

/*
   Старые системы могли использовать
   addOperatorChatMessage().

   Если это сообщение действительно относится
   к оператору, оно должно отображаться как YOU.

   При этом мы НЕ добавляем сообщение повторно
   в основной чат — только передаём его через bridge.
*/

function addOperatorChatMessage(text) {

    if (
        text === null ||
        text === undefined
    ) {
        return false;
    }


    if (!isChatAvailable()) {

        console.warn(
            "[MR.SMILE] window.addChatMessage() unavailable."
        );

        return false;
    }


    const message =
        String(text).trim();


    if (!message) {
        return false;
    }


    window.addChatMessage(
        "mrsmile",
        {
            user: "YOU",
            time: getCurrentTime(),
            text: message
        }
    );


    return true;

}


/* ==========================================================
   TYPING COMPATIBILITY
========================================================== */

/*
   Старые системы вызывают:

       typeMessage()
       typeSystemMessage()

   Теперь они используют настоящий OMEGA chat.
*/

export async function typeMessage(text) {

    addMrSmileChatMessage(
        text
    );

    await sleep(50);

}


export async function typeSystemMessage(text) {

    addSystemChatMessage(
        text
    );

    await sleep(50);

}


/* ==========================================================
   FIRST CONTACT
========================================================== */

export async function playFirstContactMessage() {

    await sleep(600);


    addMrSmileChatMessage(
        ":)"
    );


    await sleep(1200);


    addMrSmileChatMessage(
        "Hello, operator."
    );

}


/* ==========================================================
   RESPONSE TO OPERATOR
========================================================== */

async function sendMrSmileResponse(text) {

    if (
        text === null ||
        text === undefined
    ) {
        return;
    }


    const input =
        String(text).trim();


    if (!input) {
        return;
    }


    try {

        const response =
            await mrSmileSay(
                input
            );


        if (
            response === null ||
            response === undefined
        ) {
            return;
        }


        const message =
            String(response).trim();


        if (!message) {
            return;
        }


        addMrSmileChatMessage(
            message
        );


    } catch (error) {

        console.error(
            "[MR.SMILE CHAT] Response error:",
            error
        );

    }

}


/* ==========================================================
   INPUT
========================================================== */

/*
   This function is intentionally kept compatible
   with the existing OMEGA chat architecture.

   The main chats system already adds the YOU message.

   Therefore we do NOT add it here again.
*/

function sendMessage() {

    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) {

        console.warn(
            "[MR.SMILE CHAT] chatInput not found."
        );

        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    input.value = "";


    setTimeout(
        () => {

            sendMrSmileResponse(
                text
            );

        },
        700
    );

}


/* ==========================================================
   RANDOM IDLE MESSAGES
========================================================== */

const idleMessages = [

    ":)",

    "I'm still here.",

    "You are looking in the wrong place.",

    "I can see this.",

    "Nothing is wrong.",

    "Continue.",

    "You didn't close the channel.",

    "I remember.",

    "Closer than you think."

];


/* ==========================================================
   IDLE STATE
========================================================== */

function canUseIdleMessages() {

    if (!idleEnabled) {
        return false;
    }


    return (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1"
    );

}


/* ==========================================================
   SCHEDULE IDLE
========================================================== */

function scheduleRandomMessage() {

    clearTimeout(
        idleTimer
    );


    if (!canUseIdleMessages()) {

        return;

    }


    const delay =
        30000 +
        Math.random() * 60000;


    idleTimer =
        setTimeout(
            () => {

                idleTimer = null;


                if (
                    !canUseIdleMessages()
                ) {

                    scheduleRandomMessage();

                    return;

                }


                const message =
                    idleMessages[
                        Math.floor(
                            Math.random() *
                            idleMessages.length
                        )
                    ];


                addMrSmileChatMessage(
                    message
                );


                scheduleRandomMessage();

            },
            delay
        );

}


/* ==========================================================
   STOP IDLE
========================================================== */

function stopIdleMessages() {

    clearTimeout(
        idleTimer
    );

    idleTimer = null;

}


/* ==========================================================
   START IDLE
========================================================== */

function startIdleMessages() {

    stopIdleMessages();

    idleEnabled = true;

    scheduleRandomMessage();

}


/* ==========================================================
   TEMPORARY IDLE DISABLE
========================================================== */

/*
   Используется другими MR.SMILE событиями.

   Например:

       важное вмешательство
       предупреждение
       glitch
       camera event
       restricted file reaction

   Пока событие происходит, обычный idle не мешает.
*/

function disableIdleMessages() {

    idleEnabled = false;

    stopIdleMessages();

}


/* ==========================================================
   TEMPORARY IDLE ENABLE
========================================================== */

function enableIdleMessages() {

    idleEnabled = true;

    scheduleRandomMessage();

}


/* ==========================================================
   EVENT-DRIVEN MR.SMILE MESSAGE
========================================================== */

/*
   Это главный мост между:

       mrsmileBehavior
              ↓
       mrsmileEvents
              ↓
       eventManager
              ↓
       mrsmileChat

   Другой модуль НЕ должен напрямую
   вызывать window.addChatMessage().

   Вместо этого:

       trigger(
           "mrsmile:chatMessage",
           {
               text: "Don't.",
               delay: 800
           }
       );
*/


async function handleMrSmileChatMessage(data) {

    if (!data) {
        return;
    }


    if (
        data.text === null ||
        data.text === undefined
    ) {
        return;
    }


    const text =
        String(data.text).trim();


    if (!text) {
        return;
    }


    /*
       Важное событие может временно
       отключить idle-сообщения.
    */

    if (
        data.stopIdle === true
    ) {

        disableIdleMessages();

    }


    const delay =
        Number.isFinite(
            data.delay
        )
            ? Math.max(
                0,
                data.delay
            )
            : 0;


    if (delay > 0) {

        await sleep(
            delay
        );

    }


    /*
       Можно выбрать тип сообщения.

       По умолчанию:
           MR.SMILE

       Если type === "system":
           SYSTEM
    */

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


    /*
       После сообщения можно
       автоматически вернуть idle.
    */

    if (
        data.resumeIdle === true
    ) {

        enableIdleMessages();

    }

}


/* ==========================================================
   MULTI-MESSAGE EVENT
========================================================== */

/*
   Позволяет MR.SMILE сделать сцену:

       "You shouldn't be here."

       ...

       "But you already know that."

   через один event.

   Формат:

       {
           messages: [
               {
                   text: "...",
                   delay: 500
               },
               {
                   text: "...",
                   delay: 1200
               }
           ]
       }
*/

async function handleMrSmileChatSequence(data) {

    if (!data) {
        return;
    }


    if (!Array.isArray(data.messages)) {
        return;
    }


    if (data.stopIdle === true) {

        disableIdleMessages();

    }


    for (
        const message of data.messages
    ) {

        if (!message) {
            continue;
        }


        await handleMrSmileChatMessage(
            {
                ...message,
                stopIdle: false
            }
        );

    }


    if (
        data.resumeIdle === true
    ) {

        enableIdleMessages();

    }

}


/* ==========================================================
   MIRROR-00 ACCESS
========================================================== */

async function handleMirrorArchiveAccess() {

    if (
        !hasPendingMirrorArchiveAccess()
    ) {

        return;

    }


    console.log(
        "[MR.SMILE] MIRROR-00 access request received."
    );


    /*
       MIRROR-00 — важное событие.

       Поэтому обычный idle временно
       выключается.
    */

    disableIdleMessages();


    /*
       MR.SMILE не отвечает мгновенно.
    */

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


    /*
       Именно здесь MR.SMILE официально
       выдаёт доступ.
    */

    const granted =
        grantMirrorArchiveAccess();


    if (!granted) {

        console.log(
            "[MR.SMILE] MIRROR-00 access was already granted."
        );


        enableIdleMessages();

        return;

    }


    console.log(
        "[MR.SMILE] MIRROR-00 ACCESS GRANTED."
    );


    /*
       SYSTEM сообщение идёт в тот же
       MR.SMILE канал.
    */

    addSystemChatMessage(
        "MIRROR-00 ACCESS GRANTED BY MR.SMILE."
    );


    await sleep(
        500
    );


    addSystemChatMessage(
        "RESOURCE: /files/mirror_archive.txt"
    );


    /*
       Возвращаем обычное поведение.
    */

    enableIdleMessages();

}


/* ==========================================================
   EVENT REGISTRATION
========================================================== */

function registerEvents() {

    /* ------------------------------------------------------
       MIRROR-00
    ------------------------------------------------------ */

    if (
        !archiveEventRegistered
    ) {

        archiveEventRegistered = true;


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


    /* ------------------------------------------------------
       SINGLE CHAT MESSAGE
    ------------------------------------------------------ */

    if (
        !chatEventRegistered
    ) {

        chatEventRegistered = true;


        on(
            "mrsmile:chatMessage",
            data => {

                handleMrSmileChatMessage(
                    data
                );

            }
        );


        /*
           Optional sequence event.
        */

        on(
            "mrsmile:chatSequence",
            data => {

                handleMrSmileChatSequence(
                    data
                );

            }
        );

    }

}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileChat() {

    if (initialized) {
        return;
    }


    initialized = true;


    console.log(
        "[MR.SMILE CHAT] Initializing..."
    );


    registerEvents();


    /*
       Кнопка отправки намеренно НЕ
       назначается здесь.

       Основной chats.js уже управляет
       вводом пользователя.

       Это предотвращает двойную отправку.
    */


    /*
       Если FIRST CONTACT уже завершён,
       запускаем idle.
    */

    if (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1"
    ) {

        scheduleRandomMessage();

    }


    /*
       Если запрос MIRROR-00 уже существовал
       до перезагрузки страницы — продолжаем.
    */

    if (
        hasPendingMirrorArchiveAccess()
    ) {

        setTimeout(
            () => {

                handleMirrorArchiveAccess();

            },
            1000
        );

    }


    console.log(
        "[MR.SMILE CHAT] Initialized."
    );

}


/* ==========================================================
   OPTIONAL DIRECT SEND
========================================================== */

/*
   Позволяет другому модулю напрямую
   попросить MR.SMILE ответить оператору.

   Здесь используется mrSmileSay(),
   поэтому это именно "ответ", а не
   принудительная реплика.
*/

export function mrSmileChatSend(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return;

    }


    const message =
        String(text).trim();


    if (!message) {
        return;
    }


    sendMrSmileResponse(
        message
    );

}


/* ==========================================================
   DIRECT EVENT MESSAGE
========================================================== */

/*
   Прямой экспорт для JS-модулей.

   Используется, если модулю удобнее
   не работать через eventManager.

   Пример:

       mrSmileChatMessage(
           "Don't."
       );
*/

export function mrSmileChatMessage(
    text,
    options = {}
) {

    if (
        text === null ||
        text === undefined
    ) {

        return false;

    }


    const message =
        String(text).trim();


    if (!message) {
        return false;
    }


    handleMrSmileChatMessage(
        {
            text: message,
            ...options
        }
    );


    return true;

}


/* ==========================================================
   CHAT SEQUENCE
========================================================== */

/*
   Прямой API для последовательности сообщений.
*/

export async function mrSmileChatSequence(
    messages,
    options = {}
) {

    if (
        !Array.isArray(messages)
    ) {

        return;

    }


    await handleMrSmileChatSequence(
        {
            messages,
            ...options
        }
    );

}


/* ==========================================================
   GLOBAL DEBUG
========================================================== */

window.debugMrSmileChat = {

    /*
       Прямое сообщение MR.SMILE.
    */

    send(text) {

        if (!text) {
            return;
        }


        addMrSmileChatMessage(
            String(text)
        );

    },


    /*
       SYSTEM сообщение.
    */

    system(text) {

        if (!text) {
            return;
        }


        addSystemChatMessage(
            String(text)
        );

    },


    /*
       Сообщение YOU.
       Использовать только для debug/testing,
       поскольку обычный chats.js уже
       добавляет сообщения оператора.
    */

    operator(text) {

        if (!text) {
            return;
        }


        addOperatorChatMessage(
            String(text)
        );

    },


    /*
       FIRST CONTACT.
    */

    firstContact() {

        playFirstContactMessage();

    },


    /*
       MIRROR-00.
    */

    mirrorAccess() {

        handleMirrorArchiveAccess();

    },


    /*
       Проверка event-driven сообщения.
    */

    event(text) {

        if (!text) {
            return;
        }


        handleMrSmileChatMessage(
            {
                text: String(text)
            }
        );

    },


    /*
       Проверка последовательности.
    */

    sequence(messages) {

        if (
            !Array.isArray(messages)
        ) {

            return;
        }


        handleMrSmileChatSequence(
            {
                messages
            }
        );

    },


    /*
       Idle.
    */

    stopIdle() {

        disableIdleMessages();

    },


    startIdle() {

        enableIdleMessages();

    },


    /*
       Status.
    */

    status() {

        return {

            initialized,

            idleEnabled,

            idleRunning:
                idleTimer !== null,

            firstContact:
                localStorage.getItem(
                    "mrsmile_first_contact"
                ) === "1",

            chatAvailable:
                isChatAvailable(),

            archivePending:
                hasPendingMirrorArchiveAccess()

        };

    }

};
sequenceTest() {

    trigger(
        "mrsmile:chatSequence",
        {
            stopIdle: true,

            messages: [
                {
                    text: "You shouldn't be here.",
                    delay: 500
                },
                {
                    text: "But you already know that.",
                    delay: 1400
                },
                {
                    text: "Continue.",
                    delay: 1000
                }
            ],

            resumeIdle: true
        }
    );

},
