// =======================================
// MR.SMILE TRUST SYSTEM
// OMEGA SYSTEM
// =======================================

let trust = 0;

// ------------------------------
// УРОВНИ ДОВЕРИЯ
// ------------------------------

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

// ------------------------------
// ДОБАВИТЬ ДОВЕРИЕ
// ------------------------------

export function addTrust(amount, reason = "") {

    trust += amount;

    if (trust > 100)
        trust = 100;

    if (trust < -100)
        trust = -100;

    console.log("[MR.SMILE] Trust:", trust, reason);

}

// ------------------------------
// УБАВИТЬ
// ------------------------------

export function removeTrust(amount, reason = "") {

    addTrust(-amount, reason);

}

// ------------------------------
// ПОЛУЧИТЬ
// ------------------------------

export function getTrust() {

    return trust;

}

// ------------------------------
// УСТАНОВИТЬ
// ------------------------------

export function setTrust(value) {

    trust = value;

}

// ------------------------------
// УРОВЕНЬ
// ------------------------------

export function getTrustLevel() {

    let current = levels[0];

    for (const level of levels) {

        if (trust >= level.min) {

            current = level;

        }

    }

    return current;

}

// ------------------------------
// ИМЯ УРОВНЯ
// ------------------------------

export function getTrustName() {

    return getTrustLevel().name;

}

// ------------------------------
// ПРОВЕРКИ
// ------------------------------

export function isTrusted() {

    return trust >= 30;

}

export function isFriend() {

    return trust >= 80;

}

export function isHostile() {

    return trust < 0;

}

// ------------------------------
// СОБЫТИЯ
// ------------------------------

export function reward(event) {

    switch (event) {

        case "READ_FILE":

            addTrust(1, event);

            break;

        case "READ_SECRET":

            addTrust(2, event);

            break;

        case "HELP_SYSTEM":

            addTrust(3, event);

            break;

        case "OPEN_ARCHIVE":

            addTrust(2, event);

            break;

        case "RETURN_NIGHT":

            addTrust(5, event);

            break;

    }

}

// ------------------------------

export function punish(event) {

    switch (event) {

        case "SPAM":

            removeTrust(3, event);

            break;

        case "ATTACK_SYSTEM":

            removeTrust(10, event);

            break;

        case "IGNORE_WARNING":

            removeTrust(5, event);

            break;

        case "DELETE_FILE":

            removeTrust(20, event);

            break;

    }

}

// ------------------------------
// ЧТО МОЖНО ОТКРЫТЬ
// ------------------------------

export function canRevealSecrets() {

    return trust >= 20;

}

export function canRevealLore() {

    return trust >= 10;

}

export function canGiveGame() {

    return trust >= 40;

}

export function canUnlockFiles() {

    return trust >= 30;

}

export function canTellTruth() {

    return trust >= 60;

}

// ------------------------------
// СОХРАНЕНИЕ
// ------------------------------

export function saveTrust() {

    localStorage.setItem(
        "mrsmileTrust",
        trust
    );

}

// ------------------------------

export function loadTrust() {

    const value = localStorage.getItem(
        "mrsmileTrust"
    );

    if (value !== null) {

        trust = Number(value);

    }

}
