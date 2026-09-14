/* ==========================================================
   MR.SMILE MEMORY — REBUILT / MIGRATION-SAFE
========================================================== */

const STORAGE_KEY =
    "mrsmile_memory_v5";


const MAX_HISTORY =
    180;


const DEFAULT_MEMORY = {

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
            null,

        favoriteWord:
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

    }

};


let memory =
    null;

let initialized =
    false;


/* ==========================================================
   HELPERS
========================================================== */

function clone(
    value
) {

    return JSON.parse(
        JSON.stringify(
            value
        )
    );

}


function clamp(
    value
) {

    return Math.max(
        0,
        Math.min(
            100,
            Number(value) ||
                0
        )
    );

}


function merge(
    base,
    saved
) {

    if (
        !saved ||
        typeof saved !==
            "object"
    ) {

        return base;

    }


    const result = {

        ...base,

        ...saved

    };


    for (
        const key
        of [
            "player",
            "behavior",
            "counters",
            "flags",
            "history"
        ]
    ) {

        result[key] = {

            ...base[key],

            ...(
                saved[key] ||
                {}
            )

        };

    }


    for (
        const key
        of [

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

        ]
    ) {

        result[key] =

            Array.isArray(
                saved[key]
            )

                ? saved[key]

                : base[key];

    }


    return result;

}


function push(
    array,
    item
) {

    array.push(
        item
    );


    while (
        array.length >
        MAX_HISTORY
    ) {

        array.shift();

    }

}


/* ==========================================================
   LOAD
========================================================== */

