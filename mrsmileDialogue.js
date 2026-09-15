/* ==========================================================
   MR.SMILE DIALOGUE — LIVING CONVERSATION LAYER
   OMEGA / MIRROR-INT

   MR.SMILE is not a normal assistant.
   He is an inhabitant of reflections who has entered OMEGA.

   This layer gives the existing Core conversational continuity:
   - remembers repeated questions
   - notices deliberate tests
   - notices memory checks
   - keeps conversation continuity
   - preserves the calm gentleman personality
   - prefers hints to direct explanations

   The Core remains responsible for the main personality/intent system.
========================================================== */

import {
    mrSmileSay
} from "./mrsmileCore.js";

import {
    getMemory,
    findPreviousQuestion
} from "./mrsmileMemory.js";


const STORAGE_KEY = "mrsmile_memory_v5";


function clean(value) {
    return String(value ?? "").trim();
}


function normalize(text) {
    return clean(text)
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[“”„«»]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[!?.,;:]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function randomItem(list) {
    if (!Array.isArray(list) || !list.length) {
        return "";
    }

    return list[
        Math.floor(Math.random() * list.length)
    ];
}


function detectLanguage(text, fallback = "ru") {
    const value = normalize(text);

    if (/[а-яёіїєґ]/i.test(value)) {
        return "ru";
    }

    if (/[a-z]/i.test(value)) {
        return "en";
    }

    return fallback;
}


function detectTest(text) {
    const value = normalize(text);

    return (
        /\b(проверяю|проверить|проверка|тестирую|тест|проверяю тебя|проверяю память|проверка памяти|перепроверить)\b/i.test(value) ||
        /\b(test|testing|check|checking|memory test|i am testing you|i'm testing you)\b/i.test(value)
    );
}


function detectMemoryQuestion(text) {
    const value = normalize(text);

    return (
        /\b(помнишь|ты помнишь|запомнил|запомнила|помнишь мой|помнишь что)\b/i.test(value) ||
        /\b(do you remember|remember this|did you remember|you remember)\b/i.test(value)
    );
}


function detectContinuation(text) {
    const value = normalize(text);

    return (
        /^(и\s+|а\s+|тогда\s+|но\s+|значит\s+|то есть\s+|а если\s+|тогда что|что насчёт|что насчет)/i.test(value) ||
        /^(and\s+|then\s+|but\s+|so\s+|what about|what if|then what)/i.test(value)
    );
}


function getRecentConversation(limit = 12) {
    try {
        const memory = getMemory();

        const list = Array.isArray(memory?.conversations)
            ? memory.conversations
            : [];

        return list.slice(-limit);
    } catch {
        return [];
    }
}


function getLastMrSmileMessage() {
    const list = getRecentConversation();

    for (let i = list.length - 1; i >= 0; i--) {
        if (list[i]?.author === "mrsmile") {
            return clean(list[i].text);
        }
    }

    return "";
}


function getLastOperatorMessage() {
    const list = getRecentConversation();

    for (let i = list.length - 1; i >= 0; i--) {
        if (list[i]?.author === "operator") {
            return clean(list[i].text);
        }
    }

    return "";
}


function getConversationTopic(text) {
    const value = normalize(text);

    if (/mirror|reflection|отражен|зеркал|изнанк|зеркальн/i.test(value)) {
        return "mirror";
    }

    if (/omega|омега/i.test(value)) {
        return "omega";
    }

    if (/памят|memory|запомн/i.test(value)) {
        return "memory";
    }

    if (/кто ты|что ты|кто такой|who are you|what are you/i.test(value)) {
        return "identity";
    }

    if (/человек|human|живой|alive/i.test(value)) {
        return "identity";
    }

    if (/видишь|наблюда|следишь|watch|see me|seeing me/i.test(value)) {
        return "observation";
    }

    if (/выйти|уйти|покинуть|leave|escape|exit/i.test(value)) {
        return "exit";
    }

    if (/помочь|помощ|help/i.test(value)) {
        return "help";
    }

    if (/музык|music|книг|book|классик|classic/i.test(value)) {
        return "classics";
    }

    return "general";
}


function getBank(language) {
    const ru = language !== "en";

    return {
        repeatFirst: ru
            ? [
                "Вы уже задавали этот вопрос.",
                "Мы уже касались этого.",
                "Этот вопрос мне уже знаком.",
                "Любопытно. Вы решили вернуться к тому же вопросу.",
                "Полагаю, вы проверяете, помню ли я предыдущий разговор."
            ]
            : [
                "You have asked me that before.",
                "We have touched on this already.",
                "That question is familiar to me.",
                "Curious. You have returned to the same question.",
                "I suspect you are checking whether I remember the previous conversation."
            ],

        repeatLater: ru
            ? [
                "Мы снова пришли сюда.",
                "Вы действительно настойчивы.",
                "Вы уже знаете, что я отвечал.",
                "Вопрос тот же. Причина, полагаю, уже другая.",
                "Я помню, что отвечал вам прежде."
            ]
            : [
                "We have arrived here again.",
                "You are remarkably persistent.",
                "You already know what I told you.",
                "The question is the same. The reason, I suspect, is not.",
                "I remember what I told you before."
            ],

        test: ru
            ? [
                "Да. Я заметил.",
                "Разумеется. Вы проверяете меня.",
                "Вы можете продолжать. Я не возражаю против проверки.",
                "Я понял, что именно вы проверяете.",
                "Память — довольно странная вещь для проверки."
            ]
            : [
                "Yes. I noticed.",
                "Of course. You are testing me.",
                "You may continue. I do not object to the test.",
                "I understand what you are testing.",
                "Memory is a rather interesting thing to test."
            ],

        memory: ru
            ? [
                "Я помню достаточно, чтобы заметить повторение.",
                "Некоторые вещи остаются дольше других.",
                "Я помню разговор лучше, чем вам, возможно, хотелось бы.",
                "Да. Я помню.",
                "Не всё одинаково важно. Но ваш вопрос я помню."
            ]
            : [
                "I remember enough to notice repetition.",
                "Some things remain longer than others.",
                "I remember the conversation rather better than you may have expected.",
                "Yes. I remember.",
                "Not everything is equally important. But I remember your question."
            ],

        continuation: ru
            ? [
                "Продолжайте.",
                "Теперь вопрос становится интереснее.",
                "Вот это уже ближе к сути.",
                "Я полагаю, вы ведёте разговор именно туда.",
                "Не спешите. Мы ещё не закончили предыдущую мысль."
            ]
            : [
                "Go on.",
                "Now the question becomes more interesting.",
                "That is rather closer to the point.",
                "I suspect you are leading the conversation there deliberately.",
                "Do not hurry. We have not quite finished the previous thought."
            ]
    };
}


function patchStoredVisibleResponse(question, response) {
    try {
        if (
            typeof localStorage === "undefined"
        ) {
            return;
        }

        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return;
        }

        const data = JSON.parse(raw);
        const normalized = normalize(question);

        if (Array.isArray(data.questionHistory)) {
            const entry = data.questionHistory.find(item =>
                item &&
                item.normalized === normalized
            );

            if (entry) {
                entry.lastResponse = response;

                if (!Array.isArray(entry.responses)) {
                    entry.responses = [];
                }

                if (entry.responses.length) {
                    entry.responses[
                        entry.responses.length - 1
                    ] = response;
                } else {
                    entry.responses.push(response);
                }
            }
        }

        if (Array.isArray(data.conversations)) {
            for (
                let i = data.conversations.length - 1;
                i >= 0;
                i--
            ) {
                if (
                    data.conversations[i]?.author === "mrsmile"
                ) {
                    data.conversations[i].text = response;
                    break;
                }
            }
        }

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {
        console.warn(
            "[MR.SMILE DIALOGUE] Memory response sync failed:",
            error
        );
    }
}


function chooseContextualResponse(
    input,
    language,
    previous,
    testDetected,
    memoryQuestion
) {
    const bank = getBank(language);

    if (testDetected) {
        return randomItem(bank.test);
    }

    if (memoryQuestion) {
        return randomItem(bank.memory);
    }

    if (previous) {
        const count =
            Number(previous.count) || 0;

        return randomItem(
            count >= 2
                ? bank.repeatLater
                : bank.repeatFirst
        );
    }

    if (detectContinuation(input)) {
        return randomItem(bank.continuation);
    }

    return null;
}


export function processMrSmileDialogue(
    text,
    options = {}
) {
    const input = clean(text);

    if (!input) {
        return null;
    }

    const language =
        detectLanguage(
            input,
            options.language || "ru"
        );

    const previous =
        findPreviousQuestion(input);

    const testDetected =
        detectTest(input);

    const memoryQuestion =
        detectMemoryQuestion(input);

    const lastOperator =
        getLastOperatorMessage();

    const lastMrSmile =
        getLastMrSmileMessage();

    let coreResult;

    try {
        coreResult =
            mrSmileSay(
                input,
                {
                    ...options,
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

    if (!coreResult) {
        return null;
    }

    const contextual =
        chooseContextualResponse(
            input,
            language,
            previous,
            testDetected,
            memoryQuestion
        );

    if (!contextual) {
        return coreResult;
    }

    const result = {
        ...coreResult,

        text:
            contextual,

        dialogueLayer:
            true,

        dialogueReason:
            testDetected
                ? "operator_test"
                : memoryQuestion
                    ? "memory_reference"
                    : previous
                        ? "repeated_question"
                        : "conversation_continuation",

        conversationContext: {
            topic:
                getConversationTopic(input),

            previousQuestionCount:
                Number(previous?.count) || 0,

            lastOperatorMessage:
                lastOperator,

            lastMrSmileMessage:
                lastMrSmile
        }
    };

    patchStoredVisibleResponse(
        input,
        contextual
    );

    return result;
}


export function getDialogueContext() {
    const recent =
        getRecentConversation();

    return {
        recent,
        lastOperator:
            getLastOperatorMessage(),
        lastMrSmile:
            getLastMrSmileMessage()
    };
}


export function analyzeDialogueInput(text) {
    const input = clean(text);

    const previous =
        findPreviousQuestion(input);

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
            Boolean(previous),

        repeatCount:
            Number(previous?.count) || 0,

        lastMrSmileMessage:
            getLastMrSmileMessage()
    };
}


export default {
    processMrSmileDialogue,
    getDialogueContext,
    analyzeDialogueInput
};
