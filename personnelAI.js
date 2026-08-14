/* =========================================================
   OMEGA PERSONNEL AI
========================================================= */

import {
    getRole,
    getClearance
} from "./security.js";


/* =========================================================
   PERSONNEL DATABASE
========================================================= */

const personnel = {

    "DR. KLINE": {

        department: "RESEARCH",

        clearance: 4,

        personality: [
            "calm",
            "confident",
            "intelligent",
            "professional"
        ],

        mood: "focused",

        activity:
            "reviewing experimental data",

        location:
            "RESEARCH SECTOR",

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
                "Good morning.",
                "Hello.",
                "Good to see you.",
                "Hello. What do you need?"
            ],

            howAreYou: [
                "Busy, but fine.",
                "I've had better days.",
                "I'm alright. Just tired.",
                "Focused. There's still a lot of work to finish."
            ],

            day: [
                "Mostly paperwork and experimental data.",
                "I've spent most of the day reviewing the TEN documentation.",
                "The morning was quiet. The afternoon became considerably less so.",
                "I've been in the research sector almost all day."
            ],

            work: [
                "I'm reviewing the latest experimental data.",
                "I'm checking the Phase 3 documentation.",
                "I'm comparing the latest results with the previous reports."
            ],

            suspicious: [
                "Why are you asking me that?",
                "That's a rather specific question.",
                "Where did you get that information?",
                "I don't think that's something we should discuss here."
            ],

            unknown: [
                "I don't have enough information to answer that.",
                "That's outside my area.",
                "I honestly don't know.",
                "You'll have to ask someone from another department."
            ]

        }

    },


    "DR. MILLER": {

        department: "RESEARCH",

        clearance: 3,

        personality: [
            "nervous",
            "cautious",
            "intelligent",
            "empathetic"
        ],

        mood: "uneasy",

        activity:
            "reviewing medical and research records",

        location:
            "RESEARCH SECTOR",

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
                "Hey.",
                "Hello... everything alright?"
            ],

            howAreYou: [
                "I'm alright.",
                "Tired, honestly.",
                "I've been better.",
                "Fine. Just a long day."
            ],

            day: [
                "Mostly reports.",
                "I've been going through patient records all morning.",
                "A lot of paperwork. Nothing particularly exciting.",
                "It was normal until a few things started going wrong."
            ],

            work: [
                "I'm reviewing the latest records.",
                "I'm comparing the medical reports with the research data.",
                "I'm trying to finish a report before Kline asks for it again."
            ],

            suspicious: [
                "I don't think I should talk about that.",
                "Who told you about that?",
                "Let's not discuss that here.",
                "I really don't want to get involved in this."
            ],

            unknown: [
                "I'm not sure.",
                "I don't know.",
                "You should probably ask Kline.",
                "I haven't seen anything about that."
            ]

        }

    },


    "SECURITY_01": {

        department: "SECURITY",

        clearance: 2,

        personality: [
            "professional",
            "direct",
            "strict"
        ],

        mood: "alert",

        activity:
            "monitoring security checkpoints",

        location:
            "SECURITY CHECKPOINT 3",

        knowledge: [
            "SECURITY",
            "ARCHIVE",
            "SECTOR C",
            "ACCESS",
            "CAMERAS"
        ],

        trust: 0,

        responses: {

            greeting: [
                "Morning.",
                "Hello.",
                "Good morning.",
                "Security department. What do you need?"
            ],

            howAreYou: [
                "Fine.",
                "All good here.",
                "Busy.",
                "No complaints."
            ],

            day: [
                "Routine patrols mostly.",
                "We've been checking the archive terminals.",
                "Quiet shift so far.",
                "Mostly monitoring checkpoints."
            ],

            work: [
                "I'm monitoring checkpoint three.",
                "I'm checking the archive access logs.",
                "We're keeping an eye on sector C."
            ],

            suspicious: [
                "That's restricted information.",
                "You don't have clearance for that.",
                "I can't discuss security procedures.",
                "If you need access, submit a request."
            ],

            unknown: [
                "Not my department.",
                "I haven't seen anything about that.",
                "Ask Research.",
                "I don't know."
            ]

        }

    },


    "SECURITY_03": {

        department: "SECURITY",

        clearance: 3,

        personality: [
            "suspicious",
            "observant",
            "alert"
        ],

        mood: "suspicious",

        activity:
            "investigating unauthorized access attempts",

        location:
            "SECURITY ARCHIVE",

        knowledge: [
            "SECURITY",
            "UNAUTHORIZED ACCESS",
            "ARCHIVE",
            "SECTOR C",
            "CAMERAS"
        ],

        trust: 0,

        responses: {

            greeting: [
                "Hey.",
                "Hello.",
                "What do you need?",
                "Hi."
            ],

            howAreYou: [
                "Fine.",
                "Busy.",
                "Can't complain.",
                "A little tired."
            ],

            day: [
                "Quiet until the archive started acting strange.",
                "We've had several access attempts today.",
                "Mostly security checks.",
                "Not the most relaxing shift."
            ],

            work: [
                "I'm checking unauthorized access attempts.",
                "I'm reviewing camera logs.",
                "I'm investigating something in sector C."
            ],

            suspicious: [
                "Why are you interested in that?",
                "I wouldn't ask questions about that.",
                "Someone is already watching that area.",
                "That's not something you should be looking into."
            ],

            unknown: [
                "No idea.",
                "Ask someone else.",
                "I haven't heard anything.",
                "Not that I know of."
            ]

        }

    },


    "MEDICAL_02": {

        department: "MEDICAL",

        clearance: 3,

        personality: [
            "calm",
            "professional",
            "empathetic"
        ],

        mood: "tired",

        activity:
            "reviewing patient records",

        location:
            "MEDICAL SECTOR",

        knowledge: [
            "MEDICAL",
            "PATIENTS",
            "INJURIES",
            "TREATMENT"
        ],

        trust: 0,

        responses: {

            greeting: [
                "Hello.",
                "Good morning.",
                "Hi.",
                "Hello. How can I help?"
            ],

            howAreYou: [
                "I'm alright.",
                "A little tired.",
                "Busy, but fine.",
                "I've had a long shift."
            ],

            day: [
                "Mostly patient records.",
                "We've had a few unusual cases today.",
                "It's been fairly busy.",
                "Nothing catastrophic so far."
            ],

            work: [
                "I'm reviewing patient records.",
                "I'm checking today's medical reports.",
                "I'm helping with the patients transferred this morning."
            ],

            suspicious: [
                "Patient information is confidential.",
                "I can't discuss individual patients.",
                "You should contact administration.",
                "That's classified medical information."
            ],

            unknown: [
                "I don't know.",
                "That's outside my department.",
                "You should ask Research.",
                "I haven't been informed."
            ]

        }

    },


    "ADMIN": {

        department: "ADMINISTRATION",

        clearance: 5,

        personality: [
            "formal",
            "controlled",
            "authoritative"
        ],

        mood: "neutral",

        activity:
            "reviewing administrative reports",

        location:
            "ADMINISTRATION",

        knowledge: [
            "OMEGA",
            "ADMINISTRATION",
            "SECURITY",
            "RESEARCH",
            "PERSONNEL",
            "REPORTS"
        ],

        trust: 0,

        responses: {

            greeting: [
                "Good day.",
                "Hello.",
                "Good morning.",
                "How may I assist you?"
            ],

            howAreYou: [
                "I'm well.",
                "Quite well.",
                "Busy, as usual.",
                "Everything is under control."
            ],

            day: [
                "Administrative work. Reports, approvals and personnel requests.",
                "I've spent most of the day reviewing internal reports.",
                "A considerable amount of paperwork.",
                "Mostly routine administration."
            ],

            work: [
                "I'm reviewing administrative reports.",
                "I'm processing internal requests.",
                "I'm reviewing several documents awaiting approval."
            ],

            suspicious: [
                "That information is classified.",
                "Your clearance determines whether I can discuss that.",
                "I suggest you submit an official request.",
                "That matter is not appropriate for this channel."
            ],

            unknown: [
                "I don't have that information.",
                "You'll need to contact the appropriate department.",
                "I cannot confirm that.",
                "That information is unavailable to me."
            ]

        }

    }

};


