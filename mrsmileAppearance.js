/* ==========================================================
   MR.SMILE — OMEGA INTERFACE MANIFESTATION
   VISUAL EVENT SYSTEM
========================================================== */

let manifestationRunning = false;

let cursorController = null;
let systemIntrusionController = null;


/* ==========================================================
   PUBLIC — FULL MANIFESTATION
========================================================== */

export async function triggerMrSmileManifestation() {

    if (manifestationRunning) {
        console.log(
            "[MR.SMILE APPEARANCE] Manifestation already running."
        );
        return;
    }

    manifestationRunning = true;

    console.log(
        "[MR.SMILE APPEARANCE] FULL MANIFESTATION STARTED."
    );


    const overlay = createManifestation();

    systemIntrusionController =
        createSystemIntrusionController();


    document.body.classList.add(
        "mrSmileInterfaceCollapse"
    );


    try {

        /* ================================================
           PHASE 1 — EMPTY SYSTEM
        ================================================= */

        await sleep(500);

        overlay.classList.add(
            "phase-1"
        );

        mutateCode(
            overlay,
            "initial"
        );


        await sleep(900);


        /* ================================================
           PHASE 2 — CODE CORRUPTION
        ================================================= */

        overlay.classList.add(
            "phase-2"
        );

        mutateCode(
            overlay,
            "corruption"
        );


        await sleep(1100);


        /* ================================================
           PHASE 3 — EYES
        ================================================= */

        overlay.classList.add(
            "phase-3"
        );

        mutateCode(
            overlay,
            "presence"
        );


        await sleep(1300);


        /* ================================================
           PHASE 4 — FACE
        ================================================= */

        overlay.classList.add(
            "phase-4"
        );

        mutateCode(
            overlay,
            "intrusion"
        );


        await sleep(1300);


        /* ================================================
           PHASE 5 — SMILE
        ================================================= */

        overlay.classList.add(
            "phase-5"
        );

        mutateCode(
            overlay,
            "smile"
        );


        await sleep(1500);


        /* ================================================
           PHASE 6 — SYSTEM CONTROL
        ================================================= */

        overlay.classList.add(
            "phase-final"
        );

        mutateCode(
            overlay,
            "control"
        );


        systemIntrusionController.phaseCursor();


        await sleep(800);


        /* ================================================
           CURSOR TRANSFER
        ================================================= */

        overlay.classList.add(
            "phase-cursor"
        );

        document.body.classList.add(
            "mrSmileCursorControlled"
        );


        cursorController =
            createControlledCursor();


        await runCursorControl(
            overlay,
            cursorController
        );


        /* ================================================
           SYSTEM TAKEOVER
        ================================================= */

        overlay.classList.add(
            "phase-7"
        );

        mutateCode(
            overlay,
            "takeover"
        );


        systemIntrusionController.phase7();


        await sleep(1800);


        /* ================================================
           CODE COLLAPSE
        ================================================= */

        mutateCode(
            overlay,
            "silence"
        );

        overlay.classList.add(
            "phase-silence"
        );


        systemIntrusionController.phaseSilence();


        await sleep(1800);


        /* ================================================
           FINAL LOOK
        ================================================= */

        overlay.classList.add(
            "phase-final"
        );


        systemIntrusionController.phaseFinal();


        await sleep(1200);


        /* ================================================
           RELEASE
        ================================================= */

        overlay.classList.add(
            "phase-release"
        );


        await sleep(900);


    } finally {

        destroyControlledCursor();

        if (systemIntrusionController) {

            systemIntrusionController.destroy();

            systemIntrusionController = null;
        }


        document.body.classList.remove(
            "mrSmileCursorControlled"
        );

        document.body.classList.remove(
            "mrSmileInterfaceCollapse"
        );


        overlay.remove();


        manifestationRunning = false;


        console.log(
            "[MR.SMILE APPEARANCE] FULL MANIFESTATION ENDED."
        );
    }
}


/* ==========================================================
   PUBLIC — FIRST CONTACT APPEARANCES
========================================================== */

