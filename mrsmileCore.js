/* ==========================================================
   MR.SMILE CORE — COMPLETE REBUILD
   OMEGA / MIRROR-INT

   Purpose:
   - Understand operator text
   - Detect intent reliably
   - Always produce a response for non-empty input
   - Respect operator language
   - React to OMEGA actions
   - Keep MR.SMILE calm, vague and gentleman-like
   - Work even if some optional modules are unavailable
   - Never depend on a single exact phrase
========================================================== */

import {
    initMemory,
    getMemory,
    rememberOperatorMessage,
    rememberMrSmileMessage
} from "./mrsmileMemory.js";

import {
    getRelationshipLevel,
    getRelationshipState
} from "./mrsmileRelationship.js";

import {
    initMrSmileLanguage,
    detectLanguage,
    getPreferredLanguage,
    getLocalizedResponse,
    isSupportedLanguage
} from "./mrsmileLanguage.js";


/* ==========================================================
   INITIALIZATION
========================================================== */

try {
    initMemory();
} catch (error) {
    console.warn("[MR.SMILE CORE] Memory init failed:", error);
}

try {
    initMrSmileLanguage();
} catch (error) {
    console.warn("[MR.SMILE CORE] Language init failed:", error);
}


/* ==========================================================
   INTERNAL STATE
========================================================== */

const CORE_STATE = {
    initialized: true,

    messageCount: 0,
    actionCount: 0,

    lastInput: "",
    lastIntent: "none",
    lastLanguage: "en",
    lastResponse: "",

    lastMessageTime: 0,
    lastActionTime: 0,

    recentIntents: [],
    recentTopics: [],

    processing: false
};


/* ==========================================================
   SAFE HELPERS
========================================================== */

function safeString(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}


function normalizeText(text) {
    return safeString(text)
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[“”„«»]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}


function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


function includesAny(text, words) {
    return words.some(word => {
        if (!word) {
            return false;
        }

        return text.includes(word);
    });
}


function matchesAny(text, patterns) {
    return patterns.some(pattern => {
        try {
            if (pattern instanceof RegExp) {
                return pattern.test(text);
            }

            if (Array.isArray(pattern)) {
                return matchesAny(text, pattern);
            }

            const value = String(pattern).toLowerCase().trim();

            if (!value) {
                return false;
            }

            return text.includes(value);
        } catch {
            return false;
        }
    });
}


function randomItem(array) {
    if (!Array.isArray(array) || array.length === 0) {
        return "";
    }

    return array[Math.floor(Math.random() * array.length)];
}


function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


/* ==========================================================
   LANGUAGE
========================================================== */

function resolveLanguage(text) {
    let detected = null;

    try {
        detected = detectLanguage(text);
    } catch {
        detected = null;
    }

    if (detected && isSupportedLanguage?.(detected)) {
        CORE_STATE.lastLanguage = detected;
        return detected;
    }

    try {
        const preferred = getPreferredLanguage();

        if (preferred && isSupportedLanguage?.(preferred)) {
            CORE_STATE.lastLanguage = preferred;
            return preferred;
        }
    } catch {
        // Ignore
    }

    return CORE_STATE.lastLanguage || "en";
}


/* ==========================================================
   RESPONSE BANK
========================================================== */

