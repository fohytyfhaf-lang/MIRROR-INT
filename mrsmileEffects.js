/* ==========================================================
   MR.SMILE EFFECTS
   OMEGA / MIRROR-INT

   SINGLE VISUAL EFFECT CONTROLLER
========================================================== */

const STATE = {

    initialized: false,

    currentPhase: null,

    timers: []

};


/* ==========================================================
   BODY
========================================================== */

function getBody() {

    if (
        typeof document === "undefined"
    ) {
        return null;
    }

    return document.body;

}


/* ==========================================================
   PHASE CLASSES
========================================================== */

const PHASE_CLASSES = [

    "mrSmilePhase1",
    "mrSmilePhase2",
    "mrSmilePhase3",
    "mrSmilePhase4",
    "mrSmilePhase5",
    "mrSmilePhase6"

];


/* ==========================================================
   EXTRA EFFECT CLASSES
========================================================== */

const EXTRA_CLASSES = [

    "mrSmileFirstContact",
    "mrSmileMicroGlitch",
    "mrSmileDistortion",
    "mrSmileTextCorruption",
    "mrSmileSevereGlitch",
    "mrSmileHardShake",
    "mrSmileInterfaceCollapse",
    "mrSmileBlackout",
    "mrSmileFinalDarkness",
    "mrSmileFlash"

];


/* ==========================================================
   CLEAR
========================================================== */

function clearPhaseClasses() {

    const body =
        getBody();

    if (!body) {
        return;
    }

    body.classList.remove(
        ...PHASE_CLASSES
    );

}


function clearExtraClasses() {

    const body =
        getBody();

    if (!body) {
        return;
    }

    body.classList.remove(
        ...EXTRA_CLASSES
    );

}


/* ==========================================================
   PHASE
========================================================== */

export function setMrSmilePhase(
    phase
) {

    const body =
        getBody();

    if (!body) {
        return false;
    }

    const normalized =
        Number(phase);

    if (
        !Number.isFinite(
            normalized
        )
    ) {
        return false;
    }

    clearPhaseClasses();

    const className =
        `mrSmilePhase${normalized}`;

    body.classList.add(
        className
    );

    STATE.currentPhase =
        normalized;

    return true;

}


/* ==========================================================
   EFFECT
========================================================== */

export function enableMrSmileEffect(
    effect
) {

    const body =
        getBody();

    if (!body || !effect) {
        return false;
    }

    if (
        !EXTRA_CLASSES.includes(
            effect
        )
    ) {
        return false;
    }

    body.classList.add(
        effect
    );

    return true;

}


export function disableMrSmileEffect(
    effect
) {

    const body =
        getBody();

    if (!body || !effect) {
        return false;
    }

    body.classList.remove(
        effect
    );

    return true;

}


/* ==========================================================
   TEMPORARY EFFECT
========================================================== */

export function pulseMrSmileEffect(
    effect,
    duration = 500
) {

    const enabled =
        enableMrSmileEffect(
            effect
        );

    if (!enabled) {
        return false;
    }

    const timer =
        setTimeout(
            () => {

                disableMrSmileEffect(
                    effect
                );

            },
            Math.max(
                0,
                Number(duration) || 0
            )
        );

    STATE.timers.push(
        timer
    );

    return true;

}


/* ==========================================================
   CLEAR ALL
========================================================== */

export function clearMrSmileEffects() {

    const body =
        getBody();

    if (!body) {
        return false;
    }

    clearPhaseClasses();
    clearExtraClasses();

    for (
        const timer
        of STATE.timers
    ) {

        clearTimeout(
            timer
        );

    }

    STATE.timers = [];

    STATE.currentPhase =
        null;

    return true;

}


/* ==========================================================
   RESET
========================================================== */

export function resetMrSmileEffects() {

    return clearMrSmileEffects();

}


/* ==========================================================
   STATUS
========================================================== */

export function getMrSmileEffectsStatus() {

    return {

        initialized:
            STATE.initialized,

        currentPhase:
            STATE.currentPhase

    };

}


/* ==========================================================
   GLOBAL API
========================================================== */

function exposeGlobalAPI() {

    if (
        typeof window ===
        "undefined"
    ) {
        return;
    }

    window.MRSMILE_EFFECTS = {

        setPhase:
            setMrSmilePhase,

        enable:
            enableMrSmileEffect,

        disable:
            disableMrSmileEffect,

        pulse:
            pulseMrSmileEffect,

        clear:
            clearMrSmileEffects,

        reset:
            resetMrSmileEffects,

        status:
            getMrSmileEffectsStatus

    };

}


/* ==========================================================
   INIT
========================================================== */

export function initMrSmileEffects() {

    if (
        STATE.initialized
    ) {

        return getMrSmileEffectsStatus();

    }

    clearMrSmileEffects();

    exposeGlobalAPI();

    STATE.initialized =
        true;

    console.log(
        "[MR.SMILE EFFECTS] Initialized."
    );

    return getMrSmileEffectsStatus();

}
