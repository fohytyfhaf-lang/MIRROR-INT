import { SettingsPages } from "./settingsPages.js";
import { initLanguage, changeLanguage } from "./languageManager.js";

export function initSettings() {

    const tabs = document.querySelectorAll(".settingsTab");
    const content = document.getElementById("settingsContent");

    function loadPage(page) {

        content.innerHTML = SettingsPages[page] || "";
        content.innerHTML = `
        <div class="settingsCard">
            <h2 style="color:white;">TEST</h2>
            <p style="color:white;">Если ты видишь этот текст — settings.js работает.</p>
        </div>
        `;
        console.log("Страница:", page);
        console.log("HTML:", content.innerHTML);

        // Инициализация языков
        if (page === "language") {

            initLanguage();

            const select = document.getElementById("languageSelect");
            const save = document.getElementById("saveLanguage");

            if (save && select) {

                save.onclick = () => {
                    changeLanguage(select.value);
                };

            }

        }

    }

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            loadPage(tab.dataset.page);

        });

    });

    // Загружаем первую страницу
    loadPage("language");

}
