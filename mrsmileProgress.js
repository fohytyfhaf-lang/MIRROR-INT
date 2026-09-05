// =======================================
// MR.SMILE PROGRESSION SYSTEM
// OMEGA SYSTEM
// =======================================
//
// RESPONSIBILITY:
//
// This module tracks:
// - discovered keywords
// - progression requirements
// - access requests
// - unlocked content
//
// IMPORTANT:
//
// This module does NOT decide what MR.SMILE
// wants to do.
//
// It only detects:
//
// "The operator has reached the requirements."
//
// MR.SMILE can then decide:
//
// GRANT
// DENY
// DELAY
//
// =======================================


import {
    trigger,
    on
} from "./eventManager.js";

import {
    getTrust,
    initTrust
} from "./mrsmileTrust.js";


// =======================================
// STORAGE
// =======================================

const STORAGE_KEY =
    "mrsmile_progress";

const ARCHIVE_PENDING_KEY =
    "mrsmile_archive_access_pending";

const GAME_PENDING_KEY =
    "mrsmile_game_access_pending";

const TRUTH_PENDING_KEY =
    "mrsmile_truth_access_pending";


// =======================================
// STATE
// =======================================

const state = {

    keywords: [],

    flags: {

        archiveUnlocked: false,

        gameUnlocked: false,

        truthUnlocked: false

    },

    requests: {

        archive: false,

        game: false,

        truth: false

    }

};


// =======================================
// INITIALIZATION
// =======================================

let initialized = false;

let trustListenerRegistered = false;


// =======================================
// KEYWORD RULES
// =======================================
//
// Hidden from the operator.
//
// These are not unlock commands.
//
// They only indicate that the operator
// has shown interest in a specific subject.
// =======================================

const keywordRules = [

    {
        id: "mirror",

        words: [

            "mirror",
            "зеркало",
            "зеркал"

        ]

    },

    {
        id: "truth",

        words: [

            "truth",
            "правда",
            "истина"

        ]

    },

    {
        id: "play",

        words: [

            "play",
            "играть",
            "игра",
            "game"

        ]

    }

];


// =======================================
// REQUIREMENTS
// =======================================

const REQUIREMENTS = {

    archive: {

        trust: 30,

        keyword: "mirror"

    },

    game: {

        trust: 40,

        keyword: "play"

    },

    truth: {

        trust: 60,

        keyword: "truth"

    }

};


// =======================================
// INIT
// =======================================

export function initMrSmileProgress() {

    if (initialized) {

        evaluateProgress();

        return;

    }


    initialized = true;


    // -----------------------------------
    // TRUST
    // -----------------------------------

    initTrust();


    // -----------------------------------
    // LOAD
    // -----------------------------------

    loadProgress();


    // -----------------------------------
    // TRUST LISTENER
    // -----------------------------------

    registerTrustListener();


    // -----------------------------------
    // INITIAL EVALUATION
    // -----------------------------------

    evaluateProgress();


    console.log(
        "[MR.SMILE PROGRESS] Initialized"
    );

}


// =======================================
// TRUST LISTENER
// =======================================

function registerTrustListener() {

    if (trustListenerRegistered)
        return;


    trustListenerRegistered = true;


    on(
        "mrsmile:trustChanged",

        () => {

            console.log(
                "[MR.SMILE PROGRESS] Trust changed. Re-evaluating."
            );


            evaluateProgress();

        }

    );

}


// =======================================
// PROCESS MR.SMILE INPUT
// =======================================
//
// Called by MR.SMILE chat.
//
// Example:
//
// processMrSmileInput("I want to know the truth.")
//
// =======================================

export function processMrSmileInput(text) {

    if (!text)
        return;


    initMrSmileProgress();


    const normalized =
        normalize(text);


    let changed = false;


    // ===================================
    // KEYWORD DETECTION
    // ===================================

    for (const rule of keywordRules) {

        // Already discovered
        if (
            state.keywords.includes(
                rule.id
            )
        ) {

            continue;

        }


        if (
            !matchesKeyword(
                normalized,
                rule.words
            )
        ) {

            continue;

        }


        // --------------------------------
        // SAVE DISCOVERY
        // --------------------------------

        state.keywords.push(
            rule.id
        );


        changed = true;


        console.log(
            "[MR.SMILE PROGRESS] Keyword recognized:",
            rule.id
        );


        // --------------------------------
        // EVENT
        // --------------------------------

        trigger(
            "mrsmile:keywordRecognized",
            {
                keyword: rule.id
            }
        );

    }


    // ===================================
    // SAVE
    // ===================================

    if (changed) {

        saveProgress();

    }


    // ===================================
    // EVALUATE
    // ===================================

    evaluateProgress();

}


