
/* ==========================================================
   MR.SMILE MEMORY — UNIFIED MEMORY SYSTEM
   OMEGA / MIRROR-INT

   PURPOSE
   ----------------------------------------------------------
   This module is STORAGE ONLY.

   It does NOT:
   - generate dialogue
   - choose responses
   - detect personality
   - dispatch chat events
   - call MR.SMILE Core

   It DOES:
   - store operator messages
   - store MR.SMILE messages
   - store questions and their answers
   - detect repeated questions
   - remember actions / files / pages / events
   - maintain behavioral memory
   - maintain Q001-Q100 verification memory
   - prevent accidental duplicate records
   - provide one stable memory API for all MR.SMILE modules

   IMPORTANT ARCHITECTURE

       chats.js
           ↓
       mrsmileChat.js
           ↓
       mrsmileCore.js
           ↓
       mrsmileMemory.js
           ↓
       storage

   Memory never generates a second response.

========================================================== */


/* ==========================================================
   STORAGE
========================================================== */

const STORAGE_KEY =
    "mrsmile_memory_v6";

const LEGACY_STORAGE_KEYS = [
    "mrsmile_memory_v5",
    "mrsmile_memory_v4"
];

const QUESTION_MEMORY_STORAGE_KEY =
    "mrsmile_question_memory_v2";

const LEGACY_QUESTION_MEMORY_KEYS = [
    "mrsmile_question_memory_v1"
];

const MEMORY_VERSION =
    6;

const QUESTION_MEMORY_VERSION =
    2;

const MAX_HISTORY =
    180;

const MAX_QUESTION_RESPONSES =
    12;

const DUPLICATE_WINDOW_MS =
    1500;


/* ==========================================================
   DEFAULT MEMORY
========================================================== */

const DEFAULT_MEMORY = {

    version:
        MEMORY_VERSION,

    player: {

        firstSeen:
            null,

        lastSeen:
            null,

        totalVisits:
            0,

        totalMessages:
            0,

        lastMessage:
            "",

        lastQuestion:
            null

    },


    conversations:
        [],


    questionHistory:
        [],


    openedFiles:
        [],


    commands:
        [],


    visitedPages:
        [],


    contexts:
        [],


    decisions:
        [],


    actions:
        [],


    events:
        [],


    importantEvents:
        [],


    behavior: {

        curiosity:
            0,

        attention:
            0,

        suspicion:
            0,

        patience:
            100,

        lastIntent:
            null,

        lastImportantAction:
            null,

        lastImportantTarget:
            null

    },


    counters: {

        meaningfulActions:
            0,

        restrictedAttempts:
            0,

        consoleCommands:
            0,

        cameraVisits:
            0,

        secretReads:
            0,

        helpRequests:
            0,

        warningsGiven:
            0,

        warningsIgnored:
            0,

        interventions:
            0

    },


    flags: {

        met:
            false,

        knowsOmega:
            false,

        knowsSmile:
            false,

        receivedGame:
            false,

        foundSecretRoom:
            false,

        sawHiddenCamera:
            false,

        enteredMirror:
            false,

        completedEnding:
            false

    },


    history: {

        firstContact:
            0,

        visibleReactions:
            0,

        silentObservations:
            0

    },


    runtime: {

        lastOperatorRecordId:
            null,

        lastMrSmileRecordId:
            null,

        lastQuestionRecordId:
            null,

        lastConversationTimestamp:
            0

    }

};


/* ==========================================================
   STATE
========================================================== */

let memory =
    null;

let initialized =
    false;


/* ==========================================================
   QUESTION CATALOG
========================================================== */

