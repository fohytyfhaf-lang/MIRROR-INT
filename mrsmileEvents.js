/* ==========================================================
   MR.SMILE EVENTS — COMPLETE REBUILD
   OMEGA / MIRROR-INT

   RESPONSIBILITY:
   ----------------------------------------------------------
   This module is the EVENT ORCHESTRATOR.

   It does NOT contain:
   - MR.SMILE personality
   - conversation generation
   - idle message generation
   - relationship calculations
   - behavior decisions
   - action execution
   - chat rendering
   - visual personality logic

   Those responsibilities belong to:

       mrsmileCore.js
       mrsmileChat.js
       mrsmileMemory.js
       mrsmileRelationship.js
       mrsmileBehavior.js
       mrsmileActions.js
       mrsmileAppearance.js
       mrsmileContext.js

   This module only connects them.

   MAIN ARCHITECTURE:

       OMEGA EVENT
           ↓
       mrsmileEvents.js
           ↓
       State / Presence / Progress
           ↓
       Appearance / Chat / Behavior / Actions

   IMPORTANT:
   There is ONE official First Contact path.
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

    listenersRegistered:
        false,

    trustListenersRegistered:
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
        null

};


/* ==========================================================
   CONSTANTS
========================================================== */

const STORAGE = {

    firstContact:
        "mrsmile_first_contact",

    handshake:
        "mrsmile_handshake",

    firstContactStarted:
        "mrsmile_first_contact_started"

};


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


/* ==========================================================
   MASTER STATE SYNCHRONIZATION
========================================================== */

