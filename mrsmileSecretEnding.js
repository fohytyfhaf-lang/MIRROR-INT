/* ==========================================================
   MR.SMILE — SECRET 333 ENDING
   Hidden ending state manager

   Requirements:
   - 33 meaningful violations
   - 3 hours of actual MR.SMILE presence
   - theme 333
   - 33rd violation does NOT instantly start ending
   - ending may be chosen later by MR.SMILE
   - permanent completion
   - persistent across sessions
========================================================== */

import { on, trigger } from "./eventManager.js";


/* ==========================================================
   CONFIG
========================================================== */

const STORAGE_KEY = "mrsmile_secret_333";

const REQUIRED_VIOLATIONS = 33;
const REQUIRED_PRESENCE_TIME = 3 * 60 * 60 * 1000;

// Prevent the same action from being counted repeatedly
// as a violation within a very short period.
const MIN_VIOLATION_INTERVAL = 1500;

// After becoming eligible, MR.SMILE waits before the ending
// can be selected automatically.
const ELIGIBILITY_COOLDOWN = 30000;


/* ==========================================================
   DEFAULT STATE
========================================================== */

const DEFAULT_STATE = {

    initialized: false,

    // Hidden violation counter
    violations: 0,

    // Total accumulated real MR.SMILE presence time
    presenceTime: 0,

    // Eligibility
    eligible: false,

    // Ending state
    endingStarted: false,
    endingCompleted: false,

    // Timing
    lastViolationAt: 0,
    lastPresenceUpdate: 0,

    eligibilityReachedAt: null,

    endingStartedAt: null,
    endingCompletedAt: null,

    presenceSessionStartedAt: null,
    presenceWasActive: false,

    // Debug/context information
    lastViolationReason: null,

    violationHistory: []
};


/* ==========================================================
   INTERNAL STATE
========================================================== */

let state = {
    ...DEFAULT_STATE
};


/* ==========================================================
   LOAD
========================================================== */

function loadState() {

    try {

        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {

            state = {
                ...DEFAULT_STATE
            };

            return;

        }

        const saved = JSON.parse(raw);

        state = {
            ...DEFAULT_STATE,
            ...saved
        };

        // Safety for old/corrupted saves
        if (!Array.isArray(state.violationHistory)) {
            state.violationHistory = [];
        }

    } catch (error) {

        console.error(
            "[MR.SMILE 333] Failed to load state:",
            error
        );

        state = {
            ...DEFAULT_STATE
        };

    }
}


/* ==========================================================
   SAVE
========================================================== */

function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    } catch (error) {

        console.error(
            "[MR.SMILE 333] Failed to save state:",
            error
        );

    }
}


/* ==========================================================
   INITIALIZE
========================================================== */

function initMrSmileSecretEnding() {

    if (state.initialized) {
        return;
    }

    loadState();

    state.initialized = true;

    saveState();

    console.log(
        "[MR.SMILE 333] Secret ending system initialized."
    );

}


/* ==========================================================
   PRESENCE TIME
========================================================== */

function updatePresenceTime() {

    const now = Date.now();

    /*
        If MR.SMILE is currently present,
        accumulate the time since the previous update.
    */

    if (state.presenceWasActive) {

        if (state.presenceSessionStartedAt) {

            const elapsed =
                now - state.presenceSessionStartedAt;

            if (elapsed > 0) {

                state.presenceTime += elapsed;

            }

        }

        state.presenceSessionStartedAt = now;

    }

    state.lastPresenceUpdate = now;

    checkEligibility();

    saveState();

}


/* ==========================================================
   PRESENCE START
========================================================== */

function beginPresenceSession() {

    if (state.endingCompleted) {
        return;
    }

    if (state.presenceWasActive) {
        return;
    }

    const now = Date.now();

    state.presenceWasActive = true;

    state.presenceSessionStartedAt = now;

    state.lastPresenceUpdate = now;

    saveState();

    console.log(
        "[MR.SMILE 333] Presence session started."
    );
}


/* ==========================================================
   PRESENCE END
========================================================== */

function endPresenceSession() {

    if (!state.presenceWasActive) {
        return;
    }

    const now = Date.now();

    if (state.presenceSessionStartedAt) {

        const elapsed =
            now - state.presenceSessionStartedAt;

        if (elapsed > 0) {

            state.presenceTime += elapsed;

        }

    }

    state.presenceSessionStartedAt = null;

    state.presenceWasActive = false;

    state.lastPresenceUpdate = now;

    checkEligibility();

    saveState();

    console.log(
        "[MR.SMILE 333] Presence session ended."
    );
}


/* ==========================================================
   REGISTER VIOLATION
========================================================== */

