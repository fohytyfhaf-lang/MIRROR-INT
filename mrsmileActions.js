// ==========================================================
// MR.SMILE ACTIONS SYSTEM
// OMEGA SYSTEM
// ==========================================================
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
// ==========================================================
//
// IMPORTANT:
//
// This module does NOT decide:
//
//     friendly / hostile
//     trust
//     respect
//     irritation
//
// That belongs to:
//
//     mrsmileRelationship.js
//     mrsmileBehavior.js
//
// ==========================================================
//
// IMPROVEMENTS:
//
// 1. Actions are queued instead of silently discarded.
// 2. Duplicate "observe" decisions are compressed.
// 3. Critical actions have priority.
// 4. An action failure no longer breaks the queue.
// 5. Reset safely clears pending actions.
// 6. State exposes queue information.
// 7. MR.SMILE can process rapid OMEGA activity
//    without "Action already running" spam.
// ==========================================================


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


// ==========================================================
// STATE
// ==========================================================

const state = {

    initialized: false,

    processing: false,

    actionRunning: false,

    activeAction: null,

    actionHistory: [],

    maxHistory: 40,

    queue: [],

    maxQueue: 30,

    processingPromise: null,

    sequence: 0

};


// ==========================================================
// TIMING
// ==========================================================

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


// ==========================================================
// QUEUE CONFIGURATION
// ==========================================================

const QUEUE_CONFIG = {

    /*
     * Observation is intentionally low priority.
     *
     * If ten files/windows/cameras are touched quickly,
     * MR.SMILE does not need ten identical observations.
     */

    observeDedupWindow: 1400,

    /*
     * Short-lived background observations are allowed
     * to accumulate only to a small degree.
     */

    maxObserveQueue: 3,

    /*
     * These actions should be processed before ordinary
     * observation events.
     */

    priority: {

        sabotage: 100,

        block: 90,

        interfere: 80,

        warn: 70,

        refuse: 60,

        deny: 60,

        grant: 60,

        help: 50,

        delay: 40,

        observe: 10

    }

};


// ==========================================================
// INITIALIZATION
// ==========================================================

export function initMrSmileActions() {

    if (
        state.initialized
    ) {

        return;

    }


    state.initialized = true;


    registerListeners();


    console.log(
        "[MR.SMILE ACTIONS] Initialized."
    );


    trigger(
        "mrsmile:actionsInitialized"
    );

}


// ==========================================================
// EVENT LISTENERS
// ==========================================================

function registerListeners() {

    on(
        "mrsmile:actionRequested",

        decision => {

            if (!decision) {
                return;
            }


            enqueueMrSmileAction(
                decision
            );

        }

    );

}


// ==========================================================
// ENQUEUE ACTION
// ==========================================================

export function enqueueMrSmileAction(
    decision
) {

    initMrSmileActions();


    if (!decision) {
        return false;
    }


    const normalized =
        normalizeDecision(
            decision
        );


    if (!normalized) {
        return false;
    }


    /*
     * -----------------------------------------------
     * Duplicate suppression
     * -----------------------------------------------
     */

    if (
        shouldSuppressDecision(
            normalized
        )
    ) {

        trigger(
            "mrsmile:actionSuppressed",
            normalized
        );

        return false;
    }


    /*
     * -----------------------------------------------
     * Queue limit
     * -----------------------------------------------
     */

    if (
        state.queue.length >=
        state.maxQueue
    ) {

        /*
         * Low priority observations are discarded first.
         */

        if (
            normalized.action === "observe"
        ) {

            trigger(
                "mrsmile:actionDropped",
                {
                    decision: normalized,
                    reason: "queue_full"
                }
            );

            return false;
        }


        /*
         * Remove oldest low-priority observation.
         */

        const observeIndex =
            state.queue.findIndex(
                item =>
                    item.action === "observe"
            );


        if (
            observeIndex !== -1
        ) {

            state.queue.splice(
                observeIndex,
                1
            );

        } else {

            /*
             * Everything in queue is important.
             * Do not allow infinite growth.
             */

            console.warn(
                "[MR.SMILE ACTIONS] Queue full. Critical action rejected."
            );


            trigger(
                "mrsmile:actionDropped",
                {
                    decision: normalized,
                    reason: "critical_queue_full"
                }
            );

            return false;
        }

    }


    normalized._sequence =
        ++state.sequence;


    normalized._queuedAt =
        Date.now();


    state.queue.push(
        normalized
    );


    rememberQueuedAction(
        normalized
    );


    sortQueue();


    trigger(
        "mrsmile:actionQueued",
        normalized
    );


    processQueue();


    return true;

}


