/* ==========================================================
   OMEGA INTERNAL CHATS
   ----------------------------------------------------------
   REAL OMEGA CHAT SYSTEM — REBUILT

   RESPONSIBILITIES:
   - channels
   - message history
   - chat rendering
   - unread counters
   - personnel responses
   - MR.SMILE channel
   - NULL channel
   - chat context
   - operator input routing

   IMPORTANT:

   MR.SMILE HAS NO PERSONALITY LOGIC HERE.

   MR.SMILE PATH:

       USER INPUT
           ↓
       chats.js
           ↓
       mrsmile:operatorMessage
           ↓
       mrsmileChat.js
           ↓
       mrsmileCore.js
           ↓
       RESPONSE
           ↓
       chats.js / addChatMessage()

   This prevents multiple MR.SMILE brains
   from answering simultaneously.
========================================================== */


/* ==========================================================
   IMPORTS
========================================================== */

import {
    canAccess
} from "./security.js";

import {
    processMrSmileInput
} from "./mrsmileProgress.js";

import {
    generatePersonnelResponse
} from "./personnelAI.js";

import {
    rememberOperatorMessage
} from "./mrsmileMemory.js";

import {
    trigger
} from "./eventManager.js";


/* ==========================================================
   SAFE HELPERS
========================================================== */

function safeString(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value);

}


function cleanText(value) {

    return safeString(value)
        .replace(/\r\n/g, "\n")
        .trim();

}


