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
