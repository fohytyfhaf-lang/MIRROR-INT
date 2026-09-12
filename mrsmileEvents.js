/* ==========================================================
   MR.SMILE EVENTS — FINAL ORCHESTRATOR
   OMEGA / MIRROR-INT

   RESPONSIBILITY
   ----------------------------------------------------------
   This module is ONLY the event orchestrator.

   It does NOT contain:
   - personality
   - language understanding
   - response generation
   - idle message generation
   - relationship calculations
   - behavior decisions
   - action execution
   - chat rendering
   - visual generation

   RESPONSIBILITY MAP
   ----------------------------------------------------------

   mrsmileCore.js
       → understanding / personality / responses

   mrsmileChat.js
       → chat bridge / output / First Contact chat / idle

   mrsmileMemory.js
       → persistent memory

   mrsmileRelationship.js
       → trust / respect / irritation / relationship

   mrsmileProgress.js
       → unlock requirements / access requests

   mrsmileContext.js
       → OMEGA context collection

   mrsmileBehavior.js
       → behavioral decisions

   mrsmileActions.js
       → executable actions

   mrsmileAppearance.js
       → visual manifestation

   mrsmileIntrusionUI.js
       → UI intrusion layer

   mrsmileEvents.js
       → EVENT ORCHESTRATION ONLY


   MAIN PIPELINE
   ----------------------------------------------------------

   OMEGA EVENT
        ↓
   mrsmileEvents.js
        ↓
   state synchronization
        ↓
   dependent systems
        ↓
   chat / progress / context / behavior / actions


   IMPORTANT
   ----------------------------------------------------------
   There must be only ONE official First Contact path.
========================================================== */


/* ==========================================================
   IMPORTS
========================================================== */

import {
    playFirstContactMessage,
    stopIdleMessages,
    resumeIdleMessages
} from "./mrsmileChat.js";


import {
    getTrust,
    loadTrust,
    addTrust
} from "./mrsmileTrust.js";


import {
    revealMrSmileChat
} from "./chats.js";


import {
    initMrSmileProgress,
    evaluateProgress
} from "./mrsmileProgress.js";


import {
    showMrSmileFirstContactFace
} from "./mrsmileAppearance.js";


import {
    on,
    trigger
} from "./eventManager.js";


import {
    initMrSmileIntrusionUI
} from "./mrsmileIntrusionUI.js";


import {
    initMrSmileBehavior
} from "./mrsmileBehavior.js";


import {
    initMrSmileActions
} from "./mrsmileActions.js";


import {
    initMrSmileContext
} from "./mrsmileContext.js";


/* ==========================================================
   MODULE STATE
========================================================== */

const STATE = {

    initialized:
        false,

    listenersRegistered:
        false,

    trustListenersRegistered:
        false,

    firstContactRunning:
        false,

    firstContactCompleted:
        false,

    firstContactQueued:
        false,

    handshakeRunning:
        false,

    handshakeCompleted:
        false,

    integrityRunning:
        false,

    recoveryRunning:
        false,

    operatorReactionRunning:
        false,

    currentEventId:
        0,

    firstContactStartTime:
        0,

    lastEventTime:
        0,

    lastOperatorAction:
        null,

    lastFileRead:
        null,

    lastSystemEvent:
        null

};


/* ==========================================================
   STORAGE
========================================================== */

const STORAGE = {

    firstContact:
        "mrsmile_first_contact",

    firstContactStarted:
        "mrsmile_first_contact_started",

    handshake:
        "mrsmile_handshake"

};


/* ==========================================================
   TIMING
========================================================== */

const TIMING = {

    firstContactDelay:
        250,

    handshakeDelay:
        1200,

    recoveryDelay:
        2600,

    duplicateEventWindow:
        1200,

    operatorReactionCooldown:
        800

};


/* ==========================================================
   UTILS
========================================================== */

