// =======================================
// MR.SMILE BEHAVIOR SYSTEM
// OMEGA SYSTEM
// =======================================
//
// This module decides what MR.SMILE
// WANTS to do.
//
// It does NOT directly manipulate the UI.
//
// It evaluates:
//
// - relationship
// - trust
// - respect
// - irritation
// - context
//
// Then produces a behavioral decision.
//
// Actual execution belongs to:
//
// mrsmileActions.js
//
// =======================================


import {
    trigger,
    on
} from "./eventManager.js";

import {
    initMrSmileRelationship,
    getRelationshipStatus,
    getRelationshipLevel,
    isHelpful,
    isHostile,
    isTrusted,
    shouldHelpOperator,
    shouldRefuseOperator
} from "./mrsmileRelationship.js";

console.log(
    "[MR.SMILE DEBUG] Initial MRSMILE:",
    window.MRSMILE
);


// =======================================
// STATE
// =======================================

const state = {

    initialized: false,

    lastDecision: null,

    lastContext: null,

    decisionHistory: [],

    maxHistory: 30

};


// =======================================
// INITIALIZATION
// =======================================

export function initMrSmileBehavior() {

    if (state.initialized)
        return;


    state.initialized = true;


    initMrSmileRelationship();


    registerListeners();


    console.log(
        "[MR.SMILE BEHAVIOR] Initialized."
    );


    trigger(
        "mrsmile:behaviorInitialized"
    );

}


// =======================================
// EVENT LISTENERS
// =======================================

function registerListeners() {

    // -----------------------------------
    // RELATIONSHIP CHANGED
    // -----------------------------------

    on(
        "mrsmile:relationshipChanged",

        status => {

            if (!status)
                return;


            console.log(
                "[MR.SMILE BEHAVIOR] Relationship changed:",
                status.level
            );


            trigger(
                "mrsmile:behaviorStateChanged",
                {

                    relationship:
                        status.level,

                    status

                }
            );

        }

    );


    // -----------------------------------
    // ACCESS REQUESTS
    // -----------------------------------

    on(
        "mrsmile:archiveAccessRequested",

        () => {

            handleAccessRequest(
                "archive"
            );

        }

    );


    on(
        "mrsmile:gameAccessRequested",

        () => {

            handleAccessRequest(
                "game"
            );

        }

    );


    on(
        "mrsmile:truthAccessRequested",

        () => {

            handleAccessRequest(
                "truth"
            );

        }

    );

}


// =======================================
// ACCESS REQUEST
// =======================================
//
// This is where MR.SMILE starts making
// decisions.
//
// He does NOT automatically grant access.
//
// He evaluates his current attitude.
// =======================================

export function handleAccessRequest(
    type
) {

    initMrSmileBehavior();


    const context = {

        type,

        reason:
            "access_request"

    };


    const decision =
        decide(context);


    executeDecision(
        decision
    );


    return decision;

}


// =======================================
// GENERAL DECISION
// =======================================
//
// Other systems can use this:
//
// decide({
//     type: "operator_help_request"
// });
//
// decide({
//     type: "restricted_file"
// });
//
// decide({
//     type: "operator_attack"
// });
//
// =======================================

