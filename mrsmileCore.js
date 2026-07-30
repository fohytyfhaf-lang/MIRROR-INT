// ======================================================
// MR.SMILE CORE
// ======================================================

let memory = [];
let trust = 20;
let mood = "neutral";
let silenceMode = false;
let conversations = 0;

// ======================================================
// MAIN
// ======================================================

export async function mrSmileSay(text) {

    text = text.trim();

    addMemory("PLAYER", text);

    conversations++;

    updateMood();

    if (silenceMode) {

        if (Math.random() < 0.25) {
            silenceMode = false;
        } else {
            return null;
        }

    }

    if (!shouldRespond()) {
        return null;
    }

    await delay(random(800,3000));

    const response = generateResponse(text);

    addMemory("MR.SMILE", response);

    updateTrust(text);

    return response;

}

// ======================================================
// RESPONSE
// ======================================================

function generateResponse(text){

    const t = text.toLowerCase();

    if(match(t,["hello","hi","hey"])){

        return pick([

            "Hello.",
            "I knew you would return.",
            "You are late.",
            "I noticed you."

        ]);

    }

    if(match(t,["who are you"])){

        return pick([

            "I don't remember my first name.",
            "They called me many things.",
            "Names are temporary.",
            "I existed before the terminal."

        ]);

    }

    if(match(t,["help"])){

        return pick([

            "Maybe.",
            "Not yet.",
            "Only if you trust me.",
            "I can only open some doors."

        ]);

    }

    if(match(t,["omega"])){

        trust += 2;

        return pick([

            "OMEGA is not what you think.",
            "They built these walls.",
            "You should read deeper."

        ]);

    }

    if(match(t,["smile"])){

        return pick([

            "Do not say my name too often.",
            "I heard that.",
            "Interesting."

        ]);

    }

    if(match(t,["bye"])){

        silenceMode = true;

        return "I'll be here.";

    }

    // случайные ответы

    return randomThought();

}

// ======================================================
// RANDOM THOUGHTS
// ======================================================

function randomThought(){

    const normal=[

        "I am watching.",

        "Someone else is listening.",

        "The cameras never sleep.",

        "Do you trust this place?",

        "You read slowly.",

        "There are hidden files."

    ];

    const friendly=[

        "Welcome back.",

        "I remember our conversations.",

        "I'm glad you returned."

    ];

    const dark=[

        "They are still alive.",

        "Don't open Door-7.",

        "The walls remember.",

        "It can hear us."

    ];

    if(trust>60)
        return pick(friendly);

    if(mood==="dark")
        return pick(dark);

    return pick(normal);

}

// ======================================================
// TRUST
// ======================================================

function updateTrust(text){

    const t=text.toLowerCase();

    if(t.includes("thank"))
        trust+=3;

    if(t.includes("idiot"))
        trust-=5;

    if(t.includes("hate"))
        trust-=8;

    trust=Math.max(0,Math.min(100,trust));

}

// ======================================================
// MOOD
// ======================================================

function updateMood(){

    if(trust<20){

        mood="dark";
        return;

    }

    if(trust>70){

        mood="friendly";
        return;

    }

    mood="neutral";

}

// ======================================================
// MEMORY
// ======================================================

function addMemory(author,text){

    memory.push({

        author,
        text,
        time:Date.now()

    });

    if(memory.length>100){

        memory.shift();

    }

}

export function getMemory(){

    return memory;

}

// ======================================================
// HELPERS
// ======================================================

function shouldRespond(){

    const chance=0.35+(trust/200);

    return Math.random()<Math.min(chance,0.95);

}

function match(text,words){

    return words.some(w=>text.includes(w));

}

function pick(arr){

    return arr[Math.floor(Math.random()*arr.length)];

}

function random(min,max){

    return Math.floor(Math.random()*(max-min+1))+min;

}

function delay(ms){

    return new Promise(r=>setTimeout(r,ms));

}
