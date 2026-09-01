
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

    const loginScreen =
        document.getElementById("loginScreen");

    if (!loginScreen) {

        console.warn(
            "OMEGA LOGIN: loginScreen not found"
        );

        return;
    }


    loginScreen.classList.remove(
        "hidden"
    );


    const userEl =
        document.getElementById("user");

    const passEl =
        document.getElementById("pass");

    const status =
        document.getElementById("status");


    if (userEl) {
        userEl.value = "";
    }


    if (passEl) {
        passEl.value = "";
    }


    if (status) {

        status.textContent =
            "AWAITING AUTHORIZATION...";

    }


    const loginBtn =
        document.getElementById("loginBtn");


    if (
        loginBtn &&
        !loginBtn.dataset.bound
    ) {

        loginBtn.addEventListener(
            "click",
            loginSystem
        );

        loginBtn.dataset.bound =
            "true";

    }


    setTimeout(() => {

        userEl?.focus();

    }, 100);

}


/* =========================================================
   CLOSE OMEGA LOGIN
========================================================= */

export function closeOmegaLogin() {

    const loginScreen =
        document.getElementById("loginScreen");


    if (!loginScreen) return;


    loginScreen.classList.add(
        "hidden"
    );

}


/* =========================================================
   LOGIN
========================================================= */

export function loginSystem() {

    const userEl =
        document.getElementById("user");

    const passEl =
        document.getElementById("pass");

    const status =
        document.getElementById("status");

    const loginScreen =
        document.getElementById("loginScreen");

    const desktop =
        document.getElementById("desktop");


    if (!userEl || !passEl) return;


    /* -----------------------------------------------------
       GET CREDENTIALS
    ----------------------------------------------------- */

    const username =
        userEl.value.trim();

    const password =
        passEl.value;


    /* -----------------------------------------------------
       EMPTY
    ----------------------------------------------------- */

    if (
        !username ||
        !password
    ) {

        if (status) {

            status.textContent =
                "ENTER CREDENTIALS";

        }

        return;
    }


    console.log(
        "OMEGA LOGIN TRY:",
        username
    );


    /* -----------------------------------------------------
       UNKNOWN USER
    ----------------------------------------------------- */

    if (!(username in Accounts)) {

        console.warn(
            "OMEGA LOGIN: unknown user:",
            username
        );


        console.log(
            "Available accounts:",
            Object.keys(Accounts)
        );


        if (status) {

            status.textContent = t("login.unknownUser");

        }

        return;
    }


    /* -----------------------------------------------------
       PASSWORD
    ----------------------------------------------------- */

    if (
        Accounts[username].password !==
        password
    ) {

        if (status) {

            status.textContent = t("login.wrongPassword");

        }

        return;
    }


    /* -----------------------------------------------------
       SUCCESS
    ----------------------------------------------------- */

    if (status) {

        status.textContent =
    t("login.welcome", {
        username
    });
    


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
        Storage.get(
            "users",
            {}
        );


    if (!users[username]) {

        users[username] = {

            settings: {}

        };


        Storage.set(
            "users",
            users
        );

    }


    /* =====================================================
       MUSIC
       IMPORTANT FOR MOBILE BROWSERS
    ===================================================== */

    try {

        const settings =
            Storage
                .get("users", {})[username]
                ?.settings || {};


        /*
         * Запускаем музыку непосредственно
         * во время действия пользователя.
         *
         * Это важно для мобильных браузеров,
         * которые могут блокировать autoplay.
         */

        playMusic(
            "background.mp3",
            0.3,
            settings
        );


    } catch (e) {

        console.warn(
            "OMEGA MUSIC ERROR:",
            e
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

        desktop.classList.add(
            "hidden"
        );

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