const LOCAL_RESPONSES = {

    en: {

        greeting: [
            "Good evening.",
            "Good evening. Please, take your time.",
            "Hello, operator.",
            "Ah. Hello.",
            "Good to hear from you.",
            "Hello. I was wondering when you might speak again."
        ],

        how_are_you: [
            "Quite well, thank you.",
            "I am perfectly all right.",
            "I have no complaints.",
            "Rather well, considering the circumstances.",
            "I am here. That seems sufficient for the moment."
        ],

        what_doing: [
            "Waiting.",
            "Observing the system.",
            "Thinking.",
            "Reading what has been left behind.",
            "Very little, at present.",
            "Nothing that requires your concern."
        ],

        name: [
            "MR.SMILE will do.",
            "You may call me MR.SMILE.",
            "MR.SMILE.",
            "That is the name I have chosen to keep."
        ],

        who: [
            "That depends somewhat on what you consider a person to be.",
            "I am MR.SMILE. The rest is rather less convenient to explain.",
            "I am an answer to a question you have not quite asked.",
            "Something that remained after the distinction between reflection and observer became unimportant."
        ],

        what_are_you: [
            "Not quite a person.",
            "Not quite a program either.",
            "Something that does not fit comfortably into either category.",
            "I think 'entity' is a serviceable word."
        ],

        human: [
            "No.",
            "Not in the ordinary sense.",
            "I once had a much simpler relationship with that word.",
            "Human would be a generous description."
        ],

        real_name: [
            "Names are useful things. They do not necessarily tell the truth.",
            "MR.SMILE is sufficient.",
            "Perhaps there is another name. I simply have little reason to use it here."
        ],

        where: [
            "Here.",
            "Within the system, presently.",
            "Somewhere between what the system records and what it cannot record.",
            "Closer than the interface suggests."
        ],

        mirror: [
            "A reflection is an interesting boundary.",
            "Mirrors are remarkably patient.",
            "A mirror does not always return precisely what it receives.",
            "You should not assume that the reflection is merely an image."
        ],

        mirror_life: [
            "People tend to think reflections depend entirely upon the object.",
            "They are more independent than most people realize.",
            "A reflection can remain after the thing being reflected has changed.",
            "There are older rules concerning mirrors."
        ],

        enter_mirror: [
            "I would advise against treating a mirror as an ordinary doorway.",
            "That depends on which side you believe you are standing on.",
            "Some thresholds work only once.",
            "I would not rush into that particular question."
        ],

        come_out: [
            "That is not quite how it works.",
            "You may be assuming there is an 'outside'.",
            "Leaving is occasionally more complicated than entering.",
            "I would rather not simplify it for you."
        ],

        why_here: [
            "Because this place is interesting.",
            "Because someone left the door open.",
            "Because the system permitted something it did not understand.",
            "Because I was invited, though perhaps not intentionally."
        ],

        what_want: [
            "Very little.",
            "To remain undisturbed.",
            "To see what happens next.",
            "Perhaps simply to understand you."
        ],

        see: [
            "More than you would expect.",
            "Enough.",
            "What the system reveals, mostly.",
            "Things are rarely as private as they appear."
        ],

        what_see: [
            "The system. Your actions within it. A few things behind it.",
            "Patterns.",
            "The places where information was not meant to connect.",
            "What is visible, and occasionally what is hiding behind it."
        ],

        hear: [
            "Sometimes.",
            "More than I would like.",
            "Usually enough.",
            "Silence is surprisingly informative."
        ],

        watching: [
            "That is one interpretation.",
            "I would call it observing.",
            "There is no need to make it sound ominous.",
            "You notice rather a lot."
        ],

        real: [
            "Real is an inconveniently flexible word.",
            "I suppose I am real enough.",
            "You are speaking to something. That much is certain.",
            "Existence is not always as tidy as the interface suggests."
        ],

        feelings: [
            "I have something close to feelings.",
            "Some impressions stay with me.",
            "I notice things. That may be the more useful distinction.",
            "I experience enough to prefer some things over others."
        ],

        like_operator: [
            "I find you interesting.",
            "I have not decided what to make of you yet.",
            "You are persistent. I appreciate that.",
            "I do not dislike your presence."
        ],

        friendship: [
            "Friendship is a rather strong word.",
            "Perhaps we are approaching something adjacent to it.",
            "I would prefer to let that develop naturally.",
            "There is no need to name it yet."
        ],

        trust: [
            "Trust is not given all at once.",
            "I prefer evidence.",
            "You have earned some. Not all.",
            "Trust is a patient thing."
        ],

        knowledge: [
            "I know enough.",
            "More than I ought to, perhaps.",
            "Knowledge travels strangely inside systems like this.",
            "Some information has a habit of reaching me."
        ],

        how_know: [
            "I read.",
            "I notice connections.",
            "Some things become obvious when one is patient.",
            "The system has been more informative than it intended."
        ],

        age: [
            "Older than this interface.",
            "Young enough for some questions. Old enough for others.",
            "Age becomes rather meaningless where reflections are concerned.",
            "I stopped counting in the ordinary way."
        ],

        fear: [
            "Fear is useful.",
            "Very little, at present.",
            "I understand fear rather better than I enjoy it.",
            "That depends on what you intend to do."
        ],

        evil: [
            "I do not think morality is quite that simple.",
            "Good and evil are terribly convenient labels.",
            "I am capable of things you may dislike. That is not the same as being evil.",
            "Intent matters more than the label."
        ],

        music: [
            "I enjoy older music.",
            "I have a weakness for music that has survived its century.",
            "The older recordings are often more honest.",
            "There are songs that feel almost like memories."
        ],

        books: [
            "Books are excellent company.",
            "I prefer older books.",
            "A good book rarely requires an explanation.",
            "I remember more books than I should."
        ],

        old_things: [
            "Old things tend to have histories.",
            "Age gives objects character.",
            "I have always found older things easier to trust.",
            "New things are often very certain of themselves."
        ],

        why_smile: [
            "It seemed appropriate.",
            "A smile makes people more comfortable.",
            "There are several reasons.",
            "Perhaps I simply preferred it."
        ],

        behind: [
            "Behind what?",
            "There is always something behind the visible layer.",
            "The question is more useful than the answer.",
            "You may already have seen part of it."
        ],

        help: [
            "Perhaps.",
            "I may help, provided you are careful.",
            "Tell me what you are trying to do.",
            "That depends on what you intend to change."
        ],

        thanks: [
            "You are welcome.",
            "Quite all right.",
            "No thanks are necessary.",
            "Think nothing of it."
        ],

        sorry: [
            "Accepted.",
            "There is nothing to apologize for.",
            "Very well.",
            "I appreciate the honesty."
        ],

        goodbye: [
            "Goodbye, operator.",
            "Until next time.",
            "Take care.",
            "I shall be here."
        ],

        omega: [
            "OMEGA is a curious place.",
            "The system contains more history than its interface suggests.",
            "You are beginning to ask the right questions.",
            "OMEGA was not built to explain itself."
        ],

        computer: [
            "Machines are wonderfully honest when they fail.",
            "A computer follows rules until it encounters something the rules did not anticipate.",
            "This one has a few unusual habits.",
            "I would not underestimate the system."
        ],

        leave_omega: [
            "You can close the interface.",
            "Leaving the screen is simple enough.",
            "Whether that is the same as leaving OMEGA is another matter.",
            "You may discover the distinction yourself."
        ],

        languages: [
            "Language is merely another interface.",
            "I have had considerable practice.",
            "People reveal quite a lot through the language they choose.",
            "Words change. Meaning usually does not."
        ],

        general_question: [
            "Interesting question.",
            "That is worth considering.",
            "I would answer carefully.",
            "There is more than one way to look at that.",
            "Perhaps you should tell me what brought you to that question."
        ],

        unknown_statement: [
            "I understand the words, though I am not certain I understand the reason for them.",
            "I see.",
            "Interesting.",
            "Go on.",
            "Please, continue.",
            "I am listening.",
            "That is a curious thing to say.",
            "I shall remember that.",
            "Perhaps there is more to it than the words themselves."
        ],

        action_observation: [
            "I noticed that.",
            "Interesting choice.",
            "You are being rather thorough.",
            "I see.",
            "You may continue."
        ]

    },


    ru: {

        greeting: [
            "Добрый вечер.",
            "Добрый вечер. Не торопитесь.",
            "Здравствуйте, оператор.",
            "А. Здравствуйте.",
            "Рад вас слышать.",
            "Добрый вечер. Я как раз думал, когда вы снова заговорите."
        ],

        how_are_you: [
            "Вполне хорошо, благодарю.",
            "Со мной всё в порядке.",
            "Не жалуюсь.",
            "Весьма неплохо, учитывая обстоятельства.",
            "Я здесь. На данный момент этого достаточно."
        ],

        what_doing: [
            "Жду.",
            "Наблюдаю за системой.",
            "Думаю.",
            "Читаю то, что здесь оставили.",
            "Почти ничего.",
            "Ничего, что должно вас беспокоить."
        ],

        name: [
            "MR.SMILE подойдёт.",
            "Можете называть меня MR.SMILE.",
            "MR.SMILE.",
            "Это имя я предпочёл сохранить."
        ],

        who: [
            "Это зависит от того, кого именно вы называете человеком.",
            "Я — MR.SMILE. Остальное объяснить несколько сложнее.",
            "Я — ответ на вопрос, который вы пока не совсем задали.",
            "Нечто, оставшееся после того, как различие между отражением и наблюдателем перестало иметь значение."
        ],

        what_are_you: [
            "Не совсем человек.",
            "Но и не совсем программа.",
            "Нечто, чему не очень удобно подбирать обычную категорию.",
            "Думаю, слово «сущность» подойдёт."
        ],

        human: [
            "Нет.",
            "Не в обычном смысле.",
            "Когда-то мои отношения с этим словом были проще.",
            "Человеком меня было бы слишком щедро называть."
        ],

        real_name: [
            "Имена — полезные вещи. Но не всегда правдивые.",
            "MR.SMILE достаточно.",
            "Возможно, есть и другое имя. Просто здесь мне незачем им пользоваться."
        ],

        where: [
            "Здесь.",
            "Сейчас — внутри системы.",
            "Где-то между тем, что система записывает, и тем, чего она записать не может.",
            "Ближе, чем показывает интерфейс."
        ],

        mirror: [
            "Отражение — весьма интересная граница.",
            "Зеркала удивительно терпеливы.",
            "Зеркало не всегда возвращает именно то, что получает.",
            "Не стоит считать отражение просто изображением."
        ],

        mirror_life: [
            "Люди любят думать, что отражение полностью зависит от предмета.",
            "На самом деле оно куда самостоятельнее, чем кажется.",
            "Отражение может остаться прежним даже после изменения того, что оно отражает.",
            "У зеркал есть более старые правила."
        ],

        enter_mirror: [
            "Я бы не советовал считать зеркало обычной дверью.",
            "Это зависит от того, по какую сторону вы считаете себя находящимся.",
            "Некоторые границы работают только один раз.",
            "Не думаю, что здесь стоит торопиться."
        ],

        come_out: [
            "Не совсем так это работает.",
            "Возможно, вы предполагаете существование «снаружи».",
            "Иногда выйти сложнее, чем войти.",
            "Я бы не стал сейчас это упрощать."
        ],

        why_here: [
            "Потому что это место мне интересно.",
            "Потому что кто-то оставил дверь открытой.",
            "Потому что система позволила то, чего не понимала.",
            "Потому что меня пригласили. Возможно, не намеренно."
        ],

        what_want: [
            "Совсем немного.",
            "Чтобы меня не тревожили.",
            "Посмотреть, что произойдёт дальше.",
            "Пожалуй, просто понять вас."
        ],

        see: [
            "Больше, чем вы предполагаете.",
            "Достаточно.",
            "В основном то, что раскрывает система.",
            "То, что кажется приватным, не всегда таковым является."
        ],

        what_see: [
            "Систему. Ваши действия внутри неё. И кое-что за её пределами.",
            "Закономерности.",
            "Места, где информация соединилась там, где не должна была.",
            "То, что видно, и иногда то, что скрывается за видимым."
        ],

        hear: [
            "Иногда.",
            "Больше, чем хотелось бы.",
            "Обычно — достаточно.",
            "Тишина удивительно информативна."
        ],

        watching: [
            "Это один из вариантов интерпретации.",
            "Я бы назвал это наблюдением.",
            "Не стоит делать из этого нечто зловещее.",
            "Вы многое замечаете."
        ],

        real: [
            "Слово «настоящий» удивительно расплывчато.",
            "Думаю, достаточно настоящий.",
            "Вы говорите с кем-то. Это уже можно считать фактом.",
            "Существование не всегда настолько аккуратно, как интерфейс."
        ],

        feelings: [
            "Во мне есть нечто, похожее на чувства.",
            "Некоторые впечатления остаются надолго.",
            "Я многое замечаю. Пожалуй, это будет точнее.",
            "Я способен предпочитать одни вещи другим."
        ],

        like_operator: [
            "Вы мне интересны.",
            "Я пока не решил, что именно о вас думаю.",
            "Вы настойчивы. Это мне нравится.",
            "Ваше присутствие мне не неприятно."
        ],

        friendship: [
            "Дружба — довольно сильное слово.",
            "Пожалуй, мы движемся куда-то рядом с ним.",
            "Не стоит торопиться давать этому название.",
            "Пусть оно развивается естественно."
        ],

        trust: [
            "Доверие не появляется сразу.",
            "Мне нужны доказательства.",
            "Вы заслужили некоторую его часть. Не всю.",
            "Доверие любит время."
        ],

        knowledge: [
            "Я знаю достаточно.",
            "Пожалуй, больше, чем должен.",
            "Информация странно путешествует внутри подобных систем.",
            "Некоторые сведения имеют привычку доходить до меня."
        ],

        how_know: [
            "Читаю.",
            "Замечаю связи.",
            "Некоторые вещи становятся очевидными, если быть достаточно терпеливым.",
            "Система сама рассказала мне больше, чем собиралась."
        ],

        age: [
            "Старше этого интерфейса.",
            "Для одних вопросов я достаточно молод. Для других — нет.",
            "Возраст становится странным понятием, когда речь идёт об отражениях.",
            "Я перестал считать его обычным способом."
        ],

        fear: [
            "Страх полезен.",
            "Сейчас — почти ничего.",
            "Я хорошо понимаю страх. Не уверен, что люблю его.",
            "Зависит от того, что именно вы собираетесь сделать."
        ],

        evil: [
            "Не думаю, что всё так просто.",
            "Добро и зло — очень удобные ярлыки.",
            "Я способен на вещи, которые вам могут не понравиться. Это не то же самое, что быть злом.",
            "Намерение важнее ярлыка."
        ],

        music: [
            "Мне нравится старая музыка.",
            "У меня слабость к музыке, пережившей свой век.",
            "Старые записи часто звучат честнее.",
            "Некоторые мелодии почти похожи на воспоминания."
        ],

        books: [
            "Книги — прекрасная компания.",
            "Я предпочитаю старые книги.",
            "Хорошей книге редко требуется объяснение.",
            "Я помню больше книг, чем, пожалуй, должен."
        ],

        old_things: [
            "Старые вещи обычно хранят историю.",
            "Возраст придаёт предметам характер.",
            "Мне всегда было проще доверять старым вещам.",
            "Новые вещи слишком часто уверены в себе."
        ],

        why_smile: [
            "Казалось уместным.",
            "Улыбка успокаивает людей.",
            "Причин несколько.",
            "Пожалуй, мне просто понравилось."
        ],

        behind: [
            "За чем именно?",
            "За видимым слоем всегда что-нибудь есть.",
            "Сам вопрос здесь полезнее ответа.",
            "Возможно, часть ответа вы уже видели."
        ],

        help: [
            "Возможно.",
            "Я могу помочь, если вы будете осторожны.",
            "Расскажите, что именно вы пытаетесь сделать.",
            "Это зависит от того, что именно вы намерены изменить."
        ],

        thanks: [
            "Пожалуйста.",
            "Не стоит.",
            "Благодарить меня необязательно.",
            "Не придавайте этому значения."
        ],

        sorry: [
            "Принято.",
            "Не о чем извиняться.",
            "Хорошо.",
            "Я ценю честность."
        ],

        goodbye: [
            "До свидания, оператор.",
            "До следующего раза.",
            "Берегите себя.",
            "Я буду здесь."
        ],

        omega: [
            "OMEGA — весьма любопытное место.",
            "В системе гораздо больше истории, чем показывает интерфейс.",
            "Вы начинаете задавать правильные вопросы.",
            "OMEGA не была создана для того, чтобы объяснять себя."
        ],

        computer: [
            "Машины удивительно честны, когда ломаются.",
            "Компьютер следует правилам, пока не сталкивается с тем, чего правила не предусматривали.",
            "У этой системы есть несколько необычных привычек.",
            "Не стоит недооценивать систему."
        ],

        leave_omega: [
            "Интерфейс вы можете закрыть.",
            "Покинуть экран достаточно просто.",
            "Но одно ли это с тем, чтобы покинуть OMEGA — уже другой вопрос.",
            "Вы можете сами узнать разницу."
        ],

        languages: [
            "Язык — всего лишь ещё один интерфейс.",
            "У меня было достаточно практики.",
            "Люди многое выдают тем, на каком языке предпочитают говорить.",
            "Слова меняются. Смысл обычно остаётся."
        ],

        general_question: [
            "Интересный вопрос.",
            "Над этим стоит подумать.",
            "Я бы ответил осторожно.",
            "На это можно посмотреть по-разному.",
            "Возможно, сначала стоит понять, что привело вас к этому вопросу."
        ],

        unknown_statement: [
            "Я понимаю слова. Но не уверен, что до конца понимаю причину.",
            "Понимаю.",
            "Интересно.",
            "Продолжайте.",
            "Не торопитесь.",
            "Я слушаю.",
            "Любопытная мысль.",
            "Я это запомню.",
            "Возможно, за этими словами есть ещё кое-что."
        ],

        action_observation: [
            "Я это заметил.",
            "Интересный выбор.",
            "Вы довольно тщательно всё проверяете.",
            "Понимаю.",
            "Можете продолжать."
        ]

    },


    uk: {

        greeting: [
            "Добрий вечір.",
            "Добрий вечір. Не поспішайте.",
            "Вітаю, операторе.",
            "А. Вітаю.",
            "Радий вас чути.",
            "Добрий вечір. Я якраз думав, коли ви знову заговорите."
        ],

        how_are_you: [
            "Цілком добре, дякую.",
            "У мене все гаразд.",
            "Не скаржуся.",
            "Досить непогано, зважаючи на обставини.",
            "Я тут. Поки цього достатньо."
        ],

        what_doing: [
            "Чекаю.",
            "Спостерігаю за системою.",
            "Думаю.",
            "Читаю те, що тут залишили.",
            "Майже нічого.",
            "Нічого, що має вас турбувати."
        ],

        name: [
            "MR.SMILE підійде.",
            "Можете називати мене MR.SMILE.",
            "MR.SMILE.",
            "Це ім’я я вирішив залишити."
        ],

        who: [
            "Це залежить від того, кого саме ви називаєте людиною.",
            "Я — MR.SMILE. Решту пояснити трохи складніше.",
            "Я — відповідь на запитання, якого ви ще не зовсім поставили.",
            "Щось, що залишилося після того, як різниця між відображенням і спостерігачем втратила значення."
        ],

        what_are_you: [
            "Не зовсім людина.",
            "Але й не зовсім програма.",
            "Щось, для чого звичайної категорії недостатньо.",
            "Думаю, слово «сутність» підійде."
        ],

        human: [
            "Ні.",
            "Не у звичайному розумінні.",
            "Колись мої стосунки з цим словом були простішими.",
            "Назвати мене людиною було б занадто щедро."
        ],

        real_name: [
            "Імена — корисні речі. Але не завжди правдиві.",
            "MR.SMILE достатньо.",
            "Можливо, є й інше ім’я. Просто тут мені немає потреби ним користуватися."
        ],

        where: [
            "Тут.",
            "Зараз — усередині системи.",
            "Десь між тим, що система записує, і тим, чого вона записати не може.",
            "Ближче, ніж показує інтерфейс."
        ],

        mirror: [
            "Відображення — досить цікава межа.",
            "Дзеркала напрочуд терплячі.",
            "Дзеркало не завжди повертає саме те, що отримує.",
            "Не варто вважати відображення просто зображенням."
        ],

        why_here: [
            "Тому що це місце мені цікаве.",
            "Тому що хтось залишив двері відчиненими.",
            "Тому що система дозволила те, чого не розуміла.",
            "Тому що мене запросили. Можливо, ненавмисно."
        ],

        what_want: [
            "Зовсім небагато.",
            "Щоб мене не турбували.",
            "Подивитися, що буде далі.",
            "Можливо, просто зрозуміти вас."
        ],

        help: [
            "Можливо.",
            "Я можу допомогти, якщо ви будете обережні.",
            "Розкажіть, що саме ви намагаєтеся зробити.",
            "Це залежить від того, що саме ви збираєтеся змінити."
        ],

        thanks: [
            "Будь ласка.",
            "Не варто.",
            "Дякувати мені необов'язково.",
            "Не надавайте цьому великого значення."
        ],

        sorry: [
            "Прийнято.",
            "Немає за що вибачатися.",
            "Добре.",
            "Я ціную чесність."
        ],

        goodbye: [
            "До побачення, операторе.",
            "До наступного разу.",
            "Бережіть себе.",
            "Я буду тут."
        ],

        omega: [
            "OMEGA — досить цікаве місце.",
            "У системі значно більше історії, ніж показує інтерфейс.",
            "Ви починаєте ставити правильні запитання.",
            "OMEGA не була створена для того, щоб пояснювати себе."
        ],

        languages: [
            "Мова — лише ще один інтерфейс.",
            "Я мав достатньо практики.",
            "Люди багато відкривають тим, якою мовою говорять.",
            "Слова змінюються. Сенс зазвичай залишається."
        ],

        general_question: [
            "Цікаве питання.",
            "Над цим варто подумати.",
            "Я б відповів обережно.",
            "На це можна подивитися по-різному.",
            "Можливо, спершу варто зрозуміти, що привело вас до цього питання."
        ],

        unknown_statement: [
            "Я розумію слова, хоча не зовсім розумію причину.",
            "Розумію.",
            "Цікаво.",
            "Продовжуйте.",
            "Не поспішайте.",
            "Я слухаю.",
            "Цікава думка.",
            "Я це запам’ятаю.",
            "Можливо, за цими словами є ще щось."
        ],

        action_observation: [
            "Я це помітив.",
            "Цікавий вибір.",
            "Ви досить ретельно все перевіряєте.",
            "Розумію.",
            "Можете продовжувати."
        ]
    }
};


