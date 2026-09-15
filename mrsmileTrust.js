
/* ==========================================================
   MR.SMILE TRUST SYSTEM — V4
   OMEGA / MIRROR-INT

   RESPONSIBILITY
   ----------------------------------------------------------
   This module owns ONLY the Trust relationship value.

   It DOES:
   - load / save Trust
   - add / remove / set Trust
   - clamp Trust between -100 and 100
   - calculate relationship level
   - expose Trust conditions
   - emit Trust change events
   - emit Trust level change events

   It DOES NOT:
   - generate dialogue
   - generate MR.SMILE responses
   - process chat messages
   - control progression
   - unlock files directly
   - render UI

   ARCHITECTURE:

       event / action
            ↓
       addTrust / removeTrust / setTrust
            ↓
       Trust state
            ↓
       mrsmile:trustChanged
            ↓
       mrsmileProgress.js

   IMPORTANT:

   A real Trust change creates ONE trustChanged event.

   Setting the same value does NOT create a fake change event.

========================================================== */


/* ==========================================================
   STORAGE
========================================================== */

const STORAGE_KEY =
    "mrsmileTrust";


const MIN_TRUST =
    -100;


const MAX_TRUST =
    100;


/* ==========================================================
   STATE
========================================================== */

let trust =
    0;

let initialized =
    false;


/* ==========================================================
   TRUST LEVELS
========================================================== */

const levels = [

    {
        id:
            0,

        name:
            "UNKNOWN",

        min:
            -999
    },

    {
        id:
            1,

        name:
            "OBSERVED",

        min:
            5
    },

    {
        id:
            2,

        name:
            "INTERESTING",

        min:
            15
    },

    {
        id:
            3,

        name:
            "TRUSTED",

        min:
            30
    },

    {
        id:
            4,

        name:
            "ALLY",

        min:
            50
    },

    {
        id:
            5,

        name:
            "FRIEND",

        min:
            80
    }

];


/* ==========================================================
   INTERNAL HELPERS
========================================================== */

function clampTrust(
    value
) {

    return Math.max(
        MIN_TRUST,
        Math.min(
            MAX_TRUST,
            value
        )
    );

}


function safeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? number
        : fallback;

}


function storageAvailable() {

    try {

        return (
            typeof localStorage !==
            "undefined"
        );

    } catch {

        return false;

    }

}


/* ==========================================================
   SAVE
========================================================== */

export function saveTrust() {

    if (
        !storageAvailable()
    ) {

        return false;

    }


    try {

        localStorage.setItem(

            STORAGE_KEY,

            String(
                clampTrust(
                    trust
                )
            )

        );


        return true;

    } catch (error) {

        console.error(
            "[MR.SMILE TRUST] Failed to save:",
            error
        );


        return false;

    }

}


/* ==========================================================
   LOAD
========================================================== */

export function loadTrust() {

    if (
        !storageAvailable()
    ) {

        trust =
            0;

        return trust;

    }


    try {

        const value =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (
            value === null
        ) {

            trust =
                0;

            return trust;

        }


        const parsed =
            Number(
                value
            );


        if (
            !Number.isFinite(
                parsed
            )
        ) {

            console.warn(
                "[MR.SMILE TRUST] Invalid stored value. Resetting."
            );


            trust =
                0;


            saveTrust();


            return trust;

        }


        trust =
            clampTrust(
                parsed
            );


    } catch (error) {

        console.error(
            "[MR.SMILE TRUST] Failed to load:",
            error
        );


        trust =
            0;

    }


    return trust;

}


/* ==========================================================
   INIT
========================================================== */

export function initTrust() {

    if (
        initialized
    ) {

        return trust;

    }


    loadTrust();


    initialized =
        true;


    /*
     * Ensure the current valid value exists in storage.
     */
    saveTrust();


    console.log(
        "[MR.SMILE TRUST] Initialized:",
        trust,
        getTrustName()
    );


    return trust;

}


/* ==========================================================
   GET TRUST
========================================================== */

export function getTrust() {

    initTrust();

    return trust;

}


/* ==========================================================
   SET TRUST
========================================================== */

export function setTrust(
    value
) {

    initTrust();


    const numericValue =
        Number(
            value
        );


    if (
        !Number.isFinite(
            numericValue
        )
    ) {

        return trust;

    }


    const previousTrust =
        trust;


    const nextTrust =
        clampTrust(
            numericValue
        );


    /*
     * No actual change:
     * do not emit fake events.
     */
    if (
        nextTrust ===
        previousTrust
    ) {

        return trust;

    }


    trust =
        nextTrust;


    saveTrust();


    console.log(
        "[MR.SMILE] Trust manually set:",
        previousTrust,
        "→",
        trust
    );


    emitTrustChanged(
        previousTrust,
        trust,
        "SET"
    );


    return trust;

}


