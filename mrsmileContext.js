/* ==========================================================
   MR.SMILE CONTEXT
   OMEGA SYSTEM

   Context does not decide behavior.

   It answers:

       WHAT happened?
       WHERE?
       WHO caused it?
       HOW important is it?
       Is it meaningful?
========================================================== */

import {
    on,
    trigger
} from "./eventManager.js";

import {
    initMrSmileRelationship,
    getRelationshipStatus
} from "./mrsmileRelationship.js";

import {
    initMemory,
    rememberContext,
    rememberFile,
    rememberCommand,
    rememberPage
} from "./mrsmileMemory.js";

import {
    requestMrSmileBehavior
} from "./mrsmileBehavior.js";


/* ==========================================================
   STATE
========================================================== */

const state = {

    initialized: false,

    processing: false,

    queue: [],

    currentContext: null,

    history: [],

    maxHistory: 60

};


/* ==========================================================
   IMPORTANCE
========================================================== */

const IMPORTANCE = {

    file_open: 2,
    file_close: 1,

    folder_open: 1,
    folder_close: 1,

    restricted_file: 8,

    console_command: 3,
    console_open: 1,

    camera_open: 2,
    camera_switch: 2,
    camera_close: 1,

    window_open: 1,
    window_close: 1,
    window_focus: 1,
    window_move: 1,

    settings_change: 1,

    navigation: 1,

    operator_help_request: 6,

    operator_attack: 10,

    archive_access: 6,
    game_access: 6,
    truth_access: 9,

    access_request: 7,

    operator_action: 2,

    unknown: 1

};


/* ==========================================================
   IMPORTANT TARGET KEYWORDS
========================================================== */

const IMPORTANT_TARGETS = [

    "truth",
    "mirror",
    "mirror-00",
    "mirror_00",

    "sys_00",
    "sys00",

    "restricted",
    "classified",

    "mrsmile",
    "smile",

    "secret"

];


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileContext() {

    if (
        state.initialized
    ) {

        return;
    }


    state.initialized =
        true;


    initMrSmileRelationship();

    initMemory();

    registerListeners();

    exposeDebug();


    console.log(
        "[MR.SMILE CONTEXT] Initialized."
    );


    trigger(
        "mrsmile:contextInitialized"
    );
}


/* ==========================================================
   LISTENERS
========================================================== */

function registerListeners() {

    on(
        "mrsmile:operatorAction",
        data => {

            enqueueContext(
                data || {}
            );

        }
    );


    on(
        "mrsmile:operatorHelpRequest",
        data => {

            enqueueContext({

                ...(data || {}),

                type:
                    "operator_help_request",

                source:
                    "system"

            });

        }
    );


    on(
        "mrsmile:restrictedFileOpened",
        data => {

            enqueueContext({

                ...(data || {}),

                type:
                    "restricted_file",

                source:
                    "explorer"

            });

        }
    );


    on(
        "mrsmile:cameraChanged",
        data => {

            enqueueContext({

                ...(data || {}),

                type:
                    "camera_switch",

                source:
                    "camera"

            });

        }
    );


    on(
        "mrsmile:consoleCommand",
        data => {

            enqueueContext({

                ...(data || {}),

                type:
                    "console_command",

                source:
                    "console"

            });

        }
    );


    on(
        "mrsmile:windowOpened",
        data => {

            enqueueContext({

                ...(data || {}),

                type:
                    "window_open",

                source:
                    "window_manager"

            });

        }
    );


    on(
        "mrsmile:windowClosed",
        data => {

            enqueueContext({

                ...(data || {}),

                type:
                    "window_close",

                source:
                    "window_manager"

            });

        }
    );


    on(
        "mrsmile:windowFocused",
        data => {

            enqueueContext({

                ...(data || {}),

                type:
                    "window_focus",

                source:
                    "window_manager"

            });

        }
    );


    on(
        "mrsmile:windowMoved",
        data => {

            enqueueContext({

                ...(data || {}),

                type:
                    "window_move",

                source:
                    "window_manager"

            });

        }
    );


    on(
        "mrsmile:settingsChanged",
        data => {

            enqueueContext({

                ...(data || {}),

                type:
                    "settings_change",

                source:
                    "settings"

            });

        }
    );

}


/* ==========================================================
   QUEUE
========================================================== */

function enqueueContext(
    data
) {

    if (
        !data
    ) {

        return false;
    }


    /*
     * MR.SMILE itself must never be treated
     * as an operator.
     */

    if (
        data.source ===
        "mrsmile"
    ) {

        return false;
    }


    state.queue.push(
        data
    );


    if (
        state.queue.length >
        40
    ) {

        state.queue.shift();

    }


    processQueue();


    return true;
}


/* ==========================================================
   PROCESS QUEUE
========================================================== */

async function processQueue() {

    if (
        state.processing
    ) {

        return;
    }


    state.processing =
        true;


    try {

        while (
            state.queue.length
        ) {

            const raw =
                state.queue.shift();


            if (!raw) {
                continue;
            }


            const context =
                createMrSmileContext(
                    raw
                );


            state.currentContext =
                context;


            state.history.push(
                context
            );


            while (
                state.history.length >
                state.maxHistory
            ) {

                state.history.shift();

            }


            /*
             * Memory
             */

            rememberContext(
                context
            );


            if (
                context.page
            ) {

                rememberPage(
                    context.page
                );

            }


            if (
                context.type ===
                "file_open"
                &&
                context.target
            ) {

                rememberFile(
                    context.target,
                    {
                        name:
                            context.metadata?.name
                    }
                );

            }


            if (
                context.type ===
                "console_command"
            ) {

                rememberCommand(
                    context.target ||
                    context.metadata?.command ||
                    "",
                    {
                        source:
                            context.source
                    }
                );

            }


            trigger(
                "mrsmile:contextCreated",
                context
            );


            /*
             * Behavior
             */

            const decision =
                requestMrSmileBehavior(
                    context
                );


            if (
                decision
            ) {

                trigger(
                    "mrsmile:contextDecision",
                    {
                        context,
                        decision
                    }
                );

            }


            /*
             * Give browser event loop
             * a chance to breathe.
             */

            await tick();

        }

    } catch (error) {

        console.error(
            "[MR.SMILE CONTEXT] Queue error:",
            error
        );


        trigger(
            "mrsmile:contextError",
            {
                error
            }
        );

    } finally {

        state.processing =
            false;

    }

}


