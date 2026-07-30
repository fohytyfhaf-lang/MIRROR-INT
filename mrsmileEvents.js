// =======================================
// MR.SMILE EVENT SYSTEM
// =======================================

import { typeSystemMessage } from "./mrsmileChat.js";
import { getTrust } from "./mrsmileTrust.js";
import { getMemory } from "./mrsmileMemory.js";

let running = false;

export function initMrSmileEvents() {

    if (running) return;
    running = true;

    console.log("[MR.SMILE EVENTS] Started");

    nightLoop();
    glitchLoop();
    idleLoop();
    observationLoop();

}

// =======================================
// NIGHT
// =======================================

function nightLoop(){

    setInterval(()=>{

        const hour=new Date().getHours();

        if(hour>=22 || hour<=5){

            if(Math.random()<0.20){

                typeSystemMessage(pick([

                    "Unusual activity detected.",
                    "Someone is moving.",
                    "Security cameras lost signal.",
                    "An unknown process has awakened."

                ]));

            }

        }

    },30000);

}

// =======================================
// GLITCH
// =======================================

function glitchLoop(){

    setInterval(()=>{

        if(Math.random()>0.08)
            return;

        document.body.classList.add("screenGlitch");

        setTimeout(()=>{

            document.body.classList.remove("screenGlitch");

        },250);

        typeSystemMessage(pick([

            "Signal unstable.",
            "Connection interrupted.",
            "Data corruption detected.",
            "Unknown interference."

        ]));

    },45000);

}

// =======================================
// PLAYER OBSERVATION
// =======================================

function observationLoop(){

    setInterval(()=>{

        const memory=getMemory();

        if(memory.openedFiles.length>5){

            if(Math.random()<0.25){

                typeSystemMessage(

                    "MR.SMILE: You seem interested in our archives."

                );

            }

        }

    },60000);

}

// =======================================
// IDLE
// =======================================

function idleLoop(){

    setInterval(()=>{

        if(Math.random()>0.12)
            return;

        const trust=getTrust();

        if(trust>70){

            typeSystemMessage(

                "MR.SMILE: I was wondering when you would return."

            );

        }else{

            typeSystemMessage(

                "..."

            );

        }

    },90000);

}

// =======================================

function pick(arr){

    return arr[Math.floor(Math.random()*arr.length)];

}