function synchronizeMasterState(
    firstContact = false
) {

    try {

        const state =
            window.MRSMILE_STATE?.get?.();


        if (
            state &&
            state.firstContact !==
                firstContact &&
            typeof window
                .MRSMILE_STATE
                ?.firstContact ===
                "function"
        ) {

            window.MRSMILE_STATE
                .firstContact(
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

        const status =
            window.MRSMILE_PRESENCE
                ?.status
                ?.();


        const current =
            status
                ?.state
                ?.firstContact;


        if (
            current !==
            firstContact &&
            typeof window
                .MRSMILE_PRESENCE
                ?.firstContact ===
                "function"
        ) {

            window.MRSMILE_PRESENCE
                .firstContact(
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
   FIRST CONTACT STATE SYNCHRONIZATION
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
   FIRST CONTACT CHECK
========================================================== */

function isFirstContactCompleted() {

    return (
        storageGet(
            STORAGE.firstContact
        ) === "1"
    );

}


/* ==========================================================
   FIRST CONTACT STARTED CHECK
========================================================== */

function wasFirstContactStarted() {

    return (
        storageGet(
            STORAGE.firstContactStarted
        ) === "1"
    );

}


/* ==========================================================
   MARK FIRST CONTACT STARTED
========================================================== */

function markFirstContactStarted() {

    storageSet(
        STORAGE.firstContactStarted,
        "1"
    );

}


/* ==========================================================
   MARK FIRST CONTACT COMPLETE
========================================================== */

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
   CLEAR FIRST CONTACT
   ----------------------------------------------------------
   DEBUG / TEST ONLY
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

    STATE.currentEventId += 1;

    STATE.lastEventTime =
        Date.now();


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

        eventId:
            STATE.currentEventId

    };


    /*
       Normal persistent guard.
    */

    if (
        isFirstContactCompleted() &&
        payload.force !== true
    ) {

        console.log(
            "[MR.SMILE EVENTS] First Contact already completed."
        );

        return false;

    }


    /*
       Do not start two First Contacts at once.
    */

    if (
        STATE.firstContactRunning
    ) {

        console.log(
            "[MR.SMILE EVENTS] First Contact already running."
        );

        return false;

    }


    /*
       Queue protection.
    */

    if (
        STATE.firstContactQueued
    ) {

        return false;

    }


    STATE.firstContactQueued =
        true;


    /*
       Official event path.

       Nobody should directly call
       startFirstContact().
    */

    trigger(
        "mrsmile:firstContact",
        payload
    );


    return true;

}


/* ==========================================================
   GLOBAL FIRST CONTACT API
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

    /*
       Hard protection.
    */

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


        /*
           Notify every dependent system.
        */

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


        /*
           Stop autonomous chat idle while
           First Contact is happening.

           This prevents old idle text from
           appearing between important messages.
        */

        safeCall(
            "pause idle",
            () => {

                stopIdleMessages();

            }
        );


        /*
           Small synchronization delay.
        */

        await sleep(
            TIMING.firstContactDelay
        );


        /* --------------------------------------------------
           VISUAL / SYSTEM INTRUSION

           Appearance module owns the visual event.
           No face generation exists here.
        -------------------------------------------------- */

        let appearanceResult = null;


        try {

            appearanceResult =
                await showMrSmileFirstContactFace(
                    "presence"
                );

        } catch (error) {

            console.error(
                "[MR.SMILE EVENTS] Appearance First Contact failed:",
                error
            );

        }


        /*
           Even if appearance fails,
           continue to Chat.

           This prevents one visual error from
           breaking the entire MR.SMILE system.
        */


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

           Chat module owns actual message rendering.
        -------------------------------------------------- */

        try {

            await playFirstContactMessage({

                eventId:
                    STATE.currentEventId,

                source:
                    data.source ||
                    "event",

                startIdle:
                    false

            });

        } catch (error) {

            console.error(
                "[MR.SMILE EVENTS] First Contact chat failed:",
                error
            );

        }


        /* --------------------------------------------------
           REVEAL PRIVATE CHANNEL
        -------------------------------------------------- */

        try {

            revealMrSmileChat();

        } catch (error) {

            console.warn(
                "[MR.SMILE EVENTS] Could not reveal MR.SMILE chat:",
                error
            );

        }


        /* --------------------------------------------------
           PROGRESS
        -------------------------------------------------- */

        try {

            evaluateProgress();

        } catch (error) {

            console.warn(
                "[MR.SMILE EVENTS] Progress evaluation failed:",
                error
            );

        }


        /*
           Persist completion ONLY after the whole sequence
           has had a chance to run.
        */

        markFirstContactCompleted();


        trigger(
            "mrsmile:firstContactFinished",
            {

                timestamp:
                    Date.now(),

                eventId:
                    STATE.currentEventId

            }
        );


        /*
           Return idle only after First Contact.
        */

        await sleep(
            800
        );


        safeCall(
            "resume idle",
            () => {

                resumeIdleMessages();

            }
        );


        console.log(
            "[MR.SMILE EVENTS] FIRST CONTACT COMPLETED."
        );


        return true;

    } catch (error) {

        console.error(
            "[MR.SMILE EVENTS] First Contact crashed:",
            error
        );


        trigger(
            "mrsmile:firstContactError",
            {

                error,

                timestamp:
                    Date.now(),

                eventId:
                    STATE.currentEventId

            }
        );


        /*
           Do NOT mark First Contact completed
           after a fatal error.

           This allows another proper attempt.
        */


        safeCall(
            "resume idle after error",
            () => {

                resumeIdleMessages();

            }
        );


        return false;

    } finally {

        STATE.firstContactRunning =
            false;

    }

}


/* ==========================================================
   EVENT: FIRST CONTACT
========================================================== */

function registerFirstContactEvent() {

    on(
        "mrsmile:firstContact",
        data => {

            void runFirstContact(
                data || {}
            );

        }
    );

}


/* ==========================================================
   EVENT: OPERATOR READ FILE
========================================================== */

function registerFileReadEvent() {

    on(
        "mrsmile:operatorReadFile",
        data => {

            handleOperatorReadFile(
                data
            );

        }
    );

}


function handleOperatorReadFile(
    data = {}
) {

    const path =
        cleanText(
            data.path ||
            data.file ||
            data.target
        );


    if (!path) {
        return;
    }


    STATE.lastFileRead =
        path;


    console.log(
        "[MR.SMILE EVENTS] Operator read file:",
        path
    );


    /*
       Trust handling is kept here because
       this is a concrete operator event.

       Conversation/behavior remains elsewhere.
    */

    try {

        if (
            path ===
            "/files/entity_mrsmile.txt"
        ) {

            addTrust(
                2,
                `READ_SECRET: ${path}`
            );

        } else {

            addTrust(
                1,
                `READ_FILE: ${path}`
            );

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE EVENTS] Trust update failed:",
            error
        );

    }


    trigger(
        "mrsmile:fileReadProcessed",
        {

            path,

            timestamp:
                Date.now()

        }
    );

}


/* ==========================================================
   EVENT: SYS_00 ACCEPTED
========================================================== */

function registerSys00Event() {

    on(
        "mrsmile:sys00Accepted",
        () => {

            void handleSys00Accepted();

        }
    );

}


async function handleSys00Accepted() {

    if (
        STATE.handshakeRunning
    ) {
        return;
    }


    if (
        STATE.handshakeCompleted
    ) {
        return;
    }


    if (
        storageGet(
            STORAGE.handshake
        ) === "1"
    ) {

        STATE.handshakeCompleted =
            true;

        return;

    }


    STATE.handshakeRunning =
        true;


    try {

        trigger(
            "mrsmile:handshakeStarted",
            {
                timestamp:
                    Date.now()
            }
        );


        await sleep(
            TIMING.handshakeDelay
        );


        await runHandshakeSequence();


        STATE.handshakeCompleted =
            true;


        storageSet(
            STORAGE.handshake,
            "1"
        );


        trigger(
            "mrsmile:handshakeCompleted",
            {
                timestamp:
                    Date.now()
            }
        );


    } catch (error) {

        console.error(
            "[MR.SMILE EVENTS] Handshake failed:",
            error
        );


        trigger(
            "mrsmile:handshakeError",
            {
                error,

                timestamp:
                    Date.now()
            }
        );

    } finally {

        STATE.handshakeRunning =
            false;

    }

}


/* ==========================================================
   HANDSHAKE SEQUENCE
========================================================== */

async function runHandshakeSequence() {

    addSystemEventMessage(
        "SYSTEM NOTICE: Unauthorized handshake detected."
    );


    await sleep(500);


    addSystemEventMessage(
        "CHANNEL: SYS_00"
    );


    await sleep(400);


    addSystemEventMessage(
        "SOURCE: UNKNOWN"
    );


    await sleep(600);


    addSystemEventMessage(
        "HANDSHAKE ANALYSIS IN PROGRESS."
    );


    await sleep(700);


    addSystemEventMessage(
        "REMOTE SIGNATURE ACCEPTED."
    );


    await sleep(500);


    addSystemEventMessage(
        "CONNECTION STATUS: ACTIVE."
    );


    trigger(
        "mrsmile:handshakeDetected",
        {

            source:
                "sys00",

            timestamp:
                Date.now()

        }
    );

}


/* ==========================================================
   EVENT: HANDSHAKE ACCEPTED
========================================================== */

function registerHandshakeEvent() {

    on(
        "mrsmile:handshakeAccepted",
        () => {

            void handleHandshakeAccepted();

        }
    );

}


async function handleHandshakeAccepted() {

    if (
        STATE.integrityRunning
    ) {
        return;
    }


    await runIntegritySequence();

}


/* ==========================================================
   INTEGRITY EVENT
========================================================== */

async function runIntegritySequence() {

    if (
        STATE.integrityRunning
    ) {
        return false;
    }


    STATE.integrityRunning =
        true;


    safeCall(
        "pause idle",
        () => stopIdleMessages()
    );


    try {

        trigger(
            "mrsmile:integrityStarted",
            {
                timestamp:
                    Date.now()
            }
        );


        await systemStep(
            "OMEGA SYSTEM INTEGRITY: 99.8%",
            900
        );


        await systemStep(
            "OMEGA SYSTEM INTEGRITY: 99.6%",
            850
        );


        await systemStep(
            "OMEGA SYSTEM INTEGRITY: 99.3%",
            700
        );


        await systemStep(
            "BACKGROUND PROCESS: UNKNOWN",
            650
        );


        await systemStep(
            "REMOTE PROCESS DETECTED.",
            900
        );


        await systemStep(
            "PROCESS TERMINATION REQUESTED.",
            800
        );


        await systemStep(
            "PROCESS TERMINATED.",
            900
        );


        await systemStep(
            "SYSTEM INTEGRITY: NORMAL",
            1500
        );


        await runFalseRecovery();


        trigger(
            "mrsmile:integrityCompleted",
            {
                timestamp:
                    Date.now()
            }
        );


        return true;

    } catch (error) {

        console.error(
            "[MR.SMILE EVENTS] Integrity sequence failed:",
            error
        );


        trigger(
            "mrsmile:integrityError",
            {
                error,
                timestamp:
                    Date.now()
            }
        );


        return false;

    } finally {

        STATE.integrityRunning =
            false;

        safeCall(
            "resume idle",
            () => resumeIdleMessages()
        );

    }

}


/* ==========================================================
   SYSTEM EVENT MESSAGE
========================================================== */

function addSystemEventMessage(
    text
) {

    const message =
        cleanText(text);


    if (!message) {
        return false;
    }


    try {

        if (
            typeof window.addChatMessage ===
            "function"
        ) {

            return window.addChatMessage(
                "mrsmile",
                {

                    user:
                        "SYSTEM",

                    time:
                        new Date()
                            .toLocaleTimeString(
                                [],
                                {
                                    hour:
                                        "2-digit",

                                    minute:
                                        "2-digit"
                                }
                            ),

                    text:
                        message

                }
            );

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE EVENTS] System chat output failed:",
            error
        );

    }


    return false;

}


