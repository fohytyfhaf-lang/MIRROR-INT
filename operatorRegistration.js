/* ==========================================================
   OMEGA OPERATOR REGISTRATION
========================================================== */

import {
    createLocalAccount
} from "./login.js";


function get(id) {

    return document.getElementById(id);

}


function setRegistrationStatus(
    message,
    type = ""
) {

    const status =
        get("registrationStatus");

    if (!status) return;

    status.textContent =
        message;

    status.classList.remove(
        "success",
        "error"
    );

    if (type) {

        status.classList.add(
            type
        );

    }

}


/* ==========================================================
   OPEN REGISTRATION
========================================================== */

function openRegistration() {

    const panel =
        get("operatorRegistration");

    if (!panel) return;

    panel.classList.remove(
        "hidden"
    );

    setRegistrationStatus(
        "ACCOUNT REGISTRATION READY."
    );

    get("registerUsername")?.focus();

}


/* ==========================================================
   CLOSE REGISTRATION
========================================================== */

function closeRegistration() {

    const panel =
        get("operatorRegistration");

    if (!panel) return;

    panel.classList.add(
        "hidden"
    );

    const username =
        get("registerUsername");

    const password =
        get("registerPassword");

    const confirm =
        get("registerPasswordConfirm");

    if (username) username.value = "";
    if (password) password.value = "";
    if (confirm) confirm.value = "";

}


/* ==========================================================
   REGISTER
========================================================== */

function registerOperator() {

    const username =
        get("registerUsername")?.value.trim();

    const password =
        get("registerPassword")?.value;

    const confirm =
        get("registerPasswordConfirm")?.value;


    if (!username) {

        setRegistrationStatus(
            "ERROR: USERNAME REQUIRED.",
            "error"
        );

        return;

    }


    if (!/^[A-Za-z0-9_.-]+$/.test(username)) {

        setRegistrationStatus(
            "ERROR: INVALID USERNAME FORMAT.",
            "error"
        );

        return;

    }


    if (!password || password.length < 4) {

        setRegistrationStatus(
            "ERROR: PASSWORD MUST CONTAIN AT LEAST 4 CHARACTERS.",
            "error"
        );

        return;

    }


    if (password !== confirm) {

        setRegistrationStatus(
            "ERROR: PASSWORDS DO NOT MATCH.",
            "error"
        );

        return;

    }


    const result =
        createLocalAccount(
            username,
            password
        );


    if (!result?.ok) {

        switch (result?.reason) {

            case "account_exists":

                setRegistrationStatus(
                    "ERROR: ACCOUNT ALREADY EXISTS.",
                    "error"
                );

                break;


            case "invalid_username":

                setRegistrationStatus(
                    "ERROR: INVALID USERNAME.",
                    "error"
                );

                break;


            default:

                setRegistrationStatus(
                    "ERROR: ACCOUNT CREATION FAILED.",
                    "error"
                );

                break;

        }

        return;

    }


    /*
     * Account created.
     */

    setRegistrationStatus(
        `ACCOUNT CREATED. ${result.operatorId} AUTHORIZATION REQUIRED.`,
        "success"
    );


    /*
     * Put username into normal login form.
     */

    const loginUsername =
        get("user");

    if (loginUsername) {

        loginUsername.value =
            username;

    }


    /*
     * Clear registration password fields.
     */

    const registerPassword =
        get("registerPassword");

    const registerConfirm =
        get("registerPasswordConfirm");

    if (registerPassword) {
        registerPassword.value = "";
    }

    if (registerConfirm) {
        registerConfirm.value = "";
    }


    /*
     * Keep the panel open briefly so
     * the operator can see the assigned ID.
     */

    setTimeout(
        () => {

            closeRegistration();

            const status =
                get("status");

            if (status) {

                status.textContent =
                    `ACCOUNT CREATED: ${result.operatorId} — AUTHORIZATION REQUIRED.`;

            }

        },
        1200
    );

}


/* ==========================================================
   INITIALIZATION
========================================================== */

function initOperatorRegistration() {

    const createButton =
        get("createOperatorBtn");

    const registerButton =
        get("registerOperatorBtn");

    const cancelButton =
        get("cancelRegistrationBtn");


    createButton?.addEventListener(
        "click",
        openRegistration
    );


    registerButton?.addEventListener(
        "click",
        registerOperator
    );


    cancelButton?.addEventListener(
        "click",
        closeRegistration
    );


    get("registerPasswordConfirm")
        ?.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    registerOperator();

                }

            }
        );

}


window.addEventListener(
    "DOMContentLoaded",
    initOperatorRegistration
);
