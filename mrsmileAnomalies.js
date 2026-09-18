/* ==========================================================
   MR.SMILE ANOMALIES
   OMEGA / MIRROR-INT

   PURPOSE
   ----------------------------------------------------------
   Independent rare-event engine.

   RESPONSIBILITIES
   - rare OMEGA anomalies
   - probabilities
   - cooldowns
   - exclusions
   - persistent "seen" state
   - post-contact events

   DOES NOT:
   - control First Contact
   - activate MR.SMILE directly
   - replace mrsmileConditions.js
   - replace mrsmileDiscovery.js
   - create jumpscares

   PIPELINE

       NORMAL OPERATOR ACTIVITY
                ↓
       mrsmileAnomalies.js
                ↓
       rare event candidate
                ↓
       probability / conditions
                ↓
       anomaly event
                ↓
       OMEGA trace / future subsystem
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
    "mrsmile_anomalies_v1";


/* ==========================================================
   VERSION
========================================================== */

const VERSION =
    1;


/* ==========================================================
   CONFIGURATION
========================================================== */

const CONFIG = {

    minimumActions:
        8,

    minimumSessionTime:
        45000,

    actionCooldown:
        18000,

    globalCooldown:
        30000,

    postContactCooldown:
        20000,

    intervalCheck:
        15000,

    maxEventsPerSession:
        8,

    enablePostContact:
        true

};


/* ==========================================================
   DEFAULT STATE
========================================================== */

const DEFAULT_STATE = {

    version:
        VERSION,

    initialized:
        false,

    sessionStartedAt:
        null,

    actionCount:
        0,

    totalEvents:
        0,

    sessionEvents:
        0,

    lastEventTime:
        0,

    lastActionTime:
        0,

    lastCategory:
        null,

    lastEventId:
        null,

    postContact:
        false,

    seen:
        [],

    eventLog:
        []

};


/* ==========================================================
   RUNTIME
========================================================== */

let state =
    createDefaultState();

let initialized =
    false;

let intervalId =
    null;

/* ==========================================================
   BEHAVIOR MEMORY
========================================================== */

const BEHAVIOR_CONFIG = {

    recentActionsLimit:
        40,

    repeatFileWindow:
        120000,

    rapidCameraWindow:
        7000,

    rapidCameraCount:
        3,

    rapidConsoleWindow:
        1500,

    archiveConsoleWindow:
        12000,

    postContactActionLimit:
        3

};


function createBehaviorState() {

    return {

        recentActions:
            [],

        fileReads:
            {},

        fileOpens:
            {},

        cameraSwitches:
            [],

        consoleCommands:
            [],

        lastFile:
            null,

        lastCamera:
            null,

        lastConsole:
            null,

        lastActionAt:
            0,

        contactAt:
            null,

        postContactActions:
            0

    };

}


function ensureBehaviorState() {

    if (
        !state.behavior ||
        typeof state.behavior !==
        "object"
    ) {

        state.behavior =
            createBehaviorState();

    }

    if (
        !Array.isArray(
            state.behavior.recentActions
        )
    ) {

        state.behavior.recentActions =
            [];

    }

    if (
        !Array.isArray(
            state.behavior.cameraSwitches
        )
    ) {

        state.behavior.cameraSwitches =
            [];

    }

    if (
        !Array.isArray(
            state.behavior.consoleCommands
        )
    ) {

        state.behavior.consoleCommands =
            [];

    }

    if (
        typeof state.behavior.fileReads !==
        "object"
    ) {

        state.behavior.fileReads =
            {};

    }

    if (
        typeof state.behavior.fileOpens !==
        "object"
    ) {

        state.behavior.fileOpens =
            {};

    }

}


function getActionTarget(
    data = {}
) {

    const metadata =
        data.metadata &&
        typeof data.metadata ===
        "object"
            ? data.metadata
            : {};

    return clean(
        data.target ||
        metadata.path ||
        metadata.name ||
        metadata.file ||
        metadata.cameraId ||
        metadata.camera ||
        data.camera ||
        data.command ||
        metadata.command ||
        data.window ||
        ""
    );

}


function incrementMap(
    map,
    key
) {

    const value =
        clean(key);

    if (!value) {

        return;

    }

    map[value] =
        Number(map[value] || 0) + 1;

}


