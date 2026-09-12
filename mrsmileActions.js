/* ==========================================================
   MR.SMILE ACTIONS — REBUILT / QUEUED / SAFE
========================================================== */

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


/* ==========================================================
   STATE
========================================================== */

const state = {

    initialized: false,

    processing: false,

    actionRunning: false,

    activeAction: null,

    queue: [],

    history: [],

    maxQueue: 35,

    maxHistory: 60,

    sequence: 0,

    promise: null,

    listeners: false

};


/* ==========================================================
   PRIORITY
========================================================== */

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
   INIT
========================================================== */

export function initMrSmileActions() {

    if (
        state.initialized
    ) {
        return;
    }


    state.initialized =
        true;


    registerListeners();


    trigger(
        "mrsmile:actionsInitialized",
        {
            timestamp:
                Date.now()
        }
    );


    console.log(
        "[MR.SMILE ACTIONS] Rebuilt actions initialized."
    );

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


    state.listeners =
        true;


    on(
        "mrsmile:actionRequested",

        decision => {

            if (
                decision
            ) {

                enqueueMrSmileAction(
                    decision
                );

            }

        }

    );

}


/* ==========================================================
   ENQUEUE
========================================================== */

export function enqueueMrSmileAction(
    decision
) {

    initMrSmileActions();


    const normalized =
        normalize(
            decision
        );


    if (
        !normalized
    ) {

        return false;

    }


    if (
        duplicate(
            normalized
        )
    ) {

        trigger(
            "mrsmile:actionSuppressed",
            {
                decision:
                    normalized,

                reason:
                    "duplicate"

            }
        );


        return false;

    }


    normalized._sequence =
        ++state.sequence;


    normalized._queuedAt =
        Date.now();


    if (
        state.queue.length >=
        state.maxQueue
    ) {

        const observationIndex =
            state.queue.findIndex(
                item =>
                    item.action ===
                    "observe"
            );


        if (
            observationIndex >=
            0
        ) {

            state.queue.splice(
                observationIndex,
                1
            );

        } else {

            trigger(
                "mrsmile:actionDropped",
                {
                    decision:
                        normalized,

                    reason:
                        "queue_full"

                }
            );


            return false;

        }

    }


    state.queue.push(
        normalized
    );


    sort();


    trigger(
        "mrsmile:actionQueued",
        normalized
    );


    processMrSmileActionQueue();


    return true;

}


/* ==========================================================
   NORMALIZE
========================================================== */

function normalize(
    decision
) {

    if (

        !decision
        ||

        typeof decision !==
            "object"

    ) {

        return null;

    }


    const action =
        String(
            decision.action ||
            ""
        )
        .trim()
        .toLowerCase();


    if (
        !action
    ) {

        return null;

    }


    return {

        ...decision,

        action

    };

}


/* ==========================================================
   DUPLICATE
========================================================== */

function duplicate(
    decision
) {

    return state.queue.some(
        existing => (

            existing.action ===
                decision.action

            &&

            String(
                existing.target ||
                ""
            ) ===

            String(
                decision.target ||
                ""
            )

            &&

            String(
                existing.reason ||
                ""
            ) ===

            String(
                decision.reason ||
                ""
            )

        )
    );

}


/* ==========================================================
   SORT
========================================================== */

function sort() {

    state.queue.sort(

        (
            a,
            b
        ) => {

            const pa =
                PRIORITY[
                    a.action
                ] ??
                0;


            const pb =
                PRIORITY[
                    b.action
                ] ??
                0;


            if (
                pa !== pb
            ) {

                return (
                    pb -
                    pa
                );

            }


            return (

                (
                    a._sequence ||
                    0
                )

                -

                (
                    b._sequence ||
                    0
                )

            );

        }

    );

}


/* ==========================================================
   PROCESS
========================================================== */

export function processMrSmileActionQueue() {

    initMrSmileActions();


    if (
        state.processing
    ) {

        return state.promise;

    }


    state.processing =
        true;


    state.promise =
        runQueue();


    return state.promise;

}


/* ==========================================================
   RUN QUEUE
========================================================== */

