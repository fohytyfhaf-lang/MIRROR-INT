/* ==========================================================
   OMEGA TIME SYSTEM
   MIRROR-INT / OMEGA

   PURPOSE
   ----------------------------------------------------------
   Central internal time service.

   RESPONSIBILITIES
   - single OMEGA time source
   - session start timestamp
   - wall-clock monitoring
   - monotonic clock comparison
   - timestamp conflict detection
   - future / past event detection
   - time observations for anomaly system

   DOES NOT:
   - control MR.SMILE
   - trigger First Contact
   - create visual effects
========================================================== */


/* ==========================================================
   IMPORTS
========================================================== */

import {
    on,
    trigger
} from "./eventManager.js";


/* ==========================================================
   STORAGE
========================================================== */

const STORAGE_KEY =
    "omega_time_v1";


const VERSION =
    1;


/* ==========================================================
   CONFIG
========================================================== */

const CONFIG = {

    backwardThreshold:
        1000,

    futureThreshold:
        60000,

    oldEventThreshold:
        1000,

    conflictCooldown:
        30000,

    monitorInterval:
        5000

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

    lastWallTime:
        null,

    lastMonoTime:
        null,

    lastOmegaTime:
        null,

    lastConflict:
        null,

    conflictCount:
        0,

    conflictLog:
        []

};


let state =
    createDefaultState();


let initialized =
    false;


let intervalId =
    null;


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


function now() {

    return Date.now();

}


function monoNow() {

    if (
        typeof performance !==
        "undefined" &&
        typeof performance.now ===
        "function"
    ) {

        return performance.now();

    }

    return 0;

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
            JSON.stringify(
                data
            )
        );

    } catch {

        return data;

    }

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
            JSON.stringify(
                state
            )
        );

        return true;

    } catch (error) {

        console.warn(
            "[OMEGA TIME] Save failed:",
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
            JSON.parse(
                raw
            );


        state = {

            ...createDefaultState(),

            ...saved

        };


        if (
            !Array.isArray(
                state.conflictLog
            )
        ) {

            state.conflictLog =
                [];

        }

    } catch (error) {

        console.warn(
            "[OMEGA TIME] Load failed:",
            error
        );

        state =
            createDefaultState();

    }

}


/* ==========================================================
   OMEGA CLOCK
========================================================== */

export function getOmegaNow() {

    return now();

}


export function getOmegaTimeDate() {

    return new Date(
        getOmegaNow()
    );

}


export function formatOmegaTime(
    includeSeconds = false
) {

    const date =
        getOmegaTimeDate();


    const hours =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );


    if (!includeSeconds) {

        return (
            `${hours}:${minutes}`
        );

    }


    const seconds =
        String(
            date.getSeconds()
        ).padStart(
            2,
            "0"
        );


    return (
        `${hours}:${minutes}:${seconds}`
    );

}


/* ==========================================================
   CONFLICT EMISSION
========================================================== */

function emitTimeConflict(
    reason,
    details = {}
) {

    const timestamp =
        now();


    if (
        state.lastConflict &&
        state.lastConflict.reason ===
        reason &&
        timestamp -
        Number(
            state.lastConflict.timestamp
        ) <
        CONFIG.conflictCooldown
    ) {

        return false;

    }


    const payload = {

        reason,

        timestamp,

        omegaTime:
            timestamp,

        sessionStartedAt:
            state.sessionStartedAt,

        details:
            clone(
                details
            )

    };


    state.lastConflict =
        payload;


    state.conflictCount +=
        1;


    state.conflictLog.push(
        payload
    );


    if (
        state.conflictLog.length >
        100
    ) {

        state.conflictLog =
            state.conflictLog.slice(
                -100
            );

    }


    saveState();


    trigger(
        "omega:timeConflict",
        clone(
            payload
        )
    );


    console.warn(
        "[OMEGA TIME] Conflict:",
        payload
    );


    return true;

}


/* ==========================================================
   WALL CLOCK MONITOR
========================================================== */

function monitorClock() {

    if (
        !initialized
    ) {

        return;

    }


    const wallNow =
        now();


    const mono =
        monoNow();


    if (
        Number.isFinite(
            Number(
                state.lastWallTime
            )
        ) &&
        Number.isFinite(
            Number(
                state.lastMonoTime
            )
        )
    ) {

        const wallDelta =
            wallNow -
            Number(
                state.lastWallTime
            );


        const monoDelta =
            mono -
            Number(
                state.lastMonoTime
            );


        /*
         * The monotonic clock should never
         * move backwards.
         *
         * If wall time does while the
         * monotonic clock continues forward,
         * the system clock was adjusted.
         */

        if (
            wallDelta <
            -CONFIG.backwardThreshold &&
            monoDelta >= 0
        ) {

            emitTimeConflict(
                "time_backward",
                {

                    previousWallTime:
                        state.lastWallTime,

                    currentWallTime:
                        wallNow,

                    wallDelta,

                    monoDelta

                }
            );

        }

    }


    state.lastWallTime =
        wallNow;


    state.lastMonoTime =
        mono;


    state.lastOmegaTime =
        wallNow;


    saveState();

}