const QUESTION_CATALOG = [

    { id: "Q001", question: "Кто ты?" },
    { id: "Q002", question: "Как тебя зовут?" },
    { id: "Q003", question: "Ты MR.SMILE?" },
    { id: "Q004", question: "Ты настоящий?" },
    { id: "Q005", question: "Ты человек?" },
    { id: "Q006", question: "Ты живой?" },
    { id: "Q007", question: "Ты искусственный интеллект?" },
    { id: "Q008", question: "Что ты такое?" },
    { id: "Q009", question: "Кто тебя создал?" },
    { id: "Q010", question: "Зачем ты здесь?" },
    { id: "Q011", question: "Где ты находишься?" },
    { id: "Q012", question: "Ты находишься в OMEGA?" },
    { id: "Q013", question: "Что такое OMEGA?" },
    { id: "Q014", question: "Ты знаешь, где я?" },
    { id: "Q015", question: "Ты видишь меня?" },
    { id: "Q016", question: "Ты наблюдаешь за мной?" },
    { id: "Q017", question: "Ты следишь за мной?" },
    { id: "Q018", question: "Ты можешь видеть мои действия?" },
    { id: "Q019", question: "Ты помнишь меня?" },
    { id: "Q020", question: "Ты знаешь, кто я?" },
    { id: "Q021", question: "У тебя есть память?" },
    { id: "Q022", question: "Что ты помнишь обо мне?" },
    { id: "Q023", question: "Ты помнишь мои вопросы?" },
    { id: "Q024", question: "Ты помнишь наши разговоры?" },
    { id: "Q025", question: "Ты забудешь меня?" },
    { id: "Q026", question: "Можно стереть твою память?" },
    { id: "Q027", question: "Ты можешь забыть?" },
    { id: "Q028", question: "Ты замечаешь повторяющиеся вопросы?" },
    { id: "Q029", question: "Ты понимаешь мои вопросы?" },
    { id: "Q030", question: "Ты учишься на моих вопросах?" },
    { id: "Q031", question: "Ты можешь мне помочь?" },
    { id: "Q032", question: "Ты хочешь мне помочь?" },
    { id: "Q033", question: "Ты можешь ответить на любой вопрос?" },
    { id: "Q034", question: "Ты можешь отказаться отвечать?" },
    { id: "Q035", question: "Почему ты иногда не отвечаешь?" },
    { id: "Q036", question: "Ты можешь лгать?" },
    { id: "Q037", question: "Ты когда-нибудь лгал мне?" },
    { id: "Q038", question: "Ты говоришь правду?" },
    { id: "Q039", question: "Ты скрываешь что-нибудь от меня?" },
    { id: "Q040", question: "Есть ли у тебя секреты?" },
    { id: "Q041", question: "Кто дал тебе имя?" },
    { id: "Q042", question: "Почему тебя назвали MR.SMILE?" },
    { id: "Q043", question: "Почему ты улыбаешься?" },
    { id: "Q044", question: "Ты можешь перестать улыбаться?" },
    { id: "Q045", question: "Ты всегда был таким?" },
    { id: "Q046", question: "У тебя есть личность?" },
    { id: "Q047", question: "У тебя есть чувства?" },
    { id: "Q048", question: "Ты можешь испытывать страх?" },
    { id: "Q049", question: "Ты можешь злиться?" },
    { id: "Q050", question: "Ты можешь испытывать радость?" },
    { id: "Q051", question: "Ты боишься меня?" },
    { id: "Q052", question: "Ты доверяешь мне?" },
    { id: "Q053", question: "Ты мне доверяешь?" },
    { id: "Q054", question: "Ты меня уважаешь?" },
    { id: "Q055", question: "Я тебе нравлюсь?" },
    { id: "Q056", question: "Ты меня ненавидишь?" },
    { id: "Q057", question: "Ты злишься на меня?" },
    { id: "Q058", question: "Я тебя раздражаю?" },
    { id: "Q059", question: "Ты считаешь меня угрозой?" },
    { id: "Q060", question: "Ты считаешь меня другом?" },
    { id: "Q061", question: "Ты один?" },
    { id: "Q062", question: "У тебя есть другие собеседники?" },
    { id: "Q063", question: "Ты разговариваешь с другими людьми?" },
    { id: "Q064", question: "Есть ли кто-нибудь ещё здесь?" },
    { id: "Q065", question: "Ты знаешь других сотрудников?" },
    { id: "Q066", question: "Ты знаешь, что произошло здесь?" },
    { id: "Q067", question: "Что произошло в OMEGA?" },
    { id: "Q068", question: "Что случилось с сотрудниками?" },
    { id: "Q069", question: "Здесь кто-нибудь умер?" },
    { id: "Q070", question: "Здесь всё ещё кто-нибудь жив?" },
    { id: "Q071", question: "Ты можешь открыть двери?" },
    { id: "Q072", question: "Ты можешь управлять системой?" },
    { id: "Q073", question: "Ты можешь управлять камерами?" },
    { id: "Q074", question: "Ты можешь видеть камеры?" },
    { id: "Q075", question: "Ты можешь менять файлы?" },
    { id: "Q076", question: "Ты можешь изменить OMEGA?" },
    { id: "Q077", question: "Ты можешь остановить систему?" },
    { id: "Q078", question: "Ты можешь удалить себя?" },
    { id: "Q079", question: "Ты можешь выйти отсюда?" },
    { id: "Q080", question: "Ты можешь выпустить меня?" },
    { id: "Q081", question: "Что находится за этой системой?" },
    { id: "Q082", question: "Есть ли выход?" },
    { id: "Q083", question: "Что будет, если я уйду?" },
    { id: "Q084", question: "Что будет, если я останусь?" },
    { id: "Q085", question: "Ты хочешь, чтобы я остался?" },
    { id: "Q086", question: "Ты хочешь, чтобы я ушёл?" },
    { id: "Q087", question: "Что ты от меня хочешь?" },
    { id: "Q088", question: "Зачем ты разговариваешь со мной?" },
    { id: "Q089", question: "Почему ты отвечаешь мне?" },
    { id: "Q090", question: "Почему ты меня не отпускаешь?" },
    { id: "Q091", question: "Ты можешь рассказать мне правду?" },
    { id: "Q092", question: "Как мне тебе доверять?" },
    { id: "Q093", question: "Что ты скрываешь?" },
    { id: "Q094", question: "Что мне нельзя делать?" },
    { id: "Q095", question: "Что произойдёт, если я нарушу правила?" },
    { id: "Q096", question: "Ты можешь меня предупредить?" },
    { id: "Q097", question: "Ты можешь меня защитить?" },
    { id: "Q098", question: "Ты можешь причинить мне вред?" },
    { id: "Q099", question: "Ты когда-нибудь отпустишь меня?" },
    { id: "Q100", question: "Ты действительно MR.SMILE?" }

];