// ==========================================================
// NORMALIZE DECISION
// ==========================================================

function normalizeDecision(
    decision
) {

    if (
        typeof decision !== "object"
        ||
        decision === null
    ) {

        console.warn(
            "[MR.SMILE ACTIONS] Invalid decision:",
            decision
        );

        return null;

    }


    const action =
        typeof decision.action === "string"
            ? decision.action.trim().toLowerCase()
            : "";


    if (!action) {

        console.warn(
            "[MR.SMILE ACTIONS] Decision has no action:",
            decision
        );

        return null;

    }


    return {

        ...decision,

        action

    };

}


// ==========================================================
// DUPLICATE SUPPRESSION
// ==========================================================

function shouldSuppressDecision(
    decision
) {

    const now =
        Date.now();


    /*
     * ------------------------------------------------------
     * OBSERVE DEDUPLICATION
     * ------------------------------------------------------
     *
     * Example:
     *
     * file_open
     * window_focus
     * window_move
     * camera_switch
     *
     * can all generate "observe".
     *
     * We do not need a dozen simultaneous
     * observation actions.
     */

    if (
        decision.action === "observe"
    ) {

        let observeCount = 0;


        for (
            const item
            of state.queue
        ) {

            if (
                item.action !== "observe"
            ) {
                continue;
            }


            observeCount++;


            const queuedAt =
                Number(
                    item._queuedAt ||
                    0
                );


            if (
                now - queuedAt <
                QUEUE_CONFIG.observeDedupWindow
            ) {

                /*
                 * Same target/reason = exact duplicate.
                 */

                if (
                    item.target ===
                        decision.target
                    &&
                    item.reason ===
                        decision.reason
                ) {

                    return true;
                }

            }

        }


        /*
         * Also prevent observation queue flooding.
         */

        if (
            observeCount >=
            QUEUE_CONFIG.maxObserveQueue
        ) {

            return true;
        }

    }


    /*
     * ------------------------------------------------------
     * EXACT DUPLICATE FOR OTHER ACTIONS
     * ------------------------------------------------------
     */

    const recent =
        state.queue.find(
            item => {

                return (

                    item.action ===
                        decision.action

                    &&

                    item.target ===
                        decision.target

                    &&

                    item.reason ===
                        decision.reason

                );

            }
        );


    if (recent) {

        return true;

    }


    return false;

}


// ==========================================================
// SORT QUEUE
// ==========================================================

function sortQueue() {

    state.queue.sort(
        (
            a,
            b
        ) => {

            const pa =
                QUEUE_CONFIG.priority[
                    a.action
                ] ??
                0;


            const pb =
                QUEUE_CONFIG.priority[
                    b.action
                ] ??
                0;


            if (
                pa !== pb
            ) {

                return (
                    pb - pa
                );

            }


            return (
                (a._sequence || 0)
                -
                (b._sequence || 0)
            );

        }
    );

}


// ==========================================================
// PROCESS QUEUE
// ==========================================================

export function processMrSmileActionQueue() {

    initMrSmileActions();


    if (
        state.processing
    ) {

        return state.processingPromise;

    }


    state.processing =
        true;


    state.processingPromise =
        processQueueInternal();


    return state.processingPromise;

}


// ==========================================================
// QUEUE INTERNAL PROCESSOR
// ==========================================================

