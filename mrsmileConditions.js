/* ==========================================================
   MR.SMILE CONDITIONS
   OMEGA / MIRROR-INT

   PURPOSE
   ----------------------------------------------------------
   Hidden condition engine for MR.SMILE discovery.

   IMPORTANT:
   - Does NOT activate MR.SMILE.
   - Does NOT create visual effects.
   - Does NOT write visible horror messages.
   - Does NOT trigger First Contact directly.
   - Only observes normal operator activity.
   - Builds hidden discovery progress.
   - Sends discovery events to mrsmileDiscovery.js.

   PIPELINE

       NORMAL OMEGA ACTIVITY
                ↓
       mrsmileConditions.js
                ↓
       hidden discovery progress
                ↓
       discovery trace
                ↓
       discovery sequence
                ↓
       UNREGISTERED CHANNEL
                ↓
       FIRST CONTACT

========================================================== */


/* ==========================================================
   IMPORTS
========================================================== */

import {
    on,
    trigger
} from "./eventManager.js";

import {
    getMrSmileState
} from "./mrsmileState.js";


/* ==========================================================
   STORAGE
========================================================== */

const STORAGE_KEY =
    "mrsmile_conditions_v2";


/* ==========================================================
   VERSION
========================================================== */

const VERSION =
    2;


/* ==========================================================
   CONFIGURATION
========================================================== */

const CONFIG = {

    /*
     * Minimum number of meaningful operator actions.
     */
    minimumActions:
        6,


    /*
     * Minimum time inside the system
     * before discovery can progress.
     *
     * 90 seconds.
     */
    minimumSessionTime:
         90000,


    /*
     * Unique files required.
     */
    minimumFiles:
        2,


    /*
     * Unique camera channels required.
     */
    minimumCameras:
        2,


    /*
     * Console interaction required.
     */
    minimumConsoleCommands:
        1,


    /*
     * Minimum number of different activity
     * categories.
     */
    minimumCategories:
        3,


    /*
     * Number of small traces before
     * the background discovery sequence.
     */
    tracesRequired:
        2,


    /*
     * Prevent several discovery events
     * from firing too quickly.
     */
    traceCooldown:
        12000,


    /*
     * After the final condition is reached,
     * wait before notifying discovery layer.
     */
    discoveryReadyDelay:
        4500

};


/* ==========================================================
   DEFAULT STATE
========================================================== */

const DEFAULT_STATE = {

    version:
        VERSION,

    initialized:
        false,

    armed:
        true,

    completed:
        false,

    ready:
        false,

    sessionStartedAt:
        null,

    sessionId:
        null,

    /*
     * General action count.
     */
    actionCount:
        0,


    /*
     * Unique resources.
     */
    files:
        [],

    cameras:
        [],

    commands:
        [],

    windows:
        [],


    /*
     * Activity categories.
     */
    categories:
        [],


    /*
     * Discovery traces already shown.
     */
    traces:
        [],


    /*
     * Route information.
     */
    route:
        null,


    /*
     * Last operator action.
     */
    lastAction:
        null,


    /*
     * Last trace.
     */
    lastTrace:
        null,


    /*
     * Last time a trace fired.
     */
    lastTraceTime:
        0,


    /*
     * Number of discovery signals.
     */
    traceCount:
        0,


    /*
     * Final ready timestamp.
     */
    readyAt:
        null,


    /*
     * Internal flags.
     */
    archiveTouched:
        false,

    cameraTouched:
        false,

    consoleTouched:
        false,

    systemTouched:
        false,

    mixedRouteDetected:
        false

};


/* ==========================================================
   RUNTIME
========================================================== */

let state =
    createDefaultState();

let initialized =
    false;

let readyTimer =
    null;


/* ==========================================================
   HELPERS
========================================================== */


/* =========================
   CREATE DEFAULT
========================= */

function createDefaultState() {

    return JSON.parse(
        JSON.stringify(
            DEFAULT_STATE
        )
    );

}


/* =========================
   CLONE
========================= */

function clone(data) {

    if (
        data === null ||
        data === undefined
    ) {

        return data;

    }

    try {

        return JSON.parse(
            JSON.stringify(data)
        );

    } catch {

        return data;

    }

}


/* =========================
   NOW
========================= */

function now() {

    return Date.now();

}


/* =========================
   CLEAN
========================= */

