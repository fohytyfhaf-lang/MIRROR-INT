import {
    on,
    trigger
} from "./eventManager.js";

import {
    getMrSmileState,
    setMrSmilePresence
} from "./mrsmileState.js";


/* ==========================================================
   MR.SMILE PRESENCE
   Постоянное присутствие MR.SMILE внутри OMEGA
========================================================== */


/* =========================
        STORAGE
========================= */

const STORAGE_KEY =
    "mrsmile_presence";


/* =========================
        DEFAULT STATE
========================= */

const DEFAULT_STATE = {

    initialized: false,

    present: false,

    active: false,

    observing: false,

    firstContact: false,

    accepted: false,

    mode: "absent",

    currentTarget: null,

    lastActivity: null,

    lastPresenceChange: null,

    activationCount: 0,

    observationCount: 0,

    lastEvent: null

};


let state =
    createDefaultState();


let initialized = false;


/* ==========================================================
   HELPERS
========================================================== */


/* =========================
        DEFAULT
========================= */

function createDefaultState() {

    return JSON.parse(
        JSON.stringify(
            DEFAULT_STATE
        )
    );

}


/* =========================
        NOW
========================= */

function now() {

    return Date.now();

}


/* =========================
        CLONE
========================= */

function clone(data) {

    if (
        data === null ||
        data === undefined
    ) {

        return data;

    }


    try {

        return JSON.parse(
            JSON.stringify(data)
        );

    } catch {

        return data;

    }

}


/* =========================
        LOAD
========================= */

function loadState() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!raw) {

            state =
                createDefaultState();

            return;

        }


        const saved =
            JSON.parse(raw);


        state = {

            ...createDefaultState(),

            ...saved

        };

    }

    catch (error) {

        console.warn(
            "[MR.SMILE PRESENCE] Failed to load:",
            error
        );


        state =
            createDefaultState();

    }

}


/* =========================
        SAVE
========================= */

function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    }

    catch (error) {

        console.warn(
            "[MR.SMILE PRESENCE] Failed to save:",
            error
        );

    }

}


/* =========================
        UPDATE
========================= */