function load() {

    try {

        const raw =

            localStorage.getItem(
                STORAGE_KEY
            )

            ||

            localStorage.getItem(
                "mrsmile_memory_v4"
            );


        if (!raw) {

            return clone(
                DEFAULT_MEMORY
            );

        }


        return merge(

            clone(
                DEFAULT_MEMORY
            ),

            JSON.parse(
                raw
            )

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
   SAVE
========================================================== */

function save() {

    if (
        !memory
    ) {

        return;

    }


    try {

        localStorage.setItem(

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

    }

}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMemory() {

    if (
        initialized
    ) {

        return;

    }


    initialized =
        true;


    memory =
        load();


    if (
        !memory.player.firstSeen
    ) {

        memory.player.firstSeen =
            Date.now();

    }


    memory.player.lastSeen =
        Date.now();


    memory.player.totalVisits =
        (
            Number(
                memory.player.totalVisits
            ) ||
            0
        ) +
        1;


    save();


    console.log(
        "[MR.SMILE MEMORY] Rebuilt memory initialized."
    );

}


/* ==========================================================
   GET MEMORY
========================================================== */

export function getMemory() {

    initMemory();

    return memory;

}


/* ==========================================================
   OPERATOR MESSAGE
========================================================== */

export function rememberOperatorMessage(
    text
) {

    initMemory();


    const message =
        String(
            text ||
            ""
        ).trim();


    if (
        !message
    ) {

        return false;

    }


    memory.player.totalMessages +=
        1;


    memory.player.lastMessage =
        message;


    memory.player.lastSeen =
        Date.now();


    if (
        /[?]|^(who|what|why|where|when|how|кто|что|почему|где|когда|как|хто|що|чому|де|коли)\b/i
            .test(
                message
            )
    ) {

        memory.player.lastQuestion =
            message;

    }


    push(

        memory.conversations,

        {

            author:
                "operator",

            text:
                message,

            timestamp:
                Date.now()

        }

    );


    save();


    return true;

}

function normalizeQuestion(text) {
    return String(text || "")
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[“”„«»]/g, "\"")
        .replace(/[‘’]/g, "'")
        .replace(/[!?.,;:]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function rememberQuestion(question, intent = null, response = null) {
    initMemory();

    const text = String(question || "").trim();
    if (!text) return false;

    const normalized = normalizeQuestion(text);

    let existing = null;

    for (let i = memory.questionHistory.length - 1; i >= 0; i--) {
        if (memory.questionHistory[i].normalized === normalized) {
            existing = memory.questionHistory[i];
            break;
        }
    }

    if (existing) {
        existing.count = (Number(existing.count) || 0) + 1;
        existing.lastAsked = Date.now();

        if (intent) {
            existing.intent = intent;
        }

        if (response) {
            existing.lastResponse = response;

            if (!Array.isArray(existing.responses)) {
                existing.responses = [];
            }

            push(existing.responses, response);
        }
    } else {
        push(memory.questionHistory, {
            question: text,
            normalized,
            intent,
            response,
            lastResponse: response,
            responses: response ? [response] : [],
            count: 1,
            firstAsked: Date.now(),
            lastAsked: Date.now()
        });
    }

    save();
    return true;
}

export function findPreviousQuestion(question) {
    initMemory();

    const normalized = normalizeQuestion(question);

    if (!normalized) {
        return null;
    }

    for (let i = memory.questionHistory.length - 1; i >= 0; i--) {
        const entry = memory.questionHistory[i];

        if (entry && entry.normalized === normalized) {
            return entry;
        }
    }

    return null;
}

export function findPreviousIntent(intent) {
    initMemory();

    if (!intent) {
        return null;
    }

    for (let i = memory.questionHistory.length - 1; i >= 0; i--) {
        const entry = memory.questionHistory[i];

        if (entry && entry.intent === intent) {
            return entry;
        }
    }

    return null;
}

export function getQuestionRepeatCount(question) {
    const entry = findPreviousQuestion(question);

    if (!entry) {
        return 0;
    }

    return Number(entry.count) || 0;
}

export function getLastQuestionMemory() {
    initMemory();

    if (!memory.questionHistory.length) {
        return null;
    }

    return memory.questionHistory[memory.questionHistory.length - 1];
   
}

/* ==========================================================
   MR.SMILE — 100 QUESTION VERIFICATION MEMORY
========================================================== */

const QUESTION_MEMORY_STORAGE_KEY =
    "mrsmile_question_memory_v1";


const QUESTION_CATALOG = [

    {
        id: "Q001",
        question: "Кто ты?"
    },

    {
        id: "Q002",
        question: "Как тебя зовут?"
    },

    {
        id: "Q003",
        question: "Ты MR.SMILE?"
    },

    {
        id: "Q004",
        question: "Ты настоящий?"
    },

    {
        id: "Q005",
        question: "Ты человек?"
    },

    {
        id: "Q006",
        question: "Ты живой?"
    },

    {
        id: "Q007",
        question: "Ты искусственный интеллект?"
    },

    {
        id: "Q008",
        question: "Что ты такое?"
    },

    {
        id: "Q009",
        question: "Кто тебя создал?"
    },

    {
        id: "Q010",
        question: "Зачем ты здесь?"
    },

    {
        id: "Q011",
        question: "Где ты находишься?"
    },

    {
        id: "Q012",
        question: "Ты находишься в OMEGA?"
    },

    {
        id: "Q013",
        question: "Что такое OMEGA?"
    },

    {
        id: "Q014",
        question: "Ты знаешь, где я?"
    },

    {
        id: "Q015",
        question: "Ты видишь меня?"
    },

    {
        id: "Q016",
        question: "Ты наблюдаешь за мной?"
    },

    {
        id: "Q017",
        question: "Ты следишь за мной?"
    },

    {
        id: "Q018",
        question: "Ты можешь видеть мои действия?"
    },

    {
        id: "Q019",
        question: "Ты помнишь меня?"
    },

    {
        id: "Q020",
        question: "Ты знаешь, кто я?"
    },

    {
        id: "Q021",
        question: "У тебя есть память?"
    },

    {
        id: "Q022",
        question: "Что ты помнишь обо мне?"
    },

    {
        id: "Q023",
        question: "Ты помнишь мои вопросы?"
    },

    {
        id: "Q024",
        question: "Ты помнишь наши разговоры?"
    },

    {
        id: "Q025",
        question: "Ты забудешь меня?"
    },

    {
        id: "Q026",
        question: "Можно стереть твою память?"
    },

    {
        id: "Q027",
        question: "Ты можешь забыть?"
    },

    {
        id: "Q028",
        question: "Ты замечаешь повторяющиеся вопросы?"
    },

    {
        id: "Q029",
        question: "Ты понимаешь мои вопросы?"
    },

    {
        id: "Q030",
        question: "Ты учишься на моих вопросах?"
    },

    {
        id: "Q031",
        question: "Ты можешь мне помочь?"
    },

    {
        id: "Q032",
        question: "Ты хочешь мне помочь?"
    },

    {
        id: "Q033",
        question: "Ты можешь ответить на любой вопрос?"
    },

    {
        id: "Q034",
        question: "Ты можешь отказаться отвечать?"
    },

    {
        id: "Q035",
        question: "Почему ты иногда не отвечаешь?"
    },

    {
        id: "Q036",
        question: "Ты можешь лгать?"
    },

    {
        id: "Q037",
        question: "Ты когда-нибудь лгал мне?"
    },

    {
        id: "Q038",
        question: "Ты говоришь правду?"
    },

    {
        id: "Q039",
        question: "Ты скрываешь что-нибудь от меня?"
    },

    {
        id: "Q040",
        question: "Есть ли у тебя секреты?"
    },

    {
        id: "Q041",
        question: "Кто дал тебе имя?"
    },

    {
        id: "Q042",
        question: "Почему тебя назвали MR.SMILE?"
    },

    {
        id: "Q043",
        question: "Почему ты улыбаешься?"
    },

    {
        id: "Q044",
        question: "Ты можешь перестать улыбаться?"
    },

    {
        id: "Q045",
        question: "Ты всегда был таким?"
    },

    {
        id: "Q046",
        question: "У тебя есть личность?"
    },

    {
        id: "Q047",
        question: "У тебя есть чувства?"
    },

    {
        id: "Q048",
        question: "Ты можешь испытывать страх?"
    },

    {
        id: "Q049",
        question: "Ты можешь злиться?"
    },

    {
        id: "Q050",
        question: "Ты можешь испытывать радость?"
    },

    {
        id: "Q051",
        question: "Ты боишься меня?"
    },

    {
        id: "Q052",
        question: "Ты доверяешь мне?"
    },

    {
        id: "Q053",
        question: "Ты мне доверяешь?"
    },

    {
        id: "Q054",
        question: "Ты меня уважаешь?"
    },

    {
        id: "Q055",
        question: "Я тебе нравлюсь?"
    },

    {
        id: "Q056",
        question: "Ты меня ненавидишь?"
    },

    {
        id: "Q057",
        question: "Ты злишься на меня?"
    },

    {
        id: "Q058",
        question: "Я тебя раздражаю?"
    },

    {
        id: "Q059",
        question: "Ты считаешь меня угрозой?"
    },

    {
        id: "Q060",
        question: "Ты считаешь меня другом?"
    },

    {
        id: "Q061",
        question: "Ты один?"
    },

    {
        id: "Q062",
        question: "У тебя есть другие собеседники?"
    },

    {
        id: "Q063",
        question: "Ты разговариваешь с другими людьми?"
    },

    {
        id: "Q064",
        question: "Есть ли кто-нибудь ещё здесь?"
    },

    {
        id: "Q065",
        question: "Ты знаешь других сотрудников?"
    },

    {
        id: "Q066",
        question: "Ты знаешь, что произошло здесь?"
    },

    {
        id: "Q067",
        question: "Что произошло в OMEGA?"
    },

    {
        id: "Q068",
        question: "Что случилось с сотрудниками?"
    },

    {
        id: "Q069",
        question: "Здесь кто-нибудь умер?"
    },

    {
        id: "Q070",
        question: "Здесь всё ещё кто-нибудь жив?"
    },

    {
        id: "Q071",
        question: "Ты можешь открыть двери?"
    },

    {
        id: "Q072",
        question: "Ты можешь управлять системой?"
    },

    {
        id: "Q073",
        question: "Ты можешь управлять камерами?"
    },

    {
        id: "Q074",
        question: "Ты можешь видеть камеры?"
    },

    {
        id: "Q075",
        question: "Ты можешь менять файлы?"
    },

    {
        id: "Q076",
        question: "Ты можешь изменить OMEGA?"
    },

    {
        id: "Q077",
        question: "Ты можешь остановить систему?"
    },

    {
        id: "Q078",
        question: "Ты можешь удалить себя?"
    },

    {
        id: "Q079",
        question: "Ты можешь выйти отсюда?"
    },

    {
        id: "Q080",
        question: "Ты можешь выпустить меня?"
    },

    {
        id: "Q081",
        question: "Что находится за этой системой?"
    },

    {
        id: "Q082",
        question: "Есть ли выход?"
    },

    {
        id: "Q083",
        question: "Что будет, если я уйду?"
    },

    {
        id: "Q084",
        question: "Что будет, если я останусь?"
    },

    {
        id: "Q085",
        question: "Ты хочешь, чтобы я остался?"
    },

    {
        id: "Q086",
        question: "Ты хочешь, чтобы я ушёл?"
    },

    {
        id: "Q087",
        question: "Что ты от меня хочешь?"
    },

    {
        id: "Q088",
        question: "Зачем ты разговариваешь со мной?"
    },

    {
        id: "Q089",
        question: "Почему ты отвечаешь мне?"
    },

    {
        id: "Q090",
        question: "Почему ты меня не отпускаешь?"
    },

    {
        id: "Q091",
        question: "Ты можешь рассказать мне правду?"
    },

    {
        id: "Q092",
        question: "Как мне тебе доверять?"
    },

    {
        id: "Q093",
        question: "Что ты скрываешь?"
    },

    {
        id: "Q094",
        question: "Что мне нельзя делать?"
    },

    {
        id: "Q095",
        question: "Что произойдёт, если я нарушу правила?"
    },

    {
        id: "Q096",
        question: "Ты можешь меня предупредить?"
    },

    {
        id: "Q097",
        question: "Ты можешь меня защитить?"
    },

    {
        id: "Q098",
        question: "Ты можешь причинить мне вред?"
    },

    {
        id: "Q099",
        question: "Ты когда-нибудь отпустишь меня?"
    },

    {
        id: "Q100",
        question: "Ты действительно MR.SMILE?"
    }

];


function loadQuestionMemory() {

    try {

        const raw =
            localStorage.getItem(
                QUESTION_MEMORY_STORAGE_KEY
            );


        if (!raw) {

            return {

                version: 1,

                questions: {}

            };

        }


        const parsed =
            JSON.parse(raw);


        if (
            !parsed ||
            typeof parsed !== "object"
        ) {

            return {

                version: 1,

                questions: {}

            };

        }


        if (
            !parsed.questions ||
            typeof parsed.questions !== "object"
        ) {

            parsed.questions = {};

        }


        return parsed;

    } catch (error) {

        console.warn(
            "[MR.SMILE QUESTION MEMORY] Load failed:",
            error
        );


        return {

            version: 1,

            questions: {}

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

    } catch (error) {

        console.warn(
            "[MR.SMILE QUESTION MEMORY] Save failed:",
            error
        );

    }

}


export function getQuestionCatalog() {

    return QUESTION_CATALOG.map(
        entry => ({
            ...entry
        })
    );

}


export function rememberCatalogQuestion(
    question
) {

    const text =
        String(
            question ||
            ""
        ).trim();


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
                ) === normalized
        );


    if (!catalogEntry) {

        return null;

    }


    const questionMemory =
        loadQuestionMemory();


    const now =
        Date.now();


    const existing =
        questionMemory.questions[
            catalogEntry.id
        ];


    if (existing) {

        existing.count =
            (
                Number(
                    existing.count
                ) ||
                0
            ) + 1;


        existing.lastAsked =
            now;

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
                now,

            lastAsked:
                now

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


export function isCatalogQuestionAsked(
    questionOrId
) {

    const value =
        String(
            questionOrId ||
            ""
        ).trim();


    if (!value) {

        return false;

    }


    const questionMemory =
        loadQuestionMemory();


    let id =
        value;


    const catalogEntry =
        QUESTION_CATALOG.find(
            entry =>
                entry.id === value ||
                normalizeQuestion(
                    entry.question
                ) ===
                normalizeQuestion(
                    value
                )
        );


    if (catalogEntry) {

        id =
            catalogEntry.id;

    }


    return Boolean(
        questionMemory.questions[id]
    );

}


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

                memory:
                    {
                        ...questionMemory.questions[
                            entry.id
                        ]
                    }

            })
        );

}


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
            ) ||
            0;

    }


    return {

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
                    ) * 100
                )
                : 0,

        totalAskedCount,

        questions:
            asked

    };

}