/* =========================================================
   MEMORY
========================================================= */

const memory = {};


/* =========================================================
   RANDOM
========================================================= */

function random(array) {

    if (
        !array ||
        array.length === 0
    ) {

        return "";

    }

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];

}


/* =========================================================
   INITIALIZE MEMORY
========================================================= */

function initMemory(name) {

    if (!memory[name]) {

        memory[name] = {

            messages: [],

            topics: [],

            lastQuestion: null,

            lastResponse: null

        };

    }

    return memory[name];

}


/* =========================================================
   GET PERSONNEL
========================================================= */

export function getPersonnel(name) {

    return personnel[name] || null;

}


/* =========================================================
   GET ALL PERSONNEL
========================================================= */

export function getAllPersonnel() {

    return personnel;

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

    if (
        mem.messages.length > 30
    ) {

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

    person.trust =
        Math.max(
            -10,
            Math.min(
                10,
                person.trust
            )
        );

}


/* =========================================================
   GET PLAYER CONTEXT
========================================================= */

function getPlayerContext() {

    const role =
        getRole();

    const clearance =
        getClearance();

    return {

        role,
        clearance

    };

}


/* =========================================================
   ROLE NAME
========================================================= */

function roleName(role) {

    switch (role) {

        case "admin":
            return "Administrator";

        case "operator":
            return "Operator";

        case "tester":
            return "Tester";

        case "guest":
            return "Guest";

        default:
            return "User";

    }

}


/* =========================================================
   RESPONSE
========================================================= */

export function generatePersonnelResponse(
    name,
    text
) {

    const person =
        personnel[name];

    if (!person) {

        return null;

    }


    const mem =
        initMemory(name);

    const context =
        getPlayerContext();

    const message =
        String(text)
            .toLowerCase()
            .trim();


    rememberMessage(
        name,
        {
            from: "YOU",
            text: text,
            time: Date.now()
        }
    );


    /* =====================================================
       GREETING
    ===================================================== */

    if (

        message === "hi" ||
        message === "hello" ||
        message === "hey" ||
        message === "привет" ||
        message === "здравствуйте" ||
        message === "добрый день" ||
        message === "доброе утро"

    ) {

        changeTrust(
            name,
            1
        );

        return random(
            person.responses.greeting
        );

    }


    /* =====================================================
       HOW ARE YOU
    ===================================================== */

    if (

        message.includes("how are you") ||
        message.includes("how's it going") ||
        message.includes("как дела") ||
        message.includes("как ты") ||
        message.includes("всё нормально") ||
        message.includes("все нормально")

    ) {

        return random(
            person.responses.howAreYou
        );

    }


    /* =====================================================
       HOW WAS YOUR DAY
    ===================================================== */

    if (

        message.includes("how was your day") ||
        message.includes("how was work") ||
        message.includes("how did your day go") ||
        message.includes("как прошел день") ||
        message.includes("как прошёл день") ||
        message.includes("как работа")

    ) {

        return random(
            person.responses.day
        );

    }


    /* =====================================================
       WHAT ARE YOU DOING
    ===================================================== */

    if (

        message.includes("what are you doing") ||
        message.includes("what are you working on") ||
        message.includes("чем занимаешься") ||
        message.includes("что делаешь") ||
        message.includes("над чем работаешь")

    ) {

        return (
            `I'm currently ${person.activity}. ` +
            `I'm in ${person.location}.`
        );

    }


    /* =====================================================
       WHERE
    ===================================================== */

    if (

        message.includes("where are you") ||
        message.includes("where are you now") ||
        message.includes("где ты") ||
        message.includes("где находишься")

    ) {

        return (
            `I'm currently in ${person.location}.`
        );

    }


    /* =====================================================
       WHO ARE YOU
    ===================================================== */

    if (

        message.includes("who are you") ||
        message.includes("кто ты") ||
        message.includes("кто вы")

    ) {

        return (
            `${name}. ` +
            `${person.department} department. ` +
            `Clearance ${person.clearance}.`
        );

    }


    /* =====================================================
       WHAT DO YOU DO
    ===================================================== */

    if (

        message.includes("what do you do") ||
        message.includes("your job") ||
        message.includes("твоя работа") ||
        message.includes("что ты делаешь на работе")

    ) {

        return (
            `I'm responsible for ${person.department.toLowerCase()} operations. ` +
            `Right now I'm ${person.activity}.`
        );

    }


    /* =====================================================
       TEN
    ===================================================== */

    if (

        message.includes("ten") ||
        message.includes("тен")

    ) {

        if (
            !person.knowledge.includes("TEN")
        ) {

            return random(
                person.responses.unknown
            );

        }


        if (
            context.clearance < 3
        ) {

            return (
                "That information is above your current clearance."
            );

        }


        if (
            context.role === "admin" ||
            person.trust >= 5
        ) {

            return (
                "TEN is an experimental subject. " +
                "The situation surrounding Phase 3 is more complicated than the official reports suggest."
            );

        }


        return (
            "TEN is classified research."
        );

    }


    /* =====================================================
       SECTOR C
    ===================================================== */

    if (

        message.includes("sector c") ||
        message.includes("сектор c") ||
        message.includes("сектор с")

    ) {

        if (
            !person.knowledge.includes("SECTOR C")
        ) {

            return random(
                person.responses.unknown
            );

        }


        if (
            context.clearance < 2
        ) {

            return (
                "You don't have sufficient clearance for that information."
            );

        }


        if (
            person.department === "SECURITY"
        ) {

            return (
                "Sector C is currently under observation."
            );

        }


        return (
            "I've heard there have been some irregularities in Sector C."
        );

    }


    /* =====================================================
       OTHER EMPLOYEES
    ===================================================== */

    if (

        message.includes("kline") ||
        message.includes("клайн")

    ) {

        if (
            person.department === "RESEARCH"
        ) {

            if (
                name === "DR. KLINE"
            ) {

                return (
                    "I'm right here. Why are you asking about me?"
                );

            }

            return (
                "Kline is working on the current research phase."
            );

        }

        return (
            "Kline? He's with Research."
        );

    }


    if (

        message.includes("miller") ||
        message.includes("миллер")

    ) {

        if (
            name === "DR. MILLER"
        ) {

            return (
                "You're asking about me?"
            );

        }

        return (
            "Miller is currently working in Research."
        );

    }


    /* =====================================================
       SECRET / CLASSIFIED
    ===================================================== */

    if (

        message.includes("secret") ||
        message.includes("classified") ||
        message.includes("restricted") ||
        message.includes("секрет") ||
        message.includes("секретный") ||
        message.includes("запрещено") ||
        message.includes("запрещён")

    ) {

        if (
            context.clearance >= 5
        ) {

            if (
                person.clearance <= context.clearance
            ) {

                return (
                    "You have the clearance required. " +
                    "What exactly are you looking for?"
                );

            }

        }

        return random(
            person.responses.suspicious
        );

    }


    /* =====================================================
       REPORT
    ===================================================== */

    if (

        message.includes("report") ||
        message.includes("отчет") ||
        message.includes("отчёт") ||
        message.includes("доклад")

    ) {

        if (
            context.role === "admin"
        ) {

            return (
                "I can prepare the latest report for you."
            );

        }

        if (
            context.role === "operator"
        ) {

            return (
                "You should request the report through your department."
            );

        }

        return (
            "Reports are restricted."
        );

    }


    /* =====================================================
       PERSONAL QUESTION
    ===================================================== */

    if (

        message.includes("tired") ||
        message.includes("устал") ||
        message.includes("устала") ||
        message.includes("сон")

    ) {

        if (
            person.personality.includes("nervous")
        ) {

            return (
                "A little. It's been a long day."
            );

        }

        return (
            "I'm fine. Work keeps me busy."
        );

    }


    /* =====================================================
       THANK YOU
    ===================================================== */

    if (

        message.includes("thank you") ||
        message.includes("thanks") ||
        message.includes("спасибо")

    ) {

        changeTrust(
            name,
            1
        );

        return random([
            "You're welcome.",
            "No problem.",
            "Anytime.",
            "Of course."
        ]);

    }


    /* =====================================================
       GOODBYE
    ===================================================== */

    if (

        message === "bye" ||
        message === "goodbye" ||
        message === "пока" ||
        message === "до свидания"

    ) {

        return random([
            "See you.",
            "Goodbye.",
            "Take care.",
            "See you later."
        ]);

    }


    /* =====================================================
       CONTEXT MEMORY
    ===================================================== */

    if (
        mem.messages.length >= 3
    ) {

        if (
            person.personality.includes("nervous")
        ) {

            return random([
                "You've been asking quite a few questions.",
                "Is there something specific you're trying to find?",
                "I'm not sure where this conversation is going.",
                "Why are you so interested in this?"
            ]);

        }


        if (
            person.personality.includes("strict")
        ) {

            return random([
                "Please get to the point.",
                "Is there anything else?",
                "If this is work-related, be specific."
            ]);

        }


        if (
            person.personality.includes("formal")
        ) {

            return random([
                "Please clarify your request.",
                "Could you be more specific?",
                "I need more information before I can answer."
            ]);

        }


        return random([
            "What exactly do you want to know?",
            "Could you clarify that?",
            "Tell me what you're looking for.",
            "I'm listening."
        ]);

    }


    /* =====================================================
       UNKNOWN
    ===================================================== */

    return random(
        person.responses.unknown
    );

}


/* =========================================================
   PERSONNEL STATUS
========================================================= */

export function getPersonnelStatus(name) {

    const person =
        personnel[name];

    if (!person)
        return null;

    return {

        name,

        department:
            person.department,

        clearance:
            person.clearance,

        mood:
            person.mood,

        activity:
            person.activity,

        location:
            person.location,

        trust:
            person.trust

    };

}


/* =========================================================
   INIT
========================================================= */

export function initPersonnelAI() {

    Object.keys(personnel).forEach(
        name => {

            initMemory(name);

        }
    );

    console.log(
        "[PERSONNEL AI] Initialized"
    );

}
