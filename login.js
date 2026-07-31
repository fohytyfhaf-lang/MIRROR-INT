import { playMusic } from "./audio.js";
import { setRole } from "./security.js";
import { Storage } from "./storage.js";
import { trigger } from "./eventManager.js";
import { applySettings } from "./systemConfig.js";
import { Accounts } from "./accounts.js";

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

    if (!(username in Accounts)) {

        if (status) status.textContent = "UNKNOWN USER";
        return;

    }

   if (Accounts[username].password !== password) {

        if (status) status.textContent = "WRONG PASSWORD";
        return;

    }

    if (status) {
        status.textContent = `WELCOME ${username}`;
    }

    /* ---------- ROLE ---------- */
    
    setRole(Accounts[username].role);

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

           // скрываем публичный сайт
           document.getElementById("publicSite")?.classList.add("hidden");

           // скрываем логин
           loginScreen?.classList.add("hidden");

           // показываем рабочий стол
           desktop?.classList.remove("hidden");

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
            role: Accounts[username].role,
            clearance: Accounts[username].clearance
        });

    }, 400);

}
