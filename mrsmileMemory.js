// =======================================
// MR.SMILE MEMORY SYSTEM
// =======================================

const memory = {

    player: {

        firstSeen: null,
        lastSeen: null,

        totalVisits: 0,
        totalMessages: 0,

        lastMessage: "",

        favoriteWord: null,

        lastQuestion: null
    },

    conversations: [],

    openedFiles: [],
    askedQuestions: [],
    commands: [],
    visitedPages: [],
    events: [],

    relationship: {

        trust: 20,

        mood: "neutral",

        nickname: null,

        greeted: false
    },

    flags: {

        met: false,

        knowsOmega: false,
        knowsSmile: false,

        receivedGame: false,

        foundSecretRoom: false,

        sawHiddenCamera: false,

        enteredMirror: false,

        completedEnding: false
    }

};

// =======================================
// MEMORY INITIALIZATION
// =======================================

let initialized = false;


export function initMemory() {

    if (initialized) return;

    initialized = true;


    console.log("[MR.SMILE] Memory initialized");


    memory.player.firstSeen ??= Date.now();

}



// =======================================
// MEMORY ACCESS
// =======================================

export function getMemory() {

    return memory;

}
