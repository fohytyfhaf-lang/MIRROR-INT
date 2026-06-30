import { Storage } from "./storage.js";

/* =========================
   GET SETTINGS
========================= */
export function getSettings() {
  const user = Storage.get("currentUser");
  const users = Storage.get("users", {});

  return users[user]?.settings || null;
}

/* =========================
   SET SETTING
========================= */
export function setSetting(key, value) {
  const user = Storage.get("currentUser");
  let users = Storage.get("users", {});

  if (!user || !users[user]) return;

  users[user].settings[key] = value;
  Storage.set("users", users);
}

/* =========================
   INIT SETTINGS UI
========================= */
export function initSettings() {
  const slider = document.getElementById("volume");
  const langSelect = document.getElementById("language");

  const settings = getSettings();
  if (!settings) return;

  const audio = document.getElementById("bgm");

  /* volume */
  if (slider) {
    slider.value = settings.volume;

    slider.addEventListener("input", (e) => {
      const value = Number(e.target.value);

      setSetting("volume", value);
      if (audio) audio.volume = value;
    });
  }

  /* language */
  if (langSelect) {
    langSelect.value = settings.language;

    langSelect.addEventListener("change", (e) => {
      setSetting("language", e.target.value);
      applyLanguage(e.target.value);
    });
  }
}

/* =========================
   LANGUAGE SYSTEM
========================= */
const langPack = {
  en: {
    login: "LOGIN",
    username: "USERNAME",
    password: "PASSWORD"
  },
  ru: {
    login: "ВХОД",
    username: "ИМЯ",
    password: "ПАРОЛЬ"
  }
};

export function applyLanguage(lang) {
  const pack = langPack[lang];
  if (!pack) return;

  const loginBtn = document.getElementById("loginBtn");
  const user = document.getElementById("user");
  const pass = document.getElementById("pass");

  if (loginBtn) loginBtn.textContent = pack.login;
  if (user) user.placeholder = pack.username;
  if (pass) pass.placeholder = pack.password;
}
