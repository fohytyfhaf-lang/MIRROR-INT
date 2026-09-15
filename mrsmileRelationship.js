
// =======================================
// MR.SMILE RELATIONSHIP SYSTEM — V4
// OMEGA SYSTEM
// =======================================
//
// MR.SMILE's attitude toward the operator
// is described by:
//
// TRUST
// RESPECT
// IRRITATION
//
// TRUST is owned by:
//      mrsmileTrust.js
//
// RESPECT / IRRITATION are owned here.
//
// This module does NOT:
// - generate dialogue
// - generate personality
// - control visual manifestations
// - control sabotage
// - generate chat messages
//
// It ONLY describes the current relationship
// state and exposes behavior/access helpers.
//
// IMPORTANT EVENT RULE:
//
// ONE REAL RELATIONSHIP STATE CHANGE
//      ↓
// ONE mrsmile:relationshipChanged
//
// Combined changes:
//      changeRelationship()
//          ↓
//      ONE relationshipChanged
//      ONE relationshipAction
//
// No-op changes produce no change event.
// =======================================


import {
    trigger,
    on
} from "./eventManager.js";

import {
    getTrust,
    initTrust
} from "./mrsmileTrust.js";


/* =======================================
   STORAGE
======================================= */

const STORAGE_KEY =
    "mrsmile_relationship";

const LEGACY_STORAGE_KEY =
    "mrsmile_relationship_v3";


/* =======================================
   LIMITS
======================================= */

const MIN_VALUE =
    0;

const MAX_VALUE =
    100;


/* =======================================
   STATE
======================================= */

const state = {

    trust:
        0,

    respect:
        50,

    irritation:
        0,

    initialized:
        false

};


/* =======================================
   INTERNAL STATE
======================================= */

let initialized =
    false;

let trustListenerRegistered =
    false;


/* =======================================
   UTILITY
======================================= */

function safeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(
        number
    )
        ? number
        : fallback;

}


function clamp(
    value
) {

    return Math.max(
        MIN_VALUE,
        Math.min(
            MAX_VALUE,
            safeNumber(
                value,
                0
            )
        )
    );

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


function readStorage(
    key
) {

    if (
        !storageAvailable()
    ) {

        return null;

    }

    try {

        return localStorage.getItem(
            key
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE RELATIONSHIP] Storage read failed:",
            error
        );

        return null;

    }

}


function writeStorage(
    key,
    value
) {

    if (
        !storageAvailable()
    ) {

        return false;

    }

    try {

        localStorage.setItem(
            key,
            value
        );

        return true;

    } catch (error) {

        console.warn(
            "[MR.SMILE RELATIONSHIP] Storage write failed:",
            error
        );

        return false;

    }

}


function removeStorage(
    key
) {

    if (
        !storageAvailable()
    ) {

        return false;

    }

    try {

        localStorage.removeItem(
            key
        );

        return true;

    } catch {

        return false;

    }

}


/* =======================================
   RELATIONSHIP SNAPSHOT
======================================= */

function getRawStateSnapshot() {

    return {

        trust:
            clamp(
                state.trust
            ),

        respect:
            clamp(
                state.respect
            ),

        irritation:
            clamp(
                state.irritation
            )

    };

}


function statesEqual(
    a,
    b
) {

    if (
        !a ||
        !b
    ) {

        return false;

    }

    return (
        a.trust === b.trust &&
        a.respect === b.respect &&
        a.irritation === b.irritation
    );

}


/* =======================================
   EMIT RELATIONSHIP CHANGE
======================================= */

function emitRelationshipChanged(
    previous,
    reason = ""
) {

    const current =
        getRawStateSnapshot();


    if (
        statesEqual(
            previous,
            current
        )
    ) {

        return false;

    }


    trigger(
        "mrsmile:relationshipChanged",
        {

            previous: {
                ...previous
            },

            current: {
                ...current
            },

            reason:
                reason || ""

        }
    );


    return true;

}


/* =======================================
   INITIALIZATION
======================================= */

export function initMrSmileRelationship() {

    if (
        initialized
    ) {

        syncTrust();

        return getRelationshipStatus();

    }


    initialized =
        true;


    /*
     * Trust is owned by mrsmileTrust.js.
     */
    try {

        initTrust();

    } catch (error) {

        console.warn(
            "[MR.SMILE RELATIONSHIP] Trust initialization failed:",
            error
        );

    }


    /*
     * Load only local relationship values:
     * respect / irritation.
     */
    loadRelationship();


    /*
     * Mirror current Trust.
     */
    syncTrust();


    /*
     * Listen for actual Trust changes.
     */
    registerTrustListener();


    state.initialized =
        true;


    console.log(
        "[MR.SMILE RELATIONSHIP] V4 initialized."
    );


    trigger(
        "mrsmile:relationshipInitialized",
        getRelationshipStatus()
    );


    return getRelationshipStatus();

}


