
/* ==========================================================
   MR.SMILE — SECRET ENDING 333
   ----------------------------------------------------------
   Hidden condition:

       33 meaningful violations
       +
       3 hours of accumulated MR.SMILE presence
       =
       333 eligibility

   IMPORTANT:
   - Counters are intentionally hidden from the player.
   - One incident = one violation.
   - Repeated clicks/actions from the same incident do not
     automatically create multiple violations.
   - Reaching eligibility does NOT immediately start the ending.
   - MR.SMILE chooses a later appropriate moment.
   - Ending can happen only once.
   ========================================================== */

import { on, trigger } from "./eventManager.js";
import {
    getMrSmilePresenceState,
    isMrSmilePresent
} from "./mrsmilePresence.js";
import { getMrSmileRelationshipStatus } from "./mrsmileRelationship.js";
import { getMrSmileState } from "./mrsmileState.js";


/* ==========================================================
   CONFIGURATION
========================================================== */

const STORAGE_KEY = "mrsmile_secret_ending";

const REQUIRED_VIOLATIONS = 33;
const REQUIRED_PRESENCE_TIME = 3 * 60 * 60 * 1000; // 3 hours

const MIN_VIOLATION_INTERVAL = 1500;

const ELIGIBILITY_COOLDOWN = 30000;


/* ==========================================================
   INTERNAL STATE
========================================================== */

const state = {

    initialized: false,

    violations: 0,

    presenceTime: 0,

    eligible: false,

    endingStarted: false,

    endingCompleted: false,

    lastViolationAt: 0,

    lastPresenceUpdate: 0,

    eligibilityReachedAt: null,

    endingStartedAt: null,

    endingCompletedAt: null,

    presenceSessionStartedAt: null,

    presenceWasActive: false,

    lastViolationReason: null,

    violationHistory: []
};


/* ==========================================================
   LOAD / SAVE
========================================================== */

function getDefaultState() {

    return {
        initialized: false,

        violations: 0,
        presenceTime: 0,

        eligible: false,

        endingStarted: false,
        endingCompleted: false,

        lastViolationAt: 0,

        lastPresenceUpdate: 0,

        eligibilityReachedAt: null,
        endingStartedAt: null,
        endingCompletedAt: null,

        presenceSessionStartedAt: null,
        presenceWasActive: false,

        lastViolationReason: null,

        violationHistory: []
    };
}


function loadState() {

    try {

        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) return;

        const saved = JSON.parse(raw);

        Object.assign(state, getDefaultState(), saved);

        /*
         * Never trust malformed storage values.
         */

        if (!Number.isFinite(state.violations)) {
            state.violations = 0;
        }

        if (!Number.isFinite(state.presenceTime)) {
            state.presenceTime = 0;
        }

        if (!Array.isArray(state.violationHistory)) {
            state.violationHistory = [];
        }

    } catch (error) {

        console.error(
            "[MR.SMILE 333] Failed to load state:",
            error
        );
    }
}


function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                violations: state.violations,
                presenceTime: state.presenceTime,

                eligible: state.eligible,

                endingStarted: state.endingStarted,
                endingCompleted: state.endingCompleted,

                lastViolationAt: state.lastViolationAt,
                lastPresenceUpdate: state.lastPresenceUpdate,

                eligibilityReachedAt:
                    state.eligibilityReachedAt,

                endingStartedAt:
                    state.endingStartedAt,

                endingCompletedAt:
                    state.endingCompletedAt,

                presenceSessionStartedAt:
                    state.presenceSessionStartedAt,

                presenceWasActive:
                    state.presenceWasActive,

                lastViolationReason:
                    state.lastViolationReason,

                violationHistory:
                    state.violationHistory.slice(-33)
            })
        );

    } catch (error) {

        console.error(
            "[MR.SMILE 333] Failed to save state:",
            error
        );
    }
}


/* ==========================================================
   PRESENCE TRACKING
========================================================== */

/*
 * MR.SMILE's presence time is accumulated only while he is
 * actually present in OMEGA.
 *
 * Browser uptime alone does NOT count.
 */

function updatePresenceTime() {

    if (!state.initialized) return;

    const now = Date.now();

    const present = isMrSmilePresent();

    /*
     * Starting a new presence session.
     */

    if (present && !state.presenceWasActive) {

        state.presenceSessionStartedAt = now;
        state.presenceWasActive = true;
        state.lastPresenceUpdate = now;

        saveState();

        return;
    }


    /*
     * Continuing an existing presence session.
     */

    if (present && state.presenceWasActive) {

        if (!state.presenceSessionStartedAt) {
            state.presenceSessionStartedAt = now;
        }

        const elapsed =
            Math.max(
                0,
                now - state.lastPresenceUpdate
            );

        /*
         * Prevent absurd jumps caused by suspended tabs,
         * system sleep, or clock changes.
         */

        const MAX_TICK = 10000;

        state.presenceTime +=
            Math.min(elapsed, MAX_TICK);

        state.lastPresenceUpdate = now;

        checkEligibility();

        saveState();

        return;
    }


    /*
     * MR.SMILE is no longer present.
     */

    if (!present && state.presenceWasActive) {

        /*
         * Final small update for the previous session.
         */

        if (state.lastPresenceUpdate) {

            const elapsed =
                Math.max(
                    0,
                    now - state.lastPresenceUpdate
                );

            state.presenceTime +=
                Math.min(elapsed, 10000);
        }

        state.presenceSessionStartedAt = null;
        state.presenceWasActive = false;
        state.lastPresenceUpdate = now;

        checkEligibility();

        saveState();
    }
}