function registerMrSmileViolation(
    reason = "unknown",
    metadata = {}
) {

    if (state.endingCompleted) {
        return false;
    }

    const now = Date.now();

    /*
        Prevent accidental double registration.
    */

    if (
        state.lastViolationAt &&
        now - state.lastViolationAt <
        MIN_VIOLATION_INTERVAL
    ) {

        return false;

    }


    state.lastViolationAt = now;

    state.lastViolationReason = reason;

    state.violations++;


    /*
        Keep a hidden history.

        Limit it so localStorage doesn't grow forever.
    */

    state.violationHistory.push({

        number: state.violations,

        reason,

        metadata,

        timestamp: now

    });


    if (state.violationHistory.length > 100) {

        state.violationHistory =
            state.violationHistory.slice(-100);

    }


    console.log(
        `[MR.SMILE 333] Violation ${state.violations}/${REQUIRED_VIOLATIONS}`,
        reason
    );


    checkEligibility();

    saveState();


    trigger(
        "mrsmile:secretViolation",
        {
            count: state.violations,
            required: REQUIRED_VIOLATIONS,
            reason,
            metadata
        }
    );


    return true;
}


/* ==========================================================
   ELIGIBILITY
========================================================== */

function checkEligibility() {

    if (state.eligible) {
        return true;
    }

    if (state.endingCompleted) {
        return false;
    }


    /*
        Current presence time must include the active session.
    */

    let currentPresenceTime =
        state.presenceTime;


    if (
        state.presenceWasActive &&
        state.presenceSessionStartedAt
    ) {

        currentPresenceTime +=
            Date.now() -
            state.presenceSessionStartedAt;

    }


    const enoughViolations =
        state.violations >=
        REQUIRED_VIOLATIONS;


    const enoughPresence =
        currentPresenceTime >=
        REQUIRED_PRESENCE_TIME;


    if (
        enoughViolations &&
        enoughPresence
    ) {

        state.eligible = true;

        state.eligibilityReachedAt =
            Date.now();

        saveState();


        console.log(
            "[MR.SMILE 333] SECRET ENDING ELIGIBLE."
        );


        trigger(
            "mrsmile:secretEndingEligible",
            {
                violations: state.violations,
                presenceTime: currentPresenceTime
            }
        );


        return true;
    }


    return false;
}


/* ==========================================================
   CAN START
========================================================== */

function canStartSecretEnding() {

    if (state.endingCompleted) {
        return false;
    }

    if (state.endingStarted) {
        return false;
    }

    if (!state.eligible) {

        checkEligibility();

    }

    if (!state.eligible) {
        return false;
    }


    /*
        The ending should NOT happen immediately
        when the 33rd violation occurs.
    */

    if (state.eligibilityReachedAt) {

        const elapsed =
            Date.now() -
            state.eligibilityReachedAt;

        if (elapsed < ELIGIBILITY_COOLDOWN) {

            return false;

        }

    }


    return true;
}


/* ==========================================================
   START ENDING
========================================================== */

function startMrSmileSecretEnding(
    reason = "mrsmile"
) {

    if (!canStartSecretEnding()) {

        console.warn(
            "[MR.SMILE 333] Ending cannot start yet."
        );

        return false;

    }


    state.endingStarted = true;

    state.endingStartedAt =
        Date.now();


    saveState();


    console.warn(
        "[MR.SMILE 333] SECRET ENDING STARTING.",
        reason
    );


    trigger(
        "mrsmile:secretEndingStart",
        {
            reason,

            violations:
                state.violations,

            presenceTime:
                state.presenceTime,

            startedAt:
                state.endingStartedAt
        }
    );


    return true;
}


/* ==========================================================
   COMPLETE ENDING
========================================================== */

function completeMrSmileSecretEnding() {

    if (state.endingCompleted) {
        return true;
    }


    /*
        If the sequence reaches this function,
        consider the ending started.
    */

    if (!state.endingStarted) {

        state.endingStarted = true;

        state.endingStartedAt =
            Date.now();

    }


    state.endingCompleted = true;

    state.endingCompletedAt =
        Date.now();


    saveState();


    console.warn(
        "[MR.SMILE 333] SECRET ENDING COMPLETED."
    );


    trigger(
        "mrsmile:secretEndingCompleted",
        {
            completedAt:
                state.endingCompletedAt,

            violations:
                state.violations,

            presenceTime:
                state.presenceTime
        }
    );


    return true;
}


/* ==========================================================
   STATUS
========================================================== */

