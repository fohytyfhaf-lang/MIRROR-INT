import { playMusic } from "./audio.js";
import { setRole } from "./security.js";
import { Storage } from "./storage.js";
import { trigger } from "./eventManager.js";
import { applySettings } from "./systemConfig.js";
import { Accounts } from "./accounts.js";


/* =========================================================
   OPEN OMEGA LOGIN
========================================================= */

export function openOmegaLogin() {

    const loginScreen = document.getElementById("loginScreen");

    if (!loginScreen) {
        console.warn("OMEGA LOGIN: loginScreen not found");
        return;
    }

    loginScreen.classList.remove("hidden");

    const userEl = document.getElementById("user");
    const passEl = document.getElementById("pass");
    const status = document.getElementById("status");

    if (userEl) userEl.value = "";
    if (passEl) passEl.value = "";

    if (status) {
        status.textContent = "AWAITING AUTHORIZATION...";
    }

    setTimeout(() => {
        userEl?.focus();
    }, 100);
}


/* =========================================================
   CLOSE OMEGA LOGIN
========================================================= */

export function closeOmegaLogin() {

    const loginScreen = document.getElementById("loginScreen");

    if (!loginScreen) return;

    loginScreen.classList.add("hidden");
}


/* =========================================================
   LOGIN
========================================================= */

export function loginSystem() {

    const userEl = document.getElementById("user");
    const passEl = document.getElementById("pass");
    const status = document.getElementById("status");

    const loginScreen = document.getElementById("loginScreen");
    const desktop = document.getElementById("desktop");

    if (!userEl || !passEl) return;


    /* -----------------------------------------------------
       GET CREDENTIALS
    ----------------------------------------------------- */

    const username = userEl.value.trim();
    const password = passEl.value.trim();


    /* -----------------------------------------------------
       EMPTY
    ----------------------------------------------------- */

    if (!username || !password) {

        if (status) {
            status.textContent = "ENTER CREDENTIALS";
        }

        return;
    }


    console.log("OMEGA LOGIN TRY:", username);


    /* -----------------------------------------------------
       UNKNOWN USER
    ----------------------------------------------------- */

    if (!(username in Accounts)) {

        if (status) {
            status.textContent = "UNKNOWN USER";
        }

        return;
    }


    /* -----------------------------------------------------
       PASSWORD
    ----------------------------------------------------- */

    if (Accounts[username].password !== password) {

        if (status) {
            status.textContent = "WRONG PASSWORD";
        }

        return;
    }


    /* -----------------------------------------------------
       SUCCESS
    ----------------------------------------------------- */

    if (status) {

        status.textContent =
            `WELCOME ${username}`;
    }


    /* -----------------------------------------------------
       ROLE
    ----------------------------------------------------- */

    setRole(
        Accounts[username].role
    );


    /* -----------------------------------------------------
       STORAGE
    ----------------------------------------------------- */

    Storage.set(
        "currentUser",
        username
    );


    const users =
        Storage.get("users", {});


    if (!users[username]) {

        users[username] = {
            settings: {}
        };

        Storage.set(
            "users",
            users
        );
    }


    /* -----------------------------------------------------
       ENTER OMEGA
    ----------------------------------------------------- */

    setTimeout(() => {

        /*
         * ВАЖНО:
         *
         * publicSite здесь НЕ трогаем.
         *
         * ABIC остаётся существовать
         * независимо от OMEGA.
         */


        /* Hide login */

        loginScreen?.classList.add(
            "hidden"
        );


        /* Show OMEGA desktop */

        desktop?.classList.remove(
            "hidden"
        );


        /* Apply settings */

        applySettings();


        /* -------------------------------------------------
           MUSIC
        ------------------------------------------------- */

        try {

            const volume =
                (
                    Storage
                        .get("users", {})[username]
                        ?.settings
                        ?.masterVolume
                    ?? 70
                ) / 100;


            playMusic(
                "background.mp3",
                volume
            );

        } catch (e) {

            console.warn(
                "OMEGA MUSIC ERROR:",
                e
            );
        }


        /* -------------------------------------------------
           EVENT
        ------------------------------------------------- */

        trigger(
            "user.login",
            {
                username,

                role:
                    Accounts[username].role,

                clearance:
                    Accounts[username].clearance
            }
        );


    }, 400);
}


/* =========================================================
   LOGOUT
========================================================= */

export function logoutOmega() {

    const desktop =
        document.getElementById("desktop");

    if (desktop) {
        desktop.classList.add("hidden");
    }


    /*
     * ABIC НЕ прячем.
     *
     * Он остаётся на странице.
     */


    Storage.remove(
        "currentUser"
    );


    console.log(
        "OMEGA LOGOUT"
    );
}
