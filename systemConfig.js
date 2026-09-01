import { Storage } from "./storage.js";
import { changeLanguage } from "./languageManager4.js";
import { updateAudioSettings } from "./audio.js";


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {

    language: "en",

    /* AUDIO */

    masterVolume: 70,
    musicVolume: 70,
    effectsVolume: 70,

    /* APPEARANCE */

    animations: true,
    crt: true,
    scanlines: true,
    glitchEffects: true,

    /* INTERFACE */

    uiScale: 100,
    fontSize: 16,

    /* SECURITY */

    rememberUser: false,
    autoLogin: false

};


/* =========================================================
   GET SETTINGS
========================================================= */

export function getSettings() {

    const currentUser =
        Storage.get("currentUser");

    const users =
        Storage.get("users", {});


    /* -----------------------------------------
       NO USER
    ----------------------------------------- */

    if (
        !currentUser ||
        !users[currentUser]
    ) {

        return {
            ...DEFAULT_SETTINGS
        };

    }


    /* -----------------------------------------
       USER SETTINGS
    ----------------------------------------- */

    return {

        ...DEFAULT_SETTINGS,

        ...(users[currentUser].settings || {})

    };

}


/* =========================================================
   SAVE SETTINGS
========================================================= */

export function saveSettings(settings) {

    const currentUser =
        Storage.get("currentUser");

    if (!currentUser) {

        console.warn(
            "[SETTINGS] Cannot save: no current user"
        );

        return;

    }


    const users =
        Storage.get("users", {});


    /* -----------------------------------------
       CREATE USER IF MISSING
    ----------------------------------------- */

    if (!users[currentUser]) {

        users[currentUser] = {};

    }


    users[currentUser].settings = {

        ...DEFAULT_SETTINGS,

        ...settings

    };


    Storage.set(
        "users",
        users
    );


    console.log(
        "[SETTINGS] Saved",
        users[currentUser].settings
    );

}


/* =========================================================
   UPDATE ONE SETTING
========================================================= */

export function updateSetting(key, value) {

    const settings =
        getSettings();


    settings[key] = value;


    saveSettings(
        settings
    );


    applySettings();


    /* =========================================
       AUDIO SETTINGS
    ========================================= */

    if (
        key === "masterVolume" ||
        key === "musicVolume" ||
        key === "effectsVolume"
    ) {

        updateAudioSettings();

    }


    console.log(
        `[SETTINGS] ${key}:`,
        value
    );

}


/* =========================================================
   APPLY SETTINGS
========================================================= */

export function applySettings() {

    const settings =
        getSettings();


    /* =====================================================
       LANGUAGE
    ===================================================== */

    if (settings.language) {

        changeLanguage(
            settings.language
        );

    }


    /* =====================================================
       MASTER VOLUME
    ===================================================== */

    const bgm =
        document.getElementById("bgm");


    if (bgm) {

        bgm.volume =
            Math.max(
                0,
                Math.min(
                    1,
                    settings.masterVolume / 100
                )
            );

    }


    /* =====================================================
       MUSIC VOLUME
    ===================================================== */

    /*
       Пока отдельный music mixer
       не подключен — используем masterVolume.
    */

    const musicVolume =
        settings.musicVolume *
        settings.masterVolume /
        10000;


    if (bgm) {

        bgm.volume =
            Math.max(
                0,
                Math.min(
                    1,
                    musicVolume
                )
            );

    }


    /* =====================================================
       FONT SIZE
    ===================================================== */

    document.documentElement.style.setProperty(
        "--omega-font-size",
        settings.fontSize + "px"
    );


    document.documentElement.style.fontSize =
        settings.fontSize + "px";


    /* =====================================================
       UI SCALE
    ===================================================== */

    document.documentElement.style.setProperty(
        "--ui-scale",
        settings.uiScale / 100
    );


    /* =====================================================
       CRT
    ===================================================== */

    document.body.classList.toggle(
        "crt-disabled",
        !settings.crt
    );


    /* =====================================================
       SCANLINES
    ===================================================== */

    document.body.classList.toggle(
        "scanlines-disabled",
        !settings.scanlines
    );


    /* =====================================================
       ANIMATIONS
    ===================================================== */

    document.body.classList.toggle(
        "animations-disabled",
        !settings.animations
    );


    /* =====================================================
       GLITCH EFFECTS
    ===================================================== */

    document.body.classList.toggle(
        "glitch-disabled",
        !settings.glitchEffects
    );


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "[SETTINGS] Applied",
        settings
    );

}


/* =========================================================
   RESET SETTINGS
========================================================= */

export function resetSettings() {

    const currentUser =
        Storage.get("currentUser");

    if (!currentUser) {

        console.warn(
            "[SETTINGS] Cannot reset: no current user"
        );

        return;

    }


    saveSettings(
        {
            ...DEFAULT_SETTINGS
        }
    );


    applySettings();

}


/* =========================================================
   EXPORT DEFAULTS
========================================================= */

export {
    DEFAULT_SETTINGS
};