/* ==========================================================
   EVENT TIMESTAMP EXTRACTION
========================================================== */

function extractTimestamp(
    data = {}
) {

    const metadata =
        data.metadata &&
        typeof data.metadata ===
        "object"
            ? data.metadata
            : {};


    const candidates = [

        data.timestamp,

        data.time,

        data.eventTimestamp,

        metadata.timestamp,

        metadata.time,

        metadata.eventTimestamp

    ];


    for (
        const value of candidates
    ) {

        const parsed =
            Number(
                value
            );


        if (
            Number.isFinite(
                parsed
            )
        ) {

            return parsed;

        }

    }


    return null;

}


/* ==========================================================
   CATEGORY
========================================================== */

function getCategory(
    data = {}
) {

    const source =
        String(
            data.source ||
            ""
        ).trim();


    const type =
        String(
            data.type ||
            data.action ||
            ""
        ).trim();


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
   OBSERVE EXTERNAL EVENT
========================================================== */

export function observeOmegaTime(
    data = {}
) {

    if (
        !initialized
    ) {

        return false;

    }


    const current =
        now();


    const eventTimestamp =
        extractTimestamp(
            data
        );


    /*
     * Future event.
     */

    if (
        Number.isFinite(
            eventTimestamp
        ) &&
        eventTimestamp >
        current +
        CONFIG.futureThreshold
    ) {

        emitTimeConflict(
            "time_future_event",
            {

                eventTimestamp,

                currentTime:
                    current,

                difference:
                    eventTimestamp -
                    current,

                action:
                    clone(
                        data
                    )

            }
        );

    }


    /*
     * Archive event predating
     * the current operator session.
     */

    const category =
        getCategory(
            data
        );


    if (
        category ===
        "archive" &&
        Number.isFinite(
            eventTimestamp
        ) &&
        eventTimestamp <
        Number(
            state.sessionStartedAt
        ) -
        CONFIG.oldEventThreshold
    ) {

        emitTimeConflict(
            "time_old_event",
            {

                eventTimestamp,

                sessionStartedAt:
                    state.sessionStartedAt,

                difference:
                    Number(
                        state.sessionStartedAt
                    ) -
                    eventTimestamp,

                action:
                    clone(
                        data
                    )

            }
        );

    }


    monitorClock();


    return true;

}


/* ==========================================================
   STATUS
========================================================== */

export function getOmegaTimeStatus() {

    return {

        initialized,

        version:
            VERSION,

        sessionStartedAt:
            state.sessionStartedAt,

        currentTime:
            getOmegaNow(),

        formatted:
            formatOmegaTime(
                true
            ),

        lastWallTime:
            state.lastWallTime,

        lastOmegaTime:
            state.lastOmegaTime,

        lastConflict:
            clone(
                state.lastConflict
            ),

        conflictCount:
            state.conflictCount,

        conflictLog:
            clone(
                state.conflictLog
            )

    };

}


/* ==========================================================
   RESET
========================================================== */

export function resetOmegaTime() {

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


    state.sessionStartedAt =
        now();


    state.lastWallTime =
        now();


    state.lastMonoTime =
        monoNow();


    state.lastOmegaTime =
        now();


    saveState();


    trigger(
        "omega:timeReset",
        {

            timestamp:
                now()

        }
    );


    if (
        initialized
    ) {

        intervalId =
            setInterval(
                monitorClock,
                CONFIG.monitorInterval
            );

    }


    return true;

}


/* ==========================================================
   DEBUG API
========================================================== */

function exposeAPI() {

    if (
        typeof window ===
        "undefined"
    ) {

        return;

    }


    window.getOmegaTimeStatus =
        getOmegaTimeStatus;


    window.resetOmegaTime =
        resetOmegaTime;


    window.OMEGA_TIME = {

        now:
            getOmegaNow,

        date:
            getOmegaTimeDate,

        format:
            formatOmegaTime,

        status:
            getOmegaTimeStatus,

        observe:
            observeOmegaTime,

        reset:
            resetOmegaTime

    };

}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initOmegaTime() {

    if (
        initialized
    ) {

        return getOmegaTimeStatus();

    }


    initialized =
        true;


    loadState();


   if (
    !Number.isFinite(
        Number(
            state.sessionStartedAt
        )
    ) ||
    Number(
        state.sessionStartedAt
    ) <= 0
) {

    state.sessionStartedAt =
        now();

}


    state.lastWallTime =
        now();


    state.lastMonoTime =
        monoNow();


    state.lastOmegaTime =
        now();


    state.initialized =
        true;


    saveState();


    intervalId =
        setInterval(
            monitorClock,
            CONFIG.monitorInterval
        );


    exposeAPI();


    on(
        "system.boot",
        () => {

            monitorClock();

        }
    );


    console.log(
        "[OMEGA TIME] Initialized.",
        getOmegaTimeStatus()
    );


    return getOmegaTimeStatus();

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

            initOmegaTime();

        },
        {
            once: true
        }
    );

}
