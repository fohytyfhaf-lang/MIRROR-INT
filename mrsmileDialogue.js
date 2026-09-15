
/* ==========================================================
   MR.SMILE DIALOGUE — CONTEXT / COMPATIBILITY LAYER
   OMEGA / MIRROR-INT

   IMPORTANT ARCHITECTURE RULE:

   This module is NOT a second response generator.

   MR.SMILE response generation belongs to:
       mrsmileCore.js

   Memory writing belongs to:
       mrsmileMemory.js

   Progress / relationship belongs to:
       mrsmileProgress.js
       mrsmileRelationship.js

   This file ONLY:
   - analyzes conversational context
   - detects repeated questions
   - detects deliberate testing
   - detects memory checks
   - detects conversational continuation
   - collects recent dialogue context
   - calls the Core exactly once
   - enriches the Core result with metadata
   - preserves compatibility for older callers

   It MUST NOT:
   - generate a second visible response
   - replace Core response text
   - write responses directly into localStorage
   - manually write operator messages
   - manually write MR.SMILE messages
   - call Core more than once per processMrSmileDialogue()
   - act as an independent personality engine

   Target invariant:

       one operator message
              ↓
       one processMrSmileDialogue()
              ↓
       one mrSmileSay()
              ↓
       one returned response
========================================================== */

import {
    mrSmileSay
} from "./mrsmileCore.js";

import {
    getMemory,
    findPreviousQuestion
} from "./mrsmileMemory.js";


/* ==========================================================
   BASIC UTILITIES
========================================================== */

function clean(value) {
    return String(value ?? "").trim();
}


