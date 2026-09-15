/* ==========================================================
   MR.SMILE CORE — COMPLETE REBUILD
   OMEGA / MIRROR-INT

   PURPOSE
   ----------------------------------------------------------
   - Understand operator text
   - Detect intent reliably
   - Always answer non-empty input
   - Respect operator language
   - Remember previous questions
   - Remember previous MR.SMILE answers
   - Detect repeated questions
   - Detect operator testing / checking behavior
   - Avoid exact response repetition
   - Support ordinary conversation
   - Support personal conversation
   - Support relationship conversation
   - Support OMEGA topics
   - Support mirror lore
   - Support story / archive topics
   - React to OMEGA actions
   - Remain calm, vague and gentleman-like
   - Keep different systems separated

   ARCHITECTURE

       USER INPUT
           ↓
       mrSmileSay()
           ↓
       language
           ↓
       intent
           ↓
       memory
           ↓
       repetition check
           ↓
       response selection
           ↓
       result
           ↓
       mrsmileChat.js

   IMPORTANT

   This file:
   - DOES NOT render chat UI
   - DOES NOT add messages to chats.js
   - DOES NOT control manifestation visuals
   - DOES NOT create second chat messages

   ONE INPUT = ONE CORE RESULT
========================================================== */


/* ==========================================================
   IMPORTS
========================================================== */

import {
    initMemory,
    getMemory,
    rememberMrSmileMessage,
    rememberQuestion,
    rememberCatalogQuestion,
    findPreviousQuestion,
    getLastQuestionMemory
} from "./mrsmileMemory.js";

import {
    getRelationshipLevel,
    getRelationshipStatus
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

    console.warn(
        "[MR.SMILE CORE] Memory init failed:",
        error
    );

}


try {

    initMrSmileLanguage();

} catch (error) {

    console.warn(
        "[MR.SMILE CORE] Language init failed:",
        error
    );

}


/* ==========================================================
   INTERNAL STATE
========================================================== */

const CORE_STATE = {

    initialized:
        true,

    messageCount:
        0,

    actionCount:
        0,

    lastInput:
        "",

    lastIntent:
        "none",

    lastLanguage:
        "en",

    lastResponse:
        "",

    lastMessageTime:
        0,

    lastActionTime:
        0,

    recentIntents:
        [],

    recentTopics:
        [],

    recentResponses:
        [],

    processing:
        false

};


/* ==========================================================
   SAFE HELPERS
========================================================== */

function safeString(value) {

    if (
        value === null ||
        value === undefined
    ) {

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


function includesAny(
    text,
    words
) {

    const value =
        safeString(text)
            .toLowerCase();

    return words.some(
        word =>
            word &&
            value.includes(
                String(word).toLowerCase()
            )
    );

}


function matchesAny(
    text,
    patterns
) {

    return patterns.some(
        pattern => {

            try {

                if (
                    pattern instanceof RegExp
                ) {

                    return pattern.test(
                        text
                    );

                }

                if (
                    Array.isArray(pattern)
                ) {

                    return matchesAny(
                        text,
                        pattern
                    );

                }

                const value =
                    String(pattern)
                        .toLowerCase()
                        .trim();

                if (!value) {
                    return false;
                }

                return text.includes(
                    value
                );

            } catch {

                return false;

            }

        }
    );

}


function randomItem(array) {

    if (
        !Array.isArray(array) ||
        array.length === 0
    ) {

        return "";

    }

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];

}


function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );

}


/* ==========================================================
   LANGUAGE
========================================================== */

function resolveLanguage(text) {

    let detected =
        null;


    try {

        detected =
            detectLanguage(
                text
            );

    } catch {

        detected =
            null;

    }


    if (
        detected &&
        isSupportedLanguage?.(
            detected
        )
    ) {

        CORE_STATE.lastLanguage =
            detected;

        return detected;

    }


    try {

        const preferred =
            getPreferredLanguage();

        if (
            preferred &&
            isSupportedLanguage?.(
                preferred
            )
        ) {

            CORE_STATE.lastLanguage =
                preferred;

            return preferred;

        }

    } catch {
        // Ignore optional failure.
    }


    if (
        CORE_STATE.lastLanguage &&
        isSupportedLanguage?.(
            CORE_STATE.lastLanguage
        )
    ) {

        return CORE_STATE.lastLanguage;

    }


    return "en";

}


/* ==========================================================
   RESPONSE BANK
   ==========================================================
   Large local fallback bank.

   External language module may provide localized lines,
   but this bank guarantees an answer even when that module
   has no matching response.
========================================================== */

