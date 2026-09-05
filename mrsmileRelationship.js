// =======================================
// MR.SMILE RELATIONSHIP SYSTEM
// OMEGA SYSTEM
// =======================================
//
// MR.SMILE does not simply like/dislike
// the operator.
//
// His attitude is based on several values:
//
// TRUST
// RESPECT
// IRRITATION
//
// The final relationship state is calculated
// from these values.
//
// This module does NOT control visual
// manifestations or sabotage.
//
// It only describes:
//
// "How does MR.SMILE currently regard
// the operator?"
// =======================================


import {
    trigger,
    on
} from "./eventManager.js";

import {
    getTrust,
    initTrust
} from "./mrsmileTrust.js";


// =======================================
// STORAGE
// =======================================

const STORAGE_KEY =
    "mrsmile_relationship";


// =======================================
// LIMITS
// =======================================

const MIN_VALUE = 0;
const MAX_VALUE = 100;


// =======================================
// STATE
// =======================================

const state = {

    trust: 0,

    respect: 50,

    irritation: 0,

    initialized: false

};


// =======================================
// INTERNAL
// =======================================

let initialized = false;
let trustListenerRegistered = false;


// =======================================
// INITIALIZATION
// =======================================

export function initMrSmileRelationship() {

    if (initialized) {

        syncTrust();

        return;

    }


    initialized = true;


    // -----------------------------------
    // TRUST SYSTEM
    // -----------------------------------

    initTrust();


    // -----------------------------------
    // LOAD
    // -----------------------------------

    loadRelationship();


    // -----------------------------------
    // SYNC TRUST
    // -----------------------------------

    syncTrust();


    // -----------------------------------
    // LISTEN FOR TRUST CHANGES
    // -----------------------------------

    registerTrustListener();


    // -----------------------------------
    // INITIAL STATE
    // -----------------------------------

    state.initialized =
        true;


    console.log(
        "[MR.SMILE RELATIONSHIP] Initialized."
    );


    trigger(
        "mrsmile:relationshipInitialized",
        getRelationshipStatus()
    );

}


// =======================================
// TRUST LISTENER
// =======================================

function registerTrustListener() {

    if (trustListenerRegistered)
        return;


    trustListenerRegistered =
        true;


    on(
        "mrsmile:trustChanged",

        () => {

            syncTrust();


            trigger(
                "mrsmile:relationshipChanged",
                getRelationshipStatus()
            );

        }

    );

}


// =======================================
// SYNC TRUST
// =======================================
//
// Trust remains owned by mrsmileTrust.js.
//
// Relationship only mirrors it.
// =======================================

function syncTrust() {

    try {

        state.trust =
            clamp(
                getTrust()
            );

    }
    catch (error) {

        console.warn(
            "[MR.SMILE RELATIONSHIP] Failed to sync trust.",
            error
        );

    }

}


// =======================================
// CHANGE RESPECT
// =======================================

export function changeRespect(
    amount,
    reason = ""
) {

    initMrSmileRelationship();


    const oldValue =
        state.respect;


    state.respect =
        clamp(
            state.respect + amount
        );


    if (
        oldValue ===
        state.respect
    ) {

        return false;

    }


    saveRelationship();


    console.log(
        "[MR.SMILE RELATIONSHIP] Respect:",
        oldValue,
        "→",
        state.respect,
        reason
    );


    trigger(
        "mrsmile:respectChanged",
        {

            oldValue,

            newValue:
                state.respect,

            amount,

            reason

        }
    );


    trigger(
        "mrsmile:relationshipChanged",
        getRelationshipStatus()
    );


    return true;

}


// =======================================
// CHANGE IRRITATION
// =======================================

export function changeIrritation(
    amount,
    reason = ""
) {

    initMrSmileRelationship();


    const oldValue =
        state.irritation;


    state.irritation =
        clamp(
            state.irritation + amount
        );


    if (
        oldValue ===
        state.irritation
    ) {

        return false;

    }


    saveRelationship();


    console.log(
        "[MR.SMILE RELATIONSHIP] Irritation:",
        oldValue,
        "→",
        state.irritation,
        reason
    );


    trigger(
        "mrsmile:irritationChanged",
        {

            oldValue,

            newValue:
                state.irritation,

            amount,

            reason

        }
    );


    trigger(
        "mrsmile:relationshipChanged",
        getRelationshipStatus()
    );


    return true;

}


// =======================================
// COMBINED RELATIONSHIP CHANGE
// =======================================
//
// Useful for meaningful player actions.
//
// Example:
//
// improveRelationship({
//     respect: +5,
//     irritation: -3
// });
// =======================================

export function changeRelationship(
    changes = {},
    reason = ""
) {

    initMrSmileRelationship();


    let changed =
        false;


    if (
        Number.isFinite(
            changes.respect
        )
    ) {

        const result =
            changeRespect(
                changes.respect,
                reason
            );


        if (result)
            changed = true;

    }


    if (
        Number.isFinite(
            changes.irritation
        )
    ) {

        const result =
            changeIrritation(
                changes.irritation,
                reason
            );


        if (result)
            changed = true;

    }


    if (changed) {

        saveRelationship();


        trigger(
            "mrsmile:relationshipAction",
            {

                changes,

                reason,

                status:
                    getRelationshipStatus()

            }
        );

    }


    return changed;

}


