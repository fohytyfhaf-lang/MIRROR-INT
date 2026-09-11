/* ==========================================================
   MR.SMILE BEHAVIOR SYSTEM
   OMEGA SYSTEM

   Personality:

   - calm
   - polite
   - gentlemanly
   - vague
   - patient
   - observant
   - highly informed
   - fond of old things and classical culture
   - never needlessly rude
   - rarely interrupts
   - gives operator time to think and write

   Behavior decides:

       INTENT
       ACTION

   Actions executes it.
========================================================== */

import {
    trigger,
    on
} from "./eventManager.js";

import {
    initMrSmileRelationship,
    getRelationshipStatus,
    shouldHelpOperator
} from "./mrsmileRelationship.js";

import {
    initMemory,
    getMemory,
    rememberDecision,
    changeBehaviorMetric
} from "./mrsmileMemory.js";


/* ==========================================================
   STATE
========================================================== */

const state = {

    initialized: false,

    lastDecision: null,
    lastContext: null,

    decisionHistory: [],

    maxHistory: 50,

    lastVisibleReactionAt: 0,
    lastVisibleKey: "",

    visibleCooldown:
        7000

};


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileBehavior() {

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


    console.log(
        "[MR.SMILE BEHAVIOR] Initialized."
    );


    trigger(
        "mrsmile:behaviorInitialized"
    );

}


/* ==========================================================
   LISTENERS
========================================================== */

