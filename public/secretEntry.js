/* =========================================================
   ABIC → OMEGA SECRET ENTRY
   Hidden access through the ABIC header logo
========================================================= */

let holdTimer = null;
let initialized = false;

const HOLD_TIME = 3000;


/* =========================================================
   INITIALIZE
========================================================= */

export function initSecretEntry() {

    // Prevent duplicate listeners.
    if (initialized) return;

    const logo =
        document.getElementById("headerLogo");

    if (!logo) {

        console.warn(
            "[ABIC SECRET] #headerLogo not found."
        );

        return;
    }

    initialized = true;

    logo.style.cursor = "pointer";

    logo.setAttribute(
        "title",
        "American Botanical Information Center"
    );


    /* -----------------------------------------------------
       Mouse
    ----------------------------------------------------- */

    logo.addEventListener(
        "mouseenter",
        startHold
    );

    logo.addEventListener(
        "mouseleave",
        cancelHold
    );

    logo.addEventListener(
        "mousedown",
        startHold
    );

    logo.addEventListener(
        "mouseup",
        cancelHold
    );


    /* -----------------------------------------------------
       Touch
    ----------------------------------------------------- */

    logo.addEventListener(
        "touchstart",
        startHold,
        { passive: true }
    );

    logo.addEventListener(
        "touchend",
        cancelHold
    );

    logo.addEventListener(
        "touchcancel",
        cancelHold
    );


    /* -----------------------------------------------------
       Keyboard
    ----------------------------------------------------- */

    logo.setAttribute(
        "tabindex",
        "0"
    );

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
        "[ABIC SECRET] Secret OMEGA entry initialized."
    );

}


/* =========================================================
   START HOLD
========================================================= */

function startHold() {

    // Do not create multiple timers.
    if (holdTimer !== null) {

        clearTimeout(holdTimer);

    }

    holdTimer = setTimeout(() => {

        holdTimer = null;

        enterOmega();

    }, HOLD_TIME);

}


/* =========================================================
   CANCEL HOLD
========================================================= */

function cancelHold() {

    if (holdTimer !== null) {

        clearTimeout(holdTimer);

        holdTimer = null;

    }

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


    /* -----------------------------------------------------
       Safety checks
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       Switch ABIC → OMEGA
    ----------------------------------------------------- */

    publicSite.classList.add(
        "hidden"
    );

    login.classList.remove(
        "hidden"
    );


    /* -----------------------------------------------------
       Reset scroll position
    ----------------------------------------------------- */

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });


    console.log(
        "[ABIC SECRET] OMEGA login opened."
    );

}


/* =========================================================
   RESET
========================================================= */

export function resetSecretEntry() {

    cancelHold();

    initialized = false;

}
