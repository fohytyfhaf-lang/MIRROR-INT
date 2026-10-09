/* =========================================================
   OMEGA CHAT EVENTS
   Autonomous internal staff conversations
========================================================= */

import {
    rememberMessage
} from "./personnelAI.js";


let eventTimer = null;
let conversationRunning = false;


/* =========================================================
   HELPERS
========================================================= */

function getCurrentTime() {

    const now = new Date();

    return (
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0")
    );

}


function random(array) {

    if (
        !Array.isArray(array) ||
        array.length === 0
    ) {
        return null;
    }

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];

}


function randomBetween(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}


function sleep(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });

}


/*
 * Longer messages take longer to type.
 * A little randomness keeps the timing natural.
 */

function getTypingDuration(text) {

    const length = String(text || "").length;

    return Math.min(
        3500,
        Math.max(
            850,
            450 + length * 18 + randomBetween(350, 800)
        )
    );

}


/* =========================================================
   INTERNAL CONVERSATIONS
========================================================= */

const conversations = [

    /* -----------------------------------------------------
       GENERAL — ordinary workplace conversation
    ----------------------------------------------------- */

    {
        chat: "general",

        messages: [

            {
                user: "OPERATOR_04",
                text: "Does anyone know if the east cafeteria terminal is working again?"
            },

            {
                user: "OPERATOR_09",
                text: "It accepts payments. It just doesn't print receipts."
            },

            {
                user: "OPERATOR_04",
                text: "That is somehow worse."
            }

        ]

    },


    /* -----------------------------------------------------
       RESEARCH — TEN experiment records
    ----------------------------------------------------- */

    {
        chat: "research",

        messages: [

            {
                user: "DR. KLINE",
                text: "The readings from chamber TEN changed after isolation."
            },

            {
                user: "DR. MILLER",
                text: "Sensor drift?"
            },

            {
                user: "DR. KLINE",
                text: "Possibly. The archived graph shows identical values before and after."
            },

            {
                user: "DR. MILLER",
                text: "I'll keep the raw export separate from the report."
            }

        ]

    },


    /* -----------------------------------------------------
       SECURITY — camera discrepancy
    ----------------------------------------------------- */

    {
        chat: "security",

        messages: [

            {
                user: "SECURITY_03",
                text: "CAM-04 has another gap in the recording."
            },

            {
                user: "SECURITY_01",
                text: "Power interruption?"
            },

            {
                user: "SECURITY_03",
                text: "No interruption in the equipment log. Three seconds are missing."
            },

            {
                user: "SECURITY_01",
                text: "Keep the original file. Don't overwrite it."
            }

        ]

    },


    /* -----------------------------------------------------
       MEDICAL — incomplete patient record
    ----------------------------------------------------- */

    {
        chat: "medical",

        messages: [

            {
                user: "MEDICAL_02",
                text: "The transferred patient's admission record is still incomplete."
            },

            {
                user: "MEDICAL_05",
                text: "Which field?"
            },

            {
                user: "MEDICAL_02",
                text: "The admission source is blank. The transfer itself is registered."
            },

            {
                user: "MEDICAL_05",
                text: "I'll verify the original paperwork before changing anything."
            }

        ]

    },


    /* -----------------------------------------------------
       ADMINISTRATION — missing approval attachment
    ----------------------------------------------------- */

    {
        chat: "admin",

        messages: [

            {
                user: "ADMIN",
                text: "The Sector C access list has an approval entry without an attachment."
            },

            {
                user: "ADMIN",
                text: "The archive index says the attachment exists."
            },

            {
                user: "ADMIN",
                text: "There is no file to open. I'm sending it for records verification."
            }

        ]

    },


    /* -----------------------------------------------------
       INCIDENTS — unexplained sensor activity
    ----------------------------------------------------- */

    {
        chat: "incidents",

        messages: [

            {
                user: "SECURITY_02",
                text: "The motion sensor triggered again after the sector was cleared."
            },

            {
                user: "SECURITY_01",
                text: "Any access events?"
            },

            {
                user: "SECURITY_02",
                text: "Nothing in the door log. The sensor report is attached to the incident."
            }

        ]

    }

];


/* =========================================================
   CHAT BRIDGE
========================================================= */

function pushMessage(chat, user, text) {

    if (
        typeof window === "undefined" ||
        typeof window.addChatMessage !== "function"
    ) {

        console.warn(
            "[CHAT EVENTS] Chat bridge is not available."
        );

        return false;

    }

    window.addChatMessage(
        chat,
        {
            user,
            time: getCurrentTime(),
            text
        }
    );

    return true;

}


function showTyping(chat, user) {

    if (
        typeof window !== "undefined" &&
        typeof window.showChatTyping === "function"
    ) {

        window.showChatTyping(
            chat,
            user
        );

    }

}


function hideTyping(chat, user) {

    if (
        typeof window !== "undefined" &&
        typeof window.hideChatTyping === "function"
    ) {

        window.hideChatTyping(
            chat,
            user
        );

    }

}


/* =========================================================
   RUN ONE CONVERSATION
========================================================= */

async function triggerConversation() {

    if (conversationRunning) {
        return;
    }

    if (
        typeof window === "undefined" ||
        typeof window.addChatMessage !== "function"
    ) {
        return;
    }

    const conversation = random(conversations);

    if (!conversation) {
        return;
    }

    conversationRunning = true;

    let typingUser = null;

    try {

        for (
            let index = 0;
            index < conversation.messages.length;
            index++
        ) {

            const message =
                conversation.messages[index];

            typingUser = message.user;

            showTyping(
                conversation.chat,
                message.user
            );

            await sleep(
                getTypingDuration(message.text)
            );

            hideTyping(
                conversation.chat,
                message.user
            );

            typingUser = null;

            const added = pushMessage(
                conversation.chat,
                message.user,
                message.text
            );

            if (added) {

                try {

                    rememberMessage(
                        message.user,
                        {
                            from: "EMPLOYEE",
                            text: message.text
                        }
                    );

                } catch (error) {

                    console.warn(
                        "[CHAT EVENTS] Could not save employee message.",
                        error
                    );

                }

            }

            /*
             * Pause between replies instead of printing
             * the entire conversation at once.
             */

            if (
                index <
                conversation.messages.length - 1
            ) {

                await sleep(
                    randomBetween(1000, 2200)
                );

            }

        }

    } catch (error) {

        console.error(
            "[CHAT EVENTS] Conversation failed:",
            error
        );

    } finally {

        if (typingUser) {

            hideTyping(
                conversation.chat,
                typingUser
            );

        }

        conversationRunning = false;

    }

}


/* =========================================================
   INITIALIZATION
========================================================= */

export function initChatEvents() {

    if (eventTimer) {
        clearInterval(eventTimer);
    }

    eventTimer = null;
    conversationRunning = false;

    console.log(
        "[CHAT EVENTS] Autonomous staff conversations initialized."
    );

    /*
     * Every 28 seconds, there is a chance for a new
     * conversation. Only one conversation runs at a time.
     */

    eventTimer = setInterval(
        () => {

            if (
                !conversationRunning &&
                Math.random() < 0.42
            ) {

                triggerConversation();

            }

        },
        28000
    );

}