function clean(value) {

    return String(
        value ?? ""
    )
        .trim();

}


/* =========================
   STORAGE AVAILABLE
========================= */

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


/* =========================
   LOAD
========================= */

function loadState() {

    if (
        !storageAvailable()
    ) {

        state =
            createDefaultState();

        return;

    }


    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!raw) {

            state =
                createDefaultState();

            return;

        }


        const saved =
            JSON.parse(raw);


        state = {

            ...createDefaultState(),

            ...saved

        };


        /*
         * Protection against invalid arrays.
         */

        if (
            !Array.isArray(
                state.files
            )
        ) {

            state.files = [];

        }


        if (
            !Array.isArray(
                state.cameras
            )
        ) {

            state.cameras = [];

        }


        if (
            !Array.isArray(
                state.commands
            )
        ) {

            state.commands = [];

        }


        if (
            !Array.isArray(
                state.windows
            )
        ) {

            state.windows = [];

        }


        if (
            !Array.isArray(
                state.categories
            )
        ) {

            state.categories = [];

        }


        if (
            !Array.isArray(
                state.traces
            )
        ) {

            state.traces = [];

        }

    }

    catch (error) {

        console.warn(
            "[MR.SMILE CONDITIONS] Failed to load state:",
            error
        );


        state =
            createDefaultState();

    }

}


/* =========================
   SAVE
========================= */

function saveState() {

    if (
        !storageAvailable()
    ) {

        return false;

    }


    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

        return true;

    }

    catch (error) {

        console.warn(
            "[MR.SMILE CONDITIONS] Failed to save state:",
            error
        );

        return false;

    }

}


/* =========================
   ARRAY UNIQUE PUSH
========================= */

function addUnique(
    array,
    value
) {

    const item =
        clean(value);

    if (!item) {

        return false;

    }


    if (
        array.includes(item)
    ) {

        return false;

    }


    array.push(item);

    return true;

}


/* ==========================================================
   SESSION
========================================================== */


/* =========================
   GET SESSION START
========================= */

function getSessionStart() {

    if (
        Number.isFinite(
            Number(
                state.sessionStartedAt
            )
        )
    ) {

        return Number(
            state.sessionStartedAt
        );

    }


    return now();

}


/* =========================
   SESSION TIME
========================= */

function getSessionTime() {

    const start =
        getSessionStart();

    return Math.max(
        0,
        now() - start
    );

}


/* =========================
   SESSION QUALIFIED
========================= */

function hasMinimumSessionTime() {

    return (
        getSessionTime() >=
        CONFIG.minimumSessionTime
    );

}


/* ==========================================================
   CATEGORY DETECTION
========================================================== */

function registerCategory(
    category
) {

    addUnique(
        state.categories,
        category
    );

}


/* =========================
   ACTION CATEGORY
========================= */

function detectCategory(
    data
) {

    const source =
        clean(
            data?.source
        );

    const type =
        clean(
            data?.type
        );

    const action =
        clean(
            data?.action
        );


    /*
     * Explorer / archive.
     */

    if (
        source ===
        "explorer"
    ) {

        return "archive";

    }


    if (
        type ===
        "file_open" ||
        type ===
        "file_read" ||
        type ===
        "restricted_file" ||
        type ===
        "folder_open" ||
        type ===
        "file_open_failed"
    ) {

        return "archive";

    }


    /*
     * Camera.
     */

    if (
        source ===
        "camera"
    ) {

        return "camera";

    }


    if (
        type ===
        "camera_open" ||
        type ===
        "camera_switch" ||
        type ===
        "camera_close"
    ) {

        return "camera";

    }


    /*
     * Console.
     */

    if (
        source ===
        "console"
    ) {

        return "console";

    }


    if (
        type ===
        "console_command"
    ) {

        return "console";

    }


    /*
     * Windows.
     */

    if (
        source ===
        "windowManager"
    ) {

        return "window";

    }


    if (
        action ===
        "window_open" ||
        action ===
        "window_close" ||
        action ===
        "window_focus" ||
        action ===
        "window_move"
    ) {

        return "window";

    }


    /*
     * Generic system activity.
     */

    return "system";

}


/* ==========================================================
   RESOURCE EXTRACTION
========================================================== */


/* =========================
   FILE IDENTIFIER
========================= */