function sleep(ms) {

    const value =
        Math.max(
            0,
            Number(ms) || 0
        );

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                value
            )
    );

}


function cleanText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim();

}


function isLocalStorageAvailable() {

    try {

        return (
            typeof localStorage !==
            "undefined"
        );

    } catch {

        return false;

    }

}


function storageGet(key) {

    if (
        !isLocalStorageAvailable()
    ) {
        return null;
    }

    try {

        return localStorage.getItem(
            key
        );

    } catch {

        return null;

    }

}


function storageSet(
    key,
    value
) {

    if (
        !isLocalStorageAvailable()
    ) {
        return false;
    }

    try {

        localStorage.setItem(
            key,
            String(value)
        );

        return true;

    } catch {

        return false;

    }

}


function storageRemove(key) {

    if (
        !isLocalStorageAvailable()
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


function safeCall(
    label,
    callback,
    fallback = null
) {

    try {

        if (
            typeof callback !==
            "function"
        ) {
            return fallback;
        }

        return callback();

    } catch (error) {

        console.warn(
            `[MR.SMILE EVENTS] ${label} failed:`,
            error
        );

        return fallback;

    }

}


async function safeAsyncCall(
    label,
    callback,
    fallback = null
) {

    try {

        if (
            typeof callback !==
            "function"
        ) {
            return fallback;
        }

        return await callback();

    } catch (error) {

        console.warn(
            `[MR.SMILE EVENTS] ${label} failed:`,
            error
        );

        return fallback;

    }

}


/* ==========================================================
   EVENT ID
========================================================== */

function nextEventId() {

    STATE.currentEventId += 1;

    STATE.lastEventTime =
        Date.now();

    return STATE.currentEventId;

}


/* ==========================================================
   EVENT DUPLICATE GUARD
========================================================== */

function isDuplicateEvent(
    key
) {

    const now =
        Date.now();

    const previous =
        STATE[`_event_${key}`] || 0;

    if (
        now - previous <
        TIMING.duplicateEventWindow
    ) {

        return true;

    }

    STATE[`_event_${key}`] =
        now;

    return false;

}


/* ==========================================================
   MASTER STATE SYNCHRONIZATION
========================================================== */

function synchronizeMasterState(
    firstContact = false
) {

    try {

        if (
            typeof window ===
            "undefined"
        ) {
            return;
        }

        const api =
            window.MRSMILE_STATE;

        if (
            !api
        ) {
            return;
        }

        let current = null;

        if (
            typeof api.get ===
            "function"
        ) {

            current =
                api.get();

        }

        if (
            current &&
            current.firstContact ===
            firstContact
        ) {
            return;
        }

        if (
            typeof api.firstContact ===
            "function"
        ) {

            api.firstContact(
                firstContact
            );

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE EVENTS] Master state sync failed:",
            error
        );

    }

}


/* ==========================================================
   PRESENCE SYNCHRONIZATION
========================================================== */

function synchronizePresence(
    firstContact = false
) {

    try {

        if (
            typeof window ===
            "undefined"
        ) {
            return;
        }

        const api =
            window.MRSMILE_PRESENCE;

        if (
            !api
        ) {
            return;
        }

        let current = null;

        if (
            api.status &&
            typeof api.status ===
            "function"
        ) {

            const status =
                api.status();

            current =
                status
                    ?.state
                    ?.firstContact;

        }

        if (
            current ===
            firstContact
        ) {
            return;
        }

        if (
            typeof api.firstContact ===
            "function"
        ) {

            api.firstContact(
                firstContact
            );

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE EVENTS] Presence sync failed:",
            error
        );

    }

}


/* ==========================================================
   FIRST CONTACT STATE SYNC
========================================================== */

function synchronizeFirstContactState(
    data = {}
) {

    synchronizeMasterState(
        false
    );

    synchronizePresence(
        false
    );

    trigger(
        "mrsmile:firstContactStateSynchronized",
        {

            source:
                data.source ||
                "event",

            timestamp:
                Date.now(),

            eventId:
                STATE.currentEventId

        }
    );

}


