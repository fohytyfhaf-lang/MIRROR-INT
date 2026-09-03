/* =========================================================
   OMEGA INTERNAL CHATS
========================================================= */
import { canAccess } from "./security.js";
import {
    processMrSmileInput
} from "./mrsmileProgress.js";
import {
    generatePersonnelResponse
} from "./personnelAI.js";

const chats = {

    general: {

        name: "GENERAL",

        status: "INTERNAL CHANNEL",

        clearance: 0,
        unread: 0,

        messages: [

            {
                user: "SYSTEM",
                time: "08:12",
                text: "Welcome to OMEGA internal communications."
            },

            {
                user: "OPERATOR_04",
                time: "08:16",
                text: "Morning. Is anyone else having network problems?"
            },

            {
                user: "OPERATOR_09",
                time: "08:18",
                text: "Yes. Sector C terminals keep disconnecting."
            }

        ]

    },


    security: {

        name: "SECURITY",

        status: "SECURITY DEPARTMENT",

        clearance: 2,
        unread: 3,
       
        context: {
           topic: null,
           lastSubject: null
     },
       
        messages: [

            {
                user: "SECURITY_01",
                time: "09:21",
                text: "Security checkpoint 3 is operational."
            },

            {
                user: "SECURITY_03",
                time: "09:27",
                text: "We detected unauthorized access attempts."
            },

            {
                user: "SECURITY_01",
                time: "09:29",
                text: "Increase surveillance around the archive."
            }

        ]

    },


    research: {

        name: "RESEARCH",

        status: "RESEARCH DEPARTMENT",

        clearance: 2,
        unread: 1,

        messages: [

            {
                user: "DR. KLINE",
                time: "09:42",
                text: "Experiment TEN has entered phase 3."
            },

            {
                user: "DR. MILLER",
                time: "09:44",
                text: "Was phase 3 approved?"
            },

            {
                user: "DR. KLINE",
                time: "09:45",
                text: "No."
            },

            {
                user: "DR. MILLER",
                time: "09:46",
                text: "Then why is it running?"
            }

        ]

    },


    medical: {

        name: "MEDICAL",

        status: "MEDICAL DEPARTMENT",

        clearance: 3,
        unread: 2,

        messages: [

            {
                user: "MEDICAL_02",
                time: "10:03",
                text: "Medical sector reports no critical injuries."
            },

            {
                user: "MEDICAL_05",
                time: "10:07",
                text: "Correction: one unidentified patient has been transferred."
            }

        ]

    },


    incidents: {

        name: "INCIDENTS",

        status: "INCIDENT REPORTING",

        clearance: 3,
        unread: 1,

        messages: [

            {
                user: "SYSTEM",
                time: "11:02",
                text: "INCIDENT CHANNEL ACTIVE."
            },

            {
                user: "SECURITY_02",
                time: "11:05",
                text: "Motion detected in restricted sector."
            },

            {
                user: "SECURITY_02",
                time: "11:07",
                text: "No personnel were authorized to be there."
            }

        ]

    },


    admin: {

        name: "ADMINISTRATION",

        status: "ADMINISTRATIVE CHANNEL",

        clearance: 5,
        unread: 0,

        messages: [

            {
                user: "ADMIN",
                time: "12:11",
                text: "This channel is restricted to administrative personnel."
            },

            {
                user: "ADMIN",
                time: "12:13",
                text: "Unauthorized redistribution of internal documents is prohibited."
            }

        ]

    },


    mrsmile: {

        name: "MR.SMILE",

        status: "CONNECTION UNSTABLE",

        clearance: 2,
        unread: 7,

        special: true,
        hidden: true,

        messages: [

            {
                user: "SYSTEM",
                time: "02:13",
                text: "UNKNOWN COMMUNICATION CHANNEL DETECTED."
            },

            {
                user: "OPERATOR_07",
                time: "02:13",
                text: "Are you there?"
            },

            {
                user: "MR.SMILE",
                time: "02:13",
                text: ":)"
            },

            {
                user: "OPERATOR_07",
                time: "02:14",
                text: "Who authorized this channel?"
            },

            {
                user: "MR.SMILE",
                time: "02:14",
                text: "You did."
            },

            {
                user: "OPERATOR_07",
                time: "02:14",
                text: "I did not."
            },

            {
                user: "MR.SMILE",
                time: "02:15",
                text: "I know."
            }

         ]

    },


    nullEntity: {

        name: "NULL",

        status: "UNKNOWN CONNECTION",

        clearance: 0,

        unread: 0,

        special: true,

        hidden: true,

        messages: [

            {
                user: "SYSTEM",
                time: "--:--",
                text: "UNKNOWN USER PROFILE."
            },

            {
                user: "NULL",
                time: "--:--",
                text: "..."
            }

        ]

    }

};


/* =========================================================
   CHAT CONTEXT
========================================================= */

Object.values(chats).forEach(chat => {

    chat.context = {

        topic: null,
        entity: null,
        state: null,
        lastQuestion: null

    };

});

/* =========================================================
   STATE
========================================================= */

let activeChat = "general";

/* =========================================================
   UPDATE CHAT CONTEXT
========================================================= */