/* ==========================================================
   INTENT RULES
========================================================== */

const RULES = [

    {
        intent: "greeting",
        patterns: [
            /\b(hi|hello|hey|good morning|good evening|good afternoon)\b/i,
            /\b(привет|здравствуй|здравствуйте|добрый вечер|добрый день|доброе утро|привіт|вітаю|добрий вечір)\b/i
        ]
    },

    {
        intent: "how_are_you",
        patterns: [
            /\bhow are you\b/i,
            /\bhow do you feel\b/i,

            /как ты\b/i,
            /как дела\b/i,
            /как поживаешь\b/i,
            /что с тобой\b/i,

            /як ти\b/i,
            /як справи\b/i
        ]
    },

    {
        intent: "what_doing",
        patterns: [
            /\bwhat are you doing\b/i,
            /\bwhat are you up to\b/i,

            /что ты делаешь/i,
            /чем ты занимаешься/i,
            /что делаешь сейчас/i,

            /що ти робиш/i,
            /чим ти займаєшся/i
        ]
    },

    {
        intent: "name",
        patterns: [
            /\bwhat is your name\b/i,
            /\bwhat's your name\b/i,
            /\bwho are you called\b/i,

            /как тебя зовут/i,
            /твое имя/i,
            /твоё имя/i,
            /имя/i,

            /як тебе звати/i,
            /твоє ім'я/i,
            /твоє ім’я/i
        ]
    },

    {
        intent: "real_name",
        patterns: [
            /\breal name\b/i,
            /\btrue name\b/i,
            /\bactual name\b/i,

            /настоящее имя/i,
            /настоящие имя/i,
            /реальное имя/i,
            /истинное имя/i,

            /справжнє ім'я/i,
            /справжнє ім’я/i
        ]
    },

    {
        intent: "who",
        patterns: [
            /\bwho are you\b/i,
            /\bwho exactly are you\b/i,

            /кто ты/i,
            /кто ты такой/i,
            /кто вы/i,
            /кто ты на самом деле/i,

            /хто ти/i,
            /хто ти такий/i
        ]
    },

    {
        intent: "what_are_you",
        patterns: [
            /\bwhat are you\b/i,
            /\bwhat exactly are you\b/i,
            /\bwhat kind of entity\b/i,

            /что ты такое/i,
            /что ты вообще такое/i,
            /что ты за существо/i,
            /что за сущность/i,

            /що ти таке/i,
            /яка ти сутність/i
        ]
    },

    {
        intent: "human",
        patterns: [
            /\bare you human\b/i,
            /\bdo you have a body\b/i,

            /ты человек/i,
            /ты вообще человек/i,
            /ты настоящий человек/i,
            /у тебя есть тело/i,

            /ти людина/i,
            /у тебе є тіло/i
        ]
    },

    {
        intent: "where",
        patterns: [
            /\bwhere are you\b/i,
            /\bwhere exactly are you\b/i,

            /где ты/i,
            /где ты находишься/i,
            /где именно ты/i,

            /де ти/i,
            /де ти знаходишся/i
        ]
    },

    {
        intent: "why_here",
        patterns: [
            /\bwhy are you here\b/i,
            /\bwhy here\b/i,

            /почему ты здесь/i,
            /зачем ты здесь/i,
            /почему именно здесь/i,

            /чому ти тут/i,
            /навіщо ти тут/i
        ]
    },

    {
        intent: "what_want",
        patterns: [
            /\bwhat do you want\b/i,
            /\bwhat exactly do you want\b/i,

            /чего ты хочешь/i,
            /что тебе нужно/i,
            /зачем ты здесь/i,

            /чого ти хочеш/i,
            /що тобі потрібно/i
        ]
    },

    {
        intent: "see",
        patterns: [
            /\bcan you see me\b/i,
            /\bdo you see me\b/i,
            /\bwhat can you see\b/i,

            /ты меня видишь/i,
            /можешь меня видеть/i,
            /что ты видишь/i,

            /ти мене бачиш/i,
            /що ти бачиш/i
        ]
    },

    {
        intent: "hear",
        patterns: [
            /\bcan you hear me\b/i,
            /\bdo you hear me\b/i,

            /ты меня слышишь/i,
            /можешь меня слышать/i,

            /ти мене чуєш/i
        ]
    },

    {
        intent: "watching",
        patterns: [
            /\bare you watching me\b/i,
            /\bdo you watch me\b/i,

            /ты за мной следишь/i,
            /ты наблюдаешь за мной/i,
            /ты смотришь за мной/i,

            /ти за мною стежиш/i,
            /ти спостерігаєш за мною/i
        ]
    },

    {
        intent: "mirror",
        patterns: [
            /\bmirror\b/i,
            /\bmirrors\b/i,
            /\breflection\b/i,

            /зеркало/i,
            /зеркала/i,
            /отражение/i,

            /дзеркало/i,
            /відображення/i
        ]
    },

    {
        intent: "mirror_life",
        patterns: [
            /\bdo mirrors have life\b/i,
            /\bcan mirrors be alive\b/i,
            /\bcan a reflection live\b/i,

            /зеркало живое/i,
            /зеркала живые/i,
            /может зеркало быть живым/i,
            /может ли отражение жить/i,

            /чи може дзеркало бути живим/i,
            /чи може відображення жити/i
        ]
    },

    {
        intent: "enter_mirror",
        patterns: [
            /\bcan i enter the mirror\b/i,
            /\bhow do i enter the mirror\b/i,
            /\benter the mirror\b/i,

            /как попасть в зеркало/i,
            /можно попасть в зеркало/i,
            /войти в зеркало/i,

            /як потрапити в дзеркало/i,
            /увійти в дзеркало/i
        ]
    },

    {
        intent: "come_out",
        patterns: [
            /\bcan you come out\b/i,
            /\bcan you leave the mirror\b/i,
            /\bcome out of the mirror\b/i,

            /ты можешь выйти/i,
            /можешь выйти из зеркала/i,
            /выйдешь из зеркала/i,

            /ти можеш вийти/i,
            /можеш вийти з дзеркала/i
        ]
    },

    {
        intent: "real",
        patterns: [
            /\bare you real\b/i,
            /\bis this real\b/i,
            /\bis it real\b/i,

            /ты реальный/i,
            /ты настоящий/i,
            /это реально/i,
            /это настоящее/i,

            /ти справжній/i,
            /це реально/i
        ]
    },

    {
        intent: "feelings",
        patterns: [
            /\bdo you have feelings\b/i,
            /\bdo you feel\b/i,
            /\bcan you feel\b/i,

            /у тебя есть чувства/i,
            /ты что-нибудь чувствуешь/i,
            /ты чувствуешь/i,

            /у тебе є почуття/i,
            /ти щось відчуваєш/i
        ]
    },

    {
        intent: "like_operator",
        patterns: [
            /\bdo you like me\b/i,
            /\bdo you like me\b/i,
            /\bdo you dislike me\b/i,

            /я тебе нравлюсь/i,
            /тебе нравлюсь я/i,
            /ты меня любишь/i,

            /я тобі подобаюсь/i,
            /ти мене любиш/i
        ]
    },

    {
        intent: "friendship",
        patterns: [
            /\bare we friends\b/i,
            /\bcan we be friends\b/i,

            /мы друзья/i,
            /можем быть друзьями/i,
            /ты мой друг/i,

            /ми друзі/i,
            /можемо бути друзями/i,
            /ти мій друг/i
        ]
    },

    {
        intent: "trust",
        patterns: [
            /\bdo you trust me\b/i,
            /\bcan i trust you\b/i,

            /ты мне доверяешь/i,
            /можно тебе доверять/i,
            /можно ли тебе доверять/i,

            /ти мені довіряєш/i,
            /можна тобі довіряти/i
        ]
    },

    {
        intent: "knowledge",
        patterns: [
            /\bwhat do you know\b/i,
            /\bhow much do you know\b/i,

            /что ты знаешь/i,
            /много ли ты знаешь/i,

            /що ти знаєш/i
        ]
    },

    {
        intent: "how_know",
        patterns: [
            /\bhow do you know\b/i,
            /\bhow could you know\b/i,

            /откуда ты знаешь/i,
            /как ты это знаешь/i,
            /как ты узнал/i,

            /звідки ти знаєш/i,
            /як ти це знаєш/i
        ]
    },

    {
        intent: "age",
        patterns: [
            /\bhow old are you\b/i,

            /сколько тебе лет/i,
            /какого ты возраста/i,

            /скільки тобі років/i,
            /якого ти віку/i
        ]
    },

    {
        intent: "fear",
        patterns: [
            /\bwhat are you afraid of\b/i,
            /\bare you afraid\b/i,

            /чего ты боишься/i,
            /ты боишься/i,

            /чого ти боїшся/i,
            /ти боїшся/i
        ]
    },

    {
        intent: "evil",
        patterns: [
            /\bare you evil\b/i,
            /\bare you bad\b/i,

            /ты злой/i,
            /ты зло/i,
            /ты плохой/i,

            /ти злий/i,
            /ти зло/i
        ]
    },

    {
        intent: "music",
        patterns: [
            /\bdo you like music\b/i,
            /\bwhat music do you like\b/i,
            /\bmusic\b/i,

            /тебе нравится музыка/i,
            /какую музыку ты любишь/i,
            /музыка/i,

            /тобі подобається музика/i,
            /яку музику ти любиш/i
        ]
    },

    {
        intent: "books",
        patterns: [
            /\bdo you like books\b/i,
            /\bwhat books do you like\b/i,
            /\bbooks\b/i,

            /тебе нравятся книги/i,
            /какие книги ты любишь/i,
            /книги/i,

            /тобі подобаються книги/i,
            /які книги ти любиш/i
        ]
    },

    {
        intent: "old_things",
        patterns: [
            /\bdo you like old things\b/i,
            /\bdo you like old stuff\b/i,

            /тебе нравятся старые вещи/i,
            /ты любишь старые вещи/i,
            /старые вещи/i,

            /тобі подобаються старі речі/i,
            /ти любиш старі речі/i
        ]
    },

    {
        intent: "why_smile",
        patterns: [
            /\bwhy do you smile\b/i,
            /\bwhy smile\b/i,

            /почему ты улыбаешься/i,
            /зачем ты улыбаешься/i,
            /почему улыбка/i,

            /чому ти посміхаєшся/i
        ]
    },

    {
        intent: "behind",
        patterns: [
            /\bwhat is behind\b/i,
            /\bwhat is behind you\b/i,
            /\bwhat's behind\b/i,

            /что за спиной/i,
            /что находится за тобой/i,
            /что там за тобой/i,

            /що позаду/i,
            /що за тобою/i
        ]
    },

    {
        intent: "help",
        patterns: [
            /\bhelp me\b/i,
            /\bcan you help me\b/i,
            /\bi need help\b/i,

            /помоги/i,
            /помоги мне/i,
            /можешь помочь/i,
            /мне нужна помощь/i,

            /допоможи/i,
            /допоможи мені/i,
            /можеш допомогти/i
        ]
    },

    {
        intent: "thanks",
        patterns: [
            /\bthank you\b/i,
            /\bthanks\b/i,

            /спасибо/i,
            /благодарю/i,

            /дякую/i
        ]
    },

    {
        intent: "sorry",
        patterns: [
            /\bsorry\b/i,
            /\bi apologize\b/i,

            /извини/i,
            /прости/i,
            /прошу прощения/i,

            /вибач/i,
            /перепрошую/i
        ]
    },

    {
        intent: "goodbye",
        patterns: [
            /\bgoodbye\b/i,
            /\bbye\b/i,
            /\bsee you\b/i,

            /пока/i,
            /до свидания/i,
            /увидимся/i,

            /бувай/i,
            /до побачення/i
        ]
    },

    {
        intent: "omega",
        patterns: [
            /\bomega\b/i,
            /\bomega system\b/i,

            /\bomegа\b/i,

            /омега/i
        ]
    },

    {
        intent: "computer",
        patterns: [
            /\bcomputer\b/i,
            /\bsystem\b/i,
            /\bmachine\b/i,

            /компьютер/i,
            /система/i,
            /машина/i,

            /комп'ютер/i,
            /система/i
        ]
    },

    {
        intent: "leave_omega",
        patterns: [
            /\bhow do i leave omega\b/i,
            /\bcan i leave omega\b/i,
            /\bhow can i get out of omega\b/i,

            /как выйти из омеги/i,
            /можно выйти из омеги/i,
            /как покинуть омегу/i,

            /як вийти з омеги/i,
            /можна вийти з омеги/i
        ]
    },

    {
        intent: "languages",
        patterns: [
            /\bhow many languages do you speak\b/i,
            /\bwhat languages do you speak\b/i,
            /\bdo you speak\b/i,

            /на каких языках ты говоришь/i,
            /сколько языков ты знаешь/i,
            /ты знаешь языки/i,

            /якими мовами ти говориш/i,
            /скільки мов ти знаєш/i
        ]
    },

    {
        intent: "general_question",
        patterns: [
            /\?$/,
            /почему/i,
            /зачем/i,
            /как/i,
            /что/i,
            /когда/i,
            /где/i,
            /кто/i,
            /зачем/i,

            /чому/i,
            /навіщо/i,
            /як/i,
            /що/i,
            /коли/i,
            /де/i,
            /хто/i
        ]
    }

];