/* ==========================================================
   FIRST CONTACT STORAGE
========================================================== */

function isFirstContactCompleted() {

    return (
        storageGet(
            STORAGE.firstContact
        ) === "1"
    );

}


function wasFirstContactStarted() {

    return (
        storageGet(
            STORAGE.firstContactStarted
        ) === "1"
    );

}


function markFirstContactStarted() {

    storageSet(
        STORAGE.firstContactStarted,
        "1"
    );

}


function markFirstContactCompleted() {

    storageSet(
        STORAGE.firstContact,
        "1"
    );

    STATE.firstContactCompleted =
        true;

    synchronizeMasterState(
        true
    );

    synchronizePresence(
        false
    );

    trigger(
        "mrsmile:firstContactCompleted",
        {

            timestamp:
                Date.now(),

            eventId:
                STATE.currentEventId

        }
    );

}


/* ==========================================================
   HANDSHAKE STORAGE
========================================================== */

function isHandshakeCompleted() {

    return (
        storageGet(
            STORAGE.handshake
        ) === "1"
    );

}


function markHandshakeCompleted() {

    storageSet(
        STORAGE.handshake,
        "1"
    );

    STATE.handshakeCompleted =
        true;

}


/* ==========================================================
   FIRST CONTACT RESET
========================================================== */

export function resetMrSmileFirstContact() {

    storageRemove(
        STORAGE.firstContact
    );

    storageRemove(
        STORAGE.firstContactStarted
    );

    storageRemove(
        STORAGE.handshake
    );


    STATE.firstContactRunning =
        false;

    STATE.firstContactCompleted =
        false;

    STATE.firstContactQueued =
        false;

    STATE.handshakeRunning =
        false;

    STATE.handshakeCompleted =
        false;

    STATE.integrityRunning =
        false;

    STATE.recoveryRunning =
        false;

    STATE.operatorReactionRunning =
        false;

    STATE.currentEventId =
        0;

    STATE.lastOperatorAction =
        null;

    STATE.lastFileRead =
        null;

    STATE.lastSystemEvent =
        null;


    synchronizeMasterState(
        false
    );

    synchronizePresence(
        false
    );


    trigger(
        "mrsmile:firstContactReset",
        {

            timestamp:
                Date.now()

        }
    );


    console.log(
        "[MR.SMILE EVENTS] First Contact reset."
    );


    return true;

}


/* ==========================================================
   OFFICIAL FIRST CONTACT TRIGGER
========================================================== */

export function triggerMrSmileFirstContact(
    data = {}
) {

    const eventId =
        nextEventId();


    const payload = {

        source:
            data.source ||
            "manual",

        type:
            data.type ||
            "first_contact",

        force:
            data.force === true,

        timestamp:
            Date.now(),

        eventId

    };


    /* ------------------------------------------------------
       Persistent guard
    ------------------------------------------------------ */

    if (
        isFirstContactCompleted() &&
        payload.force !== true
    ) {

        console.log(
            "[MR.SMILE EVENTS] First Contact already completed."
        );

        return false;

    }


    /* ------------------------------------------------------
       Runtime guard
    ------------------------------------------------------ */

    if (
        STATE.firstContactRunning
    ) {

        console.log(
            "[MR.SMILE EVENTS] First Contact already running."
        );

        return false;

    }


    /* ------------------------------------------------------
       Queue guard
    ------------------------------------------------------ */

    if (
        STATE.firstContactQueued
    ) {

        return false;

    }


    STATE.firstContactQueued =
        true;


    trigger(
        "mrsmile:firstContact",
        payload
    );


    return true;

}


/* ==========================================================
   GLOBAL API
========================================================== */