function updateChatContext(chatId, text) {

    const chat = chats[chatId];

    if (!chat || !chat.context) return;

    const message = text
        .toLowerCase()
        .trim();

    const context = chat.context;


    /* =========================================
       SHORT QUESTIONS
    ========================================= */

    if (
        message === "почему" ||
        message === "почему?" ||
        message === "why"
    ) {

        context.lastQuestion = "why";
        return;

    }


    if (
        message === "кто" ||
        message === "кто?" ||
        message === "who"
    ) {

        context.lastQuestion = "who";
        return;

    }


    if (
        message === "где" ||
        message === "где?" ||
        message === "where"
    ) {

        context.lastQuestion = "where";
        return;

    }


    if (
        message === "когда" ||
        message === "когда?" ||
        message === "when"
    ) {

        context.lastQuestion = "when";
        return;

    }


    if (
        message === "а потом" ||
        message === "а потом?" ||
        message === "what happened next"
    ) {

        context.lastQuestion = "after";
        return;

    }


    /* =========================================
       SECURITY
    ========================================= */

    if (chatId === "security") {

        if (
            message.includes("камера 04") ||
            message.includes("камера04") ||
            message.includes("camera 04") ||
            message.includes("camera04")
        ) {

            context.topic = "camera";
            context.entity = "camera_04";
            context.state = "camera_04_discussion";

        }
        else if (message.includes("камера")) {

            context.topic = "camera";
            context.entity = "camera";

        }


        if (
            message.includes("сектор c") ||
            message.includes("sector c")
        ) {

            context.topic = "sector_c";
            context.entity = "sector_c";

        }


        if (
            message.includes("доступ") ||
            message.includes("проник") ||
            message.includes("заходил")
        ) {

            context.topic = "unauthorized_access";

        }

    }


    /* =========================================
       RESEARCH
    ========================================= */

    if (chatId === "research") {

        if (
            message.includes("ten") ||
            message.includes("эксперимент")
        ) {

            context.topic = "TEN";
            context.entity = "TEN";
            context.state = "TEN_discussion";

        }


        if (
            message.includes("фаза 3") ||
            message.includes("третья фаза")
        ) {

            context.topic = "TEN";
            context.entity = "TEN_phase_3";
            context.state = "phase_3_discussion";

        }


        if (
            message.includes("создал") ||
            message.includes("создатель")
        ) {

            context.topic = "TEN";
            context.state = "TEN_creator";

        }

    }


    /* =========================================
       MEDICAL
    ========================================= */

    if (chatId === "medical") {

        if (
            message.includes("пациент") ||
            message.includes("пациента")
        ) {

            context.topic = "patient";
            context.entity = "unidentified_patient";
            context.state = "patient_discussion";

        }

    }


    /* =========================================
       INCIDENTS
    ========================================= */

    if (chatId === "incidents") {

        if (
            message.includes("движение") ||
            message.includes("перемещение")
        ) {

            context.topic = "unknown_movement";
            context.entity = "unknown_movement";
            context.state = "incident_discussion";

        }


        if (
            message.includes("закрыт") ||
            message.includes("restricted")
        ) {

            context.topic = "restricted_sector";

        }

    }


    /* =========================================
       LAST QUESTION
    ========================================= */

    if (
        message.endsWith("?")
    ) {

        context.lastQuestion = message;

    }

}
/* =========================================================
   RENDER CHAT LIST
========================================================= */
function renderChatList() {

    const list =
        document.getElementById("chatList");

    if (!list) return;

    list.innerHTML = "";

    Object.entries(chats).forEach(
        ([id, chat]) => {

           if (chat.hidden) return;

            /* =========================================
               ACCESS CHECK
            ========================================= */

            if (!canAccess(chat.clearance)) {

                const item =
                    document.createElement("div");

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

                list.appendChild(item);

                return;
            }


            /* =========================================
               NORMAL CHAT
            ========================================= */

            const item =
                document.createElement("div");

            item.className =
                "chatListItem";

            if (id === activeChat) {
                item.classList.add("active");
            }


            const unread =
                chat.unread || 0;


            item.innerHTML = `

                <div class="chatAvatar">
                    ${chat.special ? "☻" : "●"}
                </div>

                <div class="chatListInfo">

                    <div class="chatListName">
                        ${chat.name}
                    </div>

                    <div class="chatListStatus">
                        ${chat.status}
                    </div>

                </div>

                ${
                    unread > 0
                    ?
                    `
                    <div class="chatUnread">
                        ${unread > 99 ? "99+" : unread}
                    </div>
                    `
                    :
                    ""
                }

            `;


            item.addEventListener(
                "click",
                () => {

                    activeChat = id;

                    /* Сбрасываем непрочитанные */

                    chats[id].unread = 0;

                    renderChatList();
                    renderActiveChat();

                }
            );


            list.appendChild(item);

        }
    );

}


/* =========================================================
   RENDER ACTIVE CHAT
========================================================= */

