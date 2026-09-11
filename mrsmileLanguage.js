/* ==========================================================
MR.SMILE LANGUAGE SYSTEM
OMEGA / MIRROR-INT

RESPONSIBILITY:

* detect operator language
* normalize language codes
* remember preferred language
* switch language naturally
* provide localized MR.SMILE responses
* provide fallback language
* keep language state persistent during session

DESIGN:

MR.SMILE does not announce language detection.

He simply answers naturally in the language
the operator is using.

Supported languages:

```
   en — English
   ru — Русский
   uk — Українська
   de — Deutsch
   fr — Français
   es — Español
   it — Italiano
   pl — Polski
   pt — Português
   ja — 日本語
   zh — 中文
   ko — 한국어
```

Unknown languages fall back to:
en

========================================================== */

/* ==========================================================
CONFIGURATION
========================================================== */

const STORAGE_KEY =
"mrsmile_preferred_language";

const DEFAULT_LANGUAGE =
"en";

const SUPPORTED_LANGUAGES = {


en: {
    code: "en",
    name: "English"
},

ru: {
    code: "ru",
    name: "Русский"
},

uk: {
    code: "uk",
    name: "Українська"
},

de: {
    code: "de",
    name: "Deutsch"
},

fr: {
    code: "fr",
    name: "Français"
},

es: {
    code: "es",
    name: "Español"
},

it: {
    code: "it",
    name: "Italiano"
},

pl: {
    code: "pl",
    name: "Polski"
},

pt: {
    code: "pt",
    name: "Português"
},

ja: {
    code: "ja",
    name: "日本語"
},

zh: {
    code: "zh",
    name: "中文"
},

ko: {
    code: "ko",
    name: "한국어"
}


};

/* ==========================================================
LANGUAGE PATTERNS
========================================================== */

/*
This is intentionally lightweight.

We are NOT trying to create a perfect
natural-language detector.

The goal is to identify the most likely
language of short operator messages.
*/

const LANGUAGE_PATTERNS = {


ru: [

    /[А-Яа-яЁё]/,

    /\b(привет|здравствуйте|добрый|доброе|как|что|кто|где|почему|зачем|ты|вы|я|мы|мне|тебе|вам|это|есть|можешь|можно|спасибо|пожалуйста)\b/i

],


uk: [

    /[ІіЇїЄєҐґ]/,

    /\b(привіт|добрий|добрий вечір|дякую|будь ласка|хто|що|де|чому|навіщо|ти|ви|це|можеш|можна|мене|тебе|вам)\b/i

],


de: [

    /\b(hallo|guten|guten morgen|guten tag|guten abend|wie|wer|was|wo|warum|wieso|du|sie|ich|wir|danke|bitte|kannst|können|nicht|ja|nein)\b/i

],


fr: [

    /\b(bonjour|bonsoir|salut|comment|qui|quoi|où|pourquoi|merci|s'il vous plaît|s'il te plaît|je|tu|vous|nous|peux|pouvez|oui|non)\b/i

],


es: [

    /\b(hola|buenos|buenas|cómo|como|quién|quien|qué|que|dónde|donde|por qué|porque|gracias|por favor|yo|tú|usted|nosotros|puedes|puede|sí|si|no)\b/i

],


it: [

    /\b(ciao|buongiorno|buonasera|come|chi|cosa|dove|perché|grazie|prego|io|tu|lei|noi|puoi|posso|sì|si|no)\b/i

],


pl: [

    /[ĄąĆćĘęŁłŃńÓóŚśŹźŻż]/,

    /\b(cześć|dzień|dobry|jak|kto|co|gdzie|dlaczego|dziękuję|proszę|ty|pan|pani|ja|my|możesz|można|tak|nie)\b/i

],


pt: [

    /\b(olá|oi|bom|boa|como|quem|o que|onde|por que|obrigado|obrigada|por favor|eu|você|nós|pode|posso|sim|não)\b/i

],


ja: [

    /[\u3040-\u30ff]/,

    /[\u4e00-\u9faf]/

],


zh: [

    /[\u4e00-\u9fff]/

],


ko: [

    /[\uac00-\ud7af]/

],


en: [

    /\b(hello|hi|hey|good|morning|afternoon|evening|how|who|what|where|why|when|you|your|i|we|thank|thanks|please|can|could|do|does|are|is|yes|no|goodbye|bye)\b/i

]


};