/* =======================================
   TRUST LISTENER
======================================= */

function registerTrustListener() {

    if (
        trustListenerRegistered
    ) {

        return;

    }


    trustListenerRegistered =
        true;


    try {

        on(
            "mrsmile:trustChanged",
            data => {

                const previous =
                    getRawStateSnapshot();


                syncTrust();


                /*
                 * Trust is mirrored into the
                 * relationship state.
                 *
                 * Emit only when the effective
                 * relationship state actually changed.
                 */
                emitRelationshipChanged(
                    previous,
                    data?.reason ||
                    "TRUST_CHANGED"
                );

            }
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE RELATIONSHIP] Trust listener failed:",
            error
        );

    }

}


/* =======================================
   SYNC TRUST
======================================= */

function syncTrust() {

    try {

        const nextTrust =
            clamp(
                getTrust()
            );


        state.trust =
            nextTrust;


        return state.trust;

    } catch (error) {

        console.warn(
            "[MR.SMILE RELATIONSHIP] Failed to sync trust:",
            error
        );

        return state.trust;

    }

}


/* =======================================
   CHANGE RESPECT
======================================= */

export function changeRespect(
    amount,
    reason = ""
) {

    initMrSmileRelationship();


    const value =
        Number(amount);


    if (
        !Number.isFinite(
            value
        )
    ) {

        return false;

    }


    if (
        value === 0
    ) {

        return false;

    }


    const previous =
        getRawStateSnapshot();


    const next =
        clamp(
            state.respect +
            value
        );


    if (
        next ===
        state.respect
    ) {

        return false;

    }


    state.respect =
        next;


    saveRelationship();


    console.log(
        "[MR.SMILE RELATIONSHIP] Respect:",
        previous.respect,
        "→",
        state.respect,
        reason
    );


    emitRelationshipChanged(
        previous,
        reason || "RESPECT_CHANGED"
    );


    trigger(
        "mrsmile:respectChanged",
        {

            oldValue:
                previous.respect,

            newValue:
                state.respect,

            amount:
                state.respect -
                previous.respect,

            requestedAmount:
                value,

            reason:
                reason || ""

        }
    );


    return true;

}


/* =======================================
   CHANGE IRRITATION
======================================= */

export function changeIrritation(
    amount,
    reason = ""
) {

    initMrSmileRelationship();


    const value =
        Number(amount);


    if (
        !Number.isFinite(
            value
        )
    ) {

        return false;

    }


    if (
        value === 0
    ) {

        return false;

    }


    const previous =
        getRawStateSnapshot();


    const next =
        clamp(
            state.irritation +
            value
        );


    if (
        next ===
        state.irritation
    ) {

        return false;

    }


    state.irritation =
        next;


    saveRelationship();


    console.log(
        "[MR.SMILE RELATIONSHIP] Irritation:",
        previous.irritation,
        "→",
        state.irritation,
        reason
    );


    emitRelationshipChanged(
        previous,
        reason || "IRRITATION_CHANGED"
    );


    trigger(
        "mrsmile:irritationChanged",
        {

            oldValue:
                previous.irritation,

            newValue:
                state.irritation,

            amount:
                state.irritation -
                previous.irritation,

            requestedAmount:
                value,

            reason:
                reason || ""

        }
    );


    return true;

}


/* =======================================
   COMBINED RELATIONSHIP CHANGE
======================================= */

