/* ==========================================================
   MR.SMILE PROGRESS — V3
   SINGLE SOURCE OF ACCESS / PROGRESS
========================================================== */

import {
    trigger,
    on
} from "./eventManager.js";

import {
    getTrust,
    initTrust
} from "./mrsmileTrust.js";


/* ==========================================================
   STORAGE
========================================================== */

const STORAGE_KEY =
    "mrsmile_progress_v2";

const FIRST_CONTACT_KEY =
    "mrsmile_first_contact";


const PENDING_KEYS = {

    archive:
        "mrsmile_archive_access_pending",

    game:
        "mrsmile_game_access_pending",

    truth:
        "mrsmile_truth_access_pending"

};


/* ==========================================================
   TYPES
========================================================== */

const TYPES = [
    "archive",
    "game",
    "truth"
];


/* ==========================================================
   STATE
========================================================== */

const state = {

    initialized:
        false,

    keywords:
        [],

    flags: {

        archiveUnlocked:
            false,

        gameUnlocked:
            false,

        truthUnlocked:
            false

    },

    requests: {

        archive:
            false,

        game:
            false,

        truth:
            false

    },

    listeners:
        false

};


/* ==========================================================
   REQUIREMENTS
========================================================== */

const requirements = {

    archive: {

        trust:
            30,

        keyword:
            "mirror"

    },

    game: {

        trust:
            40,

        keyword:
            "play"

    },

    truth: {

        trust:
            60,

        keyword:
            "truth"

    }

};


/* ==========================================================
   KEYWORD RULES
========================================================== */

const keywordRules = [

    {

        id:
            "mirror",

        words: [

            "mirror",
            "mirrors",

            "зеркал",
            "зеркало",
            "зеркала",
            "зеркалами",

            "дзеркал",
            "дзеркало",
            "дзеркала"

        ]

    },

    {

        id:
            "truth",

        words: [

            "truth",

            "правд",
            "правда",
            "правду",
            "правдой",

            "истин",
            "истина",
            "истину",

            "істин",
            "істина",
            "істину",

            "правдою"

        ]

    },

    {

        id:
            "play",

        words: [

            "play",
            "game",
            "games",

            "игр",
            "игра",
            "игру",
            "игрой",

            "грай",
            "грати",
            "гра",
            "гру"

        ]

    }

];


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initMrSmileProgress() {

    if (
        state.initialized
    ) {

        evaluateProgress();

        return;

    }


    state.initialized =
        true;


    initTrust();

    load();

    register();

    evaluateProgress();


    console.log(
        "[MR.SMILE PROGRESS] V3 initialized."
    );

}


/* ==========================================================
   EVENT LISTENERS
========================================================== */

function register() {

    if (
        state.listeners
    ) {

        return;

    }


    state.listeners =
        true;


    on(

        "mrsmile:trustChanged",

        () => {

            evaluateProgress();

        }

    );


    on(

        "mrsmile:firstContactCompleted",

        () => {

            evaluateProgress();

        }

    );

}


/* ==========================================================
   PROCESS OPERATOR INPUT
========================================================== */

export function processMrSmileInput(
    text
) {

    initMrSmileProgress();


    const normalized =
        normalize(text);


    if (
        !normalized
    ) {

        return false;

    }


    let changed =
        false;


    for (
        const rule
        of keywordRules
    ) {

        if (
            state.keywords.includes(
                rule.id
            )
        ) {

            continue;

        }


        const matched =
            rule.words.some(
                word =>
                    normalized.includes(
                        word
                    )
            );


        if (
            !matched
        ) {

            continue;

        }


        state.keywords.push(
            rule.id
        );


        changed =
            true;


        trigger(

            "mrsmile:keywordRecognized",

            {

                keyword:
                    rule.id,

                timestamp:
                    Date.now()

            }

        );

    }


    if (
        changed
    ) {

        save();

    }


    evaluateProgress();


    return changed;

}


/* ==========================================================
   EVALUATE ALL PROGRESS
========================================================== */