/* ==========================================================
   SYSTEM STEP
========================================================== */

async function systemStep(
    message,
    delay = 700
) {

    addSystemEventMessage(
        message
    );


    await sleep(
        delay
    );

}


/* ==========================================================
   FALSE RECOVERY
========================================================== */

async function runFalseRecovery() {

    if (
        STATE.recoveryRunning
    ) {
        return false;
    }


    STATE.recoveryRunning =
        true;


    try {

        await systemStep(
            "BACKGROUND PROCESS: 01 UNKNOWN",
            800
        );


        await systemStep(
            "BACKGROUND PROCESS: 00 UNKNOWN",
            900
        );


        await systemStep(
            "SYSTEM INTEGRITY: NORMAL",
            1200
        );


        await sleep(
            TIMING.recoveryDelay
        );


        trigger(
            "mrsmile:recoveryCompleted",
            {
                timestamp:
                    Date.now()
            }
        );


        /*
           IMPORTANT:

           Recovery does NOT directly call
           First Contact.

           Instead it goes through the
           official event path.
        */

        if (
            !isFirstContactCompleted()
        ) {

            triggerMrSmileFirstContact(
                {
                    source:
                        "sys00_recovery",

                    type:
                        "first_contact",

                    force:
                        false

                }
            );

        }


        return true;

    } finally {

        STATE.recoveryRunning =
            false;

    }

}