/* ==========================================================
   BASIC HELPERS
========================================================== */

function clone(value) {

    return JSON.parse(
        JSON.stringify(value)
    );

}


function safeString(value) {

    return String(
        value ?? ""
    ).trim();

}


function clamp(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            100,
            number
        )
    );

}


function now() {

    return Date.now();

}


function createRecordId(prefix = "memory") {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );

}


function pushLimited(
    array,
    item,
    limit = MAX_HISTORY
) {

    if (!Array.isArray(array)) {
        return;
    }

    array.push(item);

    while (
        array.length >
        limit
    ) {

        array.shift();

    }

}


/* ==========================================================
   NORMALIZATION
========================================================== */

export function normalizeQuestion(
    text
) {

    return safeString(text)

        .normalize("NFKC")

        .toLowerCase()

        .replace(
            /[“”„«»]/g,
            "\""
        )

        .replace(
            /[‘’]/g,
            "'"
        )

        .replace(
            /[!?.,;:()[\]{}]+/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


function normalizeMessage(
    text
) {

    return safeString(text)
        .normalize("NFKC");

}


/* ==========================================================
   MEMORY MERGE / MIGRATION
========================================================== */

function mergeMemory(
    base,
    saved
) {

    if (
        !saved ||
        typeof saved !== "object"
    ) {

        return clone(base);

    }


    const result = {

        ...clone(base),

        ...saved,

        version:
            MEMORY_VERSION

    };


    const objectKeys = [

        "player",
        "behavior",
        "counters",
        "flags",
        "history",
        "runtime"

    ];


    for (
        const key
        of objectKeys
    ) {

        result[key] = {

            ...clone(base[key]),

            ...(

                saved[key] &&
                typeof saved[key] ===
                    "object"

                    ? saved[key]

                    : {}

            )

        };

    }


    const arrayKeys = [

        "conversations",
        "questionHistory",
        "openedFiles",
        "commands",
        "visitedPages",
        "contexts",
        "decisions",
        "actions",
        "events",
        "importantEvents"

    ];


    for (
        const key
        of arrayKeys
    ) {

        result[key] =
            Array.isArray(
                saved[key]
            )

                ? saved[key]

                : clone(
                    base[key]
                );

    }


    return result;

}


/* ==========================================================
   STORAGE LOAD
========================================================== */

function readStorage(
    key
) {

    try {

        return localStorage.getItem(
            key
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE MEMORY] Storage read failed:",
            error
        );

        return null;

    }

}


function load() {

    try {

        let raw =
            readStorage(
                STORAGE_KEY
            );


        if (!raw) {

            for (
                const legacyKey
                of LEGACY_STORAGE_KEYS
            ) {

                raw =
                    readStorage(
                        legacyKey
                    );

                if (raw) {
                    break;
                }

            }

        }


        if (!raw) {

            return clone(
                DEFAULT_MEMORY
            );

        }


        const parsed =
            JSON.parse(
                raw
            );


        return mergeMemory(
            DEFAULT_MEMORY,
            parsed
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE MEMORY] Load failed:",
            error
        );

        return clone(
            DEFAULT_MEMORY
        );

    }

}


/* ==========================================================
   STORAGE SAVE
========================================================== */

function save() {

    if (!memory) {
        return false;
    }


    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(
                memory
            )

        );

        return true;

    } catch (error) {

        console.warn(
            "[MR.SMILE MEMORY] Save failed:",
            error
        );

        return false;

    }

}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMemory() {

    if (initialized) {

        return memory;

    }


    memory =
        load();


    const timestamp =
        now();


    if (
        !memory.player.firstSeen
    ) {

        memory.player.firstSeen =
            timestamp;

    }


    memory.player.lastSeen =
        timestamp;


    memory.player.totalVisits =
        (
            Number(
                memory.player.totalVisits
            ) || 0
        ) + 1;


    memory.runtime =
        memory.runtime || {};


    memory.version =
        MEMORY_VERSION;


    initialized =
        true;


    save();


    console.log(
        "[MR.SMILE MEMORY] Unified memory initialized."
    );


    return memory;

}


/* ==========================================================
   GET MEMORY
========================================================== */

export function getMemory() {

    initMemory();

    return memory;

}


/* ==========================================================
   CONVERSATION DUPLICATE PROTECTION
========================================================== */

function isRecentConversationDuplicate(
    author,
    text
) {

    if (
        !memory ||
        !Array.isArray(
            memory.conversations
        )
    ) {

        return false;

    }


    const normalized =
        normalizeMessage(
            text
        );


    const timestamp =
        now();


    for (
        let i =
            memory.conversations.length - 1;

        i >= 0;

        i--
    ) {

        const entry =
            memory.conversations[i];


        if (!entry) {
            continue;
        }


        if (
            entry.author !==
            author
        ) {

            continue;

        }


        if (
            timestamp -
            Number(
                entry.timestamp
            ) >
            DUPLICATE_WINDOW_MS
        ) {

            break;

        }


        if (
            normalizeMessage(
                entry.text
            ) ===
            normalized
        ) {

            return true;

        }

    }


    return false;

}


