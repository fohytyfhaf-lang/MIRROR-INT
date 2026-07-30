import { playMusic } from "./audio.js";
import { setRole } from "./security.js";
import { Storage } from "./storage.js";
import { trigger } from "./eventManager.js";
import { applySettings } from "./systemSettings.js";

const accounts = {
    operator: "0404",
    admin: "0000",
    guest: "1234",
    test: "1111"
};

export function loginSystem() {

    const userEl = document.getElementById("user");
    const passEl = document.getElementById("pass");
    const status = document.getElementById("status");
    const loginScreen = document.getElementById("loginScreen");
    const desktop = document.getElementById("desktop");

    if (!userEl || !passEl) return;

    const username = userEl.value.trim();
    const password = passEl.value.trim();

    if (!username || !password) {

        if (status) status.textContent = "ENTER CREDENTIALS";
        return;

    }

    console.log("LOGIN TRY:", username);

    if (!(username in accounts)) {

        if (status) status.textContent = "UNKNOWN USER";
        return;

    }

    if (accounts[username] !== password) {

        if (status) status.textContent = "WRONG PASSWORD";
        return;

    }

    if (status) {
        status.textContent = `WELCOME ${username}`;
    }

    /* ---------- ROLE ---------- */

    switch (username) {

        case "admin":
            setRole("admin");
            break;

        case "operator":
            setRole("operator");
            break;

        default:
            setRole("guest");

    }

    /* ---------- STORAGE ---------- */

    Storage.set("currentUser", username);

    const users = Storage.get("users", {});

    if (!users[username]) {

        users[username] = {
            settings: {}
        };

        Storage.set("users", users);

    }

    setTimeout(() => {

        loginScreen?.classList.add("hidden");
        desktop?.classList.remove("hidden");

        /* ---------- APPLY SETTINGS ---------- */

        applySettings();

        /* ---------- START MUSIC ---------- */

        try {

            const volume =
                (Storage.get("users", {})[username]?.settings?.masterVolume ?? 70) / 100;

            playMusic("background.mp3", volume);

        } catch (e) {

            console.warn(e);

        }

        /* ---------- EVENT ---------- */

        trigger("user.login", {
            username,
            role: username === "admin"
                ? "admin"
                : username === "operator"
                    ? "operator"
                    : "guest"
        });

    }, 400);

}
