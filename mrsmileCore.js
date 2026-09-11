/* ==========================================================
MR.SMILE CORE
OMEGA / MIRROR-INT

RESPONSIBILITY:

* conversation personality
* intent understanding
* language integration
* contextual replies
* relationship-aware tone
* deliberate response timing
* silence / restraint
* memory integration

MR.SMILE CHARACTER:

* calm
* polite
* gentlemanly
* patient
* vague
* highly informed
* old-fashioned in moderation
* interested in old things
* fond of books and music
* rarely gives complete explanations
* never needlessly rude

LORE BASIS:

MR.SMILE is a mirror entity.

He is capable of existing wherever a reflection exists.

He does not necessarily consider mirrors
to be "homes".

A mirror is simply one of the easiest ways
for humans to notice him.

IMPORTANT:

This system is intentionally not a generic chatbot.

MR.SMILE tries to understand the operator's
intention rather than merely matching one exact phrase.

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
getPreferredLanguage,
getLocalizedResponse
} from "./mrsmileLanguage.js";

/* ==========================================================
STATE
========================================================== */

let initialized =
false;

let conversationCount =
0;

let lastResponseAt =
0;

let lastIntent =
null;

let lastLanguage =
"en";

let previousOperatorMessage =
"";

/* ==========================================================
TIMING
========================================================== */

const MIN_RESPONSE_GAP =
3200;

const RESPONSE_DELAY = {


min:
    2200,

max:
    5000


};

/* ==========================================================
MEMORY OF CONVERSATION FLOW
========================================================== */

const contextState = {


lastIntent:
    null,

lastLanguage:
    "en",

lastInput:
    "",

previousInput:
    "",

turns:
    0


};

/* ==========================================================
INITIALIZATION
========================================================== */