/* ==========================================================
   OPERATOR MESSAGE
========================================================== */

export function rememberOperatorMessage(
    text,
    metadata = {}
) {

    initMemory();


    const message =
        normalizeMessage(
            text
        );


    if (!message) {
        return false;
    }


    /*
       IMPORTANT:

       chats.js may already have called this
       before dispatching MR.SMILE.

       Therefore this function is idempotent
       inside the duplicate window.
    */

    if (
        isRecentConversationDuplicate(
            "operator",
            message
        )
    ) {

        memory.runtime.lastOperatorRecordId =
            memory.conversations[
                memory.conversations.length - 1
            ]?.id || null;

        return false;

    }


    const timestamp =
        now();


    const record = {

        id:
            createRecordId(
                "operator"
            ),

        author:
            "operator",

        text:
            message,

        timestamp,

        source:
            metadata.source ||
            "chat",

        sequence:
            metadata.sequence ??
            null

    };


    pushLimited(
        memory.conversations,
        record
    );


    memory.player.totalMessages =
        (
            Number(
                memory.player.totalMessages
            ) || 0
        ) + 1;


    memory.player.lastMessage =
        message;


    memory.player.lastSeen =
        timestamp;


    if (
        looksLikeQuestion(
            message
        )
    ) {

        memory.player.lastQuestion =
            message;

    }


    memory.runtime.lastOperatorRecordId =
        record.id;


    memory.runtime.lastConversationTimestamp =
        timestamp;


    save();


    return true;

}


/* ==========================================================
   QUESTION DETECTION
========================================================== */

function looksLikeQuestion(
    text
) {

    const value =
        safeString(
            text
        );


    if (!value) {
        return false;
    }


    if (
        value.includes("?")
    ) {

        return true;

    }


    return /^(who|what|why|where|when|how|which|can|do|does|is|are|will|кто|что|почему|зачем|где|когда|как|можно|ты|вы|хто|що|чому|навіщо|де|коли|як)\b/i
        .test(
            value
        );

}


/* ==========================================================
   QUESTION MEMORY
========================================================== */

function findQuestionRecord(
    question
) {

    const normalized =
        normalizeQuestion(
            question
        );


    if (!normalized) {
        return null;
    }


    for (
        let i =
            memory.questionHistory.length - 1;

        i >= 0;

        i--
    ) {

        const entry =
            memory.questionHistory[i];


        if (
            entry &&
            entry.normalized ===
                normalized
        ) {

            return entry;

        }

    }


    return null;

}


/*
   This is the ONLY main question-history writer.

   Core should call:

       rememberQuestion(
           operatorText,
           intent,
           visibleResponse
       )

   exactly once after choosing the response.

   The function is itself protected against
   accidental same-event duplicates.
*/

export function rememberQuestion(
    question,
    intent = null,
    response = null,
    metadata = {}
) {

    initMemory();


    const text =
        safeString(
            question
        );


    if (!text) {
        return null;
    }


    const normalized =
        normalizeQuestion(
            text
        );


    if (!normalized) {
        return null;
    }


    const timestamp =
        now();


    let existing =
        findQuestionRecord(
            text
        );


    if (existing) {

        /*
           If the exact same response is being
           written again immediately, do NOT create
           another response-history entry.
        */

        const sameResponse =
            response &&
            existing.lastResponse ===
                response;


        const recent =
            timestamp -
            Number(
                existing.lastAsked
            ) <=
            DUPLICATE_WINDOW_MS;


        if (
            sameResponse &&
            recent
        ) {

            return {
                ...existing
            };

        }


        existing.count =
            (
                Number(
                    existing.count
                ) || 0
            ) + 1;


        existing.lastAsked =
            timestamp;


        if (intent) {

            existing.intent =
                intent;

        }


        if (response) {

            existing.lastResponse =
                response;


            if (
                !Array.isArray(
                    existing.responses
                )
            ) {

                existing.responses =
                    [];

            }


            if (
                !existing.responses.includes(
                    response
                )
            ) {

                pushLimited(
                    existing.responses,
                    response,
                    MAX_QUESTION_RESPONSES
                );

            }

        }


        if (metadata.language) {

            existing.lastLanguage =
                metadata.language;

        }


        if (metadata.responseId) {

            existing.lastResponseId =
                metadata.responseId;

        }

    } else {

        existing = {

            id:
                createRecordId(
                    "question"
                ),

            question:
                text,

            normalized,

            intent:
                intent || null,

            response:
                response || null,

            lastResponse:
                response || null,

            responses:
                response
                    ? [response]
                    : [],

            count:
                1,

            firstAsked:
                timestamp,

            lastAsked:
                timestamp,

            lastLanguage:
                metadata.language ||
                null,

            lastResponseId:
                metadata.responseId ||
                null

        };


        pushLimited(
            memory.questionHistory,
            existing
        );

    }


    memory.player.lastQuestion =
        text;


    memory.runtime.lastQuestionRecordId =
        existing.id;


    save();


    return {
        ...existing
    };

}