/* ==========================================================
   PRESENCE EVENT HANDLER
========================================================== */

function handlePresenceChanged(data) {

    /*
     * We do not trust the event payload alone.
     * Presence state remains the source of truth.
     */

    updatePresenceTime();

    if (data) {

        trigger("mrsmile:secretEndingPresenceUpdated", {
            present: isMrSmilePresent(),
            accumulated: state.presenceTime,
            timestamp: Date.now()
        });
    }
}


/* ==========================================================
   VIOLATIONS
========================================================== */

/*
 * A violation is an intentional incident that damages the
 * relationship or violates OMEGA / MR.SMILE restrictions.
 *
 * This function should be called by real systems such as:
 *
 * - restricted access attempts
 * - bypass attempts
 * - ignoring explicit warnings
 * - hostile operator actions
 * - deliberate interference
 * - repeated unauthorized behavior
 *
 * IMPORTANT:
 *
 * Call this ONCE for the incident.
 *
 * Do not call it once per mouse click or once per internal
 * action generated by the same incident.
 */

export function registerMrSmileViolation(
    reason = "unknown",
    metadata = {}
) {

    if (!state.initialized) return false;

    /*
     * Ending already completed.
     */

    if (state.endingCompleted) {
        return false;
    }


    /*
     * Small duplicate protection.
     */

    const now = Date.now();

    if (
        state.lastViolationAt &&
        now - state.lastViolationAt <
        MIN_VIOLATION_INTERVAL
    ) {

        console.log(
            "[MR.SMILE 333] Duplicate violation ignored."
        );

        return false;
    }


    state.violations++;

    state.lastViolationAt = now;

    state.lastViolationReason = reason;


    /*
     * Keep only a compact hidden history.
     */

    state.violationHistory.push({

        number: state.violations,

        reason,

        metadata,

        timestamp: now
    });


    if (state.violationHistory.length > 33) {

        state.violationHistory =
            state.violationHistory.slice(-33);
    }


    console.log(
        "[MR.SMILE 333] Violation registered."
    );


    trigger(
        "mrsmile:secretEndingViolation",
        {
            reason,
            metadata,

            /*
             * These values are intentionally NOT shown
             * through normal UI.
             */

            internal: true
        }
    );


    checkEligibility();

    saveState();

    return true;
}


/* ==========================================================
   ELIGIBILITY
========================================================== */

function checkEligibility() {

    if (state.eligible) {
        return true;
    }

    if (state.endingStarted || state.endingCompleted) {
        return false;
    }


    const enoughViolations =
        state.violations >= REQUIRED_VIOLATIONS;

    const enoughPresence =
        state.presenceTime >= REQUIRED_PRESENCE_TIME;


    if (
        enoughViolations &&
        enoughPresence
    ) {

        state.eligible = true;

        state.eligibilityReachedAt = Date.now();

        saveState();


        /*
         * IMPORTANT:
         *
         * Eligibility is silent.
         *
         * We do NOT start the ending here.
         */

        trigger(
            "mrsmile:secretEndingEligible",
            {
                internal: true,
                timestamp:
                    state.eligibilityReachedAt
            }
        );


        console.log(
            "[MR.SMILE 333] Eligibility reached."
        );

        return true;
    }


    return false;
}


/* ==========================================================
   ENDING START
========================================================== */

/*
 * The ending should NOT automatically start the instant
 * eligibility is reached.
 *
 * A later manager / MR.SMILE event can request the ending.
 */

export function canStartSecretEnding() {

    if (!state.initialized) {
        return false;
    }

    if (!state.eligible) {
        return false;
    }

    if (state.endingStarted) {
        return false;
    }

    if (state.endingCompleted) {
        return false;
    }

    /*
     * Small cooldown after eligibility.
     *
     * This prevents the ending from starting in the same
     * execution cycle as the 33rd violation / 3h threshold.
     */

    if (
        state.eligibilityReachedAt &&
        Date.now() -
        state.eligibilityReachedAt <
        ELIGIBILITY_COOLDOWN
    ) {

        return false;
    }

    return true;
}


/* ==========================================================
   START SECRET ENDING
========================================================== */