function getFileIdentifier(
    data
) {

    const metadata =
        data?.metadata ||
        {};


    return (
        metadata.path ||
        metadata.name ||
        data?.target ||
        ""
    );

}


/* =========================
   CAMERA IDENTIFIER
========================= */

function getCameraIdentifier(
    data
) {

    const metadata =
        data?.metadata ||
        {};


    const current =
        metadata.currentCamera ||
        metadata.camera ||
        null;


    return (
        current?.id ||
        metadata.cameraIndex ||
        metadata.currentIndex ||
        data?.target ||
        ""
    );

}


/* =========================
   COMMAND IDENTIFIER
========================= */

function getCommandIdentifier(
    data
) {

    const metadata =
        data?.metadata ||
        {};


    return (
        metadata.command ||
        data?.target ||
        ""
    );

}


/* =========================
   WINDOW IDENTIFIER
========================= */

function getWindowIdentifier(
    data
) {

    const metadata =
        data?.metadata ||
        {};


    return (
        metadata.windowName ||
        data?.target ||
        data?.windowName ||
        ""
    );

}


/* ==========================================================
   ROUTE SELECTION
========================================================== */

function detectRoute() {

    const fileCount =
        state.files.length;

    const cameraCount =
        state.cameras.length;

    const consoleCount =
        state.commands.length;


    /*
     * Archive route.
     */

    if (
        fileCount >= 2 &&
        cameraCount < 2 &&
        consoleCount <= 1
    ) {

        return "archive";

    }


    /*
     * Camera route.
     */

    if (
        cameraCount >= 2 &&
        fileCount <= 2
    ) {

        return "camera";

    }


    /*
     * Console route.
     */

    if (
        consoleCount >= 1 &&
        fileCount <= 1 &&
        cameraCount <= 1
    ) {

        return "console";

    }


    /*
     * Mixed route.
     */

    if (
        fileCount >= 1 &&
        cameraCount >= 1 &&
        consoleCount >= 1
    ) {

        return "mixed";

    }


    /*
     * General route.
     */

    return "general";

}


/* ==========================================================
   CONDITION CHECKS
========================================================== */


/* =========================
   ACTION COUNT
========================= */

function conditionActionCount() {

    return (
        state.actionCount >=
        CONFIG.minimumActions
    );

}


/* =========================
   FILE COUNT
========================= */

function conditionFiles() {

    return (
        state.files.length >=
        CONFIG.minimumFiles
    );

}


/* =========================
   CAMERA COUNT
========================= */

function conditionCameras() {

    return (
        state.cameras.length >=
        CONFIG.minimumCameras
    );

}


/* =========================
   CONSOLE
========================= */

function conditionConsole() {

    return (
        state.commands.length >=
        CONFIG.minimumConsoleCommands
    );

}


/* =========================
   CATEGORIES
========================= */

function conditionCategories() {

    return (
        state.categories.length >=
        CONFIG.minimumCategories
    );

}


/* =========================
   TIME
========================= */

function conditionTime() {

    return (
        hasMinimumSessionTime()
    );

}


/* ==========================================================
   PROGRESS SNAPSHOT
========================================================== */

export function getMrSmileConditions() {

    return {

        ...clone(state),

        progress: {

            actionCount:
                state.actionCount,

            actionsRequired:
                CONFIG.minimumActions,

            files:
                state.files.length,

            filesRequired:
                CONFIG.minimumFiles,

            cameras:
                state.cameras.length,

            camerasRequired:
                CONFIG.minimumCameras,

            consoleCommands:
                state.commands.length,

            consoleRequired:
                CONFIG.minimumConsoleCommands,

            categories:
                state.categories.length,

            categoriesRequired:
                CONFIG.minimumCategories,

            sessionTime:
                getSessionTime(),

            sessionTimeRequired:
                CONFIG.minimumSessionTime,

            traces:
                state.traceCount,

            tracesRequired:
                CONFIG.tracesRequired

        }

    };

}


/* ==========================================================
   TRACE SELECTION
========================================================== */