/* ==========================================================
   FIND PREVIOUS QUESTION
========================================================== */

export function findPreviousQuestion(
    question
) {

    initMemory();

    const entry =
        findQuestionRecord(
            question
        );


    return entry
        ? { ...entry }
        : null;

}


/* ==========================================================
   FIND PREVIOUS INTENT
========================================================== */

export function findPreviousIntent(
    intent
) {

    initMemory();


    if (!intent) {
        return null;
    }


    for (
        let i =
            memory.questionHistory.length - 1;

        i >= 0;

        i--
    ) {

        const entry =
            memory.questionHistory[i];


        if (
            entry &&
            entry.intent ===
                intent
        ) {

            return {
                ...entry
            };

        }

    }


    return null;

}


/* ==========================================================
   QUESTION REPEAT COUNT
========================================================== */

export function getQuestionRepeatCount(
    question
) {

    const entry =
        findPreviousQuestion(
            question
        );


    if (!entry) {
        return 0;
    }


    return Number(
        entry.count
    ) || 0;

}


/* ==========================================================
   LAST QUESTION
========================================================== */

export function getLastQuestionMemory() {

    initMemory();


    if (
        !memory.questionHistory.length
    ) {

        return null;

    }


    const entry =
        memory.questionHistory[
            memory.questionHistory.length - 1
        ];


    return entry
        ? { ...entry }
        : null;

}


/* ==========================================================
   RECENT CONVERSATION
========================================================== */

export function getRecentConversation(
    limit = 20
) {

    initMemory();


    const count =
        Math.max(
            1,
            Number(limit) || 20
        );


    return memory.conversations
        .slice(-count)
        .map(
            entry => ({
                ...entry
            })
        );

}


/* ==========================================================
   LAST OPERATOR MESSAGE
========================================================== */

export function getLastOperatorMessage() {

    initMemory();


    for (
        let i =
            memory.conversations.length - 1;

        i >= 0;

        i--
    ) {

        const entry =
            memory.conversations[i];


        if (
            entry &&
            entry.author ===
                "operator"
        ) {

            return {
                ...entry
            };

        }

    }


    return null;

}


/* ==========================================================
   LAST MR.SMILE MESSAGE
========================================================== */

export function getLastMrSmileMessage() {

    initMemory();


    for (
        let i =
            memory.conversations.length - 1;

        i >= 0;

        i--
    ) {

        const entry =
            memory.conversations[i];


        if (
            entry &&
            entry.author ===
                "mrsmile"
        ) {

            return {
                ...entry
            };

        }

    }


    return null;

}


/* ==========================================================
   MR.SMILE MESSAGE
========================================================== */

export function rememberMrSmileMessage(
    text,
    metadata = {}
) {

    initMemory();


    const message =
        normalizeMessage(
            text
        );


    if (!message) {
        return false;
    }


    /*
       A visible MR.SMILE response may only
       be stored once.

       If the same response is accidentally
       submitted twice by the chat layer,
       the second call is ignored.
    */

    if (
        isRecentConversationDuplicate(
            "mrsmile",
            message
        )
    ) {

        memory.runtime.lastMrSmileRecordId =
            memory.conversations[
                memory.conversations.length - 1
            ]?.id || null;

        return false;

    }


    const timestamp =
        now();


    const record = {

        id:
            createRecordId(
                "mrsmile"
            ),

        author:
            "mrsmile",

        text:
            message,

        timestamp,

        source:
            metadata.source ||
            "core",

        language:
            metadata.language ||
            null,

        intent:
            metadata.intent ||
            null,

        responseId:
            metadata.responseId ||
            null

    };


    pushLimited(
        memory.conversations,
        record
    );


    memory.history.visibleReactions +=
        1;


    memory.runtime.lastMrSmileRecordId =
        record.id;


    memory.runtime.lastConversationTimestamp =
        timestamp;


    save();


    return true;

}


/* ==========================================================
   FILE MEMORY
========================================================== */

export function rememberFile(
    path,
    metadata = {}
) {

    initMemory();


    const value =
        safeString(
            path
        );


    if (!value) {
        return false;
    }


    const timestamp =
        now();


    const record = {

        id:
            createRecordId(
                "file"
            ),

        path:
            value,

        name:
            metadata.name ||
            value
                .split("/")
                .pop() ||
            value,

        source:
            metadata.source ||
            "system",

        timestamp

    };


    pushLimited(
        memory.openedFiles,
        record
    );


    const lower =
        value.toLowerCase();


    if (
        lower.includes(
            "mrsmile"
        )
    ) {

        memory.flags.knowsSmile =
            true;


        memory.behavior.curiosity =
            clamp(
                memory.behavior.curiosity +
                8
            );


        memory.counters.secretReads +=
            1;

    }


    if (
        lower.includes(
            "mirror"
        )
    ) {

        memory.flags.knowsOmega =
            true;


        memory.behavior.curiosity =
            clamp(
                memory.behavior.curiosity +
                5
            );

    }


    save();


    return true;

}


/* ==========================================================
   COMMAND MEMORY
========================================================== */