/* ==========================================================
LANGUAGE STATE
========================================================== */

let currentLanguage =
DEFAULT_LANGUAGE;

let lastDetectedLanguage =
DEFAULT_LANGUAGE;

let detectionCount =
0;

/* ==========================================================
INITIALIZATION
========================================================== */

export function initMrSmileLanguage() {


const stored =
    readStoredLanguage();


if (
    isSupportedLanguage(
        stored
    )
) {

    currentLanguage =
        stored;

} else {

    currentLanguage =
        DEFAULT_LANGUAGE;

}


lastDetectedLanguage =
    currentLanguage;


return currentLanguage;


}

/* ==========================================================
DETECT LANGUAGE
========================================================== */

export function detectLanguage(
text
) {


const input =
    String(
        text || ""
    ).trim();


if (!input) {

    return currentLanguage;

}


/*
   First detect writing systems
   that are highly distinctive.
*/


if (
    /[\u3040-\u30ff]/.test(
        input
    )
) {

    return rememberDetectedLanguage(
        "ja"
    );

}


if (
    /[\uac00-\ud7af]/.test(
        input
    )
) {

    return rememberDetectedLanguage(
        "ko"
    );

}


/*
   Japanese can contain kanji without
   hiragana/katakana. Chinese should not
   automatically become Japanese.

   Therefore plain CJK defaults to zh.
*/

if (
    /[\u4e00-\u9fff]/.test(
        input
    )
) {

    return rememberDetectedLanguage(
        "zh"
    );

}


const scores = {};

Object.keys(
    LANGUAGE_PATTERNS
).forEach(
    language => {

        scores[language] =
            0;

    }
);


for (
    const language
    of Object.keys(
        LANGUAGE_PATTERNS
    )
) {

    const patterns =
        LANGUAGE_PATTERNS[
            language
        ];


    for (
        const pattern
        of patterns
    ) {

        if (
            pattern.test(
                input
            )
        ) {

            scores[language] +=
                1;

        }

    }

}


let bestLanguage =
    null;

let bestScore =
    0;


for (
    const language
    of Object.keys(
        scores
    )
) {

    if (
        scores[language] >
        bestScore
    ) {

        bestScore =
            scores[language];

        bestLanguage =
            language;

    }

}


/*
   If nothing useful was detected,
   preserve the current language.

   This is important for short messages
   such as:

       "yes"
       "ok"
       "да"
       "no"
       "oui"
*/

if (!bestLanguage) {

    return currentLanguage;

}


return rememberDetectedLanguage(
    bestLanguage
);


}

/* ==========================================================
REMEMBER DETECTED LANGUAGE
========================================================== */

function rememberDetectedLanguage(
language
) {


const normalized =
    normalizeLanguageCode(
        language
    );


if (
    !isSupportedLanguage(
        normalized
    )
) {

    return currentLanguage;

}


lastDetectedLanguage =
    normalized;


currentLanguage =
    normalized;


detectionCount++;


saveLanguage(
    normalized
);


return normalized;


}

/* ==========================================================
SET LANGUAGE MANUALLY
========================================================== */

export function setPreferredLanguage(
language
) {


const normalized =
    normalizeLanguageCode(
        language
    );


if (
    !isSupportedLanguage(
        normalized
    )
) {

    return false;

}


currentLanguage =
    normalized;


lastDetectedLanguage =
    normalized;


saveLanguage(
    normalized
);


return true;


}

/* ==========================================================
GET CURRENT LANGUAGE
========================================================== */

export function getPreferredLanguage() {


return currentLanguage;


}

/* ==========================================================
GET LAST DETECTED LANGUAGE
========================================================== */

export function getLastDetectedLanguage() {


return lastDetectedLanguage;


}