export function decide(
    context = {}
) {

    initMrSmileBehavior();


    const status =
        getRelationshipStatus();


    const normalizedContext = {

        ...context,

        relationship:
            status.level,

        trust:
            status.trust,

        respect:
            status.respect,

        irritation:
            status.irritation,

        score:
            status.score

    };


    let decision;


    // ===================================
    // CONTEXT
    // ===================================

    switch (
        context.type
    ) {

        case "archive":

            decision =
                decideArchive(
                    normalizedContext
                );

            break;


        case "game":

            decision =
                decideGame(
                    normalizedContext
                );

            break;


        case "truth":

            decision =
                decideTruth(
                    normalizedContext
                );

            break;


        case "operator_help_request":

            decision =
                decideHelp(
                    normalizedContext
                );

            break;


        case "operator_attack":

            decision =
                decideAttack(
                    normalizedContext
                );

            break;


        case "restricted_file":

            decision =
                decideRestrictedFile(
                    normalizedContext
                );

            break;


        default:

            decision =
                decideGeneral(
                    normalizedContext
                );

            break;

    }


    // -----------------------------------
    // SAVE DECISION
    // -----------------------------------

    state.lastDecision =
        decision;


    state.lastContext =
        normalizedContext;


    rememberDecision(
        decision
    );


    // -----------------------------------
    // EVENT
    // -----------------------------------

    trigger(
        "mrsmile:behaviorDecision",
        decision
    );


    console.log(
        "[MR.SMILE BEHAVIOR] Decision:",
        decision
    );


    return decision;

}


// =======================================
// ARCHIVE
// =======================================

function decideArchive(
    context
) {

    // -----------------------------------
    // CLOSE / TRUSTED
    // -----------------------------------

    if (
        context.relationship === "close" ||
        context.relationship === "trusted"
    ) {

        return createDecision(
            "grant",
            "archive",
            "operator_trusted"
        );

    }


    // -----------------------------------
    // FRIENDLY
    // -----------------------------------

    if (
        context.relationship === "friendly"
    ) {

        return createDecision(
            "delay",
            "archive",
            "operator_not_ready"
        );

    }


    // -----------------------------------
    // HOSTILE
    // -----------------------------------

    if (
        isHostile()
    ) {

        return createDecision(
            "deny",
            "archive",
            "relationship_hostile"
        );

    }


    // -----------------------------------
    // COLD / NEUTRAL
    // -----------------------------------

    return createDecision(
        "delay",
        "archive",
        "relationship_cold"
    );

}

 


// =======================================
// GAME
// =======================================

function decideGame(
    context
) {

    if (
        context.relationship ===
        "close"
    ) {

        return createDecision(

            "grant",

            "game",

            "operator_close"

        );

    }


    if (
        context.relationship ===
        "trusted"
    ) {

        return createDecision(

            "grant",

            "game",

            "operator_trusted"

        );

    }


    if (
        context.relationship ===
        "friendly"
    ) {

        return createDecision(

            "delay",

            "game",

            "operator_not_ready"

        );

    }


    if (
        isHostile()
    ) {

        return createDecision(

            "deny",

            "game",

            "relationship_hostile"

        );

    }


         return createDecision(
           "delay",
             
            "game",
             
            "relationship_cold"


       );

}


// =======================================
// TRUTH
// =======================================

function decideTruth(
    context
) {

    // -----------------------------------
    // DEEP TRUST
    // -----------------------------------

    if (
        context.relationship ===
        "close"
    ) {

        return createDecision(

            "grant",

            "truth",

            "operator_close"

        );

    }


    // -----------------------------------
    // TRUSTED
    // -----------------------------------

    if (
        context.relationship ===
        "trusted"
    ) {

        return createDecision(

            "delay",

            "truth",

            "truth_requires_more"

        );

    }


    // -----------------------------------
    // FRIENDLY
    // -----------------------------------

    if (
        context.relationship ===
        "friendly"
    ) {

        return createDecision(

            "deny",

            "truth",

            "insufficient_relationship"

        );

    }


    // -----------------------------------
    // HOSTILE
    // -----------------------------------

    if (
        isHostile()
    ) {

        return createDecision(

            "deny",

            "truth",

            "relationship_hostile"

        );

    }


    return createDecision(

        "deny",

        "truth",

        "operator_not_ready"

    );

}


// =======================================
// HELP REQUEST
// =======================================

