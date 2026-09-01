
let dictionary = {};
let englishDictionary = {};
let currentLanguage = "en";


/* =========================================================
   LOAD LANGUAGE
========================================================= */

export async function loadLanguage(lang) {

    try {

        /*
         * Загружаем английский словарь как fallback.
         * Это гарантирует, что отсутствующий перевод
         * не превратится просто в название ключа.
         */

        if (
            lang !== "en" &&
            Object.keys(englishDictionary).length === 0
        ) {

            const englishResponse =
                await fetch(
                    "languages/en.json"
                );

            englishDictionary =
                await englishResponse.json();

        }


        const response =
            await fetch(
                `languages/${lang}.json`
            );


        if (!response.ok) {

            throw new Error(
                `Language file not found: ${lang}`
            );

        }


        dictionary =
            await response.json();


        currentLanguage =
            lang;


        translatePage();


        const select =
            document.getElementById(
                "languageSelect"
            );


        if (select) {

            select.value =
                lang;

        }


        localStorage.setItem(
            "omega-language",
            lang
        );


        console.log(
            "[LANGUAGE] Loaded:",
            lang
        );


    } catch (error) {

        console.error(
            "[LANGUAGE] Failed to load:",
            lang,
            error
        );


        /*
         * Если язык не загрузился,
         * используем английский.
         */

        if (
            Object.keys(englishDictionary).length === 0
        ) {

            try {

                const response =
                    await fetch(
                        "languages/en.json"
                    );


                englishDictionary =
                    await response.json();

            } catch (fallbackError) {

                console.error(
                    "[LANGUAGE] English fallback failed:",
                    fallbackError
                );

            }

        }


        dictionary =
            englishDictionary;


        currentLanguage =
            "en";


        translatePage();

    }

}


/* =========================================================
   INIT LANGUAGE
========================================================= */

export async function initLanguage() {

    const saved =
        localStorage.getItem(
            "omega-language"
        ) || "en";


    await loadLanguage(
        saved
    );

}


/* =========================================================
   CHANGE LANGUAGE
========================================================= */

export async function changeLanguage(lang) {

    await loadLanguage(
        lang
    );

}


/* =========================================================
   GET TRANSLATION
========================================================= */

export function t(
    key,
    variables = {}
) {

    let text =
        dictionary[key];


    /*
     * Fallback → English
     */

    if (
        text === undefined &&
        englishDictionary[key] !== undefined
    ) {

        text =
            englishDictionary[key];

    }


    /*
     * Если ключ вообще отсутствует,
     * возвращаем сам ключ.
     */

    if (
        text === undefined
    ) {

        console.warn(
            "[LANGUAGE] Missing translation:",
            key
        );


        return key;

    }


    /*
     * Dynamic variables
     *
     * Например:
     *
     * t("login.welcome", {
     *     username: "ADMIN"
     * })
     *
     * → WELCOME ADMIN
     */

    Object.entries(
        variables
    ).forEach(
        ([name, value]) => {

            text =
                text.replaceAll(
                    `{${name}}`,
                    String(value)
                );

        }
    );


    return text;

}


/* =========================================================
   GET CURRENT LANGUAGE
========================================================= */

export function getCurrentLanguage() {

    return currentLanguage;

}


/* =========================================================
   TRANSLATE ELEMENT
========================================================= */

export function translateElement(
    el
) {

    if (!el) return;


    /* -----------------------------------------
       NORMAL TEXT
    ----------------------------------------- */

    if (
        el.dataset.lang
    ) {

        el.textContent =
            t(
                el.dataset.lang
            );

    }


    /* -----------------------------------------
       PLACEHOLDER
    ----------------------------------------- */

    if (
        el.dataset.placeholder
    ) {

        el.placeholder =
            t(
                el.dataset.placeholder
            );

    }


    /* -----------------------------------------
       TITLE
    ----------------------------------------- */

    if (
        el.dataset.title
    ) {

        el.title =
            t(
                el.dataset.title
            );

    }


    /* -----------------------------------------
       VALUE
    ----------------------------------------- */

    if (
        el.dataset.value
    ) {

        el.value =
            t(
                el.dataset.value
            );

    }

}


/* =========================================================
   TRANSLATE PAGE
========================================================= */

export function translatePage() {

    /*
     * Обычный текст
     */

    document
        .querySelectorAll(
            "[data-lang]"
        )
        .forEach(
            translateElement
        );


    /*
     * Placeholder
     */

    document
        .querySelectorAll(
            "[data-placeholder]"
        )
        .forEach(
            translateElement
        );


    /*
     * Title
     */

    document
        .querySelectorAll(
            "[data-title]"
        )
        .forEach(
            translateElement
        );


    /*
     * Value
     */

    document
        .querySelectorAll(
            "[data-value]"
        )
        .forEach(
            translateElement
        );


    console.log(
        "[LANGUAGE] Page translated:",
        currentLanguage
    );

}