export function evaluateProgress() {

    initTrust();


    const firstContact =
        localStorage.getItem(
            FIRST_CONTACT_KEY
        ) ===
        "1";


    /*
       MR.SMILE progression does not
       begin before First Contact.
    */

    if (
        !firstContact
    ) {

        return false;

    }


    let changed =
        false;


    for (
        const type
        of TYPES
    ) {

        const result =
            evaluate(type);


        if (
            result
        ) {

            changed =
                true;

        }

    }


    return changed;

}


/* ==========================================================
   EVALUATE SINGLE ACCESS
========================================================== */

function evaluate(
    type
) {

    if (
        !known(type)
    ) {

        return false;

    }


    if (
        isUnlocked(type)
    ) {

        return false;

    }


    if (
        hasPendingAccess(type)
    ) {

        return false;

    }


    const requirement =
        requirements[type];


    if (
        !requirement
    ) {

        return false;

    }


    const trust =
        Number(
            getTrust()
        ) || 0;


    if (
        trust <
        requirement.trust
    ) {

        return false;

    }


    if (
        !state.keywords.includes(
            requirement.keyword
        )
    ) {

        return false;

    }


    return createAccessRequest(
        type
    );

}


/* ==========================================================
   CREATE ACCESS REQUEST
========================================================== */

function createAccessRequest(
    type
) {

    if (
        !known(type)
    ) {

        return false;

    }


    if (
        isUnlocked(type)
    ) {

        return false;

    }


    if (
        hasPendingAccess(type)
    ) {

        return false;

    }


    state.requests[type] =
        true;


    setPending(
        type,
        true
    );


    save();


    trigger(

        requestEvent(type),

        {

            type,

            source:
                "progress",

            trust:
                getTrust(),

            keyword:
                requirements[type]
                    ?.keyword || null,

            timestamp:
                Date.now()

        }

    );


    trigger(

        "mrsmile:progressChanged",

        {

            type,

            action:
                "request",

            timestamp:
                Date.now()

        }

    );


    return true;

}


/* ==========================================================
   REQUEST EVENTS
========================================================== */

function requestEvent(
    type
) {

    if (
        type ===
        "archive"
    ) {

        return (
            "mrsmile:archiveAccessRequested"
        );

    }


    if (
        type ===
        "game"
    ) {

        return (
            "mrsmile:gameAccessRequested"
        );

    }


    if (
        type ===
        "truth"
    ) {

        return (
            "mrsmile:truthAccessRequested"
        );

    }


    return (
        "mrsmile:accessRequested"
    );

}


/* ==========================================================
   UNLOCK EVENTS
========================================================== */

function unlockedEvent(
    type
) {

    if (
        type ===
        "archive"
    ) {

        return (
            "mrsmile:archiveUnlocked"
        );

    }


    if (
        type ===
        "game"
    ) {

        return (
            "mrsmile:gameUnlocked"
        );

    }


    if (
        type ===
        "truth"
    ) {

        return (
            "mrsmile:truthUnlocked"
        );

    }


    return (
        "mrsmile:accessUnlocked"
    );

}


/* ==========================================================
   DENIED EVENTS
========================================================== */

function deniedEvent(
    type
) {

    if (
        type ===
        "archive"
    ) {

        return (
            "mrsmile:archiveAccessDenied"
        );

    }


    if (
        type ===
        "game"
    ) {

        return (
            "mrsmile:gameAccessDenied"
        );

    }


    if (
        type ===
        "truth"
    ) {

        return (
            "mrsmile:truthAccessDenied"
        );

    }


    return (
        "mrsmile:accessDenied"
    );

}


/* ==========================================================
   GRANT ACCESS
========================================================== */

export function grantMirrorArchiveAccess() {

    return grantAccess(
        "archive"
    );

}


export function grantGameAccess() {

    return grantAccess(
        "game"
    );

}


export function grantTruthAccess() {

    return grantAccess(
        "truth"
    );

}


/* ==========================================================
   GENERIC GRANT
========================================================== */