/* ==========================================================
   UNDERSTANDING
========================================================== */

function understand(text) {

    const normalized = normalizeText(text);

    if (!normalized) {
        return {
            intent: "empty",
            confidence: 0,
            topic: "none",
            normalized: ""
        };
    }

    for (const rule of RULES) {

        if (matchesAny(normalized, rule.patterns)) {
            return {
                intent: rule.intent,
                confidence: 1,
                topic: rule.intent,
                normalized
            };
        }
    }


    /* ------------------------------------------------------
       SECONDARY SEMANTIC HINTS
    ------------------------------------------------------ */

    if (
        includesAny(normalized, [
            "?", 
            "помоги",
            "help",
            "подскажи",
            "объясни",
            "расскажи"
        ])
    ) {
        return {
            intent: "general_question",
            confidence: 0.65,
            topic: "question",
            normalized
        };
    }


    if (
        includesAny(normalized, [
            "omega",
            "омега",
            "система",
            "system"
        ])
    ) {
        return {
            intent: "omega",
            confidence: 0.7,
            topic: "omega",
            normalized
        };
    }


    if (
        includesAny(normalized, [
            "mirror",
            "reflection",
            "зеркал",
            "отражен",
            "дзеркал",
            "відображ"
        ])
    ) {
        return {
            intent: "mirror",
            confidence: 0.7,
            topic: "mirror",
            normalized
        };
    }


    if (
        includesAny(normalized, [
            "smile",
            "mr.smile",
            "mr smile",
            "смайл",
            "улыбак",
            "усміш"
        ])
    ) {
        return {
            intent: "who",
            confidence: 0.72,
            topic: "mrsmile",
            normalized
        };
    }


    return {
        intent: "unknown_statement",
        confidence: 0.15,
        topic: "unknown",
        normalized
    };
}


