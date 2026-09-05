// =======================================
// MR.SMILE ACTIONS SYSTEM
// OMEGA SYSTEM
// =======================================
//
// This module EXECUTES decisions made by
// mrsmileBehavior.js.
//
// BEHAVIOR decides:
//
//     "I want to help."
//     "I want to refuse."
//     "I want to interfere."
//     "I want to sabotage."
//
// ACTIONS decides:
//
//     "What exactly happens to OMEGA?"
//
// =======================================
//
// IMPORTANT:
//
// This module should NOT decide whether
// MR.SMILE is friendly or hostile.
//
// That belongs to:
//
// mrsmileRelationship.js
// mrsmileBehavior.js
//
// =======================================


import {
    trigger,
    on
} from "./eventManager.js";

import {
    grantMirrorArchiveAccess,
    grantGameAccess,
    grantTruthAccess,
    denyAccess,
    clearAccessRequest
} from "./mrsmileProgress.js";


// =======================================
// STATE
// =======================================

const state = {

    initialized: false,

    actionRunning: false,

    activeAction: null,

    actionHistory: [],

    maxHistory: 40

};


// =======================================
// TIMING
// =======================================

const TIMING = {

    helpDelay: 350,

    refuseDelay: 450,

    blockDelay: 600,

    interfereDelay: 300,

    sabotageDelay: 700,

    cursorDelay: 500,

    windowDelay: 650,

    cameraDelay: 800,

    recoveryDelay: 1200

};


// =======================================
// INITIALIZATION
// =======================================

export function initMrSmileActions() {

    if (
        state.initialized
    ) {

        return;

    }


    state.initialized =
        true;


    registerListeners();


    console.log(
        "[MR.SMILE ACTIONS] Initialized."
    );


    trigger(
        "mrsmile:actionsInitialized"
    );

}


// =======================================
// EVENT LISTENERS
// =======================================

function registerListeners() {

    on(
        "mrsmile:actionRequested",

        decision => {

            if (!decision)
                return;


            executeMrSmileAction(
                decision
            );

        }

    );

}


// =======================================
// EXECUTE ACTION
// =======================================

export async function executeMrSmileAction(
    decision
) {

    initMrSmileActions();


    if (!decision)
        return false;


    // -----------------------------------
    // Prevent overlapping actions
    // -----------------------------------

    if (
        state.actionRunning
    ) {

        console.warn(
            "[MR.SMILE ACTIONS] Action already running."
        );


        trigger(
            "mrsmile:actionBlocked",
            decision
        );


        return false;

    }


    state.actionRunning =
        true;


    state.activeAction =
        decision;


    rememberAction(
        decision
    );


    trigger(
        "mrsmile:actionStarted",
        decision
    );


    try {

        switch (
            decision.action
        ) {

            case "grant":

                await executeGrant(
                    decision
                );

                break;


            case "help":

                await executeHelp(
                    decision
                );

                break;


            case "refuse":

                await executeRefuse(
                    decision
                );

                break;


            case "deny":

                await executeDeny(
                    decision
                );

                break;


            case "delay":

                await executeDelay(
                    decision
                );

                break;


            case "warn":

                await executeWarn(
                    decision
                );

                break;


            case "observe":

                await executeObserve(
                    decision
                );

                break;


            case "interfere":

                await executeInterfere(
                    decision
                );

                break;


            case "block":

                await executeBlock(
                    decision
                );

                break;


            case "sabotage":

                await executeSabotage(
                    decision
                );

                break;


            default:

                console.warn(
                    "[MR.SMILE ACTIONS] Unknown action:",
                    decision.action
                );

                break;

        }


        trigger(
            "mrsmile:actionCompleted",
            decision
        );


        return true;

    }
    catch (error) {

        console.error(
            "[MR.SMILE ACTIONS] Action failed:",
            error
        );


        trigger(
            "mrsmile:actionFailed",
            {

                decision,

                error

            }
        );


        return false;

    }
    finally {

        state.actionRunning =
            false;


        state.activeAction =
            null;

    }

}


// =======================================
// GRANT
// =======================================

async function executeGrant(
    decision
) {

    await sleep(
        TIMING.helpDelay
    );


    switch (
        decision.target
    ) {

        case "archive":

            grantMirrorArchiveAccess();

            break;


        case "game":

            grantGameAccess();

            break;


        case "truth":

            grantTruthAccess();

            break;


        case "restricted_file":

            grantRestrictedFile(
                decision
            );

            break;


        default:

            console.warn(
                "[MR.SMILE ACTIONS] Unknown grant target:",
                decision.target
            );

            break;

    }


    trigger(
        "mrsmile:helpGranted",
        decision
    );

}


// =======================================
// HELP
// =======================================

