import { Storage } from "./storage.js";

/* =========================
        LANGUAGE PACK
========================= */

const langPack = {
  en: {
    login: "LOGIN",
    username: "USERNAME",
    password: "PASSWORD"
  },
  ru: {
    login: "ВХОД",
    username: "ИМЯ ПОЛЬЗОВАТЕЛЯ",
    password: "ПАРОЛЬ"
  }
};

/* =========================
        APPLY LANGUAGE
========================= */

export function applyLanguage(lang) {
  if (!lang) return;

  const loginBtn = document.getElementById("loginBtn");
  const user = document.getElementById("user");
  const pass = document.getElementById("pass");

  const pack = langPack[lang];
  if (!pack || !loginBtn || !user || !pass) return;

  loginBtn.textContent = pack.login;
  user.placeholder = pack.username;
  pass.placeholder = pack.password;
}

/* =========================
        INIT SETTINGS
========================= */

export function initSettings() {
  const currentUser = Storage.get("currentUser");
  const users = Storage.get("users", {});

  if (!currentUser || !users[currentUser]) return;

  const settings = users[currentUser].settings || {};

  if (settings.language) {
    applyLanguage(settings.language);
  }

  const volumeSlider = document.getElementById("volume");
  const audio = document.getElementById("bgm");

  if (volumeSlider && audio && settings.volume != null) {
    volumeSlider.value = settings.volume;
    audio.volume = settings.volume;
  }
}