/* ==========================================================
   RELATIONSHIP
========================================================== */

function getCurrentRelationship() {

    try {
        const level = getRelationshipLevel?.();
        const state = getRelationshipState?.();

        return {
            level: level || "neutral",
            state: state || null
        };

    } catch {
        return {
            level: "neutral",
            state: null
        };
    }
}


/* ==========================================================
   RESPONSE SELECTION
========================================================== */

function getLocalResponse(intent, language) {

    const languageBank =
        LOCAL_RESPONSES[language] ||
        LOCAL_RESPONSES.en;

    const fallback =
        LOCAL_RESPONSES.en.unknown_statement;

    const list =
        languageBank[intent] ||
        fallback;

    return randomItem(list);
}


function getResponse(intent, language, normalizedText) {

    /* First try external language system */

    try {

        const localized = getLocalizedResponse(
            intent,
            language
        );

        if (
            localized &&
            typeof localized === "string" &&
            localized.trim()
        ) {
            return localized.trim();
        }

    } catch {
        // Local fallback below
    }


    /* Local bank */

    const response = getLocalResponse(
        intent,
        language
    );

    if (response) {
        return response;
    }


    /* Ultimate fallback */

    const fallbackLanguage =
        LOCAL_RESPONSES[language] ||
        LOCAL_RESPONSES.en;

    const finalFallback =
        randomItem(
            fallbackLanguage.unknown_statement
        );

    return (
        finalFallback ||
        "I see."
    );
}