function exposeGlobalAPI() {

    if (
        typeof window ===
        "undefined"
    ) {
        return;
    }


    window.triggerMrSmileFirstContact =
        triggerMrSmileFirstContact;


    window.resetMrSmileFirstContact =
        resetMrSmileFirstContact;


    window.getMrSmileEventsStatus =
        getMrSmileEventsStatus;


    window.MRSMILE_EVENTS = {

        triggerFirstContact:
            triggerMrSmileFirstContact,

        resetFirstContact:
            resetMrSmileFirstContact,

        status:
            getMrSmileEventsStatus

    };

}


/* ==========================================================
   FIRST CONTACT RUNNER
========================================================== */

async function runFirstContact(
    data = {}
) {

    if (
        STATE.firstContactRunning
    ) {
        return false;
    }


    if (
        isFirstContactCompleted() &&
        data.force !== true
    ) {

        return false;

    }


    STATE.firstContactRunning =
        true;

    STATE.firstContactQueued =
        false;

    STATE.firstContactStartTime =
        Date.now();


    markFirstContactStarted();


    synchronizeFirstContactState(
        data
    );


    try {

        console.log(
            "[MR.SMILE EVENTS] FIRST CONTACT STARTED."
        );


        trigger(
            "mrsmile:firstContactStarted",
            {

                source:
                    data.source ||
                    "event",

                type:
                    data.type ||
                    "first_contact",

                timestamp:
                    Date.now(),

                eventId:
                    data.eventId ||
                    STATE.currentEventId

            }
        );


        /* --------------------------------------------------
           STOP IDLE CHAT
        -------------------------------------------------- */

        safeCall(
            "pause idle",
            () => {

                stopIdleMessages();

            }
        );


        await sleep(
            TIMING.firstContactDelay
        );


        /* --------------------------------------------------
           VISUAL FIRST CONTACT
        -------------------------------------------------- */

        const appearanceResult =
            await safeAsyncCall(
                "First Contact appearance",
                () =>
                    showMrSmileFirstContactFace(
                        "presence"
                    ),
                false
            );


        trigger(
            "mrsmile:firstContactAppearanceCompleted",
            {

                success:
                    appearanceResult !==
                    false,

                timestamp:
                    Date.now(),

                eventId:
                    STATE.currentEventId

            }
        );


        /* --------------------------------------------------
           CHAT FIRST CONTACT
        -------------------------------------------------- */

        await safeAsyncCall(
            "First Contact chat",
            () =>
                playFirstContactMessage({

                    eventId:
                        STATE.currentEventId,

                    source:
                        data.source ||
                        "event",

                    startIdle:
                        false

                }),
            null
        );


        /* --------------------------------------------------
           REVEAL PRIVATE CHANNEL
        -------------------------------------------------- */

        safeCall(
            "reveal MR.SMILE chat",
            () => {

                revealMrSmileChat();

            }
        );


        trigger(
            "mrsmile:firstContactChatCompleted",
            {

                timestamp:
                    Date.now(),

                eventId:
                    STATE.currentEventId

            }
        );


        /* --------------------------------------------------
           PROGRESSION
        -------------------------------------------------- */

        safeCall(
            "evaluate progress",
            () => {

                evaluateProgress();

            }
        );


        /* --------------------------------------------------
           COMPLETE
        -------------------------------------------------- */

        markFirstContactCompleted();


        console.log(
            "[MR.SMILE EVENTS] FIRST CONTACT COMPLETED."
        );


        trigger(
            "mrsmile:firstContactFinished",
            {

                timestamp:
                    Date.now(),

                eventId:
                    STATE.currentEventId

            }
        );


        return true;

    } catch (error) {

        console.error(
            "[MR.SMILE EVENTS] First Contact failed:",
            error
        );

        trigger(
            "mrsmile:firstContactFailed",
            {

                error,

                timestamp:
                    Date.now(),

                eventId:
                    STATE.currentEventId

            }
        );

        return false;

    } finally {

        STATE.firstContactRunning =
            false;

        STATE.firstContactQueued =
            false;


        safeCall(
            "resume idle",
            () => {

                resumeIdleMessages();

            }
        );

    }

}


