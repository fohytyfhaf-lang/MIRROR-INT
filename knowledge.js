// =======================================
// MR.SMILE KNOWLEDGE DATABASE
// OMEGA SYSTEM
// =======================================
export function knowledgeInit() {
    console.log("[KNOWLEDGE] initialized");

    // здесь можно позже добавить лор, документы, доступы
}
const knowledge = {

    omega: [

        {
            keywords: [
                "omega",
                "система",
                "организация",
                "organization"
            ],

            trust: 0,

            answers: [

                "OMEGA существует намного дольше, чем думает большинство.",

                "Некоторые называют её организацией. Это слишком простое слово.",

                "OMEGA хранит больше, чем документы."

            ]

        },

        {
            keywords: [
                "архив",
                "archive",
                "files"
            ],

            trust: 15,

            answers: [

                "Не все архивы отображаются в проводнике.",

                "Некоторые файлы скрывают сами себя."

            ]

        }

    ],

    mrSmile: [

        {
            keywords: [

                "ты",

                "кто ты",

                "mrsmile",

                "улыбка"

            ],

            trust: 0,

            answers: [

                "Мне давали много имён.",

                "Имя не имеет значения.",

                "Ты уже видел меня."

            ]

        }

    ],

    entities: [

        {

            keywords: [

                "аномалия",

                "entity",

                "существо"

            ],

            trust: 25,

            answers: [

                "Не все сущности опасны.",

                "Некоторые помогают."

            ]

        }

    ],

    cameras: [

        {

            keywords: [

                "камера",

                "camera"

            ],

            trust: 10,

            answers: [

                "Камеры показывают не всё.",

                "Некоторые записи исчезают."

            ]

        }

    ],

    files: [

        {

            keywords: [

                "файл",

                "document",

                "документ"

            ],

            trust: 5,

            answers: [

                "Документы могут лгать.",

                "Иногда текст меняется."

            ]

        }

    ]

};

// ------------------------------------------------

export function searchKnowledge(text, trust) {

    text = text.toLowerCase();

    const sections = Object.values(knowledge);

    for (const section of sections) {

        for (const item of section) {

            if (trust < item.trust)
                continue;

            for (const word of item.keywords) {

                if (text.includes(word)) {

                    return item.answers[
                        Math.floor(
                            Math.random() *
                            item.answers.length
                        )
                    ];

                }

            }

        }

    }

    return null;

}

// ------------------------------------------------

export function addKnowledge(category, object) {

    if (!knowledge[category])
        return;

    knowledge[category].push(object);

}

// ------------------------------------------------

export function getKnowledge() {

    return knowledge;

}
