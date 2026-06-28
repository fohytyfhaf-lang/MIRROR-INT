// =======================================
// MR.SMILE SPEECH ENGINE v2
// OMEGA SYSTEM
// =======================================

import { searchKnowledge } from "./knowledge.js";

import { getTrust } from "./mrsmileTrust.js";

import {

    canReply,

    getMood,

    randomBehaviour,

    getHonestyChance,

    updatePersonality,

    setLastReply

} from "./personality.js";

import {

    rememberQuestion,

    rememberMessage,

    askedBefore

} from "./mrsmileMemory.js";


// =======================================
// АНАЛИЗ СООБЩЕНИЯ
// =======================================

function normalize(text){

    return text
        .toLowerCase()
        .trim()
        .replace(/[!?.,]/g,"");

}


// =======================================
// ОПРЕДЕЛЕНИЕ НАМЕРЕНИЯ
// =======================================

function detectIntent(text){

    text = normalize(text);

    // приветствие

    if(

        text.includes("привет") ||

        text.includes("hello") ||

        text.includes("hi")

    ){

        return "greeting";

    }

    // вопрос "кто ты"

    if(

        text.includes("кто ты") ||

        text.includes("ты кто")

    ){

        return "identity";

    }

    // помощь

    if(

        text.includes("помоги") ||

        text.includes("help")

    ){

        return "help";

    }

    // файл

    if(

        text.includes("файл") ||

        text.includes("архив") ||

        text.includes("документ")

    ){

        return "file";

    }

    // организация

    if(

        text.includes("omega") ||

        text.includes("организация") ||

        text.includes("система")

    ){

        return "omega";

    }

    // камеры

    if(

        text.includes("камера") ||

        text.includes("camera")

    ){

        return "camera";

    }

    // игра

    if(

        text.includes("игра") ||

        text.includes("game")

    ){

        return "game";

    }

    // сущности

    if(

        text.includes("аномал") ||

        text.includes("entity") ||

        text.includes("существ")

    ){

        return "entity";

    }

    return "unknown";

}


// =======================================
// ДУМАЕТ ЛИ ОН
// =======================================

function thinkingTime(){

    return 1500 + Math.random()*3500;

}


// =======================================
// МОЖЕТ ПРОМОЛЧАТЬ
// =======================================

function shouldIgnore(){

    const behaviour = randomBehaviour();

    if(behaviour==="ignore"){

        return true;

    }

    return false;

}


// =======================================
// ЭМОЦИИ
// =======================================

function addEmotion(text){

    const mood = getMood();

    switch(mood){

        case "hostile":

            return text;

        case "careful":

            return "... " + text;

        case "friendly":

            return text + ".";

        default:

            return text;

    }

}


// =======================================
// ПОВТОРНЫЕ ВОПРОСЫ
// =======================================

function repeatedAnswer(){

    const list=[

        "Ты уже спрашивал.",

        "Ответ не изменился.",

        "Некоторые вопросы не становятся лучше от повторения.",

        "Я помню этот вопрос."

    ];

    return list[
        Math.floor(Math.random()*list.length)
    ];

}


// =======================================
// НЕИЗВЕСТНЫЙ ВОПРОС
// =======================================

function unknownAnswer(){

    const list=[

        "Не могу ответить.",

        "Мне неизвестно.",

        "Даже система не хранит этого.",

        "Иногда отсутствие ответа полезнее.",

        "Я предпочту промолчать."

    ];

    return list[
        Math.floor(Math.random()*list.length)
    ];

}


// =======================================
// ГЛАВНАЯ ФУНКЦИЯ
// =======================================

export async function generateSpeech(playerMessage){

    updatePersonality();

    if(!canReply()){

        return null;

    }

    if(shouldIgnore()){

        return null;

    }

    const question = normalize(playerMessage);

    if(askedBefore(question)){

        return repeatedAnswer();

    }

    rememberQuestion(question);

    const intent = detectIntent(question);

    let reply = null;

    switch(intent){

        case "identity":

            reply = searchKnowledge(question,getTrust());

            break;

        case "omega":

            reply = searchKnowledge(question,getTrust());

            break;

        case "entity":

            reply = searchKnowledge(question,getTrust());

            break;

        case "camera":

            reply = searchKnowledge(question,getTrust());

            break;

        case "file":

            reply = searchKnowledge(question,getTrust());

            break;

        case "game":

            reply = searchKnowledge(question,getTrust());

            break;

        default:

            reply = searchKnowledge(question,getTrust());

    }

    if(reply===null){

        reply = unknownAnswer();

    }

    reply = addEmotion(reply);

    rememberMessage(playerMessage,reply);

    setLastReply(reply);

    await new Promise(resolve=>{

        setTimeout(resolve,thinkingTime());

    });

    return reply;

}