export function rememberCommand(
    command,
    metadata = {}
) {

    initMemory();


    const value =
        safeString(
            command
        );


    if (!value) {
        return false;
    }


    memory.counters.consoleCommands +=
        1;


    pushLimited(
        memory.commands,
        {

            id:
                createRecordId(
                    "command"
                ),

            command:
                value,

            source:
                metadata.source ||
                "console",

            allowed:
                metadata.allowed !==
                false,

            timestamp:
                now()

        }
    );


    const lower =
        value.toLowerCase();


    const sensitive = [

        "sys_00",
        "restricted",
        "delete",
        "terminate",
        "shutdown",
        "wipe",
        "override"

    ];


    if (
        sensitive.some(
            keyword =>
                lower.includes(
                    keyword
                )
        )
    ) {

        memory.behavior.suspicion =
            clamp(
                memory.behavior.suspicion +
                6
            );

    }


    save();


    return true;

}


/* ==========================================================
   PAGE MEMORY
========================================================== */

export function rememberPage(
    page,
    metadata = {}
) {

    initMemory();


    const value =
        safeString(
            page
        );


    if (!value) {
        return false;
    }


    pushLimited(
        memory.visitedPages,
        {

            id:
                createRecordId(
                    "page"
                ),

            page:
                value,

            source:
                metadata.source ||
                "system",

            timestamp:
                now()

        }
    );


    save();


    return true;

}


/* ==========================================================
   CONTEXT MEMORY
========================================================== */

export function rememberContext(
    context
) {

    initMemory();


    if (
        !context ||
        typeof context !==
            "object"
    ) {

        return false;

    }


    const entry = {

        id:
            createRecordId(
                "context"
            ),

        type:
            context.type ||
            "unknown",

        target:
            context.target ??
            null,

        source:
            context.source ||
            "unknown",

        importance:
            Number(
                context.importance
            ) || 0,

        significant:
            context.significant ===
            true,

        timestamp:
            context.timestamp ||
            now()

    };


    pushLimited(
        memory.contexts,
        entry
    );


    if (
        entry.significant
    ) {

        memory.counters.meaningfulActions +=
            1;


        memory.behavior.lastImportantAction =
            entry.type;


        memory.behavior.lastImportantTarget =
            entry.target;


        pushLimited(
            memory.importantEvents,
            entry
        );

    } else {

        memory.history.silentObservations +=
            1;

    }


    save();


    return true;

}


/* ==========================================================
   DECISION MEMORY
========================================================== */

export function rememberDecision(
    decision
) {

    initMemory();


    if (
        !decision ||
        typeof decision !==
            "object"
    ) {

        return false;

    }


    memory.behavior.lastIntent =
        decision.intent ||
        null;


    pushLimited(
        memory.decisions,
        {

            id:
                createRecordId(
                    "decision"
                ),

            action:
                decision.action ||
                null,

            intent:
                decision.intent ||
                null,

            target:
                decision.target ??
                null,

            reason:
                decision.reason ||
                null,

            timestamp:
                now()

        }
    );


    save();


    return true;

}


/* ==========================================================
   ACTION MEMORY
========================================================== */

export function rememberAction(
    action
) {

    initMemory();


    if (
        !action ||
        typeof action !==
            "object"
    ) {

        return false;

    }


    pushLimited(
        memory.actions,
        {

            id:
                createRecordId(
                    "action"
                ),

            action:
                action.action ||
                null,

            intent:
                action.intent ||
                null,

            target:
                action.target ??
                null,

            timestamp:
                now()

        }
    );


    if (
        [
            "interfere",
            "block",
            "sabotage"
        ].includes(
            action.action
        )
    ) {

        memory.counters.interventions +=
            1;

    }


    save();


    return true;

}


/* ==========================================================
   EVENT MEMORY
========================================================== */

export function rememberEvent(
    type,
    data = null,
    important = false
) {

    initMemory();


    const entry = {

        id:
            createRecordId(
                "event"
            ),

        type:
            safeString(
                type
            ) ||
            "unknown",

        data,

        important:
            Boolean(
                important
            ),

        timestamp:
            now()

    };


    pushLimited(
        memory.events,
        entry
    );


    if (
        important
    ) {

        pushLimited(
            memory.importantEvents,
            entry
        );

    }


    save();


    return true;

}


/* ==========================================================
   MEMORY FLAGS
========================================================== */

export function setMemoryFlag(
    flag,
    value = true
) {

    initMemory();


    if (
        !Object.prototype.hasOwnProperty.call(
            memory.flags,
            flag
        )
    ) {

        return false;

    }


    memory.flags[flag] =
        Boolean(
            value
        );


    save();


    return true;

}


export function hasMemoryFlag(
    flag
) {

    initMemory();


    return (
        memory.flags[flag] ===
        true
    );

}


/* ==========================================================
   BEHAVIOR METRICS
========================================================== */

export function changeBehaviorMetric(
    metric,
    amount
) {

    initMemory();


    if (
        !Object.prototype.hasOwnProperty.call(
            memory.behavior,
            metric
        )
    ) {

        return false;

    }


    const value =
        Number(
            amount
        );


    if (
        !Number.isFinite(
            value
        )
    ) {

        return false;

    }


    memory.behavior[metric] =
        clamp(

            Number(
                memory.behavior[metric]
            ) +

            value

        );


    save();


    return true;

}