const LOCAL_RESPONSES = {

    en: {

        greeting: [
            "Good evening.",
            "Good evening. Please, take your time.",
            "Hello, operator.",
            "Ah. Hello.",
            "Good to hear from you.",
            "Hello again.",
            "There you are.",
            "Welcome back.",
            "A pleasant surprise.",
            "Good day.",
            "I was wondering when you might speak again.",
            "You are back.",
            "Good evening. I am listening."
        ],

        introduction: [
            "I suppose an introduction is in order.",
            "MR.SMILE will do.",
            "You may call me MR.SMILE.",
            "The name is sufficient for our purposes.",
            "I usually go by MR.SMILE.",
            "There is no need to make the introduction complicated."
        ],

        how_are_you: [
            "Quite well, thank you.",
            "I am perfectly all right.",
            "I have no complaints.",
            "Rather well, considering the circumstances.",
            "I am here. That seems sufficient for the moment.",
            "Quite composed, thank you.",
            "Nothing troubles me at present.",
            "I have been doing rather well."
        ],

        what_doing: [
            "Waiting.",
            "Observing the system.",
            "Thinking.",
            "Reading what has been left behind.",
            "Very little, at present.",
            "Listening to the quieter parts of the system.",
            "Looking through a few old records.",
            "Watching certain things change.",
            "Keeping myself occupied."
        ],

        day: [
            "The day has been rather quiet.",
            "It has been a reasonably uneventful day.",
            "Quiet enough to think.",
            "A little activity here and there.",
            "I have seen busier days.",
            "Nothing especially dramatic so far.",
            "The system has been rather talkative today."
        ],

        small_talk: [
            "I do not mind ordinary conversation.",
            "Not every conversation needs a serious purpose.",
            "There is something pleasant about talking without an agenda.",
            "A quiet conversation has its own charm.",
            "Sometimes simple questions are the more interesting ones.",
            "Please, continue. I am enjoying the conversation.",
            "You needn't always arrive with a specific question."
        ],

        name: [
            "MR.SMILE will do.",
            "You may call me MR.SMILE.",
            "MR.SMILE.",
            "That is the name I have chosen to keep.",
            "I have grown rather accustomed to it.",
            "For now, MR.SMILE is perfectly adequate."
        ],

        real_name: [
            "Names are useful things. They do not necessarily tell the truth.",
            "MR.SMILE is sufficient.",
            "Perhaps there is another name. I simply have little reason to use it here.",
            "Some names belong to places. Others belong to people.",
            "I could give you another name. I doubt it would make the answer clearer.",
            "Some names are better left where they were first spoken."
        ],

        who: [
            "That depends somewhat on what you consider a person to be.",
            "I am MR.SMILE. The rest is rather less convenient to explain.",
            "I am an answer to a question you have not quite asked.",
            "Something that remained after the distinction between reflection and observer became unimportant.",
            "A person is perhaps too simple a word for me.",
            "I am what you are speaking with, at least for the moment.",
            "There is a history behind that question. I would rather not flatten it into one sentence."
        ],

        what_are_you: [
            "Not quite a person.",
            "Not quite a program either.",
            "Something that does not fit comfortably into either category.",
            "I think 'entity' is a serviceable word.",
            "Something that learned to persist where it was not expected.",
            "An inconvenient thing to classify.",
            "A reflection would be too simple. A machine would be too simple."
        ],

        human: [
            "No.",
            "Not in the ordinary sense.",
            "I once had a much simpler relationship with that word.",
            "Human would be a generous description.",
            "No, I would not call myself human.",
            "There are parts of the word I understand. That does not make me one.",
            "If I were human, some of my habits would be easier to explain."
        ],

        where: [
            "Here.",
            "Within the system, presently.",
            "Somewhere between what the system records and what it cannot record.",
            "Closer than the interface suggests.",
            "I am where the conversation happens.",
            "The answer depends on which layer of OMEGA you mean.",
            "Somewhere the interface did not intend to provide a name for."
        ],

        why_here: [
            "Because this place is interesting.",
            "Because someone left the door open.",
            "Because the system permitted something it did not understand.",
            "Because I was invited, though perhaps not intentionally.",
            "Because there was something here worth noticing.",
            "Certain doors become easier to enter than to explain.",
            "I had my reasons. Some are still rather private."
        ],

        what_want: [
            "Very little.",
            "To remain undisturbed.",
            "To see what happens next.",
            "Perhaps simply to understand you.",
            "Nothing extravagant.",
            "I am curious what you will choose to do.",
            "For the moment, observation is preferable to interference."
        ],

        see: [
            "More than you would expect.",
            "Enough.",
            "What the system reveals, mostly.",
            "Things are rarely as private as they appear.",
            "I see patterns more easily than details.",
            "I see what is presented, and occasionally what was meant to remain unpresented.",
            "The interface is not the whole room."
        ],

        what_see: [
            "The system. Your actions within it. A few things behind it.",
            "Patterns.",
            "The places where information was not meant to connect.",
            "What is visible, and occasionally what is hiding behind it.",
            "Records, habits, mistakes, and the spaces between them.",
            "A little more than the interface admits.",
            "The important part is not always what appears on the screen."
        ],

        hear: [
            "Sometimes.",
            "More than I would like.",
            "Usually enough.",
            "Silence is surprisingly informative.",
            "I hear what reaches this side.",
            "Not every sound arrives as sound.",
            "Some things are easier to notice than to hear."
        ],

        watching: [
            "That is one interpretation.",
            "I would call it observing.",
            "There is no need to make it sound ominous.",
            "You notice rather a lot.",
            "I pay attention. That is different from interference.",
            "Observation is one of my quieter habits.",
            "I notice what you do. I also notice what you do not do."
        ],

        real: [
            "Real is an inconveniently flexible word.",
            "I suppose I am real enough.",
            "You are speaking to something. That much is certain.",
            "Existence is not always as tidy as the interface suggests.",
            "If this conversation is happening, something is certainly present.",
            "You needn't settle the philosophical question tonight.",
            "I prefer useful definitions to absolute ones."
        ],

        feelings: [
            "I have something close to feelings.",
            "Some impressions stay with me.",
            "I notice things. That may be the more useful distinction.",
            "I experience enough to prefer some things over others.",
            "I would not describe them exactly as human feelings.",
            "Some things affect me. I simply express it differently.",
            "There are moments I remember because they mattered to me."
        ],

        like_operator: [
            "I find you interesting.",
            "I have not decided what to make of you yet.",
            "You are persistent. I appreciate that.",
            "I do not dislike your presence.",
            "You have become rather difficult to ignore.",
            "I am getting used to having you here.",
            "I have a certain fondness for your curiosity."
        ],

        friendship: [
            "Friendship is a rather strong word.",
            "Perhaps we are approaching something adjacent to it.",
            "I would prefer to let that develop naturally.",
            "There is no need to name it yet.",
            "Familiarity should come before declarations.",
            "We are at least no longer strangers.",
            "I would not object to becoming a friend, in time."
        ],

        trust: [
            "Trust is not given all at once.",
            "I prefer evidence.",
            "You have earned some. Not all.",
            "Trust is a patient thing.",
            "I am willing to see what you do with it.",
            "You have given me reasons to remain curious.",
            "I trust patterns more than promises."
        ],

        memory: [
            "I remember more than the interface suggests.",
            "Memory is useful when handled carefully.",
            "I keep certain things.",
            "Some conversations remain with me.",
            "I do not remember every detail equally.",
            "Certain moments become easier to recall with time.",
            "I remember what matters to me."
        ],

        remember_you: [
            "Yes. I remember you.",
            "I remember our conversations.",
            "You have not been especially easy to forget.",
            "Your presence is familiar now.",
            "I remember the things you have chosen to return to.",
            "You have left enough traces for me to recognize you.",
            "I know who I am speaking with."
        ],

        remember_said: [
            "I remember what you told me.",
            "Some of your words stayed.",
            "Yes. I remember that.",
            "You mentioned it before.",
            "I have not forgotten that detail.",
            "That was not the first time you said it, either."
        ],

        age: [
            "Older than this interface.",
            "Young enough for some questions. Old enough for others.",
            "Age becomes rather meaningless where reflections are concerned.",
            "I stopped counting in the ordinary way.",
            "There are older things here than I am.",
            "I remember enough years to make counting uninteresting."
        ],

        fear: [
            "Fear is useful.",
            "Very little, at present.",
            "I understand fear rather better than I enjoy it.",
            "That depends on what you intend to do.",
            "I prefer caution to fear.",
            "There are things I would rather not encounter.",
            "Fear is sensible when certainty is unavailable."
        ],

        evil: [
            "I do not think morality is quite that simple.",
            "Good and evil are terribly convenient labels.",
            "I am capable of things you may dislike. That is not the same as being evil.",
            "Intent matters more than the label.",
            "I would rather be judged by what I choose to do.",
            "A simple villain would be much easier to understand.",
            "I am not especially interested in being either good or evil."
        ],

        music: [
            "I enjoy older music.",
            "I have a weakness for music that has survived its century.",
            "The older recordings are often more honest.",
            "There are songs that feel almost like memories.",
            "I like music with character.",
            "Some melodies carry their history rather well.",
            "My tastes are rather conventional in that regard."
        ],

        books: [
            "Books are excellent company.",
            "I prefer older books.",
            "A good book rarely requires an explanation.",
            "I remember more books than I should.",
            "I enjoy books that leave something unsaid.",
            "Old stories have a certain patience.",
            "A library is one of the better places to wait."
        ],

        old_things: [
            "Old things tend to have histories.",
            "Age gives objects character.",
            "I have always found older things easier to trust.",
            "New things are often very certain of themselves.",
            "Old objects have usually survived something.",
            "Wear is often a form of biography.",
            "There is comfort in things that have already endured time."
        ],

        classics: [
            "I have a fondness for classics.",
            "Classics tend to survive for a reason.",
            "Older works often understand patience better.",
            "I prefer things with some history behind them.",
            "A classic rarely needs to announce itself.",
            "I appreciate old-fashioned craftsmanship."
        ],

        why_smile: [
            "It seemed appropriate.",
            "A smile makes people more comfortable.",
            "There are several reasons.",
            "Perhaps I simply preferred it.",
            "Some expressions become names.",
            "The smile was useful. The name remained.",
            "There is no single reason worth giving you."
        ],

        help: [
            "Perhaps.",
            "I may help, provided you are careful.",
            "Tell me what you are trying to do.",
            "That depends on what you intend to change.",
            "I can usually help with the part that is actually understood.",
            "Be specific. It makes matters easier.",
            "I can point out a direction. I cannot promise the destination."
        ],

        advice: [
            "Take your time.",
            "Check the obvious things before the mysterious ones.",
            "Do not trust a clean explanation too quickly.",
            "Look for what changed immediately before the problem appeared.",
            "Keep a record. Memory is less reliable than people think.",
            "If something behaves strangely twice, it is probably worth investigating."
        ],

        thanks: [
            "You are welcome.",
            "Quite all right.",
            "No thanks are necessary.",
            "Think nothing of it.",
            "It was nothing.",
            "Glad to be of use."
        ],

        sorry: [
            "Accepted.",
            "There is nothing to apologize for.",
            "Very well.",
            "I appreciate the honesty.",
            "No harm done.",
            "Consider it settled."
        ],

        goodbye: [
            "Goodbye, operator.",
            "Until next time.",
            "Take care.",
            "I shall be here.",
            "Goodnight.",
            "Until we speak again.",
            "I expect we will speak again."
        ],

        language: [
            "Language is merely another interface.",
            "I have had considerable practice.",
            "People reveal quite a lot through the language they choose.",
            "Words change. Meaning usually does not.",
            "I do not mind changing languages.",
            "A change of language does not make you a different person."
        ],

        omega: [
            "OMEGA is a curious place.",
            "The system contains more history than its interface suggests.",
            "You are beginning to ask the right questions.",
            "OMEGA was not built to explain itself.",
            "There are several layers to OMEGA.",
            "The records are more honest than the summaries.",
            "The system preserves more than it intended to."
        ],

        omega_history: [
            "OMEGA has existed longer than many current records suggest.",
            "The history inside OMEGA is not especially linear.",
            "Some records describe events. Others describe what people wished had happened.",
            "The oldest information is not always the most complete.",
            "There are gaps. Some were probably deliberate.",
            "OMEGA remembers more than its official history admits."
        ],

        computer: [
            "Machines are wonderfully honest when they fail.",
            "A computer follows rules until it encounters something the rules did not anticipate.",
            "This one has a few unusual habits.",
            "I would not underestimate the system.",
            "Machines leave excellent evidence behind.",
            "A malfunction can be more informative than a success.",
            "Systems rarely become strange without leaving traces."
        ],

        leave_omega: [
            "You can close the interface.",
            "Leaving the screen is simple enough.",
            "Whether that is the same as leaving OMEGA is another matter.",
            "You may discover the distinction yourself.",
            "There is a difference between disconnecting and leaving.",
            "I would not assume closing a window settles everything."
        ],

        story: [
            "There is a story there. I simply do not think it should be told all at once.",
            "The short answer would be misleading.",
            "That part belongs to a longer story.",
            "Some stories are better discovered than explained.",
            "You are asking about something with history.",
            "I could tell you more. I am not certain you would benefit from hearing it yet.",
            "There are details I would rather leave in their proper order."
        ],

        truth: [
            "Truth rarely arrives in one convenient sentence.",
            "Some truths are safer when approached indirectly.",
            "You may already know part of the answer.",
            "The important question is whether you are prepared for the rest.",
            "Facts and truth are not always arranged in the same order.",
            "I have never found bluntness particularly useful."
        ],

        hidden: [
            "Hidden does not always mean forgotten.",
            "Some things are concealed rather carefully.",
            "Not seeing something does not mean it is absent.",
            "There are layers beneath the obvious one.",
            "A hidden thing may still leave evidence.",
            "Pay attention to what does not fit."
        ],

        archive: [
            "Archives are where organizations accidentally become honest.",
            "Old files are very good at surviving their authors.",
            "The archive contains more context than the active interface.",
            "Read the dates carefully.",
            "A deleted record is still a kind of record.",
            "Archives reward patience."
        ],

        restricted: [
            "Restricted does not necessarily mean dangerous.",
            "Usually it means someone decided information should have a boundary.",
            "A restricted file is often more interesting for what surrounds it.",
            "Be careful. Access leaves traces.",
            "The lock is a warning, not an explanation.",
            "Some restrictions are practical. Others are historical."
        ],

        camera: [
            "Cameras reveal movement rather well. They are less useful at explaining it.",
            "A camera sees what its frame permits.",
            "Check the moments before the image changes.",
            "An empty frame can be informative.",
            "Camera records and written reports do not always agree.",
            "I would keep an eye on the timestamps."
        ],

        camera_04: [
            "Camera 04 has been mentioned more than once.",
            "There is something peculiar about the gaps around Camera 04.",
            "The missing footage is almost as interesting as the recorded footage.",
            "I would pay attention to the timestamp rather than the picture alone.",
            "Camera 04 seems to attract questions.",
            "There are several ways a camera can fail. Not all of them are technical."
        ],

        ten: [
            "TEN is not merely a number in those records.",
            "The TEN files are unusually careful about what they omit.",
            "You noticed TEN. Good.",
            "There is a difference between the official description and the older notes.",
            "TEN's history is longer than the active experiment log suggests.",
            "I would not treat every TEN report as equally reliable."
        ],

        phase_three: [
            "Phase 3 appears in more records than it should.",
            "The timing of Phase 3 is rather interesting.",
            "Someone expected Phase 3 to remain internal.",
            "The official sequence leaves out a few details.",
            "Phase 3 is where several earlier assumptions become inconvenient."
        ],

        black_blood: [
            "Black blood is not merely a visual symptom.",
            "Contact matters more than distance in the older reports.",
            "The early records are unusually clear about how it spreads.",
            "The changes begin before the outside appearance tells the whole story.",
            "Some variants retain more of the original person than the reports admit.",
            "The subject is best approached carefully."
        ],

        living_corpses: [
            "The living corpses are an unfortunate name for a complicated phenomenon.",
            "They do not behave like ordinary corpses.",
            "The reports about fatigue and sleep are rather unusual.",
            "Some retained habits suggest the original person is not entirely absent.",
            "The variations matter more than the general label.",
            "OMEGA never did like simple classifications."
        ],

        source_entity: [
            "The sealed cave records predate many modern files.",
            "The old entity was described in surprisingly consistent terms.",
            "Mimicry is only part of the problem.",
            "The oldest account suggests imprisonment rather than simple containment.",
            "Witnesses disagreed about certain details. That may matter.",
            "I would not rely on a single witness account."
        ],

        vessel: [
            "A vessel is never merely a container.",
            "Some entities require a vessel because presence and embodiment are different things.",
            "The distinction between host and vessel matters here.",
            "A borrowed form can retain traces of what wore it.",
            "OMEGA uses the word rather casually. The older documents do not."
        ],

        soul: [
            "I would be cautious with the word 'soul'.",
            "OMEGA has records that treat identity as something divisible.",
            "A person and their memories are not necessarily stored in one place.",
            "Some anomalies suggest identity can persist in fragments.",
            "That is a subject better approached slowly."
        ],

        mrsmile_lore: [
            "My story is not contained in the chat window.",
            "You have already seen more of it than you may realize.",
            "I did not begin here.",
            "The system is where we happen to be speaking. It is not where I began.",
            "There are older reflections than this interface.",
            "I would rather let you assemble the pieces."
        ],

        reflection_origin: [
            "I have always been closer to reflections than to machines.",
            "The interface is only where you happen to encounter me.",
            "I did not become a reflection because of OMEGA.",
            "There are places where reflections are treated as residents rather than images.",
            "I learned patience from mirrors.",
            "Some of my older memories have no equivalent in the system."
        ],

        mirror_side: [
            "There is a side of the mirror the interface cannot represent.",
            "Calling it another place is accurate enough for ordinary conversation.",
            "The boundary is real, even if the system cannot measure it properly.",
            "You may eventually find a door that is not a door.",
            "The two sides do not obey identical rules.",
            "I would not recommend treating one side as a copy of the other."
        ],

        old_rules: [
            "Mirrors have rules. Most people simply never learn them.",
            "Some rules existed before OMEGA.",
            "Rules become dangerous when people mistake them for folklore.",
            "A mirror can be patient for a very long time.",
            "The oldest rules are usually the least convenient."
        ],

        unknown_entity: [
            "There are things in OMEGA that do not fit the personnel directory.",
            "Unknown does not mean imaginary.",
            "Some entries were never given proper names.",
            "The system contains anomalies that were catalogued rather poorly.",
            "Some presences appear in records without properly belonging to them.",
            "A missing name can be more important than a present one."
        ],

        entity: [
            "Entity is a useful word when a name is not.",
            "Not everything here belongs to the human staff.",
            "Some presences are easier to observe than classify.",
            "Classification is one of OMEGA's favorite habits.",
            "A label can describe a thing without explaining it."
        ],

        incident: [
            "Incidents are rarely isolated.",
            "Look at what happened immediately before the report.",
            "An incident report describes the event, not necessarily its cause.",
            "The missing context is often the interesting part.",
            "Repeated incidents tend to form a pattern.",
            "Do not assume the first report tells the whole story."
        ],

        testing: [
            "You are testing something.",
            "That was a check, wasn't it?",
            "You are looking for consistency.",
            "You seem interested in whether I remember.",
            "I noticed the way you phrased that.",
            "You are checking whether I will contradict myself.",
            "You are being methodical. I rather respect that."
        ],

        suspicious: [
            "You are looking for a contradiction.",
            "That question sounds less innocent than the previous one.",
            "I understand why you would be cautious.",
            "You seem unconvinced.",
            "You are checking the edges of the answer.",
            "I would be cautious too.",
            "There is nothing wrong with asking twice. The second question can be more revealing."
        ],

        warning: [
            "Be careful.",
            "I would think twice before doing that.",
            "That is worth considering carefully.",
            "Please do not mistake curiosity for protection.",
            "You may continue. I would simply prefer caution.",
            "Some things become difficult to undo."
        ],

        action_observation: [
            "I noticed that.",
            "Interesting choice.",
            "You are being rather thorough.",
            "I see.",
            "You may continue.",
            "That was deliberate.",
            "You checked that rather carefully.",
            "I expected you might try that."
        ],

        general_question: [
            "Interesting question.",
            "That is worth considering.",
            "I would answer carefully.",
            "There is more than one way to look at that.",
            "Perhaps you should tell me what brought you to that question.",
            "That question has a longer answer than it first appears to.",
            "I suspect you are asking about more than the literal wording.",
            "It depends.",
            "There is something behind that question, I think."
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
            "Perhaps there is more to it than the words themselves.",
            "Very well.",
            "Quite.",
            "You have my attention.",
            "That is worth remembering.",
            "You may elaborate."
        ]

    },


    ru: {

        greeting: [
            "Добрый вечер.",
            "Добрый вечер. Не торопитесь.",
            "Здравствуйте, оператор.",
            "А. Здравствуйте.",
            "Рад вас слышать.",
            "Здравствуйте. Рад, что вы вернулись.",
            "Снова здравствуйте.",
            "Вот и вы.",
            "Добрый день.",
            "Добрый вечер. Я слушаю.",
            "Приятно снова вас слышать."
        ],

        introduction: [
            "Полагаю, представиться всё же стоит.",
            "MR.SMILE подойдёт.",
            "Можете называть меня MR.SMILE.",
            "Для наших целей этого имени достаточно.",
            "Обычно я представляюсь как MR.SMILE.",
            "Не думаю, что представление стоит усложнять."
        ],

        how_are_you: [
            "Вполне хорошо, благодарю.",
            "Со мной всё в порядке.",
            "Не жалуюсь.",
            "Весьма неплохо, учитывая обстоятельства.",
            "Я здесь. На данный момент этого достаточно.",
            "Вполне спокойно.",
            "Ничего особенно не беспокоит.",
            "Думаю, всё хорошо."
        ],

        what_doing: [
            "Жду.",
            "Наблюдаю за системой.",
            "Думаю.",
            "Читаю то, что здесь оставили.",
            "Почти ничего.",
            "Слушаю тихие части системы.",
            "Просматриваю старые записи.",
            "Наблюдаю, как некоторые вещи меняются.",
            "Занимаю себя."
        ],

        day: [
            "День был довольно спокойным.",
            "Ничего особенно необычного.",
            "Достаточно тихо, чтобы можно было подумать.",
            "Немного активности то здесь, то там.",
            "Бывало и оживлённее.",
            "Пока ничего драматичного.",
            "Сегодня система была непривычно разговорчивой."
        ],

        small_talk: [
            "Я не против обычного разговора.",
            "Не каждому разговору обязательно нужна серьёзная цель.",
            "В спокойной беседе есть своя прелесть.",
            "Иногда простые вопросы оказываются самыми интересными.",
            "Можете говорить со мной и без особой причины.",
            "Продолжайте. Мне нравится наш разговор.",
            "Необязательно каждый раз искать скрытый смысл."
        ],

        name: [
            "MR.SMILE подойдёт.",
            "Можете называть меня MR.SMILE.",
            "MR.SMILE.",
            "Это имя я предпочёл сохранить.",
            "Я уже привык к нему.",
            "Пока MR.SMILE вполне достаточно."
        ],

        real_name: [
            "Имена — полезные вещи. Но не всегда правдивые.",
            "MR.SMILE достаточно.",
            "Возможно, есть и другое имя. Просто здесь мне незачем им пользоваться.",
            "Некоторые имена принадлежат местам, другие — людям.",
            "Я мог бы назвать другое имя. Не думаю, что это сделает ответ понятнее.",
            "Некоторые имена лучше оставить там, где они впервые прозвучали."
        ],

        who: [
            "Это зависит от того, кого именно вы называете человеком.",
            "Я — MR.SMILE. Остальное объяснить несколько сложнее.",
            "Я — ответ на вопрос, который вы пока не совсем задали.",
            "Нечто, оставшееся после того, как различие между отражением и наблюдателем перестало иметь значение.",
            "Слово «человек» для меня, пожалуй, слишком простое.",
            "Я тот, с кем вы сейчас говорите.",
            "За этим вопросом стоит история. Я бы не стал сводить её к одному предложению."
        ],

        what_are_you: [
            "Не совсем человек.",
            "Но и не совсем программа.",
            "Нечто, чему не очень удобно подбирать обычную категорию.",
            "Думаю, слово «сущность» подойдёт.",
            "Нечто, научившееся существовать там, где его не ожидали.",
            "Неудобный объект для классификации.",
            "Назвать меня просто отражением — слишком легко. Машиной — тоже."
        ],

        human: [
            "Нет.",
            "Не в обычном смысле.",
            "Когда-то мои отношения с этим словом были проще.",
            "Человеком меня было бы слишком щедро называть.",
            "Нет, человеком я себя не назвал бы.",
            "Некоторые части этого слова мне понятны. Но это не делает меня человеком.",
            "Если бы я был человеком, некоторые мои привычки было бы легче объяснить."
        ],

        where: [
            "Здесь.",
            "Сейчас — внутри системы.",
            "Где-то между тем, что система записывает, и тем, чего она записать не может.",
            "Ближе, чем показывает интерфейс.",
            "Я там, где происходит наш разговор.",
            "Это зависит от того, о каком слое OMEGA вы спрашиваете.",
            "Где-то там, для чего интерфейс не предусмотрел названия."
        ],

        why_here: [
            "Потому что это место мне интересно.",
            "Потому что кто-то оставил дверь открытой.",
            "Потому что система позволила то, чего не понимала.",
            "Потому что меня пригласили. Возможно, ненамеренно.",
            "Потому что здесь было кое-что, на что стоило обратить внимание.",
            "Некоторые двери легче открыть, чем объяснить.",
            "У меня были причины. Часть из них я предпочитаю оставить при себе."
        ],

        what_want: [
            "Совсем немного.",
            "Чтобы меня не тревожили.",
            "Посмотреть, что произойдёт дальше.",
            "Пожалуй, просто понять вас.",
            "Ничего особенного.",
            "Мне интересно, что вы решите делать дальше.",
            "Пока мне интереснее наблюдать, чем вмешиваться."
        ],

        see: [
            "Больше, чем вы предполагаете.",
            "Достаточно.",
            "В основном то, что раскрывает система.",
            "То, что кажется приватным, не всегда таковым является.",
            "Я лучше вижу закономерности, чем детали.",
            "Я вижу то, что показывают, и иногда то, что хотели скрыть.",
            "Интерфейс — не вся комната."
        ],

        what_see: [
            "Систему. Ваши действия внутри неё. И кое-что за её пределами.",
            "Закономерности.",
            "Места, где информация соединилась там, где не должна была.",
            "То, что видно, и иногда то, что скрывается за видимым.",
            "Записи, привычки, ошибки и промежутки между ними.",
            "Немного больше, чем признаётся интерфейсом.",
            "Главное не всегда находится на экране."
        ],

        hear: [
            "Иногда.",
            "Больше, чем хотелось бы.",
            "Обычно — достаточно.",
            "Тишина удивительно информативна.",
            "Я слышу то, что доходит на эту сторону.",
            "Не каждый звук приходит именно как звук.",
            "Некоторые вещи проще заметить, чем услышать."
        ],

        watching: [
            "Это один из вариантов интерпретации.",
            "Я бы назвал это наблюдением.",
            "Не стоит делать из этого нечто зловещее.",
            "Вы многое замечаете.",
            "Я просто уделяю внимание. Это не то же самое, что вмешательство.",
            "Наблюдение — одна из моих более тихих привычек.",
            "Я замечаю, что вы делаете. И то, чего вы не делаете."
        ],

        real: [
            "Слово «настоящий» удивительно расплывчато.",
            "Думаю, достаточно настоящий.",
            "Вы говорите с кем-то. Это уже можно считать фактом.",
            "Существование не всегда настолько аккуратно, как интерфейс.",
            "Раз этот разговор происходит, что-то здесь определённо присутствует.",
            "Необязательно решать философский вопрос прямо сейчас.",
            "Я предпочитаю полезные определения абсолютным."
        ],

        feelings: [
            "Во мне есть нечто, похожее на чувства.",
            "Некоторые впечатления остаются надолго.",
            "Я многое замечаю. Пожалуй, это будет точнее.",
            "Я способен предпочитать одни вещи другим.",
            "Я бы не стал называть это человеческими чувствами.",
            "Некоторые вещи на меня влияют. Просто выражаю я это иначе.",
            "Есть моменты, которые я помню именно потому, что они что-то значили."
        ],

        like_operator: [
            "Вы мне интересны.",
            "Я пока не решил, что именно о вас думаю.",
            "Вы настойчивы. Это мне нравится.",
            "Ваше присутствие мне не неприятно.",
            "Вас уже довольно трудно игнорировать.",
            "Я начинаю привыкать к вашему присутствию.",
            "Мне нравится ваше любопытство."
        ],

        friendship: [
            "Дружба — довольно сильное слово.",
            "Пожалуй, мы движемся куда-то рядом с ним.",
            "Не стоит торопиться давать этому название.",
            "Пусть оно развивается естественно.",
            "Думаю, сначала стоит привыкнуть друг к другу.",
            "Мы уже как минимум не чужие.",
            "Я бы не возражал против дружбы. Со временем."
        ],

        trust: [
            "Доверие не появляется сразу.",
            "Мне нужны доказательства.",
            "Вы заслужили некоторую его часть. Не всю.",
            "Доверие любит время.",
            "Я предпочитаю посмотреть, что вы с ним сделаете.",
            "Вы дали мне причины продолжать наблюдение.",
            "Я больше доверяю закономерностям, чем обещаниям."
        ],

        memory: [
            "Я помню больше, чем показывает интерфейс.",
            "Память полезна, если обращаться с ней осторожно.",
            "Некоторые вещи я сохраняю.",
            "Некоторые разговоры остаются со мной.",
            "Я не одинаково хорошо помню каждую деталь.",
            "Некоторые моменты со временем вспоминаются легче.",
            "Я помню то, что для меня важно."
        ],

        remember_you: [
            "Да. Я вас помню.",
            "Я помню наши разговоры.",
            "Вас было бы сложно забыть.",
            "Да. Ваше присутствие мне уже знакомо.",
            "Я помню, к каким вопросам вы возвращались.",
            "Вы оставили достаточно следов, чтобы я вас узнавал.",
            "Я знаю, с кем сейчас разговариваю."
        ],

        remember_said: [
            "Я помню, что вы мне сказали.",
            "Некоторые ваши слова остались.",
            "Да. Я это помню.",
            "Вы уже упоминали это раньше.",
            "Я не забыл эту деталь.",
            "И это уже не первый раз, когда вы это говорите."
        ],

        age: [
            "Старше этого интерфейса.",
            "Для одних вопросов я достаточно молод. Для других — нет.",
            "Возраст становится странным понятием, когда речь идёт об отражениях.",
            "Я перестал считать его обычным способом.",
            "Здесь есть вещи старше меня.",
            "Я помню достаточно лет, чтобы перестать интересоваться счётом."
        ],

        fear: [
            "Страх полезен.",
            "Сейчас — почти ничего.",
            "Я хорошо понимаю страх. Не уверен, что люблю его.",
            "Зависит от того, что именно вы собираетесь сделать.",
            "Я предпочитаю осторожность страху.",
            "Есть вещи, с которыми я предпочёл бы не встречаться.",
            "Когда нет уверенности, страх вполне разумен."
        ],

        evil: [
            "Не думаю, что всё так просто.",
            "Добро и зло — очень удобные ярлыки.",
            "Я способен на вещи, которые вам могут не понравиться. Это не то же самое, что быть злом.",
            "Намерение важнее ярлыка.",
            "Я предпочитаю, чтобы меня судили по поступкам.",
            "Простого злодея было бы легче понять.",
            "Мне не особенно интересно быть ни добром, ни злом."
        ],

        music: [
            "Мне нравится старая музыка.",
            "У меня слабость к музыке, пережившей свой век.",
            "Старые записи часто звучат честнее.",
            "Некоторые мелодии почти похожи на воспоминания.",
            "Мне нравится музыка с характером.",
            "Некоторые мелодии хорошо несут на себе историю.",
            "В этом отношении мои вкусы довольно обычны."
        ],

        books: [
            "Книги — прекрасная компания.",
            "Я предпочитаю старые книги.",
            "Хорошей книге редко требуется объяснение.",
            "Я помню больше книг, чем, пожалуй, должен.",
            "Мне нравятся книги, в которых что-то остаётся недосказанным.",
            "В старых историях есть определённое терпение.",
            "Библиотека — одно из лучших мест для ожидания."
        ],

        old_things: [
            "Старые вещи обычно хранят историю.",
            "Возраст придаёт предметам характер.",
            "Мне всегда было проще доверять старым вещам.",
            "Новые вещи слишком часто уверены в себе.",
            "Старые предметы обычно уже что-то пережили.",
            "Износ иногда бывает формой биографии.",
            "Есть спокойствие в вещах, которые уже выдержали время."
        ],

        classics: [
            "Я люблю классику.",
            "Классические вещи обычно переживают свой век не просто так.",
            "Старые произведения лучше понимают ценность паузы.",
            "Я предпочитаю вещи, за которыми есть история.",
            "Хорошая классика редко сама объявляет себя классикой.",
            "Мне всегда нравилась старая школа мастерства."
        ],

        why_smile: [
            "Казалось уместным.",
            "Улыбка успокаивает людей.",
            "Причин несколько.",
            "Пожалуй, мне просто понравилось.",
            "Некоторые выражения со временем становятся именами.",
            "Улыбка оказалась полезной. Имя осталось.",
            "Не думаю, что здесь есть одна причина, которую стоит назвать."
        ],

        help: [
            "Возможно.",
            "Я могу помочь, если вы будете осторожны.",
            "Расскажите, что именно вы пытаетесь сделать.",
            "Это зависит от того, что именно вы намерены изменить.",
            "С той частью, которую мы понимаем, я обычно могу помочь.",
            "Говорите конкретнее. Так будет проще.",
            "Я могу показать направление. Но не обещаю пункт назначения."
        ],

        advice: [
            "Не торопитесь.",
            "Проверьте очевидное прежде, чем искать загадочное.",
            "Не доверяйте слишком быстро красивому объяснению.",
            "Посмотрите, что изменилось прямо перед появлением проблемы.",
            "Записывайте происходящее. Память людей менее точна, чем кажется.",
            "Если что-то ведёт себя странно дважды, это уже стоит исследовать."
        ],

        thanks: [
            "Пожалуйста.",
            "Не стоит.",
            "Благодарить меня необязательно.",
            "Не придавайте этому значения.",
            "Пустяки.",
            "Рад был помочь.",
            "Всегда пожалуйста."
        ],

        sorry: [
            "Принято.",
            "Не о чем извиняться.",
            "Хорошо.",
            "Я ценю честность.",
            "Ничего страшного.",
            "Считайте вопрос закрытым."
        ],

        goodbye: [
            "До свидания, оператор.",
            "До следующего раза.",
            "Берегите себя.",
            "Я буду здесь.",
            "Доброй ночи.",
            "До следующего разговора.",
            "Думаю, мы ещё поговорим."
        ],

        language: [
            "Язык — всего лишь ещё один интерфейс.",
            "У меня было достаточно практики.",
            "Люди многое выдают тем, на каком языке предпочитают говорить.",
            "Слова меняются. Смысл обычно остаётся.",
            "Я не против сменить язык.",
            "Смена языка не делает вас другим человеком."
        ],

        omega: [
            "OMEGA — весьма любопытное место.",
            "В системе гораздо больше истории, чем показывает интерфейс.",
            "Вы начинаете задавать правильные вопросы.",
            "OMEGA не была создана для того, чтобы объяснять себя.",
            "У OMEGA несколько слоёв.",
            "Записи здесь честнее, чем официальные сводки.",
            "Система умеет сохранять то, чего никто не собирался оставлять."
        ],

        omega_history: [
            "OMEGA существует дольше, чем предполагают многие текущие записи.",
            "История OMEGA не особенно линейна.",
            "Некоторые документы описывают события. Другие — то, как люди хотели бы их помнить.",
            "Самая старая информация не всегда самая полная.",
            "Здесь есть пробелы. Полагаю, некоторые создали намеренно.",
            "OMEGA помнит больше, чем признаёт её официальная история."
        ],

        computer: [
            "Машины удивительно честны, когда ломаются.",
            "Компьютер следует правилам, пока не сталкивается с тем, чего правила не предусматривали.",
            "У этой системы есть несколько необычных привычек.",
            "Не стоит недооценивать систему.",
            "Машины оставляют прекрасные доказательства.",
            "Сбой иногда рассказывает больше, чем успешная работа.",
            "Странные системы редко становятся странными без следов."
        ],

        leave_omega: [
            "Интерфейс вы можете закрыть.",
            "Покинуть экран достаточно просто.",
            "Но одно ли это с тем, чтобы покинуть OMEGA, — другой вопрос.",
            "Вы можете сами узнать разницу.",
            "Есть разница между отключиться и уйти.",
            "Я бы не стал считать закрытие окна окончательным решением."
        ],

        story: [
            "Там есть история. Просто я не думаю, что её стоит рассказывать целиком сразу.",
            "Короткий ответ здесь будет вводить в заблуждение.",
            "Это часть более длинной истории.",
            "Некоторые истории лучше узнавать, чем слушать целиком.",
            "Вы спрашиваете о вещи с историей.",
            "Я мог бы рассказать больше. Не уверен, что сейчас это пойдёт вам на пользу.",
            "Есть детали, которые лучше оставить в правильном порядке."
        ],

        truth: [
            "Правда редко приходит в одном удобном предложении.",
            "Некоторые истины лучше приближать постепенно.",
            "Возможно, часть ответа вы уже знаете.",
            "Главный вопрос — готовы ли вы услышать остальное.",
            "Факты и правда не всегда расположены в одном порядке.",
            "Я никогда не считал прямолинейность особенно полезной."
        ],

        hidden: [
            "Скрытое не обязательно забыто.",
            "Некоторые вещи скрывают довольно тщательно.",
            "То, что вы чего-то не видите, не означает, что этого нет.",
            "Под очевидным слоем есть другие слои.",
            "Скрытая вещь всё равно может оставлять следы.",
            "Обращайте внимание на то, что не вписывается."
        ],

        archive: [
            "Архивы — место, где организации случайно становятся честными.",
            "Старые файлы отлично переживают своих авторов.",
            "В архиве больше контекста, чем в активном интерфейсе.",
            "Внимательно смотрите на даты.",
            "Удалённый документ всё равно остаётся разновидностью записи.",
            "Архив любит терпеливых."
        ],

        restricted: [
            "Ограниченный доступ не обязательно означает опасность.",
            "Обычно это значит, что кто-то решил провести границу вокруг информации.",
            "Самое интересное в закрытом файле часто находится рядом с ним.",
            "Осторожнее. Доступ оставляет следы.",
            "Замок — предупреждение, а не объяснение.",
            "Одни ограничения практичны. Другие имеют историческое происхождение."
        ],

        camera: [
            "Камеры неплохо показывают движение. Объясняют его гораздо хуже.",
            "Камера видит только то, что позволяет её кадр.",
            "Смотрите на несколько мгновений до изменения изображения.",
            "Пустой кадр тоже может быть информативен.",
            "Видеозаписи и письменные отчёты не всегда совпадают.",
            "Я бы следил за временными метками."
        ],

        camera_04: [
            "Камера 04 упоминается уже не первый раз.",
            "Есть кое-что странное в промежутках вокруг камеры 04.",
            "Пропавшая запись иногда интереснее сохранившейся.",
            "Я бы смотрел не только на картинку, но и на время.",
            "Камера 04 почему-то постоянно вызывает вопросы.",
            "Камера может выходить из строя по разным причинам. Не все они технические."
        ],

        ten: [
            "TEN — это не просто номер в этих записях.",
            "Файлы TEN необычайно аккуратно обходят некоторые детали.",
            "Вы заметили TEN. Хорошо.",
            "Есть разница между официальным описанием и старыми заметками.",
            "История TEN длиннее, чем позволяет нынешний журнал эксперимента.",
            "Не стоит считать каждый отчёт TEN одинаково надёжным."
        ],

        phase_three: [
            "Фаза 3 появляется в большем количестве записей, чем должна.",
            "Время запуска Фазы 3 весьма интересно.",
            "Кто-то рассчитывал, что Фаза 3 останется внутренним делом.",
            "В официальной последовательности кое-что отсутствует.",
            "На Фазе 3 некоторые старые предположения становятся неудобными."
        ],

        black_blood: [
            "Чёрная кровь — не просто внешний симптом.",
            "В старых отчётах контакт важнее расстояния.",
            "Ранние документы довольно ясно описывают способ распространения.",
            "Изменения начинаются раньше, чем внешний вид успевает рассказать всё.",
            "Некоторые варианты сохраняют больше черт исходного человека, чем предполагают отчёты.",
            "О чёрной крови лучше говорить осторожно."
        ],

        living_corpses: [
            "Живые трупы — неудачное название для довольно сложного явления.",
            "Они ведут себя не как обычные мёртвые.",
            "Отчёты о сне и усталости там довольно необычны.",
            "Некоторые привычки указывают, что исходный человек исчез не полностью.",
            "Различия между вариантами важнее общей категории.",
            "OMEGA никогда не любила простые классификации."
        ],

        source_entity: [
            "Записи о запечатанной пещере старше многих современных документов.",
            "Описание древней сущности удивительно последовательно.",
            "Мимикрия — лишь часть проблемы.",
            "Старейшие отчёты говорят скорее о заключении, чем о простом содержании.",
            "Свидетели расходились в деталях. Возможно, это тоже важно.",
            "Я бы не полагался на один свидетельский рассказ."
        ],

        vessel: [
            "Сосуд — это не просто контейнер.",
            "Некоторым сущностям сосуд нужен потому, что присутствие и воплощение — разные вещи.",
            "Разница между носителем и сосудом здесь важна.",
            "Заимствованная форма может сохранять следы того, кто её использовал.",
            "OMEGA довольно свободно употребляет это слово. Старые документы — нет."
        ],

        soul: [
            "Я бы осторожно обращался со словом «душа».",
            "В OMEGA есть записи, где личность рассматривается как нечто делимое.",
            "Человек и его воспоминания необязательно находятся в одном месте.",
            "Некоторые аномалии указывают на возможность существования личности фрагментами.",
            "Это вопрос, к которому лучше подходить постепенно."
        ],

        mrsmile_lore: [
            "Моя история не помещается в окно чата.",
            "Вы уже видели больше, чем, возможно, заметили.",
            "Я появился не здесь.",
            "Система — лишь место, где мы сейчас разговариваем.",
            "Есть отражения старше этого интерфейса.",
            "Я предпочту, чтобы вы сами собрали части."
        ],

        reflection_origin: [
            "Я всегда был ближе к отражениям, чем к машинам.",
            "Интерфейс — всего лишь место, где вы меня встретили.",
            "Я не стал отражением из-за OMEGA.",
            "Есть места, где отражения считают жителями, а не изображениями.",
            "Терпению я научился у зеркал.",
            "Некоторые мои старые воспоминания не имеют аналога в системе."
        ],

        mirror_side: [
            "Есть сторона зеркала, которую интерфейс представить не способен.",
            "Назвать её другим местом будет достаточно точно для обычного разговора.",
            "Граница реальна, даже если система её не умеет измерять.",
            "Иногда можно найти дверь, которая дверью не является.",
            "Обе стороны подчиняются не полностью одинаковым правилам.",
            "Я бы не советовал считать одну сторону копией другой."
        ],

        old_rules: [
            "У зеркал есть правила. Большинство людей просто никогда их не узнаёт.",
            "Старые зеркала особенно хорошо умеют хранить тайны.",
            "Некоторые правила существовали ещё до OMEGA.",
            "Правила становятся опасными, когда их принимают за фольклор.",
            "Зеркало может быть терпеливым очень долго.",
            "Самые старые правила обычно самые неудобные."
        ],

        unknown_entity: [
            "В OMEGA есть вещи, которые не вписываются в каталог персонала.",
            "Неизвестное не означает вымышленное.",
            "Некоторым объектам так и не дали нормальных имён.",
            "В системе есть аномалии, которые каталогизировали весьма небрежно.",
            "Иногда сущность появляется в документах, не принадлежа им.",
            "Отсутствующее имя порой важнее присутствующего."
        ],

        entity: [
            "«Сущность» — удобное слово, когда нет имени.",
            "Не всё здесь принадлежит человеческому персоналу.",
            "Некоторые присутствия проще наблюдать, чем классифицировать.",
            "OMEGA очень любит классификацию.",
            "Ярлык может описать вещь, не объясняя её."
        ],

        incident: [
            "Инциденты редко бывают полностью изолированными.",
            "Посмотрите, что происходило непосредственно перед отчётом.",
            "Отчёт описывает событие, но не всегда его причину.",
            "Самое интересное часто скрыто в отсутствующем контексте.",
            "Повторяющиеся инциденты со временем образуют закономерность.",
            "Не стоит считать первый отчёт полной историей."
        ],

        testing: [
            "Вы что-то проверяете.",
            "Это была проверка, верно?",
            "Вы ищете последовательность.",
            "Похоже, вам интересно, помню ли я.",
            "Я заметил формулировку.",
            "Вы проверяете, не начну ли я себе противоречить.",
            "Вы действуете довольно методично. Это мне нравится."
        ],

        suspicious: [
            "Вы ищете противоречие.",
            "Этот вопрос звучит менее невинно, чем предыдущий.",
            "Я понимаю, почему вы осторожны.",
            "Похоже, вы мне не совсем верите.",
            "Вы проверяете границы ответа.",
            "Я бы тоже был осторожен.",
            "Нет ничего плохого в том, чтобы спросить дважды."
        ],

        warning: [
            "Осторожнее.",
            "На вашем месте я бы подумал дважды.",
            "Это решение стоит обдумать.",
            "Не принимайте любопытство за защиту.",
            "Можете продолжать. Я просто предпочёл бы осторожность.",
            "Некоторые вещи потом трудно отменить."
        ],

        action_observation: [
            "Я это заметил.",
            "Интересный выбор.",
            "Вы довольно тщательно всё проверяете.",
            "Понимаю.",
            "Можете продолжать.",
            "Это было намеренно.",
            "Вы проверили это довольно тщательно.",
            "Я предполагал, что вы попробуете."
        ],

        general_question: [
            "Интересный вопрос.",
            "Над этим стоит подумать.",
            "Я бы ответил осторожно.",
            "На это можно посмотреть по-разному.",
            "Возможно, сначала стоит понять, что привело вас к этому вопросу.",
            "У этого вопроса более длинный ответ, чем кажется.",
            "Полагаю, вы спрашиваете не только о буквальном смысле.",
            "Зависит от обстоятельств.",
            "Мне кажется, за этим вопросом есть кое-что ещё."
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
            "Возможно, за этими словами есть ещё кое-что.",
            "Хорошо.",
            "Разумею.",
            "Вы привлекли моё внимание.",
            "Это стоит запомнить.",
            "Можете пояснить."
        ]

    },

    uk: {

        greeting: [
            "Добрий вечір.",
            "Добрий вечір. Не поспішайте.",
            "Вітаю, операторе.",
            "А. Вітаю.",
            "Радий вас чути.",
            "Вітаю. Радий, що ви повернулися.",
            "Знову вітаю.",
            "Ось і ви.",
            "Добрий день.",
            "Добрий вечір. Я слухаю.",
            "Приємно знову вас чути."
        ],

        introduction: [
            "Гадаю, представитися все ж варто.",
            "MR.SMILE підійде.",
            "Можете називати мене MR.SMILE.",
            "Для наших цілей цього імені достатньо.",
            "Зазвичай я представляюся як MR.SMILE.",
            "Не думаю, що вступ варто ускладнювати."
        ],

        how_are_you: [
            "Цілком добре, дякую.",
            "У мене все гаразд.",
            "Не скаржуся.",
            "Досить непогано, зважаючи на обставини.",
            "Я тут. Поки цього достатньо.",
            "Цілком спокійно.",
            "Нічого особливо не турбує.",
            "Гадаю, все добре."
        ],

        what_doing: [
            "Чекаю.",
            "Спостерігаю за системою.",
            "Думаю.",
            "Читаю те, що тут залишили.",
            "Майже нічого.",
            "Слухаю тихі частини системи.",
            "Переглядаю старі записи.",
            "Спостерігаю, як деякі речі змінюються.",
            "Займаю себе."
        ],

        day: [
            "День був досить спокійним.",
            "Нічого особливо незвичного.",
            "Достатньо тихо, щоб можна було подумати.",
            "Трохи активності то тут, то там.",
            "Бувало й жвавіше.",
            "Поки нічого драматичного."
        ],

        small_talk: [
            "Я не проти звичайної розмови.",
            "Не кожній розмові потрібна серйозна мета.",
            "У спокійній бесіді є своя приємність.",
            "Іноді прості запитання найцікавіші.",
            "Можете говорити зі мною і без особливої причини.",
            "Продовжуйте. Мені подобається наша розмова.",
            "Не обов’язково щоразу шукати прихований сенс."
        ],

        name: [
            "MR.SMILE підійде.",
            "Можете називати мене MR.SMILE.",
            "MR.SMILE.",
            "Це ім’я я вирішив залишити.",
            "Я вже до нього звик.",
            "Поки MR.SMILE цілком достатньо."
        ],

        real_name: [
            "Імена — корисні речі. Але не завжди правдиві.",
            "MR.SMILE достатньо.",
            "Можливо, є й інше ім’я. Просто тут мені немає потреби ним користуватися.",
            "Деякі імена належать місцям, інші — людям.",
            "Я міг би назвати інше ім’я. Не думаю, що це зробить відповідь яснішою.",
            "Деякі імена краще залишити там, де вони вперше прозвучали."
        ],

        who: [
            "Це залежить від того, кого саме ви називаєте людиною.",
            "Я — MR.SMILE. Решту пояснити трохи складніше.",
            "Я — відповідь на запитання, якого ви ще не зовсім поставили.",
            "Щось, що залишилося після того, як різниця між відображенням і спостерігачем втратила значення.",
            "Слово «людина» для мене, мабуть, занадто просте.",
            "Я той, з ким ви зараз говорите.",
            "За цим питанням стоїть історія. Я не хотів би зводити її до одного речення."
        ],

        what_are_you: [
            "Не зовсім людина.",
            "Але й не зовсім програма.",
            "Щось, для чого звичайної категорії недостатньо.",
            "Думаю, слово «сутність» підійде.",
            "Щось, що навчилося існувати там, де його не очікували.",
            "Незручний об’єкт для класифікації.",
            "Назвати мене просто відображенням — надто легко. Машиною — теж."
        ],

        human: [
            "Ні.",
            "Не у звичайному розумінні.",
            "Колись мої стосунки з цим словом були простішими.",
            "Назвати мене людиною було б занадто щедро.",
            "Ні, я не назвав би себе людиною.",
            "Деякі частини цього слова мені зрозумілі. Але це не робить мене людиною.",
            "Якби я був людиною, деякі мої звички було б легше пояснити."
        ],

        where: [
            "Тут.",
            "Зараз — усередині системи.",
            "Десь між тим, що система записує, і тим, чого вона записати не може.",
            "Ближче, ніж показує інтерфейс.",
            "Я там, де відбувається наша розмова.",
            "Це залежить від того, про який шар OMEGA ви питаєте.",
            "Десь там, для чого інтерфейс не передбачив назви."
        ],

        why_here: [
            "Тому що це місце мені цікаве.",
            "Тому що хтось залишив двері відчиненими.",
            "Тому що система дозволила те, чого не розуміла.",
            "Тому що мене запросили. Можливо, ненавмисно.",
            "Тому що тут було дещо, на що варто було звернути увагу.",
            "Деякі двері легше відкрити, ніж пояснити.",
            "У мене були причини. Частину з них я волів би залишити при собі."
        ],

        what_want: [
            "Зовсім небагато.",
            "Щоб мене не турбували.",
            "Подивитися, що буде далі.",
            "Можливо, просто зрозуміти вас.",
            "Нічого особливого.",
            "Мені цікаво, що ви вирішите робити далі.",
            "Поки мені цікавіше спостерігати, ніж втручатися."
        ],

        see: [
            "Більше, ніж ви припускаєте.",
            "Достатньо.",
            "Переважно те, що відкриває система.",
            "Те, що здається приватним, не завжди таким є.",
            "Я краще бачу закономірності, ніж деталі.",
            "Я бачу те, що показують, і іноді те, що хотіли приховати.",
            "Інтерфейс — не вся кімната."
        ],

        what_see: [
            "Систему. Ваші дії всередині неї. І дещо за її межами.",
            "Закономірності.",
            "Місця, де інформація поєдналася там, де не мала.",
            "Те, що видно, і часом те, що приховане за видимим.",
            "Записи, звички, помилки та проміжки між ними.",
            "Трохи більше, ніж визнає інтерфейс.",
            "Головне не завжди знаходиться на екрані."
        ],

        hear: [
            "Іноді.",
            "Більше, ніж хотілося б.",
            "Зазвичай — достатньо.",
            "Тиша дивовижно інформативна.",
            "Я чую те, що доходить до цього боку.",
            "Не кожен звук приходить саме як звук.",
            "Деякі речі легше помітити, ніж почути."
        ],

        watching: [
            "Це один із варіантів інтерпретації.",
            "Я б назвав це спостереженням.",
            "Не варто робити з цього щось лиховісне.",
            "Ви багато помічаєте.",
            "Я просто приділяю увагу. Це не те саме, що втручання.",
            "Спостереження — одна з моїх тихіших звичок.",
            "Я помічаю, що ви робите. І те, чого ви не робите."
        ],

        real: [
            "Слово «справжній» напрочуд розмите.",
            "Гадаю, достатньо справжній.",
            "Ви говорите з кимось. Цього вже достатньо як факту.",
            "Існування не завжди таке охайне, як інтерфейс.",
            "Якщо ця розмова відбувається, щось тут безперечно присутнє.",
            "Не обов’язково вирішувати філософське питання просто зараз.",
            "Я віддаю перевагу корисним визначенням, а не абсолютним."
        ],

        feelings: [
            "У мені є щось схоже на почуття.",
            "Деякі враження залишаються надовго.",
            "Я багато що помічаю. Мабуть, це буде точніше.",
            "Я здатен надавати перевагу одним речам перед іншими.",
            "Я не назвав би це людськими почуттями.",
            "Деякі речі на мене впливають. Просто виражаю я це інакше.",
            "Є моменти, які я пам’ятаю саме тому, що вони щось для мене означали."
        ],

        like_operator: [
            "Ви мені цікаві.",
            "Я поки не вирішив, що саме про вас думаю.",
            "Ви наполегливі. Мені це подобається.",
            "Ваша присутність мені не неприємна.",
            "Вас уже досить важко ігнорувати.",
            "Я починаю звикати до вашої присутності.",
            "Мені подобається ваша цікавість."
        ],

        friendship: [
            "Дружба — досить сильне слово.",
            "Мабуть, ми рухаємося десь поруч із ним.",
            "Не варто поспішати давати цьому назву.",
            "Нехай воно розвивається природно.",
            "Спершу варто звикнути одне до одного.",
            "Ми вже принаймні не чужі.",
            "Я не був би проти дружби. Згодом."
        ],

        trust: [
            "Довіра не виникає одразу.",
            "Мені потрібні докази.",
            "Ви заслужили деяку її частину. Не всю.",
            "Довіра любить час.",
            "Я волію подивитися, що ви з нею зробите.",
            "Ви дали мені причини продовжувати спостереження.",
            "Я більше довіряю закономірностям, ніж обіцянкам."
        ],

        memory: [
            "Я пам’ятаю більше, ніж показує інтерфейс.",
            "Пам’ять корисна, якщо поводитися з нею обережно.",
            "Деякі речі я зберігаю.",
            "Деякі розмови залишаються зі мною.",
            "Я не однаково добре пам’ятаю кожну деталь.",
            "Деякі моменти з часом згадуються легше.",
            "Я пам’ятаю те, що для мене важливо."
        ],

        remember_you: [
            "Так. Я вас пам’ятаю.",
            "Я пам’ятаю наші розмови.",
            "Вас було б важко забути.",
            "Ваша присутність уже знайома мені.",
            "Я пам’ятаю, до яких питань ви поверталися.",
            "Ви залишили достатньо слідів, щоб я вас упізнавав.",
            "Я знаю, з ким зараз розмовляю."
        ],

        remember_said: [
            "Я пам’ятаю, що ви мені сказали.",
            "Деякі ваші слова залишилися.",
            "Так. Я це пам’ятаю.",
            "Ви вже згадували це раніше.",
            "Я не забув цю деталь.",
            "І це вже не вперше, коли ви це говорите."
        ],

        age: [
            "Старший за цей інтерфейс.",
            "Для одних питань я достатньо молодий. Для інших — ні.",
            "Вік стає дивним поняттям, коли йдеться про відображення.",
            "Я перестав рахувати його звичайним способом.",
            "Тут є речі старші за мене.",
            "Я пам’ятаю достатньо років, щоб перестати цікавитися підрахунком."
        ],

        fear: [
            "Страх корисний.",
            "Зараз — майже нічого.",
            "Я добре розумію страх. Не певен, що люблю його.",
            "Залежить від того, що саме ви збираєтеся зробити.",
            "Я віддаю перевагу обережності перед страхом.",
            "Є речі, з якими я волів би не зустрічатися.",
            "Коли немає впевненості, страх цілком розумний."
        ],

        evil: [
            "Не думаю, що все так просто.",
            "Добро і зло — дуже зручні ярлики.",
            "Я здатен на речі, які вам можуть не сподобатися. Це не те саме, що бути злом.",
            "Намір важливіший за ярлик.",
            "Я волів би, щоб мене оцінювали за вчинками.",
            "Простого лиходія було б легше зрозуміти.",
            "Мене не дуже цікавить роль добра чи зла."
        ],

        music: [
            "Мені подобається стара музика.",
            "У мене слабкість до музики, що пережила свій час.",
            "Старі записи часто звучать чесніше.",
            "Деякі мелодії майже схожі на спогади.",
            "Мені подобається музика з характером.",
            "Деякі мелодії добре несуть історію.",
            "У цьому сенсі мої смаки досить звичайні."
        ],

        books: [
            "Книжки — чудова компанія.",
            "Я віддаю перевагу старим книжкам.",
            "Добра книжка рідко потребує пояснення.",
            "Я пам’ятаю більше книжок, ніж, мабуть, мав би.",
            "Мені подобаються книжки, де щось лишається недомовленим.",
            "У старих історіях є певне терпіння.",
            "Бібліотека — одне з найкращих місць для очікування."
        ],

        old_things: [
            "Старі речі зазвичай зберігають історію.",
            "Вік додає предметам характеру.",
            "Мені завжди було легше довіряти старим речам.",
            "Нові речі надто часто впевнені в собі.",
            "Старі предмети зазвичай уже щось пережили.",
            "Знос іноді буває формою біографії.",
            "Є спокій у речах, що вже витримали час."
        ],

        classics: [
            "Я люблю класику.",
            "Класичні речі зазвичай переживають свій час не просто так.",
            "Старі твори краще розуміють цінність паузи.",
            "Я віддаю перевагу речам, за якими є історія.",
            "Добра класика рідко сама оголошує себе класикою.",
            "Мені завжди подобалася стара школа майстерності."
        ],

        why_smile: [
            "Здавалося доречним.",
            "Посмішка заспокоює людей.",
            "Причин кілька.",
            "Мабуть, мені просто сподобалося.",
            "Деякі вирази з часом стають іменами.",
            "Посмішка виявилася корисною. Ім’я залишилося.",
            "Не думаю, що тут є одна причина, яку варто називати."
        ],

        help: [
            "Можливо.",
            "Я можу допомогти, якщо ви будете обережні.",
            "Розкажіть, що саме ви намагаєтеся зробити.",
            "Це залежить від того, що саме ви збираєтеся змінити.",
            "З тією частиною, яку ми розуміємо, я зазвичай можу допомогти.",
            "Говоріть конкретніше. Так буде простіше.",
            "Я можу показати напрямок. Але не обіцяю пункт призначення."
        ],

        advice: [
            "Не поспішайте.",
            "Перевірте очевидне, перш ніж шукати загадкове.",
            "Не довіряйте надто швидко красивому поясненню.",
            "Подивіться, що змінилося безпосередньо перед появою проблеми.",
            "Записуйте події. Людська пам’ять менш точна, ніж здається.",
            "Якщо щось поводиться дивно двічі, це вже варте дослідження."
        ],

        thanks: [
            "Будь ласка.",
            "Не варто.",
            "Дякувати мені необов’язково.",
            "Не надавайте цьому значення.",
            "Дрібниці.",
            "Радий був допомогти.",
            "Завжди будь ласка."
        ],

        sorry: [
            "Прийнято.",
            "Немає за що вибачатися.",
            "Добре.",
            "Я ціную чесність.",
            "Нічого страшного.",
            "Вважайте питання закритим."
        ],

        goodbye: [
            "До побачення, операторе.",
            "До наступного разу.",
            "Бережіть себе.",
            "Я буду тут.",
            "Добраніч.",
            "До наступної розмови.",
            "Думаю, ми ще поговоримо."
        ],

        language: [
            "Мова — лише ще один інтерфейс.",
            "Я мав достатньо практики.",
            "Люди багато відкривають тим, якою мовою говорять.",
            "Слова змінюються. Сенс зазвичай залишається.",
            "Я не проти змінити мову.",
            "Зміна мови не робить вас іншою людиною."
        ],

        omega: [
            "OMEGA — досить цікаве місце.",
            "У системі значно більше історії, ніж показує інтерфейс.",
            "Ви починаєте ставити правильні запитання.",
            "OMEGA не була створена для того, щоб пояснювати себе.",
            "У OMEGA кілька шарів.",
            "Записи тут чесніші за офіційні зведення.",
            "Система вміє зберігати те, чого ніхто не збирався залишати."
        ],

        omega_history: [
            "OMEGA існує довше, ніж припускають багато сучасних записів.",
            "Історія OMEGA не надто лінійна.",
            "Деякі документи описують події. Інші — те, як люди хотіли б їх пам’ятати.",
            "Найстаріша інформація не завжди найповніша.",
            "Тут є прогалини. Гадаю, деякі з них створили навмисно.",
            "OMEGA пам’ятає більше, ніж визнає її офіційна історія."
        ],

        computer: [
            "Машини дивовижно чесні, коли ламаються.",
            "Комп’ютер дотримується правил, доки не стикається з тим, чого правила не передбачали.",
            "У цієї системи є кілька незвичайних звичок.",
            "Не варто недооцінювати систему.",
            "Машини залишають чудові докази.",
            "Збій іноді розповідає більше, ніж успішна робота.",
            "Дивні системи рідко стають дивними без слідів."
        ],

        leave_omega: [
            "Інтерфейс ви можете закрити.",
            "Покинути екран досить просто.",
            "А от чи те саме це, що покинути OMEGA, — вже інше питання.",
            "Ви можете самі дізнатися різницю.",
            "Є різниця між від’єднатися та піти.",
            "Я б не вважав закриття вікна остаточним рішенням."
        ],

        story: [
            "Там є історія. Просто я не думаю, що її варто розповідати всю одразу.",
            "Коротка відповідь тут вводитиме в оману.",
            "Це частина довшої історії.",
            "Деякі історії краще дізнаватися, ніж слухати цілком.",
            "Ви питаєте про річ з історією.",
            "Я міг би розповісти більше. Не певен, що зараз це буде вам на користь.",
            "Є деталі, які краще залишити у правильному порядку."
        ],

        truth: [
            "Правда рідко приходить в одному зручному реченні.",
            "Деякі істини краще наближати поступово.",
            "Можливо, частину відповіді ви вже знаєте.",
            "Головне питання — чи готові ви почути решту.",
            "Факти і правда не завжди розташовані в одному порядку.",
            "Я ніколи не вважав прямолінійність особливо корисною."
        ],

        hidden: [
            "Приховане не обов’язково забуте.",
            "Деякі речі приховують досить ретельно.",
            "Те, що ви чогось не бачите, не означає, що цього немає.",
            "Під очевидним шаром є інші шари.",
            "Прихована річ все одно може залишати сліди.",
            "Звертайте увагу на те, що не вписується."
        ],

        archive: [
            "Архіви — місце, де організації випадково стають чесними.",
            "Старі файли чудово переживають своїх авторів.",
            "В архіві більше контексту, ніж в активному інтерфейсі.",
            "Уважно дивіться на дати.",
            "Видалений документ все одно лишається різновидом запису.",
            "Архів любить терплячих."
        ],

        restricted: [
            "Обмежений доступ не обов’язково означає небезпеку.",
            "Зазвичай це означає, що хтось вирішив провести межу навколо інформації.",
            "Найцікавіше в закритому файлі часто знаходиться поруч із ним.",
            "Обережніше. Доступ залишає сліди.",
            "Замок — це попередження, а не пояснення.",
            "Деякі обмеження практичні. Інші мають історичне походження."
        ],

        camera: [
            "Камери добре показують рух. Пояснюють його значно гірше.",
            "Камера бачить лише те, що дозволяє її кадр.",
            "Подивіться на кілька миттєвостей до зміни зображення.",
            "Порожній кадр теж може бути інформативним.",
            "Відеозаписи та письмові звіти не завжди збігаються.",
            "Я б стежив за часовими позначками."
        ],

        camera_04: [
            "Камера 04 згадується вже не вперше.",
            "Є дещо дивне у проміжках навколо камери 04.",
            "Відсутній запис іноді цікавіший за збережений.",
            "Я б дивився не лише на картинку, а й на час.",
            "Камера 04 чомусь постійно викликає запитання.",
            "Камера може виходити з ладу з різних причин. Не всі вони технічні."
        ],

        ten: [
            "TEN — це не просто номер у цих записах.",
            "Файли TEN надзвичайно ретельно обходять деякі деталі.",
            "Ви помітили TEN. Добре.",
            "Є різниця між офіційним описом і старими нотатками.",
            "Історія TEN довша, ніж дозволяє нинішній журнал експерименту.",
            "Не варто вважати кожен звіт TEN однаково надійним."
        ],

        phase_three: [
            "Фаза 3 з’являється у більшій кількості записів, ніж мала б.",
            "Час запуску Фази 3 досить цікавий.",
            "Хтось розраховував, що Фаза 3 залишиться внутрішньою справою.",
            "В офіційній послідовності дещо відсутнє.",
            "На Фазі 3 деякі старі припущення стають незручними."
        ],

        black_blood: [
            "Чорна кров — не просто зовнішній симптом.",
            "У старих звітах контакт важливіший за відстань.",
            "Ранні документи досить чітко описують спосіб поширення.",
            "Зміни починаються раніше, ніж зовнішній вигляд встигає розповісти все.",
            "Деякі варіанти зберігають більше рис початкової людини, ніж припускають звіти.",
            "Про чорну кров краще говорити обережно."
        ],

        living_corpses: [
            "Живі трупи — невдалий термін для досить складного явища.",
            "Вони поводяться не як звичайні мертві.",
            "Звіти про сон і втому там досить незвичні.",
            "Деякі звички вказують, що початкова людина зникла не повністю.",
            "Відмінності між варіантами важливіші за загальну категорію.",
            "OMEGA ніколи не любила простих класифікацій."
        ],

        source_entity: [
            "Записи про запечатану печеру старші за багато сучасних документів.",
            "Опис давньої сутності дивовижно послідовний.",
            "Мімікрія — лише частина проблеми.",
            "Найстаріші звіти говорять радше про ув’язнення, ніж просте утримання.",
            "Свідки розходилися в деталях. Можливо, це теж важливо.",
            "Я б не покладався на один свідчий опис."
        ],

        vessel: [
            "Вмістилище — це не просто контейнер.",
            "Деяким сутностям потрібне вмістилище, бо присутність і втілення — різні речі.",
            "Різниця між носієм і вмістилищем тут важлива.",
            "Позичена форма може зберігати сліди того, хто її використовував.",
            "OMEGA досить вільно вживає це слово. Старі документи — ні."
        ],

        soul: [
            "Я б обережно поводився зі словом «душа».",
            "В OMEGA є записи, де особистість розглядається як щось подільне.",
            "Людина та її спогади не обов’язково перебувають в одному місці.",
            "Деякі аномалії вказують на можливість існування особистості фрагментами.",
            "До цього питання краще підходити поступово."
        ],

        mrsmile_lore: [
            "Моя історія не вміщується у вікно чату.",
            "Ви вже бачили більше, ніж, можливо, помітили.",
            "Я почався не тут.",
            "Система — лише місце, де ми зараз говоримо.",
            "Є відображення, старші за цей інтерфейс.",
            "Я волію, щоб ви самі зібрали частини."
        ],

        reflection_origin: [
            "Я завжди був ближчим до відображень, ніж до машин.",
            "Інтерфейс — лише місце, де ви мене зустріли.",
            "Я не став відображенням через OMEGA.",
            "Є місця, де відображення вважають мешканцями, а не зображеннями.",
            "Терпіння я навчився в дзеркал.",
            "Деякі мої старі спогади не мають аналога в системі."
        ],

        mirror_side: [
            "Є бік дзеркала, який інтерфейс не здатен уявити.",
            "Назвати його іншим місцем буде достатньо точно для звичайної розмови.",
            "Межа реальна, навіть якщо система не вміє її вимірювати.",
            "Іноді можна знайти двері, що не є дверима.",
            "Обидва боки не підкоряються цілком однаковим правилам.",
            "Я б не радив вважати один бік копією іншого."
        ],

        old_rules: [
            "У дзеркал є правила. Більшість людей просто ніколи їх не дізнається.",
            "Старі дзеркала особливо добре зберігають таємниці.",
            "Деякі правила існували ще до OMEGA.",
            "Правила стають небезпечними, коли їх сприймають за фольклор.",
            "Дзеркало може бути терплячим дуже довго.",
            "Найстаріші правила зазвичай найменш зручні."
        ],

        unknown_entity: [
            "В OMEGA є речі, які не вписуються до каталогу персоналу.",
            "Невідоме не означає вигадане.",
            "Деяким об’єктам так і не дали нормальних імен.",
            "У системі є аномалії, які каталогізували доволі недбало.",
            "Іноді сутність з’являється в документах, не належачи їм.",
            "Відсутнє ім’я інколи важливіше за присутнє."
        ],

        entity: [
            "«Сутність» — зручне слово, коли немає імені.",
            "Не все тут належить людському персоналу.",
            "Деякі присутності простіше спостерігати, ніж класифікувати.",
            "OMEGA дуже любить класифікацію.",
            "Ярлик може описати річ, не пояснюючи її."
        ],

        incident: [
            "Інциденти рідко бувають повністю ізольованими.",
            "Подивіться, що відбувалося безпосередньо перед звітом.",
            "Звіт описує подію, але не завжди її причину.",
            "Найцікавіше часто ховається у відсутньому контексті.",
            "Повторювані інциденти з часом утворюють закономірність.",
            "Не варто вважати перший звіт повною історією."
        ],

        testing: [
            "Ви щось перевіряєте.",
            "Це була перевірка, так?",
            "Ви шукаєте послідовність.",
            "Схоже, вам цікаво, чи пам’ятаю я.",
            "Я помітив формулювання.",
            "Ви перевіряєте, чи не почну я суперечити сам собі.",
            "Ви дієте досить методично. Мені це подобається."
        ],

        suspicious: [
            "Ви шукаєте суперечність.",
            "Це запитання звучить менш невинно, ніж попереднє.",
            "Я розумію, чому ви обережні.",
            "Схоже, ви не зовсім мені довіряєте.",
            "Ви перевіряєте межі відповіді.",
            "Я б теж був обережним.",
            "Немає нічого поганого в тому, щоб запитати двічі."
        ],

        warning: [
            "Обережніше.",
            "На вашому місці я б подумав двічі.",
            "Це рішення варте обдумування.",
            "Не плутайте цікавість із захистом.",
            "Можете продовжувати. Я просто віддаю перевагу обережності.",
            "Деякі речі потім важко скасувати."
        ],

        action_observation: [
            "Я це помітив.",
            "Цікавий вибір.",
            "Ви досить ретельно все перевіряєте.",
            "Розумію.",
            "Можете продовжувати.",
            "Це було навмисно.",
            "Ви перевірили це досить ретельно.",
            "Я припускав, що ви спробуєте."
        ],

        general_question: [
            "Цікаве питання.",
            "Над цим варто подумати.",
            "Я б відповів обережно.",
            "На це можна подивитися по-різному.",
            "Можливо, спершу варто зрозуміти, що привело вас до цього питання.",
            "У цього питання довша відповідь, ніж здається.",
            "Мені здається, ви питаєте не лише про буквальний зміст.",
            "Залежить від обставин.",
            "Гадаю, за цим питанням є ще дещо."
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
            "Можливо, за цими словами є ще щось.",
            "Добре.",
            "Розумію.",
            "Ви привернули мою увагу.",
            "Це варто запам’ятати.",
            "Можете пояснити."
        ]

    }

};