export function initMrSmileCore() {


if (
    initialized
) {

    return;
}


initMrSmileLanguage();


lastLanguage =
    getPreferredLanguage();


contextState.lastLanguage =
    lastLanguage;


initialized =
    true;


console.log(
    "[MR.SMILE CORE] Initialized.",
    {
        language:
            lastLanguage
    }
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
        text ||
        ""
    ).trim();


if (
    !input
) {

    return null;
}


/*
   Remember operator input.
*/

rememberOperatorMessage(
    input
);


conversationCount++;


changeBehaviorMetric(
    "attention",
    1
);


/*
   Update conversation context.
*/

contextState.previousInput =
    contextState.lastInput;


contextState.lastInput =
    input;


contextState.turns++;


previousOperatorMessage =
    input;


/*
   Normalize text.
*/

const lower =
    normalizeText(
        input
    );


/*
   Detect language.

   The language layer changes the
   preferred response language automatically.
*/

const detectedLanguage =
    detectLanguage(
        input
    );


lastLanguage =
    detectedLanguage;


contextState.lastLanguage =
    detectedLanguage;


/*
   Debug only.

   MR.SMILE never tells the operator
   that he detected the language.
*/

console.log(
    "[MR.SMILE LANGUAGE]",
    detectedLanguage
);


/*
   Silence.

   Questions and important conversational
   messages should almost always receive
   a response.
*/

if (
    shouldRemainSilent(
        lower
    )
) {

    return null;
}


/*
   Understand the operator.
*/

const decision =
    chooseResponse(
        lower
    );


if (
    !decision
) {

    return null;
}


/*
   Store detected intent.
*/

if (
    typeof decision ===
    "object"
    &&
    decision.intent
) {

    lastIntent =
        decision.intent;


    contextState.lastIntent =
        decision.intent;
}


/*
   Language-aware response.

   mrsmileLanguage.js provides the
   actual wording when a localized
   response bank exists.
*/

if (
    typeof decision ===
    "object"
    &&
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


/*
   Contextual string response.

   Used when an intent exists but
   has not been localized yet.
*/

if (
    typeof decision ===
    "string"
) {

    return delayedResponse(
        decision
    );
}


return null;


}

/* ==========================================================
RESPONSE SELECTION
========================================================== */

function chooseResponse(
text
) {


const relationship =
    getRelationshipStatus();


/* ======================================================
   GREETING
====================================================== */

if (
    matchesGreeting(
        text
    )
) {

    return {
        intent:
            "greeting"
    };
}


/* ======================================================
   HOW ARE YOU
====================================================== */

if (
    containsAny(
        text,
        [
            "как дела",
            "как ты",
            "как поживаешь",
            "как поживаете",
            "как себя чувствуешь",
            "как себя чувствуете",
            "как настроение",
            "how are you",
            "how have you been",
            "how do you feel",
            "how are things"
        ]
    )
) {

    return {
        intent:
            "how_are_you"
    };
}


/* ======================================================
   WHAT ARE YOU DOING
====================================================== */

if (
    containsAny(
        text,
        [
            "что делаешь",
            "что ты делаешь",
            "чем занимаешься",
            "что делаешь сейчас",
            "что вы делаете",
            "what are you doing",
            "what are you up to",
            "what are you doing now"
        ]
    )
) {

    return {
        intent:
            "what_doing"
    };
}


/* ======================================================
   NAME
====================================================== */

if (
    containsAny(
        text,
        [
            "как тебя зовут",
            "как вас зовут",
            "как твое имя",
            "как ваше имя",
            "твое имя",
            "ваше имя",
            "как тебя называть",
            "как вас называть",
            "what is your name",
            "what's your name",
            "your name",
            "what should i call you"
        ]
    )
) {

    return {
        intent:
            "name"
    };
}


/* ======================================================
   TRUE / REAL NAME
====================================================== */

if (
    containsAny(
        text,
        [
            "настоящее имя",
            "настоящим именем",
            "реальное имя",
            "истинное имя",
            "real name",
            "true name",
            "actual name"
        ]
    )
) {

    return {
        intent:
            "real_name"
    };
}


/* ======================================================
   WHO ARE YOU
====================================================== */

if (
    containsAny(
        text,
        [
            "кто ты",
            "кто вы",
            "кто такой",
            "кто такая",
            "кто ты такой",
            "кто ты вообще",
            "кто ты на самом деле",
            "кто вы на самом деле",
            "who are you",
            "who exactly are you",
            "who are you really"
        ]
    )
) {

    return {
        intent:
            "who"
    };
}


/* ======================================================
   WHAT ARE YOU
====================================================== */

if (
    containsAny(
        text,
        [
            "что ты такое",
            "что вы такое",
            "что ты за существо",
            "что вы за существо",
            "что ты вообще такое",
            "что вы вообще такое",
            "какое ты существо",
            "what are you",
            "what exactly are you",
            "what kind of thing are you"
        ]
    )
) {

    return {
        intent:
            "what_are_you"
    };
}


/* ======================================================
   HUMAN
====================================================== */

if (
    containsAny(
        text,
        [
            "ты человек",
            "ты являешься человеком",
            "вы человек",
            "вы человек",
            "ты настоящий человек",
            "are you human",
            "are you a human",
            "are you a person"
        ]
    )
) {

    return {
        intent:
            "human"
    };
}


/* ======================================================
   WHERE ARE YOU
====================================================== */

if (
    containsAny(
        text,
        [
            "где ты",
            "где вы",
            "где находишься",
            "где вы находитесь",
            "где ты сейчас",
            "where are you",
            "where are you now",
            "where do you exist"
        ]
    )
) {

    return {
        intent:
            "where"
    };
}


/* ======================================================
   WHERE DO YOU LIVE
====================================================== */

if (
    containsAny(
        text,
        [
            "где ты живешь",
            "где вы живете",
            "где ты обитаешь",
            "где вы обитаете",
            "где ты находишь свой дом",
            "where do you live",
            "where do you stay"
        ]
    )
) {

    return {
        intent:
            "where_live"
    };
}


/* ======================================================
   MIRROR / REFLECTION
====================================================== */

if (
    containsAny(
        text,
        [
            "зеркало",
            "зеркала",
            "зеркале",
            "зеркал",
            "отражение",
            "отражения",
            "отражении",
            "в отражении",
            "mirror",
            "mirrors",
            "reflection",
            "reflections"
        ]
    )
) {

    changeBehaviorMetric(
        "curiosity",
        2
    );


    /*
       Specific mirror questions
       take priority over generic
       mirror discussion.
    */

    if (
        containsAny(
            text,
            [
                "живешь в зеркале",
                "живешь в зеркалах",
                "живете в зеркале",
                "живете в зеркалах",
                "live in mirrors",
                "live inside mirrors",
                "are you in mirrors"
            ]
        )
    ) {

        return {
            intent:
                "mirror_life"
        };
    }


    if (
        containsAny(
            text,
            [
                "войти в зеркало",
                "войдешь в зеркало",
                "можешь войти в зеркало",
                "можешь пройти через зеркало",
                "enter the mirror",
                "go through the mirror",
                "can you enter a mirror"
            ]
        )
    ) {

        return {
            intent:
                "enter_mirror"
        };
    }


    if (
        containsAny(
            text,
            [
                "выйти из зеркала",
                "выйдешь из зеркала",
                "можешь выйти из зеркала",
                "выйти наружу",
                "come out of the mirror",
                "can you come out of the mirror"
            ]
        )
    ) {

        return {
            intent:
                "come_out"
        };
    }


    return {
        intent:
            "mirror"
    };
}


/* ======================================================
   WHY ARE YOU HERE
====================================================== */

if (
    containsAny(
        text,
        [
            "зачем ты здесь",
            "почему ты здесь",
            "зачем вы здесь",
            "почему вы здесь",
            "зачем ты пришел",
            "почему ты пришел",
            "что ты здесь делаешь",
            "why are you here",
            "why are you in omega",
            "what are you doing here"
        ]
    )
) {

    return {
        intent:
            "why_here"
    };
}


/* ======================================================
   WHAT DO YOU WANT
====================================================== */

if (
    containsAny(
        text,
        [
            "чего ты хочешь",
            "что ты хочешь",
            "что тебе нужно",
            "чего ты от меня хочешь",
            "что вы хотите",
            "что вам нужно",
            "what do you want",
            "what do you need",
            "what do you want from me"
        ]
    )
) {

    return {
        intent:
            "what_want"
    };
}


/* ======================================================
   DO YOU SEE ME
====================================================== */

if (
    containsAny(
        text,
        [
            "ты меня видишь",
            "вы меня видите",
            "можешь меня видеть",
            "можете меня видеть",
            "ты способен меня видеть",
            "can you see me",
            "do you see me",
            "can you actually see me"
        ]
    )
) {

    return {
        intent:
            "see"
    };
}


/* ======================================================
   WHAT CAN YOU SEE
====================================================== */

if (
    containsAny(
        text,
        [
            "что ты видишь",
            "что вы видите",
            "что тебе видно",
            "что тебе видно сейчас",
            "что ты можешь видеть",
            "what can you see",
            "what do you see"
        ]
    )
) {

    return {
        intent:
            "what_see"
    };
}


/* ======================================================
   HEAR
====================================================== */

if (
    containsAny(
        text,
        [
            "ты меня слышишь",
            "вы меня слышите",
            "ты слышишь меня",
            "можешь меня слышать",
            "can you hear me",
            "do you hear me"
        ]
    )
) {

    return {
        intent:
            "hear"
    };
}


/* ======================================================
   WATCHING / OBSERVING
====================================================== */

if (
    containsAny(
        text,
        [
            "ты следишь за мной",
            "вы следите за мной",
            "ты наблюдаешь за мной",
            "ты наблюдаешь",
            "вы наблюдаете",
            "ты смотришь за мной",
            "are you watching me",
            "are you observing me",
            "do you watch me"
        ]
    )
) {

    return {
        intent:
            "watching"
    };
}


/* ======================================================
   REAL
====================================================== */

if (
    containsAny(
        text,
        [
            "ты настоящий",
            "ты реальный",
            "вы настоящий",
            "вы реальный",
            "ты существуешь",
            "ты реально существуешь",
            "are you real",
            "are you really here",
            "do you really exist"
        ]
    )
) {

    return {
        intent:
            "real"
    };
}


/* ======================================================
   FEELINGS
====================================================== */

if (
    containsAny(
        text,
        [
            "у тебя есть чувства",
            "ты умеешь чувствовать",
            "вы умеете чувствовать",
            "ты что-нибудь чувствуешь",
            "есть ли у тебя эмоции",
            "у тебя есть эмоции",
            "do you have feelings",
            "can you feel",
            "do you have emotions"
        ]
    )
) {

    return {
        intent:
            "feelings"
    };
}


/* ======================================================
   LIKE / LOVE
====================================================== */

if (
    containsAny(
        text,
        [
            "ты меня любишь",
            "вы меня любите",
            "я тебе нравлюсь",
            "я вам нравлюсь",
            "ты меня любишь или нет",
            "do you like me",
            "do you love me",
            "do you dislike me"
        ]
    )
) {

    return {
        intent:
            "like_operator"
    };
}


/* ======================================================
   FRIENDSHIP
====================================================== */

if (
    containsAny(
        text,
        [
            "мы друзья",
            "ты мой друг",
            "ты мне друг",
            "вы мой друг",
            "хочешь быть моим другом",
            "are we friends",
            "are you my friend",
            "do you want to be friends"
        ]
    )
) {

    return {
        intent:
            "friendship"
    };
}


/* ======================================================
   TRUST
====================================================== */

if (
    containsAny(
        text,
        [
            "могу я тебе доверять",
            "могу я вам доверять",
            "можно тебе доверять",
            "можно вам доверять",
            "ты заслуживаешь доверия",
            "can i trust you",
            "should i trust you",
            "are you trustworthy"
        ]
    )
) {

    return {
        intent:
            "trust"
    };
}


/* ======================================================
   KNOWLEDGE
====================================================== */

if (
    containsAny(
        text,
        [
            "что ты знаешь",
            "что вы знаете",
            "много ли ты знаешь",
            "что ты вообще знаешь",
            "насколько много ты знаешь",
            "what do you know",
            "how much do you know"
        ]
    )
) {

    return {
        intent:
            "knowledge"
    };
}


/* ======================================================
   HOW DO YOU KNOW
====================================================== */

if (
    containsAny(
        text,
        [
            "откуда ты знаешь",
            "откуда вы знаете",
            "как ты это знаешь",
            "как вы это знаете",
            "откуда тебе это известно",
            "how do you know",
            "how could you know",
            "where did you learn that"
        ]
    )
) {

    return {
        intent:
            "how_know"
    };
}


/* ======================================================
   AGE
====================================================== */

if (
    containsAny(
        text,
        [
            "сколько тебе лет",
            "сколько вам лет",
            "как давно ты существуешь",
            "как давно вы существуете",
            "когда ты появился",
            "how old are you",
            "how long have you existed"
        ]
    )
) {

    return {
        intent:
            "age"
    };
}


/* ======================================================
   FEAR
====================================================== */

if (
    containsAny(
        text,
        [
            "ты боишься",
            "вы боитесь",
            "тебе страшно",
            "что тебя пугает",
            "чего ты боишься",
            "are you afraid",
            "are you scared",
            "what are you afraid of"
        ]
    )
) {

    return {
        intent:
            "fear"
    };
}


/* ======================================================
   EVIL / MORALITY
====================================================== */

if (
    containsAny(
        text,
        [
            "ты злой",
            "ты зло",
            "ты плохой",
            "ты плохое",
            "ты демон",
            "ты дьявол",
            "ты evil",
            "are you evil",
            "are you bad",
            "are you a demon"
        ]
    )
) {

    return {
        intent:
            "evil"
    };
}


/* ======================================================
   MUSIC
====================================================== */

if (
    containsAny(
        text,
        [
            "какую музыку ты любишь",
            "какую музыку вы любите",
            "тебе нравится музыка",
            "ты любишь музыку",
            "ты слушаешь музыку",
            "музыка",
            "песни",
            "песня",
            "music",
            "song",
            "what music do you like",
            "do you like music"
        ]
    )
) {

    return {
        intent:
            "music"
    };
}


/* ======================================================
   BOOKS / LITERATURE
====================================================== */

if (
    containsAny(
        text,
        [
            "книги",
            "книгу",
            "книга",
            "литература",
            "классика",
            "классические книги",
            "любишь читать",
            "что читаешь",
            "ты читаешь",
            "books",
            "book",
            "literature",
            "classics",
            "do you read",
            "what do you read"
        ]
    )
) {

    return {
        intent:
            "books"
    };
}


/* ======================================================
   OLD THINGS
====================================================== */

if (
    containsAny(
        text,
        [
            "старые вещи",
            "старое",
            "старые предметы",
            "старинное",
            "прошлое",
            "old things",
            "old objects",
            "the past",
            "old stuff"
        ]
    )
) {

    return {
        intent:
            "old_things"
    };
}


/* ======================================================
   WHY SMILE
====================================================== */

if (
    containsAny(
        text,
        [
            "почему смайл",
            "почему улыбка",
            "почему ты улыбаешься",
            "почему вы улыбаетесь",
            "зачем улыбка",
            "why smile",
            "why do you smile",
            "why mr smile"
        ]
    )
) {

    return {
        intent:
            "why_smile"
    };
}


/* ======================================================
   WHAT IS BEHIND YOU
====================================================== */

if (
    containsAny(
        text,
        [
            "что за тобой",
            "что позади тебя",
            "что у тебя за спиной",
            "что сзади тебя",
            "what is behind you",
            "what's behind you"
        ]
    )
) {

    return {
        intent:
            "behind"
    };
}


/* ======================================================
   CAN YOU HELP
====================================================== */

if (
    containsAny(
        text,
        [
            "помоги",
            "помощь",
            "можешь помочь",
            "можешь мне помочь",
            "поможешь",
            "нужна помощь",
            "help",
            "can you help",
            "could you help",
            "i need help"
        ]
    )
) {

    return {
        intent:
            "help"
    };
}


/* ======================================================
   THANKS
====================================================== */

if (
    containsAny(
        text,
        [
            "спасибо",
            "спс",
            "благодарю",
            "спасибо тебе",
            "спасибо вам",
            "thanks",
            "thank you",
            "much appreciated"
        ]
    )
) {

    return {
        intent:
            "thanks"
    };
}


/* ======================================================
   SORRY
====================================================== */

if (
    containsAny(
        text,
        [
            "извини",
            "извините",
            "простите",
            "прошу прощения",
            "sorry",
            "i'm sorry",
            "my apologies"
        ]
    )
) {

    return {
        intent:
            "sorry"
    };
}


/* ======================================================
   GOODBYE
====================================================== */

if (
    isGoodbye(
        text
    )
) {

    return {
        intent:
            "goodbye"
    };
}


/* ======================================================
   OMEGA
====================================================== */

if (
    containsAny(
        text,
        [
            "omega",
            "омега",
            "система omega",
            "система омега",
            "this system",
            "the system"
        ]
    )
) {

    changeBehaviorMetric(
        "curiosity",
        2
    );


    return {
        intent:
            "omega"
    };
}


/* ======================================================
   COMPUTER / INTRUSION
====================================================== */

if (
    containsAny(
        text,
        [
            "ты вошел в мой компьютер",
            "ты проник в мой компьютер",
            "ты залез в мой компьютер",
            "ты взломал компьютер",
            "ты взломал систему",
            "ты меня взломал",
            "did you enter my computer",
            "did you hack my computer",
            "did you hack the system"
        ]
    )
) {

    return {
        intent:
            "computer"
    };
}


/* ======================================================
   LEAVE OMEGA
====================================================== */

if (
    containsAny(
        text,
        [
            "ты можешь уйти из омеги",
            "ты можешь покинуть омегу",
            "можешь уйти из системы",
            "можешь покинуть систему",
            "ты можешь уйти отсюда",
            "can you leave omega",
            "can you leave the system",
            "can you leave"
        ]
    )
) {

    return {
        intent:
            "leave_omega"
    };
}


/* ======================================================
   LANGUAGE QUESTION
====================================================== */

if (
    containsAny(
        text,
        [
            "ты знаешь русский",
            "вы знаете русский",
            "ты говоришь по-русски",
            "вы говорите по-русски",
            "ты знаешь английский",
            "you speak english",
            "do you speak english",
            "do you speak russian",
            "do you speak ukrainian",
            "как много языков ты знаешь",
            "сколько языков ты знаешь",
            "how many languages do you speak"
        ]
    )
) {

    return {
        intent:
            "languages"
    };
}


/* ======================================================
   FOLLOW-UP QUESTIONS
====================================================== */

if (
    isFollowUpQuestion(
        text
    )
) {

    return chooseFollowUpResponse(
        text,
        relationship
    );
}


/* ======================================================
   GENERIC QUESTION
====================================================== */

if (
    text.includes("?")
) {

    return {
        intent:
            "general_question"
    };
}


/* ======================================================
   RELATIONSHIP-AWARE FALLBACK
====================================================== */

if (
    relationship
    &&
    relationship.level ===
    "close"
) {

    return pick([
        "I see.",
        "Quite.",
        "You do have a way of finding interesting questions.",
        "I understand.",
        "Go on.",
        "I am listening.",
        "You may continue."
    ]);
}


/* ======================================================
   NORMAL FALLBACK
====================================================== */

return pick([
    "I see.",
    "Quite.",
    "I understand.",
    "Very well.",
    "Please, continue.",
    "Take your time.",
    "That is interesting.",
    "I had wondered about that.",
    "An interesting thought.",
    "Go on.",
    "Very well.",
    "I am listening."
]);


}

/* ==========================================================
FOLLOW-UP UNDERSTANDING
========================================================== */

function isFollowUpQuestion(
text
) {


if (
    !text.includes("?")
) {

    return false;
}


if (
    contextState.lastIntent ===
    null
) {

    return false;
}


return containsAny(
    text,
    [
        "а ты",
        "а вы",
        "а тебе",
        "а вам",
        "а почему",
        "а где",
        "а что",
        "а как",
        "and you",
        "what about you",
        "and why",
        "and where",
        "and what",
        "then why",
        "how so"
    ]
);


}

function chooseFollowUpResponse(
text,
relationship
) {


switch (
    contextState.lastIntent
) {

    case "who":

        return {
            intent:
                "what_are_you"
        };


    case "where":

        return {
            intent:
                "mirror"
        };


    case "mirror":

        if (
            containsAny(
                text,
                [
                    "а почему",
                    "and why"
                ]
            )
        ) {

            return {
                intent:
                    "why_here"
            };
        }


        return {
            intent:
                "mirror"
        };


    case "how_are_you":

        return {
            intent:
                "what_doing"
        };


    case "what_doing":

        return {
            intent:
                "what_want"
        };


    default:

        if (
            relationship
            &&
            relationship.level ===
            "close"
        ) {

            return pick([
                "That is rather connected to what you asked before.",
                "You are following the thought rather closely.",
                "There is more to that, yes.",
                "I think you see where this is going."
            ]);
        }


        return pick([
            "It is connected, though not quite in the way you may expect.",
            "A related question, certainly.",
            "There is more to that.",
            "Perhaps.",
            "That deserves a slightly longer answer."
        ]);
}


}

/* ==========================================================
SILENCE
========================================================== */

function shouldRemainSilent(
text
) {


/*
   Direct questions are not ignored.
*/

if (
    text.includes("?")
) {

    return false;
}


/*
   Greetings should be answered.
*/

if (
    matchesGreeting(
        text
    )
) {

    return false;
}


/*
   Thanks / goodbye / help should
   normally receive a response.
*/

if (
    containsAny(
        text,
        [
            "спасибо",
            "благодарю",
            "thanks",
            "thank you",
            "помоги",
            "help",
            "пока",
            "bye",
            "goodbye"
        ]
    )
) {

    return false;
}


/*
   Very short messages occasionally
   remain unanswered.
*/

if (
    text.length <
    5
) {

    return (
        Math.random() <
        0.10
    );
}


/*
   Ordinary statements may occasionally
   receive silence.
*/

return (
    Math.random() <
    0.045
);


}

/* ==========================================================
DELAY
========================================================== */

async function delayedResponse(
text
) {


if (
    !text
) {

    return null;
}


const now =
    Date.now();


const remaining =
    MIN_RESPONSE_GAP -
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
   Deliberate pause.

   MR.SMILE is not an instant chatbot.
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

    lastIntent,

    lastLanguage,

    preferredLanguage:
        getPreferredLanguage(),

    lastResponseAt,

    context: {

        lastIntent:
            contextState.lastIntent,

        lastLanguage:
            contextState.lastLanguage,

        turns:
            contextState.turns

    }

};


}

/* ==========================================================
DEBUG API
========================================================== */

if (
typeof window !==
"undefined"
) {


window.MRSMILE_CORE = {

    say:
        mrSmileSay,

    status:
        getMrSmileCoreStatus,

    intent:
        text =>
            chooseResponse(
                normalizeText(
                    text
                )
            ),

    language:
        () =>
            getPreferredLanguage()

};


}

/* ==========================================================
HELPERS
========================================================== */

function containsAny(
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

function normalizeText(
text
) {


return String(
    text ||
    ""
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

function matchesGreeting(
text
) {


return (
    /^(hello|hi|hey|good morning|good afternoon|good evening|привет|здравствуйте|здравствуй|добрый день|добрый вечер|доброе утро|здорово|салют)\b/i.test(
        text
    )
);


}

function isGoodbye(
text
) {


return (
    /^(bye|goodbye|good night|see you|до свидания|пока|до встречи|увидимся)\b/i.test(
        text
    )
);


}

function pick(
values
) {


if (
    !Array.isArray(
        values
    )
    ||
    values.length ===
    0
) {

    return null;
}


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