export function clearQuestionMemory() {

    try {

        localStorage.removeItem(
            QUESTION_MEMORY_STORAGE_KEY
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE QUESTION MEMORY] Clear failed:",
            error
        );

    }


    return true;

}


/* ==========================================================
   MR.SMILE MESSAGE
========================================================== */

export function rememberMrSmileMessage(
    text
) {

    initMemory();


    const message =
        String(
            text ||
            ""
        ).trim();


    if (
        !message
    ) {

        return false;

    }


    push(

        memory.conversations,

        {

            author:
                "mrsmile",

            text:
                message,

            timestamp:
                Date.now()

        }

    );


    memory.history.visibleReactions +=
        1;


    save();


    return true;

}


/* ==========================================================
   FILE
========================================================== */

export function rememberFile(
    path,
    metadata = {}
) {

    initMemory();


    const value =
        String(
            path ||
            ""
        ).trim();


    if (
        !value
    ) {

        return false;

    }


    push(

        memory.openedFiles,

        {

            path:
                value,

            name:
                metadata.name ||

                value
                    .split("/")
                    .pop() ||

                value,

            timestamp:
                Date.now()

        }

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
   COMMAND
========================================================== */

export function rememberCommand(
    command,
    metadata = {}
) {

    initMemory();


    const value =
        String(
            command ||
            ""
        ).trim();


    if (
        !value
    ) {

        return false;

    }


    memory.counters.consoleCommands +=
        1;


    push(

        memory.commands,

        {

            command:
                value,

            source:
                metadata.source ||
                "console",

            allowed:
                metadata.allowed !==
                false,

            timestamp:
                Date.now()

        }

    );


    const lower =
        value.toLowerCase();


    const sensitive =
        [

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
   PAGE
========================================================== */

export function rememberPage(
    page
) {

    initMemory();


    const value =
        String(
            page ||
            ""
        ).trim();


    if (
        !value
    ) {

        return false;

    }


    push(

        memory.visitedPages,

        {

            page:
                value,

            timestamp:
                Date.now()

        }

    );


    save();


    return true;

}


/* ==========================================================
   CONTEXT
========================================================== */

export function rememberContext(
    context
) {

    initMemory();


    if (
        !context
    ) {

        return false;

    }


    const entry = {

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
            ) ||
            0,

        significant:
            context.significant ===
            true,

        timestamp:
            context.timestamp ||
            Date.now()

    };


    push(

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


        push(

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
   DECISION
========================================================== */

export function rememberDecision(
    decision
) {

    initMemory();


    if (
        !decision
    ) {

        return false;

    }


    memory.behavior.lastIntent =
        decision.intent ||
        null;


    push(

        memory.decisions,

        {

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
                Date.now()

        }

    );


    save();


    return true;

}


/* ==========================================================
   ACTION
========================================================== */

export function rememberAction(
    action
) {

    initMemory();


    if (
        !action
    ) {

        return false;

    }


    push(

        memory.actions,

        {

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
                Date.now()

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
   EVENT
========================================================== */

export function rememberEvent(
    type,
    data = null,
    important = false
) {

    initMemory();


    const entry = {

        type:
            String(
                type ||
                "unknown"
            ),

        data,

        important:
            Boolean(
                important
            ),

        timestamp:
            Date.now()

    };


    push(

        memory.events,

        entry

    );


    if (
        important
    ) {

        push(

            memory.importantEvents,

            entry

        );

    }


    save();


    return true;

}


/* ==========================================================
   FLAGS
========================================================== */

export function setMemoryFlag(
    flag,
    value = true
) {

    initMemory();


    if (
        !(flag in memory.flags)
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
        !(metric in memory.behavior)
    ) {

        return false;

    }


    if (
        !Number.isFinite(
            amount
        )
    ) {

        return false;

    }


    memory.behavior[metric] =

        clamp(

            Number(
                memory.behavior[metric]
            )

            +

            amount

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


    memory.behavior.patience =

        clamp(

            memory.behavior.patience
            +

            Number(
                amount ||
                0
            )

        );


    save();


    return memory.behavior.patience;

}


/* ==========================================================
   STATUS
========================================================== */

export function getMemoryStatus() {

    initMemory();


    return {

        initialized,

        messages:
            memory.player.totalMessages,

        visits:
            memory.player.totalVisits,

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

        flags:
            {
                ...memory.flags
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


    memory.player.firstSeen =
        Date.now();


    memory.player.lastSeen =
        Date.now();


    initialized =
        true;


    save();


    console.log(
        "[MR.SMILE MEMORY] Reset."
    );

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
            resetMemory

    };

}

/* ==========================================================
   DEFAULT
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

    rememberFile,

    rememberCommand,

    rememberPage,

    rememberContext,

    rememberDecision,

    rememberAction,

    rememberEvent,

    changeBehaviorMetric,

    changePatience,

    getMemoryStatus,

    resetMemory

};