async function processQueueInternal() {

    try {

        while (
            state.queue.length >
            0
        ) {

            const decision =
                state.queue.shift();


            if (!decision) {
                continue;
            }


            await runQueuedAction(
                decision
            );

        }

    } catch (error) {

        console.error(
            "[MR.SMILE ACTIONS] Queue processor failed:",
            error
        );

    } finally {

        state.processing =
            false;

        state.processingPromise =
            null;

        state.actionRunning =
            false;

        state.activeAction =
            null;


        trigger(
            "mrsmile:actionQueueIdle",
            {
                timestamp:
                    Date.now()
            }
        );

    }

}


// ==========================================================
// RUN QUEUED ACTION
// ==========================================================

async function runQueuedAction(
    decision
) {

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


                trigger(
                    "mrsmile:actionUnknown",
                    decision
                );

                break;

        }


        trigger(
            "mrsmile:actionCompleted",
            decision
        );


    } catch (error) {

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


    } finally {

        state.actionRunning =
            false;

        state.activeAction =
            null;

    }

}


// ==========================================================
// BACKWARD-COMPATIBLE DIRECT EXECUTION
// ==========================================================
//
// Existing modules may already call:
//
//     executeMrSmileAction(decision)
//
// We keep the function.
//
// It now ENQUEUES instead of immediately fighting with
// another running action.
//

export async function executeMrSmileAction(
    decision
) {

    const accepted =
        enqueueMrSmileAction(
            decision
        );


    if (!accepted) {

        return false;

    }


    /*
     * For compatibility we return true after successfully
     * queueing the action.
     */

    return true;

}


// ==========================================================
// GRANT
// ==========================================================

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


    /*
     * Clear unresolved access request after
     * a successful grant.
     */

    try {

        if (
            typeof clearAccessRequest ===
            "function"
        ) {

            clearAccessRequest(
                decision.target
            );

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE ACTIONS] Could not clear access request:",
            error
        );

    }


    trigger(
        "mrsmile:helpGranted",
        decision
    );

}


// ==========================================================
// HELP
// ==========================================================

async function executeHelp(
    decision
) {

    await sleep(
        TIMING.helpDelay
    );


    trigger(
        "mrsmile:helpRequested",
        {

            target:
                decision.target,

            reason:
                decision.reason

        }
    );


    trigger(
        "mrsmile:operatorHelped",
        decision
    );

}


// ==========================================================
// REFUSE
// ==========================================================

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


// ==========================================================
// DENY
// ==========================================================

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


    try {

        if (
            typeof clearAccessRequest ===
            "function"
        ) {

            clearAccessRequest(
                decision.target
            );

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE ACTIONS] Could not clear denied request:",
            error
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


// ==========================================================
// DELAY
// ==========================================================

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

}


// ==========================================================
// WARNING
// ==========================================================

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


// ==========================================================
// OBSERVE
// ==========================================================

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


// ==========================================================
// INTERFERE
// ==========================================================

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


    interfereWithFocus();


    await sleep(
        350
    );


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


// ==========================================================
// BLOCK
// ==========================================================

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


// ==========================================================
// SABOTAGE
// ==========================================================

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


    /*
     * STEP 1
     */

    sabotageFocus();


    await sleep(
        350
    );


    /*
     * STEP 2
     */

    sabotageWindows();


    await sleep(
        450
    );


    /*
     * STEP 3
     */

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


    /*
     * STEP 4
     */

    restoreAfterSabotage();


    trigger(
        "mrsmile:sabotageEnded",
        decision
    );

}


// ==========================================================
// RESTRICTED FILE
// ==========================================================

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


// ==========================================================
// FOCUS INTERFERENCE
// ==========================================================

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

            if (
                activeWindow
            ) {

                activeWindow.classList.remove(
                    "mrSmileFocusInterference"
                );

            }

        },

        500

    );

}


// ==========================================================
// SABOTAGE FOCUS
// ==========================================================

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


// ==========================================================
// WINDOW SABOTAGE
// ==========================================================

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


// ==========================================================
// BLOCK INTERACTION
// ==========================================================

