/* =========================================================
   OMEGA CHAT EVENTS
========================================================= */

import {
    getPersonnel,
    generatePersonnelResponse,
    rememberMessage
} from "./personnelAI.js";


let eventTimer = null;


/* =========================================================
   CURRENT TIME
========================================================= */

function getCurrentTime() {

    const now = new Date();

    return (
        String(now.getHours()).padStart(2, "0")
        +
        ":"
        +
        String(now.getMinutes()).padStart(2, "0")
    );

}


/* =========================================================
   RANDOM
========================================================= */

function random(array) {

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];

}


/* =========================================================
   INTERNAL CONVERSATIONS
========================================================= */

const conversations = [

    {
        chat: "research",

        messages: [

            {
                user: "DR. KLINE",
                text:
                    "Miller, did you finish the TEN report?"
            },

            {
                user: "DR. MILLER",
                text:
                    "Almost."
            },

            {
                user: "DR. KLINE",
                text:
                    "I need it before the next review."
            }

        ]

    },


    {
        chat: "security",

        messages: [

            {
                user: "SECURITY_01",
                text:
                    "How did your shift go?"
            },

            {
                user: "SECURITY_03",
                text:
                    "Quiet. Until sector C started acting strange."
            },

            {
                user: "SECURITY_01",
                text:
                    "Again?"
            }

        ]

    },


    {
        chat: "medical",

        messages: [

            {
                user: "MEDICAL_02",
                text:
                    "How is the unidentified patient?"
            },

            {
                user: "MEDICAL_05",
                text:
                    "Stable for now."
            },

            {
                user: "MEDICAL_02",
                text:
                    "Good. Keep me informed."
            }

        ]

    }

];


/* =========================================================
   SEND EVENT TO CHAT
========================================================= */

function pushMessage(
    chat,
    user,
    text
) {

    if (
        !window.addChatMessage
    ) {

        console.warn(
            "[CHAT EVENTS] addChatMessage not available"
        );

        return;

    }

    window.addChatMessage(
        chat,
        {
            user,
            time: getCurrentTime(),
            text
        }
    );

}


/* =========================================================
   RANDOM INTERNAL EVENT
========================================================= */

function triggerConversation() {

    const conversation =
        random(conversations);

    if (!conversation)
        return;

    conversation.messages.forEach(
        (message, index) => {

            setTimeout(
                () => {

                    pushMessage(
                        conversation.chat,
                        message.user,
                        message.text
                    );

                    rememberMessage(
                        message.user,
                        {
                            from:
                                "EMPLOYEE",
                            text:
                                message.text
                        }
                    );

                },
                index * 1800
            );

        }
    );

}


/* =========================================================
   INIT
========================================================= */

export function initChatEvents() {

    console.log(
        "[CHAT EVENTS] Initialized"
    );


    if (eventTimer)
        clearInterval(eventTimer);


    eventTimer =
        setInterval(
            () => {

                /*
                    Пока поставим довольно
                    редкое событие.
                */

                if (
                    Math.random() < 0.35
                ) {

                    triggerConversation();

                }

            },
            30000
        );

}
