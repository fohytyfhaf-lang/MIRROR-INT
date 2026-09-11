/* ==========================================================
   MR.SMILE MEMORY SYSTEM
   OMEGA SYSTEM

   SINGLE MEMORY SOURCE

   Memory remembers what happened.
   It does not decide what MR.SMILE should do.

   Personality:
   - calm
   - patient
   - gentlemanly
   - vague
   - old-fashioned
========================================================== */

const STORAGE_KEY = "mrsmile_memory_v4";

const MAX_HISTORY = 150;

const DEFAULT_MEMORY = {

    player: {

        firstSeen: null,
        lastSeen: null,

        totalVisits: 0,
        totalMessages: 0,

        lastMessage: "",
        lastQuestion: null,

        favoriteWord: null

    },


    conversations: [],

    openedFiles: [],
    commands: [],
    visitedPages: [],

    contexts: [],
    decisions: [],
    actions: [],
    events: [],

    importantEvents: [],


    behavior: {

        curiosity: 0,
        attention: 0,
        suspicion: 0,

        patience: 100,

        lastIntent: null,
        lastImportantAction: null,
        lastImportantTarget: null

    },


    counters: {

        meaningfulActions: 0,

        restrictedAttempts: 0,
        consoleCommands: 0,
        cameraVisits: 0,

        secretReads: 0,

        helpRequests: 0,
        warningsGiven: 0,
        warningsIgnored: 0,

        interventions: 0
    },


    flags: {

        met: false,

        knowsOmega: false,
        knowsSmile: false,

        receivedGame: false,

        foundSecretRoom: false,

        sawHiddenCamera: false,

        enteredMirror: false,

        completedEnding: false

    },


    history: {

        firstContact: 0,

        visibleReactions: 0,

        silentObservations: 0
    }

};


let memory = null;

let initialized = false;


/* ==========================================================
   INIT
========================================================== */

export function initMemory() {

    if (initialized) {
        return;
    }


    initialized = true;

    memory = loadMemory();


    if (!memory.player.firstSeen) {

        memory.player.firstSeen =
            Date.now();
    }


    memory.player.lastSeen =
        Date.now();


    memory.player.totalVisits++;


    saveMemory();


    console.log(
        "[MR.SMILE MEMORY] Initialized."
    );
}


/* ==========================================================
   GET
========================================================== */

export function getMemory() {

    initMemory();

    return memory;
}


/* ==========================================================
   PLAYER MESSAGE
========================================================== */

export function rememberOperatorMessage(
    text
) {

    initMemory();


    const message =
        String(text || "").trim();


    if (!message) {
        return false;
    }


    memory.player.totalMessages++;

    memory.player.lastMessage =
        message;

    memory.player.lastSeen =
        Date.now();


    if (
        /[?]|^(who|what|why|where|when|how|кто|что|почему|где|когда|как)\b/i
            .test(message)
    ) {

        memory.player.lastQuestion =
            message;
    }


    push(
        memory.conversations,
        {

            author: "operator",

            text: message,

            timestamp:
                Date.now()

        }
    );


    saveMemory();


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
        String(text || "").trim();


    if (!message) {
        return false;
    }


    push(
        memory.conversations,
        {

            author: "mrsmile",

            text: message,

            timestamp:
                Date.now()

        }
    );


    memory.history.visibleReactions++;


    saveMemory();


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
        String(path || "").trim();


    if (!value) {
        return false;
    }


    push(
        memory.openedFiles,
        {

            path: value,

            name:
                metadata.name ||
                value.split("/").pop() ||
                value,

            timestamp:
                Date.now()

        }
    );


    const lower =
        value.toLowerCase();


    if (
        lower.includes("mrsmile")
    ) {

        memory.flags.knowsSmile =
            true;

        memory.behavior.curiosity =
            clamp100(
                memory.behavior.curiosity +
                8
            );

        memory.counters.secretReads++;
    }


    if (
        lower.includes("mirror")
    ) {

        memory.flags.knowsOmega =
            true;

        memory.behavior.curiosity =
            clamp100(
                memory.behavior.curiosity +
                5
            );
    }


    saveMemory();

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
        String(command || "").trim();


    if (!value) {
        return false;
    }


    memory.counters.consoleCommands++;


    push(
        memory.commands,
        {

            command: value,

            source:
                metadata.source ||
                "console",

            allowed:
                metadata.allowed !== false,

            timestamp:
                Date.now()

        }
    );


    const lower =
        value.toLowerCase();


    if (
        lower.includes("sys_00") ||
        lower.includes("restricted") ||
        lower.includes("delete") ||
        lower.includes("terminate")
    ) {

        memory.behavior.suspicion =
            clamp100(
                memory.behavior.suspicion +
                6
            );
    }


    saveMemory();

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
        String(page || "").trim();


    if (!value) {
        return false;
    }


    push(
        memory.visitedPages,
        {

            page: value,

            timestamp:
                Date.now()

        }
    );


    saveMemory();

    return true;
}