function escapeHTML(value) {

    return safeString(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function contains(text, values) {

    const normalized =
        cleanText(text)
            .toLowerCase();

    if (!normalized) {
        return false;
    }

    return values.some(
        value =>
            normalized.includes(
                String(value).toLowerCase()
            )
    );

}


function randomPick(array) {

    if (
        !Array.isArray(array) ||
        array.length === 0
    ) {
        return "";
    }

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];

}


function randomBetween(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;

}


function getCurrentTime() {

    try {

        return new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch {

        return "--:--";

    }

}


/* ==========================================================
   CHAT DATABASE
========================================================== */

const chats = {

    /* ======================================================
       GENERAL
    ====================================================== */

    general: {

        name:
            "GENERAL",

        status:
            "INTERNAL CHANNEL",

        clearance:
            0,

        unread:
            0,

        messages: [

            {
                user:
                    "SYSTEM",

                time:
                    "08:12",

                text:
                    "Welcome to OMEGA internal communications."
            },

            {
                user:
                    "OPERATOR_04",

                time:
                    "08:16",

                text:
                    "Morning. Is anyone else having network problems?"
            },

            {
                user:
                    "OPERATOR_09",

                time:
                    "08:18",

                text:
                    "Yes. Sector C terminals keep disconnecting."
            }

        ]

    },


    /* ======================================================
       SECURITY
    ====================================================== */

    security: {

        name:
            "SECURITY",

        status:
            "SECURITY DEPARTMENT",

        clearance:
            2,

        unread:
            3,

        messages: [

            {
                user:
                    "SECURITY_01",

                time:
                    "09:21",

                text:
                    "Security checkpoint 3 is operational."
            },

            {
                user:
                    "SECURITY_03",

                time:
                    "09:27",

                text:
                    "We detected unauthorized access attempts."
            },

            {
                user:
                    "SECURITY_01",

                time:
                    "09:29",

                text:
                    "Increase surveillance around the archive."
            }

        ]

    },


    /* ======================================================
       RESEARCH
    ====================================================== */

    research: {

        name:
            "RESEARCH",

        status:
            "RESEARCH DEPARTMENT",

        clearance:
            2,

        unread:
            1,

        messages: [

            {
                user:
                    "DR. KLINE",

                time:
                    "09:42",

                text:
                    "Experiment TEN has entered phase 3."
            },

            {
                user:
                    "DR. MILLER",

                time:
                    "09:44",

                text:
                    "Was phase 3 approved?"
            },

            {
                user:
                    "DR. KLINE",

                time:
                    "09:45",

                text:
                    "No."
            },

            {
                user:
                    "DR. MILLER",

                time:
                    "09:46",

                text:
                    "Then why is it running?"
            }

        ]

    },


    /* ======================================================
       MEDICAL
    ====================================================== */

    medical: {

        name:
            "MEDICAL",

        status:
            "MEDICAL DEPARTMENT",

        clearance:
            3,

        unread:
            2,

        messages: [

            {
                user:
                    "MEDICAL_02",

                time:
                    "10:03",

                text:
                    "Medical sector reports no critical injuries."
            },

            {
                user:
                    "MEDICAL_05",

                time:
                    "10:07",

                text:
                    "Correction: one unidentified patient has been transferred."
            }

        ]

    },


    /* ======================================================
       INCIDENTS
    ====================================================== */

    incidents: {

        name:
            "INCIDENTS",

        status:
            "INCIDENT REPORTING",

        clearance:
            3,

        unread:
            1,

        messages: [

            {
                user:
                    "SYSTEM",

                time:
                    "11:02",

                text:
                    "INCIDENT CHANNEL ACTIVE."
            },

            {
                user:
                    "SECURITY_02",

                time:
                    "11:05",

                text:
                    "Motion detected in restricted sector."
            },

            {
                user:
                    "SECURITY_02",

                time:
                    "11:07",

                text:
                    "No personnel were authorized to be there."
            }

        ]

    },


    /* ======================================================
       ADMINISTRATION
    ====================================================== */

    admin: {

        name:
            "ADMINISTRATION",

        status:
            "ADMINISTRATIVE CHANNEL",

        clearance:
            5,

        unread:
            0,

        messages: [

            {
                user:
                    "ADMIN",

                time:
                    "12:11",

                text:
                    "This channel is restricted to administrative personnel."
            },

            {
                user:
                    "ADMIN",

                time:
                    "12:13",

                text:
                    "Unauthorized redistribution of internal documents is prohibited."
            }

        ]

    },


    /* ======================================================
       MR.SMILE
       ------------------------------------------------------
       INITIAL CHANNEL CONTENT ONLY.

       This is NOT his AI.
    ====================================================== */

    mrsmile: {

        name:
            "MR.SMILE",

        status:
            "PRIVATE CONNECTION",

        clearance:
            2,

        unread:
            0,

        special:
            true,

        hidden:
            true,

        messages: [

            {
                user:
                    "SYSTEM",

                time:
                    "--:--",

                text:
                    "PRIVATE COMMUNICATION CHANNEL INITIALIZED."
            },

            {
                user:
                    "SYSTEM",

                time:
                    "--:--",

                text:
                    "REMOTE PARTICIPANT PRESENT."
            },

            {
                user:
                    "MR.SMILE",

                time:
                    "--:--",

                text:
                    "Good evening."
            },

            {
                user:
                    "MR.SMILE",

                time:
                    "--:--",

                text:
                    "Please, take your time."
            },

            {
                user:
                    "MR.SMILE",

                time:
                    "--:--",

                text:
                    "There is no particular hurry."
            }

        ]

    },


    /* ======================================================
       NULL
    ====================================================== */

    nullEntity: {

        name:
            "NULL",

        status:
            "UNKNOWN CONNECTION",

        clearance:
            0,

        unread:
            0,

        special:
            true,

        hidden:
            true,

        messages: [

            {
                user:
                    "SYSTEM",

                time:
                    "--:--",

                text:
                    "UNKNOWN USER PROFILE."
            },

            {
                user:
                    "NULL",

                time:
                    "--:--",

                text:
                    "..."
            }

        ]

    }

};


/* ==========================================================
   CONTEXT
========================================================== */

for (
    const chat of Object.values(chats)
) {

    chat.context = {

        topic:
            null,

        entity:
            null,

        state:
            null,

        lastQuestion:
            null,

        lastMessage:
            null,

        lastMessageTime:
            0,

        messageCount:
            0
    };

}


/* ==========================================================
   GLOBAL STATE
========================================================== */

let activeChat =
    "general";

let initialized =
    false;

let personnelResponseTimer =
    null;

let operatorMessageSequence =
    0;


/* ==========================================================
   TIMING
========================================================== */

const TIMING = {

    personnelMinimum:
        900,

    personnelMaximum:
        1800,

    mrSmileDispatchPause:
        20
};


/* ==========================================================
   UPDATE CONTEXT
========================================================== */

function updateChatContext(
    chatId,
    text
) {

    const chat =
        chats[chatId];

    if (
        !chat ||
        !chat.context
    ) {
        return;
    }


    const message =
        cleanText(text)
            .toLowerCase();


    const context =
        chat.context;


    context.lastMessage =
        message;

    context.lastMessageTime =
        Date.now();

    context.messageCount += 1;


    /*
       Question memory
    */

    if (
        message.endsWith("?")
    ) {

        context.lastQuestion =
            message;

    }


    if (
        contains(
            message,
            [
                "почему",
                "why",
                "чому"
            ]
        )
    ) {

        context.lastQuestion =
            "why";

    }


    if (
        contains(
            message,
            [
                "кто ты",
                "who are you",
                "хто ти"
            ]
        )
    ) {

        context.lastQuestion =
            "who";

    }


    if (
        contains(
            message,
            [
                "где",
                "where",
                "де"
            ]
        )
    ) {

        context.lastQuestion =
            "where";

    }


    /*
       SECURITY
    */

    if (
        chatId ===
        "security"
    ) {

        if (
            contains(
                message,
                [
                    "камера 04",
                    "camera 04",
                    "camera04",
                    "камера04"
                ]
            )
        ) {

            context.topic =
                "camera_04";

            context.entity =
                "camera_04";

            context.state =
                "camera_04_discussion";

        }


        else if (
            contains(
                message,
                [
                    "камера",
                    "camera"
                ]
            )
        ) {

            context.topic =
                "camera";

            context.entity =
                "camera";

        }


        if (
            contains(
                message,
                [
                    "сектор c",
                    "sector c",
                    "сектор с"
                ]
            )
        ) {

            context.topic =
                "sector_c";

            context.entity =
                "sector_c";

        }


        if (
            contains(
                message,
                [
                    "доступ",
                    "проник",
                    "проникновение",
                    "access",
                    "unauthorized"
                ]
            )
        ) {

            context.topic =
                "unauthorized_access";

            context.state =
                "access_discussion";

        }

    }


    /*
       RESEARCH
    */

    if (
        chatId ===
        "research"
    ) {

        if (
            contains(
                message,
                [
                    "ten",
                    "эксперимент",
                    "experiment"
                ]
            )
        ) {

            context.topic =
                "TEN";

            context.entity =
                "TEN";

            context.state =
                "TEN_discussion";

        }


        if (
            contains(
                message,
                [
                    "фаза 3",
                    "третья фаза",
                    "phase 3"
                ]
            )
        ) {

            context.topic =
                "TEN_phase_3";

            context.entity =
                "TEN_phase_3";

            context.state =
                "phase_3_discussion";

        }

    }


    /*
       MEDICAL
    */

    if (
        chatId ===
        "medical"
    ) {

        if (
            contains(
                message,
                [
                    "пациент",
                    "пациенты",
                    "patient",
                    "patients"
                ]
            )
        ) {

            context.topic =
                "patients";

            context.entity =
                "patients";

            context.state =
                "patient_discussion";

        }


        if (
            contains(
                message,
                [
                    "перевод",
                    "перевели",
                    "transfer"
                ]
            )
        ) {

            context.topic =
                "transfer";

            context.entity =
                "medical_transfer";

        }

    }


    /*
       INCIDENTS
    */

    if (
        chatId ===
        "incidents"
    ) {

        if (
            contains(
                message,
                [
                    "движение",
                    "перемещение",
                    "motion",
                    "movement"
                ]
            )
        ) {

            context.topic =
                "unknown_movement";

            context.entity =
                "unknown_movement";

            context.state =
                "incident_discussion";

        }


        if (
            contains(
                message,
                [
                    "закрыт",
                    "restricted",
                    "ограничен"
                ]
            )
        ) {

            context.topic =
                "restricted_sector";

        }

    }


    /*
       GENERAL
    */

    if (
        chatId ===
        "general"
    ) {

        if (
            contains(
                message,
                [
                    "сектор c",
                    "sector c"
                ]
            )
        ) {

            context.topic =
                "sector_c";

            context.entity =
                "sector_c";

        }


        if (
            contains(
                message,
                [
                    "network",
                    "сеть",
                    "терминал",
                    "terminal"
                ]
            )
        ) {

            context.topic =
                "network";

            context.entity =
                "network";

        }

    }

}


/* ==========================================================
   RENDER CHAT LIST
========================================================== */

function renderChatList() {

    const list =
        document.getElementById(
            "chatList"
        );


    if (!list) {
        return;
    }


    list.textContent =
        "";


    for (
        const [id, chat]
        of Object.entries(chats)
    ) {

        /*
           Hidden channels are not shown
           in normal chat list.
        */

        if (
            chat.hidden
        ) {
            continue;
        }


        /*
           Clearance
        */

        const accessible =
            canAccess(
                chat.clearance
            );


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "chatListItem";


        if (
            id ===
            activeChat
        ) {

            item.classList.add(
                "active"
            );

        }


        if (
            !accessible
        ) {

            item.classList.add(
                "chatLocked"
            );


            const avatar =
                document.createElement(
                    "div"
                );

            avatar.className =
                "chatAvatar";

            avatar.textContent =
                "🔒";


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "chatListInfo";


            const name =
                document.createElement(
                    "div"
                );

            name.className =
                "chatListName";

            name.textContent =
                "RESTRICTED CHANNEL";


            const status =
                document.createElement(
                    "div"
                );

            status.className =
                "chatListStatus";

            status.textContent =
                `CLEARANCE ${chat.clearance} REQUIRED`;


            info.appendChild(
                name
            );

            info.appendChild(
                status
            );


            item.appendChild(
                avatar
            );

            item.appendChild(
                info
            );


            list.appendChild(
                item
            );


            continue;

        }


        const avatar =
            document.createElement(
                "div"
            );

        avatar.className =
            "chatAvatar";

        avatar.textContent =
            chat.special
                ? "☻"
                : "●";


        const info =
            document.createElement(
                "div"
            );

        info.className =
            "chatListInfo";


        const name =
            document.createElement(
                "div"
            );

        name.className =
            "chatListName";

        name.textContent =
            chat.name;


        const status =
            document.createElement(
                "div"
            );

        status.className =
            "chatListStatus";

        status.textContent =
            chat.status;


        info.appendChild(
            name
        );

        info.appendChild(
            status
        );


        item.appendChild(
            avatar
        );

        item.appendChild(
            info
        );


        const unread =
            Number(
                chat.unread
            ) || 0;


        if (
            unread > 0
        ) {

            const badge =
                document.createElement(
                    "div"
                );

            badge.className =
                "chatUnread";

            badge.textContent =
                unread > 99
                    ? "99+"
                    : String(unread);


            item.appendChild(
                badge
            );

        }


        item.addEventListener(
            "click",
            () => {

                openChat(
                    id
                );

            }
        );


        list.appendChild(
            item
        );

    }

}


/* ==========================================================
   RENDER ACTIVE CHAT
========================================================== */

function renderActiveChat() {

    const chat =
        chats[activeChat];


    if (!chat) {
        return;
    }


    const name =
        document.getElementById(
            "activeChatName"
        );


    const status =
        document.getElementById(
            "activeChatStatus"
        );


    const clearance =
        document.getElementById(
            "activeChatClearance"
        );


    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (name) {

        name.textContent =
            chat.name;

    }


    if (status) {

        status.textContent =
            chat.status;

    }


    if (clearance) {

        clearance.textContent =
            `CLEARANCE: ${chat.clearance}`;

    }


    if (!messages) {
        return;
    }


    messages.textContent =
        "";


    for (
        const message
        of chat.messages
    ) {

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "chatMessage";


        switch (
            message.user
        ) {

            case "MR.SMILE":

                element.classList.add(
                    "mrSmileMessage"
                );

                break;


            case "SYSTEM":

                element.classList.add(
                    "systemMessage"
                );

                break;


            case "NULL":

                element.classList.add(
                    "nullMessage"
                );

                break;


            case "YOU":

                element.classList.add(
                    "operatorMessage"
                );

                break;

        }


        const meta =
            document.createElement(
                "div"
            );

        meta.className =
            "messageMeta";


        const user =
            document.createElement(
                "span"
            );

        user.className =
            "messageUser";

        user.textContent =
            safeString(
                message.user
            );


        const time =
            document.createElement(
                "span"
            );

        time.className =
            "messageTime";

        time.textContent =
            message.time ||
            "--:--";


        meta.appendChild(
            user
        );

        meta.appendChild(
            time
        );


        const body =
            document.createElement(
                "div"
            );

        body.className =
            "messageText";

        body.textContent =
            safeString(
                message.text
            );


        element.appendChild(
            meta
        );

        element.appendChild(
            body
        );


        messages.appendChild(
            element
        );

    }


    messages.scrollTop =
        messages.scrollHeight;

}


/* ==========================================================
   OPEN CHAT
========================================================== */

export function openChat(
    chatId
) {

    const chat =
        chats[chatId];


    if (!chat) {

        console.warn(
            "[CHAT] Unknown channel:",
            chatId
        );

        return false;

    }


    if (
        !canAccess(
            chat.clearance
        )
    ) {

        console.warn(
            "[CHAT] Access denied:",
            chatId
        );

        return false;

    }


    activeChat =
        chatId;


    chat.unread =
        0;


    renderChatList();

    renderActiveChat();


    trigger(
        "chat:opened",
        {
            chatId,

            name:
                chat.name,

            status:
                chat.status
        }
    );


    /*
       When MR.SMILE channel opens,
       notify the rest of the system.
    */

    if (
        chatId ===
        "mrsmile"
    ) {

        trigger(
            "mrsmile:chatOpened",
            {
                chatId:
                    "mrsmile"
            }
        );

    }


    return true;

}


/* ==========================================================
   ADD CHAT MESSAGE
========================================================== */

/*
   THIS IS THE MAIN CHAT BRIDGE.

   Other modules should use:

       window.addChatMessage(
           "mrsmile",
           {
               user: "MR.SMILE",
               text: "..."
           }
       );

   No second chat database is created.
*/

export function addChatMessage(
    chatId,
    message
) {

    const chat =
        chats[chatId];


    if (!chat) {

        console.warn(
            "[CHAT] Cannot add message. Unknown channel:",
            chatId
        );

        return false;

    }


    if (
        !message ||
        typeof message !== "object"
    ) {

        return false;

    }


    const text =
        cleanText(
            message.text
        );


    if (!text) {

        return false;

    }


    const user =
        cleanText(
            message.user
        ) ||
        "SYSTEM";


    const time =
        cleanText(
            message.time
        ) ||
        getCurrentTime();


    const entry = {

        user,

        time,

        text

    };


    chat.messages.push(
        entry
    );


    updateChatContext(
        chatId,
        text
    );


    /*
       If another channel is currently active,
       increase unread counter.
    */

    if (
        chatId !==
        activeChat
    ) {

        chat.unread =
            (
                Number(
                    chat.unread
                ) || 0
            ) + 1;

    }


    /*
       Keep chat history sane.
       This prevents an accidental infinite
       message loop from destroying memory.
    */

    const MAX_MESSAGES =
        500;


    if (
        chat.messages.length >
        MAX_MESSAGES
    ) {

        chat.messages.splice(
            0,
            chat.messages.length -
            MAX_MESSAGES
        );

    }


    renderChatList();


    if (
        chatId ===
        activeChat
    ) {

        renderActiveChat();

    }


    trigger(
        "chat:messageAdded",
        {
            chatId,

            message:
                entry
        }
    );


    return true;

}


/* ==========================================================
   GET CHAT
========================================================== */

export function getChat(
    chatId
) {

    return chats[chatId] ||
        null;

}


/* ==========================================================
   GET ALL CHATS
========================================================== */

export function getAllChats() {

    return chats;

}


/* ==========================================================
   GET ACTIVE CHAT
========================================================== */

export function getActiveChat() {

    return activeChat;

}


/* ==========================================================
   GET CHAT CONTEXT
========================================================== */

export function getChatContext(
    chatId =
        activeChat
) {

    const chat =
        chats[chatId];


    if (!chat) {
        return null;
    }


    return {
        ...chat.context
    };

}


/* ==========================================================
   APPEND MESSAGE
========================================================== */

export function appendChatMessage(
    chatId,
    user,
    text,
    time = null
) {

    return addChatMessage(
        chatId,
        {
            user,
            text,
            time:
                time ||
                getCurrentTime()
        }
    );

}


/* ==========================================================
   OPERATOR MESSAGE
========================================================== */

/*
   IMPORTANT:

   This function is used only by the MAIN CHAT UI.

   MR.SMILE itself does NOT answer here.

   For MR.SMILE:

       add YOU
       ↓
       save context
       ↓
       progress
       ↓
       trigger event
       ↓
       mrsmileChat.js
*/

export function sendMessage() {

    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) {

        console.warn(
            "[CHAT] chatInput not found."
        );

        return false;

    }


    const text =
        cleanText(
            input.value
        );


    if (!text) {
        return false;
    }


    const chat =
        chats[activeChat];


    if (!chat) {

        console.warn(
            "[CHAT] Active channel unavailable."
        );

        return false;

    }


    const sequence =
        ++operatorMessageSequence;


    /*
       Clear input immediately.
    */

    input.value =
        "";


    /*
       Add YOU message.
    */

    addChatMessage(
        activeChat,
        {
            user:
                "YOU",

            time:
                getCurrentTime(),

            text
        }
    );


    /*
       Global memory.
       We do it ONCE here.
       mrsmileChat.js does not add
       another YOU-memory entry.
    */

    try {

        rememberOperatorMessage(
            text
        );

    } catch (error) {

        console.warn(
            "[CHAT] Operator memory failed:",
            error
        );

    }


    /*
       MR.SMILE progression.
    */

    if (
        activeChat ===
        "mrsmile"
    ) {

        try {

            processMrSmileInput(
                text
            );

        } catch (error) {

            console.warn(
                "[CHAT] MR.SMILE progression failed:",
                error
            );

        }


        /*
           VERY IMPORTANT:

           Do NOT call the Core directly.

           Do NOT generate a local response.

           Do NOT call mrsmileSay() here.

           One event -> one response pipeline.
        */

        setTimeout(
            () => {

                trigger(
                    "mrsmile:operatorMessage",
                    {
                        text,

                        chat:
                            "mrsmile",

                        source:
                            "operator",

                        sequence,

                        timestamp:
                            Date.now()
                    }
                );

            },
            TIMING.mrSmileDispatchPause
        );


        return true;

    }


    /*
       Normal personnel channels.
    */

    handlePersonnelMessage(
        activeChat,
        text,
        sequence
    );


    return true;

}


/* ==========================================================
   PERSONNEL MESSAGE HANDLER
========================================================== */

function handlePersonnelMessage(
    chatId,
    text,
    sequence
) {

    const chat =
        chats[chatId];


    if (!chat) {
        return;
    }


    /*
       Cancel previous pending personnel response.
       This avoids multiple delayed personnel replies
       after rapid Enter presses.
    */

    if (
        personnelResponseTimer
    ) {

        clearTimeout(
            personnelResponseTimer
        );

        personnelResponseTimer =
            null;

    }


    const personnel =
        [...chat.messages]
            .reverse()
            .find(
                message =>
                    message.user !==
                        "YOU"
                    &&
                    message.user !==
                        "SYSTEM"
                    &&
                    message.user !==
                        "NULL"
            );


    if (!personnel) {
        return;
    }


    const delay =
        randomBetween(
            TIMING.personnelMinimum,
            TIMING.personnelMaximum
        );


    personnelResponseTimer =
        setTimeout(
            () => {

                personnelResponseTimer =
                    null;


                try {

                    let response =
                        getContextualResponse(
                            chatId,
                            text
                        );


                    if (
                        !response
                    ) {

                        response =
                            generateEmployeeResponse(
                                chatId,
                                text
                            );

                    }


                    if (
                        !response
                    ) {
                        return;
                    }


                    /*
                       Ignore stale callback if
                       the active context changed completely.
                    */

                    addChatMessage(
                        chatId,
                        {
                            user:
                                personnel.user,

                            time:
                                getCurrentTime(),

                            text:
                                response
                        }
                    );


                } catch (error) {

                    console.error(
                        "[CHAT] Personnel response failed:",
                        error
                    );

                }

            },
            delay
        );

}


/* ==========================================================
   CONTEXTUAL PERSONNEL RESPONSES
========================================================== */

function getContextualResponse(
    chatId,
    text
) {

    const message =
        cleanText(
            text
        )
            .toLowerCase();


    /*
       GENERAL
    */

    if (
        chatId ===
        "general"
    ) {

        if (
            contains(
                message,
                [
                    "привет",
                    "здравствуй",
                    "здравствуйте",
                    "hello",
                    "hi"
                ]
            )
        ) {

            return randomPick([

                "Привет. Как смена?",

                "Здравствуйте. Пока всё спокойно.",

                "Привет. Что-то случилось?",

                "Добрый день. Что у вас?"

            ]);

        }


        if (
            contains(
                message,
                [
                    "как дела",
                    "как ты",
                    "how are you"
                ]
            )
        ) {

            return randomPick([

                "Нормально. Сижу на смене.",

                "Пока не жалуюсь.",

                "Устал, если честно.",

                "Лучше, чем вчера."

            ]);

        }


        if (
            contains(
                message,
                [
                    "что случилось",
                    "что произошло",
                    "новости",
                    "what happened"
                ]
            )
        ) {

            return (
                "Особых новостей нет. Хотя SECURITY снова " +
                "жалуется на проблемы в секторе C."
            );

        }


        if (
            contains(
                message,
                [
                    "сектор c",
                    "sector c"
                ]
            )
        ) {

            return (
                "Там опять проблемы с терминалами. " +
                "Пока никто не понял, что именно происходит."
            );

        }

    }


    /*
       SECURITY
    */

    if (
        chatId ===
        "security"
    ) {

        if (
            contains(
                message,
                [
                    "привет",
                    "здравствуйте",
                    "hello",
                    "hi"
                ]
            )
        ) {

            return randomPick([

                "Привет. SECURITY, пост 03.",

                "Здравствуйте, оператор.",

                "Привет. Сейчас на посту."

            ]);

        }


        if (
            contains(
                message,
                [
                    "как дела",
                    "как ты"
                ]
            )
        ) {

            return (
                "Нормально. Смена спокойная, если не считать " +
                "пару срабатываний датчиков."
            );

        }


        if (
            contains(
                message,
                [
                    "что случилось",
                    "что произошло"
                ]
            )
        ) {

            return (
                "Камера 04 зафиксировала движение в закрытом " +
                "секторе. Персонала там быть не должно."
            );

        }


        if (
            contains(
                message,
                [
                    "камера 04",
                    "camera 04"
                ]
            )
        ) {

            return (
                "Изображение с камеры 04 периодически пропадает. " +
                "Технический отдел пока не нашёл причину."
            );

        }


        if (
            contains(
                message,
                [
                    "камера",
                    "camera"
                ]
            )
        ) {

            return (
                "Камеры работают штатно. Кроме камеры 04 — " +
                "с ней периодически возникают проблемы."
            );

        }


        if (
            contains(
                message,
                [
                    "кто заходил",
                    "кто был",
                    "кто проник"
                ]
            )
        ) {

            return (
                "В журнале доступа никто не отмечен. " +
                "Именно это нас и беспокоит."
            );

        }

    }


    /*
       RESEARCH
    */

    if (
        chatId ===
        "research"
    ) {

        if (
            contains(
                message,
                [
                    "привет",
                    "здравствуйте",
                    "hello"
                ]
            )
        ) {

            return (
                "Здравствуйте. Если вы по поводу TEN, " +
                "то результаты пока не готовы."
            );

        }


        if (
            contains(
                message,
                [
                    "как дела",
                    "как ты"
                ]
            )
        ) {

            return (
                "Сложно ответить. У нас сегодня было несколько " +
                "неожиданных результатов."
            );

        }


        if (
            contains(
                message,
                [
                    "ten",
                    "эксперимент",
                    "experiment"
                ]
            )
        ) {

            return (
                "TEN находится на третьей фазе. " +
                "Формально она ещё не должна была начаться."
            );

        }


        if (
            contains(
                message,
                [
                    "фаза 3",
                    "третья фаза",
                    "phase 3"
                ]
            )
        ) {

            return (
                "Фаза 3 завершена, но показатели сильно " +
                "отличаются от предыдущих."
            );

        }


        if (
            contains(
                message,
                [
                    "почему",
                    "зачем",
                    "why"
                ]
            )
        ) {

            return (
                "Я бы предпочёл не делать выводов без данных. " +
                "Но ситуация выглядит необычно."
            );

        }

    }


    /*
       MEDICAL
    */

    if (
        chatId ===
        "medical"
    ) {

        if (
            contains(
                message,
                [
                    "привет",
                    "здравствуйте",
                    "hello",
                    "hi"
                ]
            )
        ) {

            return randomPick([

                "Здравствуйте. Медицинский сектор на связи.",

                "Привет. Сегодня довольно спокойно.",

                "Здравствуйте. Если это не срочное дело — я вас слушаю.",

                "Привет. Только закончил с обходом."

            ]);

        }


        if (
            contains(
                message,
                [
                    "как дела",
                    "как ты"
                ]
            )
        ) {

            return randomPick([

                "Нормально. Сегодня пациентов немного.",

                "Пока хорошо. Обход только закончил.",

                "Устал, но ничего критичного.",

                "Неплохо. Медицинский сектор работает штатно."

            ]);

        }


        if (
            contains(
                message,
                [
                    "пациент",
                    "пациенты"
                ]
            )
        ) {

            return randomPick([

                "Сейчас несколько пациентов проходят обследование.",

                "Большинство пациентов уже выписали.",

                "Есть несколько человек под наблюдением.",

                "Сегодня поступило несколько новых пациентов."

            ]);

        }


        if (
            contains(
                message,
                [
                    "врач",
                    "доктор",
                    "медик"
                ]
            )
        ) {

            return randomPick([

                "Все врачи сейчас заняты.",

                "Медицинская команда сегодня работает почти без перерыва.",

                "Несколько сотрудников ушли на короткий перерыв.",

                "Большинство уже закончило дневной обход."

            ]);

        }


        if (
            contains(
                message,
                [
                    "перевод",
                    "перевели",
                    "поступил"
                ]
            )
        ) {

            return (
                "Сегодня действительно был один перевод из другого сектора. " +
                "Документы ещё обрабатываются."
            );

        }


        if (
            contains(
                message,
                [
                    "травм",
                    "ранен",
                    "травмирован"
                ]
            )
        ) {

            return randomPick([

                "Ничего серьёзного. В основном небольшие травмы.",

                "Есть несколько лёгких повреждений, но угрозы жизни нет.",

                "Критических травм сегодня не зарегистрировано.",

                "Пока всё под контролем."

            ]);

        }

    }


    /*
       INCIDENTS
    */

    if (
        chatId ===
        "incidents"
    ) {

        if (
            contains(
                message,
                [
                    "привет",
                    "здравствуйте",
                    "hello"
                ]
            )
        ) {

            return (
                "INCIDENTS на связи. Надеюсь, сегодня без новых отчётов."
            );

        }


        if (
            contains(
                message,
                [
                    "как дела",
                    "как ты"
                ]
            )
        ) {

            return (
                "Если честно? Чем меньше у нас работы, " +
                "тем лучше."
            );

        }


        if (
            contains(
                message,
                [
                    "что случилось",
                    "что произошло"
                ]
            )
        ) {

            return (
                "Зафиксировано неизвестное перемещение. " +
                "Источник пока не установлен."
            );

        }


        if (
            contains(
                message,
                [
                    "новости"
                ]
            )
        ) {

            return (
                "Пока только одна: кто-то снова оказался там, " +
                "где его не должно быть."
            );

        }

    }


    /*
       ADMIN
    */

    if (
        chatId ===
        "admin"
    ) {

        if (
            contains(
                message,
                [
                    "привет",
                    "здравствуйте",
                    "hello"
                ]
            )
        ) {

            return (
                "Здравствуйте. Административный канал на связи."
            );

        }


        if (
            contains(
                message,
                [
                    "доступ",
                    "access"
                ]
            )
        ) {

            return (
                "Для доступа к административным данным требуется " +
                "соответствующий уровень допуска."
            );

        }

    }


    return null;

}


/* ==========================================================
   PERSONNEL WRAPPER
========================================================== */

function generateEmployeeResponse(
    chatId,
    text
) {

    try {

        if (
            typeof generatePersonnelResponse ===
            "function"
        ) {

            return generatePersonnelResponse(
                chatId,
                text
            );

        }

    } catch (error) {

        console.warn(
            "[CHAT] personnelAI unavailable:",
            error
        );

    }


    return null;

}


/* ==========================================================
   CHAT ACCESS
========================================================== */

export function hasChatAccess(
    chatId
) {

    const chat =
        chats[chatId];


    if (!chat) {
        return false;
    }


    return canAccess(
        chat.clearance
    );

}


/* ==========================================================
   REVEAL HIDDEN CHAT
========================================================== */

export function revealChat(
    chatId
) {

    const chat =
        chats[chatId];


    if (!chat) {
        return false;
    }


    chat.hidden =
        false;


    renderChatList();


    trigger(
        "chat:revealed",
        {
            chatId
        }
    );


    return true;

}


/* ==========================================================
   HIDE CHAT
========================================================== */

export function hideChat(
    chatId
) {

    const chat =
        chats[chatId];


    if (!chat) {
        return false;
    }


    chat.hidden =
        true;


    renderChatList();


    return true;

}


/* ==========================================================
   INITIALIZE CHAT SYSTEM
========================================================== */

export function initChats(
    options = {}
) {

    if (
        initialized
    ) {

        return {
            ok:
                true,

            alreadyInitialized:
                true,

            activeChat
        };

    }


    initialized =
        true;


    /*
       Window bridge
    */

    if (
        typeof window !==
        "undefined"
    ) {

        window.addChatMessage =
            addChatMessage;

        window.openChat =
            openChat;

        window.getChat =
            getChat;

        window.getAllChats =
            getAllChats;

        window.getActiveChat =
            getActiveChat;

        window.getChatContext =
            getChatContext;

        window.appendChatMessage =
            appendChatMessage;

        window.revealChat =
            revealChat;

        window.hasChatAccess =
            hasChatAccess;

        window.sendChatMessage =
            sendMessage;

    }


    renderChatList();

    renderActiveChat();


    /*
       Enter handling
    */

    bindInputEvents();


    console.log(
        "[OMEGA CHAT] Rebuilt chat system initialized."
    );


    if (
        options.autoOpen
    ) {

        openChat(
            options.autoOpen
        );

    }


    return {

        ok:
            true,

        initialized:
            true,

        activeChat

    };

}


/* ==========================================================
   INPUT EVENTS
========================================================== */

function bindInputEvents() {

    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) {

        console.warn(
            "[OMEGA CHAT] chatInput not found."
        );

        return;

    }


    /*
       Prevent duplicate listeners.
    */

    if (
        input.dataset.omegaChatBound ===
        "1"
    ) {

        return;

    }


    input.dataset.omegaChatBound =
        "1";


    input.addEventListener(
        "keydown",
        event => {

            /*
               Shift+Enter:
               new line.

               Enter:
               send.
            */

            if (
                event.key !==
                "Enter"
            ) {
                return;
            }


            if (
                event.shiftKey
            ) {
                return;
            }


            event.preventDefault();


            sendMessage();

        }
    );

}


