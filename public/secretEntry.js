/* =========================================================
   ABIC → OMEGA SECRET ENTRY
========================================================= */

let holdTimer = null;
let initialized = false;

const HOLD_TIME = 3000;


/* =========================================================
   INITIALIZE
========================================================= */

export function initSecretEntry() {

    if (initialized) return;

    const logo =
        document.getElementById("headerLogo");

    if (!logo) {

        console.error(
            "[ABIC SECRET] ERROR: #headerLogo not found."
        );

        return;
    }

    initialized = true;

    logo.style.cursor = "pointer";

    logo.setAttribute(
        "title",
        "Hold for 3 seconds"
    );

    logo.setAttribute(
        "tabindex",
        "0"
    );


    /* =====================================================
       POINTER
    ===================================================== */

    logo.addEventListener(
        "pointerdown",
        startHold
    );

    logo.addEventListener(
        "pointerup",
        cancelHold
    );

    logo.addEventListener(
        "pointercancel",
        cancelHold
    );

    logo.addEventListener(
        "pointerleave",
        cancelHold
    );


    /* =====================================================
       KEYBOARD
    ===================================================== */

    logo.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                startHold();

            }

        }
    );

    logo.addEventListener(
        "keyup",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                cancelHold();

            }

        }
    );


    console.log(
        "[ABIC SECRET] OMEGA entry initialized."
    );

}


/* =========================================================
   START HOLD
========================================================= */

function startHold(event) {

    if (holdTimer !== null) {
        clearTimeout(holdTimer);
    }

    /*
       Prevent browser gestures on touch.
    */

    if (
        event &&
        event.pointerType === "touch"
    ) {

        event.preventDefault();

    }


    console.log(
        "[ABIC SECRET] Hold started."
    );


    holdTimer = setTimeout(() => {

        holdTimer = null;

        enterOmega();

    }, HOLD_TIME);

}


/* =========================================================
   CANCEL HOLD
========================================================= */

function cancelHold() {

    if (holdTimer === null) return;

    clearTimeout(holdTimer);

    holdTimer = null;

    console.log(
        "[ABIC SECRET] Hold cancelled."
    );

}


/* =========================================================
   ENTER OMEGA
========================================================= */

function enterOmega() {

    cancelHold();


    const publicSite =
        document.getElementById("publicSite");

    const login =
        document.getElementById("loginScreen");

    const desktop =
        document.getElementById("desktop");


    console.log(
        "[ABIC SECRET] Attempting OMEGA entry..."
    );


    if (!publicSite) {

        console.error(
            "[ABIC SECRET] #publicSite not found."
        );

        return;
    }


    if (!login) {

        console.error(
            "[ABIC SECRET] #loginScreen not found."
        );

        return;
    }


    /*
       Hide ABIC.
    */

    publicSite.classList.add("hidden");


    /*
       Show OMEGA login.
    */

    login.classList.remove("hidden");


    /*
       Desktop must remain hidden.
    */

    if (desktop) {

        desktop.classList.add("hidden");

    }


    /*
       Scroll to top.
    */

    window.scrollTo(0, 0);


    console.log(
        "[ABIC SECRET] OMEGA LOGIN OPENED."
    );

}


/* =========================================================
   RESET
========================================================= */

export function resetSecretEntry() {

    cancelHold();

    initialized = false;

}
