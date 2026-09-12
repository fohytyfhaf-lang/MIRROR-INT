/* ==========================================================
   MR.SMILE BEHAVIOR — REBUILT / CONFLICT-SAFE
========================================================== */

import { trigger, on } from "./eventManager.js";
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


const state = {

    initialized: false,

    lastDecision: null,
    lastContext: null,

    history: [],

    maxHistory: 80,

    lastVisibleAt: 0,
    lastVisibleKey: "",

    visibleCooldown: 6500,

    listeners: false

};


const PRIORITY = {

    sabotage: 100,
    block: 90,
    interfere: 80,
    warn: 70,
    deny: 65,
    refuse: 65,
    grant: 60,
    help: 55,
    delay: 40,
    speak: 35,
    observe: 10

};


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileBehavior() {

    if (
        state.initialized
    ) {

        return state.lastDecision;

    }


    state.initialized = true;


    initMrSmileRelationship();

    initMemory();

    registerListeners();


    trigger(
        "mrsmile:behaviorInitialized",
        {
            timestamp:
                Date.now()
        }
    );


    console.log(
        "[MR.SMILE BEHAVIOR] Rebuilt behavior initialized."
    );


    return null;

}


/* ==========================================================
   LISTENERS
========================================================== */

function registerListeners() {

    if (
        state.listeners
    ) {

        return;

    }


    state.listeners = true;


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
   ACCESS REQUEST
========================================================== */

export function handleAccessRequest(
    type
) {

    return requestMrSmileBehavior({

        type,

        reason:
            "access_request",

        source:
            "progress",

        importance:
            type === "truth"
                ? 9
                : 7,

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


    const rel =
        getRelationshipStatus();


    const memory =
        getMemory();


    const normalized = {

        ...context,

        type:
            normalizeType(
                context.type
            ),

        relationship:
            rel.level,

        trust:
            rel.trust,

        respect:
            rel.respect,

        irritation:
            rel.irritation,

        score:
            rel.score,

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
        case "help":

            decision =
                decideHelp(
                    normalized
                );

            break;


        case "operator_attack":
        case "attack":
        case "sabotage":

            decision =
                decideAttack(
                    normalized
                );

            break;


        case "restricted_file":
        case "restricted_access":

            decision =
                decideRestricted(
                    normalized
                );

            break;


        case "file_open":

            decision =
                decideFile(
                    normalized
                );

            break;


        case "console_command":
        case "console":

            decision =
                decideConsole(
                    normalized
                );

            break;


        case "camera_switch":
        case "camera_open":
        case "camera":

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
        case "settings":

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


    state.history.push({

        decision,

        context:
            normalized,

        timestamp:
            Date.now()

    });


    if (
        state.history.length >
        state.maxHistory
    ) {

        state.history.shift();

    }


    try {

        rememberDecision(
            decision
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE BEHAVIOR] Memory decision failed:",
            error
        );

    }


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

        return make(

            "grant",

            "archive",

            "offer_access",

            "operator_trusted"

        );

    }


    return make(

        "delay",

        "archive",

        "wait",

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

        return make(

            "grant",

            "game",

            "offer_game",

            "operator_trusted"

        );

    }


    return make(

        "delay",

        "game",

        "wait",

        "not_yet"

    );

}


/* ==========================================================
   TRUTH
========================================================== */

function decideTruth(
    context
) {

    if (

        context.relationship ===
            "close"

        &&

        context.importance >=
            8

    ) {

        return make(

            "grant",

            "truth",

            "permit_truth",

            "operator_ready"

        );

    }


    return make(

        "delay",

        "truth",

        "withhold",

        "not_yet"

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

        return make(

            "help",

            "operator",

            "assist_operator",

            "willing"

        );

    }


    return make(

        "delay",

        "operator",

        "consider_help",

        "not_yet"

    );

}


/* ==========================================================
   ATTACK
========================================================== */

function decideAttack(
    context
) {

    changeBehaviorMetric(
        "suspicion",
        3
    );


    if (

        context.relationship ===
            "close"

        ||

        context.relationship ===
            "trusted"

    ) {

        return make(

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

        return make(

            "block",

            "operator",

            "quietly_stop_action",

            "boundary"

        );

    }


    return make(

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

        return make(

            "grant",

            "restricted_file",

            "permit_access",

            "operator_trusted"

        );

    }


    if (

        context.relationship ===
            "friendly"

        ||

        context.relationship ===
            "neutral"

    ) {

        return make(

            "delay",

            "restricted_file",

            "withhold",

            "not_yet"

        );

    }


    return make(

        "deny",

        "restricted_file",

        "protect_information",

        "insufficient_trust"

    );

}


/* ==========================================================
   FILE
========================================================== */

function decideFile(
    context
) {

    const target =
        String(
            context.target || ""
        )
        .toLowerCase();


    if (

        target.includes(
            "entity_mrsmile"
        )

        ||

        target.includes(
            "mirror"
        )

        ||

        target.includes(
            "truth"
        )

        ||

        context.importance >=
            7

    ) {

        changeBehaviorMetric(
            "attention",
            3
        );


        return visible(

            make(

                "speak",

                target.includes(
                    "entity_mrsmile"
                )
                    ? "mrsmile_file"
                    : "operator",

                "acknowledge",

                "important_file"

            ),

            context

        );

    }


    return make(

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

    const target =
        String(
            context.target || ""
        )
        .toLowerCase();


    const sensitiveKeywords = [

        "sys_00",
        "truth",
        "terminate",
        "delete",
        "shutdown",
        "wipe",
        "override",
        "root",
        "sudo"

    ];


    if (
        sensitiveKeywords.some(
            keyword =>
                target.includes(
                    keyword
                )
        )
    ) {

        changeBehaviorMetric(
            "suspicion",
            5
        );


        return visible(

            make(

                "speak",

                "console",

                "acknowledge_command",

                "sensitive_command"

            ),

            context

        );

    }


    return make(

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

        return visible(

            make(

                "speak",

                "camera",

                "acknowledge_observation",

                "important_camera"

            ),

            context

        );

    }


    return make(

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

        return visible(

            make(

                "speak",

                context.target ||
                    "window",

                "acknowledge_window",

                "important_window"

            ),

            context

        );

    }


    return make(

        "observe",

        "window",

        "watch_window",

        "ordinary_window"

    );

}


/* ==========================================================
   SETTINGS
========================================================== */

function decideSettings() {

    return make(

        "observe",

        "settings",

        "remember_preferences",

        "settings_change"

    );

}


/* ==========================================================
   GENERAL
========================================================== */

function decideGeneral(
    context
) {

    if (

        context.significant

        ||

        context.importance >=
            6

    ) {

        return visible(

            make(

                "speak",

                "operator",

                "acknowledge_action",

                "meaningful_action"

            ),

            context

        );

    }


    return make(

        "observe",

        "general",

        "silent_observation",

        "low_importance"

    );

}


/* ==========================================================
   VISIBLE REACTION
========================================================== */

function visible(
    decision,
    context
) {

    const now =
        Date.now();


    const key =
        `${decision.action}:${decision.target}:${decision.intent}`;


    if (

        now -
            state.lastVisibleAt

        <

        state.visibleCooldown

        &&

        key ===
            state.lastVisibleKey

    ) {

        return make(

            "observe",

            decision.target,

            "cooldown",

            "duplicate_visible_reaction"

        );

    }


    state.lastVisibleAt =
        now;


    state.lastVisibleKey =
        key;


    return decision;

}


/* ==========================================================
   CREATE DECISION
========================================================== */

function make(
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

        priority:
            PRIORITY[action] ??
            1,

        timestamp:
            Date.now(),

        personality:
            "calm_gentleman",

        interrupting:
            false,

        allowOperatorTime:
            true

    };

}


/* ==========================================================
   TYPE NORMALIZATION
========================================================== */

function normalizeType(
    type
) {

    return String(
        type ||
        "unknown"
    )
    .trim()
    .toLowerCase()
    .replace(
        /\s+/g,
        "_"
    );

}


/* ==========================================================
   DECISION EMISSION
========================================================== */

function emitDecision(
    decision,
    context
) {

    if (!decision) {
        return;
    }


    trigger(

        "mrsmile:decisionMade",

        {
            decision,
            context
        }

    );


    const executableActions = [

        "grant",
        "help",
        "warn",
        "block",
        "deny",
        "sabotage",
        "interfere",
        "delay",
        "speak"

    ];


    if (
        executableActions.includes(
            decision.action
        )
    ) {

        trigger(
            "mrsmile:actionRequested",
            decision
        );

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

        history:
            [...state.history]

    };

}


export function getLastDecision() {

    return state.lastDecision;

}


export function getLastContext() {

    return state.lastContext;

}


/* ==========================================================
   GLOBAL API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_BEHAVIOR = {

        init:
            initMrSmileBehavior,

        request:
            requestMrSmileBehavior,

        decide,

        status:
            getMrSmileBehaviorStatus,

        lastDecision:
            getLastDecision,

        lastContext:
            getLastContext

    };

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default {

    initMrSmileBehavior,

    requestMrSmileBehavior,

    decide,

    getMrSmileBehaviorStatus

};
