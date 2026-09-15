/* ==========================================================
   MR.SMILE MEMORY — UNIFIED MEMORY SYSTEM
   OMEGA / MIRROR-INT

   RESPONSIBILITY
   ----------------------------------------------------------
   THIS MODULE IS STORAGE ONLY.

   It does NOT:
   - generate dialogue
   - choose responses
   - generate personality
   - dispatch chat events
   - call MR.SMILE Core
   - create visible messages

   It DOES:
   - store operator messages
   - store MR.SMILE messages
   - store questions / responses
   - detect repeated questions
   - remember files / pages / commands
   - remember actions / decisions / events
   - maintain behavioral memory
   - maintain Q001-Q100 verification memory
   - prevent accidental duplicate records
   - provide one stable memory API

   ARCHITECTURE

       chats.js
           ↓
       mrsmileChat.js
           ↓
       mrsmileDialogue.js
           ↓
       mrsmileCore.js
           ↓
       mrsmileMemory.js
           ↓
       localStorage

   IMPORTANT

   Memory is passive.

   It remembers what happened.
   It never decides what MR.SMILE should say.

========================================================== */


/* ==========================================================
   STORAGE CONSTANTS
========================================================== */

const STORAGE_KEY =
    "mrsmile_memory_v7";

const LEGACY_STORAGE_KEYS = [
    "mrsmile_memory_v6",
    "mrsmile_memory_v5",
    "mrsmile_memory_v4"
];

const QUESTION_MEMORY_STORAGE_KEY =
    "mrsmile_question_memory_v3";

const LEGACY_QUESTION_MEMORY_KEYS = [
    "mrsmile_question_memory_v2",
    "mrsmile_question_memory_v1"
];

const MEMORY_VERSION =
    7;

const QUESTION_MEMORY_VERSION =
    3;

const MAX_HISTORY =
    180;

const MAX_QUESTION_HISTORY =
    180;

const MAX_QUESTION_RESPONSES =
    12;

const MAX_FILES =
    180;

const MAX_COMMANDS =
    180;

const MAX_PAGES =
    180;

const MAX_CONTEXTS =
    180;

const MAX_DECISIONS =
    180;

const MAX_ACTIONS =
    180;

const MAX_EVENTS =
    240;

const MAX_IMPORTANT_EVENTS =
    120;


/*
 * Used only to reject accidental duplicate delivery
 * of the exact same event.
 *
 * This does NOT prevent a real repeated question
 * after the window has passed.
 */
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


    conversations: [],


    questionHistory: [],


    openedFiles: [],


    commands: [],


    visitedPages: [],


    contexts: [],


    decisions: [],


    actions: [],


    events: [],


    importantEvents: [],


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
            0,

        lastActionRecordId:
            null,

        lastEventRecordId:
            null,

        lastFileRecordId:
            null,

        lastPageRecordId:
            null,

        lastCommandRecordId:
            null

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

    try {
        return JSON.parse(
            JSON.stringify(value)
        );
    } catch {
        return null;
    }

}


function safeString(value) {

    return String(
        value ?? ""
    ).trim();

}


function now() {

    return Date.now();

}


function createRecordId(
    prefix = "memory"
) {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );

}


