/* =========================================================
   OMEGA INTERNAL CHATS
   ---------------------------------------------------------
   REAL OMEGA CHAT SYSTEM

   RESPONSIBILITIES:

   - chat channels
   - message history
   - chat rendering
   - unread counters
   - personnel responses
   - MR.SMILE channel
   - NULL channel
   - chat context

   IMPORTANT:

   MR.SMILE PERSONALITY IS NOT GENERATED HERE.

   MR.SMILE conversation path:

       chats.js
           ↓
       chat input
           ↓
       mrsmileChat.js
           ↓
       mrsmileCore.js
           ↓
       mrsmileMemory.js

   Therefore this file contains NO OLD:
       generateMrSmileResponse()

   This prevents two different MR.SMILE brains
   from answering the operator simultaneously.
========================================================= */

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
    rememberOperatorMessage,
    rememberMrSmileMessage
} from "./mrsmileMemory.js";

import {
    trigger
} from "./eventManager.js";


/* =========================================================
   CHAT DATABASE
========================================================= */

const chats = {

    /* =====================================================
       GENERAL
    ===================================================== */

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


    /* =====================================================
       SECURITY
    ===================================================== */

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


    /* =====================================================
       RESEARCH
    ===================================================== */

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


    /* =====================================================
       MEDICAL
    ===================================================== */

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


    /* =====================================================
       INCIDENTS
    ===================================================== */

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


    /* =====================================================
       ADMINISTRATION
    ===================================================== */

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


    /* =====================================================
       MR.SMILE
       -----------------------------------------------------
       IMPORTANT:

       These are only INITIAL channel messages.

       They are NOT his conversational brain.

       All future replies come from mrsmileChat.js.
    ===================================================== */

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


    /* =====================================================
       NULL
    ===================================================== */

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


/* =========================================================
   CHAT CONTEXT
========================================================= */

Object.values(
    chats
).forEach(
    chat => {

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
                null

        };

    }
);


/* =========================================================
   STATE
========================================================= */

let activeChat =
    "general";

let initialized =
    false;

let sendLocked =
    false;


/* =========================================================
   MESSAGE TIMING
========================================================= */

const TIMING = {

    personnelMinimum:
        900,

    personnelMaximum:
        1800

};


/* =========================================================
   CHAT CONTEXT
========================================================= */

function updateChatContext(
    chatId,
    text
) {

    const chat =
        chats[chatId];


    if (
        !chat
        ||
        !chat.context
    ) {

        return;

    }


    const message =
        String(
            text ||
            ""
        )
            .toLowerCase()
            .trim();


    const context =
        chat.context;


    context.lastMessage =
        message;


    context.lastMessageTime =
        Date.now();


    /* =====================================================
       SHORT QUESTIONS
    ===================================================== */

    if (
        message ===
            "почему"
        ||
        message ===
            "почему?"
        ||
        message ===
            "why"
    ) {

        context.lastQuestion =
            "why";

    }


    if (
        message ===
            "кто"
        ||
        message ===
            "кто?"
        ||
        message ===
            "who"
    ) {

        context.lastQuestion =
            "who";

    }


    if (
        message ===
            "где"
        ||
        message ===
            "где?"
        ||
        message ===
            "where"
    ) {

        context.lastQuestion =
            "where";

    }


    if (
        message ===
            "когда"
        ||
        message ===
            "когда?"
        ||
        message ===
            "when"
    ) {

        context.lastQuestion =
            "when";

    }


    if (
        message ===
            "а потом"
        ||
        message ===
            "а потом?"
        ||
        message ===
            "what happened next"
    ) {

        context.lastQuestion =
            "after";

    }


    /* =====================================================
       SECURITY
    ===================================================== */

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
            message.includes(
                "камера"
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
                    "доступ",
                    "проник",
                    "заходил",
                    "журнал"
                ]
            )
        ) {

            context.topic =
                "unauthorized_access";

        }

    }


    /* =====================================================
       RESEARCH
    ===================================================== */

    if (
        chatId ===
        "research"
    ) {

        if (
            contains(
                message,
                [
                    "ten",
                    "эксперимент"
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
                    "третья фаза"
                ]
            )
        ) {

            context.topic =
                "TEN";

            context.entity =
                "TEN_phase_3";

            context.state =
                "phase_3_discussion";

        }


        if (
            contains(
                message,
                [
                    "создал",
                    "создатель"
                ]
            )
        ) {

            context.topic =
                "TEN";

            context.state =
                "TEN_creator";

        }

    }


    /* =====================================================
       MEDICAL
    ===================================================== */

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
                    "пациента"
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
                    "поступил"
                ]
            )
        ) {

            context.topic =
                "transfer";

            context.entity =
                "medical_transfer";

        }

    }


    /* =====================================================
       INCIDENTS
    ===================================================== */

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
                    "кто-то двигался"
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
                    "restricted"
                ]
            )
        ) {

            context.topic =
                "restricted_sector";

        }

    }


    /* =====================================================
       QUESTION DETECTION
    ===================================================== */

    if (
        message.endsWith("?")
    ) {

        context.lastQuestion =
            message;

    }

}


