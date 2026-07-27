let currentLanguage = "en";
let dictionary = {};

export async function loadLanguage(lang) {

    currentLanguage = lang;

    const response = await fetch(`languages/${lang}.json`);
    dictionary = await response.json();

    applyLanguage();

    localStorage.setItem("omega-language", lang);
}

export function applyLanguage() {

    document.querySelectorAll("[data-lang]").forEach(element => {

        const key = element.dataset.lang;

        if (dictionary[key]) {
            element.textContent = dictionary[key];
        }

    });

}

export async function initLanguage() {

    const saved = localStorage.getItem("omega-language") || "en";

    await loadLanguage(saved);

}

export async function changeLanguage(lang) {

    await loadLanguage(lang);

}
