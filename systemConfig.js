import { Storage } from "./storage.js";
import { changeLanguage } from "./languageManager4.js";

const DEFAULT_SETTINGS = {

    language: "en",

    masterVolume: 70,
    musicVolume: 70,
    effectsVolume: 70,

    animations: true,
    crt: true,
    scanlines: true,
    glitchEffects: true,

    uiScale: 100,
    fontSize: 16,

    rememberUser: false,
    autoLogin: false

};

export function getSettings() {

    const currentUser = Storage.get("currentUser");
    const users = Storage.get("users", {});

    if (!currentUser || !users[currentUser]) {
        return { ...DEFAULT_SETTINGS };
    }

    return {
        ...DEFAULT_SETTINGS,
        ...(users[currentUser].settings || {})
    };

}

export function saveSettings(settings) {

    const currentUser = Storage.get("currentUser");
    if (!currentUser) return;

    const users = Storage.get("users", {});

    if (!users[currentUser]) {
        users[currentUser] = {
            settings: {}
        };
    }

    users[currentUser].settings = settings;

    Storage.set("users", users);

}

export function updateSetting(key, value) {

    const settings = getSettings();

    settings[key] = value;

    saveSettings(settings);

    applySettings();

}

export function applySettings() {

    const settings = getSettings();

    if (settings.language) {
        changeLanguage(settings.language);
    }

    const bgm = document.getElementById("bgm");

    if (bgm) {
        bgm.volume = settings.masterVolume / 100;
    }

    document.documentElement.style.fontSize =
        settings.fontSize + "px";

    document.documentElement.style.setProperty(
        "--ui-scale",
        settings.uiScale + "%"
    );

    document.body.classList.toggle("crt-disabled", !settings.crt);
    document.body.classList.toggle("scanlines-disabled", !settings.scanlines);
    document.body.classList.toggle("animations-disabled", !settings.animations);
    document.body.classList.toggle("glitch-disabled", !settings.glitchEffects);

}