function chooseTrace() {

    const route =
        state.route ||
        detectRoute();


    /*
     * Archive.
     */

    if (
        route ===
        "archive"
    ) {

        return {
            id:
                "A-01",

            category:
                "archive",

            rarity:
                "common",

            title:
                "ARCHIVE INDEX",

            message:
                "Metadata consistency check returned an unresolved result.",

            detail:
                "SOURCE: ARCHIVE",

            duration:
                4200

        };

    }


    /*
     * Camera.
     */

    if (
        route ===
        "camera"
    ) {

        return {
            id:
                "C-01",

            category:
                "camera",

            rarity:
                "common",

            title:
                "CAMERA MONITOR",

            message:
                "Secondary motion detected during channel transition.",

            detail:
                "STATUS: UNRESOLVED",

            duration:
                4200

        };

    }


    /*
     * Console.
     */

    if (
        route ===
        "console"
    ) {

        return {
            id:
                "X-01",

            category:
                "console",

            rarity:
                "rare",

            title:
                "CONSOLE MONITOR",

            message:
                "Remote response channel returned no source identifier.",

            detail:
                "STATUS: UNRESOLVED",

            duration:
                4200

        };

    }


    /*
     * Mixed.
     */

    if (
        route ===
        "mixed"
    ) {

        return {
            id:
                "S-01",

            category:
                "system",

            rarity:
                "rare",

            title:
                "SYSTEM MONITOR",

            message:
                "A secondary observer was detected outside the active session.",

            detail:
                "IDENTITY: UNAVAILABLE",

            duration:
                4700

        };

    }


    /*
     * General.
     */

    return {

        id:
            "S-00",

        category:
            "system",

        rarity:
            "common",

        title:
            "SYSTEM INTEGRITY",

        message:
            "Transient index discrepancy detected and resolved.",

        detail:
            "STATUS: RESOLVED",

        duration:
            3800

    };

}


/* ==========================================================
   TRACE GUARD
========================================================== */

function canCreateTrace() {

    if (
        state.completed
    ) {

        return false;

    }


    if (
        state.ready
    ) {

        return false;

    }


    if (
        state.traceCount >=
        CONFIG.tracesRequired
    ) {

        return false;

    }


    const current =
        now();


    if (
        current -
            Number(
                state.lastTraceTime || 0
            ) <
        CONFIG.traceCooldown
    ) {

        return false;

    }


    return true;

}


/* ==========================================================
   FIRE TRACE
========================================================== */

function emitTrace() {

    if (
        !canCreateTrace()
    ) {

        return false;

    }


    const trace =
        chooseTrace();


    /*
     * Do not repeat the exact same trace.
     */

    if (
        state.traces.includes(
            trace.id
        )
    ) {

        /*
         * Find an alternative trace
         * based on current route.
         */

        if (
            state.route !==
            "mixed"
        ) {

            state.route =
                "mixed";

        }

        return emitTraceMixed();

    }


    state.traces.push(
        trace.id
    );

    state.lastTrace =
        clone(trace);

    state.lastTraceTime =
        now();

    state.traceCount +=
        1;


    state.route =
        detectRoute();


    saveState();


    trigger(
        "mrsmile:discoveryTrace",
        {

            ...clone(trace),

            route:
                state.route,

            traceNumber:
                state.traceCount,

            timestamp:
                now()

        }
    );


    /*
     * After enough traces,
     * move toward the final discovery state.
     */

    if (
        state.traceCount >=
        CONFIG.tracesRequired
    ) {

        scheduleDiscoveryReady();

    }


    return true;

}


/* ==========================================================
   MIXED TRACE
========================================================== */

function emitTraceMixed() {

    if (
        state.traces.includes(
            "S-02"
        )
    ) {

        return false;

    }


    const trace = {

        id:
            "S-02",

        category:
            "system",

        rarity:
            "very_rare",

        title:
            "COMMUNICATION MONITOR",

        message:
            "A private endpoint was detected outside the current operator session.",

        detail:
            "CHANNEL: UNREGISTERED",

        duration:
            5000

    };


    state.traces.push(
        trace.id
    );

    state.lastTrace =
        clone(trace);

    state.lastTraceTime =
        now();

    state.traceCount +=
        1;

    state.route =
        "mixed";


    saveState();


    trigger(
        "mrsmile:discoveryTrace",
        {

            ...clone(trace),

            route:
                "mixed",

            traceNumber:
                state.traceCount,

            timestamp:
                now()

        }
    );


    if (
        state.traceCount >=
        CONFIG.tracesRequired
    ) {

        scheduleDiscoveryReady();

    }


    return true;

}