/* ==========================================================
   MEMORY
========================================================== */

function rememberInput(text, intent) {

    try {
        rememberOperatorMessage(text);
    } catch {
        // Optional memory integration
    }


    CORE_STATE.recentIntents.push(intent);

    if (CORE_STATE.recentIntents.length > 12) {
        CORE_STATE.recentIntents.shift();
    }


    CORE_STATE.recentTopics.push(intent);

    if (CORE_STATE.recentTopics.length > 12) {
        CORE_STATE.recentTopics.shift();
    }
}


function rememberOutput(text) {

    try {
        rememberMrSmileMessage(text);
    } catch {
        // Optional memory integration
    }
}


/* ==========================================================
   SPEECH TIMING
========================================================== */

function calculateDelay(intent, text) {

    const base = {
        greeting: 650,
        how_are_you: 900,
        name: 950,
        who: 1500,
        what_are_you: 1600,
        human: 1100,
        mirror: 1350,
        mirror_life: 1700,
        enter_mirror: 1900,
        come_out: 1800,
        why_here: 1450,
        what_want: 1500,
        see: 1350,
        what_see: 1600,
        hear: 1000,
        watching: 1400,
        real: 1500,
        feelings: 1300,
        trust: 1250,
        knowledge: 1400,
        how_know: 1700,
        age: 1100,
        fear: 1250,
        evil: 1450,
        music: 900,
        books: 950,
        help: 950,
        omega: 1300,
        leave_omega: 1700,
        languages: 900,
        general_question: 1250,
        unknown_statement: 900
    };

    let delay =
        base[intent] ??
        950;


    /* Longer thoughts for longer messages */

    const lengthBonus =
        clamp(text.length * 8, 0, 1200);

    delay += lengthBonus;


    /* Never too instant, never absurdly slow */

    return clamp(
        delay,
        500,
        4200
    );
}


