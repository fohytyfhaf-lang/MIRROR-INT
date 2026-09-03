// =======================================
// MR.SMILE PROGRESSION SYSTEM
// OMEGA SYSTEM
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


// =======================================
// STATE
// =======================================

const state = {

    keywords: [],

    flags: {

        archiveUnlocked: false,

        gameUnlocked: false,

        truthUnlocked: false

    }

};


// =======================================
// INITIALIZATION
// =======================================

let initialized = false;
let trustListenerRegistered = false;


// =======================================
// HIDDEN KEYWORD RULES
// =======================================
//
// Игрок не видит этот список.
// Ключевые слова распознаются внутри
// сообщений оператора.
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
    // LOAD PROGRESS
    // -----------------------------------

    loadProgress();


    // -----------------------------------
    // LISTEN FOR TRUST CHANGES
    // -----------------------------------

    registerTrustListener();


    // -----------------------------------
    // FIRST EVALUATION
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

export function processMrSmileInput(text) {

    if (!text)
        return;


    initMrSmileProgress();


    const normalized =
        normalize(text);


    let changed = false;


    // ===================================
    // CHECK KEYWORDS
    // ===================================

    for (const rule of keywordRules) {

        // Already recognized
        if (
            state.keywords.includes(
                rule.id
            )
        ) {

            continue;

        }


        // Check message
        if (
            !matchesKeyword(
                normalized,
                rule.words
            )
        ) {

            continue;

        }


        // --------------------------------
        // SAVE KEYWORD
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
    // RECHECK EVERYTHING
    // ===================================

    evaluateProgress();

}


// =======================================
// EVALUATE PROGRESS
// =======================================

export function evaluateProgress() {

    // -----------------------------------
    // Make sure Trust exists
    // -----------------------------------

    initTrust();


    // -----------------------------------
    // Current Trust
    // -----------------------------------

    const trust =
        getTrust();


    // -----------------------------------
    // FIRST CONTACT
    // -----------------------------------

    const firstContact =
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1";


    // ===================================
    // ARCHIVE
    // ===================================
    //
    // Requirements:
    //
    // FIRST CONTACT
    // +
    // TRUST >= 30
    // +
    // MIRROR KEYWORD
    //
    // IMPORTANT:
    //
    // These conditions DO NOT directly
    // unlock the archive.
    //
    // They only make MR.SMILE aware that
    // the operator qualifies for access.
    // ===================================

    if (

        !state.flags.archiveUnlocked &&

        firstContact &&

        trust >= 30 &&

        state.keywords.includes(
            "mirror"
        )

    ) {

        requestMirrorArchiveAccess();

    }


    // ===================================
    // GAME
    // ===================================
    //
    // Requirements:
    //
    // FIRST CONTACT
    // +
    // TRUST >= 40
    // +
    // PLAY KEYWORD
    // ===================================

    if (

        !state.flags.gameUnlocked &&

        firstContact &&

        trust >= 40 &&

        state.keywords.includes(
            "play"
        )

    ) {

        state.flags.gameUnlocked =
            true;


        saveProgress();


        console.log(
            "[MR.SMILE PROGRESS] Hidden game unlocked."
        );


        trigger(
            "mrsmile:gameUnlocked"
        );

    }


    // ===================================
    // DEEP TRUTH
    // ===================================
    //
    // Requirements:
    //
    // FIRST CONTACT
    // +
    // TRUST >= 60
    // +
    // TRUTH KEYWORD
    // ===================================

    if (

        !state.flags.truthUnlocked &&

        firstContact &&

        trust >= 60 &&

        state.keywords.includes(
            "truth"
        )

    ) {

        state.flags.truthUnlocked =
            true;


        saveProgress();


        console.log(
            "[MR.SMILE PROGRESS] Truth access unlocked."
        );


        trigger(
            "mrsmile:truthUnlocked"
        );

    }

}


// =======================================
// REQUEST MIRROR ARCHIVE ACCESS
// =======================================
//
// This does NOT unlock the archive.
//
// It tells the system that the operator
// has met the requirements and MR.SMILE
// can decide whether to grant access.
// =======================================

export function requestMirrorArchiveAccess() {

    if (
        state.flags.archiveUnlocked
    ) {

        return false;

    }


    // -----------------------------------
    // Already waiting for MR.SMILE
    // -----------------------------------

    if (
        localStorage.getItem(
            ARCHIVE_PENDING_KEY
        ) === "1"
    ) {

        return false;

    }


    // -----------------------------------
    // Mark request as pending
    // -----------------------------------

    localStorage.setItem(
        ARCHIVE_PENDING_KEY,
        "1"
    );


    console.log(
        "[MR.SMILE PROGRESS] MIRROR-00 access request pending."
    );


    // -----------------------------------
    // Tell MR.SMILE
    // -----------------------------------

    trigger(
        "mrsmile:archiveAccessRequested"
    );


    return true;

}


// =======================================
// GRANT MIRROR ARCHIVE ACCESS
// =======================================
//
// ONLY this function actually unlocks
// MIRROR-00.
//
// It is called by MR.SMILE.
// =======================================

export function grantMirrorArchiveAccess() {

    if (
        state.flags.archiveUnlocked
    ) {

        return false;

    }


    state.flags.archiveUnlocked =
        true;


    // -----------------------------------
    // Request is no longer pending
    // -----------------------------------

    localStorage.removeItem(
        ARCHIVE_PENDING_KEY
    );


    // -----------------------------------
    // Save progress
    // -----------------------------------

    saveProgress();


    console.log(
        "[MR.SMILE] MIRROR-00 ACCESS GRANTED."
    );


    // -----------------------------------
    // Notify OMEGA
    // -----------------------------------

    trigger(
        "mrsmile:archiveUnlocked"
    );


    return true;

}


// =======================================
// CHECK ARCHIVE REQUEST
// =======================================
//
// Used by MR.SMILE chat during initialization.
// This prevents the request from being lost
// if Progress initialized before Chat.
// =======================================

export function hasPendingMirrorArchiveAccess() {

    return (
        localStorage.getItem(
            ARCHIVE_PENDING_KEY
        ) === "1"
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

            return (
                state.flags.archiveUnlocked
            );


        case "game":

            return (
                state.flags.gameUnlocked
            );


        case "truth":

            return (
                state.flags.truthUnlocked
            );


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
            hasPendingMirrorArchiveAccess(),

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


    localStorage.removeItem(
        STORAGE_KEY
    );


    localStorage.removeItem(
        ARCHIVE_PENDING_KEY
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

            state.keywords =
                [
                    ...new Set(
                        saved.keywords
                    )
                ];

        }


        // --------------------------------
        // FLAGS
        // --------------------------------

        if (saved.flags) {

            state.flags.archiveUnlocked =
                saved.flags.archiveUnlocked === true;


            state.flags.gameUnlocked =
                saved.flags.gameUnlocked === true;


            state.flags.truthUnlocked =
                saved.flags.truthUnlocked === true;

        }

    }
    catch (error) {

        console.error(
            "[MR.SMILE PROGRESS] Failed to load progress.",
            error
        );

    }

}