function registerListeners() {

    on(
        "mrsmile:relationshipChanged",
        status => {

            if (!status) {
                return;
            }


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


    on(
        "mrsmile:archiveAccessRequested",
        () =>
            handleAccessRequest(
                "archive"
            )
    );


    on(
        "mrsmile:gameAccessRequested",
        () =>
            handleAccessRequest(
                "game"
            )
    );


    on(
        "mrsmile:truthAccessRequested",
        () =>
            handleAccessRequest(
                "truth"
            )
    );

}


/* ==========================================================
   REQUEST
========================================================== */

export function requestMrSmileBehavior(
    context = {}
) {

    initMrSmileBehavior();


    const decision =
        decide(
            context
        );


    emitDecision(
        decision,
        context
    );


    return decision;
}


/* ==========================================================
   ACCESS
========================================================== */

export function handleAccessRequest(
    type
) {

    return requestMrSmileBehavior({

        type,

        reason:
            "access_request",

        source:
            "system",

        importance:
            7,

        significant:
            true

    });

}


/* ==========================================================
   MAIN DECISION
========================================================== */

export function decide(
    context = {}
) {

    initMrSmileBehavior();


    const relationship =
        getRelationshipStatus();


    const memory =
        getMemory();


    const normalized = {

        ...context,

        relationship:
            relationship.level,

        trust:
            relationship.trust,

        respect:
            relationship.respect,

        irritation:
            relationship.irritation,

        score:
            relationship.score,

        memory

    };


    let decision;


    switch (
        normalized.type
    ) {

        case "archive":
        case "archive_access":

            decision =
                decideArchive(
                    normalized
                );

            break;


        case "game":
        case "game_access":

            decision =
                decideGame(
                    normalized
                );

            break;


        case "truth":
        case "truth_access":

            decision =
                decideTruth(
                    normalized
                );

            break;


        case "operator_help_request":

            decision =
                decideHelp(
                    normalized
                );

            break;


        case "operator_attack":

            decision =
                decideAttack(
                    normalized
                );

            break;


        case "restricted_file":

            decision =
                decideRestricted(
                    normalized
                );

            break;


        case "file_open":

            decision =
                decideFileOpen(
                    normalized
                );

            break;


        case "console_command":

            decision =
                decideConsole(
                    normalized
                );

            break;


        case "camera_switch":

            decision =
                decideCamera(
                    normalized
                );

            break;


        case "window_open":
        case "window_close":
        case "window_focus":
        case "window_move":

            decision =
                decideWindow(
                    normalized
                );

            break;


        case "settings_change":

            decision =
                decideSettings(
                    normalized
                );

            break;


        default:

            decision =
                decideGeneral(
                    normalized
                );

            break;

    }


    state.lastDecision =
        decision;


    state.lastContext =
        normalized;


    state.decisionHistory.push(
        decision
    );


    while (
        state.decisionHistory.length >
        state.maxHistory
    ) {

        state.decisionHistory.shift();

    }


    rememberDecision(
        decision
    );


    return decision;
}


/* ==========================================================
   ARCHIVE
========================================================== */

function decideArchive(
    context
) {

    if (
        context.relationship ===
        "close"
        ||
        context.relationship ===
        "trusted"
    ) {

        return createDecision(

            "grant",

            "archive",

            "offer_access",

            "operator_trusted"

        );

    }


    return createDecision(

        "delay",

        "archive",

        "let_operator_wait",

        "not_yet"

    );

}


/* ==========================================================
   GAME
========================================================== */

function decideGame(
    context
) {

    if (
        context.relationship ===
        "close"
        ||
        context.relationship ===
        "trusted"
    ) {

        return createDecision(

            "grant",

            "game",

            "offer_game",

            "operator_trusted"

        );

    }


    return createDecision(

        "delay",

        "game",

        "perhaps_later",

        "not_yet"

    );

}


/* ==========================================================
   TRUTH
========================================================== */

function decideTruth(
    context
) {

    /*
     * MR.SMILE does not simply deny truth.
     * He prefers to let the operator arrive
     * at it gradually.
     */

    if (
        context.relationship ===
        "close"
        &&
        context.importance >=
        8
    ) {

        return createDecision(

            "grant",

            "truth",

            "permit_truth",

            "operator_ready"

        );

    }


    return createDecision(

        "delay",

        "truth",

        "make_operator_wait",

        "some_answers_require_time"

    );

}


/* ==========================================================
   HELP
========================================================== */

function decideHelp(
    context
) {

    if (
        shouldHelpOperator()
    ) {

        return createDecision(

            "help",

            "operator",

            "assist_operator",

            "mrsmile_willing_to_help"

        );

    }


    return createDecision(

        "delay",

        "operator",

        "consider_help",

        "mrsmile_is_considering"

    );

}


/* ==========================================================
   ATTACK
========================================================== */

function decideAttack(
    context
) {

    /*
     * Gentleman rule:
     *
     * Anger is shown through boundaries,
     * not insults.
     */

    if (
        context.relationship ===
        "close"
        ||
        context.relationship ===
        "trusted"
    ) {

        return createDecision(

            "warn",

            "operator",

            "set_boundary",

            "unexpected_action"

        );

    }


    if (
        context.relationship ===
        "friendly"
        ||
        context.relationship ===
        "neutral"
        ||
        context.relationship ===
        "cold"
    ) {

        return createDecision(

            "block",

            "operator",

            "quietly_stop_action",

            "boundary"

        );

    }


    return createDecision(

        "sabotage",

        "operator",

        "protect_system",

        "repeated_hostility"

    );

}


/* ==========================================================
   RESTRICTED
========================================================== */

function decideRestricted(
    context
) {

    if (
        context.relationship ===
        "close"
        &&
        context.importance >=
        8
    ) {

        return createDecision(

            "grant",

            "restricted_file",

            "permit_restricted_access",

            "operator_trusted"

        );

    }


    /*
     * Friendly does not mean automatic access.
     * MR.SMILE simply makes them wait.
     */

    if (
        context.relationship ===
        "friendly"
        ||
        context.relationship ===
        "neutral"
    ) {

        return createDecision(

            "delay",

            "restricted_file",

            "withhold_for_now",

            "not_yet"

        );

    }


    return createDecision(

        "deny",

        "restricted_file",

        "protect_information",

        "insufficient_trust"

    );

}


/* ==========================================================
   FILE OPEN
========================================================== */

function decideFileOpen(
    context
) {

    const target =
        String(
            context.target ||
            ""
        ).toLowerCase();


    if (
        target.includes(
            "entity_mrsmile"
        )
    ) {

        changeBehaviorMetric(
            "attention",
            5
        );


        changeBehaviorMetric(
            "curiosity",
            7
        );


        return visibleReaction(

            context,

            "speak",

            "mrsmile_file",

            "acknowledge_operator",

            "read_entity_file"

        );

    }


    if (
        target.includes(
            "truth"
        )
        ||
        target.includes(
            "mirror"
        )
        ||
        context.importance >=
        7
    ) {

        changeBehaviorMetric(
            "attention",
            4
        );


        changeBehaviorMetric(
            "curiosity",
            5
        );


        return visibleReaction(

            context,

            "speak",

            "operator",

            "acknowledge_interest",

            "important_file"

        );

    }


    /*
     * Ordinary files are internal observation.
     */

    return createDecision(

        "observe",

        "file",

        "watch_quietly",

        "ordinary_file"

    );

}


/* ==========================================================
   CONSOLE
========================================================== */

function decideConsole(
    context
) {

    const command =
        String(
            context.target ||
            ""
        ).toLowerCase();


    if (
        command.includes(
            "sys_00"
        )
        ||
        command.includes(
            "truth"
        )
        ||
        command.includes(
            "terminate"
        )
        ||
        command.includes(
            "delete"
        )
    ) {

        changeBehaviorMetric(
            "suspicion",
            5
        );


        return visibleReaction(

            context,

            "speak",

            "console",

            "acknowledge_command",

            "sensitive_command"

        );

    }


    return createDecision(

        "observe",

        "console",

        "watch_command",

        "ordinary_command"

    );

}


/* ==========================================================
   CAMERA
========================================================== */

function decideCamera(
    context
) {

    if (
        context.importance >=
        7
    ) {

        return visibleReaction(

            context,

            "speak",

            "camera",

            "acknowledge_observation",

            "interesting_camera"

        );

    }


    return createDecision(

        "observe",

        "camera",

        "watch_camera",

        "quiet_observation"

    );

}


/* ==========================================================
   WINDOWS
========================================================== */

function decideWindow(
    context
) {

    if (
        context.importance >=
        7
    ) {

        return visibleReaction(

            context,

            "speak",

            context.target ||
            "window",

            "acknowledge_window",

            "important_window"

        );

    }


    return createDecision(

        "observe",

        "window",

        "watch_window",

        "ordinary_window"

    );

}


/* ==========================================================
   SETTINGS
========================================================== */

function decideSettings(
    context
) {

    return createDecision(

        "observe",

        "settings",

        "remember_preferences",

        "operator_changed_settings"

    );

}


/* ==========================================================
   GENERAL
========================================================== */

function decideGeneral(
    context
) {

    if (
        context.importance < 5
        &&
        !context.significant
    ) {

        return createDecision(

            "observe",

            "general",

            "silent_observation",

            "low_importance"

        );

    }


    return visibleReaction(

        context,

        "speak",

        "operator",

        "acknowledge_action",

        "meaningful_action"

    );

}


/* ==========================================================
   VISIBLE REACTION
========================================================== */

function visibleReaction(

    context,

    action,

    target,

    intent,

    reason

) {

    const now =
        Date.now();


    const key =
        `${action}:${target}:${intent}`;


    if (

        now -
        state.lastVisibleReactionAt
        <
        state.visibleCooldown

        &&

        state.lastVisibleKey ===
        key

    ) {

        return createDecision(

            "observe",

            target,

            "continue_watching",

            "repeat_suppressed"

        );

    }


    state.lastVisibleReactionAt =
        now;


    state.lastVisibleKey =
        key;


    return createDecision(

        action,

        target,

        intent,

        reason

    );

}


/* ==========================================================
   DECISION CREATOR
========================================================== */

function createDecision(

    action,

    target,

    intent,

    reason

) {

    return {

        action,

        target,

        intent,

        reason,


        personality:
            "calm_gentleman",


        responseStyle:
            "calm_vague_old_fashioned",


        responseDelay:

            action ===
            "speak"

                ?

                randomBetween(
                    2200,
                    4800
                )

                :

                randomBetween(
                    500,
                    1200
                ),


        allowOperatorTime:
            true,


        interrupting:
            false,


        timestamp:
            Date.now()

    };

}


/* ==========================================================
   EMIT
========================================================== */

function emitDecision(
    decision,
    context
) {

    trigger(
        "mrsmile:behaviorDecision",
        decision
    );


    /*
     * IMPORTANT:
     *
     * Behavior may request speech,
     * but Actions does not decide what
     * MR.SMILE says.
     */

    if (
        decision.action ===
        "speak"
    ) {

        const text =
            composeContextLine(
                decision,
                context
            );


        if (
            text
        ) {

            trigger(
                "mrsmile:chatMessage",
                {

                    text,

                    delay:
                        decision.responseDelay,

                    source:
                        "behavior",

                    allowOperatorTime:
                        true,

                    stopIdle:
                        true,

                    resumeIdle:
                        true

                }
            );

        }

    }


    trigger(
        "mrsmile:behaviorEvaluated",
        {

            context,

            decision

        }
    );


    console.log(
        "[MR.SMILE BEHAVIOR] Decision:",
        decision
    );


    return decision;
}


/* ==========================================================
   SPEECH
========================================================== */

function composeContextLine(
    decision,
    context
) {

    switch (
        decision.intent
    ) {

        case "acknowledge_operator":

            return pick([

                "I see. You have been looking rather carefully.",

                "Yes. You found that one.",

                "Quite. I had wondered when you would notice it.",

                "Take your time. There is no need to hurry."

            ]);


        case "acknowledge_interest":

            return pick([

                "That is an older record than it first appears.",

                "You may read it. I shall not disturb you.",

                "There is something worth noticing there.",

                "I suspected you would eventually come across that."

            ]);


        case "acknowledge_command":

            return pick([

                "A rather interesting command.",

                "I should give that one a little thought.",

                "Please, take a moment before going further.",

                "There is little virtue in rushing the terminal."

            ]);


        case "acknowledge_observation":

            return pick([

                "That camera has a rather peculiar view.",

                "You may wish to watch it for a while.",

                "Some things become clearer when one is patient."

            ]);


        case "acknowledge_window":

            return pick([

                "That window may be worth keeping open.",

                "You have opened something interesting.",

                "Very well. I shall remain here while you look."

            ]);


        case "acknowledge_action":

            return pick([

                "I noticed that.",

                "Quite.",

                "I see what you are doing.",

                "There is no need to hurry."

            ]);


        case "offer_access":

            return "Very well. You may have a look.";


        case "make_operator_wait":

            return pick([

                "Not quite yet.",

                "I believe that answer can wait a little longer.",

                "Perhaps later. Some things benefit from patience.",

                "I would rather not rush that particular door."

            ]);


        case "withhold_for_now":

            return pick([

                "Not yet, I think.",

                "Let us leave that one closed for the moment.",

                "I am afraid you shall have to wait a little.",

                "There are reasons for being patient."

            ]);


        case "unexpected_action":

            return pick([

                "I would rather you did not do that.",

                "Please, reconsider.",

                "That seems unnecessary.",

                "I should advise against it."

            ]);


        default:

            return pick([

                "I am listening.",

                "Please, continue.",

                "Take your time.",

                "Quite."

            ]);

    }

}


/* ==========================================================
   STATUS
========================================================== */

export function getMrSmileBehaviorStatus() {

    return {

        initialized:
            state.initialized,

        lastDecision:
            state.lastDecision,

        lastContext:
            state.lastContext,

        historyLength:
            state.decisionHistory.length,

        lastVisibleReactionAt:
            state.lastVisibleReactionAt

    };

}


/* ==========================================================
   DEBUG
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_BEHAVIOR = {

        decide,

        request:
            requestMrSmileBehavior,

        execute:
            decision =>
                trigger(
                    "mrsmile:actionRequested",
                    decision
                ),

        status:
            getMrSmileBehaviorStatus

    };

}


/* ==========================================================
   HELPERS
========================================================== */

function pick(
    values
) {

    return values[
        Math.floor(
            Math.random() *
            values.length
        )
    ];

}


function randomBetween(
    min,
    max
) {

    return Math.floor(

        Math.random() *
        (
            max -
            min +
            1
        )

    ) + min;

}