function trackBehavior(
    data = {}
) {

    ensureBehaviorState();

    const timestamp =
        now();

    const type =
        clean(
            data.type ||
            data.action
        );

    const category =
        getActionCategory(
            data
        );

    const target =
        getActionTarget(
            data
        );

    const action =
        {
            type,
            category,
            target,
            timestamp
        };

    state.behavior.recentActions.push(
        action
    );

    if (
        state.behavior.recentActions.length >
        BEHAVIOR_CONFIG.recentActionsLimit
    ) {

        state.behavior.recentActions =
            state.behavior.recentActions.slice(
                -BEHAVIOR_CONFIG.recentActionsLimit
            );

    }


    if (
        type ===
        "file_read"
    ) {

        incrementMap(
            state.behavior.fileReads,
            target
        );

        state.behavior.lastFile =
            target || null;

    }


    if (
        type ===
        "file_open"
    ) {

        incrementMap(
            state.behavior.fileOpens,
            target
        );

        state.behavior.lastFile =
            target || null;

    }


    if (
        type ===
        "camera_switch"
    ) {

        state.behavior.cameraSwitches.push(
            {
                target:
                    target || null,
                timestamp
            }
        );

        state.behavior.cameraSwitches =
            state.behavior.cameraSwitches.filter(
                entry =>
                    timestamp -
                    entry.timestamp <=
                    BEHAVIOR_CONFIG.rapidCameraWindow
            );

        state.behavior.lastCamera =
            target || null;

    }


    if (
        type ===
        "console_command"
    ) {

        state.behavior.consoleCommands.push(
            {
                target:
                    target || null,
                timestamp
            }
        );

        state.behavior.consoleCommands =
            state.behavior.consoleCommands.slice(
                -20
            );

        state.behavior.lastConsole =
            target || null;

    }


    if (
        state.postContact
    ) {

        state.behavior.postContactActions +=
            1;

    }


    state.behavior.lastActionAt =
        timestamp;

    saveState();

}


function getRecentAction(
    type,
    windowMs
) {

    ensureBehaviorState();

    const cutoff =
        now() -
        windowMs;

    for (
        let i =
            state.behavior.recentActions.length - 1;
        i >= 0;
        i--
    ) {

        const action =
            state.behavior.recentActions[i];

        if (
            action.timestamp < cutoff
        ) {

            break;

        }

        if (
            action.type === type
        ) {

            return action;

        }

    }

    return null;

}


function getFileReadCount(
    target
) {

    ensureBehaviorState();

    const key =
        clean(target);

    if (!key) {

        return 0;

    }

    return Number(
        state.behavior.fileReads[key] || 0
    );

}


function wasFileReadBefore(
    target
) {

    return (
        getFileReadCount(
            target
        ) > 0
    );

}


function hasRapidCameraActivity() {

    ensureBehaviorState();

    const cutoff =
        now() -
        BEHAVIOR_CONFIG.rapidCameraWindow;

    const recent =
        state.behavior.cameraSwitches.filter(
            entry =>
                entry.timestamp >= cutoff
        );

    return (
        recent.length >=
        BEHAVIOR_CONFIG.rapidCameraCount
    );

}


function hasArchiveThenConsole() {

    const cutoff =
        now() -
        BEHAVIOR_CONFIG.archiveConsoleWindow;

    for (
        let i =
            state.behavior.recentActions.length - 1;
        i >= 0;
        i--
    ) {

        const action =
            state.behavior.recentActions[i];

        if (
            action.timestamp <
            cutoff
        ) {

            break;

        }

        if (
            action.category ===
            "archive"
        ) {

            return true;

        }

    }

    return false;

}


function hasRapidConsoleSequence() {

    const commands =
        state.behavior.consoleCommands;

    if (
        commands.length < 2
    ) {

        return false;

    }

    const last =
        commands[
            commands.length - 1
        ];

    const previous =
        commands[
            commands.length - 2
        ];

    return (
        last.timestamp -
        previous.timestamp <=
        BEHAVIOR_CONFIG.rapidConsoleWindow
    );

}


function hasPostContactPersistence() {

    return (
        state.postContact &&
        state.behavior.postContactActions >=
        BEHAVIOR_CONFIG.postContactActionLimit
    );

}


/* ==========================================================
   HELPERS
========================================================== */

function createDefaultState() {

    return JSON.parse(
        JSON.stringify(
            DEFAULT_STATE
        )
    );

}


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


function now() {

    return Date.now();

}