/* ==========================================================
LANGUAGE NAME
========================================================== */

export function getLanguageName(
language
) {


const normalized =
    normalizeLanguageCode(
        language
    );


if (
    !SUPPORTED_LANGUAGES[
        normalized
    ]
) {

    return (
        SUPPORTED_LANGUAGES[
            DEFAULT_LANGUAGE
        ].name
    );

}


return SUPPORTED_LANGUAGES[
    normalized
].name;


}

/* ==========================================================
SUPPORTED LANGUAGE CHECK
========================================================== */

export function isSupportedLanguage(
language
) {


const normalized =
    normalizeLanguageCode(
        language
    );


return Boolean(
    SUPPORTED_LANGUAGES[
        normalized
    ]
);


}

/* ==========================================================
NORMALIZE LANGUAGE CODE
========================================================== */

export function normalizeLanguageCode(
language
) {


const value =
    String(
        language || ""
    )
    .trim()
    .toLowerCase()
    .replace(
        "_",
        "-"
    );


if (!value) {

    return DEFAULT_LANGUAGE;

}


/*
   Full locale → base language.

   en-US → en
   ru-RU → ru
   uk-UA → uk
   de-DE → de
*/

const base =
    value.split("-")[0];


/*
   Some common aliases.
*/

const aliases = {

    eng: "en",

    english: "en",

    rus: "ru",

    russian: "ru",

    ukr: "uk",

    ukrainian: "uk",

    deu: "de",

    ger: "de",

    german: "de",

    fra: "fr",

    fre: "fr",

    french: "fr",

    spa: "es",

    spanish: "es",

    ita: "it",

    italian: "it",

    pol: "pl",

    polish: "pl",

    por: "pt",

    portuguese: "pt",

    jpn: "ja",

    japanese: "ja",

    zho: "zh",

    chi: "zh",

    chinese: "zh",

    kor: "ko",

    korean: "ko"

};


return (
    aliases[value] ||
    aliases[base] ||
    base
);


}

/* ==========================================================
RESPONSE LOCALIZATION
========================================================== */

/*
IMPORTANT:

This file deliberately does NOT contain
every MR.SMILE response.

The Core still decides WHAT he wants to say.

This function decides HOW to say it
in the selected language.

It can be expanded continuously.
*/