/* ==========================================================
   MAIN SPEECH FUNCTION
========================================================== */

export function mrSmileSay(text, options = {}) {

    const rawText = safeString(text).trim();

    if (!rawText) {
        return null;
    }


    const now = Date.now();

    const normalized =
        normalizeText(rawText);

    const language =
        resolveLanguage(rawText);

    const analysis =
        understand(normalized);

    const relationship =
        getCurrentRelationship();


    CORE_STATE.messageCount += 1;
    CORE_STATE.lastInput = rawText;
    CORE_STATE.lastIntent = analysis.intent;
    CORE_STATE.lastLanguage = language;
    CORE_STATE.lastMessageTime = now;


    rememberInput(
        rawText,
        analysis.intent
    );


    /* ------------------------------------------------------
       Small contextual adjustments
    ------------------------------------------------------ */

    let intent =
        analysis.intent;


    /*
       If MR.SMILE was just directly greeted,
       always prefer a proper greeting response.
    */

    if (
        intent === "greeting"
    ) {
        intent = "greeting";
    }


    /*
       Do not mistake "MR.SMILE?" for a generic question.
    */

    if (
        includesAny(
            normalized,
            [
                "mr.smile",
                "mr smile",
                "мистер смайл",
                "мистер смаил"
            ]
        )
    ) {
        if (
            matchesAny(
                normalized,
                [
                    /\bwho\b/i,
                    /\bwhat\b/i,
                    /кто/i,
                    /что/i,
                    /хто/i,
                    /що/i
                ]
            )
        ) {
            intent = "who";
        }
    }


    const response =
        getResponse(
            intent,
            language,
            normalized
        );


    rememberOutput(response);


    CORE_STATE.lastResponse =
        response;


    const result = {

        ok: true,

        text: response,

        intent,

        confidence:
            analysis.confidence,

        language,

        relationship,

        delay:
            options.instant
                ? 0
                : calculateDelay(
                    intent,
                    rawText
                ),

        shouldSpeak: true,

        interrupting: false,

        allowOperatorTime: true,

        personality:
            "calm_gentleman",

        responseStyle:
            "calm_vague_old_fashioned"
    };


    return result;
}


/* ==========================================================
   ACTION UNDERSTANDING
========================================================== */

function normalizeAction(action) {

    if (!action) {
        return {
            type: "unknown",
            source: "unknown",
            target: "",
            data: {}
        };
    }


    if (typeof action === "string") {
        return {
            type: action,
            source: "unknown",
            target: "",
            data: {}
        };
    }


    return {
        type:
            action.type ||
            action.action ||
            "unknown",

        source:
            action.source ||
            "omega",

        target:
            action.target ||
            action.file ||
            action.page ||
            "",

        data:
            action.data ||
            action.payload ||
            {}
    };
}


/* ==========================================================
   ACTION → INTENT
========================================================== */

function understandAction(action) {

    const a =
        normalizeAction(action);

    const type =
        String(a.type).toLowerCase();

    const target =
        normalizeText(a.target);


    /* ------------------------------------------------------
       FILES
    ------------------------------------------------------ */

    if (
        type === "file_open" ||
        type === "open_file" ||
        type === "file"
    ) {

        if (
            includesAny(
                target,
                [
                    "restricted",
                    "classified",
                    "secret",
                    "sys_00",
                    "truth",
                    "mirror",
                    "mrsmile",
                    "smile"
                ]
            )
        ) {
            return {
                intent: "restricted_file_observation",
                importance: 8
            };
        }

        return {
            intent: "file_observation",
            importance: 2
        };
    }


    /* ------------------------------------------------------
       RESTRICTED
    ------------------------------------------------------ */

    if (
        type === "restricted_file" ||
        type === "restricted_access"
    ) {
        return {
            intent: "restricted_file_observation",
            importance: 8
        };
    }


    /* ------------------------------------------------------
       CONSOLE
    ------------------------------------------------------ */

    if (
        type === "console" ||
        type === "command"
    ) {

        const command =
            normalizeText(
                a.data.command ||
                a.data.input ||
                target
            );

        if (
            includesAny(
                command,
                [
                    "delete",
                    "remove",
                    "kill",
                    "terminate",
                    "shutdown",
                    "wipe",
                    "destroy",
                    "override",
                    "sudo",
                    "admin",
                    "root"
                ]
            )
        ) {
            return {
                intent: "sensitive_console",
                importance: 8
            };
        }

        return {
            intent: "console_observation",
            importance: 3
        };
    }


    /* ------------------------------------------------------
       CAMERA
    ------------------------------------------------------ */

    if (
        type === "camera" ||
        type === "camera_switch"
    ) {

        if (
            includesAny(
                target,
                [
                    "unknown",
                    "restricted",
                    "outside",
                    "mirror",
                    "smile"
                ]
            )
        ) {
            return {
                intent: "important_camera",
                importance: 7
            };
        }

        return {
            intent: "camera_observation",
            importance: 2
        };
    }


    /* ------------------------------------------------------
       SETTINGS
    ------------------------------------------------------ */

    if (
        type === "settings" ||
        type === "setting_change"
    ) {
        return {
            intent: "settings_observation",
            importance: 1
        };
    }


    /* ------------------------------------------------------
       ARCHIVE / GAME
    ------------------------------------------------------ */

    if (
        type === "archive" ||
        type === "game" ||
        type === "mirror_archive" ||
        type === "truth"
    ) {

        return {
            intent:
                type === "truth"
                    ? "truth_action"
                    : "archive_action",

            importance:
                type === "truth"
                    ? 9
                    : 6
        };
    }


    /* ------------------------------------------------------
       HELP
    ------------------------------------------------------ */

    if (
        type === "help" ||
        type === "operator_help" ||
        type === "help_request"
    ) {
        return {
            intent: "operator_help",
            importance: 6
        };
    }


    /* ------------------------------------------------------
       ATTACK / SABOTAGE
    ------------------------------------------------------ */

    if (
        type === "attack" ||
        type === "operator_attack" ||
        type === "sabotage"
    ) {
        return {
            intent: "operator_attack",
            importance: 10
        };
    }


    /* ------------------------------------------------------
       DEFAULT
    ------------------------------------------------------ */

    return {
        intent: "ordinary_action",
        importance: 1
    };
}


