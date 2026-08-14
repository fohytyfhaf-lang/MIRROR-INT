/* =========================================================
   OMEGA INTERNAL CHATS
========================================================= */
import { canAccess } from "./security.js";

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

    }

};


/* =========================================================
   STATE
========================================================= */

let activeChat = "general";


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
        + ":" +
        String(now.getMinutes()).padStart(2, "0");


    chats[activeChat].messages.push({

        user: "YOU",

        time: time,

        text: text

    });


    input.value = "";

    renderActiveChat();


    /* MR.SMILE special response */

    if (activeChat === "mrsmile") {

        setTimeout(() => {

            chats.mrsmile.messages.push({

                user: "MR.SMILE",

                time: time,

                text:
                    generateMrSmileResponse(text)

            });

            renderActiveChat();

        }, 700);

    }

}


/* =========================================================
   MR.SMILE BASIC RESPONSE
========================================================= */

function generateMrSmileResponse(text) {

    const message =
        text.toLowerCase();


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
   INITIALIZATION
========================================================= */

export function initChats() {

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