function clamp(value) {

    const number =
        Number(value);

    if (
        !Number.isFinite(
            number
        )
    ) {

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


function pushLimited(
    array,
    item,
    limit = MAX_HISTORY
) {

    if (
        !Array.isArray(
            array
        )
    ) {

        return;

    }

    array.push(
        item
    );

    while (
        array.length >
        limit
    ) {

        array.shift();

    }

}


function safeMetadata(
    metadata
) {

    return (
        metadata &&
        typeof metadata ===
            "object"
            ? metadata
            : {}
    );

}


/* ==========================================================
   NORMALIZATION
========================================================== */

export function normalizeQuestion(
    text
) {

    return safeString(
        text
    )

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

    return safeString(
        text
    )
        .normalize("NFKC");

}


function normalizeIdentifier(
    value
) {

    return safeString(
        value
    )
        .normalize("NFKC")
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* ==========================================================
   STORAGE HELPERS
========================================================== */

function storageAvailable() {

    try {

        return (
            typeof localStorage !==
            "undefined"
        );

    } catch {

        return false;

    }

}


function readStorage(
    key
) {

    if (
        !storageAvailable()
    ) {

        return null;

    }

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


function writeStorage(
    key,
    value
) {

    if (
        !storageAvailable()
    ) {

        return false;

    }

    try {

        localStorage.setItem(
            key,
            value
        );

        return true;

    } catch (error) {

        console.warn(
            "[MR.SMILE MEMORY] Storage write failed:",
            error
        );

        return false;

    }

}


/* ==========================================================
   MEMORY MERGE
========================================================== */

function mergeMemory(
    base,
    saved
) {

    if (
        !saved ||
        typeof saved !==
            "object"
    ) {

        return clone(
            base
        );

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

        const baseValue =
            base[key];

        const savedValue =
            saved[key];


        result[key] = {

            ...(
                baseValue &&
                typeof baseValue ===
                    "object"

                    ? clone(
                        baseValue
                    )

                    : {}
            ),

            ...(
                savedValue &&
                typeof savedValue ===
                    "object"

                    ? savedValue

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


    /*
     * Defensive repair.
     * Old versions may contain malformed values.
     */

    if (
        !Array.isArray(
            result.conversations
        )
    ) {
        result.conversations = [];
    }

    if (
        !Array.isArray(
            result.questionHistory
        )
    ) {
        result.questionHistory = [];
    }

    if (
        !Array.isArray(
            result.openedFiles
        )
    ) {
        result.openedFiles = [];
    }

    if (
        !Array.isArray(
            result.commands
        )
    ) {
        result.commands = [];
    }

    if (
        !Array.isArray(
            result.visitedPages
        )
    ) {
        result.visitedPages = [];
    }

    if (
        !Array.isArray(
            result.contexts
        )
    ) {
        result.contexts = [];
    }

    if (
        !Array.isArray(
            result.decisions
        )
    ) {
        result.decisions = [];
    }

    if (
        !Array.isArray(
            result.actions
        )
    ) {
        result.actions = [];
    }

    if (
        !Array.isArray(
            result.events
        )
    ) {
        result.events = [];
    }

    if (
        !Array.isArray(
            result.importantEvents
        )
    ) {
        result.importantEvents = [];
    }


    return result;

}


/* ==========================================================
   LOAD MAIN MEMORY
========================================================== */

function load() {

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


    try {

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
            "[MR.SMILE MEMORY] Main memory parse failed:",
            error
        );


        return clone(
            DEFAULT_MEMORY
        );

    }

}


/* ==========================================================
   SAVE MAIN MEMORY
========================================================== */

function save() {

    if (!memory) {
        return false;
    }


    try {

        return writeStorage(

            STORAGE_KEY,

            JSON.stringify(
                memory
            )

        );

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

    if (
        initialized &&
        memory
    ) {

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
        Math.max(
            1,
            Number(
                memory.player.totalVisits
            ) || 0
        ) + 1;


    memory.version =
        MEMORY_VERSION;


    if (
        !memory.runtime ||
        typeof memory.runtime !==
            "object"
    ) {

        memory.runtime = {};

    }


    initialized =
        true;


    save();


    console.log(
        "[MR.SMILE MEMORY] Unified memory initialized. Version:",
        MEMORY_VERSION
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
   FIND LAST AUTHOR RECORD
========================================================== */

function findLastConversationByAuthor(
    author
) {

    if (
        !memory ||
        !Array.isArray(
            memory.conversations
        )
    ) {

        return null;

    }


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
                author
        ) {

            return entry;

        }

    }


    return null;

}


/* ==========================================================
   CONVERSATION DUPLICATE CHECK
========================================================== */

function isRecentConversationDuplicate(
    author,
    text,
    metadata = {}
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


    const eventId =
        safeString(
            metadata.eventId
        );


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


        const age =
            timestamp -
            Number(
                entry.timestamp
            );


        if (
            age >
            DUPLICATE_WINDOW_MS
        ) {

            break;

        }


        /*
         * Strongest duplicate key:
         * exact event ID.
         */

        if (
            eventId &&
            entry.eventId &&
            eventId ===
                entry.eventId
        ) {

            return true;

        }


        /*
         * Fallback:
         * same author + same text
         * in duplicate window.
         */

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


    const meta =
        safeMetadata(
            metadata
        );


    if (
        isRecentConversationDuplicate(
            "operator",
            message,
            meta
        )
    ) {

        const last =
            findLastConversationByAuthor(
                "operator"
            );


        memory.runtime.lastOperatorRecordId =
            last?.id ||
            memory.runtime.lastOperatorRecordId ||
            null;


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
            meta.source ||
            "chat",

        sequence:
            meta.sequence ??
            null,

        eventId:
            meta.eventId ||
            null,

        language:
            meta.language ||
            null

    };


    pushLimited(
        memory.conversations,
        record,
        MAX_HISTORY
    );


    memory.player.totalMessages =
        Math.max(
            0,
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
   FIND QUESTION RECORD INTERNAL
========================================================== */

function findQuestionRecord(
    question
) {

    if (
        !memory ||
        !Array.isArray(
            memory.questionHistory
        )
    ) {

        return null;

    }


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


/* ==========================================================
   QUESTION MEMORY
========================================================== */

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


    const meta =
        safeMetadata(
            metadata
        );


    const timestamp =
        now();


    let existing =
        findQuestionRecord(
            text
        );


    if (existing) {

        const previousTimestamp =
            Number(
                existing.lastAsked
            ) || 0;


        const isRecent =
            timestamp -
            previousTimestamp <=
            DUPLICATE_WINDOW_MS;


        const sameResponse =
            response !== null &&
            response !== undefined &&
            safeString(
                response
            ) ===
            safeString(
                existing.lastResponse
            );


        const sameResponseId =
            meta.responseId &&
            existing.lastResponseId &&
            meta.responseId ===
            existing.lastResponseId;


        /*
         * Exact duplicate of the same processing event.
         */
        if (
            isRecent &&
            (
                sameResponse ||
                sameResponseId
            )
        ) {

            memory.runtime.lastQuestionRecordId =
                existing.id;


            return {
                ...existing,
                responses:
                    Array.isArray(
                        existing.responses
                    )
                        ? [
                            ...existing.responses
                        ]
                        : []
            };

        }


        /*
         * Genuine repeated question.
         */

        existing.count =
            Math.max(
                0,
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


        if (
            response !== null &&
            response !== undefined &&
            safeString(
                response
            )
        ) {

            const visibleResponse =
                safeString(
                    response
                );


            existing.lastResponse =
                visibleResponse;


            if (
                !Array.isArray(
                    existing.responses
                )
            ) {

                existing.responses =
                    [];

            }


            /*
             * We keep a response history,
             * but do not store the same response
             * twice.
             */

            if (
                !existing.responses.includes(
                    visibleResponse
                )
            ) {

                pushLimited(
                    existing.responses,
                    visibleResponse,
                    MAX_QUESTION_RESPONSES
                );

            }

        }


        if (
            meta.language
        ) {

            existing.lastLanguage =
                meta.language;

        }


        if (
            meta.responseId
        ) {

            existing.lastResponseId =
                meta.responseId;

        }


        existing.lastIntent =
            intent ||
            existing.intent ||
            null;


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
                intent ||
                null,

            response:
                response !== null &&
                response !== undefined
                    ? safeString(
                        response
                    )
                    : null,

            lastResponse:
                response !== null &&
                response !== undefined
                    ? safeString(
                        response
                    )
                    : null,

            responses:
                (
                    response !== null &&
                    response !== undefined &&
                    safeString(
                        response
                    )
                )
                    ? [
                        safeString(
                            response
                        )
                    ]
                    : [],

            count:
                1,

            firstAsked:
                timestamp,

            lastAsked:
                timestamp,

            lastLanguage:
                meta.language ||
                null,

            lastResponseId:
                meta.responseId ||
                null,

            lastIntent:
                intent ||
                null

        };


        pushLimited(
            memory.questionHistory,
            existing,
            MAX_QUESTION_HISTORY
        );

    }


    memory.player.lastQuestion =
        text;


    memory.runtime.lastQuestionRecordId =
        existing.id;


    save();


    return {
        ...existing,

        responses:
            Array.isArray(
                existing.responses
            )
                ? [
                    ...existing.responses
                ]
                : []
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


    if (!entry) {
        return null;
    }


    return {

        ...entry,

        responses:
            Array.isArray(
                entry.responses
            )
                ? [
                    ...entry.responses
                ]
                : []

    };

}


/* ==========================================================
   FIND PREVIOUS INTENT
========================================================== */

export function findPreviousIntent(
    intent
) {

    initMemory();


    const value =
        safeString(
            intent
        );


    if (!value) {
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
            (
                entry.intent ===
                    value ||

                entry.lastIntent ===
                    value
            )
        ) {

            return {
                ...entry,

                responses:
                    Array.isArray(
                        entry.responses
                    )
                        ? [
                            ...entry.responses
                        ]
                        : []
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


    return Math.max(
        0,
        Number(
            entry.count
        ) || 0
    );

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


    if (!entry) {
        return null;
    }


    return {

        ...entry,

        responses:
            Array.isArray(
                entry.responses
            )
                ? [
                    ...entry.responses
                ]
                : []

    };

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


    const entry =
        findLastConversationByAuthor(
            "operator"
        );


    return entry
        ? { ...entry }
        : null;

}


/* ==========================================================
   LAST MR.SMILE MESSAGE
========================================================== */

export function getLastMrSmileMessage() {

    initMemory();


    const entry =
        findLastConversationByAuthor(
            "mrsmile"
        );


    return entry
        ? { ...entry }
        : null;

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


    const meta =
        safeMetadata(
            metadata
        );


    /*
     * One visible response must become one memory record.
     */

    if (
        isRecentConversationDuplicate(
            "mrsmile",
            message,
            meta
        )
    ) {

        const last =
            findLastConversationByAuthor(
                "mrsmile"
            );


        memory.runtime.lastMrSmileRecordId =
            last?.id ||
            memory.runtime.lastMrSmileRecordId ||
            null;


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
            meta.source ||
            "core",

        language:
            meta.language ||
            null,

        intent:
            meta.intent ||
            null,

        responseId:
            meta.responseId ||
            null,

        sequence:
            meta.sequence ??
            null

    };


    pushLimited(
        memory.conversations,
        record,
        MAX_HISTORY
    );


    memory.history.visibleReactions =
        Math.max(
            0,
            Number(
                memory.history.visibleReactions
            ) || 0
        ) + 1;


    memory.runtime.lastMrSmileRecordId =
        record.id;


    memory.runtime.lastConversationTimestamp =
        timestamp;


    save();


    return true;

}


/* ==========================================================
   GENERIC RECENT RECORD DUPLICATE CHECK
========================================================== */

function isRecentRecordDuplicate(
    array,
    predicate
) {

    if (
        !Array.isArray(
            array
        )
    ) {

        return false;

    }


    const timestamp =
        now();


    for (
        let i =
            array.length - 1;

        i >= 0;

        i--
    ) {

        const entry =
            array[i];


        if (!entry) {
            continue;
        }


        const age =
            timestamp -
            Number(
                entry.timestamp
            );


        if (
            age >
            DUPLICATE_WINDOW_MS
        ) {

            break;

        }


        if (
            predicate(
                entry
            )
        ) {

            return true;

        }

    }


    return false;

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


    const meta =
        safeMetadata(
            metadata
        );


    const normalized =
        normalizeIdentifier(
            value
        );


    if (
        isRecentRecordDuplicate(
            memory.openedFiles,
            entry =>
                normalizeIdentifier(
                    entry.path
                ) === normalized &&

                (
                    meta.eventId &&
                    entry.eventId
                        ? meta.eventId ===
                            entry.eventId
                        : true
                )
        )
    ) {

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
            safeString(
                meta.name
            ) ||
            value
                .split("/")
                .pop() ||
            value,

        source:
            meta.source ||
            "system",

        eventId:
            meta.eventId ||
            null,

        timestamp

    };


    pushLimited(
        memory.openedFiles,
        record,
        MAX_FILES
    );


    memory.runtime.lastFileRecordId =
        record.id;


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


        memory.counters.secretReads =
            Math.max(
                0,
                Number(
                    memory.counters.secretReads
                ) || 0
            ) + 1;

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


    const meta =
        safeMetadata(
            metadata
        );


    if (
        isRecentRecordDuplicate(
            memory.commands,
            entry =>
                normalizeIdentifier(
                    entry.command
                ) ===
                normalizeIdentifier(
                    value
                ) &&
                (
                    meta.eventId &&
                    entry.eventId
                        ? meta.eventId ===
                            entry.eventId
                        : true
                )
        )
    ) {

        return false;

    }


    const timestamp =
        now();


    const allowed =
        meta.allowed !==
        false;


    const record = {

        id:
            createRecordId(
                "command"
            ),

        command:
            value,

        source:
            meta.source ||
            "console",

        allowed,

        eventId:
            meta.eventId ||
            null,

        timestamp

    };


    pushLimited(
        memory.commands,
        record,
        MAX_COMMANDS
    );


    memory.runtime.lastCommandRecordId =
        record.id;


    memory.counters.consoleCommands =
        Math.max(
            0,
            Number(
                memory.counters.consoleCommands
            ) || 0
        ) + 1;


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


    const meta =
        safeMetadata(
            metadata
        );


    if (
        isRecentRecordDuplicate(
            memory.visitedPages,
            entry =>
                normalizeIdentifier(
                    entry.page
                ) ===
                normalizeIdentifier(
                    value
                ) &&
                (
                    meta.eventId &&
                    entry.eventId
                        ? meta.eventId ===
                            entry.eventId
                        : true
                )
        )
    ) {

        return false;

    }


    const record = {

        id:
            createRecordId(
                "page"
            ),

        page:
            value,

        source:
            meta.source ||
            "system",

        eventId:
            meta.eventId ||
            null,

        timestamp:
            now()

    };


    pushLimited(
        memory.visitedPages,
        record,
        MAX_PAGES
    );


    memory.runtime.lastPageRecordId =
        record.id;


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


    const timestamp =
        Number(
            context.timestamp
        ) ||
        now();


    const type =
        safeString(
            context.type
        ) ||
        "unknown";


    const target =
        context.target ??
        null;


    const source =
        safeString(
            context.source
        ) ||
        "unknown";


    const importance =
        Number(
            context.importance
        ) || 0;


    const significant =
        context.significant ===
        true;


    const eventId =
        safeString(
            context.eventId
        ) ||
        null;


    if (
        isRecentRecordDuplicate(
            memory.contexts,
            entry =>
                (
                    eventId &&
                    entry.eventId
                        ? eventId ===
                            entry.eventId
                        : (
                            entry.type ===
                                type &&

                            String(
                                entry.target ?? ""
                            ) ===
                            String(
                                target ?? ""
                            )
                        )
                )
        )
    ) {

        return false;

    }


    const entry = {

        id:
            createRecordId(
                "context"
            ),

        type,

        target,

        source,

        importance,

        significant,

        eventId,

        timestamp

    };


    pushLimited(
        memory.contexts,
        entry,
        MAX_CONTEXTS
    );


    if (
        significant
    ) {

        memory.counters.meaningfulActions =
            Math.max(
                0,
                Number(
                    memory.counters.meaningfulActions
                ) || 0
            ) + 1;


        memory.behavior.lastImportantAction =
            type;


        memory.behavior.lastImportantTarget =
            target;


        pushLimited(
            memory.importantEvents,
            entry,
            MAX_IMPORTANT_EVENTS
        );

    } else {

        memory.history.silentObservations =
            Math.max(
                0,
                Number(
                    memory.history.silentObservations
                ) || 0
            ) + 1;

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


    const record = {

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

        eventId:
            decision.eventId ||
            null,

        timestamp:
            now()

    };


    /*
     * Avoid accidental duplicate decision events.
     */

    if (
        isRecentRecordDuplicate(
            memory.decisions,
            entry =>
                decision.eventId &&
                entry.eventId &&
                decision.eventId ===
                entry.eventId
        )
    ) {

        return false;

    }


    pushLimited(
        memory.decisions,
        record,
        MAX_DECISIONS
    );


    memory.behavior.lastIntent =
        record.intent;


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


    const actionName =
        safeString(
            action.action
        ) ||
        null;


    const intent =
        safeString(
            action.intent
        ) ||
        null;


    const target =
        action.target ??
        null;


    const eventId =
        safeString(
            action.eventId
        ) ||
        null;


    if (
        isRecentRecordDuplicate(
            memory.actions,
            entry =>
                (
                    eventId &&
                    entry.eventId
                        ? eventId ===
                            entry.eventId
                        : (
                            entry.action ===
                                actionName &&

                            entry.intent ===
                                intent &&

                            String(
                                entry.target ?? ""
                            ) ===
                            String(
                                target ?? ""
                            )
                        )
                )
        )
    ) {

        return false;

    }


    const record = {

        id:
            createRecordId(
                "action"
            ),

        action:
            actionName,

        intent,

        target,

        eventId,

        timestamp:
            now()

    };


    pushLimited(
        memory.actions,
        record,
        MAX_ACTIONS
    );


    memory.runtime.lastActionRecordId =
        record.id;


    if (
        [
            "interfere",
            "block",
            "sabotage"
        ].includes(
            actionName
        )
    ) {

        memory.counters.interventions =
            Math.max(
                0,
                Number(
                    memory.counters.interventions
                ) || 0
            ) + 1;

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


    const eventType =
        safeString(
            type
        ) ||
        "unknown";


    const eventId =
        (
            data &&
            typeof data ===
                "object"
                ? safeString(
                    data.eventId
                )
                : ""
        ) ||
        null;


    if (
        isRecentRecordDuplicate(
            memory.events,
            entry =>
                (
                    eventId &&
                    entry.eventId
                        ? eventId ===
                            entry.eventId
                        : (
                            entry.type ===
                                eventType &&

                            JSON.stringify(
                                entry.data
                            ) ===
                            JSON.stringify(
                                data
                            )
                        )
                )
        )
    ) {

        return false;

    }


    const entry = {

        id:
            createRecordId(
                "event"
            ),

        type:
            eventType,

        data,

        eventId,

        important:
            Boolean(
                important
            ),

        timestamp:
            now()

    };


    pushLimited(
        memory.events,
        entry,
        MAX_EVENTS
    );


    memory.runtime.lastEventRecordId =
        entry.id;


    if (
        important
    ) {

        pushLimited(
            memory.importantEvents,
            entry,
            MAX_IMPORTANT_EVENTS
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


    const delta =
        Number.isFinite(
            value
        )
            ? value
            : 0;


    memory.behavior.patience =
        clamp(

            Number(
                memory.behavior.patience
            ) +
            delta

        );


    save();


    return memory.behavior.patience;

}


/* ==========================================================
   QUESTION MEMORY LOAD
========================================================== */

function loadQuestionMemory() {

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


    try {

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
            "[MR.SMILE QUESTION MEMORY] Parse failed:",
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


/* ==========================================================
   QUESTION MEMORY SAVE
========================================================== */

function saveQuestionMemory(
    questionMemory
) {

    if (
        !questionMemory
    ) {

        return false;

    }


    try {

        return writeStorage(

            QUESTION_MEMORY_STORAGE_KEY,

            JSON.stringify(
                questionMemory
            )

        );

    } catch (error) {

        console.warn(
            "[MR.SMILE QUESTION MEMORY] Save failed:",
            error
        );

        return false;

    }

}


/* ==========================================================
   QUESTION CATALOG API
========================================================== */

export function getQuestionCatalog() {

    return QUESTION_CATALOG.map(
        entry => ({
            ...entry
        })
    );

}


/* ==========================================================
   CATALOG QUESTION SEARCH
========================================================== */

function findCatalogQuestion(
    questionOrId
) {

    const value =
        safeString(
            questionOrId
        );


    if (!value) {
        return null;
    }


    const normalized =
        normalizeQuestion(
            value
        );


    for (
        const entry
        of QUESTION_CATALOG
    ) {

        if (
            entry.id ===
                value
        ) {

            return entry;

        }


        if (
            normalizeQuestion(
                entry.question
            ) ===
            normalized
        ) {

            return entry;

        }

    }


    return null;

}


/* ==========================================================
   REMEMBER CATALOG QUESTION
========================================================== */

export function rememberCatalogQuestion(
    question
) {

    const catalogEntry =
        findCatalogQuestion(
            question
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

        const previousTimestamp =
            Number(
                existing.lastAsked
            ) || 0;


        /*
         * Prevent the same catalog event from
         * being counted twice.
         */

        if (
            timestamp -
            previousTimestamp <=
            DUPLICATE_WINDOW_MS
        ) {

            return {
                ...existing
            };

        }


        existing.count =
            Math.max(
                0,
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


    questionMemory.version =
        QUESTION_MEMORY_VERSION;


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

    const catalogEntry =
        findCatalogQuestion(
            questionOrId
        );


    if (!catalogEntry) {
        return false;
    }


    const questionMemory =
        loadQuestionMemory();


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


    let askedCount =
        0;

    let totalAskedCount =
        0;


    const questions =
        [];


    for (
        const entry
        of QUESTION_CATALOG
    ) {

        const saved =
            questionMemory.questions[
                entry.id
            ];


        if (!saved) {
            continue;
        }


        askedCount +=
            1;


        totalAskedCount +=
            Number(
                saved.count
            ) || 0;


        questions.push({

            ...entry,

            memory: {
                ...saved
            }

        });

    }


    const total =
        QUESTION_CATALOG.length;


    return {

        version:
            QUESTION_MEMORY_VERSION,

        total,

        asked:
            askedCount,

        unasked:
            Math.max(
                0,
                total -
                askedCount
            ),

        completion:
            total
                ? Math.round(
                    (
                        askedCount /
                        total
                    ) *
                    100
                )
                : 0,

        totalAskedCount,

        questions

    };

}


/* ==========================================================
   CLEAR QUESTION MEMORY
========================================================== */

export function clearQuestionMemory() {

    if (
        storageAvailable()
    ) {

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
            Number(
                memory.player.totalMessages
            ) || 0,

        visits:
            Number(
                memory.player.totalVisits
            ) || 0,

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

        importantEvents:
            memory.importantEvents.length,

        meaningfulActions:
            Number(
                memory.counters.meaningfulActions
            ) || 0,

        curiosity:
            Number(
                memory.behavior.curiosity
            ) || 0,

        attention:
            Number(
                memory.behavior.attention
            ) || 0,

        suspicion:
            Number(
                memory.behavior.suspicion
            ) || 0,

        patience:
            Number(
                memory.behavior.patience
            ) || 0,

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

        flags: {
            ...memory.flags
        },

        runtime: {
            ...memory.runtime
        }

    };

}


/* ==========================================================
   FULL MEMORY SNAPSHOT
========================================================== */

export function exportMemorySnapshot() {

    initMemory();


    return clone(
        memory
    );

}


/* ==========================================================
   RESET MEMORY
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


    memory.player.totalMessages =
        0;


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

        snapshot:
            exportMemorySnapshot,

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

        findPreviousIntent:
            findPreviousIntent,

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

        rememberCatalogQuestion:
            rememberCatalogQuestion,

        isCatalogQuestionAsked:
            isCatalogQuestionAsked,

        getQuestionMemoryStatus:
            getQuestionMemoryStatus,

        getAskedQuestions:
            getAskedQuestions,

        getUnaskedQuestions:
            getUnaskedQuestions,

        clearQuestionMemory:
            clearQuestionMemory,

        rememberFile:
            rememberFile,

        rememberCommand:
            rememberCommand,

        rememberPage:
            rememberPage,

        rememberContext:
            rememberContext,

        rememberDecision:
            rememberDecision,

        rememberAction:
            rememberAction,

        rememberEvent:
            rememberEvent,

        setMemoryFlag:
            setMemoryFlag,

        hasMemoryFlag:
            hasMemoryFlag,

        changeBehaviorMetric:
            changeBehaviorMetric,

        changePatience:
            changePatience

    };

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default {

    initMemory,

    getMemory,

    getMemoryStatus,

    exportMemorySnapshot,

    resetMemory,

    normalizeQuestion,

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

    changePatience

};


/* ==========================================================
   AUTO INITIALIZATION
========================================================== */

try {

    initMemory();

} catch (error) {

    console.error(
        "[MR.SMILE MEMORY] Initialization failed:",
        error
    );

}