async function executeHelp(
    decision
) {

    await sleep(
        TIMING.helpDelay
    );


    // -----------------------------------
    // Notify chat
    // -----------------------------------

    trigger(
        "mrsmile:helpRequested",
        {

            target:
                decision.target,

            reason:
                decision.reason

        }
    );


    // -----------------------------------
    // Future action hook
    // -----------------------------------
    //
    // mrsmileBehavior.js says:
    //
    // "I want to help."
    //
    // Later this can become:
    //
    // open restricted file
    // fix interface
    // warn about danger
    // reveal information
    // protect operator
    // -----------------------------------

    trigger(
        "mrsmile:operatorHelped",
        decision
    );

}


// =======================================
// REFUSE
// =======================================

async function executeRefuse(
    decision
) {

    await sleep(
        TIMING.refuseDelay
    );


    trigger(
        "mrsmile:accessRefused",
        decision
    );


    showSystemNotice(
        "REQUEST REFUSED"
    );

}


// =======================================
// DENY
// =======================================

async function executeDeny(
    decision
) {

    await sleep(
        TIMING.refuseDelay
    );


    if (
        decision.target ===
        "archive"
        ||
        decision.target ===
        "game"
        ||
        decision.target ===
        "truth"
    ) {

        denyAccess(
            decision.target
        );

    }


    trigger(
        "mrsmile:accessDenied",
        decision
    );


    showSystemNotice(
        "ACCESS DENIED"
    );

}


// =======================================
// DELAY
// =======================================
//
// MR.SMILE deliberately does not answer
// immediately.
//
// This is important.
//
// Silence can itself be a response.
// =======================================

async function executeDelay(
    decision
) {

    await sleep(
        TIMING.recoveryDelay
    );


    trigger(
        "mrsmile:accessDelayed",
        decision
    );


    // -----------------------------------
    // Do NOT automatically deny.
//
// MR.SMILE can simply leave the request
// unresolved.
// -----------------------------------

}


// =======================================
// WARNING
// =======================================

async function executeWarn(
    decision
) {

    await sleep(
        TIMING.refuseDelay
    );


    trigger(
        "mrsmile:warning",
        decision
    );


    showSystemNotice(
        "WARNING: UNAUTHORIZED ACTION"
    );

}


// =======================================
// OBSERVE
// =======================================

async function executeObserve(
    decision
) {

    await sleep(
        TIMING.helpDelay
    );


    trigger(
        "mrsmile:observing",
        {

            decision,

            timestamp:
                Date.now()

        }
    );

}


// =======================================
// INTERFERE
// =======================================
//
// Small interference.
//
// MR.SMILE is not attacking OMEGA yet.
//
// Examples:
//
// - move focus
// - delay input
// - switch window
// - brief cursor interference
// =======================================

async function executeInterfere(
    decision
) {

    await sleep(
        TIMING.interfereDelay
    );


    trigger(
        "mrsmile:interferenceStarted",
        decision
    );


    // -----------------------------------
    // Focus interference
    // -----------------------------------

    interfereWithFocus();


    await sleep(
        350
    );


    // -----------------------------------
    // Input delay
    // -----------------------------------

    trigger(
        "mrsmile:inputInterference",
        {

            duration:
                450

        }
    );


    await sleep(
        450
    );


    trigger(
        "mrsmile:interferenceEnded",
        decision
    );

}


// =======================================
// BLOCK
// =======================================
//
// Stronger than interference.
//
// MR.SMILE actively prevents the
// operator from performing an action.
// =======================================

async function executeBlock(
    decision
) {

    await sleep(
        TIMING.blockDelay
    );


    trigger(
        "mrsmile:blockStarted",
        decision
    );


    // -----------------------------------
    // Freeze current interaction
    // -----------------------------------

    blockInteraction();


    await sleep(
        900
    );


    unblockInteraction();


    trigger(
        "mrsmile:blockEnded",
        decision
    );

}


// =======================================
// SABOTAGE
// =======================================
//
// This is the hostile action layer.
//
// IMPORTANT:
//
// Sabotage is intentionally controlled.
//
// MR.SMILE should NOT randomly destroy
// the entire interface.
//
// His actions should feel deliberate.
// =======================================

async function executeSabotage(
    decision
) {

    await sleep(
        TIMING.sabotageDelay
    );


    trigger(
        "mrsmile:sabotageStarted",
        decision
    );


    // -----------------------------------
    // STEP 1
    // -----------------------------------

    sabotageFocus();


    await sleep(
        350
    );


    // -----------------------------------
    // STEP 2
    // -----------------------------------

    sabotageWindows();


    await sleep(
        450
    );


    // -----------------------------------
    // STEP 3
    // -----------------------------------

    trigger(
        "mrsmile:systemInterference",
        {

            source:
                "MR.SMILE",

            reason:
                decision.reason

        }
    );


    await sleep(
        700
    );


    // -----------------------------------
    // STEP 4
    // -----------------------------------

    restoreAfterSabotage();


    trigger(
        "mrsmile:sabotageEnded",
        decision
    );

}


// =======================================
// RESTRICTED FILE
// =======================================

function grantRestrictedFile(
    decision
) {

    trigger(
        "mrsmile:restrictedFileGranted",
        {

            target:
                decision.target,

            reason:
                decision.reason

        }
    );

}


// =======================================
// FOCUS INTERFERENCE
// =======================================