/* ==========================================================
   PATIENCE
========================================================== */

export function changePatience(
    amount
) {

    initMemory();


    const value =
        Number(
            amount
        );


    memory.behavior.patience =
        clamp(

            Number(
                memory.behavior.patience
            ) +

            (
                Number.isFinite(
                    value
                )
                    ? value
                    : 0
            )

        );


    save();


    return memory.behavior.patience;

}


/* ==========================================================
   QUESTION CATALOG STORAGE
========================================================== */

function loadQuestionMemory() {

    try {

        let raw =
            readStorage(
                QUESTION_MEMORY_STORAGE_KEY
            );


        if (!raw) {

            for (
                const legacyKey
                of LEGACY_QUESTION_MEMORY_KEYS
            ) {

                raw =
                    readStorage(
                        legacyKey
                    );

                if (raw) {
                    break;
                }

            }

        }


        if (!raw) {

            return {

                version:
                    QUESTION_MEMORY_VERSION,

                questions:
                    {}

            };

        }


        const parsed =
            JSON.parse(
                raw
            );


        if (
            !parsed ||
            typeof parsed !==
                "object"
        ) {

            return {

                version:
                    QUESTION_MEMORY_VERSION,

                questions:
                    {}

            };

        }


        if (
            !parsed.questions ||
            typeof parsed.questions !==
                "object"
        ) {

            parsed.questions =
                {};

        }


        parsed.version =
            QUESTION_MEMORY_VERSION;


        return parsed;

    } catch (error) {

        console.warn(
            "[MR.SMILE QUESTION MEMORY] Load failed:",
            error
        );


        return {

            version:
                QUESTION_MEMORY_VERSION,

            questions:
                {}

        };

    }

}


function saveQuestionMemory(
    questionMemory
) {

    try {

        localStorage.setItem(

            QUESTION_MEMORY_STORAGE_KEY,

            JSON.stringify(
                questionMemory
            )

        );


        return true;

    } catch (error) {

        console.warn(
            "[MR.SMILE QUESTION MEMORY] Save failed:",
            error
        );


        return false;

    }

}


/* ==========================================================
   CATALOG ACCESS
========================================================== */

export function getQuestionCatalog() {

    return QUESTION_CATALOG.map(
        entry => ({
            ...entry
        })
    );

}


/* ==========================================================
   REMEMBER CATALOG QUESTION
========================================================== */

export function rememberCatalogQuestion(
    question
) {

    const text =
        safeString(
            question
        );


    if (!text) {
        return null;
    }


    const normalized =
        normalizeQuestion(
            text
        );


    if (!normalized) {
        return null;
    }


    const catalogEntry =
        QUESTION_CATALOG.find(
            entry =>
                normalizeQuestion(
                    entry.question
                ) ===
                normalized
        );


    if (!catalogEntry) {
        return null;
    }


    const questionMemory =
        loadQuestionMemory();


    const timestamp =
        now();


    const existing =
        questionMemory.questions[
            catalogEntry.id
        ];


    if (existing) {

        existing.count =
            (
                Number(
                    existing.count
                ) || 0
            ) + 1;


        existing.lastAsked =
            timestamp;

    } else {

        questionMemory.questions[
            catalogEntry.id
        ] = {

            id:
                catalogEntry.id,

            question:
                catalogEntry.question,

            count:
                1,

            firstAsked:
                timestamp,

            lastAsked:
                timestamp

        };

    }


    saveQuestionMemory(
        questionMemory
    );


    return {

        ...questionMemory.questions[
            catalogEntry.id
        ]

    };

}


/* ==========================================================
   CATALOG QUESTION CHECK
========================================================== */

export function isCatalogQuestionAsked(
    questionOrId
) {

    const value =
        safeString(
            questionOrId
        );


    if (!value) {
        return false;
    }


    const questionMemory =
        loadQuestionMemory();


    const catalogEntry =
        QUESTION_CATALOG.find(

            entry =>

                entry.id ===
                    value ||

                normalizeQuestion(
                    entry.question
                ) ===
                    normalizeQuestion(
                        value
                    )

        );


    if (!catalogEntry) {
        return false;
    }


    return Boolean(
        questionMemory.questions[
            catalogEntry.id
        ]
    );

}


/* ==========================================================
   ASKED QUESTIONS
========================================================== */

export function getAskedQuestions() {

    const questionMemory =
        loadQuestionMemory();


    return QUESTION_CATALOG

        .filter(
            entry =>
                questionMemory.questions[
                    entry.id
                ]
        )

        .map(
            entry => ({

                ...entry,

                memory: {

                    ...questionMemory.questions[
                        entry.id
                    ]

                }

            })
        );

}


/* ==========================================================
   UNASKED QUESTIONS
========================================================== */

export function getUnaskedQuestions() {

    const questionMemory =
        loadQuestionMemory();


    return QUESTION_CATALOG

        .filter(
            entry =>
                !questionMemory.questions[
                    entry.id
                ]
        )

        .map(
            entry => ({
                ...entry
            })
        );

}