function updateState(
    changes = {},
    reason = "presence_update"
) {

    state = {

        ...state,

        ...changes

    };


    saveState();


    trigger(
        "mrsmile:presenceChanged",
        {

            state:
                clone(state),

            changes:
                clone(changes),

            reason,

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   PRESENCE MODES
========================================================== */

const MODES = {

    ABSENT:
        "absent",

    OBSERVER:
        "observer",

    ACTIVE:
        "active",

    INTERVENTION:
        "intervention"

};


/* ==========================================================
   PRESENCE STATE
========================================================== */


/* =========================
        IS PRESENT
========================= */

export function isMrSmilePresent() {

    return state.present === true;

}


/* =========================
        IS ACTIVE
========================= */

export function isMrSmileActive() {

    return state.active === true;

}


/* =========================
        IS OBSERVING
========================= */

export function isMrSmileObserving() {

    return state.observing === true;

}


/* =========================
        GET MODE
========================= */

export function getMrSmilePresenceMode() {

    return state.mode;

}


/* =========================
        GET STATE
========================= */

export function getMrSmilePresenceState() {

    return clone(
        state
    );

}


/* ==========================================================
   ACTIVATION
========================================================== */


/* =========================
        ACTIVATE
========================= */

export function activateMrSmilePresence(
    reason = "presence_activated"
) {

    if (state.active) {

        return getMrSmilePresenceState();

    }


    const masterState =
        getMrSmileState();


    /*
     * Если First Contact ещё не произошёл,
     * Presence не должен самовольно
     * превращаться в полноценного MR.SMILE.
     */

    if (
        !masterState.firstContact &&
        !masterState.accepted
    ) {

        console.log(
            "[MR.SMILE PRESENCE] Activation blocked: no First Contact."
        );

        return getMrSmilePresenceState();

    }


    state = {

        ...state,

        present: true,

        active: true,

        observing: true,

        firstContact:
            masterState.firstContact,

        accepted:
            masterState.accepted,

        mode:
            MODES.ACTIVE,

        activationCount:
            state.activationCount + 1,

        lastActivity:
            now(),

        lastPresenceChange:
            now()

    };


    saveState();


    /*
     * Синхронизируем общий State.
     */

    setMrSmilePresence(
        true,
        reason
    );


    trigger(
        "mrsmile:presenceActivated",
        {

            state:
                clone(state),

            reason,

            timestamp:
                now()

        }
    );


    console.log(
        "[MR.SMILE PRESENCE] Activated.",
        clone(state)
    );


    return getMrSmilePresenceState();

}


/* =========================
        DEACTIVATE
========================= */

export function deactivateMrSmilePresence(
    reason = "presence_deactivated"
) {

    state = {

        ...state,

        active: false,

        observing: false,

        mode:
            MODES.ABSENT,

        currentTarget: null,

        lastActivity:
            now(),

        lastPresenceChange:
            now()

    };


    saveState();


    trigger(
        "mrsmile:presenceDeactivated",
        {

            state:
                clone(state),

            reason,

            timestamp:
                now()

        }
    );


    console.log(
        "[MR.SMILE PRESENCE] Deactivated."
    );


    return getMrSmilePresenceState();

}


/* ==========================================================
   OBSERVATION
========================================================== */


/* =========================
        START OBSERVING
========================= */

export function startMrSmileObservation(
    target = null,
    reason = "observation_started"
) {

    if (!state.present) {

        return false;

    }


    state = {

        ...state,

        present: true,

        observing: true,

        mode:
            state.active
                ? MODES.ACTIVE
                : MODES.OBSERVER,

        currentTarget:
            target,

        observationCount:
            state.observationCount + 1,

        lastActivity:
            now(),

        lastEvent:
            {

                type:
                    "observation",

                target,

                reason,

                timestamp:
                    now()

            }

    };


    saveState();


    trigger(
        "mrsmile:presenceObserving",
        {

            target,

            reason,

            state:
                clone(state),

            timestamp:
                now()

        }
    );


    return true;

}


/* =========================
        STOP OBSERVING
========================= */

export function stopMrSmileObservation(
    reason = "observation_stopped"
) {

    if (!state.present) {

        return false;

    }


    state = {

        ...state,

        observing: false,

        mode:
            state.active
                ? MODES.ACTIVE
                : MODES.OBSERVER,

        currentTarget: null,

        lastActivity:
            now()

    };


    saveState();


    trigger(
        "mrsmile:presenceObservationStopped",
        {

            reason,

            state:
                clone(state),

            timestamp:
                now()

        }
    );


    return true;

}


/* ==========================================================
   INTERVENTION MODE
========================================================== */


/* =========================
        START INTERVENTION
========================= */

export function startMrSmileIntervention(
    target = null,
    reason = "intervention_started"
) {

    if (!state.present) {

        return false;

    }


    state = {

        ...state,

        active: true,

        observing: false,

        mode:
            MODES.INTERVENTION,

        currentTarget:
            target,

        lastActivity:
            now(),

        lastEvent:
            {

                type:
                    "intervention",

                target,

                reason,

                timestamp:
                    now()

            }

    };


    saveState();


    trigger(
        "mrsmile:presenceIntervention",
        {

            target,

            reason,

            state:
                clone(state),

            timestamp:
                now()

        }
    );


    return true;

}


/* =========================
        END INTERVENTION
========================= */

export function endMrSmileIntervention(
    reason = "intervention_finished"
) {

    if (!state.present) {

        return false;

    }


    state = {

        ...state,

        mode:
            state.active
                ? MODES.ACTIVE
                : MODES.OBSERVER,

        observing:
            state.active,

        currentTarget:
            null,

        lastActivity:
            now()

    };


    saveState();


    trigger(
        "mrsmile:presenceInterventionEnded",
        {

            reason,

            state:
                clone(state),

            timestamp:
                now()

        }
    );


    return true;

}


/* ==========================================================
   FIRST CONTACT
========================================================== */


/* =========================
        FIRST CONTACT
========================= */

function handleFirstContact(data) {

    const masterState =
        getMrSmileState();


    state = {

        ...state,

        firstContact: true,

        accepted:
            data?.accepted === true ||
            masterState.accepted === true,

        present: true,

        lastActivity:
            now(),

        lastPresenceChange:
            now(),

        lastEvent:
            {

                type:
                    "first_contact",

                data:
                    clone(data),

                timestamp:
                    now()

            }

    };


    /*
     * После First Contact MR.SMILE существует
     * в системе как Observer.
     *
     * Он ещё НЕ обязан вмешиваться.
     */

    state.mode =
        state.accepted
            ? MODES.OBSERVER
            : MODES.OBSERVER;


    state.observing =
        true;


    saveState();


    setMrSmilePresence(
        true,
        state.accepted
            ? "first_contact_accepted"
            : "first_contact"
    );


    trigger(
        "mrsmile:presenceEstablished",
        {

            state:
                clone(state),

            accepted:
                state.accepted,

            timestamp:
                now()

        }
    );


    console.log(
        "[MR.SMILE PRESENCE] Presence established."
    );

}


/* ==========================================================
   OPERATOR ACTIVITY
========================================================== */


/* =========================
        OPERATOR ACTION
========================= */

function handleOperatorAction(data) {

    if (!data) {
        return;
    }


    if (!state.present) {

        return;

    }


    state.lastActivity =
        now();


    state.lastEvent =
        {

            type:
                "operator_action",

            data:
                clone(data),

            timestamp:
                now()

        };


    /*
     * Если MR.SMILE просто наблюдает,
     * он остаётся Observer.
     *
     * Никакой автоматической атаки
     * или вмешательства здесь нет.
     */

    if (
        state.mode ===
        MODES.OBSERVER
    ) {

        state.observing =
            true;

    }


    saveState();


    trigger(
        "mrsmile:presenceOperatorActivity",
        {

            data:
                clone(data),

            state:
                clone(state),

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   MR.SMILE ACTIVITY
========================================================== */


/* =========================
        BEHAVIOR DECISION
========================= */

function handleBehaviorDecision(data) {

    if (!data) {
        return;
    }


    if (!state.present) {

        return;

    }


    state.lastActivity =
        now();


    state.lastEvent =
        {

            type:
                "behavior_decision",

            data:
                clone(data),

            timestamp:
                now()

        };


    saveState();


    trigger(
        "mrsmile:presenceDecision",
        {

            decision:
                clone(data),

            state:
                clone(state),

            timestamp:
                now()

        }
    );

}


/* =========================
        ACTION STARTED
========================= */

function handleActionStarted(data) {

    if (!data) {
        return;
    }


    if (!state.present) {

        return;

    }


    state.active =
        true;


    state.observing =
        false;


    state.mode =
        MODES.INTERVENTION;


    state.lastActivity =
        now();


    state.lastEvent =
        {

            type:
                "mrsmile_action",

            data:
                clone(data),

            timestamp:
                now()

        };


    saveState();


    trigger(
        "mrsmile:presenceActionStarted",
        {

            action:
                clone(data),

            state:
                clone(state),

            timestamp:
                now()

        }
    );

}


/* =========================
        ACTION COMPLETED
========================= */

function handleActionCompleted(data) {

    if (!data) {
        return;
    }


    if (!state.present) {

        return;

    }


    state.active =
        true;


    state.observing =
        true;


    state.mode =
        MODES.ACTIVE;


    state.currentTarget =
        null;


    state.lastActivity =
        now();


    state.lastEvent =
        {

            type:
                "mrsmile_action_completed",

            data:
                clone(data),

            timestamp:
                now()

        };


    saveState();


    trigger(
        "mrsmile:presenceActionCompleted",
        {

            action:
                clone(data),

            state:
                clone(state),

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   EVENT REGISTRATION
========================================================== */

function registerListeners() {


    /* =========================
            FIRST CONTACT
    ========================= */

    on(
        "mrsmile:firstContact",
        handleFirstContact
    );


    on(
        "mrsmile:firstContactAccepted",
        handleFirstContact
    );


    /* =========================
            OPERATOR
    ========================= */

    on(
        "mrsmile:operatorAction",
        handleOperatorAction
    );


    /* =========================
            BEHAVIOR
    ========================= */

    on(
        "mrsmile:behaviorDecision",
        handleBehaviorDecision
    );


    on(
        "mrsmile:actionStarted",
        handleActionStarted
    );


    on(
        "mrsmile:actionCompleted",
        handleActionCompleted
    );


    /* =========================
            OBSERVATION
    ========================= */

    on(
        "mrsmile:observing",
        data => {

            if (!state.present) {
                return;
            }


            startMrSmileObservation(
                data?.decision?.target ||
                null,

                "mrsmile_observing"
            );

        }
    );

}


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmilePresence() {

    if (initialized) {
        return;
    }


    initialized = true;


    loadState();


    registerListeners();


    /*
     * Синхронизация с основным State.
     */

    const masterState =
        getMrSmileState();


    if (
        masterState.present ||
        masterState.firstContact ||
        masterState.accepted
    ) {

        state.present =
            true;

        state.firstContact =
            masterState.firstContact;

        state.accepted =
            masterState.accepted;


        if (
            state.mode ===
            MODES.ABSENT
        ) {

            state.mode =
                MODES.OBSERVER;

        }


        saveState();

    }


    state.initialized =
        true;


    saveState();


    console.log(
        "[MR.SMILE PRESENCE] Initialized.",
        clone(state)
    );


    trigger(
        "mrsmile:presenceInitialized",
        {

            state:
                clone(state),

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   RESET
========================================================== */

export function resetMrSmilePresence() {

    state =
        createDefaultState();


    state.initialized =
        initialized;


    saveState();


    trigger(
        "mrsmile:presenceReset",
        {

            state:
                clone(state),

            timestamp:
                now()

        }
    );


    console.log(
        "[MR.SMILE PRESENCE] Reset."
    );

}


/* ==========================================================
   DEBUG API
========================================================== */

window.MRSMILE_PRESENCE = {

    status() {

        return {

            initialized,

            state:
                getMrSmilePresenceState()

        };

    },


    get() {

        return getMrSmilePresenceState();

    },


    isPresent() {

        return isMrSmilePresent();

    },


    isActive() {

        return isMrSmileActive();

    },


    isObserving() {

        return isMrSmileObserving();

    },


    mode() {

        return getMrSmilePresenceMode();

    },


    activate(reason) {

        return activateMrSmilePresence(
            reason ||
            "debug_activation"
        );

    },


    deactivate(reason) {

        return deactivateMrSmilePresence(
            reason ||
            "debug_deactivation"
        );

    },


    observe(target, reason) {

        return startMrSmileObservation(
            target ||
            null,

            reason ||
            "debug_observation"
        );

    },


    stopObserve(reason) {

        return stopMrSmileObservation(
            reason ||
            "debug_observation_stop"
        );

    },


    intervene(target, reason) {

        return startMrSmileIntervention(
            target ||
            null,

            reason ||
            "debug_intervention"
        );

    },


    endIntervention(reason) {

        return endMrSmileIntervention(
            reason ||
            "debug_intervention_end"
        );

    },


    firstContact(accepted = true) {

        return handleFirstContact(
            {
                accepted
            }
        );

    },


    reset() {

        return resetMrSmilePresence();

    }

};


/* ==========================================================
   AUTO INIT
========================================================== */

setTimeout(
    () => {

        initMrSmilePresence();

    },
    0
);
