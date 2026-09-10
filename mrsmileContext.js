/* ==========================================================
   MR.SMILE CONTEXT
   Context Collection / Normalization Layer
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
    requestMrSmileBehavior
} from "./mrsmileBehavior.js";


/* ==========================================================
   STATE
========================================================== */

const state = {
    initialized: false,

    currentContext: null,

    contextHistory: [],

    maxHistory: 50,

    processing: false
};


/* ==========================================================
   CONTEXT TYPES
========================================================== */

const CONTEXT_TYPES = [

    // Explorer
    "file_open",
    "restricted_file",
    "file_close",
    "folder_open",
    "folder_close",

    // Console
    "console_command",
    "console_open",

    // Camera
    "camera_open",
    "camera_switch",
    "camera_close",

    // Windows
    "window_open",
    "window_close",
    "window_focus",
    "window_move",

    // System
    "system_action",
    "settings_change",
    "navigation",

    // MR.SMILE
    "operator_help_request",
    "operator_attack",
    "mrsmile_message",
    "mrsmile_interaction",

    // Access
    "access_request",
    "archive_access",
    "game_access",
    "truth_access",

    // General
    "operator_action",
    "unknown"
];


/* ==========================================================
   INIT
========================================================== */

export function initMrSmileContext() {

    if (state.initialized) {
        return;
    }

    state.initialized = true;

    initMrSmileRelationship();

    registerListeners();
    exposeDebugAPI();

    console.log(
        "[MR.SMILE CONTEXT] Initialized."
    );

    trigger(
        "mrsmile:contextInitialized"
    );
}


/* ==========================================================
   EVENT LISTENERS
========================================================== */

function registerListeners() {

    /*
        Real OMEGA systems should emit:

        mrsmile:operatorAction

        with data such as:

        {
            type: "file_open",
            target: "MIRROR-00",
            source: "explorer"
        }
    */

    on(
        "mrsmile:operatorAction",
        handleOperatorAction
    );


    /*
        Compatibility listeners.
        These allow existing systems to report
        actions without having to manually call
        createContext().
    */

    on(
        "mrsmile:operatorHelpRequest",
        data => {

            handleOperatorAction({
                type: "operator_help_request",
                source: "system",
                ...normalizeEventData(data)
            });

        }
    );


    on(
        "mrsmile:restrictedFileOpened",
        data => {

            handleOperatorAction({
                type: "restricted_file",
                source: "explorer",
                ...normalizeEventData(data)
            });

        }
    );


    on(
        "mrsmile:cameraChanged",
        data => {

            handleOperatorAction({
                type: "camera_switch",
                source: "camera",
                ...normalizeEventData(data)
            });

        }
    );


    on(
        "mrsmile:consoleCommand",
        data => {

            handleOperatorAction({
                type: "console_command",
                source: "console",
                ...normalizeEventData(data)
            });

        }
    );


    on(
        "mrsmile:windowOpened",
        data => {

            handleOperatorAction({
                type: "window_open",
                source: "window_manager",
                ...normalizeEventData(data)
            });

        }
    );


    on(
        "mrsmile:windowClosed",
        data => {

            handleOperatorAction({
                type: "window_close",
                source: "window_manager",
                ...normalizeEventData(data)
            });

        }
    );
}


/* ==========================================================
   MAIN ACTION HANDLER
========================================================== */

function handleOperatorAction(data = {}) {

    if (state.processing) {
        return null;
    }

    state.processing = true;

    try {

        const context =
            createMrSmileContext(data);

        state.currentContext = context;

        saveContext(context);

        trigger(
            "mrsmile:contextCreated",
            context
        );

        console.log(
            "[MR.SMILE CONTEXT] Context created:",
            context
        );


        /*
            Send the context to Behavior.

            IMPORTANT:
            Context does not decide anything.

            Behavior receives the information
            and decides what MR.SMILE should do.
        */

        const decision =
            requestMrSmileBehavior(context);


        if (decision) {

            trigger(
                "mrsmile:contextDecision",
                {
                    context,
                    decision
                }
            );

        }

        return {
            context,
            decision
        };

    } catch (error) {

        console.error(
            "[MR.SMILE CONTEXT] Processing error:",
            error
        );

        trigger(
            "mrsmile:contextError",
            {
                error,
                data
            }
        );

        return null;

    } finally {

        state.processing = false;

    }
}


