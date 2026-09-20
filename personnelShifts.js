/* ==========================================================
   OMEGA PERSONNEL SHIFTS
   ----------------------------------------------------------
   REAL SHIFT HANDOVER SYSTEM

   A = 06:00–14:00
   B = 14:00–22:00
   C = 22:00–06:00

   Responsibilities:
   - detect current shift
   - detect shift changes
   - create handover
   - identify outgoing personnel
   - identify incoming personnel
   - notify OMEGA systems
========================================================== */

import {
    on,
    trigger
} from "./eventManager.js";

import {
    Storage
} from "./storage.js";


/* ==========================================================
   CONFIG
========================================================== */

const SHIFTS = {

    A: {
        code: "A",
        name: "MORNING SHIFT",
        hours: "06:00–14:00"
    },

    B: {
        code: "B",
        name: "DAY SHIFT",
        hours: "14:00–22:00"
    },

    C: {
        code: "C",
        name: "NIGHT SHIFT",
        hours: "22:00–06:00"
    }

};


const HANDOVER_DURATION =
    8000;


/* ==========================================================
   STATE
========================================================== */

let initialized = false;

let currentShift = null;

let handoverActive = false;

let handoverTimer = null;


/* ==========================================================
   CURRENT SHIFT
========================================================== */

function getCurrentShiftCode() {

    const hour =
        new Date().getHours();


    if (
        hour >= 6 &&
        hour < 14
    ) {

        return "A";

    }


    if (
        hour >= 14 &&
        hour < 22
    ) {

        return "B";

    }


    return "C";

}


/* ==========================================================
   SHIFT INFO
========================================================== */

function getShiftInfo(
    code
) {

    return (
        SHIFTS[code] ||
        null
    );

}


/* ==========================================================
   GET PERSONNEL
========================================================== */

function getPersonnel() {

    const personnel =
        Storage.get(
            "personnel",
            []
        );


    return Array.isArray(
        personnel
    )
        ? personnel
        : [];

}


/* ==========================================================
   GET SHIFT PERSONNEL
========================================================== */

function getShiftPersonnel(
    shiftCode
) {

    return getPersonnel().filter(
        person =>

            person &&

            String(
                person.shift ||
                ""
            ).toUpperCase() ===
                shiftCode

    );

}


/* ==========================================================
   START HANDOVER
========================================================== */

function startHandover(
    previousShift,
    nextShift
) {

    if (
        handoverActive
    ) {

        return;

    }


    const previous =
        getShiftInfo(
            previousShift
        );


    const next =
        getShiftInfo(
            nextShift
        );


    const personnel =
        getPersonnel();


    const outgoing =
        personnel.filter(
            person =>

                String(
                    person.shift ||
                    ""
                ).toUpperCase() ===
                    previousShift &&

                person.status ===
                    "ON DUTY"

        );


    const incoming =
        personnel.filter(
            person =>

                String(
                    person.shift ||
                    ""
                ).toUpperCase() ===
                    nextShift

        );


    const timestamp =
        Date.now();


    handoverActive =
        true;


    const handover = {

        previousShift:
            previousShift,

        previousShiftName:
            previous?.name ||
            previousShift,

        previousShiftHours:
            previous?.hours ||
            "",

        nextShift:
            nextShift,

        nextShiftName:
            next?.name ||
            nextShift,

        nextShiftHours:
            next?.hours ||
            "",

        outgoing:
            outgoing.map(
                person => ({
                    id:
                        person.id,

                    name:
                        person.name,

                    department:
                        person.department,

                    role:
                        person.role
                })
            ),

        incoming:
            incoming.map(
                person => ({
                    id:
                        person.id,

                    name:
                        person.name,

                    department:
                        person.department,

                    role:
                        person.role
                })
            ),

        startedAt:
            timestamp,

        completedAt:
            null

    };


    Storage.set(
        "omega_active_handover_v1",
        handover
    );


    trigger(
        "personnel:shiftChanged",
        {

            previousShift,

            previousShiftName:
                previous?.name,

            nextShift,

            nextShiftName:
                next?.name,

            timestamp

        }
    );


    trigger(
        "personnel:handoverStarted",
        handover
    );


    console.log(
        "[PERSONNEL SHIFTS] Handover started.",
        handover
    );


    handoverTimer =
        setTimeout(
            () => {

                completeHandover(
                    handover
                );

            },
            HANDOVER_DURATION
        );

}


