// mrsmileChat.js

let memory = [];
let trust = 20;

// если он "молчит"
let silenceMode = false;

// задержка ответов
let lastMessageTime = 0;

// шанс ответа
function shouldRespond() {
  const chance = Math.min(0.2 + trust / 200, 0.8);
  return Math.random() < chance;
}

// задержка "живого мышления"
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/* =========================
   ПУБЛИЧНЫЙ API
========================= */

// игрок пишет сообщение сюда
export async function mrSmileSay(text) {
  addMemory("PLAYER: " + text);

  const log = document.getElementById("chatLog");
  if (!log) return;

  // если режим молчания активен
  if (silenceMode) {
    maybeBreakSilence();
    return;
  }

  // иногда игнорирует сразу
  if (!shouldRespond()) {
    addMemory("MRSMILE: ... (ignored)");
    return;
  }

  // "задержка мышления"
  const thinkingTime = 1500 + Math.random() * 4000;
  await delay(thinkingTime);

  const response = generateResponse(text);

  if (!response) {
    addMemory("MRSMILE: silence");
    return;
  }

  log.innerText += "\nMR.SMILE: " + response;
  addMemory("MRSMILE: " + response);

  lastMessageTime = Date.now();
}

/* =========================
   ЛОГИКА ОТВЕТОВ
========================= */

function generateResponse(text) {
  const t = text.toLowerCase();

  // игнор "опасных" вопросов
  if (t.includes("who created") || t.includes("real name")) {
    return pick([
      "Not something I can explain.",
      "That part is missing.",
      "You wouldn't understand the full answer."
    ]);
  }

  // вопрос про него
  if (t.includes("who are you")) {
    return pick([
      "I was here before the folders.",
      "A trace that remained.",
      "You can call me what the system calls me."
    ]);
  }

  // вопросы про помощь
  if (t.includes("help")) {
    return pick([
      "I can, if you listen.",
      "Not always.",
      "Sometimes helping is dangerous."
    ]);
  }

  // системные ответы
  if (t.includes("system")) {
    return pick([
      "It changes when you're not looking.",
      "Some parts are missing.",
      "Don't trust its silence."
    ]);
  }

  // случайные ответы
  return pick([
    "...",
    "I see.",
    "Maybe.",
    "You keep asking that.",
    "It depends."
  ]);
}

/* =========================
   ПАМЯТЬ
========================= */

function addMemory(msg) {
  memory.push({
    msg,
    time: Date.now()
  });

  if (memory.length > 50) {
    memory.shift();
  }
}

export function getMemory() {
  return memory;
}

/* =========================
   МОЛЧАНИЕ
========================= */

function maybeBreakSilence() {
  const log = document.getElementById("chatLog");
  if (!log) return;

  const chance = 0.3 + trust / 300;

  if (Math.random() < chance) {
    silenceMode = false;

    log.innerText += "\nMR.SMILE: ...";
    log.innerText += "\nMR.SMILE: I am here.";
  }
}

/* =========================
   УПРАВЛЕНИЕ ДОВЕРИЕМ
========================= */

export function addTrust(value) {
  trust += value;
  trust = Math.max(0, Math.min(100, trust));

  if (trust < 10) silenceMode = true;
  if (trust > 60) silenceMode = false;
}

export function getTrust() {
  return trust;
}

/* =========================
   УТИЛИТЫ
========================= */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