// =======================================
// POSITIVE ACTION
// =======================================
//
// Convenience helper.
//
// Example:
// MR.SMILE helps operator.
// Operator responds correctly.
// Respect increases.
// Irritation decreases.
// =======================================

export function rewardOperator(
    amount = 5,
    reason = ""
) {

    return changeRelationship(

        {

            respect:
                Math.abs(amount),

            irritation:
                -Math.abs(
                    Math.floor(
                        amount / 2
                    )
                )

        },

        reason

    );

}


// =======================================
// NEGATIVE ACTION
// =======================================
//
// Operator ignores warning,
// repeatedly asks forbidden questions,
// attempts to force access, etc.
// =======================================

export function punishOperator(
    amount = 5,
    reason = ""
) {

    return changeRelationship(

        {

            respect:
                -Math.abs(
                    Math.floor(
                        amount / 2
                    )
                ),

            irritation:
                Math.abs(amount)

        },

        reason

    );

}


// =======================================
// CALCULATE RELATIONSHIP
// =======================================
//
// This is NOT simply trust.
//
// Trust, respect and irritation all matter.
// =======================================

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


// =======================================
// RELATIONSHIP SCORE
// =======================================

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


    // -----------------------------------
    // Formula
    // -----------------------------------
    //
    // Trust = 50%
    // Respect = 35%
    // Irritation = -15%
    //
    // Irritation cannot completely erase
    // genuine trust, but it can push the
    // relationship downward.
    // -----------------------------------

    const score =

        trust * 0.50 +

        respect * 0.35 +

        (100 - irritation) * 0.15;


    return clamp(
        score
    );

}


// =======================================
// RELATIONSHIP SCORE
// =======================================

export function getRelationshipScore() {

    initMrSmileRelationship();


    return Math.round(
        calculateRelationshipScore()
    );

}


// =======================================
// GET STATUS
// =======================================

export function getRelationshipStatus() {

    initMrSmileRelationship();


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

        score:
            getRelationshipScore(),

        level:
            getRelationshipLevel()

    };

}


// =======================================
// RELATIONSHIP CHECK
// =======================================

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
        getRelationshipLevel();


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


// =======================================
// BEHAVIOR HELPERS
// =======================================
//
// These functions will later be used by
// mrsmileBehavior.js.
//
// They do NOT perform the behavior.
// They only answer:
//
// "Would MR.SMILE probably do this?"
// =======================================

export function isHelpful() {

    return (

        isRelationshipAtLeast(
            "friendly"
        )

    );

}


export function isHostile() {

    return (

        getRelationshipLevel()
        === "hostile"

        ||

        getRelationshipLevel()
        === "cold"

    );

}


export function isTrusted() {

    return (

        isRelationshipAtLeast(
            "trusted"
        )

    );

}


// =======================================
// ACCESS DECISION HELPERS
// =======================================
//
// These are intentionally simple for now.
//
// Later mrsmileBehavior.js will combine
// these with personality, memory and context.
// =======================================

export function shouldHelpOperator() {

    initMrSmileRelationship();


    const level =
        getRelationshipLevel();


    return (

        level === "friendly" ||

        level === "trusted" ||

        level === "close"

    );

}


export function shouldRefuseOperator() {

    initMrSmileRelationship();


    const level =
        getRelationshipLevel();


    return (

        level === "hostile" ||

        level === "cold"

    );

}


export function shouldRemainNeutral() {

    initMrSmileRelationship();


    return (

        getRelationshipLevel()
        === "neutral"

    );

}


// =======================================
// RESET
// =======================================

export function resetMrSmileRelationship() {

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


    trigger(
        "mrsmile:relationshipReset"
    );


    trigger(
        "mrsmile:relationshipChanged",
        getRelationshipStatus()
    );

}


// =======================================
// CLAMP
// =======================================

function clamp(value) {

    return Math.max(
        MIN_VALUE,
        Math.min(
            MAX_VALUE,
            Number(value) || 0
        )
    );

}


// =======================================
// SAVE
// =======================================

function saveRelationship() {

    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify({

                respect:
                    state.respect,

                irritation:
                    state.irritation

            })

        );

    }
    catch (error) {

        console.error(
            "[MR.SMILE RELATIONSHIP] Failed to save.",
            error
        );

    }

}


// =======================================
// LOAD
// =======================================

function loadRelationship() {

    const raw =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!raw)
        return;


    try {

        const saved =
            JSON.parse(raw);


        if (
            Number.isFinite(
                saved.respect
            )
        ) {

            state.respect =
                clamp(
                    saved.respect
                );

        }


        if (
            Number.isFinite(
                saved.irritation
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

    }
    catch (error) {

        console.error(
            "[MR.SMILE RELATIONSHIP] Failed to load.",
            error
        );

    }

}
