import { Storage } from "./storage.js";

export function getUser() {
  return Storage.get("currentUser");
}

export function getUsers() {
  return Storage.get("users", {});
}

export function saveUsers(users) {
  Storage.set("users", users);
}

export function setSetting(key, value) {
  const user = getUser();
  const users = getUsers();

  if (!user || !users[user]) return;

  users[user].settings[key] = value;
  saveUsers(users);
}