function interfereWithFocus() {

    const activeWindow =
        document.querySelector(
            ".window.active"
        );


    if (
        !activeWindow
    ) {

        return;

    }


    activeWindow.classList.add(
        "mrSmileFocusInterference"
    );


    setTimeout(
        () => {

            activeWindow.classList.remove(
                "mrSmileFocusInterference"
            );

        },

        500

    );

}


// =======================================
// SABOTAGE FOCUS
// =======================================

function sabotageFocus() {

    document.body.classList.add(
        "mrSmileInputInterference"
    );


    setTimeout(
        () => {

            document.body.classList.remove(
                "mrSmileInputInterference"
            );

        },

        850

    );


    trigger(
        "mrsmile:focusHijacked"
    );

}


// =======================================
// WINDOW SABOTAGE
// =======================================

function sabotageWindows() {

    const windows =
        document.querySelectorAll(
            ".window"
        );


    if (
        windows.length === 0
    ) {

        return;

    }


    // -----------------------------------
    // Select one window.
//
// Never manipulate everything at once.
// -----------------------------------

    const index =
        Math.floor(
            Math.random() *
            windows.length
        );


    const target =
        windows[index];


    if (
        !target
    ) {

        return;

    }


    target.classList.add(
        "mrSmileWindowInterference"
    );


    setTimeout(
        () => {

            target.classList.remove(
                "mrSmileWindowInterference"
            );

        },

        900

    );


    trigger(
        "mrsmile:windowInterfered",
        {

            element:
                target.id
                ||
                target.className

        }
    );

}


// =======================================
// BLOCK INTERACTION
// =======================================

function blockInteraction() {

    document.body.classList.add(
        "mrSmileInteractionBlocked"
    );

}


// =======================================
// UNBLOCK
// =======================================

function unblockInteraction() {

    document.body.classList.remove(
        "mrSmileInteractionBlocked"
    );

}


// =======================================
// RESTORE AFTER SABOTAGE
// =======================================

function restoreAfterSabotage() {

    document.body.classList.remove(
        "mrSmileInputInterference"
    );


    document.body.classList.remove(
        "mrSmileInteractionBlocked"
    );


    document
        .querySelectorAll(
            ".mrSmileFocusInterference"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "mrSmileFocusInterference"
                );

            }
        );


    document
        .querySelectorAll(
            ".mrSmileWindowInterference"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "mrSmileWindowInterference"
                );

            }
        );

}


// =======================================
// SYSTEM NOTICE
// =======================================

function showSystemNotice(
    text
) {

    trigger(
        "mrsmile:systemNotice",
        {

            text,

            source:
                "MR.SMILE"

        }
    );


    // -----------------------------------
    // Existing notification area
    // -----------------------------------

    const area =
        document.querySelector(
            "#notificationArea"
        );


    if (
        !area
    ) {

        return;

    }


    const notice =
        document.createElement(
            "div"
        );


    notice.className =
        "mrSmileActionNotice";


    notice.textContent =
        text;


    area.appendChild(
        notice
    );


    setTimeout(
        () => {

            notice.classList.add(
                "fade"
            );

        },

        1400

    );


    setTimeout(
        () => {

            notice.remove();

        },

        2200

    );

}


// =======================================
// ACTION HISTORY
// =======================================

function rememberAction(
    decision
) {

    state.actionHistory.push(
        {

            ...decision,

            timestamp:
                Date.now()

        }
    );


    if (
        state.actionHistory.length >
        state.maxHistory
    ) {

        state.actionHistory.shift();

    }

}


// =======================================
// GET ACTIVE ACTION
// =======================================

export function getActiveMrSmileAction() {

    initMrSmileActions();


    return state.activeAction;

}


// =======================================
// GET ACTION HISTORY
// =======================================

export function getMrSmileActionHistory() {

    initMrSmileActions();


    return [
        ...state.actionHistory
    ];

}


// =======================================
// IS ACTION RUNNING
// =======================================

export function isMrSmileActionRunning() {

    return (
        state.actionRunning
    );

}


// =======================================
// CLEAR HISTORY
// =======================================

export function clearMrSmileActionHistory() {

    state.actionHistory =
        [];


    console.log(
        "[MR.SMILE ACTIONS] History cleared."
    );

}


// =======================================
// MANUAL ACTION
// =======================================
//
// Useful for testing.
//
// Example:
//
// performMrSmileAction({
//     action: "interfere",
//     target: "operator",
//     reason: "test"
// });
// =======================================

export function performMrSmileAction(
    decision
) {

    return executeMrSmileAction(
        decision
    );

}


// =======================================
// RESET
// =======================================

export function resetMrSmileActions() {

    restoreAfterSabotage();


    state.actionRunning =
        false;


    state.activeAction =
        null;


    state.actionHistory =
        [];


    console.log(
        "[MR.SMILE ACTIONS] Reset."
    );


    trigger(
        "mrsmile:actionsReset"
    );

}


// =======================================
// SLEEP
// =======================================

function sleep(
    ms
) {

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                ms
            );

        }
    );

}
