/* ==========================================================
   MR.SMILE PROGRESS — V4
   OMEGA / MIRROR-INT

   SINGLE SOURCE OF ACCESS / PROGRESSION

   RESPONSIBILITY:
   - recognize progression keywords
   - track archive / game / truth access
   - check Trust requirements
   - create access requests
   - grant / deny access
   - keep progression persistent
   - emit progression events

   THIS MODULE DOES NOT:
   - generate dialogue
   - generate MR.SMILE responses
   - call MR.SMILE Core
   - write chat messages
   - manage chat rendering
   - own MR.SMILE personality

   IMPORTANT:
   Progression is EVENT + STATE only.
========================================================== */


/* ==========================================================
   IMPORTS
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
    "mrsmile_progress_v3";

const LEGACY_STORAGE_KEYS = [
    "mrsmile_progress_v2",
    "mrsmile_progress_v1"
];

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
            "правдою",

            "истин",
            "истина",
            "истину",

            "істин",
            "істина",
            "істину"

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
   EVENT DUPLICATE PROTECTION
========================================================== */

const EVENT_WINDOW_MS =
    1500;


/* ==========================================================
   RUNTIME EVENT STATE
========================================================== */

const runtime = {

    lastKeywordEvent: {},

    lastProgressEvent: {},

    lastUnlockEvent: {},

    lastDeniedEvent: {}

};


/* ==========================================================
   BASIC HELPERS
========================================================== */

function safeString(value) {

    return String(
        value ?? ""
    ).trim();

}


function now() {

    return Date.now();

}


function isValidType(
    type
) {

    return TYPES.includes(
        type
    );

}


function known(
    type
) {

    return isValidType(
        type
    );

}


function flag(
    type
) {

    return `${type}Unlocked`;

}


function normalize(
    text
) {

    return safeString(
        text
    )
        .normalize("NFKC")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

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


function readStorage(
    key
) {

    if (
        !storageAvailable()
    ) {

        return null;

    }

    try {

        return localStorage.getItem(
            key
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE PROGRESS] Storage read failed:",
            error
        );

        return null;

    }

}


function writeStorage(
    key,
    value
) {

    if (
        !storageAvailable()
    ) {

        return false;

    }

    try {

        localStorage.setItem(
            key,
            value
        );

        return true;

    } catch (error) {

        console.warn(
            "[MR.SMILE PROGRESS] Storage write failed:",
            error
        );

        return false;

    }

}