export async function showMrSmileFirstContactFace(
    mode = "presence"
) {

    if (manifestationRunning) {

        console.log(
            "[MR.SMILE APPEARANCE] Another manifestation is running."
        );

        return;
    }


    manifestationRunning = true;


    console.log(
        `[MR.SMILE APPEARANCE] First Contact: ${mode}`
    );


    const overlay =
        createManifestation();


    try {

        switch (mode) {

            /* ============================================
               PRESENCE
            ============================================ */

            case "presence":

                await runPresenceAppearance(
                    overlay
                );

                break;


            /* ============================================
               ECHO
            ============================================ */

            case "echo":

                await runEchoAppearance(
                    overlay
                );

                break;


            /* ============================================
               SILENCE
            ============================================ */

            case "silence":

                await runSilenceAppearance(
                    overlay
                );

                break;


            default:

                console.warn(
                    "[MR.SMILE APPEARANCE] Unknown appearance mode:",
                    mode
                );

                await runPresenceAppearance(
                    overlay
                );

                break;
        }


    } finally {

        destroyControlledCursor();


        document.body.classList.remove(
            "mrSmileCursorControlled"
        );


        overlay.classList.add(
            "phase-release"
        );


        await sleep(250);


        overlay.remove();


        manifestationRunning = false;


        console.log(
            `[MR.SMILE APPEARANCE] ${mode} appearance ended.`
        );
    }
}


/* ==========================================================
   PRESENCE
========================================================== */

async function runPresenceAppearance(
    overlay
) {

    /*
       The screen should NOT immediately show the face.

       First:
       blackness
       ↓
       real OMEGA code
       ↓
       code flickers
       ↓
       eyes
       ↓
       face
       ↓
       smile
    */


    mutateCode(
        overlay,
        "initial"
    );


    overlay.classList.add(
        "phase-1"
    );


    await sleep(900);


    mutateCode(
        overlay,
        "presence"
    );


    overlay.classList.add(
        "phase-2"
    );


    await sleep(900);


    /*
       EYES
    */

    overlay.classList.add(
        "phase-3"
    );


    await sleep(1200);


    /*
       FACE
    */

    overlay.classList.add(
        "phase-4"
    );


    await sleep(1000);


    /*
       SMILE
    */

    mutateCode(
        overlay,
        "smile"
    );


    overlay.classList.add(
        "phase-5"
    );


    await sleep(1700);


    /*
       Small unnatural pause.
    */

    await sleep(700);


    /*
       MR.SMILE disappears,
       but not with a dramatic monster effect.
    */

    overlay.classList.add(
        "phase-release"
    );


    await sleep(600);
}


/* ==========================================================
   ECHO
========================================================== */

async function runEchoAppearance(
    overlay
) {

    /*
       Much shorter.

       This should feel like:

       "Was that really there?"
    */


    mutateCode(
        overlay,
        "presence"
    );


    overlay.classList.add(
        "phase-echo"
    );


    await sleep(700);


    overlay.classList.add(
        "phase-echo-look"
    );


    await sleep(1200);


    mutateCode(
        overlay,
        "smile"
    );


    overlay.classList.add(
        "phase-echo-smile"
    );


    await sleep(1300);


    /*
       Tiny delay before disappearance.
    */

    await sleep(400);


    overlay.classList.add(
        "phase-release"
    );


    await sleep(500);
}


/* ==========================================================
   SILENCE
========================================================== */

async function runSilenceAppearance(
    overlay
) {

    /*
       This is the most important short appearance.

       No glitch spam.
       No giant text.
       No monster transformation.

       Just:
       silence
       ↓
       face
       ↓
       stare
       ↓
       smile
       ↓
       darkness
    */


    mutateCode(
        overlay,
        "silence"
    );


    overlay.classList.add(
        "phase-last-eye"
    );


    await sleep(1000);


    overlay.classList.add(
        "phase-last-eye-look"
    );


    await sleep(1800);


    overlay.classList.add(
        "phase-last-eye-close"
    );


    await sleep(800);


    /*
       The smile remains for a moment.
    */

    mutateCode(
        overlay,
        "smile"
    );


    await sleep(1100);


    overlay.classList.add(
        "phase-release"
    );


    await sleep(700);
}


