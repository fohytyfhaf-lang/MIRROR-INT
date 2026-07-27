import { SettingsPages } from "./settingsPages.js";
import { initLanguage, changeLanguage } from "./languageManager.js";

export function initSettings() {

    const tabs = document.querySelectorAll(".settingsTab");
    const content = document.getElementById("settingsContent");

    tabs.forEach(tab => {

        tab.onclick = () => {

            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const page = tab.dataset.page;

            content.innerHTML = SettingsPages[page] || "";

            initLanguage();

        };

    });

    content.innerHTML = SettingsPages.language;

    initLanguage();

}
