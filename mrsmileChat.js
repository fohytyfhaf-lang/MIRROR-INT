/* ==========================================================
   MR.SMILE CHAT
   OMEGA / MIRROR-INT
========================================================== */

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
let archiveEventRegistered = false;


/* ==========================================================
   UTILS
========================================================== */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function getCurrentTime() {
    const now = new Date();

    return now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* ==========================================================
   REAL OMEGA CHAT BRIDGE
========================================================== */

function addMrSmileChatMessage(text) {

    if (typeof window.addChatMessage !== "function") {
        console.warn(
            "[MR.SMILE] window.addChatMessage() unavailable."
        );

        return false;
    }

    window.addChatMessage("mrsmile", {
        user: "MR.SMILE",
        time: getCurrentTime(),
        text: text
    });

    return true;
}


function addSystemChatMessage(text) {

    if (typeof window.addChatMessage !== "function") {
        console.warn(
            "[MR.SMILE] window.addChatMessage() unavailable."
        );

        return false;
    }

    window.addChatMessage("mrsmile", {
        user: "SYSTEM",
        time: getCurrentTime(),
        text: text
    });

    return true;
}


function addOperatorChatMessage(text) {

    if (typeof window.addChatMessage !== "function") {
        console.warn(
            "[MR.SMILE] window.addChatMessage() unavailable."
        );

        return false;
    }

    window.addChatMessage("mrsmile", {
        user: "SYSTEM",
        time: getCurrentTime(),
        text: text
    });

    return true;
}


/* ==========================================================
   TYPING COMPATIBILITY
   ==========================================================

   Старые системы вызывают typeMessage() / typeSystemMessage().
   Теперь они просто отправляют сообщение в настоящий OMEGA chat.
========================================================== */

export async function typeMessage(text) {

    addMrSmileChatMessage(text);

    await sleep(50);
}


export async function typeSystemMessage(text) {

    addSystemChatMessage(text);

    await sleep(50);
}


/* ==========================================================
   FIRST CONTACT
========================================================== */

export async function playFirstContactMessage() {

    await sleep(600);

    addMrSmileChatMessage(":)");

    await sleep(1200);

    addMrSmileChatMessage("Hello, operator.");
}


/* ==========================================================
   MR.SMILE RESPONSE
========================================================== */

async function sendMrSmileResponse(text) {

    try {

        const response = await mrSmileSay(text);

        if (!response) {
            return;
        }

        addMrSmileChatMessage(response);

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

function sendMessage() {

    const input = document.getElementById("chatInput");

    if (!input) {
        console.warn(
            "[MR.SMILE CHAT] chatInput not found."
        );

        return;
    }

    const text = input.value.trim();

    if (!text) {
        return;
    }

    input.value = "";

    /*
       ВАЖНО:

       Само добавление сообщения пользователя уже делает
       chats.js.

       Поэтому здесь НЕ добавляем YOU повторно.
    */

    setTimeout(() => {

        sendMrSmileResponse(text);

    }, 700);

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


function scheduleRandomMessage() {

    clearTimeout(idleTimer);

    const delay =
        30000 +
        Math.random() * 60000;

    idleTimer = setTimeout(() => {

        /*
           Не отправляем случайные сообщения,
           если MR.SMILE ещё не открыт.
        */

        if (
            localStorage.getItem(
                "mrsmile_first_contact"
            ) !== "1"
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


        addMrSmileChatMessage(message);

        scheduleRandomMessage();

    }, delay);
}


/* ==========================================================
   MIRROR-00 ACCESS
========================================================== */

async function handleMirrorArchiveAccess() {

    if (!hasPendingMirrorArchiveAccess()) {
        return;
    }


    console.log(
        "[MR.SMILE] MIRROR-00 access request received."
    );


    clearTimeout(idleTimer);


    /*
       MR.SMILE отвечает не мгновенно.
    */

    await sleep(900);


    addMrSmileChatMessage(
        "You were looking for the Mirror."
    );


    await sleep(1200);


    addMrSmileChatMessage(
        "I've given you access."
    );


    await sleep(700);


    /*
       Именно здесь MR.SMILE официально выдаёт доступ.
    */

    const granted =
        grantMirrorArchiveAccess();


    if (!granted) {

        console.log(
            "[MR.SMILE] MIRROR-00 access was already granted."
        );

        scheduleRandomMessage();

        return;
    }


    console.log(
        "[MR.SMILE] MIRROR-00 ACCESS GRANTED."
    );


    /*
       SYSTEM сообщение идёт в тот же MR.SMILE канал,
       поэтому пользователь реально его увидит.
    */

    addSystemChatMessage(
        "MIRROR-00 ACCESS GRANTED BY MR.SMILE."
    );


    await sleep(500);


    addSystemChatMessage(
        "RESOURCE: /files/mirror_archive.txt"
    );


    /*
       После выдачи доступа возвращаем обычное
       поведение MR.SMILE.
    */

    scheduleRandomMessage();
}


/* ==========================================================
   EVENT REGISTRATION
========================================================== */

function registerEvents() {

    if (archiveEventRegistered) {
        return;
    }

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
       Кнопка отправки.

       Обычно sendMessage уже обрабатывается chats.js,
       поэтому здесь НЕ назначаем onclick повторно.

       Это важно, чтобы одно сообщение не отправлялось дважды.
    */


    /*
       Если FIRST CONTACT уже был завершён,
       запускаем idle-сообщения.
    */

    if (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1"
    ) {

        scheduleRandomMessage();

    }


    /*
       Если запрос MIRROR-00 уже существовал до
       перезагрузки страницы — продолжаем его.
    */

    if (
        hasPendingMirrorArchiveAccess()
    ) {

        setTimeout(() => {

            handleMirrorArchiveAccess();

        }, 1000);

    }


    console.log(
        "[MR.SMILE CHAT] Initialized."
    );
}


/* ==========================================================
   OPTIONAL DIRECT SEND
   ========================================================== */

export function mrSmileChatSend(text) {

    if (!text) {
        return;
    }

    sendMrSmileResponse(
        String(text).trim()
    );
}


/* ==========================================================
   GLOBAL DEBUG
========================================================== */

window.debugMrSmileChat = {

    send(text) {

        if (!text) {
            return;
        }

        addMrSmileChatMessage(
            String(text)
        );

    },

    system(text) {

        if (!text) {
            return;
        }

        addSystemChatMessage(
            String(text)
        );

    },

    firstContact() {

        playFirstContactMessage();

    },

    mirrorAccess() {

        handleMirrorArchiveAccess();

    },

    stopIdle() {

        clearTimeout(idleTimer);

    },

    startIdle() {

        scheduleRandomMessage();

    }

};
