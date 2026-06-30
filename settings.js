import { Storage } from "./storage.js";

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
