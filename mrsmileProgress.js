/* ==========================================================
   MR.SMILE PROGRESS — REBUILT / SINGLE SOURCE OF ACCESS
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


const PENDING_KEYS = {

    archive:
        "mrsmile_archive_access_pending",

    game:
        "mrsmile_game_access_pending",

    truth:
        "mrsmile_truth_access_pending"

};


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
   KEYWORDS
========================================================== */

const keywordRules = [

    {

        id:
            "mirror",

        words: [

            "mirror",
            "зеркал",
            "дзеркал"

        ]

    },

    {

        id:
            "truth",

        words: [

            "truth",
            "правд",
            "истин",
            "істин"

        ]

    },

    {

        id:
            "play",

        words: [

            "play",
            "game",
            "игр",
            "грай",
            "грати"

        ]

    }

];


/* ==========================================================
   INIT
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
        "[MR.SMILE PROGRESS] Rebuilt progress initialized."
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
        normalize(
            text
        );


    if (!normalized) {

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


        if (!matched) {

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
   EVALUATE
========================================================== */

export function evaluateProgress() {

    initTrust();


    const firstContact =
        localStorage.getItem(
            "mrsmile_first_contact"
        ) ===
        "1";


    /*
       Progress only begins after First Contact.
    */

    if (
        !firstContact
    ) {

        return;

    }


    for (
        const type
        of Object.keys(
            requirements
        )
    ) {

        evaluate(
            type
        );

    }

}


/* ==========================================================
   EVALUATE ACCESS
========================================================== */

function evaluate(
    type
) {

    if (
        isUnlocked(
            type
        )
    ) {

        return;

    }


    if (
        hasPendingAccess(
            type
        )
    ) {

        return;

    }


    const requirement =
        requirements[
            type
        ];


    if (!requirement) {

        return;

    }


    if (
        getTrust() <
        requirement.trust
    ) {

        return;

    }


    if (
        !state.keywords.includes(
            requirement.keyword
        )
    ) {

        return;

    }


    createAccessRequest(
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
        isUnlocked(
            type
        )
    ) {

        return false;

    }


    if (
        hasPendingAccess(
            type
        )
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

        requestEvent(
            type
        ),

        {

            type,

            source:
                "progress",

            timestamp:
                Date.now()

        }

    );


    return true;

}


/* ==========================================================
   EVENT NAMES
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


function grantAccess(
    type
) {

    if (
        !known(
            type
        )
    ) {

        return false;

    }


    if (
        isUnlocked(
            type
        )
    ) {

        return false;

    }


    const key =
        flag(
            type
        );


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

        unlockedEvent(
            type
        ),

        {

            type,

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
        !known(
            type
        )
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

        deniedEvent(
            type
        ),

        {

            type,

            timestamp:
                Date.now()

        }

    );


    return true;

}


/* ==========================================================
   CLEAR REQUEST
========================================================== */

export function clearAccessRequest(
    type
) {

    if (
        !known(
            type
        )
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


    return true;

}


/* ==========================================================
   PENDING HELPERS
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


function hasPendingAccess(
    type
) {

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


function setPending(
    type,
    value
) {

    const key =
        PENDING_KEYS[type];


    if (!key) {

        return;

    }


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

}


/* ==========================================================
   UNLOCK STATUS
========================================================== */

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


function isUnlocked(
    type
) {

    const key =
        flag(
            type
        );


    return (
        state.flags[key] ===
        true
    );

}


/* ==========================================================
   HELPERS
========================================================== */

function flag(
    type
) {

    return (
        `${type}Unlocked`
    );

}


function known(
    type
) {

    return (

        type ===
            "archive"

        ||

        type ===
            "game"

        ||

        type ===
            "truth"

    );

}


function normalize(
    text
) {

    return String(
        text ||
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

                keywords:
                    state.keywords,

                flags:
                    state.flags,

                requests:
                    state.requests

            })

        );

    } catch (error) {

        console.warn(
            "[MR.SMILE PROGRESS] Save failed:",
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
            !raw
        ) {

            return;

        }


        const saved =
            JSON.parse(
                raw
            );


        if (
            Array.isArray(
                saved.keywords
            )
        ) {

            state.keywords =
                [
                    ...new Set(
                        saved.keywords
                    )
                ];

        }


        if (
            saved.flags
        ) {

            state.flags = {

                ...state.flags,

                ...saved.flags

            };

        }


        if (
            saved.requests
        ) {

            state.requests = {

                ...state.requests,

                ...saved.requests

            };

        }


        for (
            const type
            of Object.keys(
                PENDING_KEYS
            )
        ) {

            if (
                localStorage.getItem(
                    PENDING_KEYS[type]
                ) ===
                "1"
            ) {

                state.requests[type] =
                    true;

            }

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE PROGRESS] Load failed:",
            error
        );

    }

}


/* ==========================================================
   STATUS
========================================================== */

export function getProgressStatus() {

    return {

        initialized:
            state.initialized,

        keywords:
            [
                ...state.keywords
            ],

        flags:
            {
                ...state.flags
            },

        requests:
            {
                ...state.requests
            },

        trust:
            getTrust()

    };

}


/* ==========================================================
   RESET
========================================================== */

export function resetMrSmileProgress() {

    state.keywords =
        [];


    state.flags = {

        archiveUnlocked:
            false,

        gameUnlocked:
            false,

        truthUnlocked:
            false

    };


    state.requests = {

        archive:
            false,

        game:
            false,

        truth:
            false

    };


    save();


    Object.values(
        PENDING_KEYS
    ).forEach(
        key =>
            localStorage.removeItem(
                key
            )
    );

}


/* ==========================================================
   GLOBAL API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_PROGRESS = {

        init:
            initMrSmileProgress,

        input:
            processMrSmileInput,

        evaluate:
            evaluateProgress,

        status:
            getProgressStatus,

        grantArchive:
            grantMirrorArchiveAccess,

        grantGame:
            grantGameAccess,

        grantTruth:
            grantTruthAccess,

        deny:
            denyAccess,

        clear:
            clearAccessRequest,

        reset:
            resetMrSmileProgress

    };

}


/* ==========================================================
   DEFAULT
========================================================== */

export default {

    initMrSmileProgress,

    processMrSmileInput,

    evaluateProgress,

    getProgressStatus

};