/* ==========================================================
   STATUS
========================================================== */

export function getChatSystemStatus() {

    return {

        initialized,

        activeChat,

        chatCount:
            Object.keys(
                chats
            ).length,

        activeMessages:
            chats[activeChat]
                ?.messages
                ?.length || 0,

        mrSmileMessages:
            chats.mrsmile
                ?.messages
                ?.length || 0,

        mrSmileVisible:
            !chats.mrsmile
                ?.hidden,

        nullMessages:
            chats.nullEntity
                ?.messages
                ?.length || 0

    };

}


/* ==========================================================
   RESET UNREAD
========================================================== */

export function clearUnread(
    chatId
) {

    const chat =
        chats[chatId];


    if (!chat) {
        return false;
    }


    chat.unread =
        0;


    renderChatList();


    return true;

}


/* ==========================================================
   CLEAR PERSONNEL TIMER
========================================================== */

export function cancelPendingPersonnelResponse() {

    if (
        personnelResponseTimer
    ) {

        clearTimeout(
            personnelResponseTimer
        );

        personnelResponseTimer =
            null;

    }

}


/* ==========================================================
   GLOBAL DEBUG API
========================================================== */

const API = {

    init:
        initChats,

    open:
        openChat,

    send:
        sendMessage,

    add:
        addChatMessage,

    append:
        appendChatMessage,

    get:
        getChat,

    getAll:
        getAllChats,

    getActive:
        getActiveChat,

    context:
        getChatContext,

    reveal:
        revealChat,

    hide:
        hideChat,

    access:
        hasChatAccess,

    unread:
        clearUnread,

    cancelPersonnel:
        cancelPendingPersonnelResponse,

    status:
        getChatSystemStatus

};


if (
    typeof window !==
    "undefined"
) {

    window.OMEGA_CHATS =
        API;

    window.OMEGA_CHAT_STATUS =
        getChatSystemStatus;

}


/* ==========================================================
   AUTO INIT
========================================================== */

try {

    initChats();

} catch (error) {

    console.error(
        "[OMEGA CHAT] Initialization failed:",
        error
    );

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default API;