function removeStorage(
    key
) {

    if (
        !storageAvailable()
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


/* ==========================================================
   SAFE EVENT DUPLICATE CHECK
========================================================== */

function eventRecentlySent(
    bucket,
    type
) {

    const timestamp =
        Number(
            runtime[bucket]?.[type]
        ) || 0;

    return (
        now() -
        timestamp <
        EVENT_WINDOW_MS
    );

}


function markEventSent(
    bucket,
    type
) {

    if (
        !runtime[bucket]
    ) {

        runtime[bucket] =
            {};

    }

    runtime[bucket][type] =
        now();

}


/* ==========================================================
   INTERNAL STATE BUILDER
   IMPORTANT:
   NEVER CALL initMrSmileProgress() HERE.
========================================================== */

function buildProgressState() {

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
   INITIALIZATION
========================================================== */

export function initMrSmileProgress() {

    /*
     * IMPORTANT:
     *
     * Do NOT call getMrSmileProgressState()
     * here because that function calls initMrSmileProgress().
     */

    if (
        state.initialized
    ) {

        syncPendingState();

        return buildProgressState();

    }


    state.initialized =
        true;


    try {

        initTrust();

    } catch (error) {

        console.warn(
            "[MR.SMILE PROGRESS] Trust initialization failed:",
            error
        );

    }


    try {

        load();

        register();

        syncPendingState();

        evaluateProgress();

    } catch (error) {

        /*
         * Do not allow one Progress error
         * to permanently break the entire system.
         */

        console.error(
            "[MR.SMILE PROGRESS] Initialization step failed:",
            error
        );

    }


    console.log(
        "[MR.SMILE PROGRESS] V4 initialized."
    );


    return buildProgressState();

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


    try {

        on(
            "mrsmile:trustChanged",
            () => {

                syncPendingState();

                evaluateProgress();

            }
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE PROGRESS] Trust listener failed:",
            error
        );

    }


    try {

        on(
            "mrsmile:firstContactCompleted",
            () => {

                syncPendingState();

                evaluateProgress();

            }
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE PROGRESS] First Contact listener failed:",
            error
        );

    }

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


        emitKeywordRecognized(
            rule.id
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
   KEYWORD EVENT
========================================================== */

function emitKeywordRecognized(
    keyword
) {

    if (
        eventRecentlySent(
            "lastKeywordEvent",
            keyword
        )
    ) {

        return false;

    }


    markEventSent(
        "lastKeywordEvent",
        keyword
    );


    trigger(
        "mrsmile:keywordRecognized",
        {

            keyword,

            timestamp:
                now()

        }
    );


    return true;

}


/* ==========================================================
   EVALUATE ALL PROGRESS
========================================================== */

export function evaluateProgress() {

    initTrustSafe();

    syncPendingState();


    /*
     * Progression cannot unlock anything
     * before First Contact.
     */

    if (
        !hasFirstContact()
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
            evaluate(
                type
            );


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
   SAFE TRUST INITIALIZATION
========================================================== */

function initTrustSafe() {

    try {

        initTrust();

    } catch (error) {

        console.warn(
            "[MR.SMILE PROGRESS] Trust sync failed:",
            error
        );

    }

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


    const timestamp =
        now();


    const requestKey =
        type;


    if (
        !eventRecentlySent(
            "lastProgressEvent",
            requestKey
        )
    ) {

        markEventSent(
            "lastProgressEvent",
            requestKey
        );


        trigger(
            requestEvent(type),
            {

                type,

                source:
                    "progress",

                trust:
                    Number(
                        getTrust()
                    ) || 0,

                keyword:
                    requirements[type]
                        ?.keyword ||
                    null,

                timestamp

            }
        );


        trigger(
            "mrsmile:progressChanged",
            {

                type,

                action:
                    "request",

                timestamp

            }
        );

    }


    return true;

}


/* ==========================================================
   REQUEST EVENTS
========================================================== */

function requestEvent(
    type
) {

    switch (
        type
    ) {

        case "archive":

            return (
                "mrsmile:archiveAccessRequested"
            );

        case "game":

            return (
                "mrsmile:gameAccessRequested"
            );

        case "truth":

            return (
                "mrsmile:truthAccessRequested"
            );

        default:

            return (
                "mrsmile:accessRequested"
            );

    }

}


/* ==========================================================
   UNLOCK EVENTS
========================================================== */

function unlockedEvent(
    type
) {

    switch (
        type
    ) {

        case "archive":

            return (
                "mrsmile:archiveUnlocked"
            );

        case "game":

            return (
                "mrsmile:gameUnlocked"
            );

        case "truth":

            return (
                "mrsmile:truthUnlocked"
            );

        default:

            return (
                "mrsmile:accessUnlocked"
            );

    }

}


/* ==========================================================
   DENIED EVENTS
========================================================== */

function deniedEvent(
    type
) {

    switch (
        type
    ) {

        case "archive":

            return (
                "mrsmile:archiveAccessDenied"
            );

        case "game":

            return (
                "mrsmile:gameAccessDenied"
            );

        case "truth":

            return (
                "mrsmile:truthAccessDenied"
            );

        default:

            return (
                "mrsmile:accessDenied"
            );

    }

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


    /*
     * Already unlocked = idempotent.
     */

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


    const timestamp =
        now();


    if (
        !eventRecentlySent(
            "lastUnlockEvent",
            type
        )
    ) {

        markEventSent(
            "lastUnlockEvent",
            type
        );


        trigger(
            unlockedEvent(type),
            {

                type,

                source:
                    "progress",

                trust:
                    Number(
                        getTrust()
                    ) || 0,

                timestamp

            }
        );


        trigger(
            "mrsmile:progressChanged",
            {

                type,

                action:
                    "unlock",

                timestamp

            }
        );

    }


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


    const wasPending =
        hasPendingAccess(
            type
        );


    state.requests[type] =
        false;


    setPending(
        type,
        false
    );


    save();


    const timestamp =
        now();


    if (
        wasPending &&
        !eventRecentlySent(
            "lastDeniedEvent",
            type
        )
    ) {

        markEventSent(
            "lastDeniedEvent",
            type
        );


        trigger(
            deniedEvent(type),
            {

                type,

                timestamp

            }
        );


        trigger(
            "mrsmile:progressChanged",
            {

                type,

                action:
                    "denied",

                timestamp

            }
        );

    }


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


    const changed =
        state.requests[type] ||
        hasPendingAccess(type);


    state.requests[type] =
        false;


    setPending(
        type,
        false
    );


    save();


    if (
        changed
    ) {

        trigger(
            "mrsmile:progressChanged",
            {

                type,

                action:
                    "requestCleared",

                timestamp:
                    now()

            }
        );

    }


    return true;

}


/* ==========================================================
   PENDING ACCESS — PUBLIC
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


    if (
        state.requests[type] ===
            true
    ) {

        return true;

    }


    return (
        readStorage(
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

    if (
        !known(type)
    ) {

        return false;

    }


    const key =
        PENDING_KEYS[type];


    if (
        !key
    ) {

        return false;

    }


    if (
        value
    ) {

        return writeStorage(
            key,
            "1"
        );

    }


    return removeStorage(
        key
    );

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


/* ==========================================================
   GENERIC UNLOCK STATUS
========================================================== */

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
                Number(
                    getTrust()
                ) || 0,

            requiredTrust:
                null,

            keyword:
                null,

            keywordFound:
                false,

            firstContact:
                hasFirstContact(),

            ready:
                false

        };

    }


    const requirement =
        requirements[type];


    const trust =
        Number(
            getTrust()
        ) || 0;


    return {

        type,

        known:
            true,

        unlocked:
            isUnlocked(type),

        pending:
            hasPendingAccess(type),

        trust,

        requiredTrust:
            requirement.trust,

        keyword:
            requirement.keyword,

        keywordFound:
            state.keywords.includes(
                requirement.keyword
            ),

        firstContact:
            hasFirstContact(),

        ready:
            hasFirstContact() &&
            trust >= requirement.trust &&
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

/*
 * IMPORTANT:
 *
 * This function initializes once and then only
 * builds a state snapshot.
 *
 * It NEVER calls itself indirectly.
 */

export function getMrSmileProgressState() {

    initMrSmileProgress();

    return buildProgressState();

}


/* ==========================================================
   KEYWORD STATUS
========================================================== */

export function hasRecognizedKeyword(
    keyword
) {

    return state.keywords.includes(
        safeString(
            keyword
        )
            .toLowerCase()
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

    return (
        readStorage(
            FIRST_CONTACT_KEY
        ) ===
        "1"
    );

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
   SAVE
========================================================== */

function save() {

    const data = {

        version:
            4,

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

    };


    return writeStorage(

        STORAGE_KEY,

        JSON.stringify(
            data
        )

    );

}


/* ==========================================================
   LOAD
========================================================== */

function load() {

    let raw =
        readStorage(
            STORAGE_KEY
        );


    /*
     * Legacy migration.
     */

    if (!raw) {

        for (
            const legacyKey
            of LEGACY_STORAGE_KEYS
        ) {

            raw =
                readStorage(
                    legacyKey
                );

            if (raw) {
                break;
            }

        }

    }


    if (!raw) {

        syncPendingState();

        return;

    }


    try {

        const saved =
            JSON.parse(
                raw
            );


        if (
            !saved ||
            typeof saved !==
                "object"
        ) {

            return;

        }


        /* --------------------------------------------------
           KEYWORDS
        -------------------------------------------------- */

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

                        .map(
                            keyword =>
                                keyword
                                    .trim()
                                    .toLowerCase()
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


        /* --------------------------------------------------
           FLAGS
        -------------------------------------------------- */

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


        /* --------------------------------------------------
           REQUESTS
        -------------------------------------------------- */

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

    } catch (error) {

        console.warn(
            "[MR.SMILE PROGRESS] Load failed:",
            error
        );

    }


    syncPendingState();


    /*
     * If something was already unlocked,
     * pending state must not survive.
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


    /*
     * Save migrated state in the new format.
     */

    save();

}


/* ==========================================================
   SYNC PENDING STATE
========================================================== */

function syncPendingState() {

    if (
        !storageAvailable()
    ) {

        return;

    }


    for (
        const type
        of TYPES
    ) {

        if (
            isUnlocked(type)
        ) {

            state.requests[type] =
                false;

            continue;

        }


        const pending =
            readStorage(
                PENDING_KEYS[type]
            ) ===
            "1";


        state.requests[type] =
            Boolean(
                state.requests[type] ||
                pending
            );

    }

}


/* ==========================================================
   RESET PROGRESS
========================================================== */

export function resetMrSmileProgress(
    options = {}
) {

    state.keywords = [];


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


    for (
        const type
        of TYPES
    ) {

        setPending(
            type,
            false
        );

    }


    for (
        const bucket
        of Object.values(
            runtime
        )
    ) {

        if (
            bucket &&
            typeof bucket ===
                "object"
        ) {

            for (
                const key
                of Object.keys(bucket)
            ) {

                bucket[key] =
                    0;

            }

        }

    }


    save();


    if (
        options.clearFirstContact ===
        true
    ) {

        removeStorage(
            FIRST_CONTACT_KEY
        );

    }


    trigger(
        "mrsmile:progressChanged",
        {

            action:
                "reset",

            timestamp:
                now()

        }
    );


    /*
     * Do not call initMrSmileProgress()
     * recursively through the getter.
     *
     * Initialization already exists, so the
     * internal state builder is sufficient.
     */

    return buildProgressState();

}


/* ==========================================================
   AUTO / SAFE INITIALIZATION
========================================================== */

try {

    initMrSmileProgress();

} catch (error) {

    console.error(
        "[MR.SMILE PROGRESS] Initialization failed:",
        error
    );

}


/* ==========================================================
   GLOBAL DEBUG API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_PROGRESS = {

        init:
            initMrSmileProgress,

        process:
            processMrSmileInput,

        evaluate:
            evaluateProgress,

        status:
            getMrSmileProgressState,

        getStatus:
            getProgressStatus,

        getRequirement:
            getProgressRequirement,

        getKeywords:
            getRecognizedKeywords,

        hasKeyword:
            hasRecognizedKeyword,

        hasFirstContact:
            hasFirstContact,

        canUnlock:
            canUnlockProgress,

        isUnlocked:
            isProgressUnlocked,

        hasPendingArchive:
            hasPendingMirrorArchiveAccess,

        hasPendingGame:
            hasPendingGameAccess,

        hasPendingTruth:
            hasPendingTruthAccess,

        grantArchive:
            grantMirrorArchiveAccess,

        grantGame:
            grantGameAccess,

        grantTruth:
            grantTruthAccess,

        deny:
            denyAccess,

        clearRequest:
            clearAccessRequest,

        reset:
            resetMrSmileProgress

    };

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default {

    initMrSmileProgress,

    processMrSmileInput,

    evaluateProgress,

    grantMirrorArchiveAccess,

    grantGameAccess,

    grantTruthAccess,

    denyAccess,

    clearAccessRequest,

    hasPendingMirrorArchiveAccess,

    hasPendingGameAccess,

    hasPendingTruthAccess,

    isArchiveUnlocked,

    isGameUnlocked,

    isTruthUnlocked,

    isProgressUnlocked,

    getProgressStatus,

    getProgressRequirement,

    getMrSmileProgressState,

    hasRecognizedKeyword,

    getRecognizedKeywords,

    hasFirstContact,

    canUnlockProgress,

    resetMrSmileProgress

};