function decideHelp(
    context
) {

    if (
        shouldHelpOperator()
    ) {

        return createDecision(

            "help",

            "operator",

            "mrsmile_willing_to_help"

        );

    }


    if (
        shouldRefuseOperator()
    ) {

        return createDecision(

            "refuse",

            "operator",

            "mrsmile_unwilling_to_help"

        );

    }


    return createDecision(

        "observe",

        "operator",

        "mrsmile_observing"

    );

}


// =======================================
// OPERATOR ATTACK
// =======================================

function decideAttack(
    context
) {

    // -----------------------------------
    // CLOSE RELATIONSHIP
    // -----------------------------------
    //
    // MR.SMILE may not retaliate immediately.
    //
    // This is important for personality.
    // -----------------------------------

    if (
        context.relationship ===
        "close"
    ) {

        return createDecision(

            "warn",

            "operator",

            "unexpected_hostility"

        );

    }


    // -----------------------------------
    // TRUSTED
    // -----------------------------------

    if (
        context.relationship ===
        "trusted"
    ) {

        return createDecision(

            "warn",

            "operator",

            "trust_violation"

        );

    }


    // -----------------------------------
    // FRIENDLY
    // -----------------------------------

    if (
        context.relationship ===
        "friendly"
    ) {

        return createDecision(

            "interfere",

            "operator",

            "boundary_violation"

        );

    }


    // -----------------------------------
    // NEUTRAL / COLD
    // -----------------------------------

    if (
        context.relationship ===
        "neutral"
        ||
        context.relationship ===
        "cold"
    ) {

        return createDecision(

            "block",

            "operator",

            "unauthorized_action"

        );

    }


    // -----------------------------------
    // HOSTILE
    // -----------------------------------

    return createDecision(

        "sabotage",

        "operator",

        "hostile_operator"

    );

}


// =======================================
// RESTRICTED FILE
// =======================================

function decideRestrictedFile(
    context
) {

    if (
        context.relationship ===
        "close"
    ) {

        return createDecision(

            "grant",

            "restricted_file",

            "trusted_operator"

        );

    }


    if (
        context.relationship ===
        "trusted"
    ) {

        return createDecision(

            "grant",

            "restricted_file",

            "operator_trusted"

        );

    }


    if (
        context.relationship ===
        "friendly"
    ) {

        return createDecision(

            "delay",

            "restricted_file",

            "operator_not_ready"

        );

    }


    return createDecision(

        "deny",

        "restricted_file",

        "insufficient_relationship"

    );

}


// =======================================
// GENERAL BEHAVIOR
// =======================================

function decideGeneral(
    context
) {

    if (
        isTrusted()
    ) {

        return createDecision(

            "observe",

            "general",

            "trusted_observation"

        );

    }


    if (
        isHelpful()
    ) {

        return createDecision(

            "observe",

            "general",

            "friendly_observation"

        );

    }


    if (
        isHostile()
    ) {

        return createDecision(

            "interfere",

            "general",

            "hostile_presence"

        );

    }


    return createDecision(

        "observe",

        "general",

        "neutral_presence"

    );

}


// =======================================
// CREATE DECISION
// =======================================

function createDecision(
    action,
    target,
    reason
) {

    return {

        action,

        target,

        reason,

        timestamp:
            Date.now(),

        relationship:
            getRelationshipLevel()

    };

}


// =======================================
// EXECUTE DECISION
// =======================================
//
// IMPORTANT:
//
// This function does NOT manipulate DOM.
//
// It only sends the decision to the
// action layer.
//
// mrsmileActions.js will listen here.
// =======================================

function executeDecision(
    decision
) {

    if (!decision)
        return;


    trigger(
        "mrsmile:actionRequested",
        decision
    );

}


// =======================================
// DECISION HISTORY
// =======================================

function rememberDecision(
    decision
) {

    state.decisionHistory.push(
        decision
    );


    if (
        state.decisionHistory.length >
        state.maxHistory
    ) {

        state.decisionHistory.shift();

    }

}


// =======================================
// GET LAST DECISION
// =======================================