export function changeRelationship(
    changes = {},
    reason = ""
) {

    initMrSmileRelationship();


    if (
        !changes ||
        typeof changes !==
            "object"
    ) {

        return false;

    }


    const respectAmount =
        Number(
            changes.respect
        );


    const irritationAmount =
        Number(
            changes.irritation
        );


    const validRespect =
        Number.isFinite(
            respectAmount
        )
            ? respectAmount
            : 0;


    const validIrritation =
        Number.isFinite(
            irritationAmount
        )
            ? irritationAmount
            : 0;


    if (
        validRespect === 0 &&
        validIrritation === 0
    ) {

        return false;

    }


    const previous =
        getRawStateSnapshot();


    const nextRespect =
        clamp(
            state.respect +
            validRespect
        );


    const nextIrritation =
        clamp(
            state.irritation +
            validIrritation
        );


    const respectChanged =
        nextRespect !==
        state.respect;


    const irritationChanged =
        nextIrritation !==
        state.irritation;


    if (
        !respectChanged &&
        !irritationChanged
    ) {

        return false;

    }


    state.respect =
        nextRespect;


    state.irritation =
        nextIrritation;


    saveRelationship();


    const actualChanges = {

        respect:
            state.respect -
            previous.respect,

        irritation:
            state.irritation -
            previous.irritation

    };


    console.log(
        "[MR.SMILE RELATIONSHIP] Combined change:",
        actualChanges,
        reason
    );


    /*
     * ONE relationshipChanged
     */
    emitRelationshipChanged(
        previous,
        reason || "RELATIONSHIP_CHANGED"
    );


    /*
     * Individual component events remain available,
     * but are emitted exactly once each and only when
     * that component actually changed.
     */

    if (
        respectChanged
    ) {

        trigger(
            "mrsmile:respectChanged",
            {

                oldValue:
                    previous.respect,

                newValue:
                    state.respect,

                amount:
                    actualChanges.respect,

                requestedAmount:
                    validRespect,

                reason:
                    reason || ""

            }
        );

    }


    if (
        irritationChanged
    ) {

        trigger(
            "mrsmile:irritationChanged",
            {

                oldValue:
                    previous.irritation,

                newValue:
                    state.irritation,

                amount:
                    actualChanges.irritation,

                requestedAmount:
                    validIrritation,

                reason:
                    reason || ""

            }
        );

    }


    /*
     * One high-level combined action event.
     */
    trigger(
        "mrsmile:relationshipAction",
        {

            changes: {
                ...actualChanges
            },

            requestedChanges: {

                respect:
                    validRespect,

                irritation:
                    validIrritation

            },

            reason:
                reason || "",

            status:
                getRelationshipStatus()

        }
    );


    return true;

}


/* =======================================
   POSITIVE ACTION
======================================= */

export function rewardOperator(
    amount = 5,
    reason = ""
) {

    const value =
        Math.abs(
            Number(amount)
        );


    if (
        !Number.isFinite(
            value
        ) ||
        value === 0
    ) {

        return false;

    }


    return changeRelationship(

        {

            respect:
                value,

            irritation:
                -Math.floor(
                    value / 2
                )

        },

        reason || "REWARD_OPERATOR"

    );

}


/* =======================================
   NEGATIVE ACTION
======================================= */

export function punishOperator(
    amount = 5,
    reason = ""
) {

    const value =
        Math.abs(
            Number(amount)
        );


    if (
        !Number.isFinite(
            value
        ) ||
        value === 0
    ) {

        return false;

    }


    return changeRelationship(

        {

            respect:
                -Math.floor(
                    value / 2
                ),

            irritation:
                value

        },

        reason || "PUNISH_OPERATOR"

    );

}


/* =======================================
   RELATIONSHIP SCORE
======================================= */

function calculateRelationshipScore() {

    const trust =
        clamp(
            state.trust
        );


    const respect =
        clamp(
            state.respect
        );


    const irritation =
        clamp(
            state.irritation
        );


    /*
     * Trust = 50%
     * Respect = 35%
     * Irritation = -15%
     */

    const score =

        trust * 0.50 +

        respect * 0.35 +

        (100 - irritation) *
        0.15;


    return clamp(
        score
    );

}


/* =======================================
   RELATIONSHIP LEVEL
======================================= */

export function getRelationshipLevel() {

    initMrSmileRelationship();


    const score =
        calculateRelationshipScore();


    if (
        score < 20
    ) {

        return "hostile";

    }


    if (
        score < 40
    ) {

        return "cold";

    }


    if (
        score < 60
    ) {

        return "neutral";

    }


    if (
        score < 75
    ) {

        return "friendly";

    }


    if (
        score < 90
    ) {

        return "trusted";

    }


    return "close";

}


/* =======================================
   RELATIONSHIP SCORE
======================================= */

export function getRelationshipScore() {

    initMrSmileRelationship();


    return Math.round(
        calculateRelationshipScore()
    );

}


/* =======================================
   STATUS
======================================= */

export function getRelationshipStatus() {

    initMrSmileRelationship();


    const score =
        Math.round(
            calculateRelationshipScore()
        );


    const level =
        getRelationshipLevelRaw(
            score
        );


    return {

        trust:
            Math.round(
                state.trust
            ),

        respect:
            Math.round(
                state.respect
            ),

        irritation:
            Math.round(
                state.irritation
            ),

        score,

        level

    };

}


