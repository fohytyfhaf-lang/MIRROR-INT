/* =========================================================
   OMEGA PERSONNEL AI
========================================================= */

const personnel = {

    "DR. KLINE": {

        department: "RESEARCH",

        personality: [
            "calm",
            "confident",
            "technical"
        ],

        status:
            "Working on experimental research.",

        knowledge: [
            "TEN",
            "EXPERIMENT",
            "PHASE 3",
            "RESEARCH",
            "SECTOR C"
        ],

        trust: 0,

        responses: {

            greeting: [
                "Hello.",
                "Good morning.",
                "I'm working. What do you need?"
            ],

            work: [
                "I'm currently working on the TEN documentation.",
                "The experiment is taking longer than expected.",
                "I'm reviewing the latest research data."
            ],

            suspicious: [
                "Why are you asking?",
                "That's not information you need.",
                "Where did you hear that?"
            ]

        }

    },


    "DR. MILLER": {

        department: "RESEARCH",

        personality: [
            "nervous",
            "cautious",
            "intelligent"
        ],

        status:
            "Reviewing research documentation.",

        knowledge: [
            "TEN",
            "MEDICAL",
            "PHASE 3",
            "SECTOR C"
        ],

        trust: 0,

        responses: {

            greeting: [
                "Oh. Hello.",
                "Hi.",
                "Yes?"
            ],

            work: [
                "I'm still working on the report.",
                "There's more data than I expected.",
                "I haven't finished the documentation yet."
            ],

            suspicious: [
                "I don't think I should talk about that.",
                "Who told you about this?",
                "Let's talk about something else."
            ]

        }

    },


    "SECURITY_01": {

        department: "SECURITY",

        personality: [
            "professional",
            "direct",
            "strict"
        ],

        status:
            "Monitoring security checkpoints.",

        knowledge: [
            "SECURITY",
            "ARCHIVE",
            "SECTOR C",
            "ACCESS"
        ],

        trust: 0,

        responses: {

            greeting: [
                "Morning.",
                "Hello.",
                "Security department."
            ],

            work: [
                "I'm monitoring checkpoint three.",
                "Everything is under control.",
                "We're checking the restricted sectors."
            ],

            suspicious: [
                "That's restricted information.",
                "You don't have clearance for that.",
                "Stop asking about restricted areas."
            ]

        }

    },


    "SECURITY_03": {

        department: "SECURITY",

        personality: [
            "alert",
            "suspicious",
            "observant"
        ],

        status:
            "Investigating unauthorized access attempts.",

        knowledge: [
            "SECURITY",
            "UNAUTHORIZED ACCESS",
            "ARCHIVE",
            "SECTOR C"
        ],

        trust: 0,

        responses: {

            greeting: [
                "Hey.",
                "Hello.",
                "What do you need?"
            ],

            work: [
                "We've had some strange access attempts today.",
                "I'm checking the archive terminals.",
                "Something is wrong with sector C."
            ],

            suspicious: [
                "Why are you interested in that?",
                "I wouldn't ask about that if I were you.",
                "Someone is already watching that area."
            ]

        }

    },


    "MEDICAL_02": {

        department: "MEDICAL",

        personality: [
            "calm",
            "professional",
            "empathetic"
        ],

        status:
            "Working in the medical sector.",

        knowledge: [
            "MEDICAL",
            "PATIENTS",
            "INJURIES"
        ],

        trust: 0,

        responses: {

            greeting: [
                "Hello.",
                "Good morning.",
                "How can I help?"
            ],

            work: [
                "The medical sector is unusually busy today.",
                "I'm reviewing patient records.",
                "Everything is stable for now."
            ],

            suspicious: [
                "Patient information is confidential.",
                "I can't discuss that.",
                "You should speak to administration."
            ]

        }

    },


    "ADMIN": {

        department: "ADMINISTRATION",

        personality: [
            "formal",
            "controlled",
            "authoritative"
        ],

        status:
            "Handling administrative operations.",

        knowledge: [
            "ADMINISTRATION",
            "SECURITY",
            "RESEARCH",
            "OMEGA"
        ],

        trust: 0,

        responses: {

            greeting: [
                "Good day.",
                "Hello.",
                "How may I assist you?"
            ],

            work: [
                "I'm reviewing administrative reports.",
                "There are several documents awaiting approval.",
                "I'm handling internal requests."
            ],

            suspicious: [
                "That information is classified.",
                "Your clearance does not permit access to that information.",
                "I suggest you contact your department supervisor."
            ]

        }

    }

};