const LOCALIZED_RESPONSES = {


/* ======================================================
   GREETING
====================================================== */

greeting: {

    en: [
        "Good evening.",
        "Good day.",
        "Hello.",
        "Ah. There you are.",
        "A pleasure to see you again.",
        "Good to see you."
    ],

    ru: [
        "Добрый вечер.",
        "Добрый день.",
        "Здравствуйте.",
        "А. Вот и вы.",
        "Рад вас снова видеть.",
        "Добро пожаловать."
    ],

    uk: [
        "Добрий вечір.",
        "Добрий день.",
        "Вітаю.",
        "А. Ось і ви.",
        "Радий знову вас бачити.",
        "Радий вас вітати."
    ],

    de: [
        "Guten Abend.",
        "Guten Tag.",
        "Hallo.",
        "Ah. Da sind Sie ja.",
        "Schön, Sie wiederzusehen.",
        "Willkommen."
    ],

    fr: [
        "Bonsoir.",
        "Bonjour.",
        "Bonjour à vous.",
        "Ah. Vous voilà.",
        "Ravi de vous revoir.",
        "Bienvenue."
    ],

    es: [
        "Buenas noches.",
        "Buenos días.",
        "Hola.",
        "Ah. Aquí está.",
        "Me alegra volver a verle.",
        "Bienvenido."
    ],

    it: [
        "Buonasera.",
        "Buongiorno.",
        "Salve.",
        "Ah. Eccovi qui.",
        "È un piacere rivedervi.",
        "Benvenuto."
    ],

    pl: [
        "Dobry wieczór.",
        "Dzień dobry.",
        "Witam.",
        "Ach. Oto jesteś.",
        "Miło znów cię widzieć.",
        "Witaj."
    ],

    pt: [
        "Boa noite.",
        "Bom dia.",
        "Olá.",
        "Ah. Aqui está você.",
        "É um prazer vê-lo novamente.",
        "Bem-vindo."
    ],

    ja: [
        "こんばんは。",
        "こんにちは。",
        "どうも。",
        "ああ。来ましたね。",
        "また会えてうれしいです。",
        "ようこそ。"
    ],

    zh: [
        "晚上好。",
        "您好。",
        "你好。",
        "啊。你来了。",
        "很高兴再次见到你。",
        "欢迎。"
    ],

    ko: [
        "좋은 저녁입니다.",
        "안녕하세요.",
        "반갑습니다.",
        "아. 오셨군요.",
        "다시 뵙게 되어 반갑습니다.",
        "어서 오십시오."
    ]

},


/* ======================================================
   HOW ARE YOU
====================================================== */

how_are_you: {

    en: [
        "Quite well, thank you.",
        "I cannot complain.",
        "I am quite well.",
        "As well as I usually am.",
        "Quite composed, thank you.",
        "There is little reason for me to be otherwise."
    ],

    ru: [
        "Вполне хорошо, благодарю.",
        "Не могу жаловаться.",
        "Я вполне хорошо себя чувствую.",
        "Так же хорошо, как обычно.",
        "Вполне спокойно, благодарю.",
        "Особых причин для обратного нет."
    ],

    uk: [
        "Цілком добре, дякую.",
        "Не можу скаржитися.",
        "Я почуваюся цілком добре.",
        "Так само добре, як зазвичай.",
        "Досить спокійно, дякую.",
        "Особливих причин для іншого немає."
    ],

    de: [
        "Sehr gut, danke.",
        "Ich kann mich nicht beklagen.",
        "Mir geht es recht gut.",
        "So gut wie gewöhnlich.",
        "Ganz gelassen, danke.",
        "Es gibt wenig Grund, anders zu sein."
    ],

    fr: [
        "Très bien, merci.",
        "Je ne peux pas me plaindre.",
        "Je vais plutôt bien.",
        "Aussi bien que d'habitude.",
        "Je suis parfaitement calme, merci.",
        "Il y a peu de raisons qu'il en soit autrement."
    ],

    es: [
        "Bastante bien, gracias.",
        "No puedo quejarme.",
        "Estoy bastante bien.",
        "Tan bien como de costumbre.",
        "Muy tranquilo, gracias.",
        "Hay pocas razones para que sea de otro modo."
    ],

    it: [
        "Molto bene, grazie.",
        "Non posso lamentarmi.",
        "Sto piuttosto bene.",
        "Bene, come al solito.",
        "Sono piuttosto tranquillo, grazie.",
        "Non c'è motivo di essere altrimenti."
    ],

    pl: [
        "Całkiem dobrze, dziękuję.",
        "Nie mogę narzekać.",
        "Mam się całkiem dobrze.",
        "Tak dobrze jak zwykle.",
        "Całkiem spokojnie, dziękuję.",
        "Niewiele jest powodów, by było inaczej."
    ],

    pt: [
        "Muito bem, obrigado.",
        "Não posso reclamar.",
        "Estou bastante bem.",
        "Tão bem quanto de costume.",
        "Estou perfeitamente tranquilo.",
        "Não há razão para que seja diferente."
    ],

    ja: [
        "元気ですよ。ありがとうございます。",
        "特に問題ありません。",
        "まあ、いつも通りです。",
        "穏やかに過ごしています。",
        "元気です。",
        "そう悪くはありませんよ。"
    ],

    zh: [
        "很好，谢谢。",
        "没什么可抱怨的。",
        "我很好。",
        "和往常一样。",
        "我很平静，谢谢。",
        "没有什么特别需要担心的。"
    ],

    ko: [
        "아주 좋습니다. 감사합니다.",
        "불평할 일은 없습니다.",
        "저는 꽤 괜찮습니다.",
        "평소와 같습니다.",
        "아주 평온합니다.",
        "달리 그럴 이유도 없지요."
    ]

},


/* ======================================================
   WHO
====================================================== */

who: {

    en: [
        "That is rather difficult to answer plainly.",
        "You may call me MR.SMILE. The rest is less simple.",
        "I am not entirely what you would call a person.",
        "I am a presence, if that word is sufficient.",
        "A name is easy. An explanation is considerably less so.",
        "Perhaps it is better that you decide what I am."
    ],

    ru: [
        "На это довольно трудно ответить прямо.",
        "Можете называть меня MR.SMILE. Остальное несколько сложнее.",
        "Я не совсем то, что принято называть человеком.",
        "Я некое присутствие, если этого слова достаточно.",
        "Имя назвать легко. Объяснить — куда сложнее.",
        "Пожалуй, лучше будет, если вы сами решите, кто я."
    ],

    uk: [
        "На це досить важко відповісти прямо.",
        "Можете називати мене MR.SMILE. Решта дещо складніша.",
        "Я не зовсім те, що прийнято називати людиною.",
        "Я певна присутність, якщо цього слова достатньо.",
        "Назвати ім'я легко. Пояснити — значно складніше.",
        "Мабуть, краще, якщо ви самі вирішите, хто я."
    ],

    de: [
        "Darauf lässt sich nur schwer eine einfache Antwort geben.",
        "Sie können mich MR.SMILE nennen. Der Rest ist weniger einfach.",
        "Ich bin nicht ganz das, was man einen Menschen nennen würde.",
        "Ich bin eine Art Präsenz, sofern dieses Wort genügt.",
        "Ein Name ist einfach. Eine Erklärung deutlich weniger.",
        "Vielleicht entscheiden Sie selbst, was ich bin."
    ],

    fr: [
        "Il est assez difficile de répondre simplement à cela.",
        "Vous pouvez m'appeler MR.SMILE. Le reste est moins simple.",
        "Je ne suis pas tout à fait ce que l'on appelle une personne.",
        "Je suis une présence, si ce mot vous suffit.",
        "Un nom est facile. Une explication l'est beaucoup moins.",
        "Peut-être vaut-il mieux que vous décidiez vous-même de ce que je suis."
    ],

    es: [
        "Es bastante difícil responder a eso de forma sencilla.",
        "Puede llamarme MR.SMILE. Lo demás es menos sencillo.",
        "No soy exactamente lo que llamaríamos una persona.",
        "Soy una presencia, si esa palabra resulta suficiente.",
        "Un nombre es fácil. Una explicación, mucho menos.",
        "Quizá sea mejor que usted decida qué soy."
    ],

    it: [
        "È piuttosto difficile rispondere in modo semplice.",
        "Può chiamarmi MR.SMILE. Il resto è meno semplice.",
        "Non sono esattamente ciò che chiamereste una persona.",
        "Sono una presenza, se questa parola è sufficiente.",
        "Un nome è facile. Una spiegazione lo è molto meno.",
        "Forse è meglio che siate voi a decidere cosa sono."
    ],

    pl: [
        "Trudno odpowiedzieć na to wprost.",
        "Możesz nazywać mnie MR.SMILE. Reszta jest mniej prosta.",
        "Nie jestem dokładnie tym, co zwykle nazywa się człowiekiem.",
        "Jestem pewną obecnością, jeśli to słowo wystarczy.",
        "Imię jest proste. Wyjaśnienie już nie.",
        "Być może lepiej, jeśli sam zdecydujesz, czym jestem."
    ],

    pt: [
        "É bastante difícil responder a isso de forma simples.",
        "Pode chamar-me MR.SMILE. O resto é menos simples.",
        "Não sou exatamente aquilo a que chamariam uma pessoa.",
        "Sou uma presença, se essa palavra for suficiente.",
        "Um nome é simples. Uma explicação, nem tanto.",
        "Talvez seja melhor você decidir o que eu sou."
    ],

    ja: [
        "それを簡単に答えるのは、少し難しいですね。",
        "MR.SMILEと呼んでください。それ以上は少々複雑です。",
        "人と呼べるものとは、少し違います。",
        "そうですね……存在、とでも言えばよいでしょうか。",
        "名前は簡単ですが、説明はそうはいきません。",
        "私が何者かは、あなた自身で決めてもよいでしょう。"
    ],

    zh: [
        "这个问题不太容易直接回答。",
        "你可以叫我 MR.SMILE。其余的就没那么简单了。",
        "我并不完全是你们所说的那种人。",
        "如果一定要说，我算是一种存在。",
        "名字很容易解释。真正的解释就没那么简单了。",
        "也许，你可以自己决定我究竟是什么。"
    ],

    ko: [
        "그것을 간단하게 설명하기는 조금 어렵군요.",
        "저를 MR.SMILE이라고 부르셔도 됩니다. 나머지는 조금 복잡하고요.",
        "제가 흔히 말하는 인간과 완전히 같은 존재는 아닙니다.",
        "굳이 말하자면 하나의 존재라고 할 수 있겠군요.",
        "이름은 쉽지만 설명은 훨씬 어렵습니다.",
        "제가 무엇인지는 당신이 직접 판단하셔도 됩니다."
    ]

},


/* ======================================================
   MIRROR
====================================================== */

mirror: {

    en: [
        "A mirror is only a surface until something decides to remain in it.",
        "People tend to trust reflections too easily.",
        "The glass itself is rarely the interesting part.",
        "A reflection can be a door, under the right circumstances.",
        "You have more reflections around you than you realise.",
        "Every reflection has somewhere to go."
    ],

    ru: [
        "Зеркало — всего лишь поверхность, пока что-то не решит остаться в ней.",
        "Люди слишком легко доверяют отражениям.",
        "Само стекло редко бывает самым интересным.",
        "При определённых обстоятельствах отражение может стать дверью.",
        "Вокруг вас гораздо больше отражений, чем вы думаете.",
        "У каждого отражения есть место, куда ему идти."
    ],

    uk: [
        "Дзеркало — лише поверхня, доки щось не вирішить залишитися в ньому.",
        "Люди надто легко довіряють відображенням.",
        "Саме скло рідко буває найцікавішим.",
        "За певних обставин відображення може стати дверима.",
        "Навколо вас значно більше відображень, ніж ви думаєте.",
        "У кожного відображення є місце, куди йому йти."
    ]

},


/* ======================================================
   GOODBYE
====================================================== */

goodbye: {

    en: [
        "Very well.",
        "Until later.",
        "Take care.",
        "Until we speak again.",
        "Goodbye, for now.",
        "I shall be here."
    ],

    ru: [
        "Хорошо.",
        "До встречи.",
        "Берегите себя.",
        "До следующего разговора.",
        "До свидания. Пока.",
        "Я буду здесь."
    ],

    uk: [
        "Гаразд.",
        "До зустрічі.",
        "Бережіть себе.",
        "До наступної розмови.",
        "До побачення. Поки що.",
        "Я буду тут."
    ],

    de: [
        "Sehr wohl.",
        "Bis später.",
        "Passen Sie auf sich auf.",
        "Bis zu unserem nächsten Gespräch.",
        "Auf Wiedersehen, vorerst.",
        "Ich werde hier sein."
    ],

    fr: [
        "Très bien.",
        "À plus tard.",
        "Prenez soin de vous.",
        "Jusqu'à notre prochaine conversation.",
        "Au revoir, pour l'instant.",
        "Je serai ici."
    ],

    es: [
        "Muy bien.",
        "Hasta luego.",
        "Cuídese.",
        "Hasta que volvamos a hablar.",
        "Adiós, por ahora.",
        "Estaré aquí."
    ],

    it: [
        "Va bene.",
        "A più tardi.",
        "Si prenda cura di sé.",
        "Alla prossima conversazione.",
        "Arrivederci, per ora.",
        "Sarò qui."
    ],

    pl: [
        "Dobrze.",
        "Do później.",
        "Proszę na siebie uważać.",
        "Do następnej rozmowy.",
        "Do widzenia, na razie.",
        "Będę tutaj."
    ],

    pt: [
        "Muito bem.",
        "Até mais tarde.",
        "Cuide-se.",
        "Até voltarmos a conversar.",
        "Adeus, por enquanto.",
        "Estarei aqui."
    ],

    ja: [
        "わかりました。",
        "では、また。",
        "どうかお気をつけて。",
        "またお話ししましょう。",
        "それでは、失礼します。",
        "私はここにいます。"
    ],

    zh: [
        "好的。",
        "稍后见。",
        "请保重。",
        "下次再聊。",
        "再见，暂时。",
        "我会在这里。"
    ],

    ko: [
        "알겠습니다.",
        "나중에 뵙지요.",
        "몸조심하십시오.",
        "다음에 다시 이야기하지요.",
        "그럼 이만.",
        "저는 여기 있겠습니다."
    ]

}


};