function clean(value) {

    return String(
        value ?? ""
    ).trim();

}


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

    } catch (error) {

        console.warn(
            "[MR.SMILE ANOMALIES] Save failed:",
            error
        );

        return false;

    }

}


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


        if (
            !Array.isArray(
                state.seen
            )
        ) {

            state.seen = [];

        }


        if (
            !Array.isArray(
                state.eventLog
            )
        ) {

            state.eventLog = [];

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE ANOMALIES] Load failed:",
            error
        );

        state =
            createDefaultState();

    }

}


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


function hasSeen(id) {

    return state.seen.includes(
        id
    );

}


function getMrSmileFirstContactState() {

    try {

        const master =
            getMrSmileState();

        return {

            firstContact:
                master?.firstContact ===
                true,

            accepted:
                master?.accepted ===
                true

        };

    } catch {

        return {

            firstContact:
                false,

            accepted:
                false

        };

    }

}


function hasFirstContact() {

    const contact =
        getMrSmileFirstContactState();

    return (
        contact.firstContact ||
        contact.accepted ||
        state.postContact
    );

}


function getSessionTime() {

    if (
        !Number.isFinite(
            Number(
                state.sessionStartedAt
            )
        )
    ) {

        return 0;

    }

    return Math.max(
        0,
        now() -
        Number(
            state.sessionStartedAt
        )
    );

}