export function startMrSmileSecretEnding(
    reason = "mrsmile"
) {

    if (!canStartSecretEnding()) {

        console.log(
            "[MR.SMILE 333] Ending start rejected."
        );

        return false;
    }


    state.endingStarted = true;

    state.endingStartedAt = Date.now();


    saveState();


    trigger(
        "mrsmile:secretEndingStarted",
        {
            reason,

            /*
             * Internal event.
             * UI should not display these counters.
             */

            internal: true,

            timestamp:
                state.endingStartedAt
        }
    );


    console.log(
        "[MR.SMILE 333] Secret ending started."
    );


    return true;
}


/* ==========================================================
   COMPLETE SECRET ENDING
========================================================== */

export function completeMrSmileSecretEnding() {

    if (!state.endingStarted) {
        return false;
    }

    if (state.endingCompleted) {
        return false;
    }


    state.endingCompleted = true;

    state.endingCompletedAt = Date.now();


    saveState();


    trigger(
        "mrsmile:secretEndingCompleted",
        {
            internal: true,

            timestamp:
                state.endingCompletedAt
        }
    );


    console.log(
        "[MR.SMILE 333] Secret ending completed."
    );


    return true;
}


/* ==========================================================
   STATUS
========================================================== */

export function isSecretEndingEligible() {
    return state.eligible;
}


export function isSecretEndingStarted() {
    return state.endingStarted;
}


export function isSecretEndingCompleted() {
    return state.endingCompleted;
}


export function getSecretEndingState() {

    return {
        /*
         * These values are intentionally available to the
         * internal system but should NOT be rendered into
         * normal OMEGA UI.
         */

        violations:
            state.violations,

        presenceTime:
            state.presenceTime,

        eligible:
            state.eligible,

        endingStarted:
            state.endingStarted,

        endingCompleted:
            state.endingCompleted,

        eligibilityReachedAt:
            state.eligibilityReachedAt,

        endingStartedAt:
            state.endingStartedAt,

        endingCompletedAt:
            state.endingCompletedAt
    };
}


/* ==========================================================
   RESET
========================================================== */

export function resetMrSmileSecretEnding() {

    const fresh = getDefaultState();

    Object.assign(
        state,
        fresh,
        {
            initialized: true
        }
    );


    localStorage.removeItem(STORAGE_KEY);

    saveState();


    trigger(
        "mrsmile:secretEndingReset",
        {
            internal: true,
            timestamp: Date.now()
        }
    );


    console.log(
        "[MR.SMILE 333] Secret ending reset."
    );
}


/* ==========================================================
   EVENT INTEGRATION
========================================================== */

/*
 * Presence changes are the main source for the 3-hour timer.
 */

on(
    "mrsmile:presenceChanged",
    handlePresenceChanged
);

on(
    "mrsmile:presenceEstablished",
    handlePresenceChanged
);


/*
 * Also listen for explicit presence lifecycle events.
 */

on(
    "mrsmile:actionStarted",
    () => {
        updatePresenceTime();
    }
);

on(
    "mrsmile:actionCompleted",
    () => {
        updatePresenceTime();
    }
);


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileSecretEnding() {

    if (state.initialized) {
        return;
    }


    loadState();

    state.initialized = true;


    /*
     * Start / resume presence accounting.
     */

    updatePresenceTime();


    /*
     * Periodic tracking.
     *
     * This does NOT mean browser uptime becomes presence time.
     * updatePresenceTime() checks actual MR.SMILE presence.
     */

    setInterval(
        () => {
            updatePresenceTime();
        },
        5000
    );


    checkEligibility();

    saveState();


    console.log(
        "[MR.SMILE 333] Secret Ending system initialized."
    );
}


/* ==========================================================
   DEBUG API
   ----------------------------------------------------------
   Internal testing only.
   This should eventually be removed or protected.
========================================================== */

if (typeof window !== "undefined") {

    window.MRSMILE_333 = {

        status() {

            return getSecretEndingState();
        },


        violation(reason = "debug_violation") {

            return registerMrSmileViolation(
                reason,
                {
                    source: "debug"
                }
            );
        },


        eligibility() {

            return isSecretEndingEligible();
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

            resetMrSmileSecretEnding();
        },


        /*
         * Development helper.
         *
         * It DOES NOT change the normal game logic.
         * It only allows testing the 333 ending without
         * waiting three hours / creating 33 incidents.
         */

        forceEligibility() {

            state.eligible = true;

            state.eligibilityReachedAt =
                Date.now() -
                ELIGIBILITY_COOLDOWN -
                1;

            saveState();

            console.log(
                "[MR.SMILE 333] DEBUG eligibility forced."
            );

            return true;
        }
    };
}


/* ==========================================================
   AUTO INIT
========================================================== */

setTimeout(
    () => {
        initMrSmileSecretEnding();
    },
    0
);