/* ==========================================================
   CREATE CONTEXT
========================================================== */

export function createMrSmileContext(
    data = {}
) {

    const relationship =
        getRelationshipStatus();


    const type =
        normalizeType(
            data.type
        );


    const importance =
        Number.isFinite(
            data.importance
        )

            ? Number(
                data.importance
            )

            : calculateImportance(
                type,
                data
            );


    const significant =
        data.significant ===
            true

        ||

        importance >= 6

        ||

        isImportantTarget(
            data.target
        );


    return {

        type,

        target:
            data.target ??
            null,

        source:
            data.source ||
            "unknown",

        page:
            data.page ||
            getCurrentPage(),

        action:
            data.action ||
            null,

        reason:
            data.reason ||
            "operator_action",

        operator:
            data.operator ||
            "operator",


        relationship:
            relationship.level,

        trust:
            relationship.trust,

        respect:
            relationship.respect,

        irritation:
            relationship.irritation,

        score:
            relationship.score,


        importance,

        significant,


        activeWindow:
            data.activeWindow ||
            getActiveWindow(),


        currentUrl:
            safe(
                () =>
                    window.location.href,
                null
            ),


        timestamp:
            Date.now(),


        metadata:
            data.metadata ||
            {},


        raw:
            data.raw ||
            null

    };

}


/* ==========================================================
   IMPORTANCE
========================================================== */

function calculateImportance(
    type,
    data
) {

    let importance =
        IMPORTANCE[type] ??
        1;


    const target =
        String(
            data.target ||
            ""
        ).toLowerCase();


    if (
        isImportantTarget(
            target
        )
    ) {

        importance += 3;

    }


    if (
        data.metadata?.restricted ===
        true
    ) {

        importance += 4;

    }


    return Math.min(
        10,
        importance
    );

}


/* ==========================================================
   IMPORTANT TARGET
========================================================== */

function isImportantTarget(
    target
) {

    const value =
        String(
            target ||
            ""
        ).toLowerCase();


    return IMPORTANT_TARGETS.some(
        keyword =>
            value.includes(
                keyword
            )
    );

}


/* ==========================================================
   NORMALIZE TYPE
========================================================== */

function normalizeType(
    type
) {

    return String(
        type ||
        "unknown"
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "_"
        );

}


/* ==========================================================
   CURRENT PAGE
========================================================== */

function getCurrentPage() {

    try {

        return (

            document.body?.dataset?.page

            ||

            document.querySelector(
                ".page.active"
            )?.id

            ||

            window.location.hash

            ||

            window.location.pathname

            ||

            "omega"

        );

    } catch {

        return "unknown";

    }

}


/* ==========================================================
   ACTIVE WINDOW
========================================================== */

function getActiveWindow() {

    try {

        const element =
            document.querySelector(
                ".window.active"
            )


            ||

            document.querySelector(
                ".window.focused"
            );


        if (
            !element
        ) {

            return null;

        }


        return {

            id:
                element.id ||
                null,

            title:
                element
                    .querySelector(
                        ".windowTitle"
                    )
                    ?.textContent
                    ?.trim()
                    ||
                null

        };

    } catch {

        return null;

    }

}


/* ==========================================================
   PUBLIC REPORT
========================================================== */

export function reportMrSmileOperatorAction(
    data = {}
) {

    return enqueueContext(
        data
    );

}


/* ==========================================================
   STATUS
========================================================== */

export function getLastMrSmileContext() {

    return state.currentContext;

}


export function getMrSmileContextHistory() {

    return [
        ...state.history
    ];

}


export function getMrSmileContextStatus() {

    return {

        initialized:
            state.initialized,

        processing:
            state.processing,

        queued:
            state.queue.length,

        historyLength:
            state.history.length,

        current:
            state.currentContext

    };

}


/* ==========================================================
   RESET
========================================================== */

export function clearMrSmileContextHistory() {

    state.history =
        [];

    state.currentContext =
        null;

    state.queue =
        [];

}


export function resetMrSmileContext() {

    clearMrSmileContextHistory();

    state.processing =
        false;

}


/* ==========================================================
   DEBUG API
========================================================== */

function exposeDebug() {

    if (
        typeof window ===
        "undefined"
    ) {

        return;
    }


    window.MRSMILE_CONTEXT = {

        status:
            getMrSmileContextStatus,

        current:
            getLastMrSmileContext,

        history:
            getMrSmileContextHistory,

        report:
            reportMrSmileOperatorAction,

        clear:
            clearMrSmileContextHistory,

        reset:
            resetMrSmileContext

    };

}


/* ==========================================================
   HELPERS
========================================================== */

function safe(
    fn,
    fallback
) {

    try {

        return fn();

    } catch {

        return fallback;

    }

}


function tick() {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                0
            )
    );

}
