// =======================================
// MR.SMILE MEMORY SYSTEM
// OMEGA SYSTEM
// =======================================

const memory = {
    firstSeen: null,
    lastSeen: null,

    conversations: [],

    openedFiles: [],

    askedQuestions: [],

    events: [],

    flags: {

        met: false,

        receivedGame: false,

        knowsOmega: false,

        knowsMrSmile: false,

        trusted: false

    }

};

// ------------------------------------
// INIT
// ------------------------------------

export function initMemory() {

    if (!memory.firstSeen) {

        memory.firstSeen = Date.now();

    }

    memory.lastSeen = Date.now();

}

// ------------------------------------
// SAVE MESSAGE
// ------------------------------------

export function rememberMessage(player, mrSmile) {

    memory.conversations.push({

        time: Date.now(),

        player,

        mrSmile

    });

    if (memory.conversations.length > 100) {

        memory.conversations.shift();

    }

}

// ------------------------------------
// SAVE QUESTION
// ------------------------------------

export function rememberQuestion(question) {

    memory.askedQuestions.push({

        text: question,

        time: Date.now()

    });

    if (memory.askedQuestions.length > 50) {

        memory.askedQuestions.shift();

    }

}

// ------------------------------------
// SAVE FILE
// ------------------------------------

export function rememberFile(path) {

    if (memory.openedFiles.includes(path))
        return;

    memory.openedFiles.push(path);

}

// ------------------------------------
// EVENTS
// ------------------------------------

export function rememberEvent(event) {

    memory.events.push({

        event,

        time: Date.now()

    });

    if (memory.events.length > 100) {

        memory.events.shift();

    }

}

// ------------------------------------
// FLAGS
// ------------------------------------

export function setFlag(flag, value = true) {

    if (flag in memory.flags) {

        memory.flags[flag] = value;

    }

}

export function hasFlag(flag) {

    return memory.flags[flag] === true;

}

// ------------------------------------
// SEARCH
// ------------------------------------

export function askedBefore(text) {

    return memory.askedQuestions.some(q =>

        q.text.toLowerCase() === text.toLowerCase()

    );

}

export function openedFile(path) {

    return memory.openedFiles.includes(path);

}

// ------------------------------------
// GETTERS
// ------------------------------------

export function getMemory() {

    return memory;

}

export function getConversationHistory() {

    return memory.conversations;

}

export function getOpenedFiles() {

    return memory.openedFiles;

}

export function getEvents() {

    return memory.events;

}

export function getQuestions() {

    return memory.askedQuestions;

}

// ------------------------------------
// RESET
// ------------------------------------

export function clearMemory() {

    memory.conversations = [];

    memory.askedQuestions = [];

    memory.openedFiles = [];

    memory.events = [];

}
