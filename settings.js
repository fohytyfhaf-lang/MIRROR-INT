import { Storage } from "./storage.js";
import { setSetting } from "./settings.js";
export function getSettings() {
  const user = Storage.get("currentUser");
  const users = Storage.get("users", {});

  return users[user]?.settings || null;
}

export function setSetting(key, value) {
  const user = Storage.get("currentUser");
  let users = Storage.get("users", {});

  if (!user || !users[user]) return;

  users[user].settings[key] = value;
  Storage.set("users", users);
}



const slider = document.getElementById("volume");

slider.addEventListener("input", (e) => {
  const value = Number(e.target.value);

  setSetting("volume", value);

  const audio = document.getElementById("bgm");
  audio.volume = value;
});

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

export function setLanguage(lang) {
  localStorage.setItem("lang", lang);

  document.getElementById("loginBtn").textContent = langPack[lang].login;
  document.getElementById("user").placeholder = langPack[lang].username;
  document.getElementById("pass").placeholder = langPack[lang].password;
}