/* =========================================================
   RENDER CHAT LIST
========================================================= */

function renderChatList() {

    const list =
        document.getElementById(
            "chatList"
        );


    if (
        !list
    ) {

        return;

    }


    list.innerHTML =
        "";


    Object.entries(
        chats
    ).forEach(
        (
            [id, chat]
        ) => {


            /*
             * Hidden chats are not listed.
             */

            if (
                chat.hidden
            ) {

                return;

            }


            /*
             * Clearance check.
             */

            if (
                !canAccess(
                    chat.clearance
                )
            ) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "chatListItem chatLocked";


                item.innerHTML = `

                    <div class="chatAvatar">
                        🔒
                    </div>

                    <div class="chatListInfo">

                        <div class="chatListName">
                            RESTRICTED CHANNEL
                        </div>

                        <div class="chatListStatus">
                            CLEARANCE ${chat.clearance} REQUIRED
                        </div>

                    </div>
                `;


                list.appendChild(
                    item
                );


                return;

            }


            /*
             * Chat item.
             */

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


            const unread =
                Number(
                    chat.unread
                ) || 0;


            const avatar =
                chat.special
                    ? "☻"
                    : "●";


            item.innerHTML = `

                <div class="chatAvatar">
                    ${avatar}
                </div>

                <div class="chatListInfo">

                    <div class="chatListName">
                        ${escapeHTML(chat.name)}
                    </div>

                    <div class="chatListStatus">
                        ${escapeHTML(chat.status)}
                    </div>

                </div>

                ${
                    unread > 0

                    ?

                    `
                    <div class="chatUnread">
                        ${
                            unread > 99
                                ? "99+"
                                : unread
                        }
                    </div>
                    `

                    :

                    ""
                }
            `;


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
    );

}


/* =========================================================
   OPEN CHAT
========================================================= */

export function openChat(
    chatId
) {

    const chat =
        chats[chatId];


    if (
        !chat
    ) {

        return false;

    }


    if (
        !canAccess(
            chat.clearance
        )
    ) {

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
                chat.name

        }
    );


    return true;

}


/* =========================================================
   RENDER ACTIVE CHAT
========================================================= */

