// =======================================
// MR.SMILE MEMORY SYSTEM
// =======================================

const memory = {

    // ---------- PLAYER ----------

    player: {

        firstSeen: null,
        lastSeen: null,

        totalVisits: 0,
        totalMessages: 0,

        lastMessage: "",

        favoriteWord: null,

        lastQuestion: null

    },

    // ---------- CHAT ----------

    conversations: [],

    // ---------- KNOWLEDGE ----------

    openedFiles: [],
    askedQuestions: [],
    commands: [],
    visitedPages: [],
    events: [],

    // ---------- RELATIONSHIP ----------

    relationship: {

        trust: 20,

        mood: "neutral",

        nickname: null,

        greeted: false

    },

    // ---------- STORY ----------

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
