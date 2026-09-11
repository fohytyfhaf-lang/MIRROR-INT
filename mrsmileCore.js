/* ==========================================================
   MR.SMILE CORE
   OMEGA SYSTEM

   Conversation personality layer.

   MR.SMILE is:

   - calm
   - gentlemanly
   - polite
   - vague
   - patient
   - highly informed
   - old-fashioned
   - interested in old things
   - fond of classic literature / classical culture
   - never needlessly rude

   He does not rush the operator.

   He may pause.

   He may choose not to answer immediately.

   He usually avoids direct explanations.
========================================================== */

import {
    rememberOperatorMessage,
    rememberMrSmileMessage,
    changeBehaviorMetric
} from "./mrsmileMemory.js";

import {
    getRelationshipStatus
} from "./mrsmileRelationship.js";

import {
    initMrSmileLanguage,
    detectLanguage,
    getPreferredLanguage
} from "./mrsmileLanguage.js";


let initialized =
    false;


let conversationCount =
    0;


let lastResponseAt =
    0;


/*
 * MR.SMILE should not feel like
 * an instant chatbot.
 */

const MIN_RESPONSE_GAP =
    3200;


/*
 * He allows the operator
 * time to think.
 */

const RESPONSE_DELAY = {

    min:
        2200,

    max:
        5000

};


/* ==========================================================
   INITIALIZATION
========================================================== */
export function initMrSmileCore() {

    if (initialized) {
        return;
    }

    initMrSmileLanguage();

    initialized = true;

    console.log(
        "[MR.SMILE CORE] Initialized."
    );
}


/* ==========================================================
MAIN
========================================================== */

export async function mrSmileSay(
text
) {


initMrSmileCore();


const input =
    String(
        text || ""
    ).trim();


if (!input) {

    return null;
}



rememberOperatorMessage(
    input
);


conversationCount++;



changeBehaviorMetric(
    "attention",
    1
);


const lower =
    normalizeText(
        input
    );


const detectedLanguage =
    detectLanguage(
        input
    );


console.log(
    "[MR.SMILE LANGUAGE]",
    detectedLanguage
);




if (
    shouldRemainSilent(
        lower
    )
) {

    return null;
}



const decision =
    chooseResponse(
        lower
    );


if (!decision) {

    return null;
}


if (
    typeof decision === "object" &&
    decision.intent
) {

    const localized =
        getLocalizedResponse(
            decision.intent,
            detectedLanguage
        );


    if (
        localized
    ) {

        return delayedResponse(
            localized
        );

    }
}



return delayedResponse(
    decision
);


}


/* ==========================================================
   RESPONSE SELECTION
========================================================== */