function renderActiveChat() {

    const chat =
        chats[activeChat];


    if (
        !chat
    ) {

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


    if (
        name
    ) {

        name.textContent =
            chat.name;

    }


    if (
        status
    ) {

        status.textContent =
            chat.status;

    }


    if (
        clearance
    ) {

        clearance.textContent =
            `CLEARANCE: ${chat.clearance}`;

    }


    if (
        !messages
    ) {

        return;

    }


    messages.innerHTML =
        "";


    chat.messages.forEach(
        message => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "chatMessage";


            if (
                message.user ===
                "MR.SMILE"
            ) {

                element.classList.add(
                    "mrSmileMessage"
                );

            }


            if (
                message.user ===
                "SYSTEM"
            ) {

                element.classList.add(
                    "systemMessage"
                );

            }


            if (
                message.user ===
                "NULL"
            ) {

                element.classList.add(
                    "nullMessage"
                );

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
                message.user;


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
                message.text;


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
    );


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================================
   SEND MESSAGE
========================================================= */

function sendMessage() {

    /*
     * Protect against double Enter/click.
     */

    if (
        sendLocked
    ) {

        return;

    }


    const input =
        document.getElementById(
            "chatInput"
        );


    if (
        !input
    ) {

        return;

    }


    const text =
        input.value.trim();


    if (
        !text
    ) {

        return;

    }


    const chat =
        chats[activeChat];


    if (
        !chat
    ) {

        return;

    }


    /*
     * Current time.
     */

    const time =
        getCurrentTime();


    /*
     * Add operator message.
     */

    chat.messages.push({

        user:
            "YOU",

        time,

        text

    });


    updateChatContext(
        activeChat,
        text
    );


    /*
     * Global MR.SMILE memory.
     */

    rememberOperatorMessage(
        text
    );


    /*
     * MR.SMILE progress system.
     */

    if (
        activeChat ===
        "mrsmile"
    ) {

        try {

            processMrSmileInput(
                text
            );

        } catch (
            error
        ) {

            console.warn(
                "[CHAT] MR.SMILE progress failed:",
                error
            );

        }

    }


    input.value =
        "";


    renderActiveChat();


    /*
     * MR.SMILE DOES NOT RESPOND HERE.
     *
     * mrsmileChat.js owns his response.
     */

    if (
        activeChat ===
        "mrsmile"
    ) {

        trigger(
            "mrsmile:operatorMessage",
            {

                text,

                chat:
                    "mrsmile",

                timestamp:
                    Date.now()

            }
        );


        return;

    }


    /*
     * Normal personnel.
     */

    const personnel =
        [
            ...chat.messages
        ]
            .reverse()
            .find(
                message =>
                    message.user !==
                    "YOU"
                    &&
                    message.user !==
                    "SYSTEM"
            );


    if (
        !personnel
    ) {

        return;

    }


    sendLocked =
        true;


    const delay =
        randomBetween(
            TIMING.personnelMinimum,
            TIMING.personnelMaximum
        );


    setTimeout(
        () => {

            try {

                let response =
                    getContextualResponse(
                        activeChat,
                        text
                    );


                if (
                    !response
                ) {

                    response =
                        generateEmployeeResponse(
                            activeChat,
                            text
                        );

                }


                if (
                    response
                ) {

                    chat.messages.push({

                        user:
                            personnel.user,

                        time:
                            getCurrentTime(),

                        text:
                            response

                    });

                }


                renderActiveChat();


            } catch (
                error
            ) {

                console.error(
                    "[CHAT] Personnel response failed:",
                    error
                );

            } finally {

                sendLocked =
                    false;

            }

        },

        delay

    );

}


/* =========================================================
   PERSONNEL RESPONSE SYSTEM
========================================================= */

function generateEmployeeResponse(
    chatId,
    text
) {

    const message =
        String(
            text ||
            ""
        )
            .toLowerCase()
            .trim();


    /*
     * =====================================================
     * GENERAL
     * =====================================================
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
                    "hello",
                    "hi"
                ]
            )
        ) {

            return randomPick([
                "Привет. Как смена?",
                "Доброе утро. Хотя я уже потерял счёт времени.",
                "Привет. Здесь пока всё спокойно.",
                "Здравствуй. Что-то случилось?"
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
                    "как прошел день",
                    "как прошёл день",
                    "что делал",
                    "чем занимался"
                ]
            )
        ) {

            return (
                "Большую часть смены занимался обычными проверками. " +
                "Потом несколько терминалов в секторе C начали отключаться. " +
                "Пока причину не нашли."
            );

        }


        if (
            contains(
                message,
                [
                    "что случилось",
                    "что произошло",
                    "новости"
                ]
            )
        ) {

            return (
                "Особых новостей нет. Хотя SECURITY снова жалуется " +
                "на проблемы в секторе C."
            );

        }

    }


    /*
     * =====================================================
     * SECURITY
     * =====================================================
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
                    "как прошел день",
                    "как прошёл день",
                    "что делал"
                ]
            )
        ) {

            return (
                "Проверял камеры, обходил сектор C и разбирался " +
                "с несколькими ложными тревогами. Одна из них, " +
                "правда, оказалась не такой уж ложной."
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
                "Камера 04 зафиксировала движение в закрытом секторе. " +
                "Персонала там быть не должно."
            );

        }


        if (
            message.includes(
                "кто"
            )
            &&
            (
                message.includes(
                    "был"
                )
                ||
                message.includes(
                    "заходил"
                )
            )
        ) {

            return (
                "В журнале доступа никто не отмечен. " +
                "Именно это нас и беспокоит."
            );

        }


        if (
            message.includes(
                "камера"
            )
        ) {

            return (
                "Камеры работают штатно. Кроме камеры 04 — " +
                "у неё периодически пропадает изображение."
            );

        }

    }


    /*
     * =====================================================
     * RESEARCH
     * =====================================================
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
                    "как прошел день",
                    "как прошёл день",
                    "что делал"
                ]
            )
        ) {

            return (
                "Мы продолжали работу с TEN. Третий этап завершён, " +
                "но показатели сильно отличаются от предыдущих."
            );

        }


        if (
            contains(
                message,
                [
                    "ten",
                    "эксперимент"
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
                    "что случилось",
                    "что произошло"
                ]
            )
        ) {

            return (
                "Один из показателей вышел за допустимый диапазон. " +
                "Пока мы не понимаем почему."
            );

        }


        if (
            contains(
                message,
                [
                    "почему",
                    "зачем"
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
     * =====================================================
     * MEDICAL
     * =====================================================
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
                    "hello",
                    "hi"
                ]
            )
        ) {

            return randomPick([
                "Здравствуйте. Медицинский сектор на связи.",
                "Привет. Сегодня довольно спокойно.",
                "Здравствуйте. Если вы не по срочному делу — я вас слушаю.",
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
                    "смена",
                    "работа",
                    "день"
                ]
            )
        ) {

            return randomPick([
                "Сегодня было довольно спокойно.",
                "Проверил несколько пациентов и заполнил отчёты.",
                "Большую часть смены занимались обычными обследованиями.",
                "День прошёл нормально. Ничего чрезвычайного."
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
                    "оборудован",
                    "аппарат",
                    "сканер",
                    "терминал"
                ]
            )
        ) {

            return randomPick([
                "Большая часть оборудования работает нормально.",
                "Один из сканеров сегодня пришлось перезапустить.",
                "Технический отдел проверяет несколько медицинских терминалов.",
                "С оборудованием пока всё в пределах нормы."
            ]);

        }


        if (
            contains(
                message,
                [
                    "запис",
                    "документ",
                    "карта"
                ]
            )
        ) {

            return (
                "Медицинские записи обновляются после каждого обследования. " +
                "Если вам нужен конкретный файл, потребуется соответствующий доступ."
            );

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
     * =====================================================
     * INCIDENTS
     * =====================================================
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
                    "как прошел день",
                    "как прошёл день"
                ]
            )
        ) {

            return (
                "Было несколько мелких происшествий. " +
                "Самое странное — движение в закрытом секторе."
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
            message.includes(
                "новости"
            )
        ) {

            return (
                "Пока только одна: кто-то снова оказался там, " +
                "где его не должно быть."
            );

        }

    }


    /*
     * =====================================================
     * ADMINISTRATION
     * =====================================================
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
                    "как дела",
                    "как ты"
                ]
            )
        ) {

            return (
                "Рабочий день проходит штатно."
            );

        }


        if (
            contains(
                message,
                [
                    "как прошел день",
                    "как прошёл день",
                    "что делал"
                ]
            )
        ) {

            return (
                "Сегодня проверял внутренние отчёты, " +
                "запросы на доступ и несколько документов " +
                "исследовательского отдела."
            );

        }


        if (
            contains(
                message,
                [
                    "новости",
                    "что случилось"
                ]
            )
        ) {

            return (
                "Есть несколько незакрытых отчётов. " +
                "Подробности доступны сотрудникам с соответствующим " +
                "уровнем допуска."
            );

        }

    }


    /*
     * =====================================================
     * OPTIONAL PERSONNEL AI
     * ===================================================== */

    try {

        if (
            typeof generatePersonnelResponse ===
            "function"
        ) {

            const aiResponse =
                generatePersonnelResponse(
                    chatId,
                    text
                );


            if (
                aiResponse
                &&
                typeof aiResponse ===
                "string"
            ) {

                return aiResponse;

            }

        }

    } catch (
        error
    ) {

        console.warn(
            "[CHAT] Personnel AI fallback failed:",
            error
        );

    }


    /*
     * =====================================================
     * FALLBACK
     * ===================================================== */

    const fallback = {

        general: [

            "Не уверен. Лучше спросить у соответствующего отдела.",

            "Не слышал об этом.",

            "Могу попробовать узнать.",

            "Хороший вопрос. Я уточню."

        ],


        security: [

            "У меня нет этой информации.",

            "Это лучше уточнить у руководителя смены.",

            "Пока не могу подтвердить.",

            "Проверю журналы."

        ],


        research: [

            "У нас пока нет достаточных данных.",

            "Я не хочу делать выводы без результатов.",

            "Это требует дополнительного анализа.",

            "Я запишу вопрос."

        ],


        medical: [

            "Мне нужно проверить записи.",

            "Не могу подтвердить это сейчас.",

            "Лучше уточнить в медицинском журнале.",

            "Я посмотрю данные."

        ],


        incidents: [

            "Информация пока проверяется.",

            "Отчёт ещё не завершён.",

            "Я не могу подтвердить это.",

            "Пока слишком мало данных."

        ],


        admin: [

            "Для этого запроса может потребоваться дополнительный допуск.",

            "Я проверю административные записи.",

            "Не могу подтвердить это без документов.",

            "Запрос принят."

        ]

    };


    const replies =
        fallback[chatId] ||
        fallback.general;


    return randomPick(
        replies
    );

}


/* =========================================================
   ADD CHAT MESSAGE
   ---------------------------------------------------------
   Used by mrsmileChat.js and other OMEGA systems.
========================================================= */

window.addChatMessage = function(
    chatId,
    message
) {

    const chat =
        chats[chatId];


    if (
        !chat
        ||
        !message
    ) {

        return false;

    }


    chat.messages.push(
        message
    );


    /*
     * Unread.
     */

    if (
        activeChat !==
        chatId
    ) {

        chat.unread =
            Number(
                chat.unread
            ) || 0;

        chat.unread++;

    }


    /*
     * MR.SMILE memory.
     */

    if (
        message.user ===
        "MR.SMILE"
    ) {

        rememberMrSmileMessage(
            message.text
        );

    }


    renderChatList();


    if (
        activeChat ===
        chatId
    ) {

        renderActiveChat();

    }


    return true;

};


/* =========================================================
   REVEAL MR.SMILE
========================================================= */

export function revealMrSmileChat() {

    if (
        !chats.mrsmile
    ) {

        return false;

    }


    chats.mrsmile.hidden =
        false;


    renderChatList();


    trigger(
        "mrsmile:chatRevealed"
    );


    console.log(
        "[MR.SMILE CHAT] Channel unlocked."
    );


    return true;

}


/* =========================================================
   REVEAL NULL
========================================================= */

function revealNullChat() {

    if (
        !chats.nullEntity
    ) {

        return;

    }


    chats.nullEntity.hidden =
        false;


    chats.nullEntity.unread =
        1;


    chats.nullEntity.messages.push({

        user:
            "NULL",

        time:
            "--:--",

        text:
            "You shouldn't have done that."

    });


    renderChatList();


    setTimeout(
        () => {

            openChat(
                "nullEntity"
            );

        },
        900
    );

}


/* =========================================================
   NULL FIRST CONTACT
========================================================= */

function triggerNullEvent() {

    if (
        window.nullEventActive
    ) {

        return;

    }


    window.nullEventActive =
        true;


    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (
        !messages
    ) {

        return;

    }


    setTimeout(
        () => {

            addNullMessage(
                "SYSTEM",
                "NULL"
            );

        },
        2500
    );


    setTimeout(
        () => {

            addNullMessage(
                "SYSTEM",
                "SCRIPT EXECUTION FAILURE"
            );

        },
        4000
    );


    setTimeout(
        () => {

            addNullMessage(
                "SYSTEM",
                "NULL REFERENCE"
            );

        },
        4700
    );


    setTimeout(
        () => {

            addNullMessage(
                "SYSTEM",
                "MEMORY ACCESS ERROR"
            );

        },
        5400
    );


    setTimeout(
        () => {

            document.body.classList.add(
                "nullGlitch"
            );

        },
        6000
    );


    setTimeout(
        () => {

            document.body.classList.add(
                "nullGlitchHeavy"
            );

        },
        7500
    );


    setTimeout(
        () => {

            addNullMessage(
                "NULL",
                "..."
            );

        },
        8200
    );


    setTimeout(
        () => {

            addNullMessage(
                "NULL",
                "0x00000000"
            );

        },
        8700
    );


    setTimeout(
        () => {

            document.body.classList.add(
                "nullGlitchMaximum"
            );

        },
        9000
    );


    setTimeout(
        () => {

            addNullMessage(
                "NULL",

                "Want to know what happened to them?... " +
                "Well... it wasn't their fault... " +
                "they did nothing wrong... " +
                "I made them like this, because I wanted to... " +
                "They didn't even have time to react... " +
                "and that's the beauty of it all... " +
                "they were just like YOU... so naive..."
            );

        },
        9800
    );


    setTimeout(
        () => {

            document.body.classList.add(
                "nullFinalFlash"
            );

        },
        14500
    );


    setTimeout(
        () => {

            document.body.classList.remove(
                "nullGlitch",

                "nullGlitchHeavy",

                "nullGlitchMaximum",

                "nullFinalFlash"

            );


            revealNullChat();

        },
        15100
    );

}


/* =========================================================
   NULL MESSAGE
========================================================= */

function addNullMessage(
    user,
    text
) {

    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (
        !messages
    ) {

        return;

    }


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "chatMessage systemMessage";


    if (
        user ===
        "NULL"
    ) {

        element.classList.add(
            "nullMessage"
        );

    }


    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "messageMeta";


    const messageUser =
        document.createElement(
            "span"
        );


    messageUser.className =
        "messageUser";


    messageUser.textContent =
        user;


    const messageTime =
        document.createElement(
            "span"
        );


    messageTime.className =
        "messageTime";


    messageTime.textContent =
        user ===
            "NULL"

            ?

            "--:--"

            :

            getCurrentTime();


    meta.appendChild(
        messageUser
    );


    meta.appendChild(
        messageTime
    );


    const body =
        document.createElement(
            "div"
        );


    body.className =
        "messageText";


    body.textContent =
        text;


    element.appendChild(
        meta
    );


    element.appendChild(
        body
    );


    messages.appendChild(
        element
    );


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================================
   INITIALIZATION
========================================================= */

export function initChats() {

    if (
        initialized
    ) {

        return;

    }


    initialized =
        true;


    /*
     * Reveal MR.SMILE when First Contact
     * has already been completed.
     */

    if (
        localStorage.getItem(
            "mrsmile_first_contact"
        ) ===
        "1"
    ) {

        chats.mrsmile.hidden =
            false;

    }


    renderChatList();

    renderActiveChat();


    const send =
        document.getElementById(
            "sendBtn"
        );


    const input =
        document.getElementById(
            "chatInput"
        );


    if (
        send
    ) {

        send.onclick =
            sendMessage;

    }


    if (
        input
    ) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    if (
                        event.shiftKey
                    ) {

                        return;

                    }


                    event.preventDefault();


                    sendMessage();

                }

            }
        );

    }


    console.log(
        "[OMEGA CHATS] Initialized."
    );

}