/* ==========================================================
   CREATE CONTEXT
========================================================== */

export function createMrSmileContext(data = {}) {

    const relationship =
        getRelationshipStatus();


    const context = {

        /* --------------------------------------------------
           ACTION
        -------------------------------------------------- */

        type:
            normalizeType(
                data.type
            ),

        target:
            data.target ??
            null,

        source:
            data.source ??
            "unknown",

        page:
            data.page ??
            getCurrentPage(),

        action:
            data.action ??
            null,

        reason:
            data.reason ??
            "operator_action",


        /* --------------------------------------------------
           OPERATOR
        -------------------------------------------------- */

        operator:
            data.operator ??
            "operator",


        /* --------------------------------------------------
           RELATIONSHIP
        -------------------------------------------------- */

        trust:
            relationship.trust,

        respect:
            relationship.respect,

        irritation:
            relationship.irritation,

        score:
            relationship.score,

        relationship:
            relationship.level,


        /* --------------------------------------------------
           SYSTEM STATE
        -------------------------------------------------- */

        activeWindow:
            data.activeWindow ??
            getActiveWindow(),

        currentUrl:
            getCurrentUrl(),

        timestamp:
            Date.now(),


        /* --------------------------------------------------
           EXTRA INFORMATION
        -------------------------------------------------- */

        metadata:
            data.metadata ??
            {},

        raw:
            data.raw ??
            null

    };


    return context;
}


/* ==========================================================
   NORMALIZE TYPE
========================================================== */

function normalizeType(type) {

    if (!type) {
        return "unknown";
    }

    const normalized =
        String(type)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");


    if (
        CONTEXT_TYPES.includes(
            normalized
        )
    ) {

        return normalized;

    }


    return normalized || "unknown";
}


/* ==========================================================
   NORMALIZE EVENT DATA
========================================================== */

function normalizeEventData(data) {

    if (!data) {
        return {};
    }


    if (
        typeof data !== "object"
    ) {

        return {
            target: data
        };

    }


    return {
        ...data
    };
}


/* ==========================================================
   CURRENT PAGE
========================================================== */

function getCurrentPage() {

    try {

        /*
            Try common OMEGA page/window identifiers.
        */

        const bodyPage =
            document.body?.dataset?.page;

        if (bodyPage) {
            return bodyPage;
        }


        const activePage =
            document.querySelector(
                ".page.active"
            );

        if (
            activePage &&
            activePage.id
        ) {

            return activePage.id;

        }


        return (
            window.location.hash ||
            window.location.pathname ||
            "omega"
        );

    } catch {

        return "unknown";

    }
}


/* ==========================================================
   CURRENT URL
========================================================== */

function getCurrentUrl() {

    try {

        return window.location.href;

    } catch {

        return null;

    }
}


/* ==========================================================
   ACTIVE WINDOW
========================================================== */

function getActiveWindow() {

    try {

        /*
            Common OMEGA window selectors.
        */

        const selectors = [

            ".omegaWindow.active",

            ".window.active",

            ".window.focused",

            ".window.activeWindow",

            "[data-window-active='true']",

            ".appWindow.active"

        ];


        for (
            const selector
            of selectors
        ) {

            const element =
                document.querySelector(
                    selector
                );


            if (!element) {
                continue;
            }


            return {

                id:
                    element.id ||
                    null,

                title:
                    element.dataset?.title ||
                    element.querySelector(
                        ".windowTitle"
                    )?.textContent?.trim() ||
                    element.querySelector(
                        ".windowHeader"
                    )?.textContent?.trim() ||
                    null

            };

        }


        return null;

    } catch {

        return null;

    }
}


/* ==========================================================
   SAVE CONTEXT
========================================================== */

function saveContext(context) {

    state.contextHistory.push(
        context
    );


    if (
        state.contextHistory.length >
        state.maxHistory
    ) {

        state.contextHistory.shift();

    }


    /*
        Session-level storage only.

        We deliberately do not make this
        permanent user-account storage yet.
    */

    try {

        sessionStorage.setItem(
            "mrsmile_last_context",
            JSON.stringify(context)
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE CONTEXT] Could not save session context:",
            error
        );

    }
}


/* ==========================================================
   PUBLIC ACTION REPORTER
========================================================== */

export function reportMrSmileOperatorAction(
    data = {}
) {

    return handleOperatorAction(
        data
    );
}