/* ==========================================================
   CONTEXT
========================================================== */

export function rememberContext(
    context
) {

    initMemory();


    if (!context) {
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
            ) || 0,

        significant:
            context.significant === true,

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

        memory.counters.meaningfulActions++;


        memory.behavior.lastImportantAction =
            entry.type;


        memory.behavior.lastImportantTarget =
            entry.target;


        push(
            memory.importantEvents,
            entry
        );

    }


    memory.history.silentObservations++;


    saveMemory();


    return true;
}


/* ==========================================================
   DECISION
========================================================== */

export function rememberDecision(
    decision
) {

    initMemory();


    if (!decision) {
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


    saveMemory();


    return true;
}


/* ==========================================================
   ACTION
========================================================== */

export function rememberAction(
    action
) {

    initMemory();


    if (!action) {
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

        memory.counters.interventions++;

    }


    saveMemory();


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


    saveMemory();

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
        Boolean(value);


    saveMemory();

    return true;
}


export function hasMemoryFlag(
    flag
) {

    initMemory();


    return (
        memory.flags[flag] === true
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
        !Number.isFinite(amount)
    ) {

        return false;
    }


    memory.behavior[metric] =
        clamp100(
            Number(
                memory.behavior[metric]
            ) +
            amount
        );


    saveMemory();


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
        clamp100(
            memory.behavior.patience +
            amount
        );


    saveMemory();


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


    saveMemory();


    console.log(
        "[MR.SMILE MEMORY] Reset."
    );
}


/* ==========================================================
   SAVE
========================================================== */

function saveMemory() {

    if (!memory) {
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
   LOAD
========================================================== */

function loadMemory() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!raw) {

            return clone(
                DEFAULT_MEMORY
            );
        }


        return merge(
            clone(DEFAULT_MEMORY),
            JSON.parse(raw)
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
   ARRAY LIMIT
========================================================== */

function push(
    array,
    value
) {

    array.push(
        value
    );


    while (
        array.length >
        MAX_HISTORY
    ) {

        array.shift();

    }

}


/* ==========================================================
   MERGE
========================================================== */

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


    return {

        ...base,

        ...saved,


        player: {

            ...base.player,

            ...(saved.player || {})

        },


        behavior: {

            ...base.behavior,

            ...(saved.behavior || {})

        },


        counters: {

            ...base.counters,

            ...(saved.counters || {})

        },


        flags: {

            ...base.flags,

            ...(saved.flags || {})

        },


        history: {

            ...base.history,

            ...(saved.history || {})

        },


        conversations:
            arrayOrDefault(
                saved.conversations,
                base.conversations
            ),

        openedFiles:
            arrayOrDefault(
                saved.openedFiles,
                base.openedFiles
            ),

        commands:
            arrayOrDefault(
                saved.commands,
                base.commands
            ),

        visitedPages:
            arrayOrDefault(
                saved.visitedPages,
                base.visitedPages
            ),

        contexts:
            arrayOrDefault(
                saved.contexts,
                base.contexts
            ),

        decisions:
            arrayOrDefault(
                saved.decisions,
                base.decisions
            ),

        actions:
            arrayOrDefault(
                saved.actions,
                base.actions
            ),

        events:
            arrayOrDefault(
                saved.events,
                base.events
            ),

        importantEvents:
            arrayOrDefault(
                saved.importantEvents,
                base.importantEvents
            )

    };
}


/* ==========================================================
   HELPERS
========================================================== */

function arrayOrDefault(
    value,
    fallback
) {

    return Array.isArray(value)
        ? value.slice(
            -MAX_HISTORY
        )
        : fallback;
}


function clone(
    value
) {

    return JSON.parse(
        JSON.stringify(
            value
        )
    );
}


function clamp100(
    value
) {

    return Math.max(
        0,
        Math.min(
            100,
            Number(value) || 0
        )
    );
}


/* ==========================================================
   DEBUG API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_MEMORY = {

        get:
            getMemory,

        status:
            getMemoryStatus,

        message:
            rememberOperatorMessage,

        mrsmile:
            rememberMrSmileMessage,

        file:
            rememberFile,

        command:
            rememberCommand,

        page:
            rememberPage,

        context:
            rememberContext,

        decision:
            rememberDecision,

        action:
            rememberAction,

        event:
            rememberEvent,

        setFlag:
            setMemoryFlag,

        hasFlag:
            hasMemoryFlag,

        metric:
            changeBehaviorMetric,

        patience:
            changePatience,

        reset:
            resetMemory

    };

}