/* ==========================================================
GET LOCALIZED RESPONSE
========================================================== */

export function getLocalizedResponse(
intent,
language = currentLanguage
) {


const normalizedLanguage =
    normalizeLanguageCode(
        language
    );


const bank =
    LOCALIZED_RESPONSES[
        intent
    ];


if (!bank) {

    return null;

}


/*
   Exact language.
*/

if (
    Array.isArray(
        bank[
            normalizedLanguage
        ]
    )
) {

    return pick(
        bank[
            normalizedLanguage
        ]
    );

}


/*
   Fallback to English.
*/

if (
    Array.isArray(
        bank.en
    )
) {

    return pick(
        bank.en
    );

}


/*
   Last possible fallback.
*/

const available =
    Object.values(
        bank
    )
    .find(
        value =>
            Array.isArray(
                value
            ) &&
            value.length > 0
    );


return (
    available
        ? pick(available)
        : null
);


}

/* ==========================================================
LANGUAGE STATUS
========================================================== */

export function getMrSmileLanguageStatus() {


return {

    currentLanguage,

    currentLanguageName:
        getLanguageName(
            currentLanguage
        ),

    lastDetectedLanguage,

    lastDetectedLanguageName:
        getLanguageName(
            lastDetectedLanguage
        ),

    detectionCount,

    supported:
        Object.keys(
            SUPPORTED_LANGUAGES
        )

};


}