function renderActiveChat() {

    const chat =
        chats[activeChat];

    if (!chat) return;


    const name =
        document.getElementById("activeChatName");

    const status =
        document.getElementById("activeChatStatus");

    const clearance =
        document.getElementById("activeChatClearance");

    const messages =
        document.getElementById("chatMessages");


    if (name) {
        name.textContent = chat.name;
    }

    if (status) {
        status.textContent = chat.status;
    }

    if (clearance) {

        clearance.textContent =
            `CLEARANCE: ${chat.clearance}`;

    }

    if (!messages) return;


    messages.innerHTML = "";


    chat.messages.forEach(message => {

        const element =
            document.createElement("div");

        element.className =
            "chatMessage";

        if (message.user === "MR.SMILE") {
            element.classList.add("mrSmileMessage");
        }

        if (message.user === "SYSTEM") {
            element.classList.add("systemMessage");
        }

        element.innerHTML = `

            <div class="messageMeta">

                <span class="messageUser">
                    ${message.user}
                </span>

                <span class="messageTime">
                    ${message.time}
                </span>

            </div>

            <div class="messageText">
                ${message.text}
            </div>

        `;

        messages.appendChild(element);

    });


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================================
   SEND MESSAGE
========================================================= */
function sendMessage() {

    const input =
        document.getElementById("chatInput");

    if (!input) return;

    const text =
        input.value.trim();

    if (!text) return;


    const now =
        new Date();

    const time =
        String(now.getHours()).padStart(2, "0")
        + ":"
        +
        String(now.getMinutes()).padStart(2, "0");


    /* =========================================
       PLAYER MESSAGE
    ========================================= */

    chats[activeChat].messages.push({

        user: "YOU",
        time: time,
        text: text

    });

   updateChatContext(activeChat, text);

   if (activeChat === "mrsmile") {

        processMrSmileInput(text);

   }

    input.value = "";

    renderActiveChat();



    /* =========================================
       MR.SMILE
    ========================================= */

    if (activeChat === "mrsmile") {

        setTimeout(() => {

            const response =
                generateMrSmileResponse(text);

            chats.mrsmile.messages.push({

                user: "MR.SMILE",

                time:
                    getCurrentTime(),

                text: response

            });

            renderActiveChat();

        }, 700);

        return;
    }


    /* =========================================
       NORMAL PERSONNEL
    ========================================= */

    const chat =
        chats[activeChat];

    if (!chat) return;


    /*
       Берём последнего реального
       сотрудника из сообщений.
    */

    const personnel =
        [...chat.messages]
            .reverse()
            .find(message =>

                message.user !== "YOU" &&
                message.user !== "SYSTEM"

            );


    if (!personnel) return;


    setTimeout(() => {

      let response =
    getContextualResponse(
        activeChat,
        text
    );

    if (!response) {

      response =
        generateEmployeeResponse(
            activeChat,
            text
        );

     }


        chats[activeChat].messages.push({

            user: personnel.user,

            time:
                getCurrentTime(),

            text: response

        });


        renderActiveChat();

    }, 700);

}

/* =========================================================
   CURRENT TIME
========================================================= */

function getCurrentTime(){

    const now =
        new Date();

    return (
        String(now.getHours()).padStart(2, "0")
        +
        ":"
        +
        String(now.getMinutes()).padStart(2, "0")
    );

}

/* =========================================================
   MR.SMILE BASIC RESPONSE
========================================================= */

function generateMrSmileResponse(text) {

    const message =
        text.toLowerCase();

       if (message === "null") {

        triggerNullEvent();

        return null;

    }


    if (
        message.includes("hello") ||
        message.includes("hi") ||
        message.includes("привет")
    ) {

        return "Hello, operator. :)";

    }


    if (
        message.includes("who are you") ||
        message.includes("кто ты")
    ) {

        return "You already know.";

    }


    if (
        message.includes("where") ||
        message.includes("где")
    ) {

        return "Closer than you think.";

    }


    if (
        message.includes("why") ||
        message.includes("почему")
    ) {

        return "Because someone opened the door.";

    }


    return ":)";


}

/* =========================================================
   CONTEXTUAL RESPONSE
========================================================= */

function getContextualResponse(chatId, text) {

    const chat = chats[chatId];

    if (!chat) return null;

    if (!chat.context) {

        chat.context = {
            topic: null,
            lastSubject: null
        };

    }

    const context = chat.context;

    const message =
        text.toLowerCase().trim();


    /* =====================================================
       SECURITY
    ===================================================== */

    if (chatId === "security") {


        /* -----------------------------------------
           CAMERA 04
        ----------------------------------------- */

        if (
            message.includes("камера 04") ||
            message.includes("camera 04")
        ) {

            context.topic = "camera_04";
            context.lastSubject = "camera_04";

            return "Камера 04 периодически теряет сигнал. Мы пока не нашли причину.";

        }


        /* -----------------------------------------
           CAMERA TOPIC
        ----------------------------------------- */

        if (context.topic === "camera_04") {


            if (
                message === "почему" ||
                message === "почему?"
            ) {

                context.lastSubject =
                    "camera_04_problem";

                return "Пока неизвестно. Сигнал пропадает примерно на 3–5 секунд. Технический отдел уже занимается этим.";

            }


            if (
                message === "кто" ||
                message === "кто?"
            ) {

                return "Если ты про то, кто был рядом с камерой — в журнале доступа никто не зарегистрирован.";

            }


            if (
                message === "где" ||
                message === "где?"
            ) {

                return "Камера 04 находится в закрытом секторе C.";

            }


            if (
                message.includes("проверял") ||
                message.includes("проверяли") ||
                message.includes("кто проверял")
            ) {

                return "Да. Я проверял её лично вместе с техническим сотрудником.";

            }


            if (
                message.includes("нашли") ||
                message.includes("нашли причину") ||
                message.includes("причина")
            ) {

                return "Нет. Пока только установили, что проблема возникает примерно через одинаковые промежутки времени.";

            }


            if (
                message.includes("опасно") ||
                message.includes("это опасно")
            ) {

                return "Пока нет подтверждения. Но камера находится в закрытой зоне, поэтому мы относимся к этому серьёзно.";

            }


            if (
                message === "а потом" ||
                message === "а потом?" ||
                message.includes("что потом") ||
                message.includes("что было дальше")
            ) {

                return "После очередного сбоя мы просмотрели запись. На несколько секунд там действительно что-то двигалось.";

            }

        }


        /* -----------------------------------------
           GENERAL SECURITY TOPICS
        ----------------------------------------- */

        if (
            message.includes("день") ||
            message.includes("смена")
        ) {

            context.topic = "shift";

            return "Смена была относительно спокойной. Только камера 04 снова начала терять сигнал.";

        }


        if (
            message.includes("сигнал")
        ) {

            context.topic = "camera_04";

            return "Если ты про камеру 04 — сигнал действительно нестабильный.";

        }


        if (
            message.includes("движение") ||
            message.includes("кто-то двигался")
        ) {

            context.topic = "movement";

            return "Да. Движение было зафиксировано в закрытом секторе. Но камеры не дали нормального изображения.";

        }


        if (
            message.includes("доступ") ||
            message.includes("журнал")
        ) {

            context.topic = "access_log";

            return "Журнал доступа чист. Никто официально не входил в этот сектор.";

        }


        /* -----------------------------------------
           SHORT QUESTIONS WITHOUT CONTEXT
        ----------------------------------------- */

        if (
            message === "почему" ||
            message === "почему?"
        ) {

            return "Почему именно? Уточни, о чём ты спрашиваешь.";

        }


        if (
            message === "кто" ||
            message === "кто?"
        ) {

            return "Кто именно? Мне нужен контекст.";

        }


        if (
            message === "где" ||
            message === "где?"
        ) {

            return "Где именно? Уточни объект.";

        }


        if (
            message === "а потом" ||
            message === "а потом?"
        ) {

            return "После чего именно?";

        }

    }

           /* -----------------------------------------
           COLLEAGUES
        ----------------------------------------- */

        if (
            message.includes("коллег") ||
            message.includes("охранник") ||
            message.includes("охранники")
        ) {

            context.topic = "colleagues";

            return [
                "SECURITY_03 опять опоздал на смену.",
                "Большинство сейчас на своих постах.",
                "Все заняты работой. Ничего необычного.",
                "Один из ребят сейчас проверяет северный коридор."
            ][
                Math.floor(Math.random() * 4)
            ];

        }


        /* -----------------------------------------
           EQUIPMENT
        ----------------------------------------- */

        if (
            message.includes("оборудован") ||
            message.includes("терминал") ||
            message.includes("рация")
        ) {

            context.topic = "equipment";

            return [
                "Часть оборудования сегодня работает нестабильно.",
                "Терминалы в основном работают нормально.",
                "Одну из раций пришлось заменить.",
                "С оборудованием бывают проблемы. Ничего нового."
            ][
                Math.floor(Math.random() * 4)
            ];

        }


        /* -----------------------------------------
           DOORS
        ----------------------------------------- */

        if (
            message.includes("двер") ||
            message.includes("замок") ||
            message.includes("карту доступа")
        ) {

            context.topic = "doors";

            return "У одной из дверей сегодня несколько раз не сработала карта доступа. Технический отдел уже проверяет замок.";

        }


        /* -----------------------------------------
           SECTOR C
        ----------------------------------------- */

        if (
            message.includes("сектор c") ||
            message.includes("sector c")
        ) {

            context.topic = "sector_c";

            return "Сектор C сейчас под наблюдением. Ничего необычного... по крайней мере официально.";

        }


        /* -----------------------------------------
           ALARMS
        ----------------------------------------- */

        if (
            message.includes("тревог") ||
            message.includes("срабатыван")
        ) {

            context.topic = "alarms";

            return "Сегодня было несколько срабатываний датчиков. Большинство оказались ложными.";

        }


        /* -----------------------------------------
           FOLLOW-UP — COLLEAGUES
        ----------------------------------------- */

        if (context.topic === "colleagues") {

            if (
                message === "почему" ||
                message === "почему?"
            ) {

                return "Если ты про SECURITY_03 — он просто опять проспал.";

            }

            if (
                message === "кто" ||
                message === "кто?"
            ) {

                return "SECURITY_03. Я говорил о нём.";

            }

        }


        /* -----------------------------------------
           FOLLOW-UP — EQUIPMENT
        ----------------------------------------- */

        if (context.topic === "equipment") {

            if (
                message === "почему" ||
                message === "почему?"
            ) {

                return "Пока не знаем. Возможно, проблема с питанием.";

            }

            if (
                message.includes("починили")
            ) {

                return "Большую часть уже починили. Остальное проверяют техники.";

            }

        }


        /* -----------------------------------------
           FOLLOW-UP — DOORS
        ----------------------------------------- */

        if (context.topic === "doors") {

            if (
                message === "почему" ||
                message === "почему?"
            ) {

                return "Похоже на неисправность считывателя. Сам замок работает нормально.";

            }

            if (
                message.includes("опасно")
            ) {

                return "Нет. Дверь всё равно можно открыть вручную с поста.";

            }

        }


        /* -----------------------------------------
           FOLLOW-UP — SECTOR C
        ----------------------------------------- */

        if (context.topic === "sector_c") {

            if (
                message === "почему" ||
                message === "почему?"
            ) {

                return "После нескольких странных срабатываний мы решили усилить наблюдение.";

            }

            if (
                message === "кто" ||
                message === "кто?"
            ) {

                return "Официально — никто. Доступ в сектор сейчас ограничен.";

            }

        }


        /* -----------------------------------------
           FOLLOW-UP — ALARMS
        ----------------------------------------- */

        if (context.topic === "alarms") {

            if (
                message === "почему" ||
                message === "почему?"
            ) {

                return "Некоторые датчики слишком чувствительные. Иногда они реагируют даже на движение воздуха.";

            }

            if (
                message.includes("что случилось") ||
                message.includes("что произошло")
            ) {

                return "Один датчик сработал без видимой причины. Мы проверили помещение, но ничего не нашли.";

            }

        }


    return null;

}

/* =========================================================
   NULL FIRST CONTACT
========================================================= */

function triggerNullEvent() {

    if (window.nullEventActive) return;

    window.nullEventActive = true;

    const messages =
        document.getElementById("chatMessages");

    if (!messages) return;


    /* =========================================
       STAGE 1 — SILENCE
    ========================================= */

    setTimeout(() => {

        addNullMessage(
            "SYSTEM",
            "NULL"
        );

    }, 2500);


    /* =========================================
       STAGE 2 — ERRORS
    ========================================= */

    setTimeout(() => {

        addNullMessage(
            "SYSTEM",
            "SCRIPT EXECUTION FAILURE"
        );

    }, 4000);


    setTimeout(() => {

        addNullMessage(
            "SYSTEM",
            "NULL REFERENCE"
        );

    }, 4700);


    setTimeout(() => {

        addNullMessage(
            "SYSTEM",
            "MEMORY ACCESS ERROR"
        );

    }, 5400);


    /* =========================================
       STAGE 3 — GLITCH START
    ========================================= */

    setTimeout(() => {

        document.body.classList.add(
            "nullGlitch"
        );

    }, 6000);


    /* =========================================
       STAGE 4 — STRONGER GLITCH
    ========================================= */

    setTimeout(() => {

        document.body.classList.add(
            "nullGlitchHeavy"
        );

    }, 7500);


    /* =========================================
       STAGE 5 — NULL TAKES OVER
    ========================================= */

    setTimeout(() => {

        addNullMessage(
            "NULL",
            "..."
        );

    }, 8200);


    setTimeout(() => {

        addNullMessage(
            "NULL",
            "0x00000000"
        );

    }, 8700);


    /* =========================================
       STAGE 6 — MAXIMUM GLITCH
    ========================================= */

    setTimeout(() => {

        document.body.classList.add(
            "nullGlitchMaximum"
        );

    }, 9000);


    /* =========================================
       STAGE 7 — FINAL MESSAGE
    ========================================= */

    setTimeout(() => {

        addNullMessage(
            "NULL",
            "Want to know what happened to them?... Well... it wasn't their fault... they did nothing wrong... I made them like this, because I wanted to... They didn't even have time to react... and that's the beauty of it all... they were just like YOU... so naive..."
        );

    }, 9800);


    /* =========================================
       STAGE 8 — HARD CUT
    ========================================= */

    setTimeout(() => {

        document.body.classList.add(
            "nullFinalFlash"
        );

    }, 14500);


    /* =========================================
       STAGE 9 — REMOVE GLITCH INSTANTLY
       AND REVEAL NULL
    ========================================= */

    setTimeout(() => {

        document.body.classList.remove(
            "nullGlitch",
            "nullGlitchHeavy",
            "nullGlitchMaximum",
            "nullFinalFlash"
        );


        revealNullChat();


    }, 15100);

}

/* =========================================================
   REVEAL NULL CHAT
========================================================= */

function revealNullChat() {

    if (!chats.nullEntity) return;


    /* NULL больше не скрыт */

    chats.nullEntity.hidden = false;


    /* Первое сообщение */

    chats.nullEntity.messages.push({

        user: "NULL",

        time: getCurrentTime(),

        text: "You shouldn't have done that."

    });


    /* Уведомление */

    chats.nullEntity.unread = 1;


    /* Обновляем список */

    renderChatList();


    /*
       Через небольшую задержку
       открываем NULL автоматически
    */

    setTimeout(() => {

        activeChat = "nullEntity";

        chats.nullEntity.unread = 0;

        renderChatList();

        renderActiveChat();

    }, 900);

}

/* =========================================================
   NULL MESSAGE
========================================================= */

function addNullMessage(user, text) {

    const messages =
        document.getElementById("chatMessages");

    if (!messages) return;


    const element =
        document.createElement("div");

    element.className =
        "chatMessage systemMessage";


    if (user === "MR.SMILE") {

        element.classList.add(
            "mrSmileMessage"
        );

    }


    element.innerHTML = `

        <div class="messageMeta">

            <span class="messageUser">
                ${user}
            </span>

            <span class="messageTime">
                ${
                    user === "NULL"
                    ? "--:--"
                    : getCurrentTime()
                }
            </span>

        </div>

        <div class="messageText">
            ${text}
        </div>

    `;


    messages.appendChild(element);

    messages.scrollTop =
        messages.scrollHeight;

}
/* =========================================================
   EMPLOYEE INTELLIGENCE
========================================================= */

function generateEmployeeResponse(chatId, text) {

    const message = text
        .toLowerCase()
        .trim();


    /* -----------------------------------------
       GENERAL
    ----------------------------------------- */

    if (chatId === "general") {

        if (
            message.includes("привет") ||
            message.includes("hello") ||
            message.includes("hi")
        ) {

            return [
                "Привет. Как смена?",
                "Доброе утро. Хотя я уже потерял счёт времени.",
                "Привет. Здесь пока всё спокойно.",
                "Здравствуй. Что-то случилось?"
            ][Math.floor(Math.random() * 4)];

        }


        if (
            message.includes("как дела") ||
            message.includes("как ты")
        ) {

            return [
                "Нормально. Сижу на смене.",
                "Пока не жалуюсь.",
                "Устал, если честно.",
                "Лучше, чем вчера."
            ][Math.floor(Math.random() * 4)];

        }


        if (
            message.includes("как прошел день") ||
            message.includes("как прошёл день") ||
            message.includes("что делал") ||
            message.includes("чем занимался")
        ) {

            return "Большую часть смены занимался обычными проверками. Потом несколько терминалов в секторе C начали отключаться. Пока причину не нашли.";

        }


        if (
            message.includes("что случилось") ||
            message.includes("что произошло") ||
            message.includes("новости")
        ) {

            return "Особых новостей нет. Хотя SECURITY снова жалуется на проблемы в секторе C.";

        }

    }


    /* -----------------------------------------
       SECURITY
    ----------------------------------------- */

    if (chatId === "security") {

        if (
            message.includes("привет") ||
            message.includes("hello")
        ) {

            return [
                "Привет. SECURITY, пост 03.",
                "Здравствуйте, оператор.",
                "Привет. Сейчас на посту."
            ][Math.floor(Math.random() * 3)];

        }


        if (
            message.includes("как дела") ||
            message.includes("как ты")
        ) {

            return "Нормально. Смена спокойная, если не считать пару срабатываний датчиков.";

        }


        if (
            message.includes("как прошел день") ||
            message.includes("как прошёл день") ||
            message.includes("что делал")
        ) {

            return "Проверял камеры, обходил сектор C и разбирался с несколькими ложными тревогами. Одна из них, правда, оказалась не такой уж ложной.";

        }


        if (
            message.includes("что случилось") ||
            message.includes("что произошло")
        ) {

            return "Камера 04 зафиксировала движение в закрытом секторе. Персонала там быть не должно.";

        }


        if (
            message.includes("кто") &&
            (
                message.includes("был") ||
                message.includes("заходил")
            )
        ) {

            return "В журнале доступа никто не отмечен. Именно это нас и беспокоит.";

        }


        if (
            message.includes("камера")
        ) {

            return "Камеры работают штатно. Кроме камеры 04 — у неё периодически пропадает изображение.";

        }

    }
       /* =====================================================
       MEDICAL
    ===================================================== */

    if (chatId === "medical") {

        /* -----------------------------------------
           GREETING
        ----------------------------------------- */

        if (
            message === "привет" ||
            message === "привет!" ||
            message === "hello" ||
            message === "hi"
        ) {

            context.topic = "medical_general";

            return [
                "Здравствуйте. Медицинский сектор на связи.",
                "Привет. Сегодня довольно спокойно.",
                "Здравствуйте. Если вы не по срочному делу — я вас слушаю.",
                "Привет. Только закончил с обходом."
            ][
                Math.floor(Math.random() * 4)
            ];

        }


        /* -----------------------------------------
           HOW ARE YOU
        ----------------------------------------- */

        if (
            message.includes("как дела") ||
            message.includes("как ты")
        ) {

            context.topic = "medical_general";

            return [
                "Нормально. Сегодня пациентов немного.",
                "Пока хорошо. Обход только закончил.",
                "Устал, но ничего критичного.",
                "Неплохо. Медицинский сектор работает штатно."
            ][
                Math.floor(Math.random() * 4)
            ];

        }


        /* -----------------------------------------
           SHIFT
        ----------------------------------------- */

        if (
            message.includes("смена") ||
            message.includes("работа") ||
            message.includes("день")
        ) {

            context.topic = "medical_shift";

            return [
                "Сегодня было довольно спокойно.",
                "Проверил несколько пациентов и заполнил отчёты.",
                "Большую часть смены занимались обычными обследованиями.",
                "День прошёл нормально. Ничего чрезвычайного."
            ][
                Math.floor(Math.random() * 4)
            ];

        }


        /* -----------------------------------------
           PATIENTS
        ----------------------------------------- */

        if (
            message.includes("пациент") ||
            message.includes("пациенты")
        ) {

            context.topic = "patients";

            return [
                "Сейчас несколько пациентов проходят обследование.",
                "Большинство пациентов уже выписали.",
                "Есть несколько человек под наблюдением.",
                "Сегодня поступило несколько новых пациентов."
            ][
                Math.floor(Math.random() * 4)
            ];

        }


        /* -----------------------------------------
           DOCTOR
        ----------------------------------------- */

        if (
            message.includes("врач") ||
            message.includes("доктор") ||
            message.includes("медик")
        ) {

            context.topic = "staff";

            return [
                "Все врачи сейчас заняты.",
                "Медицинская команда сегодня работает почти без перерыва.",
                "Несколько сотрудников ушли на короткий перерыв.",
                "Большинство уже закончило дневной обход."
            ][
                Math.floor(Math.random() * 4)
            ];

        }


        /* -----------------------------------------
           EQUIPMENT
        ----------------------------------------- */

        if (
            message.includes("оборудован") ||
            message.includes("аппарат") ||
            message.includes("сканер") ||
            message.includes("терминал")
        ) {

            context.topic = "medical_equipment";

            return [
                "Большая часть оборудования работает нормально.",
                "Один из сканеров сегодня пришлось перезапустить.",
                "Технический отдел проверяет несколько медицинских терминалов.",
                "С оборудованием пока всё в пределах нормы."
            ][
                Math.floor(Math.random() * 4)
            ];

        }


        /* -----------------------------------------
           MEDICAL RECORDS
        ----------------------------------------- */

        if (
            message.includes("запис") ||
            message.includes("документ") ||
            message.includes("карта")
        ) {

            context.topic = "records";

            return "Медицинские записи обновляются после каждого обследования. Если вам нужен конкретный файл, потребуется соответствующий доступ.";

        }


        /* -----------------------------------------
           MEDICAL TRANSFER
        ----------------------------------------- */

        if (
            message.includes("перевод") ||
            message.includes("перевели") ||
            message.includes("поступил")
        ) {

            context.topic = "transfer";

            return "Сегодня действительно был один перевод из другого сектора. Документы ещё обрабатываются.";

        }


        /* -----------------------------------------
           INJURIES
        ----------------------------------------- */

        if (
            message.includes("травм") ||
            message.includes("ранен") ||
            message.includes("травмирован")
        ) {

            context.topic = "injuries";

            return [
                "Ничего серьёзного. В основном небольшие травмы.",
                "Есть несколько лёгких повреждений, но угрозы жизни нет.",
                "Критических травм сегодня не зарегистрировано.",
                "Пока всё под контролем."
            ][
                Math.floor(Math.random() * 4)
            ];

        }


        /* -----------------------------------------
           MEDICAL FOLLOW-UP
        ----------------------------------------- */

        if (context.topic === "patients") {

            if (
                message === "кто" ||
                message === "кто?"
            ) {

                return "Если ты спрашиваешь о пациентах — большинство из них сотрудники OMEGA.";

            }

            if (
                message === "где" ||
                message === "где?"
            ) {

                return "В основном в обычных палатах. Несколько человек находятся под наблюдением.";

            }

            if (
                message === "почему" ||
                message === "почему?"
            ) {

                return "У каждого свой случай. В основном обычные обследования и небольшие травмы.";

            }

        }


        /* -----------------------------------------
           EQUIPMENT FOLLOW-UP
        ----------------------------------------- */

        if (context.topic === "medical_equipment") {

            if (
                message === "почему" ||
                message === "почему?"
            ) {

                return "Сканер несколько раз переставал отвечать. Пока неясно, проблема в программном обеспечении или самом устройстве.";

            }

            if (
                message.includes("починили")
            ) {

                return "Да, после перезапуска он снова работает.";

            }

        }


        /* -----------------------------------------
           STAFF FOLLOW-UP
        ----------------------------------------- */

        if (context.topic === "staff") {

            if (
                message === "кто" ||
                message === "кто?"
            ) {

                return "MEDICAL_02 сейчас занимается пациентами, а MEDICAL_05 заполняет отчёты.";

            }

            if (
                message === "почему" ||
                message === "почему?"
            ) {

                return "Сегодня просто много работы.";

            }

        }


        /* -----------------------------------------
           TRANSFER FOLLOW-UP
        ----------------------------------------- */

        if (context.topic === "transfer") {

            if (
                message === "кто" ||
                message === "кто?"
            ) {

                return "Имя пока не могу назвать. Документы ещё проходят проверку.";

            }

            if (
                message === "откуда" ||
                message === "откуда?"
            ) {

                return "Из исследовательского сектора.";

            }

            if (
                message === "почему" ||
                message === "почему?"
            ) {

                return "Причина перевода указана в документах, но я пока их не просмотрел.";

            }

        }


        /* -----------------------------------------
           RECORDS FOLLOW-UP
        ----------------------------------------- */

        if (context.topic === "records") {

            if (
                message === "кто" ||
                message === "кто?"
            ) {

                return "Доступ к медицинским картам имеют только сотрудники с соответствующим допуском.";

            }

            if (
                message.includes("почему")
            ) {

                return "Медицинские данные считаются конфиденциальными.";

            }

        }

    }
   

    /* -----------------------------------------
       RESEARCH
    ----------------------------------------- */

    if (chatId === "research") {

        if (
            message.includes("привет") ||
            message.includes("hello")
        ) {

            return "Здравствуйте. Если вы по поводу TEN, то результаты пока не готовы.";

        }


        if (
            message.includes("как дела") ||
            message.includes("как ты")
        ) {

            return "Сложно ответить. У нас сегодня было несколько неожиданных результатов.";

        }


        if (
            message.includes("как прошел день") ||
            message.includes("как прошёл день") ||
            message.includes("что делал")
        ) {

            return "Мы продолжали работу с TEN. Третий этап завершён, но показатели сильно отличаются от предыдущих.";

        }


        if (
            message.includes("ten") ||
            message.includes("эксперимент")
        ) {

            return "TEN находится на третьей фазе. Формально она ещё не должна была начаться.";

        }


        if (
            message.includes("что случилось") ||
            message.includes("что произошло")
        ) {

            return "Один из показателей вышел за допустимый диапазон. Пока мы не понимаем почему.";

        }


        if (
            message.includes("почему") ||
            message.includes("зачем")
        ) {

            return "Я бы предпочёл не делать выводов без данных. Но ситуация выглядит необычно.";

        }

    }


    /* -----------------------------------------
       MEDICAL
    ----------------------------------------- */

    if (chatId === "medical") {

        if (
            message.includes("привет") ||
            message.includes("hello")
        ) {

            return "Здравствуйте. Медицинский сектор на связи.";

        }


        if (
            message.includes("как дела") ||
            message.includes("как ты")
        ) {

            return "Пока спокойно. Несколько сотрудников проходят обследование.";

        }


        if (
            message.includes("как прошел день") ||
            message.includes("как прошёл день") ||
            message.includes("что делал")
        ) {

            return "Проверял состояние персонала и принимал несколько переводов из исследовательского сектора.";

        }


        if (
            message.includes("пациент") ||
            message.includes("пациенты")
        ) {

            return "Сейчас у нас один пациент без полной идентификации. Документы ещё проверяются.";

        }


        if (
            message.includes("что случилось") ||
            message.includes("что произошло")
        ) {

            return "Ничего критического. Хотя один из новых пациентов поступил без сопроводительной документации.";

        }

    }


    /* -----------------------------------------
       INCIDENTS
    ----------------------------------------- */

    if (chatId === "incidents") {

        if (
            message.includes("привет") ||
            message.includes("hello")
        ) {

            return "INCIDENTS на связи. Надеюсь, сегодня без новых отчётов.";

        }


        if (
            message.includes("как дела") ||
            message.includes("как ты")
        ) {

            return "Если честно? Чем меньше у нас работы, тем лучше.";

        }


        if (
            message.includes("как прошел день") ||
            message.includes("как прошёл день")
        ) {

            return "Было несколько мелких происшествий. Самое странное — движение в закрытом секторе.";

        }


        if (
            message.includes("что случилось") ||
            message.includes("что произошло")
        ) {

            return "Зафиксировано неизвестное перемещение. Источник пока не установлен.";

        }


        if (
            message.includes("новости")
        ) {

            return "Пока только одна: кто-то снова оказался там, где его не должно быть.";

        }

    }


    /* -----------------------------------------
       ADMINISTRATION
    ----------------------------------------- */

    if (chatId === "admin") {

        if (
            message.includes("привет") ||
            message.includes("hello")
        ) {

            return "Здравствуйте. Административный канал на связи.";

        }


        if (
            message.includes("как дела") ||
            message.includes("как ты")
        ) {

            return "Рабочий день проходит штатно.";

        }


        if (
            message.includes("как прошел день") ||
            message.includes("как прошёл день") ||
            message.includes("что делал")
        ) {

            return "Сегодня проверял внутренние отчёты, запросы на доступ и несколько документов исследовательского отдела.";

        }


        if (
            message.includes("новости") ||
            message.includes("что случилось")
        ) {

            return "Есть несколько незакрытых отчётов. Подробности доступны сотрудникам с соответствующим уровнем допуска.";

        }

    }


    /* -----------------------------------------
       UNKNOWN QUESTION
    ----------------------------------------- */

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


    return replies[
        Math.floor(Math.random() * replies.length)
    ];

}


/* =========================================================
   EXTERNAL CHAT MESSAGE
========================================================= */

window.addChatMessage = function(
    chatId,
    message
) {

    if (!chats[chatId])
        return;

    chats[chatId].messages.push(
        message
    );

    /*
        Если пользователь сейчас
        НЕ находится в этом чате —
        увеличиваем unread.
    */

    if (
        activeChat !== chatId
    ) {

        if (
            chats[chatId].unread === undefined
        ) {

            chats[chatId].unread = 0;

        }

        chats[chatId].unread++;

    }

    renderChatList();

    if (
        activeChat === chatId
    ) {

        renderActiveChat();

    }

};

/* =========================================================
   REVEAL MR.SMILE CHAT
========================================================= */

export function revealMrSmileChat() {

    if (!chats.mrsmile) return;

    chats.mrsmile.hidden = false;

    renderChatList();

    console.log("[MR.SMILE CHAT] Channel unlocked.");

}
/* =========================================================
   INITIALIZATION
========================================================= */

export function initChats() {

   if (localStorage.getItem("mrsmile_first_contact") === "1") {
    chats.mrsmile.hidden = false;
}

    renderChatList();

    renderActiveChat();


    const send =
        document.getElementById("sendBtn");

    const input =
        document.getElementById("chatInput");


    if (send) {

        send.onclick =
            sendMessage;

    }


    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    sendMessage();

                }

            }
        );

    }

}