/*
 * Internal level calculation that does not
 * call initialization again.
 */
function getRelationshipLevelRaw(
    score
) {

    if (
        score < 20
    ) {

        return "hostile";

    }


    if (
        score < 40
    ) {

        return "cold";

    }


    if (
        score < 60
    ) {

        return "neutral";

    }


    if (
        score < 75
    ) {

        return "friendly";

    }


    if (
        score < 90
    ) {

        return "trusted";

    }


    return "close";

}


/* =======================================
   RELATIONSHIP CHECK
======================================= */

export function isRelationshipAtLeast(
    level
) {

    initMrSmileRelationship();


    const order = [

        "hostile",
        "cold",
        "neutral",
        "friendly",
        "trusted",
        "close"

    ];


    const current =
        getRelationshipLevelRaw(
            Math.round(
                calculateRelationshipScore()
            )
        );


    const currentIndex =
        order.indexOf(
            current
        );


    const requiredIndex =
        order.indexOf(
            level
        );


    if (
        currentIndex === -1 ||
        requiredIndex === -1
    ) {

        return false;

    }


    return (
        currentIndex >=
        requiredIndex
    );

}


/* =======================================
   BEHAVIOR HELPERS
======================================= */

export function isHelpful() {

    return isRelationshipAtLeast(
        "friendly"
    );

}


export function isHostile() {

    return (
        getRelationshipLevel() ===
        "hostile"
    );

}


export function isTrusted() {

    return isRelationshipAtLeast(
        "trusted"
    );

}


/* =======================================
   ACCESS DECISION HELPERS
======================================= */

export function shouldHelpOperator() {

    initMrSmileRelationship();


    const level =
        getRelationshipLevelRaw(
            Math.round(
                calculateRelationshipScore()
            )
        );


    return (

        level ===
            "friendly" ||

        level ===
            "trusted" ||

        level ===
            "close"

    );

}


export function shouldRefuseOperator() {

    initMrSmileRelationship();


    const level =
        getRelationshipLevelRaw(
            Math.round(
                calculateRelationshipScore()
            )
        );


    return (

        level ===
            "hostile" ||

        level ===
            "cold"

    );

}


export function shouldRemainNeutral() {

    initMrSmileRelationship();


    return (
        getRelationshipLevelRaw(
            Math.round(
                calculateRelationshipScore()
            )
        ) ===
        "neutral"
    );

}


/* =======================================
   RESET
======================================= */

export function resetMrSmileRelationship() {

    initMrSmileRelationship();


    const previous =
        getRawStateSnapshot();


    const hadChanges =
        previous.trust !== 0 ||
        previous.respect !== 50 ||
        previous.irritation !== 0;


    state.trust =
        0;

    state.respect =
        50;

    state.irritation =
        0;


    saveRelationship();


    console.log(
        "[MR.SMILE RELATIONSHIP] Reset."
    );


    if (
        hadChanges
    ) {

        trigger(
            "mrsmile:relationshipReset",
            {

                previous: {
                    ...previous
                },

                current:
                    getRawStateSnapshot()

            }
        );


        emitRelationshipChanged(
            previous,
            "RESET"
        );

    }


    return getRelationshipStatus();

}


/* =======================================
   SAVE
======================================= */

function saveRelationship() {

    const data = {

        version:
            4,

        respect:
            clamp(
                state.respect
            ),

        irritation:
            clamp(
                state.irritation
            )

    };


    return writeStorage(
        STORAGE_KEY,
        JSON.stringify(
            data
        )
    );

}


/* =======================================
   LOAD
======================================= */

function loadRelationship() {

    let raw =
        readStorage(
            STORAGE_KEY
        );


    /*
     * Legacy fallback.
     */
    if (!raw) {

        raw =
            readStorage(
                LEGACY_STORAGE_KEY
            );

    }


    if (!raw) {
        return;
    }


    try {

        const saved =
            JSON.parse(
                raw
            );


        if (
            Number.isFinite(
                Number(
                    saved.respect
                )
            )
        ) {

            state.respect =
                clamp(
                    saved.respect
                );

        }


        if (
            Number.isFinite(
                Number(
                    saved.irritation
                )
            )
        ) {

            state.irritation =
                clamp(
                    saved.irritation
                );

        }


        console.log(
            "[MR.SMILE RELATIONSHIP] Loaded."
        );

    } catch (error) {

        console.error(
            "[MR.SMILE RELATIONSHIP] Failed to load:",
            error
        );

    }

}


