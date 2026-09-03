// =======================================
// MR.SMILE PROGRESSION SYSTEM
// OMEGA SYSTEM
// =======================================

import { trigger } from "./eventManager.js";
import { getTrust } from "./mrsmileTrust.js";

const STORAGE_KEY = "mrsmile_progress";

const state = {

    keywords: [],

    flags: {

        archiveUnlocked: false,
        gameUnlocked: false,
        truthUnlocked: false

    }

};

let initialized = false;


// =======================================
// IMPORTANT WORDS
// =======================================
// Не экспортируются.
// Игрок не должен видеть список.

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

    if (initialized)
        return;

    initialized = true;

    loadProgress();

    evaluateProgress();

    console.log(
        "[MR.SMILE PROGRESS] Initialized"
    );

}


// =======================================
// PROCESS MESSAGE
// =======================================

export function processMrSmileInput(text) {

    if (!text)
        return;

    initMrSmileProgress();

    const normalized =
        normalize(text);

    let changed = false;


    for (const rule of keywordRules) {

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


        state.keywords.push(
            rule.id
        );

        changed = true;


        console.log(
            "[MR.SMILE PROGRESS] Keyword recognized:",
            rule.id
        );


        trigger(
            "mrsmile:keywordRecognized",
            {
                keyword: rule.id
            }
        );

    }


    if (changed) {

        saveProgress();

    }


    evaluateProgress();

}


// =======================================
// CHECK PROGRESS
// =======================================

export function evaluateProgress() {

    initMrSmileProgressWithoutRecursion();

    const trust =
        getTrust();

    const firstContact =
        localStorage.getItem(
            "mrsmile_first_contact"
        ) === "1";


    // ===================================
    // HIDDEN ARCHIVE
    // ===================================

    if (

        !state.flags.archiveUnlocked &&

        firstContact &&

        trust >= 30 &&

        state.keywords.includes("mirror")

    ) {

        state.flags.archiveUnlocked = true;

        saveProgress();


        console.log(
            "[MR.SMILE PROGRESS] Hidden archive unlocked."
        );


        trigger(
            "mrsmile:archiveUnlocked"
        );

    }


    // ===================================
    // HIDDEN GAME
    // ===================================

    if (

        !state.flags.gameUnlocked &&

        firstContact &&

        trust >= 40 &&

        state.keywords.includes("play")

    ) {

        state.flags.gameUnlocked = true;

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

    if (

        !state.flags.truthUnlocked &&

        firstContact &&

        trust >= 60 &&

        state.keywords.includes("truth")

    ) {

        state.flags.truthUnlocked = true;

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
// ACCESS
// =======================================

export function hasKeyword(keyword) {

    initMrSmileProgress();

    return state.keywords.includes(
        keyword
    );

}


export function isProgressUnlocked(flag) {

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
// RESET
// =======================================

export function resetMrSmileProgress() {

    state.keywords = [];

    state.flags.archiveUnlocked = false;
    state.flags.gameUnlocked = false;
    state.flags.truthUnlocked = false;


    localStorage.removeItem(
        STORAGE_KEY
    );


    console.log(
        "[MR.SMILE PROGRESS] Progress reset."
    );

}


// =======================================
// HELPERS
// =======================================

function normalize(text) {

    return text

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


function matchesKeyword(
    text,
    words
) {

    return words.some(word => {

        const normalizedWord =
            normalize(word);

        return (

            text === normalizedWord ||

            text.includes(
                " " +
                normalizedWord +
                " "
            ) ||

            text.startsWith(
                normalizedWord +
                " "
            ) ||

            text.endsWith(
                " " +
                normalizedWord
            )

        );

    });

}


// =======================================
// STORAGE
// =======================================

function saveProgress() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(state)

    );

}


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


        if (
            Array.isArray(
                saved.keywords
            )
        ) {

            state.keywords =
                saved.keywords;

        }


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


// =======================================
// INTERNAL INIT
// =======================================

function initMrSmileProgressWithoutRecursion() {

    if (initialized)
        return;

    initialized = true;

    loadProgress();

}