/* ==========================================================
   EVENT: OPERATOR ACTION
========================================================== */

function registerOperatorActionEvent() {

    on(
        "mrsmile:operatorAction",
        data => {

            handleOperatorAction(
                data
            );

        }
    );

}


async function handleOperatorAction(
    data = {}
) {

    if (
        !data ||
        typeof data !==
        "object"
    ) {
        return;
    }


    /*
       Prevent MR.SMILE-originated actions
       from returning into this event system.
    */

    if (
        data.source ===
        "mrsmile"
    ) {
        return;
    }


    const timestamp =
        Date.now();


    /*
       Small duplicate protection.
    */

    if (
        STATE.operatorReactionRunning
    ) {

        /*
           Do not execute multiple identical
           action events simultaneously.
        */

        return;

    }


    STATE.operatorReactionRunning =
        true;


    STATE.lastOperatorAction =
        {

            type:
                data.type ||
                data.action ||
                "unknown",

            target:
                data.target ||
                data.path ||
                "",

            timestamp

        };


    try {

        /*
           Progress first.
        */

        try {

            evaluateProgress();

        } catch (error) {

            console.warn(
                "[MR.SMILE EVENTS] Progress evaluation failed:",
                error
            );

        }


        /*
           Behavior / Action system receives
           the original event.

           This module does NOT decide what
           MR.SMILE should say.
        */

        trigger(
            "mrsmile:operatorActionProcessed",
            {

                ...data,

                timestamp

            }
        );


    } finally {

        await sleep(
            TIMING.operatorReactionCooldown
        );


        STATE.operatorReactionRunning =
            false;

    }

}


/* ==========================================================
   EVENT: TRUST CHANGE
========================================================== */

function registerTrustEvents() {

    if (
        STATE.trustListenersRegistered
    ) {
        return;
    }


    STATE.trustListenersRegistered =
        true;


    on(
        "mrsmile:trustChanged",
        data => {

            trigger(
                "mrsmile:relationshipUpdateRequested",
                {

                    trust:
                        getTrust(),

                    source:
                        "trust_changed",

                    original:
                        data || null,

                    timestamp:
                        Date.now()

                }
            );

        }
    );

}


/* ==========================================================
   EVENT: PROGRESS
========================================================== */