/* ==========================================================
   HANDSHAKE
========================================================== */

async function runHandshake(
    data = {}
) {

    if (
        STATE.handshakeRunning
    ) {
        return false;
    }


    if (
        isHandshakeCompleted()
    ) {
        return false;
    }


    STATE.handshakeRunning =
        true;


    const eventId =
        nextEventId();


    try {

        trigger(
            "mrsmile:handshakeStarted",
            {

                source:
                    data.source ||
                    "system",

                timestamp:
                    Date.now(),

                eventId

            }
        );


        await sleep(
            TIMING.handshakeDelay
        );


        markHandshakeCompleted();


        trigger(
            "mrsmile:handshakeCompleted",
            {

                timestamp:
                    Date.now(),

                eventId

            }
        );


        return true;

    } catch (error) {

        console.warn(
            "[MR.SMILE EVENTS] Handshake failed:",
            error
        );

        trigger(
            "mrsmile:handshakeFailed",
            {

                error,

                timestamp:
                    Date.now(),

                eventId

            }
        );

        return false;

    } finally {

        STATE.handshakeRunning =
            false;

    }

}


/* ==========================================================
   INTEGRITY SEQUENCE
========================================================== */

async function runIntegritySequence(
    data = {}
) {

    if (
        STATE.integrityRunning
    ) {
        return false;
    }


    if (
        isDuplicateEvent(
            "integrity"
        )
    ) {
        return false;
    }


    STATE.integrityRunning =
        true;


    const eventId =
        nextEventId();


    try {

        trigger(
            "mrsmile:integrityStarted",
            {

                source:
                    data.source ||
                    "system",

                timestamp:
                    Date.now(),

                eventId

            }
        );


        await sleep(
            300
        );


        trigger(
            "mrsmile:integrityStep",
            {

                step:
                    1,

                timestamp:
                    Date.now(),

                eventId

            }
        );


        await sleep(
            450
        );


        trigger(
            "mrsmile:integrityStep",
            {

                step:
                    2,

                timestamp:
                    Date.now(),

                eventId

            }
        );


        await sleep(
            450
        );


        trigger(
            "mrsmile:integrityCompleted",
            {

                timestamp:
                    Date.now(),

                eventId

            }
        );


        return true;

    } catch (error) {

        console.warn(
            "[MR.SMILE EVENTS] Integrity sequence failed:",
            error
        );

        trigger(
            "mrsmile:integrityFailed",
            {

                error,

                timestamp:
                    Date.now(),

                eventId

            }
        );

        return false;

    } finally {

        STATE.integrityRunning =
            false;

    }

}


/* ==========================================================
   RECOVERY SEQUENCE
========================================================== */

async function runRecovery(
    data = {}
) {

    if (
        STATE.recoveryRunning
    ) {
        return false;
    }


    if (
        isDuplicateEvent(
            "recovery"
        )
    ) {
        return false;
    }


    STATE.recoveryRunning =
        true;


    const eventId =
        nextEventId();


    try {

        trigger(
            "mrsmile:recoveryStarted",
            {

                source:
                    data.source ||
                    "system",

                timestamp:
                    Date.now(),

                eventId

            }
        );


        await sleep(
            TIMING.recoveryDelay
        );


        safeCall(
            "recover progress",
            () => {

                evaluateProgress();

            }
        );


        trigger(
            "mrsmile:recoveryCompleted",
            {

                timestamp:
                    Date.now(),

                eventId

            }
        );


        return true;

    } catch (error) {

        console.warn(
            "[MR.SMILE EVENTS] Recovery failed:",
            error
        );

        trigger(
            "mrsmile:recoveryFailed",
            {

                error,

                timestamp:
                    Date.now(),

                eventId

            }
        );

        return false;

    } finally {

        STATE.recoveryRunning =
            false;

    }

}