/* =======================================
   DEBUG CONTROLS
======================================= */

function setDebugRespect(
    value
) {

    initMrSmileRelationship();


    const numericValue =
        Number(value);


    if (
        !Number.isFinite(
            numericValue
        )
    ) {

        console.warn(
            "[MR.SMILE RELATIONSHIP] Invalid respect:",
            value
        );

        return getRelationshipStatus();

    }


    const previous =
        getRawStateSnapshot();


    const next =
        clamp(
            numericValue
        );


    if (
        next ===
        state.respect
    ) {

        return getRelationshipStatus();

    }


    state.respect =
        next;


    saveRelationship();


    console.log(
        "[MR.SMILE RELATIONSHIP] Respect:",
        previous.respect,
        "→",
        state.respect
    );


    emitRelationshipChanged(
        previous,
        "DEBUG_SET_RESPECT"
    );


    trigger(
        "mrsmile:respectChanged",
        {

            oldValue:
                previous.respect,

            newValue:
                state.respect,

            amount:
                state.respect -
                previous.respect,

            requestedAmount:
                next -
                previous.respect,

            reason:
                "DEBUG_SET"

        }
    );


    return getRelationshipStatus();

}


function setDebugIrritation(
    value
) {

    initMrSmileRelationship();


    const numericValue =
        Number(value);


    if (
        !Number.isFinite(
            numericValue
        )
    ) {

        console.warn(
            "[MR.SMILE RELATIONSHIP] Invalid irritation:",
            value
        );

        return getRelationshipStatus();

    }


    const previous =
        getRawStateSnapshot();


    const next =
        clamp(
            numericValue
        );


    if (
        next ===
        state.irritation
    ) {

        return getRelationshipStatus();

    }


    state.irritation =
        next;


    saveRelationship();


    console.log(
        "[MR.SMILE RELATIONSHIP] Irritation:",
        previous.irritation,
        "→",
        state.irritation
    );


    emitRelationshipChanged(
        previous,
        "DEBUG_SET_IRRITATION"
    );


    trigger(
        "mrsmile:irritationChanged",
        {

            oldValue:
                previous.irritation,

            newValue:
                state.irritation,

            amount:
                state.irritation -
                previous.irritation,

            requestedAmount:
                next -
                previous.irritation,

            reason:
                "DEBUG_SET"

        }
    );


    return getRelationshipStatus();

}


/* =======================================
   GLOBAL DEBUG API
======================================= */

if (
    typeof window !==
    "undefined"
) {

    window.debugRelationship = {

        status() {

            return getRelationshipStatus();

        },


        setRespect(
            value
        ) {

            return setDebugRespect(
                value
            );

        },


        setIrritation(
            value
        ) {

            return setDebugIrritation(
                value
            );

        },


        changeRespect(
            amount,
            reason = "DEBUG_CHANGE"
        ) {

            return changeRespect(
                amount,
                reason
            );

        },


        changeIrritation(
            amount,
            reason = "DEBUG_CHANGE"
        ) {

            return changeIrritation(
                amount,
                reason
            );

        },


        change(
            changes,
            reason = "DEBUG_CHANGE"
        ) {

            return changeRelationship(
                changes,
                reason
            );

        },


        reward(
            amount = 5,
            reason = "DEBUG_REWARD"
        ) {

            return rewardOperator(
                amount,
                reason
            );

        },


        punish(
            amount = 5,
            reason = "DEBUG_PUNISH"
        ) {

            return punishOperator(
                amount,
                reason
            );

        },


        reset() {

            return resetMrSmileRelationship();

        }

    };

}


/* =======================================
   AUTO INITIALIZATION
======================================= */

try {

    initMrSmileRelationship();

} catch (error) {

    console.error(
        "[MR.SMILE RELATIONSHIP] Initialization failed:",
        error
    );

}


/* =======================================
   DEFAULT EXPORT
======================================= */

export default {

    initMrSmileRelationship,

    changeRespect,

    changeIrritation,

    changeRelationship,

    rewardOperator,

    punishOperator,

    getRelationshipLevel,

    getRelationshipScore,

    getRelationshipStatus,

    isRelationshipAtLeast,

    isHelpful,

    isHostile,

    isTrusted,

    shouldHelpOperator,

    shouldRefuseOperator,

    shouldRemainNeutral,

    resetMrSmileRelationship

};
