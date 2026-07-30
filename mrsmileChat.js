import { mrSmileSay } from "./mrsmileCore.js";

let initialized = false;
let idleTimer = null;


// =======================================
// INIT
// =======================================

export function initMrSmileChat() {

    if (initialized) return;

    initialized = true;

    console.log("[MR.SMILE] Chat initialized");


    const input = document.getElementById("chatInput");
    const button = document.getElementById("sendBtn");


    if (!input || !button) return;


    button.addEventListener("click", sendMessage);


    input.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            sendMessage();

        }

    });


    scheduleRandomMessage();

}



// =======================================
// PLAYER MESSAGE
// =======================================

async function sendMessage() {


    const input = document.getElementById("chatInput");

    if (!input) return;


    const text = input.value.trim();


    if (!text) return;


    input.value = "";


    addMessage("YOU", text, "user");


    clearTimeout(idleTimer);



    if (Math.random() < 0.08) {


        await fakeTyping(2500);


        typeSystemMessage("Signal interrupted.");


        scheduleRandomMessage();


        return;

    }



    await fakeTyping(random(1000,4000));



    const response = await mrSmileSay(text);



    if (!response) {


        typeSystemMessage("No response.");


        scheduleRandomMessage();


        return;

    }



    await typeMessage(response);



    if (Math.random() < 0.10) {


        const msgs = document.querySelectorAll(".msg.smile");


        const last = msgs[msgs.length - 1];



        if (last) {


            await sleep(2000);


            last.textContent = "████████████";


            await sleep(900);


            last.textContent = "Message removed.";


            last.classList.add("system");


        }

    }



    scheduleRandomMessage();

}



// =======================================
// NORMAL MESSAGE
// =======================================

function addMessage(author,text,type){


    const log=document.getElementById("chatLog");


    if(!log) return;



    const div=document.createElement("div");


    div.className=`msg ${type}`;



    div.innerHTML=`

        <div class="author">${author}</div>

        <div class="text"></div>

    `;



    div.querySelector(".text").textContent=text;



    log.appendChild(div);


    log.scrollTop=log.scrollHeight;

}



// =======================================
// MR.SMILE MESSAGE
// =======================================

async function typeMessage(text){


    const log=document.getElementById("chatLog");


    if(!log) return;



    const div=document.createElement("div");


    div.className="msg smile";



    div.innerHTML=`

        <div class="author">MR.SMILE</div>

        <div class="text"></div>

    `;



    const body=div.querySelector(".text");



    log.appendChild(div);



    for(const ch of text){


        body.textContent += ch;


        log.scrollTop=log.scrollHeight;


        await sleep(random(20,45));

    }

}



// =======================================
// SYSTEM MESSAGE
// EXPORTED FOR EVENTS
// =======================================

export function typeSystemMessage(text){


    const log=document.getElementById("chatLog");


    if(!log) return;



    const div=document.createElement("div");



    div.className="msg system";


    div.textContent=text;



    log.appendChild(div);



    log.scrollTop=log.scrollHeight;

}



// =======================================
// TYPING EFFECT
// =======================================

async function fakeTyping(time){


    const log=document.getElementById("chatLog");


    if(!log) return;



    const div=document.createElement("div");



    div.className="msg typing";


    div.textContent="MR.SMILE is typing...";



    log.appendChild(div);



    log.scrollTop=log.scrollHeight;



    await sleep(time);



    div.remove();

}



// =======================================
// RANDOM EVENTS
// =======================================

function scheduleRandomMessage(){


    clearTimeout(idleTimer);



    idleTimer=setTimeout(async()=>{


        const messages=[


            "Are you still here?",

            "I can hear the servers.",

            "Someone is watching us.",

            "Don't trust Terminal-03.",

            "You opened something you shouldn't.",

            "They are lying to you.",

            "I remember you.",

            "...",

            "Can you hear me?",

            "Stay online."


        ];



        await fakeTyping(random(1500,4000));



        await typeMessage(
            messages[random(0,messages.length-1)]
        );



        scheduleRandomMessage();



    }, random(30000,90000));

}



// =======================================
// HELPERS
// =======================================

function sleep(ms){

    return new Promise(
        r=>setTimeout(r,ms)
    );

}



function random(min,max){

    return Math.floor(
        Math.random()*(max-min+1)
    )+min;

}