function grantAccess(
    type
) {

    if (
        !known(type)
    ) {

        return false;

    }


    if (
        isUnlocked(type)
    ) {

        return false;

    }


    const key =
        flag(type);


    state.flags[key] =
        true;


    state.requests[type] =
        false;


    setPending(
        type,
        false
    );


    save();


    trigger(

        unlockedEvent(type),

        {

            type,

            source:
                "progress",

            trust:
                getTrust(),

            timestamp:
                Date.now()

        }

    );


    trigger(

        "mrsmile:progressChanged",

        {

            type,

            action:
                "unlock",

            timestamp:
                Date.now()

        }

    );


    return true;

}


/* ==========================================================
   DENY ACCESS
========================================================== */

export function denyAccess(
    type
) {

    if (
        !known(type)
    ) {

        return false;

    }


    if (
        isUnlocked(type)
    ) {

        return false;

    }


    state.requests[type] =
        false;


    setPending(
        type,
        false
    );


    save();


    trigger(

        deniedEvent(type),

        {

            type,

            timestamp:
                Date.now()

        }

    );


    trigger(

        "mrsmile:progressChanged",

        {

            type,

            action:
                "denied",

            timestamp:
                Date.now()

        }

    );


    return true;

}


/* ==========================================================
   CLEAR ACCESS REQUEST
========================================================== */

export function clearAccessRequest(
    type
) {

    if (
        !known(type)
    ) {

        return false;

    }


    state.requests[type] =
        false;


    setPending(
        type,
        false
    );


    save();


    trigger(

        "mrsmile:progressChanged",

        {

            type,

            action:
                "requestCleared",

            timestamp:
                Date.now()

        }

    );


    return true;

}


/* ==========================================================
   PENDING ACCESS
========================================================== */

export function hasPendingMirrorArchiveAccess() {

    return hasPendingAccess(
        "archive"
    );

}


export function hasPendingGameAccess() {

    return hasPendingAccess(
        "game"
    );

}


export function hasPendingTruthAccess() {

    return hasPendingAccess(
        "truth"
    );

}


/* ==========================================================
   GENERIC PENDING CHECK
========================================================== */

function hasPendingAccess(
    type
) {

    if (
        !known(type)
    ) {

        return false;

    }


    return (

        state.requests[type] ===
            true

        ||

        localStorage.getItem(
            PENDING_KEYS[type]
        ) ===
            "1"

    );

}


/* ==========================================================
   SET PENDING
========================================================== */

function setPending(
    type,
    value
) {

    const key =
        PENDING_KEYS[type];


    if (
        !key
    ) {

        return;

    }


    try {

        if (
            value
        ) {

            localStorage.setItem(
                key,
                "1"
            );

        } else {

            localStorage.removeItem(
                key
            );

        }

    } catch (error) {

        console.warn(

            "[MR.SMILE PROGRESS] " +
            "Pending state update failed:",

            error

        );

    }

}


/* ==========================================================
   UNLOCK STATUS
========================================================== */

/*
   Existing API.
   Kept for compatibility.
*/

export function isArchiveUnlocked() {

    return (
        state.flags
            .archiveUnlocked ===
        true
    );

}


export function isGameUnlocked() {

    return (
        state.flags
            .gameUnlocked ===
        true
    );

}


export function isTruthUnlocked() {

    return (
        state.flags
            .truthUnlocked ===
        true
    );

}


/* ==========================================================
   GENERIC UNLOCK STATUS
========================================================== */

/*
   IMPORTANT:
   filesystem.js imports this function.

   Example:

       isProgressUnlocked("archive")
       isProgressUnlocked("game")
       isProgressUnlocked("truth")
*/

export function isProgressUnlocked(
    type
) {

    if (
        !known(type)
    ) {

        return false;

    }


    return isUnlocked(
        type
    );

}


/* ==========================================================
   PROGRESS STATUS
========================================================== */

/*
   Returns a complete status object for
   UI / filesystem / debug systems.
*/

