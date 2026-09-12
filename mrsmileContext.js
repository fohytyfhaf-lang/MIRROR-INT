/* ==========================================================
   MR.SMILE CONTEXT — REBUILT / SINGLE PIPELINE
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

    current: null,

    history: [],

    maxHistory: 80,

    listeners: false

};


const MAX_QUEUE = 50;


/* ==========================================================
   IMPORTANCE
========================================================== */

const IMPORTANCE = {

    file_open: 2,
    file_close: 1,

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
   IMPORTANT TARGETS
========================================================== */

const IMPORTANT = [

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

    "secret",

    "333"

];


/* ==========================================================
   INIT
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

    expose();


    trigger(
        "mrsmile:contextInitialized",
        {
            timestamp:
                Date.now()
        }
    );


    console.log(
        "[MR.SMILE CONTEXT] Rebuilt context initialized."
    );

}


/* ==========================================================
   LISTENERS
========================================================== */

function registerListeners() {

    if (
        state.listeners
    ) {
        return;
    }


    state.listeners =
        true;


    on(
        "mrsmile:operatorAction",
        data =>
            enqueue(
                data
            )
    );


    on(
        "mrsmile:operatorHelpRequest",
        data =>
            enqueue({

                ...(data || {}),

                type:
                    "operator_help_request",

                source:
                    "system"

            })
    );


    on(
        "mrsmile:restrictedFileOpened",
        data =>
            enqueue({

                ...(data || {}),

                type:
                    "restricted_file",

                source:
                    "explorer"

            })
    );


    on(
        "mrsmile:cameraChanged",
        data =>
            enqueue({

                ...(data || {}),

                type:
                    "camera_switch",

                source:
                    "camera"

            })
    );


    on(
        "mrsmile:consoleCommand",
        data =>
            enqueue({

                ...(data || {}),

                type:
                    "console_command",

                source:
                    "console"

            })
    );


    on(
        "mrsmile:windowOpened",
        data =>
            enqueue({

                ...(data || {}),

                type:
                    "window_open",

                source:
                    "window_manager"

            })
    );


    on(
        "mrsmile:windowClosed",
        data =>
            enqueue({

                ...(data || {}),

                type:
                    "window_close",

                source:
                    "window_manager"

            })
    );


    on(
        "mrsmile:windowFocused",
        data =>
            enqueue({

                ...(data || {}),

                type:
                    "window_focus",

                source:
                    "window_manager"

            })
    );


    on(
        "mrsmile:windowMoved",
        data =>
            enqueue({

                ...(data || {}),

                type:
                    "window_move",

                source:
                    "window_manager"

            })
    );


    on(
        "mrsmile:settingsChanged",
        data =>
            enqueue({

                ...(data || {}),

                type:
                    "settings_change",

                source:
                    "settings"

            })
    );

}


/* ==========================================================
   ENQUEUE
========================================================== */

function enqueue(
    data = {}
) {

    if (
        !data
    ) {
        return false;
    }


    /*
       Never process MR.SMILE as operator.
    */

    if (
        data.source ===
        "mrsmile"
    ) {

        return false;

    }


    const item = {

        ...data,

        type:
            normalizeType(
                data.type
            )

    };


    /*
       Prevent identical rapid events.
    */

    if (
        state.queue.some(
            previous =>
                sameAction(
                    previous,
                    item
                )
                &&
                Date.now() -
                    (
                        previous._queuedAt ||
                        0
                    )
                <
                    1200
        )
    ) {

        return false;

    }


    item._queuedAt =
        Date.now();


    /*
       Queue protection.
    */

    if (
        state.queue.length >=
        MAX_QUEUE
    ) {

        const lowIndex =
            state.queue.findIndex(
                queued =>
                    (
                        IMPORTANCE[
                            queued.type
                        ] ||
                        1
                    ) <= 2
            );


        if (
            lowIndex >= 0
        ) {

            state.queue.splice(
                lowIndex,
                1
            );

        } else {

            return false;

        }

    }


    state.queue.push(
        item
    );


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


            if (
                !raw
            ) {
                continue;
            }


            const context =
                createMrSmileContext(
                    raw
                );


            state.current =
                context;


            state.history.push(
                context
            );


            if (
                state.history.length >
                state.maxHistory
            ) {

                state.history.shift();

            }


            try {

                rememberContext(
                    context
                );

            } catch (error) {

                console.warn(
                    "[MR.SMILE CONTEXT] rememberContext failed:",
                    error
                );

            }


            if (
                context.page
            ) {

                try {

                    rememberPage(
                        context.page
                    );

                } catch {
                    // optional
                }

            }


            if (

                context.type ===
                    "file_open"

                &&

                context.target

            ) {

                try {

                    rememberFile(

                        context.target,

                        {
                            name:
                                context.metadata
                                    ?.name
                        }

                    );

                } catch {
                    // optional
                }

            }


            if (
                context.type ===
                    "console_command"
            ) {

                try {

                    rememberCommand(

                        context.target ||

                        context.metadata
                            ?.command ||

                        "",

                        {
                            source:
                                context.source,

                            allowed:
                                true

                        }

                    );

                } catch {
                    // optional
                }

            }


            trigger(
                "mrsmile:contextCreated",
                context
            );


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

    const rel =
        getRelationshipStatus();


    const type =
        normalizeType(
            data.type
        );


    let importance =

        Number.isFinite(
            data.importance
        )

            ? Number(
                data.importance
            )

            : (
                IMPORTANCE[type] ??
                1
            );


    if (
        isImportant(
            data.target
        )
    ) {

        importance =
            Math.min(
                10,
                importance + 3
            );

    }


    if (
        data.metadata
            ?.restricted === true
    ) {

        importance =
            Math.min(
                10,
                importance + 4
            );

    }


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
            getPage(),

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
            rel.level,

        trust:
            rel.trust,

        respect:
            rel.respect,

        irritation:
            rel.irritation,

        score:
            rel.score,

        importance,

        significant:
            data.significant === true
            ||
            importance >= 6
            ||
            isImportant(
                data.target
            ),

        activeWindow:
            getWindow(),

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
   DUPLICATE ACTION
========================================================== */

function sameAction(
    a,
    b
) {

    return (

        a.type ===
            b.type

        &&

        String(
            a.target ||
            ""
        ) ===

        String(
            b.target ||
            ""
        )

        &&

        String(
            a.action ||
            ""
        ) ===

        String(
            b.action ||
            ""
        )

    );

}


/* ==========================================================
   IMPORTANT TARGET CHECK
========================================================== */

function isImportant(
    target
) {

    const value =
        String(
            target ||
            ""
        )
        .toLowerCase();


    return IMPORTANT.some(
        keyword =>
            value.includes(
                keyword
            )
    );

}


/* ==========================================================
   TYPE
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

function getPage() {

    try {

        return (

            document.body
                ?.dataset
                ?.page

            ||

            document.querySelector(
                ".page.active"
            )
                ?.id

            ||

            location.hash

            ||

            location.pathname

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

function getWindow() {

    try {

        const element =

            document.querySelector(
                ".window.active,.window.focused"
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
   PUBLIC ACTION REPORT
========================================================== */

export function reportMrSmileOperatorAction(
    data
) {

    return enqueue(
        data
    );

}


/* ==========================================================
   STATUS
========================================================== */

export function getLastMrSmileContext() {

    return state.current;

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
            state.current

    };

}


/* ==========================================================
   CLEAR
========================================================== */

export function clearMrSmileContextHistory() {

    state.queue = [];

    state.history = [];

    state.current = null;

}


export function resetMrSmileContext() {

    clearMrSmileContextHistory();

    state.processing =
        false;

}


/* ==========================================================
   DEBUG
========================================================== */

function expose() {

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
   TICK
========================================================== */

function tick() {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                0
            )
    );

}


/* ==========================================================
   INITIAL GLOBAL
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_CONTEXT =
        window.MRSMILE_CONTEXT ||
        {};

}


/* ==========================================================
   DEFAULT
========================================================== */

export default {

    initMrSmileContext,

    createMrSmileContext,

    reportMrSmileOperatorAction,

    getMrSmileContextStatus

};