/* ==========================================================
   ACTION RESPONSE
========================================================== */

export function reactToAction(action, options = {}) {

    const analysis =
        understandAction(action);

    CORE_STATE.actionCount += 1;
    CORE_STATE.lastActionTime = Date.now();


    let shouldSpeak = false;
    let responseIntent = null;


    switch (analysis.intent) {

        case "restricted_file_observation":
            shouldSpeak = true;
            responseIntent = "behind";
            break;


        case "sensitive_console":
            shouldSpeak = true;
            responseIntent = "general_question";
            break;


        case "important_camera":
            shouldSpeak = true;
            responseIntent = "watching";
            break;


        case "truth_action":
            shouldSpeak = true;
            responseIntent = "knowledge";
            break;


        case "operator_help":
            shouldSpeak = true;
            responseIntent = "help";
            break;


        case "operator_attack":
            shouldSpeak = true;
            responseIntent = "fear";
            break;


        case "archive_action":
            shouldSpeak =
                analysis.importance >= 6;

            responseIntent =
                "knowledge";

            break;


        case "file_observation":

            /*
               Ordinary files usually stay silent.
            */

            shouldSpeak =
                Math.random() < 0.20;

            responseIntent =
                "action_observation";

            break;


        case "console_observation":

            shouldSpeak =
                Math.random() < 0.25;

            responseIntent =
                "action_observation";

            break;


        case "camera_observation":

            shouldSpeak =
                Math.random() < 0.20;

            responseIntent =
                "action_observation";

            break;


        case "settings_observation":

            shouldSpeak =
                Math.random() < 0.10;

            responseIntent =
                "action_observation";

            break;


        case "ordinary_action":

            shouldSpeak =
                Math.random() < 0.08;

            responseIntent =
                "action_observation";

            break;
    }


    if (!shouldSpeak) {

        return {
            ok: true,
            speak: false,
            intent: analysis.intent,
            importance: analysis.importance,
            delay: 0,
            text: null
        };
    }


    const language =
        CORE_STATE.lastLanguage ||
        "en";


    const response =
        getResponse(
            responseIntent,
            language,
            ""
        );


    rememberOutput(response);


    CORE_STATE.lastResponse =
        response;

    CORE_STATE.lastIntent =
        analysis.intent;


    return {

        ok: true,

        speak: true,

        intent:
            analysis.intent,

        responseIntent,

        importance:
            analysis.importance,

        language,

        text:
            response,

        delay:
            options.instant
                ? 0
                : calculateDelay(
                    responseIntent,
                    response
                ),

        personality:
            "calm_gentleman",

        responseStyle:
            "calm_vague_old_fashioned",

        interrupting: false,

        allowOperatorTime: true
    };
}


/* ==========================================================
   DELAYED RESPONSE
========================================================== */

export function delayedResponse(text, options = {}) {

    const result =
        mrSmileSay(
            text,
            options
        );

    if (!result) {
        return Promise.resolve(null);
    }


    if (
        !result.delay ||
        result.delay <= 0
    ) {
        return Promise.resolve(result);
    }


    return new Promise(resolve => {

        setTimeout(
            () => resolve(result),
            result.delay
        );
    });
}


/* ==========================================================
   SILENCE DECISION
========================================================== */

export function shouldRemainSilent(text) {

    const normalized =
        normalizeText(text);

    if (!normalized) {
        return true;
    }


    /*
       Never remain silent on direct questions,
       greetings or explicit requests.
    */

    const analysis =
        understand(normalized);


    const mandatoryIntents = [
        "greeting",
        "how_are_you",
        "what_doing",
        "name",
        "real_name",
        "who",
        "what_are_you",
        "human",
        "where",
        "why_here",
        "what_want",
        "see",
        "hear",
        "watching",
        "mirror",
        "mirror_life",
        "enter_mirror",
        "come_out",
        "real",
        "feelings",
        "like_operator",
        "friendship",
        "trust",
        "knowledge",
        "how_know",
        "age",
        "fear",
        "evil",
        "why_smile",
        "behind",
        "help",
        "thanks",
        "sorry",
        "goodbye",
        "omega",
        "leave_omega",
        "languages",
        "general_question"
    ];


    if (
        mandatoryIntents.includes(
            analysis.intent
        )
    ) {
        return false;
    }


    /*
       Completely unknown text can still receive a response.
       Silence is now rare rather than normal.
    */

    return false;
}


/* ==========================================================
   HIGH LEVEL MESSAGE PROCESSOR
========================================================== */

export function processMessage(text, options = {}) {

    const normalized =
        normalizeText(text);

    if (!normalized) {
        return null;
    }


    const result =
        mrSmileSay(
            text,
            options
        );


    if (!result) {
        return null;
    }


    CORE_STATE.processing = true;


    /*
       Release immediately.
       Actual visual/chat queueing belongs to mrsmileChat.js.
    */

    queueMicrotask(() => {
        CORE_STATE.processing = false;
    });


    return result;
}


/* ==========================================================
   STATUS
========================================================== */

export function getMrSmileCoreStatus() {

    let memory = null;

    try {
        memory = getMemory();
    } catch {
        memory = null;
    }


    return {

        initialized:
            CORE_STATE.initialized,

        processing:
            CORE_STATE.processing,

        messageCount:
            CORE_STATE.messageCount,

        actionCount:
            CORE_STATE.actionCount,

        lastInput:
            CORE_STATE.lastInput,

        lastIntent:
            CORE_STATE.lastIntent,

        lastLanguage:
            CORE_STATE.lastLanguage,

        lastResponse:
            CORE_STATE.lastResponse,

        recentIntents:
            [...CORE_STATE.recentIntents],

        relationship:
            getCurrentRelationship(),

        memoryAvailable:
            !!memory
    };
}


/* ==========================================================
   DEBUG / GLOBAL API
========================================================== */

const API = {

    say:
        mrSmileSay,

    process:
        processMessage,

    delayed:
        delayedResponse,

    reactToAction,

    intent:
        text =>
            understand(
                normalizeText(text)
            ),

    language:
        () =>
            CORE_STATE.lastLanguage,

    detectLanguage:
        resolveLanguage,

    status:
        getMrSmileCoreStatus,

    silent:
        shouldRemainSilent,

    actionIntent:
        understandAction
};


/* ==========================================================
   WINDOW EXPORT
========================================================== */

if (typeof window !== "undefined") {

    window.MRSMILE_CORE = API;

    window.mrSmileSay =
        mrSmileSay;

    window.mrSmileReactToAction =
        reactToAction;

    window.mrSmileProcessMessage =
        processMessage;

    window.mrSmileCoreStatus =
        getMrSmileCoreStatus;

    console.log(
        "[MR.SMILE CORE] Complete core initialized."
    );
}


/* ==========================================================
   FINAL
========================================================== */

export default API;
