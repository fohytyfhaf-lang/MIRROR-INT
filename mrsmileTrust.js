// =======================================
// MR.SMILE TRUST SYSTEM
// OMEGA SYSTEM
// =======================================

import { trigger } from "./eventManager.js";

const STORAGE_KEY = "mrsmileTrust";

const MIN_TRUST = -100;
const MAX_TRUST = 100;

// =======================================
// INTERNAL STATE
// =======================================

let trust = 0;
let initialized = false;

// =======================================
// TRUST LEVELS
// =======================================

const levels = [

    {
        id: 0,
        name: "UNKNOWN",
        min: -999
    },

    {
        id: 1,
        name: "OBSERVED",
        min: 5
    },

    {
        id: 2,
        name: "INTERESTING",
        min: 15
    },

    {
        id: 3,
        name: "TRUSTED",
        min: 30
    },

    {
        id: 4,
        name: "ALLY",
        min: 50
    },

    {
        id: 5,
        name: "FRIEND",
        min: 80
    }

];

// =======================================
// INIT
// =======================================

export function initTrust() {

    if (initialized)
        return;

    initialized = true;

    loadTrust();

    console.log(
        "[MR.SMILE TRUST] Initialized:",
        trust,
        getTrustName()
    );

}

// =======================================
// ADD TRUST
// =======================================

export function addTrust(
    amount,
    reason = ""
) {

    initTrust();

    amount = Number(amount);

    if (!Number.isFinite(amount))
        return trust;

    const previousTrust = trust;

    trust += amount;

    trust = clampTrust(trust);

    saveTrust();

    console.log(
        "[MR.SMILE] Trust:",
        previousTrust,
        "→",
        trust,
        reason
    );

    trigger(
        "mrsmile:trustChanged",
        {
            previous: previousTrust,
            current: trust,
            difference: trust - previousTrust,
            reason: reason
        }
    );

    checkTrustLevelChange(
        previousTrust,
        trust
    );

    return trust;

}

// =======================================
// REMOVE TRUST
// =======================================

export function removeTrust(
    amount,
    reason = ""
) {

    amount = Number(amount);

    if (!Number.isFinite(amount))
        return getTrust();

    return addTrust(
        -Math.abs(amount),
        reason
    );

}

// =======================================
// GET TRUST
// =======================================

export function getTrust() {

    initTrust();

    return trust;

}

// =======================================
// SET TRUST
// =======================================

export function setTrust(value) {

    initTrust();

    value = Number(value);

    if (!Number.isFinite(value))
        return trust;

    const previousTrust = trust;

    trust = clampTrust(value);

    saveTrust();

    console.log(
        "[MR.SMILE] Trust manually set:",
        previousTrust,
        "→",
        trust
    );

    trigger(
        "mrsmile:trustChanged",
        {
            previous: previousTrust,
            current: trust,
            difference: trust - previousTrust,
            reason: "SET"
        }
    );

    checkTrustLevelChange(
        previousTrust,
        trust
    );

    return trust;

}

// =======================================
// TRUST LEVEL
// =======================================

export function getTrustLevel() {

    initTrust();

    let current = levels[0];

    for (const level of levels) {

        if (trust >= level.min) {

            current = level;

        }

    }

    return current;

}

// =======================================
// TRUST LEVEL NAME
// =======================================

export function getTrustName() {

    return getTrustLevel().name;

}

// =======================================
// TRUST LEVEL ID
// =======================================

export function getTrustLevelId() {

    return getTrustLevel().id;

}

// =======================================
// CHECKS
// =======================================

export function isTrusted() {

    return getTrust() >= 30;

}

export function isAlly() {

    return getTrust() >= 50;

}

export function isFriend() {

    return getTrust() >= 80;

}

export function isHostile() {

    return getTrust() < 0;

}

// =======================================
// REVEAL CONDITIONS
// =======================================

export function canRevealSecrets() {

    return getTrust() >= 20;

}

export function canRevealLore() {

    return getTrust() >= 10;

}

export function canUnlockFiles() {

    return getTrust() >= 30;

}

export function canGiveGame() {

    return getTrust() >= 40;

}

export function canTellTruth() {

    return getTrust() >= 60;

}

// =======================================
// REWARDS
// =======================================

export function reward(event) {

    switch (event) {

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

// =======================================
// PUNISHMENTS
// =======================================

export function punish(event) {

    switch (event) {

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

// =======================================
// SAVE
// =======================================

export function saveTrust() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            String(trust)
        );

    }
    catch (error) {

        console.error(
            "[MR.SMILE TRUST] Failed to save:",
            error
        );

    }

}

// =======================================
// LOAD
// =======================================

export function loadTrust() {

    try {

        const value =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (value === null) {

            trust = 0;

            return trust;

        }

        const parsed =
            Number(value);

        if (!Number.isFinite(parsed)) {

            console.warn(
                "[MR.SMILE TRUST] Invalid stored value. Resetting."
            );

            trust = 0;

            saveTrust();

            return trust;

        }

        trust = clampTrust(parsed);

    }
    catch (error) {

        console.error(
            "[MR.SMILE TRUST] Failed to load:",
            error
        );

        trust = 0;

    }

    return trust;

}

// =======================================
// RESET
// =======================================

export function resetTrust() {

    trust = 0;

    localStorage.removeItem(
        STORAGE_KEY
    );

    console.log(
        "[MR.SMILE TRUST] Reset."
    );

    trigger(
        "mrsmile:trustChanged",
        {
            previous: 0,
            current: 0,
            difference: 0,
            reason: "RESET"
        }
    );

}

// =======================================
// DEBUG / STATUS
// =======================================

export function getTrustStatus() {

    initTrust();

    return {

        value: trust,

        level: getTrustLevel(),

        name: getTrustName(),

        trusted: isTrusted(),

        ally: isAlly(),

        friend: isFriend(),

        hostile: isHostile()

    };

}

// =======================================
// INTERNAL HELPERS
// =======================================

function clampTrust(value) {

    return Math.max(
        MIN_TRUST,
        Math.min(
            MAX_TRUST,
            value
        )
    );

}

// =======================================
// LEVEL CHANGE
// =======================================

function checkTrustLevelChange(
    previous,
    current
) {

    const previousLevel =
        getLevelForValue(previous);

    const currentLevel =
        getLevelForValue(current);

    if (
        previousLevel.id ===
        currentLevel.id
    ) {
        return;
    }

    console.log(
        "[MR.SMILE TRUST] Level changed:",
        previousLevel.name,
        "→",
        currentLevel.name
    );

    trigger(
        "mrsmile:trustLevelChanged",
        {
            previous: previousLevel,
            current: currentLevel,
            trust: current
        }
    );

}

// =======================================
// FIND LEVEL
// =======================================

function getLevelForValue(value) {

    let current = levels[0];

    for (const level of levels) {

        if (value >= level.min) {

            current = level;

        }

    }

    return current;

}

window.debugTrust = {
    get: getTrust,
    set: setTrust,
    add: addTrust,
    init: initTrust,
    status: getTrustStatus
};