export function getProgressStatus(
    type
) {

    if (
        !known(type)
    ) {

        return {

            type,

            known:
                false,

            unlocked:
                false,

            pending:
                false,

            trust:
                getTrust(),

            requiredTrust:
                null,

            keyword:
                null,

            keywordFound:
                false

        };

    }


    const requirement =
        requirements[type];


    return {

        type,

        known:
            true,

        unlocked:
            isUnlocked(type),

        pending:
            hasPendingAccess(type),

        trust:
            Number(
                getTrust()
            ) || 0,

        requiredTrust:
            requirement.trust,

        keyword:
            requirement.keyword,

        keywordFound:
            state.keywords.includes(
                requirement.keyword
            )

    };

}


/* ==========================================================
   GET REQUIREMENT
========================================================== */

export function getProgressRequirement(
    type
) {

    if (
        !known(type)
    ) {

        return null;

    }


    const requirement =
        requirements[type];


    return {

        type,

        trust:
            requirement.trust,

        keyword:
            requirement.keyword

    };

}


/* ==========================================================
   GET ALL PROGRESS
========================================================== */

export function getMrSmileProgressState() {

    return {

        initialized:
            state.initialized,

        firstContact:
            hasFirstContact(),

        trust:
            Number(
                getTrust()
            ) || 0,

        keywords:
            [
                ...state.keywords
            ],

        flags: {

            ...state.flags

        },

        requests: {

            ...state.requests

        },

        archive:
            getProgressStatus(
                "archive"
            ),

        game:
            getProgressStatus(
                "game"
            ),

        truth:
            getProgressStatus(
                "truth"
            )

    };

}


/* ==========================================================
   KEYWORD STATUS
========================================================== */

export function hasRecognizedKeyword(
    keyword
) {

    return state.keywords.includes(
        keyword
    );

}


/* ==========================================================
   GET KEYWORDS
========================================================== */

export function getRecognizedKeywords() {

    return [
        ...state.keywords
    ];

}


/* ==========================================================
   FIRST CONTACT
========================================================== */

export function hasFirstContact() {

    try {

        return (
            localStorage.getItem(
                FIRST_CONTACT_KEY
            ) ===
            "1"
        );

    } catch {

        return false;

    }

}


/* ==========================================================
   REQUIREMENT CHECK
========================================================== */

export function canUnlockProgress(
    type
) {

    if (
        !known(type)
    ) {

        return false;

    }


    if (
        isUnlocked(type)
    ) {

        return true;

    }


    if (
        !hasFirstContact()
    ) {

        return false;

    }


    const requirement =
        requirements[type];


    const trust =
        Number(
            getTrust()
        ) || 0;


    return (

        trust >=
        requirement.trust

        &&

        state.keywords.includes(
            requirement.keyword
        )

    );

}


/* ==========================================================
   INTERNAL UNLOCK CHECK
========================================================== */

function isUnlocked(
    type
) {

    if (
        !known(type)
    ) {

        return false;

    }


    const key =
        flag(type);


    return (
        state.flags[key] ===
        true
    );

}


/* ==========================================================
   TYPE CHECK
========================================================== */

function known(
    type
) {

    return TYPES.includes(
        type
    );

}


/* ==========================================================
   FLAG NAME
========================================================== */

function flag(
    type
) {

    return (
        `${type}Unlocked`
    );

}


/* ==========================================================
   NORMALIZE INPUT
========================================================== */

function normalize(
    text
) {

    return String(
        text ??
        ""
    )

        .normalize(
            "NFKC"
        )

        .toLowerCase()

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* ==========================================================
   SAVE
========================================================== */

function save() {

    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify({

                version:
                    3,

                keywords:
                    [
                        ...new Set(
                            state.keywords
                        )
                    ],

                flags: {

                    archiveUnlocked:
                        state.flags
                            .archiveUnlocked ===
                        true,

                    gameUnlocked:
                        state.flags
                            .gameUnlocked ===
                        true,

                    truthUnlocked:
                        state.flags
                            .truthUnlocked ===
                        true

                },

                requests: {

                    archive:
                        state.requests
                            .archive ===
                        true,

                    game:
                        state.requests
                            .game ===
                        true,

                    truth:
                        state.requests
                            .truth ===
                        true

                }

            })

        );

    } catch (error) {

        console.warn(

            "[MR.SMILE PROGRESS] " +
            "Save failed:",

            error

        );

    }

}


