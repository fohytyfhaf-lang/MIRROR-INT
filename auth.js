import { Storage } from "./storage.js";

export function register(username, password) {
  let users = Storage.get("users", {});

  if (users[username]) {
    return "USER_EXISTS";
  }

  users[username] = {
    password: password,
    settings: {
      volume: 0.5,
      language: "en"
    }
  };

  Storage.set("users", users);
  return "OK";
}

export function login(username, password) {
  let users = Storage.get("users", {});

  if (!users[username]) return "NO_USER";
  if (users[username].password !== password) return "WRONG_PASS";

  Storage.set("currentUser", username);
  return "OK";
}