/* ==========================================================
   OPERATOR ACTION NORMALIZATION
========================================================== */

function normalizeOperatorAction(
    data = {}
) {

    if (
        typeof data ===
        "string"
    ) {

        return {

            action:
                cleanText(data),

            source:
                "operator",

            timestamp:
                Date.now()

        };

    }


    return {

        ...data,

        action:
            cleanText(
                data.action ||
                data.type ||
                data.name
            ),

        source:
            data.source ||
            "operator",

        timestamp:
            data.timestamp ||
            Date.now()

    };

}


/* ==========================================================
   OPERATOR ACTION EVENT
========================================================== */

function handleOperatorAction(
    data = {}
) {

    const action =
        normalizeOperatorAction(
            data
        );


    if (
        !action.action
    ) {
        return;
    }


    STATE.lastOperatorAction =
        action;


    trigger(
        "mrsmile:operatorActionProcessed",
        {

            ...action,

            eventId:
                STATE.currentEventId

        }
    );

}


/* ==========================================================
   OPERATOR FILE READ
========================================================== */

function handleOperatorFileRead(
    data = {}
) {

    const file = {

        id:
            data.id ||
            data.fileId ||
            null,

        name:
            data.name ||
            data.fileName ||
            "unknown",

        path:
            data.path ||
            "",

        restricted:
            data.restricted === true,

        timestamp:
            Date.now()

    };


    STATE.lastFileRead =
        file;


    trigger(
        "mrsmile:fileReadProcessed",
        {

            ...file,

            eventId:
                STATE.currentEventId

        }
    );


    if (
        file.restricted
    ) {

        trigger(
            "mrsmile:restrictedFileOpened",
            {

                ...file,

                eventId:
                    STATE.currentEventId

            }
        );

    }

}


/* ==========================================================
   SYS00 ACCEPTED
========================================================== */

function handleSys00Accepted(
    data = {}
) {

    trigger(
        "mrsmile:sys00Accepted",
        {

            ...data,

            timestamp:
                Date.now(),

            eventId:
                STATE.currentEventId

        }
    );

}


/* ==========================================================
   TRUST CHANGE
========================================================== */

function handleTrustChanged(
    data = {}
) {

    const amount =
        Number(
            data.amount ??
            data.delta ??
            0
        );


    if (
        Number.isFinite(amount) &&
        amount !== 0
    ) {

        safeCall(
            "apply trust change",
            () => {

                addTrust(
                    amount
                );

            }
        );

    }


    trigger(
        "mrsmile:trustChangedProcessed",
        {

            amount,

            trust:
                safeCall(
                    "get trust",
                    () =>
                        getTrust()
                ),

            timestamp:
                Date.now(),

            eventId:
                STATE.currentEventId

        }
    );


    safeCall(
        "evaluate progress after trust",
        () => {

            evaluateProgress();

        }
    );

}


/* ==========================================================
   TRUST INITIALIZATION
========================================================== */

function initializeTrust() {

    safeCall(
        "load trust",
        () => {

            loadTrust();

        }
    );


    const trust =
        safeCall(
            "read trust",
            () =>
                getTrust(),
            0
        );


    trigger(
        "mrsmile:trustInitialized",
        {

            trust,

            timestamp:
                Date.now()

        }
    );

}


/* ==========================================================
   PROGRESS INITIALIZATION
========================================================== */

function initializeProgress() {

    safeCall(
        "initialize progress",
        () => {

            initMrSmileProgress();

        }
    );


    safeCall(
        "evaluate initial progress",
        () => {

            evaluateProgress();

        }
    );

}


/* ==========================================================
   SUBSYSTEM INITIALIZATION
========================================================== */