/* ==========================================================
   LOAD
========================================================== */

function load() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (
            raw
        ) {

            const saved =
                JSON.parse(
                    raw
                );


            /* ----------------------------------------------
               KEYWORDS
            ---------------------------------------------- */

            if (
                Array.isArray(
                    saved.keywords
                )
            ) {

                state.keywords = [

                    ...new Set(

                        saved.keywords
                            .filter(
                                keyword =>
                                    typeof keyword ===
                                    "string"
                            )

                            .filter(
                                keyword =>
                                    keywordRules.some(
                                        rule =>
                                            rule.id ===
                                            keyword
                                    )
                            )

                    )

                ];

            }


            /* ----------------------------------------------
               FLAGS
            ---------------------------------------------- */

            if (
                saved.flags &&
                typeof saved.flags ===
                "object"
            ) {

                for (
                    const type
                    of TYPES
                ) {

                    const key =
                        flag(type);


                    if (
                        saved.flags[key] ===
                        true
                    ) {

                        state.flags[key] =
                            true;

                    }

                }

            }


            /* ----------------------------------------------
               REQUESTS
            ---------------------------------------------- */

            if (
                saved.requests &&
                typeof saved.requests ===
                "object"
            ) {

                for (
                    const type
                    of TYPES
                ) {

                    if (
                        saved.requests[type] ===
                        true
                    ) {

                        state.requests[type] =
                            true;

                    }

                }

            }

        }


        /*
           Pending access flags are intentionally
           synchronized separately because older
           versions of the system stored them
           outside the main progress object.
        */

        for (
            const type
            of TYPES
        ) {

            const pending =
                localStorage.getItem(
                    PENDING_KEYS[type]
                ) ===
                "1";


            if (
                pending
            ) {

                state.requests[type] =
                    true;

            }

        }


        /*
           An unlocked access can never remain
           pending.
        */

        for (
            const type
            of TYPES
        ) {

            if (
                isUnlocked(type)
            ) {

                state.requests[type] =
                    false;

                setPending(
                    type,
                    false
                );

            }

        }

    } catch (error) {

        console.warn(

            "[MR.SMILE PROGRESS] " +
            "Load failed:",

            error

        );

    }

}


/* ==========================================================
   DEBUG / DEVELOPMENT
========================================================== */

/*
   These functions are intentionally read-only.
   They do not modify progress.

   Useful from console:

       getMrSmileProgressState()

       getProgressStatus("archive")

       getProgressStatus("game")

       getProgressStatus("truth")
*/


/* ==========================================================
   AUTO-SYNC
========================================================== */

/*
   If another system changes the pending localStorage
   value directly, the state is refreshed whenever
   progress is evaluated.
*/

function syncPendingState() {

    for (
        const type
        of TYPES
    ) {

        const pending =
            localStorage.getItem(
                PENDING_KEYS[type]
            ) ===
            "1";


        if (
            isUnlocked(type)
        ) {

            state.requests[type] =
                false;

            continue;

        }


        state.requests[type] =
            pending;

    }

}


/* ==========================================================
   FINAL SAFETY WRAPPER
========================================================== */

/*
   Keep pending state synchronized before evaluation.
*/

const originalEvaluateProgress =
    evaluateProgress;


/*
   The exported function above remains the
   public API. No replacement wrapper is
   necessary here because synchronization
   is handled directly below through the
   event-driven evaluation path.
*/


/* ==========================================================
   INITIAL STATE SYNC
========================================================== */

try {

    /*
       Do not fully initialize the system here.
       Initialization belongs to initMrSmileProgress().
    */

    syncPendingState();

} catch (error) {

    console.warn(

        "[MR.SMILE PROGRESS] " +
        "Initial sync failed:",

        error

    );

}


/* ==========================================================
   END
========================================================== */