/* ==========================================================
   ADD TRUST
========================================================== */

export function addTrust(
    amount,
    reason = ""
) {

    initTrust();


    const numericAmount =
        Number(
            amount
        );


    if (
        !Number.isFinite(
            numericAmount
        )
    ) {

        return trust;

    }


    /*
     * No-op change.
     */
    if (
        numericAmount ===
        0
    ) {

        return trust;

    }


    const previousTrust =
        trust;


    const nextTrust =
        clampTrust(
            trust +
            numericAmount
        );


    /*
     * The requested change can be non-zero
     * but clamping may leave Trust unchanged.
     *
     * Example:
     * trust = 100
     * addTrust(5)
     */
    if (
        nextTrust ===
        previousTrust
    ) {

        return trust;

    }


    trust =
        nextTrust;


    saveTrust();


    console.log(
        "[MR.SMILE] Trust:",
        previousTrust,
        "→",
        trust,
        reason
    );


    emitTrustChanged(
        previousTrust,
        trust,
        reason || "ADD"
    );


    return trust;

}


/* ==========================================================
   REMOVE TRUST
========================================================== */

export function removeTrust(
    amount,
    reason = ""
) {

    const numericAmount =
        Number(
            amount
        );


    if (
        !Number.isFinite(
            numericAmount
        )
    ) {

        return getTrust();

    }


    return addTrust(
        -Math.abs(
            numericAmount
        ),
        reason
    );

}


/* ==========================================================
   TRUST CHANGE EVENT
========================================================== */

function emitTrustChanged(
    previousTrust,
    currentTrust,
    reason = ""
) {

    const difference =
        currentTrust -
        previousTrust;


    /*
     * Safety:
     * there is no Trust event without a real change.
     */
    if (
        difference ===
        0
    ) {

        return false;

    }


    triggerTrustChanged(
        {
            previous:
                previousTrust,

            current:
                currentTrust,

            difference,

            reason:
                reason || ""

        }
    );


    checkTrustLevelChange(
        previousTrust,
        currentTrust
    );


    return true;

}


/* ==========================================================
   EVENT DISPATCH
========================================================== */

function triggerTrustChanged(
    payload
) {

    try {

        /*
         * Import is static at module level.
         */
        trigger(
            "mrsmile:trustChanged",
            {
                ...payload
            }
        );

        return true;

    } catch (error) {

        console.error(
            "[MR.SMILE TRUST] Trust event failed:",
            error
        );

        return false;

    }

}


/* ==========================================================
   TRUST LEVEL
========================================================== */

export function getTrustLevel() {

    initTrust();


    let current =
        levels[0];


    for (
        const level
        of levels
    ) {

        if (
            trust >=
            level.min
        ) {

            current =
                level;

        }

    }


    return {
        ...current
    };

}


/* ==========================================================
   TRUST LEVEL NAME
========================================================== */

export function getTrustName() {

    return getTrustLevel().name;

}


/* ==========================================================
   TRUST LEVEL ID
========================================================== */

export function getTrustLevelId() {

    return getTrustLevel().id;

}


/* ==========================================================
   FIND LEVEL FOR VALUE
========================================================== */

function getLevelForValue(
    value
) {

    const numericValue =
        clampTrust(
            safeNumber(
                value,
                0
            )
        );


    let current =
        levels[0];


    for (
        const level
        of levels
    ) {

        if (
            numericValue >=
            level.min
        ) {

            current =
                level;

        }

    }


    return {
        ...current
    };

}


/* ==========================================================
   LEVEL CHANGE
========================================================== */

function checkTrustLevelChange(
    previous,
    current
) {

    const previousLevel =
        getLevelForValue(
            previous
        );


    const currentLevel =
        getLevelForValue(
            current
        );


    if (
        previousLevel.id ===
        currentLevel.id
    ) {

        return false;

    }


    console.log(
        "[MR.SMILE TRUST] Level changed:",
        previousLevel.name,
        "→",
        currentLevel.name
    );


    try {

        trigger(
            "mrsmile:trustLevelChanged",
            {

                previous:
                    previousLevel,

                current:
                    currentLevel,

                previousTrust:
                    previous,

                trust:
                    current

            }
        );


        return true;

    } catch (error) {

        console.error(
            "[MR.SMILE TRUST] Trust level event failed:",
            error
        );


        return false;

    }

}