/* ==========================================================
   COMPLETE HANDOVER
========================================================== */

function completeHandover(
    handover
) {

    if (
        !handover
    ) {

        handoverActive =
            false;

        return;

    }


    const completedAt =
        Date.now();


    handover.completedAt =
        completedAt;


    Storage.set(
        "omega_active_handover_v1",
        handover
    );


    trigger(
        "personnel:handoverCompleted",
        handover
    );


    console.log(
        "[PERSONNEL SHIFTS] Handover completed.",
        handover
    );


    handoverActive =
        false;


    handoverTimer =
        null;

}


/* ==========================================================
   CHECK SHIFT
========================================================== */

function checkShift() {

    /*
     * Refresh personnel runtime first.
     * This makes sure shift/status values are current.
     */

    if (
        typeof window !==
            "undefined" &&

        window.PERSONNEL_RUNTIME &&

        typeof window.PERSONNEL_RUNTIME.update ===
            "function"
    ) {

        window.PERSONNEL_RUNTIME.update();

    }


    const nextShift =
        getCurrentShiftCode();


    /*
     * First initialization.
     */

    if (
        currentShift === null
    ) {

        currentShift =
            nextShift;

        return;

    }


    /*
     * No transition.
     */

    if (
        currentShift ===
            nextShift
    ) {

        return;

    }


    const previousShift =
        currentShift;


    currentShift =
        nextShift;


    startHandover(
        previousShift,
        nextShift
    );

}


/* ==========================================================
   STATUS
========================================================== */

export function getPersonnelShiftStatus() {

    return {

        initialized,

        currentShift,

        currentShiftInfo:
            getShiftInfo(
                currentShift
            ),

        handoverActive,

        activeHandover:
            Storage.get(
                "omega_active_handover_v1",
                null
            )

    };

}


/* ==========================================================
   FORCE SHIFT
========================================================== */

export function forcePersonnelShift(
    shiftCode
) {

    shiftCode =
        String(
            shiftCode || ""
        )
            .toUpperCase();


    if (
        !SHIFTS[shiftCode]
    ) {

        return {

            ok: false,

            error:
                "INVALID SHIFT"

        };

    }


    if (
        currentShift === null
    ) {

        currentShift =
            shiftCode;

        return {

            ok: true,

            shift:
                currentShift

        };

    }


    if (
        currentShift ===
            shiftCode
    ) {

        return {

            ok: true,

            shift:
                currentShift,

            changed:
                false

        };

    }


    const previousShift =
        currentShift;


    currentShift =
        shiftCode;


    startHandover(
        previousShift,
        shiftCode
    );


    return {

        ok: true,

        changed:
            true,

        previousShift,

        shift:
            shiftCode

    };

}


/* ==========================================================
   RESET
========================================================== */

export function resetPersonnelShiftState() {

    if (
        handoverTimer
    ) {

        clearTimeout(
            handoverTimer
        );

        handoverTimer =
            null;

    }


    currentShift =
        null;

    handoverActive =
        false;


    Storage.set(
        "omega_active_handover_v1",
        null
    );


    console.log(
        "[PERSONNEL SHIFTS] State reset."
    );

}


/* ==========================================================
   INIT
========================================================== */

export function initPersonnelShifts() {

    if (
        initialized
    ) {

        return getPersonnelShiftStatus();

    }


    initialized =
        true;


    currentShift =
        getCurrentShiftCode();


    /*
     * Check every 10 seconds.
     */

    setInterval(
        checkShift,
        10000
    );


    /*
     * Recheck after login.
     */

    on(
        "user.login",
        () => {

            checkShift();

        }
    );


    console.log(
        "[PERSONNEL SHIFTS] Initialized.",
        {
            currentShift,
            shift:
                getShiftInfo(
                    currentShift
                )
        }
    );


    return getPersonnelShiftStatus();

}


/* ==========================================================
   GLOBAL API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.PERSONNEL_SHIFTS = {

        status:
            getPersonnelShiftStatus,

        force:
            forcePersonnelShift,

        reset:
            resetPersonnelShiftState

    };

}
