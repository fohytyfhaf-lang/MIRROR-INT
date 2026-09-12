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