/* =========================================================
   PUBLIC CHAT API
========================================================= */

export function getActiveChat() {

    return activeChat;

}


export function getChat(
    chatId
) {

    return chats[
        chatId
    ] || null;

}


export function getAllChats() {

    return chats;

}


export function getChatContext(
    chatId =
        activeChat
) {

    return chats[
        chatId
    ]?.context || null;

}


export function appendChatMessage(
    chatId,
    user,
    text
) {

    const chat =
        chats[chatId];


    if (
        !chat
    ) {

        return false;

    }


    chat.messages.push({

        user,

        time:
            getCurrentTime(),

        text

    });


    renderChatList();


    if (
        activeChat ===
        chatId
    ) {

        renderActiveChat();

    }


    return true;

}


/* =========================================================
   DEBUG API
========================================================= */

if (
    typeof window !==
    "undefined"
) {

    window.OMEGA_CHATS = {

        open:
            openChat,

        active:
            getActiveChat,

        get:
            getChat,

        all:
            getAllChats,

        context:
            getChatContext,

        append:
            appendChatMessage,

        revealMrSmile:
            revealMrSmileChat,

        render:
            renderActiveChat

    };

}


/* =========================================================
   HELPERS
========================================================= */

function contains(
    text,
    values
) {

    return values.some(
        value =>
            text.includes(
                value
            )
    );

}


function randomPick(
    values
) {

    return values[
        Math.floor(
            Math.random() *
            values.length
        )
    ];

}


function randomBetween(
    min,
    max
) {

    return Math.floor(

        Math.random() *
        (
            max -
            min +
            1
        )

    ) + min;

}


function getCurrentTime() {

    const now =
        new Date();


    return (

        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        )

        +

        ":"

        +

        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        )

    );

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