async function runQueue() {

    try {

        while (
            state.queue.length
        ) {

            const decision =
                state.queue.shift();


            if (
                !decision
            ) {

                continue;

            }


            await executeQueued(
                decision
            );

        }

    } catch (error) {

        console.error(
            "[MR.SMILE ACTIONS] Queue failed:",
            error
        );

    } finally {

        state.processing =
            false;

        state.promise =
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


/* ==========================================================
   EXECUTE QUEUED
========================================================== */

async function executeQueued(
    decision
) {

    state.actionRunning =
        true;


    state.activeAction =
        decision;


    state.history.push({

        ...decision,

        executedAt:
            Date.now()

    });


    if (
        state.history.length >
        state.maxHistory
    ) {

        state.history.shift();

    }


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


            case "deny":
            case "refuse":

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


            case "block":

                await executeBlock(
                    decision
                );

                break;


            case "interfere":

                await executeInterfere(
                    decision
                );

                break;


            case "sabotage":

                await executeSabotage(
                    decision
                );

                break;


            case "observe":

                await executeObserve(
                    decision
                );

                break;


            case "speak":

                await executeSpeak(
                    decision
                );

                break;


            default:

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


/* ==========================================================
   DIRECT COMPATIBILITY
========================================================== */

export async function executeMrSmileAction(
    decision
) {

    return enqueueMrSmileAction(
        decision
    );

}


/* ==========================================================
   GRANT
========================================================== */

async function executeGrant(
    decision
) {

    await sleep(
        300
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

            trigger(
                "mrsmile:restrictedAccessGranted",
                decision
            );

            break;


        default:

            break;

    }


    try {

        clearAccessRequest(
            decision.target
        );

    } catch {
        // optional
    }

}


/* ==========================================================
   HELP
========================================================== */

async function executeHelp(
    decision
) {

    await sleep(
        350
    );


    trigger(
        "mrsmile:helpGranted",
        decision
    );

}


/* ==========================================================
   DENY
========================================================== */

async function executeDeny(
    decision
) {

    await sleep(
        450
    );


    try {

        denyAccess(
            decision.target
        );

    } catch {
        // optional
    }


    trigger(
        "mrsmile:accessDenied",
        decision
    );

}


/* ==========================================================
   DELAY
========================================================== */

async function executeDelay(
    decision
) {

    await sleep(
        450
    );


    trigger(
        "mrsmile:actionDelayed",
        decision
    );

}


/* ==========================================================
   WARN
========================================================== */

async function executeWarn(
    decision
) {

    await sleep(
        500
    );


    trigger(
        "mrsmile:warning",
        decision
    );

}


/* ==========================================================
   BLOCK
========================================================== */

async function executeBlock(
    decision
) {

    await sleep(
        600
    );


    trigger(
        "mrsmile:actionBlocked",
        decision
    );

}


/* ==========================================================
   INTERFERE
========================================================== */

async function executeInterfere(
    decision
) {

    await sleep(
        350
    );


    trigger(
        "mrsmile:interference",
        decision
    );

}


/* ==========================================================
   SABOTAGE
========================================================== */

async function executeSabotage(
    decision
) {

    await sleep(
        700
    );


    trigger(
        "mrsmile:sabotage",
        decision
    );

}


/* ==========================================================
   OBSERVE
========================================================== */

async function executeObserve(
    decision
) {

    trigger(
        "mrsmile:observation",
        decision
    );

}


/* ==========================================================
   SPEAK
========================================================== */

async function executeSpeak(
    decision
) {

    trigger(
        "mrsmile:speakRequested",
        decision
    );

}


/* ==========================================================
   SLEEP
========================================================== */

function sleep(
    ms
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                Math.max(
                    0,
                    Number(ms) || 0
                )
            )
    );

}


/* ==========================================================
   STATUS
========================================================== */

export function getMrSmileActionsStatus() {

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

        history:
            [
                ...state.history
            ]

    };

}


export function getActionQueue() {

    return [
        ...state.queue
    ];

}


export function getActionHistory() {

    return [
        ...state.history
    ];

}


/* ==========================================================
   CLEAR
========================================================== */

export function clearActionQueue() {

    state.queue =
        [];

    return true;

}


export function clearActionHistory() {

    state.history =
        [];

    return true;

}


/* ==========================================================
   RESET
========================================================== */

export function resetMrSmileActions() {

    clearActionQueue();

    clearActionHistory();

    state.processing =
        false;

    state.actionRunning =
        false;

    state.activeAction =
        null;

    state.promise =
        null;

}


/* ==========================================================
   GLOBAL
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_ACTIONS = {

        init:
            initMrSmileActions,

        enqueue:
            enqueueMrSmileAction,

        process:
            processMrSmileActionQueue,

        execute:
            executeMrSmileAction,

        status:
            getMrSmileActionsStatus,

        queue:
            getActionQueue,

        history:
            getActionHistory,

        clearQueue:
            clearActionQueue,

        clearHistory:
            clearActionHistory,

        reset:
            resetMrSmileActions

    };

}


/* ==========================================================
   DEFAULT
========================================================== */

export default {

    initMrSmileActions,

    enqueueMrSmileAction,

    processMrSmileActionQueue,

    executeMrSmileAction,

    getMrSmileActionsStatus

};