/* ==========================================================
   RELATIONSHIP CHECKS
========================================================== */

export function isTrusted() {

    return getTrust() >=
        30;

}


export function isAlly() {

    return getTrust() >=
        50;

}


export function isFriend() {

    return getTrust() >=
        80;

}


export function isHostile() {

    return getTrust() < 0;

}


/* ==========================================================
   REVEAL CONDITIONS
========================================================== */

export function canRevealSecrets() {

    return getTrust() >=
        20;

}


export function canRevealLore() {

    return getTrust() >=
        10;

}


export function canUnlockFiles() {

    return getTrust() >=
        30;

}


export function canGiveGame() {

    return getTrust() >=
        40;

}


export function canTellTruth() {

    return getTrust() >=
        60;

}


/* ==========================================================
   REWARDS
========================================================== */

export function reward(
    event
) {

    switch (
        event
    ) {

        case "READ_FILE":

            addTrust(
                1,
                event
            );

            break;


        case "READ_SECRET":

            addTrust(
                2,
                event
            );

            break;


        case "HELP_SYSTEM":

            addTrust(
                3,
                event
            );

            break;


        case "OPEN_ARCHIVE":

            addTrust(
                2,
                event
            );

            break;


        case "RETURN_NIGHT":

            addTrust(
                5,
                event
            );

            break;


        default:

            console.warn(
                "[MR.SMILE TRUST] Unknown reward:",
                event
            );

            break;

    }

}


/* ==========================================================
   PUNISHMENTS
========================================================== */

export function punish(
    event
) {

    switch (
        event
    ) {

        case "SPAM":

            removeTrust(
                3,
                event
            );

            break;


        case "ATTACK_SYSTEM":

            removeTrust(
                10,
                event
            );

            break;


        case "IGNORE_WARNING":

            removeTrust(
                5,
                event
            );

            break;


        case "DELETE_FILE":

            removeTrust(
                20,
                event
            );

            break;


        default:

            console.warn(
                "[MR.SMILE TRUST] Unknown punishment:",
                event
            );

            break;

    }

}


/* ==========================================================
   RESET
========================================================== */

export function resetTrust() {

    initTrust();


    const previousTrust =
        trust;


    /*
     * Reset internal value first.
     */
    trust =
        0;


    saveTrust();


    console.log(
        "[MR.SMILE TRUST] Reset:",
        previousTrust,
        "→",
        0
    );


    /*
     * Emit only when a real reset happened.
     */
    if (
        previousTrust !==
        0
    ) {

        emitTrustChanged(
            previousTrust,
            0,
            "RESET"
        );

    }


    return trust;

}


/* ==========================================================
   STATUS
========================================================== */

export function getTrustStatus() {

    initTrust();


    const level =
        getTrustLevel();


    return {

        value:
            trust,

        level,

        name:
            level.name,

        levelId:
            level.id,

        trusted:
            isTrusted(),

        ally:
            isAlly(),

        friend:
            isFriend(),

        hostile:
            isHostile(),

        canRevealSecrets:
            canRevealSecrets(),

        canRevealLore:
            canRevealLore(),

        canUnlockFiles:
            canUnlockFiles(),

        canGiveGame:
            canGiveGame(),

        canTellTruth:
            canTellTruth()

    };

}


/* ==========================================================
   IMPORT
   ----------------------------------------------------------
   Kept at the bottom of the logical declaration section
   for readability in this rebuilt file.
========================================================== */

import {
    trigger
} from "./eventManager.js";


/* ==========================================================
   WINDOW DEBUG API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.debugTrust = {

        get:
            getTrust,

        set:
            setTrust,

        add:
            addTrust,

        remove:
            removeTrust,

        reward:
            reward,

        punish:
            punish,

        init:
            initTrust,

        status:
            getTrustStatus,

        level:
            getTrustLevel,

        levelId:
            getTrustLevelId,

        reset:
            resetTrust

    };

}


/* ==========================================================
   AUTO INITIALIZATION
========================================================== */

try {

    initTrust();

} catch (error) {

    console.error(
        "[MR.SMILE TRUST] Initialization failed:",
        error
    );

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default {

    initTrust,

    loadTrust,

    saveTrust,

    getTrust,

    setTrust,

    addTrust,

    removeTrust,

    getTrustLevel,

    getTrustName,

    getTrustLevelId,

    isTrusted,

    isAlly,

    isFriend,

    isHostile,

    canRevealSecrets,

    canRevealLore,

    canUnlockFiles,

    canGiveGame,

    canTellTruth,

    reward,

    punish,

    resetTrust,

    getTrustStatus

};