/* =========================================================
   MEMORY
========================================================= */

const memory = {};


/* =========================================================
   GET PERSONNEL
========================================================= */

export function getPersonnel(name) {

    return personnel[name] || null;

}


/* =========================================================
   INITIALIZE MEMORY
========================================================= */

function initMemory(name) {

    if (!memory[name]) {

        memory[name] = {

            messages: [],

            topics: [],

            trust: 0

        };

    }

    return memory[name];

}


/* =========================================================
   REMEMBER MESSAGE
========================================================= */

export function rememberMessage(
    name,
    message
) {

    const mem =
        initMemory(name);

    mem.messages.push(message);

    if (mem.messages.length > 20) {

        mem.messages.shift();

    }

}


/* =========================================================
   CHANGE TRUST
========================================================= */

export function changeTrust(
    name,
    amount
) {

    const person =
        personnel[name];

    if (!person) return;

    person.trust += amount;

    if (person.trust > 10)
        person.trust = 10;

    if (person.trust < -10)
        person.trust = -10;

}


/* =========================================================
   RANDOM RESPONSE
========================================================= */

function random(array) {

    if (!array || !array.length)
        return "";

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];

}


/* =========================================================
   GENERATE RESPONSE
========================================================= */

export function generatePersonnelResponse(
    name,
    text
) {

    const person =
        personnel[name];

    if (!person)
        return null;

    const mem =
        initMemory(name);

    const message =
        text.toLowerCase();

    rememberMessage(
        name,
        {
            from: "YOU",
            text
        }
    );


    /* =========================
       GREETING
    ========================= */

    if (
        message.includes("hello") ||
        message.includes("hi") ||
        message.includes("привет") ||
        message.includes("добрый")
    ) {

        return random(
            person.responses.greeting
        );

    }


    /* =========================
       WORK
    ========================= */

    if (
        message.includes("work") ||
        message.includes("working") ||
        message.includes("работ") ||
        message.includes("делаешь") ||
        message.includes("делал") ||
        message.includes("дела")
    ) {

        return random(
            person.responses.work
        );

    }


    /* =========================
       WHO
    ========================= */

    if (
        message.includes("who are you") ||
        message.includes("кто ты")
    ) {

        return `${name}. ${person.department} department.`;

    }


    /* =========================
       TEN
    ========================= */

    if (
        message.includes("ten") ||
        message.includes("тен")
    ) {

        if (
            person.knowledge.includes("TEN")
        ) {

            if (person.trust >= 5) {

                return (
                    "TEN is an experimental subject. " +
                    "There are details I can discuss later."
                );

            }

            return (
                "TEN is classified research."
            );

        }

        return (
            "I don't know anything about TEN."
        );

    }


    /* =========================
       SUSPICIOUS QUESTIONS
    ========================= */

    if (
        message.includes("secret") ||
        message.includes("секрет") ||
        message.includes("classified") ||
        message.includes("секретный") ||
        message.includes("restricted") ||
        message.includes("запрещ")
    ) {

        return random(
            person.responses.suspicious
        );

    }


    /* =========================
       DEFAULT
    ========================= */

    if (mem.messages.length > 3) {

        return random([
            "What exactly are you trying to find out?",
            "You've been asking a lot of questions.",
            "Is there something specific you need?",
            "I have work to finish."
        ]);

    }

    return random(
        person.responses.work
    );

}
