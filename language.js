import { Storage } from "./storage.js";

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

  const currentUser = Storage.get("currentUser");
  const users = Storage.get("users", {});

  if (currentUser && users[currentUser]) {
    users[currentUser].settings ||= {};
    users[currentUser].settings.language = lang;

    Storage.set("users", users);
  }

  localStorage.setItem("lang", lang);
}