function normalize(text) {
    return clean(text)
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[“”„«»]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[!?.,;:()[\]{}]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


/* ==========================================================
   LANGUAGE DETECTION
   This layer only describes the message.
   Actual response language remains a Core responsibility.
========================================================== */

function detectLanguage(text, fallback = "ru") {
    const value = clean(text);

    if (!value) {
        return fallback;
    }

    const normalized = value.toLowerCase();

    const ukrainianMarkers =
        /[іїєґ]/i.test(normalized) ||
        /\b(привіт|дякую|будь ласка|чому|якщо|тому|памятаєш|пам'ятаєш|можеш|розкажи|хто ти|що ти)\b/i.test(
            normalized
        );

    const russianMarkers =
        /[ыэъё]/i.test(normalized) ||
        /\b(привет|спасибо|пожалуйста|почему|если|помнишь|можешь|расскажи|кто ты|что ты|зачем)\b/i.test(
            normalized
        );

    const latin =
        /[a-z]/i.test(normalized);

    if (ukrainianMarkers) {
        return "uk";
    }

    if (russianMarkers) {
        return "ru";
    }

    if (latin && !/[а-яёіїєґ]/i.test(normalized)) {
        return "en";
    }

    return fallback;
}


/* ==========================================================
   TEST / CHECKING DETECTION

   Used only as metadata.
   Core still decides the actual response.
========================================================== */

function detectTest(text) {
    const value = normalize(text);

    if (!value) {
        return false;
    }

    const russian =
        /\b(проверяю|проверить|проверка|проверить тебя|проверяю тебя|тестирую|тест|проверка памяти|проверяю память|перепроверить|проверим)\b/i;

    const ukrainian =
        /\b(перевіряю|перевірити|перевірка|перевірити тебе|тестую|тест|перевірка пам'яті|перевірю)\b/i;

    const english =
        /\b(test|testing|check|checking|memory test|i am testing you|i'm testing you|let me test you|are you testing)\b/i;

    return (
        russian.test(value) ||
        ukrainian.test(value) ||
        english.test(value)
    );
}


/* ==========================================================
   MEMORY QUESTION DETECTION
========================================================== */

function detectMemoryQuestion(text) {
    const value = normalize(text);

    if (!value) {
        return false;
    }

    const russian =
        /\b(помнишь|ты помнишь|запомнил|запомнила|помнишь мой|помнишь что|помнишь меня|ты это помнишь)\b/i;

    const ukrainian =
        /\b(пам'ятаєш|памятаєш|ти пам'ятаєш|ти памятаєш|запам'ятав|запамятував|пам'ятаєш мене|памятаєш мене)\b/i;

    const english =
        /\b(do you remember|remember this|did you remember|you remember|remember me|do you still remember)\b/i;

    return (
        russian.test(value) ||
        ukrainian.test(value) ||
        english.test(value)
    );
}


/* ==========================================================
   CONTINUATION DETECTION

   Examples:
       "а если..."
       "тогда..."
       "и что..."
       "what about..."
========================================================== */

function detectContinuation(text) {
    const value = normalize(text);

    if (!value) {
        return false;
    }

    return (
        /^(и\s+|а\s+|тогда\s+|но\s+|значит\s+|то есть\s+|а если\s+|тогда что|что насчёт|что насчет|и что|а что)/i.test(value) ||
        /^(і\s+|а\s+|тоді\s+|але\s+|отже\s+|тобто\s+|а якщо\s+|що щодо|і що)/i.test(value) ||
        /^(and\s+|then\s+|but\s+|so\s+|what about|what if|then what|and what)/i.test(value)
    );
}


/* ==========================================================
   TOPIC DETECTION

   This is descriptive metadata only.
   It does NOT replace Core intent detection.
========================================================== */

function getConversationTopic(text) {
    const value = normalize(text);

    if (!value) {
        return "general";
    }

    if (
        /mirror|reflection|отражен|зеркал|изнанк|зеркальн|відображен|дзеркал|дзеркальн/i.test(value)
    ) {
        return "mirror";
    }

    if (
        /omega|омега|омеґа/i.test(value)
    ) {
        return "omega";
    }

    if (
        /памят|пам'ят|memory|запомн|памятаєш|пам'ятаєш|память/i.test(value)
    ) {
        return "memory";
    }

    if (
        /кто ты|что ты|кто такой|who are you|what are you|хто ти|що ти|хто ти є/i.test(value)
    ) {
        return "identity";
    }

    if (
        /человек|human|живой|alive|людина|живий/i.test(value)
    ) {
        return "identity";
    }

    if (
        /видишь|видишь меня|наблюда|следишь|watch|watching|see me|seeing me|бачиш|спостеріга|стежиш/i.test(value)
    ) {
        return "observation";
    }

    if (
        /выйти|уйти|покинуть|leave|escape|exit|вийти|піти|покинути/i.test(value)
    ) {
        return "exit";
    }

    if (
        /помочь|помощ|help|допомог|допомога/i.test(value)
    ) {
        return "help";
    }

    if (
        /музык|music|книг|book|классик|classic|музик|книж|класик/i.test(value)
    ) {
        return "classics";
    }

    if (
        /ten\b|тэн\b|тен\b|experiment|эксперимент|експеримент/i.test(value)
    ) {
        return "ten";
    }

    if (
        /black blood|чёрн|черн.*кров|blackblood|чорн.*кров|чорна кров/i.test(value)
    ) {
        return "black_blood";
    }

    if (
        /living corpse|living corpses|живой труп|живые трупы|живой мертвец|живі тіла|живий труп/i.test(value)
    ) {
        return "living_corpses";
    }

    if (
        /source entity|source|источник|источн|джерело/i.test(value)
    ) {
        return "source";
    }

    if (
        /vessel|сосуд|носитель|судин|носій/i.test(value)
    ) {
        return "vessel";
    }

    if (
        /soul|душ|душа|душу|душі/i.test(value)
    ) {
        return "soul";
    }

    if (
        /улыб|smile|mr smile|mr\. smile|mrsmile|містер смайл/i.test(value)
    ) {
        return "mrsmile";
    }

    if (
        /archive|архив|архів|file|файл|досье|досьє/i.test(value)
    ) {
        return "archive";
    }

    return "general";
}


/* ==========================================================
   RECENT CONVERSATION ACCESS
========================================================== */

function getRecentConversation(limit = 12) {
    try {
        const memory = getMemory();

        const list = Array.isArray(memory?.conversations)
            ? memory.conversations
            : [];

        return list.slice(-Math.max(1, Number(limit) || 12));

    } catch {
        return [];
    }
}


/* ==========================================================
   LAST OPERATOR MESSAGE
========================================================== */

function getLastOperatorMessage() {
    const list = getRecentConversation(24);

    for (let i = list.length - 1; i >= 0; i--) {
        const entry = list[i];

        if (
            entry?.author === "operator" &&
            clean(entry.text)
        ) {
            return clean(entry.text);
        }
    }

    return "";
}


/* ==========================================================
   LAST MR.SMILE MESSAGE
========================================================== */

function getLastMrSmileMessage() {
    const list = getRecentConversation(24);

    for (let i = list.length - 1; i >= 0; i--) {
        const entry = list[i];

        if (
            entry?.author === "mrsmile" &&
            clean(entry.text)
        ) {
            return clean(entry.text);
        }
    }

    return "";
}


/* ==========================================================
   CONVERSATION SUMMARY
========================================================== */

function buildConversationContext(input, previous) {
    const recent = getRecentConversation(12);

    return {
        topic: getConversationTopic(input),

        previousQuestionCount:
            Number(previous?.count) || 0,

        repeated:
            Boolean(previous),

        lastOperatorMessage:
            getLastOperatorMessage(),

        lastMrSmileMessage:
            getLastMrSmileMessage(),

        recentCount:
            recent.length
    };
}


/* ==========================================================
   MEMORY CHECK
========================================================== */

function inspectMemoryContext(input) {
    let previous = null;

    try {
        previous = findPreviousQuestion(input);
    } catch (error) {
        console.warn(
            "[MR.SMILE DIALOGUE] Question lookup failed:",
            error
        );
    }

    return {
        repeated:
            Boolean(previous),

        repeatCount:
            Number(previous?.count) || 0,

        previous
    };
}


/* ==========================================================
   SAFE CORE CALL
   Exactly ONE Core call.
========================================================== */

function callCoreOnce(input, options = {}) {
    try {
        return mrSmileSay(
            input,
            {
                ...options,

                /*
                 * Preserve explicit caller preference.
                 * Dialogue layer never invents a second response.
                 */
                instant:
                    options.instant === true
            }
        );

    } catch (error) {
        console.error(
            "[MR.SMILE DIALOGUE] Core failed:",
            error
        );

        throw error;
    }
}


/* ==========================================================
   RESULT ENRICHMENT

   We add metadata but NEVER replace:
       result.text

   This is the most important architectural change.
========================================================== */

function enrichCoreResult(
    coreResult,
    context
) {
    if (!coreResult || typeof coreResult !== "object") {
        return coreResult;
    }

    return {
        ...coreResult,

        dialogueLayer: true,

        dialogueContext: {
            ...context
        }
    };
}


/* ==========================================================
   MAIN ENTRY
========================================================== */

export function processMrSmileDialogue(
    text,
    options = {}
) {
    const input = clean(text);

    if (!input) {
        return null;
    }

    /*
     * --------------------------------------------------------
     * STEP 1 — ANALYZE ONLY
     * No response generation here.
     * --------------------------------------------------------
     */

    const language =
        detectLanguage(
            input,
            options.language || "ru"
        );

    const testDetected =
        detectTest(input);

    const memoryQuestion =
        detectMemoryQuestion(input);

    const continuation =
        detectContinuation(input);

    const memoryContext =
        inspectMemoryContext(input);

    const conversationContext =
        buildConversationContext(
            input,
            memoryContext.previous
        );

    /*
     * --------------------------------------------------------
     * STEP 2 — ONE AND ONLY ONE CORE CALL
     * --------------------------------------------------------
     */

    const coreResult =
        callCoreOnce(
            input,
            {
                ...options,

                /*
                 * Preserve the explicitly detected language
                 * as context, but do not force response text.
                 */
                language:
                    options.language || language
            }
        );

    if (!coreResult) {
        return null;
    }

    /*
     * --------------------------------------------------------
     * STEP 3 — ADD METADATA ONLY
     *
     * NEVER:
     *   coreResult.text = another response
     *   localStorage patch
     *   second memory write
     * --------------------------------------------------------
     */

    return enrichCoreResult(
        coreResult,
        {
            ...conversationContext,

            language,

            testDetected,

            memoryQuestion,

            continuation,

            repeated:
                memoryContext.repeated,

            repeatCount:
                memoryContext.repeatCount
        }
    );
}


/* ==========================================================
   CONTEXT API
========================================================== */

export function getDialogueContext() {
    const recent =
        getRecentConversation(12);

    return {
        recent,

        lastOperator:
            getLastOperatorMessage(),

        lastMrSmile:
            getLastMrSmileMessage(),

        recentCount:
            recent.length
    };
}


/* ==========================================================
   INPUT ANALYSIS API
========================================================== */

export function analyzeDialogueInput(text) {
    const input = clean(text);

    if (!input) {
        return {
            text: "",
            language: "ru",
            test: false,
            memoryQuestion: false,
            continuation: false,
            topic: "general",
            repeated: false,
            repeatCount: 0,
            lastMrSmileMessage:
                getLastMrSmileMessage()
        };
    }

    const memoryContext =
        inspectMemoryContext(input);

    return {
        text: input,

        language:
            detectLanguage(input),

        test:
            detectTest(input),

        memoryQuestion:
            detectMemoryQuestion(input),

        continuation:
            detectContinuation(input),

        topic:
            getConversationTopic(input),

        repeated:
            memoryContext.repeated,

        repeatCount:
            memoryContext.repeatCount,

        lastOperatorMessage:
            getLastOperatorMessage(),

        lastMrSmileMessage:
            getLastMrSmileMessage(),

        recentConversation:
            getRecentConversation(12)
    };
}


/* ==========================================================
   CONVENIENCE HELPERS
========================================================== */

export function isRepeatedQuestion(text) {
    const input = clean(text);

    if (!input) {
        return false;
    }

    try {
        return Boolean(findPreviousQuestion(input));
    } catch {
        return false;
    }
}


export function getRepeatCount(text) {
    const input = clean(text);

    if (!input) {
        return 0;
    }

    try {
        return Number(
            findPreviousQuestion(input)?.count
        ) || 0;
    } catch {
        return 0;
    }
}


export function isTestingMrSmile(text) {
    return detectTest(text);
}


export function isMemoryQuestion(text) {
    return detectMemoryQuestion(text);
}


export function isConversationContinuation(text) {
    return detectContinuation(text);
}


export function getDialogueTopic(text) {
    return getConversationTopic(text);
}


/* ==========================================================
   DEBUG / DIAGNOSTIC STATE
========================================================== */

export function getDialogueDiagnostics(text = "") {
    const input = clean(text);

    const memoryContext =
        input
            ? inspectMemoryContext(input)
            : {
                repeated: false,
                repeatCount: 0,
                previous: null
            };

    return {
        input,

        language:
            detectLanguage(
                input,
                "ru"
            ),

        testDetected:
            input
                ? detectTest(input)
                : false,

        memoryQuestion:
            input
                ? detectMemoryQuestion(input)
                : false,

        continuation:
            input
                ? detectContinuation(input)
                : false,

        topic:
            input
                ? getConversationTopic(input)
                : "general",

        repeated:
            memoryContext.repeated,

        repeatCount:
            memoryContext.repeatCount,

        lastOperatorMessage:
            getLastOperatorMessage(),

        lastMrSmileMessage:
            getLastMrSmileMessage(),

        recentConversation:
            getRecentConversation(12)
    };
}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default {
    processMrSmileDialogue,

    getDialogueContext,

    analyzeDialogueInput,

    isRepeatedQuestion,

    getRepeatCount,

    isTestingMrSmile,

    isMemoryQuestion,

    isConversationContinuation,

    getDialogueTopic,

    getDialogueDiagnostics
};