/* ==========================================================
   CONTROLLED VISUAL CURSOR
========================================================== */

function createControlledCursor() {

    const cursor =
        document.createElement("div");


    cursor.className =
        "mrSmileControlledCursor";


    cursor.innerHTML = `

        <span class="mrCursorArrow"></span>

        <span class="mrCursorCore"></span>

    `;


    document.body.appendChild(
        cursor
    );


    const state = {

        x:
            window.innerWidth / 2,

        y:
            window.innerHeight / 2,

        targetX:
            window.innerWidth / 2,

        targetY:
            window.innerHeight / 2,

        controlled:
            false,

        destroyed:
            false,

        frame:
            0
    };


    /*
       While not controlled,
       the visual cursor follows
       the real pointer.
    */

    const onMove = event => {

        state.targetX =
            event.clientX;

        state.targetY =
            event.clientY;


        if (!state.controlled) {

            state.x =
                event.clientX;

            state.y =
                event.clientY;
        }
    };


    window.addEventListener(
        "mousemove",
        onMove,
        true
    );


    function render() {

        if (state.destroyed)
            return;


        const smoothing =
            state.controlled
                ? 0.075
                : 0.45;


        state.x +=
            (
                state.targetX -
                state.x
            ) * smoothing;


        state.y +=
            (
                state.targetY -
                state.y
            ) * smoothing;


        cursor.style.transform =
            `translate3d(${state.x}px, ${state.y}px, 0)`;


        state.frame =
            requestAnimationFrame(
                render
            );
    }


    state.frame =
        requestAnimationFrame(
            render
        );


    return {

        state,


        setControlled(value) {

            state.controlled =
                value;
        },


        setTarget(x, y) {

            state.targetX =
                x;

            state.targetY =
                y;
        },


        destroy() {

            if (state.destroyed)
                return;


            state.destroyed =
                true;


            cancelAnimationFrame(
                state.frame
            );


            window.removeEventListener(
                "mousemove",
                onMove,
                true
            );


            cursor.remove();
        }
    };
}


/* ==========================================================
   RUN CURSOR CONTROL
========================================================== */

async function runCursorControl(
    overlay,
    controller
) {

    if (!controller)
        return;


    const state =
        controller.state;


    /*
       Let the player use the cursor
       normally for a short moment.
    */

    controller.setControlled(
        false
    );


    await sleep(1800);


    /*
       TRANSFER
    */

    overlay.classList.add(
        "cursor-transfer"
    );


    controller.setControlled(
        true
    );


    /*
       Freeze at the exact current location.
    */

    controller.setTarget(
        state.x,
        state.y
    );


    await sleep(1300);


    /*
       LOCK
    */

    overlay.classList.add(
        "cursor-locked"
    );


    await sleep(900);


    /*
       SELF MOVEMENT
    */

    overlay.classList.add(
        "cursor-self-move"
    );


    const centerX =
        window.innerWidth * 0.50;

    const centerY =
        window.innerHeight * 0.49;


    /*
       Move left.
    */

    controller.setTarget(
        centerX - 120,
        centerY - 20
    );


    await sleep(1100);


    /*
       Move right.
    */

    controller.setTarget(
        centerX + 120,
        centerY - 15
    );


    await sleep(1000);


    /*
       Return to center.
    */

    controller.setTarget(
        centerX + 15,
        centerY + 10
    );


    await sleep(1000);


    /*
       Approach the left eye.
    */

    overlay.classList.add(
        "cursor-at-eye"
    );


    controller.setTarget(
        centerX - 105,
        centerY - 35
    );


    await sleep(1800);


    /*
       MR.SMILE notices the cursor.
    */

    overlay.classList.add(
        "cursor-noticed"
    );


    await sleep(1300);


    /*
       Suddenly move away.
    */

    controller.setTarget(
        window.innerWidth * 0.17,
        window.innerHeight * 0.80
    );


    await sleep(1000);


    /*
       RETURN CONTROL TO PLAYER
    */

    overlay.classList.add(
        "cursor-return"
    );


    controller.setControlled(
        false
    );


    state.x =
        state.targetX;

    state.y =
        state.targetY;


    await sleep(800);


    overlay.classList.remove(

        "cursor-transfer",

        "cursor-locked",

        "cursor-self-move",

        "cursor-at-eye",

        "cursor-noticed",

        "cursor-return"

    );
}