function getSecretEndingStatus() {

    let currentPresenceTime =
        state.presenceTime;


    if (
        state.presenceWasActive &&
        state.presenceSessionStartedAt
    ) {

        currentPresenceTime +=
            Date.now() -
            state.presenceSessionStartedAt;

    }


    return {

        ...state,

        currentPresenceTime,

        requiredViolations:
            REQUIRED_VIOLATIONS,

        requiredPresenceTime:
            REQUIRED_PRESENCE_TIME,

        remainingViolations:
            Math.max(
                0,
                REQUIRED_VIOLATIONS -
                state.violations
            ),

        remainingPresenceTime:
            Math.max(
                0,
                REQUIRED_PRESENCE_TIME -
                currentPresenceTime
            )

    };
}


/* ==========================================================
   RESET
   DEBUG ONLY
========================================================== */

function resetSecretEnding() {

    state = {
        ...DEFAULT_STATE,

        initialized: true
    };

    saveState();

    console.warn(
        "[MR.SMILE 333] Secret ending state RESET."
    );


    trigger(
        "mrsmile:secretEndingReset"
    );


    return true;
}


/* ==========================================================
   FORCE ELIGIBILITY
   DEBUG ONLY
========================================================== */

function forceEligibility() {

    state.violations =
        REQUIRED_VIOLATIONS;

    state.presenceTime =
        REQUIRED_PRESENCE_TIME;

    state.eligible = true;

    state.eligibilityReachedAt =
        Date.now();


    saveState();


    console.warn(
        "[MR.SMILE 333] Eligibility forced for testing."
    );


    trigger(
        "mrsmile:secretEndingEligible",
        {
            forced: true
        }
    );


    return true;
}


/* ==========================================================
   PRESENCE EVENT CONNECTION
========================================================== */

/*
    These events allow the 333 system to track
    actual MR.SMILE presence without depending
    directly on the presence module.

    This also keeps the modules loosely coupled.
*/

on(
    "mrsmile:firstContact",
    () => {

        beginPresenceSession();

    }
);


on(
    "mrsmile:firstContactAccepted",
    () => {

        beginPresenceSession();

    }
);


on(
    "mrsmile:presenceStarted",
    () => {

        beginPresenceSession();

    }
);


on(
    "mrsmile:presenceActivated",
    () => {

        beginPresenceSession();

    }
);


on(
    "mrsmile:presenceEnded",
    () => {

        endPresenceSession();

    }
);


on(
    "mrsmile:presenceDeactivated",
    () => {

        endPresenceSession();

    }
);


/* ==========================================================
   PAGE VISIBILITY
========================================================== */

/*
    If the browser tab is hidden,
    don't count that time as active presence.

    This prevents the player from leaving the page
    open for hours in the background and accidentally
    generating the entire presence requirement.
*/

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "hidden"
        ) {

            endPresenceSession();

        } else {

            /*
                Only resume if MR.SMILE is actually
                considered present.
            */

            try {

                if (
                    window.MRSMILE_PRESENCE &&
                    window.MRSMILE_PRESENCE.isPresent &&
                    window.MRSMILE_PRESENCE.isPresent()
                ) {

                    beginPresenceSession();

                }

            } catch (error) {

                console.warn(
                    "[MR.SMILE 333] Presence resume check failed:",
                    error
                );

            }

        }

    }
);


/* ==========================================================
   PERIODIC PRESENCE UPDATE
========================================================== */

setInterval(
    () => {

        if (state.presenceWasActive) {

            updatePresenceTime();

        }

    },
    1000
);


/* ==========================================================
   GLOBAL DEBUG API
========================================================== */

window.MRSMILE_333 = {

    status() {

        return getSecretEndingStatus();

    },


    violation(reason, metadata = {}) {

        return registerMrSmileViolation(
            reason,
            metadata
        );

    },


    eligibility() {

        return checkEligibility();

    },


    canStart() {

        return canStartSecretEnding();

    },


    start(reason = "debug") {

        return startMrSmileSecretEnding(
            reason
        );

    },


    complete() {

        return completeMrSmileSecretEnding();

    },


    reset() {

        return resetSecretEnding();

    },


    forceEligibility() {

        return forceEligibility();

    },


    startPresence() {

        beginPresenceSession();

        return true;

    },


    stopPresence() {

        endPresenceSession();

        return true;

    }

};


/* ==========================================================
   EXPORTS
========================================================== */

export {

    initMrSmileSecretEnding,

    registerMrSmileViolation,

    updatePresenceTime,

    checkEligibility,

    canStartSecretEnding,

    startMrSmileSecretEnding,

    completeMrSmileSecretEnding,

    getSecretEndingStatus,

    resetSecretEnding,

    forceEligibility

};


/* ==========================================================
   AUTO INIT
========================================================== */

initMrSmileSecretEnding();
