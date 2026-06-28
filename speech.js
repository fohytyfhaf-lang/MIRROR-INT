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
// =======================================
// MR.SMILE SPEECH ENGINE v2 — PART 2
// DECISION LAYER
// =======================================

import { getTrust, canGiveGame, canRevealLore, canUnlockFiles } from "./mrsmileTrust.js";

import { getMemory, findMemory, openedFile } from "./mrsmileMemory.js";

import { getPersonality, increaseCuriosity, annoy } from "./personality.js";

import { getKnowledge } from "./knowledge.js";

import { getSecretHint, getGameLink } from "./secrets.js";


// =======================================
// ВНУТРЕННЯЯ ЛОГИКА ОТВЕТОВ
// =======================================

function shouldBeVague() {

    const trust = getTrust();

    const personality = getPersonality();

    // чем меньше доверие — тем более размыто

    if (trust < 10) return true;

    if (personality.irritation > 3) return true;

    if (Math.random() < 0.2) return true;

    return false;

}


// =======================================
// ПРОВЕРКА СЕКРЕТОВ
// =======================================

function trySecretResponse(intent, text) {

    const trust = getTrust();

    // доступ к игре

    if (intent === "game" && canGiveGame()) {

        return "Я могу дать тебе доступ... но не сейчас.";

    }

    // лор

    if (intent === "omega" && canRevealLore()) {

        return "OMEGA — это не просто система наблюдения.";

    }

    // файлы

    if (intent === "file" && canUnlockFiles()) {

        return "Некоторые файлы теперь доступны тебе.";

    }

    return null;

}


// =======================================
// РЕАКЦИЯ НА ПАМЯТЬ
// =======================================

function memoryReaction(text) {

    const history = findMemory("questions");

    if (history.length > 5) {

        return "Ты задаешь много вопросов...";

    }

    const files = findMemory("file");

    if (files.length > 3) {

        return "Ты часто открываешь файлы.";

    }

    return null;

}


// =======================================
// ОШИБКА СИСТЕМЫ (редкие события)
// =======================================

function systemGlitch() {

    if (Math.random() < 0.05) {

        const glitches = [

            "[SYSTEM] interference detected",

            "[OMEGA] signal unstable",

            "..."

        ];

        return glitches[Math.floor(Math.random()*glitches.length)];

    }

    return null;

}


// =======================================
// ВЫБОР СТИЛЯ ОТВЕТА
// =======================================

function styleResponse(text) {

    const trust = getTrust();

    if (trust < 0) {

        return "...";

    }

    if (trust < 10) {

        return "Я не уверен, что должен это говорить.";

    }

    if (trust < 30) {

        return text;

    }

    if (trust < 60) {

        return text + " ...если тебе это важно.";

    }

    return text;

}


// =======================================
// ГЕНЕРАЦИЯ ОТВЕТА УРОВНЕМ ВЫШЕ
// =======================================

export function processSpeech(baseReply, intent, playerText) {

    let reply = baseReply;

    const secret = trySecretResponse(intent, playerText);

    if (secret) {

        return secret;

    }

    const memory = memoryReaction(playerText);

    if (memory) {

        reply = memory;

    }

    const glitch = systemGlitch();

    if (glitch) {

        reply = glitch;

    }

    if (shouldBeVague()) {

        reply = "…";

    }

    reply = styleResponse(reply);

    increaseCuriosity();

    if (Math.random() < 0.1) {

        annoy();

    }

    return reply;

}

