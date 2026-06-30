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

  if (!loginBtn || !user || !pass) return;

  const pack = langPack[lang];
  if (!pack) return;

  loginBtn.textContent = pack.login;
  user.placeholder = pack.username;
  pass.placeholder = pack.password;
}