// =======================================
// EVALUATE PROGRESS
// =======================================
//
// This function NEVER directly grants
// content.
//
// It only creates a request when the
// operator satisfies the requirements.
// =======================================

export function evaluateProgress() {

    initTrust();


    const trust =
        getTrust();


    const firstContact =
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1";


    // ===================================
    // BEFORE FIRST CONTACT
    // ===================================
    //
    // MR.SMILE progression does not begin
    // before First Contact.
// =======================================

    if (!firstContact) {

        return;

    }


    // ===================================
    // ARCHIVE
    // ===================================

    evaluateAccessRequest(
        "archive",
        trust
    );


    // ===================================
    // GAME
    // ===================================

    evaluateAccessRequest(
        "game",
        trust
    );


    // ===================================
    // TRUTH
    // ===================================

    evaluateAccessRequest(
        "truth",
        trust
    );

}


// =======================================
// EVALUATE SINGLE ACCESS REQUEST
// =======================================

function evaluateAccessRequest(
    type,
    trust
) {

    const requirement =
        REQUIREMENTS[type];


    if (!requirement)
        return;


    // -----------------------------------
    // Already unlocked
    // -----------------------------------

    if (
        isUnlocked(type)
    ) {

        return;

    }


    // -----------------------------------
    // Already waiting
    // -----------------------------------

    if (
        hasPendingAccess(type)
    ) {

        return;

    }


    // -----------------------------------
    // Trust requirement
    // -----------------------------------

    if (
        trust <
        requirement.trust
    ) {

        return;

    }


    // -----------------------------------
    // Keyword requirement
    // -----------------------------------

    if (
        !state.keywords.includes(
            requirement.keyword
        )
    ) {

        return;

    }


    // -----------------------------------
    // Requirements satisfied
    // -----------------------------------

    createAccessRequest(type);

}


// =======================================
// CREATE ACCESS REQUEST
// =======================================
//
// This is the important difference from
// the old system.
//
// Meeting requirements does NOT unlock
// anything.
//
// It creates a request for MR.SMILE.
// =======================================

function createAccessRequest(type) {

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


    setPendingStorage(
        type,
        true
    );


    saveProgress();


    console.log(
        "[MR.SMILE PROGRESS] Access request created:",
        type
    );


    trigger(
        getRequestEvent(type)
    );


    return true;

}


// =======================================
// REQUEST EVENT
// =======================================

function getRequestEvent(type) {

    switch (type) {

        case "archive":

            return "mrsmile:archiveAccessRequested";


        case "game":

            return "mrsmile:gameAccessRequested";


        case "truth":

            return "mrsmile:truthAccessRequested";


        default:

            return "mrsmile:accessRequested";

    }

}


// =======================================
// GRANT ACCESS
// =======================================
//
// These functions are called by MR.SMILE.
//
// Progress itself does not make the decision.
// =======================================

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


// =======================================
// GENERIC GRANT
// =======================================

function grantAccess(type) {

    if (
        isUnlocked(type)
    ) {

        return false;

    }


    state.flags[
        getFlagName(type)
    ] = true;


    state.requests[type] =
        false;


    setPendingStorage(
        type,
        false
    );


    saveProgress();


    console.log(
        "[MR.SMILE] Access granted:",
        type
    );


    trigger(
        getUnlockedEvent(type)
    );


    return true;

}


// =======================================
// DENY ACCESS
// =======================================
//
// Denial does not erase progression.
//
// The operator can potentially request
// access again later if MR.SMILE changes
// his decision.
// =======================================

export function denyAccess(type) {

    if (
        !isKnownAccessType(type)
    ) {

        return false;

    }


    state.requests[type] =
        false;


    setPendingStorage(
        type,
        false
    );


    saveProgress();


    console.log(
        "[MR.SMILE] Access denied:",
        type
    );


    trigger(
        getDeniedEvent(type)
    );


    return true;

}


// =======================================
// CLEAR ACCESS REQUEST
// =======================================
//
// Useful when MR.SMILE wants to postpone
// a decision without permanently denying.
// =======================================

export function clearAccessRequest(type) {

    if (
        !isKnownAccessType(type)
    ) {

        return false;

    }


    state.requests[type] =
        false;


    setPendingStorage(
        type,
        false
    );


    saveProgress();


    return true;

}