/* ==========================================================
   DESTROY CURSOR
========================================================== */

function destroyControlledCursor() {

    if (!cursorController)
        return;


    cursorController.destroy();


    cursorController =
        null;
}


/* ==========================================================
   CREATE MANIFESTATION
========================================================== */

function createManifestation() {

    const existing =
        document.getElementById(
            "mrSmileManifestation"
        );


    if (existing)
        existing.remove();


    const overlay =
        document.createElement("div");


    overlay.id =
        "mrSmileManifestation";


    overlay.innerHTML = `

        <!-- ==========================================
             OMEGA CODE
        =========================================== -->

        <div class="mrSmileUIFragments">

            <pre
                class="mrSmileFragment fragment-top"
                data-code="top"
            >import {
    trigger,
    on,
    once
} from "./eventManager.js";</pre>


            <pre
                class="mrSmileFragment fragment-left"
                data-code="left"
            >import {
    showMrSmileFirstContactFace
} from "./mrsmileAppearance.js";</pre>


            <pre
                class="mrSmileFragment fragment-right"
                data-code="right"
            >const overlay =
    document.createElement("div");

overlay.id =
    "mrSmileManifestation";</pre>


            <pre
                class="mrSmileFragment fragment-bottom"
                data-code="bottom"
            >document.body.classList.add(
    "mrSmileFirstContact"
);

await showMrSmileFirstContactFace();</pre>


            <pre
                class="mrSmileFragment fragment-code code-1"
                data-code="code1"
            >if (manifestationRunning)
    return;</pre>


            <pre
                class="mrSmileFragment fragment-code code-2"
                data-code="code2"
            >document.body.classList.add(
    "mrSmileInterfaceCollapse"
);</pre>


            <pre
                class="mrSmileFragment fragment-code code-3"
                data-code="code3"
            >const state = {
    controlled: false,
    targetX,
    targetY
};</pre>


            <pre
                class="mrSmileFragment fragment-code code-4"
                data-code="code4"
            >window.addEventListener(
    "mousemove",
    onMove,
    true
);</pre>


            <pre
                class="mrSmileFragment fragment-code code-5"
                data-code="code5"
            >controller.setControlled(
    true
);</pre>


            <div
                class="mrSmileFragment fragment-line line-1"
            ></div>

            <div
                class="mrSmileFragment fragment-line line-2"
            ></div>

            <div
                class="mrSmileFragment fragment-line line-3"
            ></div>

            <div
                class="mrSmileFragment fragment-line line-4"
            ></div>

            <div
                class="mrSmileFragment fragment-line line-5"
            ></div>

        </div>


        <!-- ==========================================
             MR.SMILE FACE
        =========================================== -->

        <div class="mrSmileFace">

            <div class="mrSmileFaceFrame"></div>


            <div class="mrSmileEye eye-left">

                <span class="eyeCore"></span>

            </div>


            <div class="mrSmileEye eye-right">

                <span class="eyeCore"></span>

            </div>


            <div class="mrSmileMouth">

                <div class="mouthOuter"></div>

                <div class="mouthInner"></div>

                <div class="mouthBreak mouthBreak-1"></div>

                <div class="mouthBreak mouthBreak-2"></div>

            </div>


            <div class="mrSmileFaceScan"></div>

        </div>


        <!-- ==========================================
             SYSTEM SIGNAL
        =========================================== -->

        <div class="mrSmileSignal">

            <span class="signalNormal">
                CONNECTION: ACTIVE
            </span>

            <span class="signalControl">
                CURSOR CONTROL: TRANSFERRED
            </span>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    return overlay;
}


/* ==========================================================
   CODE MUTATION
========================================================== */

function mutateCode(
    overlay,
    mode
) {

    if (!overlay)
        return;


    const fragments =
        overlay.querySelectorAll(
            ".mrSmileFragment[data-code]"
        );


    const codeMap = {

        initial: {

            top:
`import {
    trigger,
    on,
    once
} from "./eventManager.js";`,

            left:
`import {
    showMrSmileFirstContactFace
} from "./mrsmileAppearance.js";`,

            right:
`const overlay =
    document.createElement("div");`,

            bottom:
`document.body.classList.add(
    "mrSmileFirstContact"
);`,

            code1:
`if (manifestationRunning)
    return;`,

            code2:
`document.body.classList.add(
    "mrSmileInterfaceCollapse"
);`,

            code3:
`const state = {
    controlled: false
};`,

            code4:
`window.addEventListener(
    "mousemove",
    onMove,
    true
);`,

            code5:
`controller.setControlled(
    false
);`
        },


        corruption: {

            top:
`import {
    trigger,
    on,
    once
} from "./eventManager.js";

...`,

            left:
`import {
    showMrSmileFirstContactFace
} from "./mrsmileAppearance.js";

...`,

            right:
`const overlay =
    document.createElement("div");

overlay.id =
    "mrSmileManifestation";`,

            bottom:
`document.body.classList.add(
    "mrSmileFirstContact"
);

await showMrSmileFirstContactFace();`,

            code1:
`if (manifestationRunning)
    return;

    ...`,

            code2:
`document.body.classList.add(
    "mrSmileInterfaceCollapse"
);

...`,

            code3:
`const state = {
    controlled: false,
    targetX,
    targetY
};`,

            code4:
`window.addEventListener(
    "mousemove",
    onMove,
    true
);

...`,

            code5:
`controller.setControlled(
    false
);`
        },


        presence: {

            top:
`import {
    trigger,
    on,
    once
} from "./eventManager.js";

await ...`,

            left:
`showMrSmileFirstContactFace(
    "presence"
);`,

            right:
`const overlay =
    document.createElement("div");

overlay.id =
    "mrSmileManifestation";`,

            bottom:
`document.body.classList.add(
    "mrSmilePhase3"
);

...`,

            code1:
`if (manifestationRunning)
    return;`,

            code2:
`document.body.classList.add(
    "mrSmileInterfaceCollapse"
);`,

            code3:
`const state = {
    controlled: false
};`,

            code4:
`window.addEventListener(
    "mousemove",
    onMove,
    true
);`,

            code5:
`controller.setControlled(
    false
);`
        },


        intrusion: {

            top:
`trigger(
    "mrsmile:firstContact"
);

...`,

            left:
`showMrSmileFirstContactFace(
    "presence"
);

...`,

            right:
`overlay.classList.add(
    "phase-4"
);`,

            bottom:
`document.body.classList.add(
    "mrSmilePhase4"
);`,

            code1:
`if (firstContactRunning)
    return;`,

            code2:
`document.body.classList.add(
    "mrSmileSevereGlitch"
);`,

            code3:
`const process =
    "UNKNOWN";`,

            code4:
`typeSystemMessage(
    "UNKNOWN PROCESS DETECTED."
);`,

            code5:
`controller.setControlled(
    false
);`
        },


        smile: {

            top:
`await showMrSmileFirstContactFace(
    "presence"
);

...`,

            left:
`overlay.classList.add(
    "phase-5"
);`,

            right:
`const mouth =
    overlay.querySelector(
        ".mrSmileMouth"
    );`,

            bottom:
`document.body.classList.add(
    "mrSmilePhase5"
);`,

            code1:
`if (manifestationRunning)
    return;`,

            code2:
`mrSmileInterfaceCollapse
    = true;`,

            code3:
`const smile =
    "..." ;`,

            code4:
`// ...`,

            code5:
`controller.setControlled(
    false
);`
        },


        control: {

            top:
`const controller =
    createControlledCursor();`,

            left:
`controller.setControlled(
    true
);`,

            right:
`overlay.classList.add(
    "cursor-transfer"
);`,

            bottom:
`CURSOR CONTROL:
TRANSFERRED`,

            code1:
`if (!controller)
    return;`,

            code2:
`state.controlled =
    true;`,

            code3:
`targetX =
    window.innerWidth * .50;`,

            code4:
`targetY =
    window.innerHeight * .49;`,

            code5:
`controller.setTarget(
    targetX,
    targetY
);`
        },


        takeover: {

            top:
`SYSTEM CONTROL:
PARTIAL

...`,

            left:
`REMOTE SESSION:
ACTIVE`,

            right:
`controller.setControlled(
    true
);`,

            bottom:
`document.body.classList.add(
    "mrSmileInterfaceCollapse"
);`,

            code1:
`SYSTEM CONTROL:
FULL;`,

            code2:
`OMEGA RESPONSE:
FAILED;`,

            code3:
`TERMINATION REQUEST
IGNORED;`,

            code4:
`REMOTE SESSION:
ACTIVE;`,

            code5:
`...`
        },


        silence: {

            top:
`...`,

            left:
`...`,

            right:
`...`,

            bottom:
`...`,

            code1:
`...`,

            code2:
`...`,

            code3:
`...`,

            code4:
`...`,

            code5:
`...`
        }
    };


    const selected =
        codeMap[mode] ||
        codeMap.initial;


    fragments.forEach(
        fragment => {

            const key =
                fragment.dataset.code;


            if (
                selected[key] !== undefined
            ) {

                fragment.textContent =
                    selected[key];
            }
        }
    );


    /*
       Visual corruption class.
    */

    overlay.dataset.codeState =
        mode;
}


