import { SettingsPages } from "./settingsPages.js";
import { translatePage } from "./languageManager4.js";
import {
    getSettings,
    updateSetting,
    resetSettings
} from "./systemConfig.js";

export function initSettings() {

    const content = document.getElementById("settingsContent");
    const tabs = document.querySelectorAll(".settingsTab");

    if (!content) {
        console.error("settingsContent not found");
        return;
    }

    function loadPage(page) {
    
        content.innerHTML = SettingsPages[page] || `
        
            <div class="settingsCard">
                <h2>404</h2>
                <p>Page "${page}" not found.</p>
            </div>
        `;
        translatePage();

        initPage(page);
        
    }

    function initPage(page) {

        const settings = getSettings();

        switch (page) {

            case "language": {

                const select = document.getElementById("languageSelect");
                const save = document.getElementById("saveLanguage");

                if (select) {
                    select.value = settings.language;
                }

                if (save) {
                    save.onclick = () => {
                        updateSetting("language", select.value);
                    };
                }

                break;
            }

            case "audio": {

                const master = document.getElementById("masterVolume");
                const music = document.getElementById("musicVolume");
                const effects = document.getElementById("effectsVolume");

                if (master) {

                    master.value = settings.masterVolume;

                    master.oninput = () => {
                        updateSetting("masterVolume", Number(master.value));
                    };

                }

               if (music) {

    music.value = settings.musicVolume;

    music.oninput = () => {
        updateSetting("musicVolume", Number(music.value));
    };

}

if (effects) {

    effects.value = settings.effectsVolume;

    effects.oninput = () => {
        updateSetting("effectsVolume", Number(effects.value));
    };

}

                break;
            }

            case "appearance": {

                const crt = document.getElementById("crt");
                const scan = document.getElementById("scanlines");
                const anim = document.getElementById("animations");
                const glitch = document.getElementById("glitchEffects");

                if (crt) {
                    crt.checked = settings.crt;
                    crt.onchange = () => updateSetting("crt", crt.checked);
                }

                if (scan) {
                    scan.checked = settings.scanlines;
                    scan.onchange = () => updateSetting("scanlines", scan.checked);
                }

                if (anim) {
                    anim.checked = settings.animations;
                    anim.onchange = () => updateSetting("animations", anim.checked);
                }

                if (glitch) {
                    glitch.checked = settings.glitchEffects;
                    glitch.onchange = () => updateSetting("glitchEffects", glitch.checked);
                }

                break;
            }

            case "interface": {

                const scale = document.getElementById("uiScale");
                const font = document.getElementById("fontSize");

                if (scale) {

                    scale.value = settings.uiScale;

                    scale.oninput = () => {
                        updateSetting("uiScale", Number(scale.value));
                    };

                }

                if (font) {

                    font.value = settings.fontSize;

                    font.oninput = () => {
                        updateSetting("fontSize", Number(font.value));
                    };

                }

                break;
            }

            case "security": {

                const remember = document.getElementById("rememberUser");
                const auto = document.getElementById("autoLogin");
                const clearData = document.getElementById("clearData");

                if (remember) {
                    remember.checked = settings.rememberUser;
                    remember.onchange = () =>
                        updateSetting("rememberUser", remember.checked);
                }

                if (auto) {
                    auto.checked = settings.autoLogin;
                    auto.onchange = () =>
                        updateSetting("autoLogin", auto.checked);
                }

                     if (clearData) {
                         clearData.onclick = () => {

                            if (!confirm("Reset OMEGA settings to default values?")) {
                                return;
                            }

                            resetSettings();
                            loadPage("security");
                        };
                     }     

                break;
            }

        }

    }

    tabs.forEach(tab => {

        tab.onclick = () => {

            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            loadPage(tab.dataset.page);

        };

    });

    loadPage("language");

}