// =======================================
// REQUEST EVENT NAMES
// =======================================

function getDeniedEvent(type) {

    switch (type) {

        case "archive":

            return "mrsmile:archiveAccessDenied";


        case "game":

            return "mrsmile:gameAccessDenied";


        case "truth":

            return "mrsmile:truthAccessDenied";


        default:

            return "mrsmile:accessDenied";

    }

}


// =======================================
// UNLOCK EVENT NAMES
// =======================================

function getUnlockedEvent(type) {

    switch (type) {

        case "archive":

            return "mrsmile:archiveUnlocked";


        case "game":

            return "mrsmile:gameUnlocked";


        case "truth":

            return "mrsmile:truthUnlocked";


        default:

            return "mrsmile:accessUnlocked";

    }

}


// =======================================
// FLAG NAME
// =======================================

function getFlagName(type) {

    switch (type) {

        case "archive":

            return "archiveUnlocked";


        case "game":

            return "gameUnlocked";


        case "truth":

            return "truthUnlocked";


        default:

            return null;

    }

}


// =======================================
// ACCESS TYPE CHECK
// =======================================

function isKnownAccessType(type) {

    return (

        type === "archive" ||

        type === "game" ||

        type === "truth"

    );

}


// =======================================
// UNLOCK CHECK
// =======================================

function isUnlocked(type) {

    const flag =
        getFlagName(type);


    if (!flag)
        return false;


    return (
        state.flags[flag] === true
    );

}


// =======================================
// PENDING CHECK
// =======================================

function hasPendingAccess(type) {

    if (
        !isKnownAccessType(type)
    ) {

        return false;

    }


    return (
        state.requests[type] === true
        ||
        getPendingStorage(type)
    );

}


// =======================================
// STORAGE PENDING
// =======================================

function setPendingStorage(
    type,
    value
) {

    const key =
        getPendingStorageKey(type);


    if (!key)
        return;


    if (value) {

        localStorage.setItem(
            key,
            "1"
        );

    }
    else {

        localStorage.removeItem(
            key
        );

    }

}


// =======================================
// GET PENDING STORAGE
// =======================================

function getPendingStorage(type) {

    const key =
        getPendingStorageKey(type);


    if (!key)
        return false;


    return (
        localStorage.getItem(key)
        === "1"
    );

}


// =======================================
// PENDING STORAGE KEY
// =======================================

function getPendingStorageKey(type) {

    switch (type) {

        case "archive":

            return ARCHIVE_PENDING_KEY;


        case "game":

            return GAME_PENDING_KEY;


        case "truth":

            return TRUTH_PENDING_KEY;


        default:

            return null;

    }

}


// =======================================
// LEGACY ARCHIVE API
// =======================================
//
// Kept for compatibility with existing
// MR.SMILE modules.
// =======================================

export function requestMirrorArchiveAccess() {

    initMrSmileProgress();


    return createAccessRequest(
        "archive"
    );

}


export function hasPendingMirrorArchiveAccess() {

    return hasPendingAccess(
        "archive"
    );

}


// =======================================
// GENERIC REQUEST STATUS
// =======================================

export function hasPendingAccessRequest(
    type
) {

    initMrSmileProgress();


    return hasPendingAccess(
        type
    );

}


// =======================================
// KEYWORD CHECK
// =======================================

export function hasKeyword(
    keyword
) {

    initMrSmileProgress();


    return state.keywords.includes(
        keyword
    );

}


// =======================================
// PROGRESS UNLOCK CHECK
// =======================================

export function isProgressUnlocked(
    flag
) {

    initMrSmileProgress();


    switch (flag) {

        case "archive":

            return state.flags.archiveUnlocked;


        case "game":

            return state.flags.gameUnlocked;


        case "truth":

            return state.flags.truthUnlocked;


        default:

            return false;

    }

}


// =======================================
// GET COMPLETE PROGRESS
// =======================================

export function getMrSmileProgress() {

    initMrSmileProgress();


    return {

        keywords: [
            ...state.keywords
        ],

        flags: {

            ...state.flags

        },

        requests: {

            archive:
                hasPendingAccess("archive"),

            game:
                hasPendingAccess("game"),

            truth:
                hasPendingAccess("truth")

        }

    };

}


// =======================================
// GET PROGRESS STATUS
// =======================================