/* ==========================================================
   SYSTEM INTRUSION CONTROLLER
========================================================== */

function createSystemIntrusionController() {

    const activity =
        document.createElement("div");


    activity.className =
        "mrSmileSystemActivity";


    activity.innerHTML = `

        <div class="mrSmileActivityLine"></div>


        <div class="mrSmileActivityText">

            <span class="activityLabel">
                SYSTEM
            </span>

            <span class="activityValue">
                NORMAL
            </span>

        </div>


        <div class="mrSmileActivityText">

            <span class="activityLabel">
                REMOTE ACCESS
            </span>

            <span class="activityValue">
                NONE
            </span>

        </div>


        <div class="mrSmileActivityText">

            <span class="activityLabel">
                UNKNOWN PROCESS
            </span>

            <span class="activityValue">
                0
            </span>

        </div>

    `;


    document.body.appendChild(
        activity
    );


    function setStatus(
        label,
        value
    ) {

        const rows =
            activity.querySelectorAll(
                ".mrSmileActivityText"
            );


        rows.forEach(
            row => {

                const labelElement =
                    row.querySelector(
                        ".activityLabel"
                    );


                const valueElement =
                    row.querySelector(
                        ".activityValue"
                    );


                if (
                    labelElement &&
                    valueElement &&
                    labelElement.textContent.trim()
                        === label
                ) {

                    valueElement.textContent =
                        value;
                }
            }
        );
    }


    function flashActivity() {

        activity.classList.remove(
            "activityPulse"
        );


        void activity.offsetWidth;


        activity.classList.add(
            "activityPulse"
        );
    }


    function message(
        text
    ) {

        /*
           mrsmileEvents.js imports
           typeSystemMessage directly.

           We intentionally don't import
           mrsmileChat.js here to avoid
           creating an unnecessary circular
           dependency.
        */

        if (
            typeof window.typeSystemMessage
                === "function"
        ) {

            window.typeSystemMessage(
                text
            );

            return;
        }


        /*
           Fallback for projects where
           the function is globally exposed
           under a different scope.
        */

        console.log(
            "[MR.SMILE SYSTEM]",
            text
        );
    }


    return {

        phase1() {

            setStatus(
                "REMOTE ACCESS",
                "REQUEST"
            );


            setStatus(
                "UNKNOWN PROCESS",
                "1"
            );


            flashActivity();


            message(
                "REMOTE ACCESS REQUESTED."
            );
        },


        phase2() {

            setStatus(
                "REMOTE ACCESS",
                "DENIED"
            );


            flashActivity();


            message(
                "ACCESS REQUEST: DENIED."
            );


            setTimeout(
                () => {

                    setStatus(
                        "REMOTE ACCESS",
                        "ACCEPTED"
                    );


                    flashActivity();


                    message(
                        "ACCESS REQUEST: ACCEPTED."
                    );

                },
                1800
            );
        },


        phase3() {

            setStatus(
                "UNKNOWN PROCESS",
                "1"
            );


            flashActivity();


            message(
                "UNKNOWN PROCESS DETECTED."
            );


            setTimeout(
                () => {

                    message(
                        "PROCESS ORIGIN: UNKNOWN."
                    );

                },
                1200
            );


            setTimeout(
                () => {

                    message(
                        "PROCESS PERMISSIONS: ELEVATED."
                    );

                },
                2600
            );
        },


        phase4() {

            setStatus(
                "REMOTE ACCESS",
                "ACTIVE"
            );


            flashActivity();


            message(
                "REMOTE SESSION INITIALIZED."
            );


            setTimeout(
                () => {

                    message(
                        "SECURITY CHANNEL: BYPASSED."
                    );

                },
                1400
            );


            setTimeout(
                () => {

                    message(
                        "LOCAL AUTHORIZATION: IGNORED."
                    );

                },
                2900
            );
        },


        phase5() {

            flashActivity();


            message(
                "SYSTEM CONTROL: PARTIAL."
            );


            setTimeout(
                () => {

                    message(
                        "WINDOW CONTROL: REMOTE."
                    );

                },
                1300
            );


            setTimeout(
                () => {

                    message(
                        "INPUT MONITORING: ACTIVE."
                    );

                },
                2700
            );
        },


        phaseCursor() {

            setStatus(
                "REMOTE ACCESS",
                "FULL"
            );


            flashActivity();


            message(
                "CURSOR CONTROL REQUESTED."
            );


            setTimeout(
                () => {

                    message(
                        "CURSOR CONTROL: TRANSFERRED."
                    );

                },
                1800
            );
        },


        phase6() {

            flashActivity();


            message(
                "SECURITY DATABASE: ACCESSING."
            );


            setTimeout(
                () => {

                    message(
                        "SECURITY DATABASE: ACCESS GRANTED."
                    );

                },
                1500
            );


            setTimeout(
                () => {

                    message(
                        "ARCHIVE INDEX: READING."
                    );

                },
                3000
            );


            setTimeout(
                () => {

                    message(
                        "RESTRICTED CHANNEL: OPEN."
                    );

                },
                4700
            );
        },


        phase7() {

            setStatus(
                "UNKNOWN PROCESS",
                "1"
            );


            setStatus(
                "REMOTE ACCESS",
                "FULL"
            );


            flashActivity();


            message(
                "SYSTEM CONTROL: FULL."
            );


            setTimeout(
                () => {

                    message(
                        "OMEGA RESPONSE: FAILED."
                    );

                },
                1500
            );


            setTimeout(
                () => {

                    message(
                        "TERMINATION REQUEST SENT."
                    );

                },
                3200
            );


            setTimeout(
                () => {

                    message(
                        "TERMINATION REQUEST: IGNORED."
                    );

                },
                5200
            );
        },


        phaseSilence() {

            activity.classList.add(
                "activitySilence"
            );


            setStatus(
                "REMOTE ACCESS",
                "UNKNOWN"
            );


            setStatus(
                "UNKNOWN PROCESS",
                "—"
            );
        },


        phaseFinal() {

            message(
                "REMOTE SESSION: ACTIVE."
            );


            setTimeout(
                () => {

                    message(
                        "REMOTE SESSION: CLOSED."
                    );

                },
                1800
            );


            setTimeout(
                () => {

                    setStatus(
                        "REMOTE ACCESS",
                        "NONE"
                    );

                },
                2300
            );
        },


        destroy() {

            if (
                activity &&
                activity.parentNode
            ) {

                activity.remove();
            }
        }
    };
}


/* ==========================================================
   SLEEP
========================================================== */

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}