function registerProgressEvents() {

    on(
        "mrsmile:progressChanged",
        data => {

            try {

                evaluateProgress();

            } catch (error) {

                console.warn(
                    "[MR.SMILE EVENTS] Progress event failed:",
                    error
                );

            }


            trigger(
                "mrsmile:progressEvaluated",
                {

                    original:
                        data || null,

                    timestamp:
                        Date.now()

                }
            );

        }
    );

}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileEvents(
    options = {}
) {

    if (
        STATE.initialized
    ) {

        return {
            ok:
                true,

            alreadyInitialized:
                true,

            status:
                getMrSmileEventsStatus()

        };

    }


    STATE.initialized =
        true;


    /*
       Existing persistent state.
    */

    STATE.firstContactCompleted =
        isFirstContactCompleted();


    STATE.handshakeCompleted =
        storageGet(
            STORAGE.handshake
        ) === "1";


    /*
       Trust.
    */

    safeCall(
        "load trust",
        () => loadTrust()
    );


    /*
       Progress.
    */

    safeCall(
        "initialize progress",
        () => initMrSmileProgress()
    );


    /*
       UI.
    */

    safeCall(
        "initialize intrusion UI",
        () =>
            initMrSmileIntrusionUI()
    );


    /*
       Behavior.
    */

    safeCall(
        "initialize behavior",
        () =>
            initMrSmileBehavior()
    );


    /*
       Actions.
    */

    safeCall(
        "initialize actions",
        () =>
            initMrSmileActions()
    );


    /*
       Context.
    */

    safeCall(
        "initialize context",
        () =>
            initMrSmileContext()
    );


    /*
       Event registration.
    */

    if (
        !STATE.listenersRegistered
    ) {

        registerFirstContactEvent();

        registerFileReadEvent();

        registerSys00Event();

        registerHandshakeEvent();

        registerOperatorActionEvent();

        registerTrustEvents();

        registerProgressEvents();


        STATE.listenersRegistered =
            true;

    }


    exposeGlobalAPI();


    /*
       First Contact state restoration.
    */

    if (
        STATE.firstContactCompleted
    ) {

        synchronizeMasterState(
            true
        );

    }


    console.log(
        "[MR.SMILE EVENTS] Complete event system initialized."
    );


    return {

        ok:
            true,

        initialized:
            true,

        status:
            getMrSmileEventsStatus()

    };

}


/* ==========================================================
   STATUS
========================================================== */

export function getMrSmileEventsStatus() {

    return {

        initialized:
            STATE.initialized,

        firstContactRunning:
            STATE.firstContactRunning,

        firstContactCompleted:
            STATE.firstContactCompleted ||
            isFirstContactCompleted(),

        firstContactQueued:
            STATE.firstContactQueued,

        handshakeRunning:
            STATE.handshakeRunning,

        handshakeCompleted:
            STATE.handshakeCompleted ||
            storageGet(
                STORAGE.handshake
            ) === "1",

        integrityRunning:
            STATE.integrityRunning,

        recoveryRunning:
            STATE.recoveryRunning,

        operatorReactionRunning:
            STATE.operatorReactionRunning,

        lastOperatorAction:
            STATE.lastOperatorAction,

        lastFileRead:
            STATE.lastFileRead,

        currentEventId:
            STATE.currentEventId,

        firstContactStartTime:
            STATE.firstContactStartTime,

        lastEventTime:
            STATE.lastEventTime,

        listenersRegistered:
            STATE.listenersRegistered

    };

}


/* ==========================================================
   DEBUG API
========================================================== */

export function debugTriggerFirstContact() {

    return triggerMrSmileFirstContact(
        {
            source:
                "debug",

            type:
                "debug_first_contact",

            force:
                true

        }
    );

}


export function debugResetFirstContact() {

    return resetMrSmileFirstContact();

}


/* ==========================================================
   GLOBAL DEBUG HELPERS
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.debugTriggerMrSmileFirstContact =
        debugTriggerFirstContact;


    window.debugResetMrSmileFirstContact =
        debugResetFirstContact;


    window.getMrSmileEventsStatus =
        getMrSmileEventsStatus;

}


/* ==========================================================
   AUTO INIT
========================================================== */

try {

    initMrSmileEvents();

} catch (error) {

    console.error(
        "[MR.SMILE EVENTS] Initialization failed:",
        error
    );

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

const MRSMILE_EVENTS_API = {

    init:
        initMrSmileEvents,

    triggerFirstContact:
        triggerMrSmileFirstContact,

    resetFirstContact:
        resetMrSmileFirstContact,

    debugTriggerFirstContact,

    debugResetFirstContact,

    status:
        getMrSmileEventsStatus

};


export default MRSMILE_EVENTS_API;