function initializeSubsystems() {

    safeCall(
        "initialize context",
        () => {

            initMrSmileContext();

        }
    );


    safeCall(
        "initialize behavior",
        () => {

            initMrSmileBehavior();

        }
    );


    safeCall(
        "initialize actions",
        () => {

            initMrSmileActions();

        }
    );


    safeCall(
        "initialize intrusion UI",
        () => {

            initMrSmileIntrusionUI();

        }
    );

}


/* ==========================================================
   FIRST CONTACT EVENT LISTENER
========================================================== */

function registerFirstContactListener() {

    on(
        "mrsmile:firstContact",
        data => {

            runFirstContact(
                data || {}
            );

        }
    );

}


/* ==========================================================
   OPERATOR LISTENERS
========================================================== */

function registerOperatorListeners() {

    on(
        "mrsmile:operatorAction",
        handleOperatorAction
    );


    on(
        "mrsmile:operatorFileRead",
        handleOperatorFileRead
    );


    on(
        "mrsmile:fileRead",
        handleOperatorFileRead
    );


    on(
        "mrsmile:sys00Accepted",
        handleSys00Accepted
    );


    on(
        "mrsmile:trustChanged",
        handleTrustChanged
    );

}


/* ==========================================================
   HANDSHAKE LISTENERS
========================================================== */

function registerHandshakeListeners() {

    on(
        "mrsmile:handshakeRequested",
        data => {

            runHandshake(
                data || {}
            );

        }
    );


    on(
        "mrsmile:startHandshake",
        data => {

            runHandshake(
                data || {}
            );

        }
    );

}


/* ==========================================================
   INTEGRITY LISTENERS
========================================================== */

function registerIntegrityListeners() {

    on(
        "mrsmile:integrityRequested",
        data => {

            runIntegritySequence(
                data || {}
            );

        }
    );


    on(
        "mrsmile:integrityCheckRequested",
        data => {

            runIntegritySequence(
                data || {}
            );

        }
    );

}


/* ==========================================================
   RECOVERY LISTENERS
========================================================== */

function registerRecoveryListeners() {

    on(
        "mrsmile:recoveryRequested",
        data => {

            runRecovery(
                data || {}
            );

        }
    );


    on(
        "mrsmile:systemRecoveryRequested",
        data => {

            runRecovery(
                data || {}
            );

        }
    );

}


/* ==========================================================
   PROGRESS LISTENERS
========================================================== */

function registerProgressListeners() {

    on(
        "mrsmile:progressChanged",
        data => {

            safeCall(
                "progress evaluation",
                () => {

                    evaluateProgress(
                        data
                    );

                }
            );

        }
    );


    on(
        "mrsmile:accessRequestCreated",
        data => {

            trigger(
                "mrsmile:progressAccessRequestObserved",
                {

                    ...(
                        data ||
                        {}
                    ),

                    timestamp:
                        Date.now(),

                    eventId:
                        STATE.currentEventId

                }
            );

        }
    );

}


/* ==========================================================
   SYSTEM EVENT LISTENERS
========================================================== */

function registerSystemListeners() {

    on(
        "mrsmile:recovery",
        data => {

            runRecovery(
                data || {}
            );

        }
    );


    on(
        "mrsmile:integrity",
        data => {

            runIntegritySequence(
                data || {}
            );

        }
    );


    on(
        "mrsmile:handshake",
        data => {

            runHandshake(
                data || {}
            );

        }
    );

}


/* ==========================================================
   LISTENER REGISTRATION
========================================================== */

function registerListeners() {

    if (
        STATE.listenersRegistered
    ) {
        return;
    }


    registerFirstContactListener();

    registerOperatorListeners();

    registerHandshakeListeners();

    registerIntegrityListeners();

    registerRecoveryListeners();

    registerProgressListeners();

    registerSystemListeners();


    STATE.listenersRegistered =
        true;


    trigger(
        "mrsmile:eventListenersRegistered",
        {

            timestamp:
                Date.now(),

            eventId:
                STATE.currentEventId

        }
    );

}