function getActionCategory(
    data = {}
) {

    const source =
        clean(
            data.source
        );

    const type =
        clean(
            data.type
        );

    if (
        source ===
        "explorer"
    ) {

        return "archive";

    }


    if (
        source ===
        "camera"
    ) {

        return "camera";

    }


    if (
        source ===
        "console"
    ) {

        return "console";

    }


    if (
        source ===
        "windowManager"
    ) {

        return "window";

    }


    if (
        type ===
        "file_open" ||
        type ===
        "file_read" ||
        type ===
        "restricted_file" ||
        type ===
        "folder_open"
    ) {

        return "archive";

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


    if (
        type ===
        "console_command"
    ) {

        return "console";

    }


    return "system";

}


/* ==========================================================
   ANOMALY DEFINITIONS
========================================================== */

const ANOMALIES = [

    /* ======================================================
       ARCHIVE
    ====================================================== */

    {

        id:
            "A-01",

        category:
            "archive",

        rarity:
            "common",

        probability:
            0.22,

        triggerTypes: [
            "file_open",
            "file_read",
            "restricted_file"
        ],

        message:
            "Archive index returned inconsistent metadata for the requested record.",

        detail:
            "SOURCE: ARCHIVE / STATUS: UNRESOLVED",

        reason:
            "archive_metadata_mismatch"

    },


    {

        id:
            "A-02",

        category:
            "archive",

        rarity:
            "rare",

        probability:
            0.09,

        triggerTypes: [
            "file_read"
        ],

        requiresSeen:
            ["A-01"],

        excludes:
            ["A-03"],

        message:
            "A previously unavailable document is now present in the current archive index.",

        detail:
            "INDEX UPDATE: NO CHANGE RECORD FOUND",

        reason:
            "archive_document_appeared"

    },


    {

        id:
            "A-03",

        category:
            "archive",

        rarity:
            "very_rare",

        probability:
            0.045,

        triggerTypes: [
            "file_read"
        ],

        excludes:
            ["A-02"],

        message:
            "Record author metadata does not match the registered document owner.",

        detail:
            "AUTHOR: UNRESOLVED",

        reason:
            "archive_wrong_author"

    },


    /* ======================================================
       CAMERA
    ====================================================== */

    {

        id:
            "C-01",

        category:
            "camera",

        rarity:
            "common",

        probability:
            0.19,

        triggerTypes: [
            "camera_switch"
        ],

        message:
            "Secondary motion detected during channel transition.",

        detail:
            "SOURCE: CAMERA MONITOR / STATUS: UNRESOLVED",

        reason:
            "camera_extra_movement"

    },


    {

        id:
            "C-02",

        category:
            "camera",

        rarity:
            "rare",

        probability:
            0.075,

        triggerTypes: [
            "camera_open",
            "camera_switch"
        ],

        excludes:
            ["C-04"],

        message:
            "Camera channel was queried from a session without a matching operator action.",

        detail:
            "REQUESTOR: UNREGISTERED",

        reason:
            "camera_external_access"

    },


    {

        id:
            "C-03",

        category:
            "camera",

        rarity:
            "rare",

        probability:
            0.07,

        triggerTypes: [
            "camera_switch",
            "camera_open"
        ],

        message:
            "Camera timestamp differs from the active OMEGA system clock.",

        detail:
            "CLOCK OFFSET: UNRESOLVED",

        reason:
            "camera_wrong_time"

    },


    {

        id:
            "C-04",

        category:
            "camera",

        rarity:
            "very_rare",

        probability:
            0.025,

        triggerTypes: [
            "camera_switch"
        ],

        excludes:
            ["C-02"],

        message:
            "Unresolved signal detected on a camera channel with no registered source.",

        detail:
            "SIGNAL: UNKNOWN",

        reason:
            "camera_unknown_signal"

    },


    /* ======================================================
       CONSOLE
    ====================================================== */

    {

        id:
            "X-01",

        category:
            "console",

        rarity:
            "common",

        probability:
            0.17,

        triggerTypes: [
            "console_command"
        ],

        message:
            "Console response returned without a matching process identifier.",

        detail:
            "PROCESS: UNREGISTERED",

        reason:
            "console_unknown_response"

    },


    {

        id:
            "X-02",

        category:
            "console",

        rarity:
            "rare",

        probability:
            0.065,

        triggerTypes: [
            "console_command"
        ],

        message:
            "Command history contains an entry not associated with the current operator.",

        detail:
            "HISTORY SOURCE: UNKNOWN",

        reason:
            "console_history_mismatch"

    },


    {

        id:
            "X-03",

        category:
            "console",

        rarity:
            "very_rare",

        probability:
            0.035,

        triggerTypes: [
            "console_command"
        ],

        message:
            "Console input channel acknowledged a request before execution.",

        detail:
            "SEQUENCE ORDER: INVALID",

        reason:
            "console_pre_execution_response"

    },


    /* ======================================================
       TIME
    ====================================================== */

    {

        id:
            "T-01",

        category:
            "time",

        rarity:
            "rare",

        probability:
            0.06,

        triggerTypes: [
            "interval"
        ],

        excludes:
            ["T-02"],

        message:
            "Recorded system time moved backwards by a measurable interval.",

        detail:
            "TIME SOURCE: OMEGA / OFFSET: NEGATIVE",

        reason:
            "time_backward"

    },


    {

        id:
            "T-02",

        category:
            "time",

        rarity:
            "very_rare",

        probability:
            0.025,

        triggerTypes: [
            "interval"
        ],

        excludes:
            ["T-01"],

        message:
            "A future timestamp was registered before the corresponding event occurred.",

        detail:
            "TIMESTAMP ORDER: INVALID",

        reason:
            "time_future_event"

    },


    {

        id:
            "T-03",

        category:
            "time",

        rarity:
            "rare",

        probability:
            0.05,

        triggerTypes: [
            "interval"
        ],

        message:
            "An archive event predates the start of the current operator session.",

        detail:
            "REFERENCE TIME: CONFLICTING",

        reason:
            "time_old_event"

    },


    /* ======================================================
       SYSTEM
    ====================================================== */

    {

        id:
            "S-01",

        category:
            "system",

        rarity:
            "rare",

        probability:
            0.08,

        triggerTypes: [
            "window_open",
            "window_focus",
            "window_move"
        ],

        message:
            "Secondary observer activity detected outside the active operator session.",

        detail:
            "IDENTITY: UNAVAILABLE",

        reason:
            "secondary_observer"

    },


    {

        id:
            "S-02",

        category:
            "system",

        rarity:
            "very_rare",

        probability:
            0.0,

        triggerTypes: [],

        disabled:
            true,

        message:
            "Reserved for the official unregistered communication channel.",

        detail:
            "CONTROLLED BY: MR.SMILE DISCOVERY",

        reason:
            "reserved_discovery_channel"

    },


    {

        id:
            "S-03",

        category:
            "system",

        rarity:
            "common",

        probability:
            0.13,

        triggerTypes: [
            "interval"
        ],

        falsePositive:
            true,

        message:
            "Transient system warning detected and resolved.",

        detail:
            "STATUS: RESOLVED",

        reason:
            "benign_system_warning"

    },


    /* ======================================================
       DIRECT / POST CONTACT
    ====================================================== */

    {

        id:
            "M-01",

        category:
            "direct",

        rarity:
            "rare",

        probability:
            0.08,

        triggerTypes: [
            "file_read",
            "window_open",
            "console_command"
        ],

        postContact:
            true,

        message:
            "Good evening.",

        detail:
            "SOURCE: PRIVATE CHANNEL",

        reason:
            "direct_greeting"

    },


    {

        id:
            "M-02",

        category:
            "direct",

        rarity:
            "rare",

        probability:
            0.055,

        triggerTypes: [
            "file_read"
        ],

        postContact:
            true,

        message:
            "I remember that file.",

        detail:
            "SOURCE: UNREGISTERED",

        reason:
            "direct_file_memory"

    },


    {

        id:
            "M-03",

        category:
            "direct",

        rarity:
            "very_rare",

        probability:
            0.025,

        triggerTypes: [
            "window_open",
            "camera_switch",
            "console_command"
        ],

        postContact:
            true,

        message:
            "You are still here.",

        detail:
            "SOURCE: PRIVATE CHANNEL",

        reason:
            "direct_operator_notice"

    },


    {

        id:
            "M-04",

        category:
            "direct",

        rarity:
            "contact",

        probability:
            0.0,

        triggerTypes: [],

        disabled:
            true,

        message:
            "Reserved for official First Contact.",

        detail:
            "CONTROLLED BY: MR.SMILE EVENTS",

        reason:
            "official_first_contact"

    }

];


/* ==========================================================
   EVENT LOOKUP
========================================================== */

function getAnomaly(
    id
) {

    return ANOMALIES.find(
        anomaly =>
            anomaly.id ===
            id
    ) || null;

}


/* ==========================================================
   ELIGIBILITY
========================================================== */

function eventMatchesAction(
    anomaly,
    actionType
) {

    if (
        !Array.isArray(
            anomaly.triggerTypes
        )
    ) {

        return false;

    }

    return anomaly.triggerTypes.includes(
        actionType
    );

}


function hasRequiredSeen(
    anomaly
) {

    const required =
        Array.isArray(
            anomaly.requiresSeen
        )
            ? anomaly.requiresSeen
            : [];

    return required.every(
        id =>
            hasSeen(id)
    );

}


function hasExclusion(
    anomaly
) {

    const exclusions =
        Array.isArray(
            anomaly.excludes
        )
            ? anomaly.excludes
            : [];

    return exclusions.some(
        id =>
            hasSeen(id)
    );

}


function canTrigger(
    anomaly
) {

    if (
        !anomaly ||
        anomaly.disabled
    ) {

        return false;

    }


    if (
        hasSeen(
            anomaly.id
        )
    ) {

        return false;

    }


    if (
        state.sessionEvents >=
        CONFIG.maxEventsPerSession
    ) {

        return false;

    }


    if (
        !hasRequiredSeen(
            anomaly
        )
    ) {

        return false;

    }


    if (
        hasExclusion(
            anomaly
        )
    ) {

        return false;

    }


    if (
        state.actionCount <
        CONFIG.minimumActions
    ) {

        return false;

    }


    if (
        getSessionTime() <
        CONFIG.minimumSessionTime
    ) {

        return false;

    }


    const current =
        now();


    if (
        current -
        state.lastEventTime <
        CONFIG.globalCooldown
    ) {

        return false;

    }


    if (
        anomaly.postContact &&
        !hasFirstContact()
    ) {

        return false;

    }


    if (
        !anomaly.postContact &&
        anomaly.category ===
        "direct"
    ) {

        return false;

    }


    return true;

}


/* ==========================================================
   RANDOM
========================================================== */

function roll(
    probability
) {

    const value =
        Number(
            probability
        );

    if (
        !Number.isFinite(
            value
        )
    ) {

        return false;

    }

    return (
        Math.random() <
        value
    );

}


/* ==========================================================
   EVENT PAYLOAD
========================================================== */

function createPayload(
    anomaly,
    action = null
) {

    return {

        id:
            anomaly.id,

        category:
            anomaly.category,

        rarity:
            anomaly.rarity,

        title:
            anomaly.category ===
            "direct"
                ? "PRIVATE COMMUNICATION"
                : `${anomaly.category.toUpperCase()} MONITOR`,

        message:
            anomaly.message,

        detail:
            anomaly.detail,

        reason:
            anomaly.reason,

        falsePositive:
            anomaly.falsePositive ===
            true,

        source:
            "mrsmileAnomalies",

        action:
            clone(action),

        timestamp:
            now()

    };

}


/* ==========================================================
   EVENT LOG
========================================================== */

function recordAnomaly(
    anomaly,
    payload
) {

    addUnique(
        state.seen,
        anomaly.id
    );


    state.totalEvents +=
        1;

    state.sessionEvents +=
        1;

    state.lastEventTime =
        now();

    state.lastEventId =
        anomaly.id;

    state.lastCategory =
        anomaly.category;


    state.eventLog.push({

        id:
            anomaly.id,

        category:
            anomaly.category,

        rarity:
            anomaly.rarity,

        timestamp:
            now(),

        reason:
            anomaly.reason

    });


    if (
        state.eventLog.length >
        100
    ) {

        state.eventLog =
            state.eventLog.slice(
                -100
            );

    }


    saveState();

}


/* ==========================================================
   EMIT ANOMALY
========================================================== */

function emitAnomaly(
    anomaly,
    action = null,
    options = {}
) {

    if (
        !anomaly
    ) {

        return false;

    }


    const force =
        options.force ===
        true;


    if (
        !force &&
        !canTrigger(
            anomaly
        )
    ) {

        return false;

    }


    if (
        !force &&
        !roll(
            anomaly.probability
        )
    ) {

        return false;

    }


    const payload =
        createPayload(
            anomaly,
            action
        );


    recordAnomaly(
        anomaly,
        payload
    );


    /*
     * Main anomaly event.
     */

    trigger(
        "mrsmile:anomaly",
        clone(
            payload
        )
    );


    /*
     * Visible OMEGA trace.
     *
     * Existing discovery presentation
     * already knows how to render this.
     */

    trigger(
        "mrsmile:discoveryTrace",
        {

            id:
                payload.id,

            category:
                payload.category,

            rarity:
                payload.rarity,

            title:
                payload.title,

            message:
                payload.message,

            detail:
                payload.detail,

            anomaly:
                true,

            falsePositive:
                payload.falsePositive,

            source:
                "mrsmileAnomalies",

            timestamp:
                payload.timestamp

        }
    );


    /*
     * Specialized event.
     */

    trigger(
        `mrsmile:anomaly:${anomaly.id}`,
        clone(
            payload
        )
    );


    console.log(
        "[MR.SMILE ANOMALIES]",
        anomaly.id,
        payload
    );


    return true;

}


/* ==========================================================
   ACTION EVALUATION
========================================================== */

function evaluateAction(
    data = {}
) {

    if (
        !initialized
    ) {

        return false;

    }


    if (
        !data ||
        typeof data !==
        "object"
    ) {

        return false;

    }


    if (
        data.source ===
        "mrsmile"
    ) {

        return false;

    }


    const actionType =
        clean(
            data.type ||
            data.action
        );


    if (!actionType) {

        return false;

    }


    state.actionCount +=
        1;

    state.lastActionTime =
        now();


    saveState();


    const eligible =
        ANOMALIES.filter(
            anomaly =>
                !anomaly.disabled &&
                eventMatchesAction(
                    anomaly,
                    actionType
                ) &&
                canTrigger(
                    anomaly
                )
        );


    if (
        eligible.length ===
        0
    ) {

        return false;

    }


    /*
     * Shuffle candidates.
     *
     * This prevents the same ordering
     * from always being selected.
     */

    const shuffled =
        [...eligible].sort(
            () =>
                Math.random() -
                0.5
        );


    for (
        const anomaly of shuffled
    ) {

        if (
            emitAnomaly(
                anomaly,
                data
            )
        ) {

            return true;

        }

    }


    return false;

}


/* ==========================================================
   INTERVAL ANOMALIES
========================================================== */

function evaluateInterval() {

    if (
        !initialized
    ) {

        return false;

    }


    if (
        state.actionCount <
        CONFIG.minimumActions
    ) {

        return false;

    }


    if (
        getSessionTime() <
        CONFIG.minimumSessionTime
    ) {

        return false;

    }


    const eligible =
        ANOMALIES.filter(
            anomaly =>
                !anomaly.disabled &&
                anomaly.triggerTypes.includes(
                    "interval"
                ) &&
                canTrigger(
                    anomaly
                )
        );


    if (
        eligible.length ===
        0
    ) {

        return false;

    }


    const shuffled =
        [...eligible].sort(
            () =>
                Math.random() -
                0.5
        );


    for (
        const anomaly of shuffled
    ) {

        if (
            emitAnomaly(
                anomaly,
                {
                    type:
                        "interval",
                    action:
                        "system_monitor"
                }
            )
        ) {

            return true;

        }

    }


    return false;

}


/* ==========================================================
   FIRST CONTACT
========================================================== */

function handleFirstContactCompleted() {

    state.postContact =
        true;

    saveState();


    trigger(
        "mrsmile:anomaliesPostContactEnabled",
        {

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   SESSION
========================================================== */

function initializeSession() {

    if (
        !state.sessionStartedAt
    ) {

        state.sessionStartedAt =
            now();

    }


    state.actionCount =
        Number(
            state.actionCount
        ) || 0;

    state.sessionEvents =
        0;

}


/* ==========================================================
   RESET
========================================================== */

export function resetMrSmileAnomalies() {

    if (
        intervalId
    ) {

        clearInterval(
            intervalId
        );

        intervalId =
            null;

    }


    state =
        createDefaultState();


    saveState();


    trigger(
        "mrsmile:anomaliesReset",
        {

            timestamp:
                now()

        }
    );


    console.log(
        "[MR.SMILE ANOMALIES] Reset."
    );


    /*
     * Restart interval if already initialized.
     */

    if (
        initialized
    ) {

        initializeSession();


        intervalId =
            setInterval(
                evaluateInterval,
                CONFIG.intervalCheck
            );

    }


    return true;

}


/* ==========================================================
   STATUS
========================================================== */

export function getMrSmileAnomaliesStatus() {

    return {

        initialized:
            initialized,

        version:
            VERSION,

        actionCount:
            state.actionCount,

        sessionTime:
            getSessionTime(),

        totalEvents:
            state.totalEvents,

        sessionEvents:
            state.sessionEvents,

        maxEventsPerSession:
            CONFIG.maxEventsPerSession,

        lastEventTime:
            state.lastEventTime,

        lastEventId:
            state.lastEventId,

        lastCategory:
            state.lastCategory,

        postContact:
            hasFirstContact(),

        seen:
            [...state.seen],

        eventLog:
            clone(
                state.eventLog
            )

    };

}


/* ==========================================================
   DEBUG API
========================================================== */

export function testMrSmileAnomaly(
    id
) {

    const anomaly =
        getAnomaly(
            clean(id)
        );


    if (
        !anomaly
    ) {

        console.warn(
            "[MR.SMILE ANOMALIES] Unknown anomaly:",
            id
        );

        return false;

    }


    return emitAnomaly(
        anomaly,
        {

            source:
                "debug",

            type:
                "debug_test",

            action:
                "manual_test"

        },
        {
            force:
                true
        }
    );

}


function exposeDebugAPI() {

    if (
        typeof window ===
        "undefined"
    ) {

        return;

    }


    window.getMrSmileAnomaliesStatus =
        getMrSmileAnomaliesStatus;


    window.resetMrSmileAnomalies =
        resetMrSmileAnomalies;


    window.testMrSmileAnomaly =
        testMrSmileAnomaly;


    window.MRSMILE_ANOMALIES = {

        status:
            getMrSmileAnomaliesStatus,

        reset:
            resetMrSmileAnomalies,

        test:
            testMrSmileAnomaly

    };

}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileAnomalies() {

    if (
        initialized
    ) {

        return getMrSmileAnomaliesStatus();

    }


    initialized =
        true;


    loadState();

    initializeSession();


    /*
     * Detect post-contact state.
     */

    if (
        hasFirstContact()
    ) {

        state.postContact =
            true;

    }


    saveState();


    on(
        "mrsmile:operatorAction",
        evaluateAction
    );


    on(
        "mrsmile:firstContactCompleted",
        handleFirstContactCompleted
    );


    intervalId =
        setInterval(
            evaluateInterval,
            CONFIG.intervalCheck
        );


    exposeDebugAPI();


    console.log(
        "[MR.SMILE ANOMALIES] Initialized."
    );


    return getMrSmileAnomaliesStatus();

}


/* ==========================================================
   AUTO INIT
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.addEventListener(
        "DOMContentLoaded",
        () => {

            initMrSmileAnomalies();

        }
    );

}


/* ==========================================================
   EXPORT
========================================================== */

export default {

    init:
        initMrSmileAnomalies,

    status:
        getMrSmileAnomaliesStatus,

    reset:
        resetMrSmileAnomalies,

    test:
        testMrSmileAnomaly

};