export function getMrSmileProgressStatus() {

    initMrSmileProgress();


    return {

        trust:
            getTrust(),

        firstContact:
            localStorage.getItem(
                "mrsmile_first_contact"
            ) === "1",


        keywords: [
            ...state.keywords
        ],


        archiveAccessPending:
            hasPendingAccess(
                "archive"
            ),

        gameAccessPending:
            hasPendingAccess(
                "game"
            ),

        truthAccessPending:
            hasPendingAccess(
                "truth"
            ),


        archiveUnlocked:
            state.flags.archiveUnlocked,

        gameUnlocked:
            state.flags.gameUnlocked,

        truthUnlocked:
            state.flags.truthUnlocked

    };

}


// =======================================
// RESET PROGRESS
// =======================================

export function resetMrSmileProgress() {

    state.keywords = [];


    state.flags.archiveUnlocked =
        false;

    state.flags.gameUnlocked =
        false;

    state.flags.truthUnlocked =
        false;


    state.requests.archive =
        false;

    state.requests.game =
        false;

    state.requests.truth =
        false;


    localStorage.removeItem(
        STORAGE_KEY
    );


    localStorage.removeItem(
        ARCHIVE_PENDING_KEY
    );


    localStorage.removeItem(
        GAME_PENDING_KEY
    );


    localStorage.removeItem(
        TRUTH_PENDING_KEY
    );


    console.log(
        "[MR.SMILE PROGRESS] Progress reset."
    );


    trigger(
        "mrsmile:progressReset"
    );

}


// =======================================
// NORMALIZE TEXT
// =======================================

function normalize(text) {

    return String(text)

        .toLowerCase()

        .replace(
            /[.,!?;:()[\]{}"'`]/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// =======================================
// MATCH KEYWORD
// =======================================

function matchesKeyword(
    text,
    words
) {

    return words.some(word => {

        const normalizedWord =
            normalize(word);


        return (

            text ===
            normalizedWord

            ||

            text.includes(
                " " +
                normalizedWord +
                " "
            )

            ||

            text.startsWith(
                normalizedWord +
                " "
            )

            ||

            text.endsWith(
                " " +
                normalizedWord
            )

        );

    });

}


// =======================================
// SAVE PROGRESS
// =======================================

function saveProgress() {

    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify({

                keywords:
                    state.keywords,

                flags: {

                    archiveUnlocked:
                        state.flags.archiveUnlocked,

                    gameUnlocked:
                        state.flags.gameUnlocked,

                    truthUnlocked:
                        state.flags.truthUnlocked

                },

                requests: {

                    archive:
                        state.requests.archive,

                    game:
                        state.requests.game,

                    truth:
                        state.requests.truth

                }

            })

        );

    }
    catch (error) {

        console.error(
            "[MR.SMILE PROGRESS] Failed to save progress.",
            error
        );

    }

}


// =======================================
// LOAD PROGRESS
// =======================================

function loadProgress() {

    const raw =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!raw)
        return;


    try {

        const saved =
            JSON.parse(raw);


        // --------------------------------
        // KEYWORDS
        // --------------------------------

        if (
            Array.isArray(
                saved.keywords
            )
        ) {

            state.keywords = [

                ...new Set(
                    saved.keywords
                )

            ];

        }


        // --------------------------------
        // FLAGS
        // --------------------------------

        if (
            saved.flags
        ) {

            state.flags.archiveUnlocked =
                saved.flags.archiveUnlocked === true;


            state.flags.gameUnlocked =
                saved.flags.gameUnlocked === true;


            state.flags.truthUnlocked =
                saved.flags.truthUnlocked === true;

        }


        // --------------------------------
        // REQUESTS
        // --------------------------------

        if (
            saved.requests
        ) {

            state.requests.archive =
                saved.requests.archive === true;


            state.requests.game =
                saved.requests.game === true;


            state.requests.truth =
                saved.requests.truth === true;

        }


        // --------------------------------
        // STORAGE SYNC
        // --------------------------------
        //
        // Storage keys have priority for
        // pending requests because they
        // allow recovery after reload.
// --------------------------------

        state.requests.archive =
            state.requests.archive
            ||
            getPendingStorage("archive");


        state.requests.game =
            state.requests.game
            ||
            getPendingStorage("game");


        state.requests.truth =
            state.requests.truth
            ||
            getPendingStorage("truth");


        console.log(
            "[MR.SMILE PROGRESS] Progress loaded."
        );

    }
    catch (error) {

        console.error(
            "[MR.SMILE PROGRESS] Failed to load progress.",
            error
        );

    }

}
