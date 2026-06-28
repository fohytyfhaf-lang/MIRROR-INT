// =======================================
// MR.SMILE PERSONALITY SYSTEM
// OMEGA SYSTEM
// =======================================

import { getTrust } from "./mrsmileTrust.js";

const personality = {

    mood: "neutral",

    energy: 100,

    silence: false,

    curiosity: 0,

    irritation: 0,

    honesty: 0.4,

    lastReply: null

};

// ------------------------------
// СОСТОЯНИЕ
// ------------------------------

export function getPersonality() {

    return personality;

}

// ------------------------------
// НАСТРОЕНИЕ
// ------------------------------

export function setMood(mood) {

    personality.mood = mood;

}

export function getMood() {

    return personality.mood;

}

// ------------------------------
// ЭНЕРГИЯ
// ------------------------------

export function addEnergy(value) {

    personality.energy += value;

    if (personality.energy > 100)
        personality.energy = 100;

}

export function removeEnergy(value) {

    personality.energy -= value;

    if (personality.energy < 0)
        personality.energy = 0;

}

// ------------------------------
// ЛЮБОПЫТСТВО
// ------------------------------

export function increaseCuriosity() {

    personality.curiosity++;

}

export function resetCuriosity() {

    personality.curiosity = 0;

}

// ------------------------------
// РАЗДРАЖЕНИЕ
// ------------------------------

export function annoy() {

    personality.irritation++;

}

export function calmDown() {

    if (personality.irritation > 0)
        personality.irritation--;

}

export function getIrritation() {

    return personality.irritation;

}

// ------------------------------
// МОЛЧАНИЕ
// ------------------------------

export function enableSilence() {

    personality.silence = true;

}

export function disableSilence() {

    personality.silence = false;

}

export function isSilent() {

    return personality.silence;

}

// ------------------------------
// ЧЕСТНОСТЬ
// ------------------------------

export function getHonestyChance() {

    const trust = getTrust();

    if (trust < 0)
        return 0.15;

    if (trust < 15)
        return 0.30;

    if (trust < 30)
        return 0.50;

    if (trust < 60)
        return 0.70;

    return 0.95;

}

// ------------------------------
// МОЖЕТ ЛИ ОТВЕТИТЬ
// ------------------------------

export function canReply() {

    if (personality.silence)
        return false;

    if (personality.energy <= 0)
        return false;

    return true;

}

// ------------------------------
// ПОСЛЕДНИЙ ОТВЕТ
// ------------------------------

export function setLastReply(text) {

    personality.lastReply = text;

}

export function getLastReply() {

    return personality.lastReply;

}

// ------------------------------
// ОБНОВЛЕНИЕ ЛИЧНОСТИ
// ------------------------------

export function updatePersonality() {

    const trust = getTrust();

    // Настроение зависит от доверия

    if (trust < 0) {

        personality.mood = "hostile";

    }

    else if (trust < 20) {

        personality.mood = "careful";

    }

    else if (trust < 50) {

        personality.mood = "neutral";

    }

    else {

        personality.mood = "friendly";

    }

    // Если игрок достал вопросами

    if (personality.irritation >= 5) {

        personality.silence = true;

    }

}

// ------------------------------
// СЛУЧАЙНОЕ ПОВЕДЕНИЕ
// ------------------------------

export function randomBehaviour() {

    const roll = Math.random();

    if (roll < 0.08) {

        personality.silence = true;
        return "ignore";

    }

    if (roll < 0.16) {

        return "askQuestion";

    }

    if (roll < 0.24) {

        return "changeSubject";

    }

    if (roll < 0.30) {

        return "tellHint";

    }

    return "normal";

}

// ------------------------------
// СБРОС
// ------------------------------

export function resetPersonality() {

    personality.mood = "neutral";

    personality.energy = 100;

    personality.silence = false;

    personality.curiosity = 0;

    personality.irritation = 0;

    personality.lastReply = null;

}