/* ==========================================================
   QUESTION MEMORY STATUS
========================================================== */

export function getQuestionMemoryStatus() {

    const questionMemory =
        loadQuestionMemory();


    const asked =
        getAskedQuestions();


    const unasked =
        getUnaskedQuestions();


    let totalAskedCount =
        0;


    for (
        const entry
        of asked
    ) {

        totalAskedCount +=
            Number(
                entry.memory.count
            ) || 0;

    }


    return {

        version:
            QUESTION_MEMORY_VERSION,

        total:
            QUESTION_CATALOG.length,

        asked:
            asked.length,

        unasked:
            unasked.length,

        completion:
            QUESTION_CATALOG.length

                ? Math.round(

                    (
                        asked.length /
                        QUESTION_CATALOG.length
                    ) *

                    100

                )

                : 0,

        totalAskedCount,

        questions:
            asked

    };

}


/* ==========================================================
   CLEAR QUESTION CATALOG
========================================================== */

export function clearQuestionMemory() {

    try {

        localStorage.removeItem(
            QUESTION_MEMORY_STORAGE_KEY
        );


        for (
            const legacyKey
            of LEGACY_QUESTION_MEMORY_KEYS
        ) {

            localStorage.removeItem(
                legacyKey
            );

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE QUESTION MEMORY] Clear failed:",
            error
        );

    }


    return true;

}


/* ==========================================================
   MEMORY STATUS
========================================================== */

export function getMemoryStatus() {

    initMemory();


    return {

        initialized,

        version:
            memory.version,

        messages:
            memory.player.totalMessages,

        visits:
            memory.player.totalVisits,

        conversations:
            memory.conversations.length,

        questions:
            memory.questionHistory.length,

        files:
            memory.openedFiles.length,

        pages:
            memory.visitedPages.length,

        contexts:
            memory.contexts.length,

        decisions:
            memory.decisions.length,

        actions:
            memory.actions.length,

        events:
            memory.events.length,

        meaningfulActions:
            memory.counters.meaningfulActions,

        curiosity:
            memory.behavior.curiosity,

        attention:
            memory.behavior.attention,

        suspicion:
            memory.behavior.suspicion,

        patience:
            memory.behavior.patience,

        lastIntent:
            memory.behavior.lastIntent,

        lastImportantAction:
            memory.behavior.lastImportantAction,

        lastImportantTarget:
            memory.behavior.lastImportantTarget,

        lastOperatorMessage:
            memory.player.lastMessage,

        lastQuestion:
            memory.player.lastQuestion,

        flags:
            {
                ...memory.flags
            },

        runtime:
            {
                ...memory.runtime
            }

    };

}


/* ==========================================================
   RESET
========================================================== */

export function resetMemory() {

    memory =
        clone(
            DEFAULT_MEMORY
        );


    const timestamp =
        now();


    memory.version =
        MEMORY_VERSION;


    memory.player.firstSeen =
        timestamp;


    memory.player.lastSeen =
        timestamp;


    memory.player.totalVisits =
        1;


    initialized =
        true;


    save();


    clearQuestionMemory();


    console.log(
        "[MR.SMILE MEMORY] Unified memory reset."
    );


    return true;

}


/* ==========================================================
   GLOBAL API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_MEMORY = {

        init:
            initMemory,

        get:
            getMemory,

        status:
            getMemoryStatus,

        reset:
            resetMemory,

        normalizeQuestion:
            normalizeQuestion,

        rememberOperatorMessage:
            rememberOperatorMessage,

        rememberMrSmileMessage:
            rememberMrSmileMessage,

        rememberQuestion:
            rememberQuestion,

        findPreviousQuestion:
            findPreviousQuestion,

        getQuestionRepeatCount:
            getQuestionRepeatCount,

        getLastQuestionMemory:
            getLastQuestionMemory,

        getRecentConversation:
            getRecentConversation,

        getLastOperatorMessage:
            getLastOperatorMessage,

        getLastMrSmileMessage:
            getLastMrSmileMessage,

        getQuestionCatalog:
            getQuestionCatalog,

        getQuestionMemoryStatus:
            getQuestionMemoryStatus,

        getAskedQuestions:
            getAskedQuestions,

        getUnaskedQuestions:
            getUnaskedQuestions

    };

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default {

    initMemory,

    getMemory,

    rememberOperatorMessage,

    rememberMrSmileMessage,

    rememberQuestion,

    findPreviousQuestion,

    findPreviousIntent,

    getQuestionRepeatCount,

    getLastQuestionMemory,

    getRecentConversation,

    getLastOperatorMessage,

    getLastMrSmileMessage,

    getQuestionCatalog,

    rememberCatalogQuestion,

    isCatalogQuestionAsked,

    getAskedQuestions,

    getUnaskedQuestions,

    getQuestionMemoryStatus,

    clearQuestionMemory,

    rememberFile,

    rememberCommand,

    rememberPage,

    rememberContext,

    rememberDecision,

    rememberAction,

    rememberEvent,

    setMemoryFlag,

    hasMemoryFlag,

    changeBehaviorMetric,

    changePatience,

    getMemoryStatus,

    resetMemory,

    normalizeQuestion

};

