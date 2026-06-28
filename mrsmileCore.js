let memory = [];
let trust = 20;
let silenceMode = false;

// =========================
// ENTRY POINT
// =========================

export async function mrSmileSay(text) {

    addMemory("PLAYER: " + text);

    if (silenceMode) {
        maybeBreakSilence();
        return null;
    }

    if (!shouldRespond()) {
        addMemory("MRSMILE: ignored");
        return null;
    }

    await delay(1500 + Math.random() * 3000);

    const response = generateResponse(text);

    addMemory("MRSMILE: " + response);

    return response;
}

// =========================
// LOGIC
// =========================

function shouldRespond() {
    const chance = Math.min(0.2 + trust / 200, 0.8);
    return Math.random() < chance;
}

function generateResponse(text) {

    const t = text.toLowerCase();

    if (t.includes("who are you")) {
        return pick([
            "I was here before the folders.",
            "A trace that remained.",
            "You already saw me."
        ]);
    }

    if (t.includes("help")) {
        return pick([
            "I can, if you listen.",
            "Not always.",
            "Sometimes it's dangerous."
        ]);
    }

    if (t.includes("system")) {
        return pick([
            "It changes when you're not looking.",
            "Don't trust it.",
            "Some parts are missing."
        ]);
    }

    return pick([
        "...",
        "I see.",
        "Maybe.",
        "It depends."
    ]);
}

// =========================
// MEMORY
// =========================

function addMemory(msg) {
    memory.push({ msg, time: Date.now() });
    if (memory.length > 50) memory.shift();
}

// =========================
// SILENCE
// =========================

function maybeBreakSilence() {
    if (Math.random() < 0.3) {
        silenceMode = false;
    }
}

// =========================
// UTILS
// =========================

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