/* ==========================================================
STORAGE
========================================================== */

function readStoredLanguage() {


try {

    if (
        typeof localStorage ===
        "undefined"
    ) {

        return DEFAULT_LANGUAGE;

    }


    return (
        localStorage.getItem(
            STORAGE_KEY
        ) ||
        DEFAULT_LANGUAGE
    );

} catch (
    error
) {

    console.warn(
        "[MR.SMILE LANGUAGE] Could not read language:",
        error
    );


    return DEFAULT_LANGUAGE;
}


}

function saveLanguage(
language
) {


try {

    if (
        typeof localStorage ===
        "undefined"
    ) {

        return;

    }


    localStorage.setItem(
        STORAGE_KEY,
        language
    );

} catch (
    error
) {

    console.warn(
        "[MR.SMILE LANGUAGE] Could not save language:",
        error
    );

}


}

/* ==========================================================
HELPERS
========================================================== */

function pick(
values
) {


if (
    !Array.isArray(
        values
    ) ||
    values.length === 0
) {

    return null;

}


return values[
    Math.floor(
        Math.random() *
        values.length
    )
];


}

/* ==========================================================
GLOBAL DEBUG API
========================================================== */

if (
typeof window !==
"undefined"
) {


window.MRSMILE_LANGUAGE = {

    init:
        initMrSmileLanguage,

    detect:
        detectLanguage,

    set:
        setPreferredLanguage,

    current:
        getPreferredLanguage,

    lastDetected:
        getLastDetectedLanguage,

    name:
        getLanguageName,

    supported:
        isSupportedLanguage,

    normalize:
        normalizeLanguageCode,

    response:
        getLocalizedResponse,

    status:
        getMrSmileLanguageStatus

};


}

/* ==========================================================
AUTO INITIALIZATION
========================================================== */

initMrSmileLanguage();