/* ==========================================================
   FINAL CONDITION CHECK
========================================================== */

function allConditionsMet() {

    return (

        conditionActionCount() &&

        conditionFiles() &&

        conditionCameras() &&

        conditionConsole() &&

        conditionCategories() &&

        conditionTime()

    );

}


/* ==========================================================
   DISCOVERY READY
========================================================== */

function scheduleDiscoveryReady() {

    if (
        state.ready
    ) {

        return;

    }


    if (
        readyTimer
    ) {

        return;

    }


    /*
     * If not all main conditions are present,
     * traces alone cannot complete discovery.
     */

    if (
        !allConditionsMet()
    ) {

        return;

    }


    state.ready =
        true;

    state.readyAt =
        now();


    state.route =
        detectRoute();


    state.mixedRouteDetected =
        state.route ===
        "mixed";


    saveState();


    readyTimer =
        setTimeout(
            () => {

                readyTimer =
                    null;

                finalizeDiscoveryReady();

            },
            CONFIG.discoveryReadyDelay
        );

}


/* ==========================================================
   FINALIZE DISCOVERY READY
========================================================== */

function finalizeDiscoveryReady() {

    if (
        state.completed
    ) {

        return;

    }


    const masterState =
        getMrSmileState();


    /*
     * Existing First Contact state
     * always wins over discovery.
     */

    if (
        masterState?.firstContact ===
        true
    ) {

        state.completed =
            true;

        saveState();

        return;

    }


    trigger(
        "mrsmile:discoveryReady",
        {

            route:
                state.route,

            traces:
                clone(
                    state.traces
                ),

            progress:
                getMrSmileConditions(),

            timestamp:
                now()

        }
    );


    console.log(
        "[MR.SMILE CONDITIONS] Discovery ready.",
        {
            route:
                state.route,

            traces:
                state.traces

        }
    );

}


/* ==========================================================
   OPERATOR ACTION
========================================================== */

function handleOperatorAction(
    data = {}
) {

    if (
        !state.armed ||
        state.completed
    ) {

        return;

    }


    if (
        !data ||
        typeof data !==
        "object"
    ) {

        return;

    }


    /*
     * Ignore internal MR.SMILE actions.
     */

    if (
        data.source ===
        "mrsmile"
    ) {

        return;

    }


    const action = {

        source:
            clean(
                data.source
            ),

        type:
            clean(
                data.type
            ),

        action:
            clean(
                data.action
            ),

        target:
            clean(
                data.target
            ),

        timestamp:
            now()

    };


    /*
     * Need an actual meaningful event.
     */

    if (
        !action.source &&
        !action.type &&
        !action.action
    ) {

        return;

    }


    state.actionCount +=
        1;


    state.lastAction =
        clone(action);


    /*
     * Category.
     */

    const category =
        detectCategory(
            data
        );


    registerCategory(
        category
    );


    /*
     * Archive.
     */

    if (
        category ===
        "archive"
    ) {

        const file =
            getFileIdentifier(
                data
            );

        if (
            addUnique(
                state.files,
                file
            )
        ) {

            state.archiveTouched =
                true;

        }

    }


    /*
     * Camera.
     */

    if (
        category ===
        "camera"
    ) {

        const camera =
            getCameraIdentifier(
                data
            );

        if (
            addUnique(
                state.cameras,
                camera
            )
        ) {

            state.cameraTouched =
                true;

        }

    }


    /*
     * Console.
     */

    if (
        category ===
        "console"
    ) {

        const command =
            getCommandIdentifier(
                data
            );

        if (
            addUnique(
                state.commands,
                command
            )
        ) {

            state.consoleTouched =
                true;

        }

    }


    /*
     * Windows.
     */

    if (
        category ===
        "window"
    ) {

        const windowName =
            getWindowIdentifier(
                data
            );

        addUnique(
            state.windows,
            windowName
        );

    }


    /*
     * System activity.
     */

    if (
        category ===
        "system"
    ) {

        state.systemTouched =
            true;

    }


    /*
     * Mixed behaviour.
     */

    state.mixedRouteDetected =
        (
            state.files.length >= 1 &&
            state.cameras.length >= 1 &&
            state.commands.length >= 1
        );


    /*
     * Route recalculation.
     */

    state.route =
        detectRoute();


    saveState();


    /*
     * The first trace should not
     * fire instantly on the first action.
     *
     * Time + minimum action count are
     * required first.
     */

    evaluateDiscovery();

}