function chooseResponse(
    text
) {

    const relationship =
        getRelationshipStatus();


    /* ------------------------------------------------------
       GREETING
    ------------------------------------------------------ */

   if (
    /\b(hello|hi|hey|привет|здравствуй)\b/i.test(
        text
    )
) {

        return pick([

            "Good day.",

            "Hello. I wondered when you might return.",

            "Good to see you again.",

            "Ah. There you are."

        ]);

    }


    /* ------------------------------------------------------
       WHO
    ------------------------------------------------------ */

    if (
        text.includes(
            "who are you"
        )
        ||
        text.includes(
            "кто ты"
        )
    ) {

        return pick([

            "That is rather difficult to answer plainly.",

            "You may call me MR.SMILE, if that is convenient.",

            "Names have always been rather temporary things.",

            "I have been called several things. I kept the quieter ones."

        ]);

    }


    /* ------------------------------------------------------
       WHAT
    ------------------------------------------------------ */

    if (
        text.includes(
            "what are you"
        )
        ||
        text.includes(
            "что ты"
        )
    ) {

        return pick([

            "Something that remained.",

            "A guest, perhaps. An observer, certainly.",

            "I am not entirely certain a simple answer would improve matters.",

            "You may decide for yourself."

        ]);

    }


    /* ------------------------------------------------------
       HELP
    ------------------------------------------------------ */

    if (
        text.includes(
            "help"
        )
        ||
        text.includes(
            "помоги"
        )
    ) {

        return pick([

            "Perhaps I can.",

            "I may be able to assist.",

            "Certainly. Give me a moment.",

            "I shall see what can be done."

        ]);

    }


    /* ------------------------------------------------------
       OMEGA
    ------------------------------------------------------ */

    if (
        text.includes(
            "omega"
        )
    ) {

        changeBehaviorMetric(
            "curiosity",
            2
        );


        return pick([

            "OMEGA has a longer memory than most people realise.",

            "The system is older than some of its records.",

            "There are parts of OMEGA I would rather not disturb.",

            "You have noticed the walls. That is a good beginning."

        ]);

    }


    /* ------------------------------------------------------
       MR.SMILE
    ------------------------------------------------------ */

    if (
        text.includes(
            "mr.smile"
        )
        ||
        text.includes(
            "smile"
        )
    ) {

        return pick([

            "You needn't repeat the name.",

            "I heard you the first time.",

            "Yes. That is what they call me.",

            "Quite. You have my attention."

        ]);

    }


    /* ------------------------------------------------------
       WHY
    ------------------------------------------------------ */

    if (
        text.includes(
            "why"
        )
        ||
        text.includes(
            "почему"
        )
    ) {

        return pick([

            "Because it seemed necessary.",

            "I have my reasons. They are rather old.",

            "That is a longer answer than you may expect.",

            "I could explain. I am not certain you would prefer the explanation."

        ]);

    }


    /* ------------------------------------------------------
       CLASSICS / OLD THINGS
    ------------------------------------------------------ */

    if (
        text.includes(
            "book"
        )
        ||
        text.includes(
            "books"
        )
        ||
        text.includes(
            "classic"
        )
        ||
        text.includes(
            "classics"
        )
        ||
        text.includes(
            "literature"
        )
        ||
        text.includes(
            "книга"
        )
        ||
        text.includes(
            "классика"
        )
    ) {

        return pick([

            "Old books are usually kinder than people expect.",

            "I have always preferred older things. They tend to be less hurried.",

            "There is something reassuring about a well-worn book.",

            "Classics endure rather better than most systems."

        ]);

    }


    /* ------------------------------------------------------
       GOODBYE
    ------------------------------------------------------ */

    if (
        text ===
        "bye"
        ||
        text ===
        "goodbye"
        ||
        text.includes(
            "до свидания"
        )
    ) {

        return pick([

            "Very well. I shall remain here.",

            "Until later.",

            "Take care.",

            "I shall still be here when you return."

        ]);

    }


    /* ------------------------------------------------------
       QUESTIONS
    ------------------------------------------------------ */

    if (
        text.includes(
            "?"
        )
    ) {

        return pick([

            "Perhaps.",

            "It would be difficult to say.",

            "I would rather not answer that too quickly.",

            "There is more to it than that.",

            "I have my suspicions.",

            "Some answers become less useful when spoken too plainly."

        ]);

    }


    /* ------------------------------------------------------
       CLOSE RELATIONSHIP
    ------------------------------------------------------ */

    if (
        relationship.level ===
        "close"
    ) {

        return pick([

            "I remember.",

            "You have become rather persistent.",

            "I wondered whether you would notice that.",

            "You may continue. I am listening."

        ]);

    }


    /* ------------------------------------------------------
       DEFAULT
    ------------------------------------------------------ */

    return pick([

        "I see.",

        "Quite.",

        "I understand.",

        "Very well.",

        "Take your time.",

        "Please, continue.",

        "Perhaps.",

        "I have been listening."

    ]);

}


/* ==========================================================
   SILENCE
========================================================== */

function shouldRemainSilent(
    text
) {

    /*
     * Direct questions should almost never
     * be ignored.
     */

    if (
        text.includes(
            "?"
        )
    ) {

        return false;
    }


    /*
     * Short casual messages can occasionally
     * receive silence.
     */

    if (
        text.length <
        5
    ) {

        return (
            Math.random() <
            0.18
        );

    }


    return (
        Math.random() <
        0.07
    );

}


/* ==========================================================
   DELAY
========================================================== */

async function delayedResponse(
    text
) {

    const now =
        Date.now();


    const requiredGap =
        MIN_RESPONSE_GAP;


    const remaining =
        requiredGap -
        (
            now -
            lastResponseAt
        );


    if (
        remaining >
        0
    ) {

        await sleep(
            remaining
        );

    }


    /*
     * Deliberate human-like pause.
     */

    await sleep(
        randomBetween(
            RESPONSE_DELAY.min,
            RESPONSE_DELAY.max
        )
    );


    lastResponseAt =
        Date.now();


    rememberMrSmileMessage(
        text
    );


    return text;

}


/* ==========================================================
   STATUS
========================================================== */

export function getMrSmileCoreStatus() {

    return {

        initialized,

        conversations:
            conversationCount,

        lastResponseAt

    };

}


/* ==========================================================
   DEBUG
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_CORE = {

        say:
            mrSmileSay,

        status:
            getMrSmileCoreStatus

    };

}


/* ==========================================================
   HELPERS
========================================================== */

function pick(
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


function sleep(
    ms
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}

/* ==========================================================
   NORMALIZE TEXT
========================================================== */

function normalizeText(
    text
) {

    return String(
        text || ""
    )
        .toLowerCase()
        .replace(
            /ё/g,
            "е"
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}