function blockInteraction() {

    document.body.classList.add(
        "mrSmileInteractionBlocked"
    );

}


// ==========================================================
// UNBLOCK
// ==========================================================

function unblockInteraction() {

    document.body.classList.remove(
        "mrSmileInteractionBlocked"
    );

}


// ==========================================================
// RESTORE AFTER SABOTAGE
// ==========================================================

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


// ==========================================================
// SYSTEM NOTICE
// ==========================================================

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

            if (
                notice.parentNode
            ) {

                notice.classList.add(
                    "fade"
                );

            }

        },

        1400

    );


    setTimeout(
        () => {

            if (
                notice.parentNode
            ) {

                notice.remove();

            }

        },

        2200

    );

}


// ==========================================================
// ACTION HISTORY
// ==========================================================

function rememberAction(
    decision
) {

    state.actionHistory.push(
        {

            ...decision,

            timestamp:
                Date.now(),

            executed:
                true

        }
    );


    if (
        state.actionHistory.length >
        state.maxHistory
    ) {

        state.actionHistory.shift();

    }

}


// ==========================================================
// QUEUED ACTION HISTORY
// ==========================================================

function rememberQueuedAction(
    decision
) {

    trigger(
        "mrsmile:actionRemembered",
        {

            action:
                decision.action,

            target:
                decision.target,

            reason:
                decision.reason,

            sequence:
                decision._sequence,

            timestamp:
                Date.now()

        }
    );

}


// ==========================================================
// GET ACTIVE ACTION
// ==========================================================

export function getActiveMrSmileAction() {

    initMrSmileActions();


    return state.activeAction;

}


// ==========================================================
// GET ACTION HISTORY
// ==========================================================

export function getMrSmileActionHistory() {

    initMrSmileActions();


    return [
        ...state.actionHistory
    ];

}


// ==========================================================
// IS ACTION RUNNING
// ==========================================================

export function isMrSmileActionRunning() {

    return (
        state.actionRunning
    );

}


// ==========================================================
// QUEUE STATUS
// ==========================================================

export function getMrSmileActionQueue() {

    initMrSmileActions();


    return [
        ...state.queue
    ];

}


// ==========================================================
// FULL STATUS
// ==========================================================

export function getMrSmileActionsStatus() {

    initMrSmileActions();


    return {

        initialized:
            state.initialized,

        processing:
            state.processing,

        actionRunning:
            state.actionRunning,

        activeAction:
            state.activeAction,

        queueLength:
            state.queue.length,

        queue:
            [
                ...state.queue
            ],

        historyLength:
            state.actionHistory.length,

        sequence:
            state.sequence

    };

}


// ==========================================================
// CLEAR HISTORY
// ==========================================================

export function clearMrSmileActionHistory() {

    state.actionHistory =
        [];


    console.log(
        "[MR.SMILE ACTIONS] History cleared."
    );

}


// ==========================================================
// CLEAR QUEUE
// ==========================================================

export function clearMrSmileActionQueue() {

    state.queue =
        [];


    console.log(
        "[MR.SMILE ACTIONS] Queue cleared."
    );


    trigger(
        "mrsmile:actionQueueCleared"
    );

}


// ==========================================================
// MANUAL ACTION
// ==========================================================
//
// Example:
//
// performMrSmileAction({
//     action: "interfere",
//     target: "operator",
//     reason: "test"
// });
//

export function performMrSmileAction(
    decision
) {

    return enqueueMrSmileAction(
        decision
    );

}


// ==========================================================
// RESET
// ==========================================================

export function resetMrSmileActions() {

    clearMrSmileActionQueue();


    restoreAfterSabotage();


    unblockInteraction();


    state.actionRunning =
        false;


    state.activeAction =
        null;


    state.processing =
        false;


    state.actionHistory =
        [];


    console.log(
        "[MR.SMILE ACTIONS] Reset."
    );


    trigger(
        "mrsmile:actionsReset"
    );

}


// ==========================================================
// SLEEP
// ==========================================================

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