/* ==========================================================
   DISCOVERY EVALUATION
========================================================== */

function evaluateDiscovery() {

    if (
        state.completed
    ) {

        return;

    }


    if (
        state.ready
    ) {

        return;

    }


    /*
     * Main threshold:
     * enough normal activity.
     */

    if (
        !conditionActionCount()
    ) {

        return;

    }


    /*
     * The operator must actually
     * explore the system.
     */

    const explorationReady = (

        conditionFiles() ||

        conditionCameras() ||

        conditionConsole()

    );


    if (
        !explorationReady
    ) {

        return;

    }


    /*
     * First trace:
     *
     * time is not mandatory yet,
     * so a long normal session is
     * still required later.
     */

    if (
        state.traceCount ===
        0 &&
        hasMinimumSessionTime()
    ) {

        emitTrace();

        return;

    }


    /*
     * Second trace:
     * requires broader activity.
     */

    if (
        state.traceCount <
        CONFIG.tracesRequired &&
        conditionCategories()
    ) {

        emitTrace();

        return;

    }


    /*
     * Final discovery sequence.
     */

    scheduleDiscoveryReady();

}


/* ==========================================================
   FIRST CONTACT COMPLETED
========================================================== */

function handleFirstContactCompleted() {

    state.completed =
        true;

    state.ready =
        true;


    if (
        readyTimer
    ) {

        clearTimeout(
            readyTimer
        );

        readyTimer =
            null;

    }


    saveState();


    console.log(
        "[MR.SMILE CONDITIONS] Discovery completed."
    );

}


/* ==========================================================
   FIRST CONTACT RESET
========================================================== */

export function resetMrSmileConditions() {

    if (
        readyTimer
    ) {

        clearTimeout(
            readyTimer
        );

        readyTimer =
            null;

    }


    state =
        createDefaultState();

    saveState();


    trigger(
        "mrsmile:conditionsReset",
        {

            timestamp:
                now()

        }
    );


    console.log(
        "[MR.SMILE CONDITIONS] Reset."
    );


    return true;

}


/* ==========================================================
   DEVELOPMENT / DEBUG API
========================================================== */

function exposeDebugAPI() {

    if (
        typeof window ===
        "undefined"
    ) {

        return;

    }


    window.getMrSmileConditions =
        getMrSmileConditions;


    window.resetMrSmileConditions =
        resetMrSmileConditions;


    window.MRSMILE_CONDITIONS = {

        get:
            getMrSmileConditions,

        reset:
            resetMrSmileConditions,

        evaluate:
            evaluateDiscovery

    };

}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileConditions() {

    if (
        initialized
    ) {

        return;

    }


    initialized =
        true;


    loadState();


    state.initialized =
        true;


    /*
     * Create session timestamp only
     * when no valid previous session exists.
     */

    if (
        !state.sessionStartedAt
    ) {

        state.sessionStartedAt =
            now();

    }


    /*
     * Remember current route.
     */

    state.route =
        detectRoute();


    /*
     * Existing First Contact
     * permanently disables discovery.
     */

    try {

        const masterState =
            getMrSmileState();


        if (
            masterState?.firstContact ===
            true ||
            masterState?.accepted ===
            true
        ) {

            state.completed =
                true;

            state.ready =
                true;

        }

    }

    catch (error) {

        console.warn(
            "[MR.SMILE CONDITIONS] Master state check failed:",
            error
        );

    }


    saveState();


    /*
     * Operator actions.
     */

    on(
        "mrsmile:operatorAction",
        handleOperatorAction
    );


    /*
     * Official First Contact completion.
     */

    on(
        "mrsmile:firstContactCompleted",
        handleFirstContactCompleted
    );


    /*
     * If another module explicitly resets
     * the First Contact state, reset discovery too.
     */

    on(
        "mrsmile:firstContactReset",
        resetMrSmileConditions
    );


    exposeDebugAPI();


    console.log(
        "[MR.SMILE CONDITIONS] Hidden discovery engine initialized.",
        getMrSmileConditions()
    );

}


/* ==========================================================
   AUTO INIT
========================================================== */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        initMrSmileConditions();

    }
);
