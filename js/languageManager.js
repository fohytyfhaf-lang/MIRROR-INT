let dictionary = {};
let currentLanguage = "en";

export async function loadLanguage(lang) {

    currentLanguage = lang;

    const response = await fetch(`languages/${lang}.json`);
    dictionary = await response.json();

    translatePage();

    localStorage.setItem("omega-language", lang);
}

export async function initLanguage() {

    const saved = localStorage.getItem("omega-language") || "en";

    await loadLanguage(saved);
}

export async function changeLanguage(lang) {

    await loadLanguage(lang);
}

function getText(key){

    return dictionary[key] || key;

}

export function translatePage(){

    // обычный текст
    document.querySelectorAll("[data-lang]").forEach(el=>{

        const key=el.dataset.lang;

        el.textContent=getText(key);

    });

    // placeholder
    document.querySelectorAll("[data-placeholder]").forEach(el=>{

        const key=el.dataset.placeholder;

        el.placeholder=getText(key);

    });

    // title
    document.querySelectorAll("[data-title]").forEach(el=>{

        const key=el.dataset.title;

        el.title=getText(key);

    });

    // value
    document.querySelectorAll("[data-value]").forEach(el=>{

        const key=el.dataset.value;

        el.value=getText(key);

    });

}