export function getLastMrSmileDecision() {

    initMrSmileBehavior();


    return state.lastDecision;

}


// =======================================
// GET LAST CONTEXT
// =======================================

export function getLastMrSmileContext() {

    initMrSmileBehavior();


    return state.lastContext;

}


// =======================================
// GET HISTORY
// =======================================

export function getMrSmileBehaviorHistory() {

    initMrSmileBehavior();


    return [
        ...state.decisionHistory
    ];

}


// =======================================
// CLEAR HISTORY
// =======================================

export function clearMrSmileBehaviorHistory() {

    state.decisionHistory = [];


    console.log(
        "[MR.SMILE BEHAVIOR] History cleared."
    );

}


// =======================================
// MANUAL BEHAVIOR REQUEST
// =======================================
//
// Useful for other systems.
//
// Example:
//
// requestBehavior({
//     type: "restricted_file",
//     file: "MIRROR-00"
// });
// =======================================
export function requestMrSmileBehavior(
    context = {}
) {

    initMrSmileBehavior();

    const decision = decide(
        context
    );

    // Remember what MR.SMILE saw
    state.lastContext = {
        ...context
    };

    // Remember what MR.SMILE decided
    state.lastDecision = decision;

    // Add decision to history
    rememberDecision(
        decision
    );

    // Send decision to action layer
    executeDecision(
        decision
    );

    return decision;

}


// =======================================
// RESET
// =======================================

export function resetMrSmileBehavior() {

    state.lastDecision =
        null;


    state.lastContext =
        null;


    state.decisionHistory =
        [];


    console.log(
        "[MR.SMILE BEHAVIOR] Reset."
    );


    trigger(
        "mrsmile:behaviorReset"
    );

}

/* ===================================
        MR.SMILE GLOBAL DEBUG API
=================================== */

window.MRSMILE = window.MRSMILE || {};


/* ===================================
        HELP
=================================== */

window.MRSMILE.help = function() {

    console.log(`
=======================================
        MR.SMILE DEBUG
=======================================

BEHAVIOR:

MRSMILE.test("operator_help_request")
MRSMILE.test("operator_attack")
MRSMILE.test("restricted_file")

ACCESS:

MRSMILE.access("archive")
MRSMILE.access("game")
MRSMILE.access("truth")

STATUS:

MRSMILE.status()

=======================================
`);

};


/* ===================================
        TEST BEHAVIOR
=================================== */

window.MRSMILE.test = function(
    type,
    target = "test"
) {

    console.log(
        "[MR.SMILE DEBUG] Testing:",
        type,
        target
    );


    const decision =
        requestMrSmileBehavior({

            type: type,

            target: target,

            reason: "debug_test"

        });


    console.log(
        "[MR.SMILE DEBUG] Decision:",
        decision
    );


    return decision;

};


/* ===================================
        ACCESS TEST
=================================== */

window.MRSMILE.access = function(
    type
) {

    if (
        type !== "archive" &&
        type !== "game" &&
        type !== "truth"
    ) {

        console.warn(
            "[MR.SMILE DEBUG] Invalid access type:",
            type
        );

        console.log(
            "Available: archive, game, truth"
        );

        return null;

    }


    return window.MRSMILE.test(
        type,
        type
    );

};


/* ===================================
        STATUS
=================================== */

window.MRSMILE.status = function() {

    const relationship =
        getRelationshipStatus();


    const result = {

        relationship,

        lastDecision:
            state.lastDecision,

        lastContext:
            state.lastContext,

        history:
            [
                ...state.decisionHistory
            ]

    };


    console.log(
        "[MR.SMILE DEBUG] STATUS",
        result
    );


    return result;

};


/* ===================================
        DEBUG READY
=================================== */

console.log(
    "[MR.SMILE DEBUG] Global API ready:",
    window.MRSMILE
);
console.log(
    "[MR.SMILE DEBUG TEST] behavior.js debug block loaded"
);