/* ==========================================================
   INITIAL FIRST CONTACT STATE
========================================================== */

function initializeFirstContactState() {

    const completed =
        isFirstContactCompleted();


    STATE.firstContactCompleted =
        completed;


    if (
        completed
    ) {

        synchronizeMasterState(
            true
        );

        synchronizePresence(
            false
        );

    } else {

        synchronizeMasterState(
            false
        );

        synchronizePresence(
            false
        );

    }


    trigger(
        "mrsmile:firstContactStateInitialized",
        {

            completed,

            started:
                wasFirstContactStarted(),

            timestamp:
                Date.now()

        }
    );

}


/* ==========================================================
   BOOT
========================================================== */

export function initMrSmileEvents() {

    if (
        STATE.initialized
    ) {

        return getMrSmileEventsStatus();

    }


    console.log(
        "[MR.SMILE EVENTS] Initializing..."
    );


    initializeTrust();

    initializeProgress();

    initializeSubsystems();

    initializeFirstContactState();

    registerListeners();

    exposeGlobalAPI();


    STATE.initialized =
        true;


    trigger(
        "mrsmile:eventsInitialized",
        {

            timestamp:
                Date.now()

        }
    );


    console.log(
        "[MR.SMILE EVENTS] Initialized."
    );


    return getMrSmileEventsStatus();

}


/* ==========================================================
   MANUAL EVENTS
========================================================== */

export function triggerMrSmileHandshake(
    data = {}
) {

    return runHandshake(
        data
    );

}


export function triggerMrSmileIntegrity(
    data = {}
) {

    return runIntegritySequence(
        data
    );

}


export function triggerMrSmileRecovery(
    data = {}
) {

    return runRecovery(
        data
    );

}


/* ==========================================================
   EVENT STATUS
========================================================== */

export function getMrSmileEventsStatus() {

    return {

        initialized:
            STATE.initialized,

        listenersRegistered:
            STATE.listenersRegistered,

        firstContactRunning:
            STATE.firstContactRunning,

        firstContactCompleted:
            STATE.firstContactCompleted ||
            isFirstContactCompleted(),

        firstContactStarted:
            wasFirstContactStarted(),

        firstContactQueued:
            STATE.firstContactQueued,

        handshakeRunning:
            STATE.handshakeRunning,

        handshakeCompleted:
            STATE.handshakeCompleted ||
            isHandshakeCompleted(),

        integrityRunning:
            STATE.integrityRunning,

        recoveryRunning:
            STATE.recoveryRunning,

        operatorReactionRunning:
            STATE.operatorReactionRunning,

        currentEventId:
            STATE.currentEventId,

        firstContactStartTime:
            STATE.firstContactStartTime,

        lastEventTime:
            STATE.lastEventTime,

        lastOperatorAction:
            STATE.lastOperatorAction,

        lastFileRead:
            STATE.lastFileRead,

        lastSystemEvent:
            STATE.lastSystemEvent

    };

}


/* ==========================================================
   GLOBAL INITIALIZATION
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.addEventListener(
        "load",
        () => {

            try {

                initMrSmileEvents();

            } catch (error) {

                console.error(
                    "[MR.SMILE EVENTS] Boot failed:",
                    error
                );

            }

        },
        {
            once: true
        }
    );

}


/* ==========================================================
   EXPORT
========================================================== */

export default {

    init:
        initMrSmileEvents,

    triggerFirstContact:
        triggerMrSmileFirstContact,

    resetFirstContact:
        resetMrSmileFirstContact,

    triggerHandshake:
        triggerMrSmileHandshake,

    triggerIntegrity:
        triggerMrSmileIntegrity,

    triggerRecovery:
        triggerMrSmileRecovery,

    status:
        getMrSmileEventsStatus

};