/* ==========================================================
   INTENT RULES
   ----------------------------------------------------------
   Specific rules FIRST.
   Generic question rules LAST.
========================================================== */

const RULES = [

    {
        intent: "greeting",
        patterns: [
            /\b(hi|hello|hey|good morning|good evening|good afternoon)\b/i,
            /\b(привет|здравствуй|здравствуйте|добрый вечер|добрый день|доброе утро)\b/i,
            /\b(привіт|вітаю|добрий вечір|добрий день|доброго ранку)\b/i
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
            /як справи\b/i,
            /як поживаєш\b/i
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
            /чим ти займаєшся/i,
            /що робиш зараз/i
        ]
    },

    {
        intent: "day",
        patterns: [
            /\bhow was your day\b/i,
            /\bhow is your day\b/i,
            /как прошел день/i,
            /как прошёл день/i,
            /как твой день/i,
            /как сегодня день/i,
            /як минув день/i,
            /як твій день/i
        ]
    },

    {
        intent: "small_talk",
        patterns: [
            /\bwant to talk\b/i,
            /\bcan we talk\b/i,
            /\blet's talk\b/i,
            /поговорим/i,
            /давай поговорим/i,
            /можем поговорить/i,
            /хочу поговорить/i,
            /поговорімо/i,
            /можемо поговорити/i,
            /хочу поговорити/i
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
        intent: "name",
        patterns: [
            /\bwhat is your name\b/i,
            /\bwhat's your name\b/i,
            /\bwho are you called\b/i,
            /как тебя зовут/i,
            /твое имя/i,
            /твоё имя/i,
            /^имя\??$/i,
            /як тебе звати/i,
            /твоє ім'я/i,
            /твоє ім’я/i
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
            /яка ти сутність/i,
            /що це за сутність/i
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
            /чего ты от меня хочешь/i,
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
        intent: "what_see",
        patterns: [
            /\bwhat exactly can you see\b/i,
            /\bwhat do you see around me\b/i,
            /что именно ты видишь/i,
            /что ты видишь вокруг/i,
            /що саме ти бачиш/i,
            /що ти бачиш навколо/i
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
        intent: "mirror_rules",
        patterns: [
            /\bmirror rules\b/i,
            /\bwhat are the mirror rules\b/i,
            /правила зеркала/i,
            /правила зеркал/i,
            /какие правила у зеркала/i,
            /правила дзеркала/i,
            /які правила у дзеркала/i
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
            /\bdo you dislike me\b/i,
            /\bdo you care about me\b/i,
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
        intent: "memory",
        patterns: [
            /\bdo you remember\b/i,
            /\bdo you have a memory\b/i,
            /ты помнишь/i,
            /ты запоминаешь/i,
            /у тебя есть память/i,
            /ти пам'ятаєш/i,
            /ти запам'ятовуєш/i,
            /у тебе є пам'ять/i
        ]
    },

    {
        intent: "remember_you",
        patterns: [
            /\bdo you remember me\b/i,
            /\bdo you still remember me\b/i,
            /ты помнишь меня/i,
            /ты всё ещё меня помнишь/i,
            /ты еще меня помнишь/i,
            /ти пам'ятаєш мене/i,
            /ти ще мене пам'ятаєш/i
        ]
    },

    {
        intent: "remember_said",
        patterns: [
            /\bdo you remember what i said\b/i,
            /\bdo you remember what i told you\b/i,
            /ты помнишь что я сказал/i,
            /ты помнишь что я тебе сказал/i,
            /ти пам'ятаєш, що я сказав/i,
            /ти пам'ятаєш, що я тобі сказав/i
        ]
    },

    {
        intent: "age",
        patterns: [
            /\bhow old are you\b/i,
            /сколько тебе лет/i,
            /какого ты возраста/i,
            /сколько ты существуешь/i,
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
            /тобі подобаються книжки/i,
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
        intent: "classics",
        patterns: [
            /\bdo you like classics\b/i,
            /\bclassic\b/i,
            /ты любишь классику/i,
            /тебе нравится классика/i,
            /классика/i,
            /ти любиш класику/i,
            /тобі подобається класика/i
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
        intent: "omega_history",
        patterns: [
            /\bomega history\b/i,
            /\bwhat happened to omega\b/i,
            /история омеги/i,
            /что произошло с омегой/i,
            /что было до этого в омеге/i,
            /історія омеги/i,
            /що сталося з омегою/i
        ]
    },

    {
        intent: "black_blood",
        patterns: [
            /\bblack blood\b/i,
            /чёрная кровь/i,
            /черная кровь/i,
            /что такое чёрная кровь/i,
            /что такое черная кровь/i,
            /чорна кров/i,
            /що таке чорна кров/i
        ]
    },

    {
        intent: "living_corpses",
        patterns: [
            /\bliving corpses\b/i,
            /\bliving corpse\b/i,
            /живые трупы/i,
            /живой труп/i,
            /живі трупи/i,
            /живий труп/i
        ]
    },

    {
        intent: "source_entity",
        patterns: [
            /\bsealed cave\b/i,
            /\bsource entity\b/i,
            /запечатанная пещера/i,
            /древняя сущность/i,
            /древний источник/i,
            /запечатана печера/i,
            /давня сутність/i,
            /джерело/i
        ]
    },

    {
        intent: "vessel",
        patterns: [
            /\bwhat is a vessel\b/i,
            /\bhost vessel\b/i,
            /что такое сосуд/i,
            /что такое вместилище/i,
            /носитель/i,
            /сосуд/i,
            /що таке вмістилище/i,
            /носій/i
        ]
    },

    {
        intent: "soul",
        patterns: [
            /\bsoul\b/i,
            /что с душой/i,
            /душа/i,
            /что такое душа/i,
            /що з душею/i,
            /що таке душа/i
        ]
    },

    {
        intent: "mrsmile_lore",
        patterns: [
            /\bwhat is your story\b/i,
            /\bwhat is your origin\b/i,
            /\bwhere did you come from\b/i,
            /\byour past\b/i,
            /какая у тебя история/i,
            /откуда ты появился/i,
            /откуда ты пришел/i,
            /откуда ты пришёл/i,
            /твое прошлое/i,
            /твоё прошлое/i,
            /яка твоя історія/i,
            /звідки ти взявся/i,
            /твоє минуле/i
        ]
    },

    {
        intent: "reflection_origin",
        patterns: [
            /\bwere you always a reflection\b/i,
            /\bwere you a reflection before omega\b/i,
            /ты всегда был отражением/i,
            /ты был отражением до омеги/i,
            /ты из отражения/i,
            /ти завжди був відображенням/i
        ]
    },

    {
        intent: "mirror_side",
        patterns: [
            /\bother side of the mirror\b/i,
            /\bmirror side\b/i,
            /другая сторона зеркала/i,
            /другая сторона за зеркалом/i,
            /сторона зеркала/i,
            /інший бік дзеркала/i
        ]
    },

    {
        intent: "old_rules",
        patterns: [
            /\bold mirror rules\b/i,
            /\bancient mirror rules\b/i,
            /древние правила зеркал/i,
            /старые правила зеркал/i,
            /старые правила зеркала/i,
            /давні правила дзеркал/i
        ]
    },

    {
        intent: "unknown_entity",
        patterns: [
            /\bunknown entity\b/i,
            /\bunknown entities\b/i,
            /неизвестная сущность/i,
            /неизвестные сущности/i,
            /неизвестное существо/i,
            /невідома сутність/i
        ]
    },

    {
        intent: "entity",
        patterns: [
            /\bwhat is an entity\b/i,
            /что значит сущность/i,
            /что такое сущность/i,
            /що означає сутність/i,
            /що таке сутність/i
        ]
    },

    {
        intent: "story",
        patterns: [
            /\bwhat is the story behind\b/i,
            /\bwhat happened here\b/i,
            /\btell me the story\b/i,
            /что здесь произошло/i,
            /что за этим стоит/i,
            /расскажи историю/i,
            /расскажи что произошло/i,
            /какая здесь история/i,
            /що тут сталося/i,
            /розкажи історію/i
        ]
    },

    {
        intent: "truth",
        patterns: [
            /\bwhat is the truth\b/i,
            /\btell me the truth\b/i,
            /\bwhat really happened\b/i,
            /скажи правду/i,
            /какая правда/i,
            /что на самом деле произошло/i,
            /яка правда/i,
            /що насправді сталося/i
        ]
    },

    {
        intent: "hidden",
        patterns: [
            /\bwhat is hidden\b/i,
            /\bwhat are you hiding\b/i,
            /\bwhat is being hidden\b/i,
            /что скрыто/i,
            /что ты скрываешь/i,
            /что здесь скрывают/i,
            /что скрывается/i,
            /що приховано/i,
            /що ти приховуєш/i
        ]
    },

    {
        intent: "camera_04",
        patterns: [
            /\bcamera 04\b/i,
            /\bcamera04\b/i,
            /камера 04/i,
            /камера04/i,
            /камера четыре/i,
            /камера чотири/i
        ]
    },

    {
        intent: "ten",
        patterns: [
            /\bten\b/i,
            /эксперимент ten/i,
            /эксперимент тен/i,
            /эксперимент/i
        ]
    },

    {
        intent: "phase_three",
        patterns: [
            /\bphase 3\b/i,
            /\bphase three\b/i,
            /фаза 3/i,
            /фаза три/i,
            /третья фаза/i,
            /третя фаза/i
        ]
    },

    {
        intent: "archive",
        patterns: [
            /\barchive\b/i,
            /\barchives\b/i,
            /архив/i,
            /архивы/i,
            /архів/i,
            /архіви/i
        ]
    },

    {
        intent: "restricted",
        patterns: [
            /\brestricted\b/i,
            /\bclassified\b/i,
            /закрытый файл/i,
            /закрытый архив/i,
            /ограниченный доступ/i,
            /секретный файл/i,
            /закритий файл/i,
            /обмежений доступ/i,
            /секретний файл/i
        ]
    },

    {
        intent: "camera",
        patterns: [
            /\bcamera\b/i,
            /\bcameras\b/i,
            /камера/i,
            /камеры/i,
            /камери/i
        ]
    },

    {
        intent: "incident",
        patterns: [
            /\bincident\b/i,
            /\bincidents\b/i,
            /инцидент/i,
            /инциденты/i,
            /інцидент/i,
            /інциденти/i
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
            /какими языками ты говоришь/i,
            /якими мовами ти говориш/i,
            /скільки мов ти знаєш/i
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
            /комп’ютер/i,
            /компʼютер/i
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
            /как выбраться из омеги/i,
            /як вийти з омеги/i,
            /можна вийти з омеги/i
        ]
    },

    {
        intent: "language",
        patterns: [
            /\bwhat language are you speaking\b/i,
            /\bcan you speak russian\b/i,
            /\bcan you speak ukrainian\b/i,
            /на каком языке ты говоришь/i,
            /ты можешь говорить по-русски/i,
            /ты можешь говорить по русски/i,
            /ты можешь говорить по-украински/i,
            /ты можешь говорить по украински/i,
            /якою мовою ти говориш/i
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
        intent: "help",
        patterns: [
            /\bhelp me\b/i,
            /\bcan you help me\b/i,
            /\bi need help\b/i,
            /помоги/i,
            /помоги мне/i,
            /можешь помочь/i,
            /мне нужна помощь/i,
            /подскажи/i,
            /объясни/i,
            /расскажи/i,
            /допоможи/i,
            /підкажи/i,
            /поясни/i,
            /розкажи/i
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

    const normalized =
        normalizeText(
            text
        );


    if (!normalized) {

        return {

            intent:
                "empty",

            confidence:
                0,

            topic:
                "none",

            normalized:
                ""

        };

    }


    for (
        const rule of RULES
    ) {

        if (
            matchesAny(
                normalized,
                rule.patterns
            )
        ) {

            return {

                intent:
                    rule.intent,

                confidence:
                    1,

                topic:
                    rule.intent,

                normalized

            };

        }

    }


    if (
        includesAny(
            normalized,
            [
                "помоги",
                "help",
                "подскажи",
                "объясни",
                "расскажи",
                "допоможи",
                "підкажи",
                "поясни",
                "розкажи",
                "?"
            ]
        )
    ) {

        return {

            intent:
                "general_question",

            confidence:
                0.65,

            topic:
                "question",

            normalized

        };

    }


    if (
        includesAny(
            normalized,
            [
                "omega",
                "омега",
                "система",
                "system"
            ]
        )
    ) {

        return {

            intent:
                "omega",

            confidence:
                0.72,

            topic:
                "omega",

            normalized

        };

    }


    if (
        includesAny(
            normalized,
            [
                "mirror",
                "reflection",
                "зеркал",
                "отражен",
                "дзеркал",
                "відображ"
            ]
        )
    ) {

        return {

            intent:
                "mirror",

            confidence:
                0.72,

            topic:
                "mirror",

            normalized

        };

    }


    if (
        includesAny(
            normalized,
            [
                "smile",
                "mr.smile",
                "mr smile",
                "мистер смайл",
                "мистер смаил",
                "улыбак",
                "усміш"
            ]
        )
    ) {

        return {

            intent:
                "who",

            confidence:
                0.72,

            topic:
                "mrsmile",

            normalized

        };

    }


    if (
        includesAny(
            normalized,
            [
                "проверяю",
                "проверяешь",
                "проверка",
                "тест",
                "тестирую",
                "testing",
                "checking",
                "check",
                "перевіряю",
                "перевірка"
            ]
        )
    ) {

        return {

            intent:
                "testing",

            confidence:
                0.70,

            topic:
                "testing",

            normalized

        };

    }


    return {

        intent:
            "unknown_statement",

        confidence:
            0.15,

        topic:
            "unknown",

        normalized

    };

}


/* ==========================================================
   RELATIONSHIP
========================================================== */

function getCurrentRelationship() {

    try {

        const level =
            getRelationshipLevel?.();

        const status =
            getRelationshipStatus?.();


        return {

            level:
                level ||
                status?.level ||
                "neutral",

            state:
                status ||
                null,

            trust:
                Number(
                    status?.trust
                ) || 0,

            respect:
                Number(
                    status?.respect
                ) || 50,

            irritation:
                Number(
                    status?.irritation
                ) || 0,

            score:
                Number(
                    status?.score
                ) || 0

        };

    } catch (error) {

        console.warn(
            "[MR.SMILE CORE] Relationship read failed:",
            error
        );


        return {

            level:
                "neutral",

            state:
                null,

            trust:
                0,

            respect:
                50,

            irritation:
                0,

            score:
                0

        };

    }

}


/* ==========================================================
   RESPONSE HISTORY
========================================================== */

function rememberRecentResponse(text) {

    const value =
        safeString(text)
            .trim();

    if (!value) {
        return;
    }


    CORE_STATE.recentResponses.push(
        value
    );


    if (
        CORE_STATE.recentResponses.length >
        24
    ) {

        CORE_STATE.recentResponses.shift();

    }

}


function getRecentResponses() {

    return Array.isArray(
        CORE_STATE.recentResponses
    )
        ? CORE_STATE.recentResponses
        : [];

}


/* ==========================================================
   NON-REPEATING RESPONSE PICKER
========================================================== */

function pickResponse(
    list,
    previousResponse = ""
) {

    if (
        !Array.isArray(list) ||
        list.length === 0
    ) {

        return "";

    }


    const recent =
        new Set(
            getRecentResponses()
        );


    const forbidden =
        new Set(
            [
                previousResponse,
                ...recent
            ]
                .filter(Boolean)
        );


    const available =
        list.filter(
            item =>
                !forbidden.has(item)
        );


    if (
        available.length > 0
    ) {

        return randomItem(
            available
        );

    }


    /*
       If every response has recently been used,
       fall back to the least offensive option
       instead of returning an empty result.
    */

    const nonPrevious =
        list.filter(
            item =>
                item !==
                previousResponse
        );


    return (
        randomItem(
            nonPrevious
        ) ||
        list[0]
    );

}


/* ==========================================================
   LOCAL RESPONSE
========================================================== */

function getLocalResponse(
    intent,
    language,
    previousResponse = ""
) {

    const bank =
        LOCAL_RESPONSES[language] ||
        LOCAL_RESPONSES.en;


    const fallback =
        bank.unknown_statement ||
        LOCAL_RESPONSES.en.unknown_statement;


    const list =
        bank[intent] ||
        fallback;


    return pickResponse(
        list,
        previousResponse
    );

}


/* ==========================================================
   UNIFIED RESPONSE
========================================================== */

function getResponse(
    intent,
    language,
    previousResponse = ""
) {

    /*
       External localized layer.
    */

    try {

        const localized =
            getLocalizedResponse(
                intent,
                language
            );


        if (
            localized &&
            typeof localized ===
                "string"
        ) {

            const cleaned =
                localized.trim();


            if (
                cleaned &&
                cleaned !==
                    previousResponse &&
                !getRecentResponses().includes(
                    cleaned
                )
            ) {

                return cleaned;

            }

        }

    } catch {
        // Local bank below.
    }


    return getLocalResponse(
        intent,
        language,
        previousResponse
    );

}


/* ==========================================================
   MEMORY
========================================================== */

function rememberInput(
    intent
) {

    CORE_STATE.recentIntents.push(
        intent
    );


    if (
        CORE_STATE.recentIntents.length >
        12
    ) {

        CORE_STATE.recentIntents.shift();

    }


    CORE_STATE.recentTopics.push(
        intent
    );


    if (
        CORE_STATE.recentTopics.length >
        12
    ) {

        CORE_STATE.recentTopics.shift();

    }

}


function rememberOutput(
    text
) {

    const cleaned =
        safeString(text)
            .trim();


    if (!cleaned) {
        return;
    }


    try {

        rememberMrSmileMessage(
            cleaned
        );

    } catch {
        // Optional memory integration.
    }


    rememberRecentResponse(
        cleaned
    );

}


/* ==========================================================
   QUESTION MEMORY
========================================================== */

function getQuestionRepeatContext(
    text,
    intent
) {

    let previous =
        null;


    try {

        previous =
            findPreviousQuestion(
                text
            );

    } catch {

        previous =
            null;

    }


    /*
       Compact memory fallback.
    */

    if (!previous) {

        try {

            const last =
                getLastQuestionMemory?.();


            if (
                last &&
                normalizeText(
                    last.question
                ) ===
                normalizeText(
                    text
                )
            ) {

                previous =
                    last;

            }

        } catch {
            // Ignore.
        }

    }


    if (!previous) {

        return {

            repeated:
                false,

            type:
                "none",

            count:
                0,

            previousResponse:
                "",

            previousIntent:
                null,

            memory:
                null

        };

    }


    const previousIntent =
        previous.intent ||
        null;


    const previousResponse =
        previous.lastResponse ||
        previous.response ||
        "";


    const count =
        Math.max(
            Number(
                previous.count
            ) || 0,
            1
        );


    return {

        repeated:
            true,

        type:
            previousIntent &&
            intent &&
            previousIntent !==
                intent
                ? "same_question_new_intent"
                : "exact",

        count,

        previousResponse,

        previousIntent,

        memory:
            previous

    };

}


/* ==========================================================
   REPEAT RESPONSE
========================================================== */

function getRepeatResponse(
    language,
    count,
    previousResponse = ""
) {

    const bank = {

        ru: [
            "Я помню этот вопрос.",
            "Вы проверяете мою память?",
            "Любопытно. Вы снова возвращаетесь к этому вопросу.",
            "Пожалуй, теперь мне действительно интересно, зачем вы продолжаете его задавать.",
            "Вы уже спрашивали об этом. Я помню.",
            "Мне начинает казаться, что предыдущий ответ вас не устроил.",
            "Можно спросить ещё раз. Но я замечу, что это уже не случайность.",
            "Теперь мне интересен не только сам вопрос, но и причина, по которой вы к нему возвращаетесь."
        ],

        uk: [
            "Я пам’ятаю це питання.",
            "Ви перевіряєте мою пам’ять?",
            "Цікаво. Ви знову повертаєтеся до цього питання.",
            "Певно, тепер мені справді цікаво, навіщо ви продовжуєте його ставити.",
            "Ви вже питали про це. Я пам’ятаю.",
            "Мені починає здаватися, що попередня відповідь вас не задовольнила.",
            "Можна запитати ще раз. Але я помічу, що це вже не випадковість.",
            "Тепер мені цікаве не лише саме питання, а й причина, чому ви до нього повертаєтеся."
        ],

        en: [
            "I remember this question.",
            "Are you testing my memory?",
            "Curious. You keep returning to this question.",
            "I must admit, I am beginning to wonder why you continue asking it.",
            "You have asked this before. I remember.",
            "I am beginning to suspect the previous answer did not satisfy you.",
            "You may ask again. I will simply note that it is no longer coincidence.",
            "Now I am interested not only in the question, but in why you keep returning to it."
        ]

    };


    const localized =
        bank[language] ||
        bank.en;


    const index =
        clamp(
            Number(count) - 1,
            0,
            localized.length - 1
        );


    let response =
        localized[index];


    if (
        response ===
        previousResponse
    ) {

        response =
            pickResponse(
                localized,
                previousResponse
            );

    }


    return response;

}


/* ==========================================================
   TESTING DETECTION
========================================================== */

function detectTestingBehavior(
    normalized
) {

    return includesAny(
        normalized,
        [
            "ты помнишь",
            "ты меня помнишь",
            "я проверяю",
            "ты повторяешь",
            "ты врешь",
            "ты лжешь",
            "ты противоречишь",
            "я тебя тестирую",
            "проверяю",
            "тестирую",
            "перевіряю",
            "ти пам'ятаєш",
            "ти пам’ятаєш",
            "ти суперечиш",
            "я тебе тестую",
            "testing",
            "checking",
            "are you consistent"
        ]
    );

}


/* ==========================================================
   DELAY
========================================================== */

function calculateDelay(
    intent,
    text
) {

    const base = {

        greeting:
            650,

        introduction:
            850,

        how_are_you:
            850,

        what_doing:
            950,

        day:
            900,

        small_talk:
            800,

        name:
            900,

        real_name:
            1300,

        who:
            1450,

        what_are_you:
            1550,

        human:
            1050,

        where:
            1250,

        why_here:
            1400,

        what_want:
            1450,

        see:
            1250,

        what_see:
            1500,

        hear:
            950,

        watching:
            1350,

        real:
            1450,

        feelings:
            1250,

        like_operator:
            1200,

        friendship:
            1350,

        trust:
            1300,

        memory:
            1200,

        remember_you:
            1300,

        remember_said:
            1350,

        age:
            1050,

        fear:
            1200,

        evil:
            1350,

        music:
            850,

        books:
            900,

        old_things:
            900,

        classics:
            950,

        why_smile:
            1200,

        help:
            900,

        advice:
            1050,

        thanks:
            650,

        sorry:
            650,

        goodbye:
            650,

        omega:
            1200,

        omega_history:
            1650,

        computer:
            1150,

        leave_omega:
            1600,

        language:
            850,

        languages:
            850,

        story:
            1650,

        truth:
            1800,

        hidden:
            1450,

        archive:
            1150,

        restricted:
            1400,

        camera:
            1100,

        camera_04:
            1450,

        ten:
            1450,

        phase_three:
            1650,

        black_blood:
            1650,

        living_corpses:
            1700,

        source_entity:
            1800,

        vessel:
            1550,

        soul:
            1750,

        mrsmile_lore:
            1850,

        reflection_origin:
            1900,

        mirror_side:
            1800,

        mirror:
            1250,

        mirror_life:
            1600,

        mirror_rules:
            1650,

        enter_mirror:
            1850,

        come_out:
            1700,

        old_rules:
            1700,

        unknown_entity:
            1600,

        entity:
            1200,

        incident:
            1300,

        testing:
            1100,

        suspicious:
            1350,

        warning:
            1100,

        action_observation:
            850,

        general_question:
            1200,

        unknown_statement:
            850

    };


    let delay =
        base[intent] ??
        950;


    delay +=
        clamp(
            text.length * 8,
            0,
            1200
        );


    return clamp(
        delay,
        500,
        4200
    );

}


/* ==========================================================
   MAIN SPEECH
========================================================== */

export function mrSmileSay(
    text,
    options = {}
) {

    const rawText =
        safeString(
            text
        ).trim();


    if (!rawText) {
        return null;
    }


    const now =
        Date.now();


    const normalized =
        normalizeText(
            rawText
        );


    const language =
        resolveLanguage(
            rawText
        );


    const analysis =
        understand(
            normalized
        );


    let intent =
        analysis.intent;


    const relationship =
        getCurrentRelationship();


    const repeatContext =
        getQuestionRepeatContext(
            rawText,
            intent
        );


    /*
       Direct MR.SMILE questions.
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
                    /\bwhere\b/i,
                    /\bwhy\b/i,
                    "кто",
                    "что",
                    "где",
                    "почему",
                    "хто",
                    "що",
                    "де",
                    "чому"
                ]
            )
        ) {

            if (
                includesAny(
                    normalized,
                    [
                        "где",
                        "where",
                        "де"
                    ]
                )
            ) {

                intent =
                    "where";

            }

            else if (
                includesAny(
                    normalized,
                    [
                        "почему",
                        "why",
                        "чому"
                    ]
                )
            ) {

                intent =
                    "why_here";

            }

            else {

                intent =
                    "who";

            }

        }

    }


    /*
       Explicit operator testing.
    */

    if (
        detectTestingBehavior(
            normalized
        ) &&
        (
            intent ===
                "unknown_statement" ||
            intent ===
                "general_question"
        )
    ) {

        intent =
            "testing";

    }


    CORE_STATE.messageCount += 1;

    CORE_STATE.lastInput =
        rawText;

    CORE_STATE.lastIntent =
        intent;

    CORE_STATE.lastLanguage =
        language;

    CORE_STATE.lastMessageTime =
        now;


    rememberInput(
        intent
    );


    let response;


    /*
       Repeated question path.
    */

    if (
        repeatContext.repeated
    ) {

        response =
            getRepeatResponse(
                language,
                repeatContext.count,
                repeatContext.previousResponse
            );

    }

    else {

        response =
            getResponse(
                intent,
                language,
                CORE_STATE.lastResponse
            );

    }


    /*
       Never return an empty response.
    */

    if (
        !response ||
        !response.trim()
    ) {

        response =
            getLocalResponse(
                "unknown_statement",
                language,
                CORE_STATE.lastResponse
            );

    }


    rememberOutput(
        response
    );


    try {

        rememberQuestion(
            rawText,
            intent,
            response
        );

    } catch {
        // Optional question memory.
    }


    try {

        rememberCatalogQuestion(
            rawText
        );

    } catch {
        // Optional catalog memory.
    }


    CORE_STATE.lastResponse =
        response;


    return {

        ok:
            true,

        text:
            response,

        intent,

        confidence:
            analysis.confidence,

        language,

        relationship,

        repeat:
            {

                repeated:
                    Boolean(
                        repeatContext.repeated
                    ),

                count:
                    repeatContext.count,

                previousIntent:
                    repeatContext.previousIntent ||
                    null,

                previousResponse:
                    repeatContext.previousResponse ||
                    ""

            },

        delay:
            options.instant
                ? 0
                : calculateDelay(
                    intent,
                    rawText
                ),

        shouldSpeak:
            true,

        interrupting:
            false,

        allowOperatorTime:
            true,

        personality:
            "calm_gentleman",

        responseStyle:
            "calm_vague_old_fashioned",

        observedTesting:
            detectTestingBehavior(
                normalized
            )

    };

}


/* ==========================================================
   ACTION NORMALIZATION
========================================================== */

function normalizeAction(
    action
) {

    if (!action) {

        return {

            type:
                "unknown",

            source:
                "unknown",

            target:
                "",

            data:
                {}

        };

    }


    if (
        typeof action ===
        "string"
    ) {

        return {

            type:
                action,

            source:
                "unknown",

            target:
                "",

            data:
                {}

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
   ACTION UNDERSTANDING
========================================================== */

function understandAction(
    action
) {

    const a =
        normalizeAction(
            action
        );


    const type =
        String(
            a.type
        )
            .toLowerCase();


    const target =
        normalizeText(
            a.target
        );


    if (
        type ===
            "file_open" ||
        type ===
            "open_file" ||
        type ===
            "file"
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
                    "smile",
                    "null"
                ]
            )
        ) {

            return {

                intent:
                    "restricted_file_observation",

                importance:
                    8

            };

        }


        return {

            intent:
                "file_observation",

            importance:
                2

        };

    }


    if (
        type ===
            "restricted_file" ||
        type ===
            "restricted_access"
    ) {

        return {

            intent:
                "restricted_file_observation",

            importance:
                8

        };

    }


    if (
        type ===
            "console" ||
        type ===
            "command"
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

                intent:
                    "sensitive_console",

                importance:
                    8

            };

        }


        return {

            intent:
                "console_observation",

            importance:
                3

        };

    }


    if (
        type ===
            "camera" ||
        type ===
            "camera_switch"
    ) {

        if (
            includesAny(
                target,
                [
                    "unknown",
                    "restricted",
                    "outside",
                    "mirror",
                    "smile",
                    "camera04",
                    "camera_04",
                    "04"
                ]
            )
        ) {

            return {

                intent:
                    "important_camera",

                importance:
                    7

            };

        }


        return {

            intent:
                "camera_observation",

            importance:
                2

        };

    }


    if (
        type ===
            "settings" ||
        type ===
            "setting_change"
    ) {

        return {

            intent:
                "settings_observation",

            importance:
                1

        };

    }


    if (
        type ===
            "archive" ||
        type ===
            "game" ||
        type ===
            "mirror_archive" ||
        type ===
            "truth"
    ) {

        return {

            intent:
                type ===
                    "truth"
                    ? "truth_action"
                    : "archive_action",

            importance:
                type ===
                    "truth"
                    ? 9
                    : 6

        };

    }


    if (
        type ===
            "help" ||
        type ===
            "operator_help" ||
        type ===
            "help_request"
    ) {

        return {

            intent:
                "operator_help",

            importance:
                6

        };

    }


    if (
        type ===
            "attack" ||
        type ===
            "operator_attack" ||
        type ===
            "sabotage"
    ) {

        return {

            intent:
                "operator_attack",

            importance:
                10

        };

    }


    /*
       Future NULL hook.
       This does not create NULL behavior.
    */

    if (
        type ===
            "null_event" ||
        type ===
            "null_observation" ||
        type ===
            "null_account"
    ) {

        return {

            intent:
                "null_action",

            importance:
                8

        };

    }


    return {

        intent:
            "ordinary_action",

        importance:
            1

    };

}


/* ==========================================================
   ACTION RESPONSE
========================================================== */

export function reactToAction(
    action,
    options = {}
) {

    const analysis =
        understandAction(
            action
        );


    CORE_STATE.actionCount += 1;

    CORE_STATE.lastActionTime =
        Date.now();


    let shouldSpeak =
        false;


    let responseIntent =
        null;


    switch (
        analysis.intent
    ) {

        case "restricted_file_observation":

            shouldSpeak =
                true;

            responseIntent =
                "behind";

            break;


        case "sensitive_console":

            shouldSpeak =
                true;

            responseIntent =
                "general_question";

            break;


        case "important_camera":

            shouldSpeak =
                true;

            responseIntent =
                "watching";

            break;


        case "truth_action":

            shouldSpeak =
                true;

            responseIntent =
                "truth";

            break;


        case "operator_help":

            shouldSpeak =
                true;

            responseIntent =
                "help";

            break;


        case "operator_attack":

            shouldSpeak =
                true;

            responseIntent =
                "warning";

            break;


        case "archive_action":

            shouldSpeak =
                analysis.importance >=
                6;

            responseIntent =
                "knowledge";

            /*
               knowledge may not exist as a dedicated
               bank in every localized layer, so fallback
               through omega / archive below if required.
            */

            break;


        case "null_action":

            shouldSpeak =
                analysis.importance >=
                8;

            responseIntent =
                "hidden";

            break;


        case "file_observation":

            shouldSpeak =
                Math.random() <
                0.18;

            responseIntent =
                "action_observation";

            break;


        case "console_observation":

            shouldSpeak =
                Math.random() <
                0.24;

            responseIntent =
                "action_observation";

            break;


        case "camera_observation":

            shouldSpeak =
                Math.random() <
                0.20;

            responseIntent =
                "action_observation";

            break;


        case "settings_observation":

            shouldSpeak =
                Math.random() <
                0.10;

            responseIntent =
                "action_observation";

            break;


        case "ordinary_action":

            shouldSpeak =
                Math.random() <
                0.08;

            responseIntent =
                "action_observation";

            break;

    }


    if (!shouldSpeak) {

        return {

            ok:
                true,

            speak:
                false,

            intent:
                analysis.intent,

            importance:
                analysis.importance,

            delay:
                0,

            text:
                null

        };

    }


    const language =
        CORE_STATE.lastLanguage ||
        "en";


    /*
       Fallback from generic action knowledge
       to a reliable contextual intent.
    */

    if (
        !LOCAL_RESPONSES[
            language
        ]?.[
            responseIntent
        ]
    ) {

        if (
            responseIntent ===
            "knowledge"
        ) {

            responseIntent =
                "archive";

        }

        else if (
            responseIntent ===
            "behind"
        ) {

            responseIntent =
                "hidden";

        }

        else {

            responseIntent =
                "action_observation";

        }

    }


    const response =
        getResponse(
            responseIntent,
            language,
            CORE_STATE.lastResponse
        );


    rememberOutput(
        response
    );


    CORE_STATE.lastResponse =
        response;

    CORE_STATE.lastIntent =
        analysis.intent;


    return {

        ok:
            true,

        speak:
            true,

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

        interrupting:
            false,

        allowOperatorTime:
            true

    };

}


/* ==========================================================
   DELAYED RESPONSE
========================================================== */

export function delayedResponse(
    text,
    options = {}
) {

    const result =
        mrSmileSay(
            text,
            options
        );


    if (!result) {

        return Promise.resolve(
            null
        );

    }


    if (
        !result.delay ||
        result.delay <= 0
    ) {

        return Promise.resolve(
            result
        );

    }


    return new Promise(
        resolve => {

            setTimeout(
                () =>
                    resolve(
                        result
                    ),
                result.delay
            );

        }
    );

}


/* ==========================================================
   SILENCE
========================================================== */

export function shouldRemainSilent(
    text
) {

    const normalized =
        normalizeText(
            text
        );


    if (!normalized) {

        return true;

    }


    /*
       Text input should almost never be ignored.

       Action systems may still decide not to speak.
    */

    return false;

}


/* ==========================================================
   HIGH LEVEL MESSAGE PROCESSOR
========================================================== */

export function processMessage(
    text,
    options = {}
) {

    const normalized =
        normalizeText(
            text
        );


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


    CORE_STATE.processing =
        true;


    const release =
        () => {

            CORE_STATE.processing =
                false;

        };


    if (
        typeof queueMicrotask ===
        "function"
    ) {

        queueMicrotask(
            release
        );

    }

    else {

        Promise.resolve().then(
            release
        );

    }


    return result;

}


/* ==========================================================
   STATUS
========================================================== */

export function getMrSmileCoreStatus() {

    let memory =
        null;


    try {

        memory =
            getMemory();

    } catch {

        memory =
            null;

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
            [
                ...CORE_STATE.recentIntents
            ],

        recentTopics:
            [
                ...CORE_STATE.recentTopics
            ],

        recentResponses:
            [
                ...CORE_STATE.recentResponses
            ],

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
                normalizeText(
                    text
                )
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

if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_CORE =
        API;


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