/* ==========================================================
   SIMPLE ACTION API
========================================================== */

export function reportAction(
    type,
    target = null,
    options = {}
) {

    return reportMrSmileOperatorAction({

        type,

        target,

        ...options

    });
}


/* ==========================================================
   LAST CONTEXT
========================================================== */

export function getLastMrSmileContext() {

    return state.currentContext;
}


/* ==========================================================
   CONTEXT HISTORY
========================================================== */

export function getMrSmileContextHistory() {

    return [
        ...state.contextHistory
    ];

}


/* ==========================================================
   LAST N CONTEXTS
========================================================== */

export function getRecentMrSmileContexts(
    amount = 10
) {

    const safeAmount =
        Math.max(
            1,
            Math.min(
                Number(amount) || 10,
                state.maxHistory
            )
        );


    return state.contextHistory.slice(
        -safeAmount
    );

}


/* ==========================================================
   FIND CONTEXTS
========================================================== */

export function findMrSmileContexts(
    filter = {}
) {

    return state.contextHistory.filter(
        context => {

            if (
                filter.type &&
                context.type !== filter.type
            ) {

                return false;

            }


            if (
                filter.source &&
                context.source !== filter.source
            ) {

                return false;

            }


            if (
                filter.target &&
                context.target !== filter.target
            ) {

                return false;

            }


            return true;

        }
    );

}


/* ==========================================================
   CLEAR HISTORY
========================================================== */

export function clearMrSmileContextHistory() {

    state.contextHistory = [];

    state.currentContext = null;

    try {

        sessionStorage.removeItem(
            "mrsmile_last_context"
        );

    } catch {}

    trigger(
        "mrsmile:contextHistoryCleared"
    );

}


/* ==========================================================
   RESET
========================================================== */

export function resetMrSmileContext() {

    clearMrSmileContextHistory();

    state.processing = false;

    console.log(
        "[MR.SMILE CONTEXT] Reset."
    );

}


/* ==========================================================
   CONTEXT STATUS
========================================================== */

export function getMrSmileContextStatus() {

    return {

        initialized:
            state.initialized,

        processing:
            state.processing,

        current:
            state.currentContext,

        historyLength:
            state.contextHistory.length,

        maxHistory:
            state.maxHistory

    };

}


/* ==========================================================
   DEBUG API
========================================================== */

function exposeDebugAPI() {

    if (
        typeof window === "undefined"
    ) {

        return;

    }


    if (
        !window.MRSMILE
    ) {

        window.MRSMILE = {};

    }


    window.MRSMILE.context =
        function(
            type,
            target = null,
            options = {}
        ) {

            console.log(
                "[MR.SMILE DEBUG] Context test:",
                type,
                target,
                options
            );


            return reportAction(
                type,
                target,
                {
                    ...options,
                    reason:
                        options.reason ||
                        "debug_test"
                }
            );

        };


    window.MRSMILE.contextStatus =
        function() {

            const status =
                getMrSmileContextStatus();


            console.log(
                "[MR.SMILE DEBUG] CONTEXT STATUS",
                status
            );


            return status;

        };


    window.MRSMILE.contextHistory =
        function(
            amount = null
        ) {

            const history =
                amount === null
                    ? getMrSmileContextHistory()
                    : getRecentMrSmileContexts(
                        amount
                    );


            console.log(
                "[MR.SMILE DEBUG] CONTEXT HISTORY",
                history
            );


            return history;

        };


    window.MRSMILE.clearContextHistory =
        function() {

            clearMrSmileContextHistory();

            console.log(
                "[MR.SMILE DEBUG] Context history cleared."
            );

        };


    window.MRSMILE.reportAction =
        function(
            data = {}
        ) {

            return reportMrSmileOperatorAction(
                data
            );

        };


    console.log(
        "[MR.SMILE CONTEXT] Debug API ready."
    );

}


/* ==========================================================
   AUTO INITIALIZATION
========================================================== */

if (
    typeof window !== "undefined"
) {

    /*
        Do not initialize immediately if the
        event system is still loading.

        The main MR.SMILE event system should
        normally initialize this module.
    */

    setTimeout(() => {

        try {

            initMrSmileContext();

        } catch (error) {

            console.error(
                "[MR.SMILE CONTEXT] Auto-init failed:",
                error
            );

        }

    }, 0);

}
