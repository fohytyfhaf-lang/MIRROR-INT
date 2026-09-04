/* ==========================================================
   MR.SMILE — OMEGA INTERFACE MANIFESTATION
   FULL VISUAL SYSTEM
========================================================== */

let manifestationRunning = false;
let firstContactAppearanceCount = 0;

let cursorController = null;
let systemIntrusionController = null;


/* ==========================================================
   NORMAL MANIFESTATION
========================================================== */

export async function triggerMrSmileManifestation() {

    if (manifestationRunning) return;

    manifestationRunning = true;

    const overlay = createManifestation();

    systemIntrusionController =
        createSystemIntrusionController(overlay);

    document.body.classList.add(
        "mrSmileInterfaceCollapse"
    );

    try {

        /* ------------------------------------------
           PHASE 1
           OMEGA code begins appearing
        ------------------------------------------ */

        await sleep(500);

        overlay.classList.add("phase-1");

        await sleep(700);


        /* ------------------------------------------
           PHASE 2
           Code becomes unstable
        ------------------------------------------ */

        overlay.classList.add("phase-2");

        mutateCode(overlay, "corruption");

        await sleep(900);


        /* ------------------------------------------
           PHASE 3
           Eyes
        ------------------------------------------ */

        overlay.classList.add("phase-3");

        await sleep(1100);


        /* ------------------------------------------
           PHASE 4
           Face becomes recognizable
        ------------------------------------------ */

        overlay.classList.add("phase-4");

        await sleep(1100);


        /* ------------------------------------------
           PHASE 5
           Smile
        ------------------------------------------ */

        overlay.classList.add("phase-5");

        mutateCode(overlay, "smile");

        await sleep(900);


        /* ------------------------------------------
           FINAL
        ------------------------------------------ */

        overlay.classList.add("phase-final");

        await sleep(350);

        overlay.classList.add("phase-release");

        await sleep(500);

    } finally {

        destroyControlledCursor();

        if (systemIntrusionController) {
            systemIntrusionController.destroy();
            systemIntrusionController = null;
        }

        overlay.remove();

        document.body.classList.remove(
            "mrSmileInterfaceCollapse"
        );

        document.body.classList.remove(
            "mrSmileCursorControlled"
        );

        manifestationRunning = false;
    }
}


/* ==========================================================
   FIRST CONTACT
   LONG MANIFESTATION
========================================================== */

export async function showMrSmileFirstContactFace() {

    if (manifestationRunning) return;

    manifestationRunning = true;

    firstContactAppearanceCount++;

    const appearance =
        firstContactAppearanceCount;

    const overlay = createManifestation();

    systemIntrusionController =
        createSystemIntrusionController(overlay);

    document.body.classList.add(
        "mrSmileInterfaceCollapse"
    );

    document.body.classList.add(
        "mrSmileCursorControlled"
    );

    try {

        /* ==================================================
           FIRST APPEARANCE
        ================================================== */

        if (appearance === 1) {

            /* ------------------------------------------
               NOTHING
               The system is still normal.
            ------------------------------------------ */

            await sleep(18000);


            /* ------------------------------------------
               PHASE 1
               First code fragments
            ------------------------------------------ */

            overlay.classList.add("phase-1");

            systemIntrusionController.phase1();

            mutateCode(
                overlay,
                "initial"
            );

            await sleep(2000);


            /* ------------------------------------------
               PHASE 2
               Code starts corrupting
            ------------------------------------------ */

            overlay.classList.add("phase-2");

            systemIntrusionController.phase2();

            mutateCode(
                overlay,
                "corruption"
            );

            await sleep(25000);


            /* ------------------------------------------
               PHASE 3
               First eyes
            ------------------------------------------ */

            overlay.classList.add("phase-3");

            systemIntrusionController.phase3();

            mutateCode(
                overlay,
                "presence"
            );

            await sleep(25000);


            /* ------------------------------------------
               PHASE 4
               Face becomes recognizable
            ------------------------------------------ */

            overlay.classList.add("phase-4");

            systemIntrusionController.phase4();

            mutateCode(
                overlay,
                "intrusion"
            );

            await sleep(20000);


            /* ------------------------------------------
               PHASE 5
               Smile appears
            ------------------------------------------ */

            overlay.classList.add("phase-5");

            systemIntrusionController.phase5();

            mutateCode(
                overlay,
                "control"
            );

            await sleep(20000);


            /* ------------------------------------------
               CURSOR
            ------------------------------------------ */

            overlay.classList.add(
                "phase-cursor"
            );

            systemIntrusionController.phaseCursor();

            cursorController =
                createControlledCursor();

            await runCursorControl(
                overlay,
                cursorController
            );

            destroyControlledCursor();


            /* ------------------------------------------
               PHASE 6
               Observation
            ------------------------------------------ */

            systemIntrusionController.phase6();

            overlay.classList.add("phase-6");

            mutateCode(
                overlay,
                "access"
            );

            await sleep(20000);


            /* ------------------------------------------
               PHASE 7
               FULL CONTROL
            ------------------------------------------ */

            overlay.classList.add("phase-7");

            systemIntrusionController.phase7();

            mutateCode(
                overlay,
                "takeover"
            );

            await sleep(15000);


            /* ------------------------------------------
               SILENCE
            ------------------------------------------ */

            systemIntrusionController.phaseSilence();

            overlay.classList.add(
                "phase-silence"
            );

            mutateCode(
                overlay,
                "silence"
            );

            await sleep(10000);


            /* ------------------------------------------
               FINAL
            ------------------------------------------ */

            systemIntrusionController.phaseFinal();

            overlay.classList.add(
                "phase-final"
            );

            await sleep(5000);


            /* ------------------------------------------
               RELEASE
            ------------------------------------------ */

            overlay.classList.add(
                "phase-release"
            );

            await sleep(1200);
        }


        /* ==================================================
           SECOND APPEARANCE
        ================================================== */

        else if (appearance === 2) {

            overlay.classList.add(
                "phase-echo"
            );

            await sleep(1500);


            overlay.classList.add(
                "phase-echo-look"
            );

            await sleep(2500);


            overlay.classList.add(
                "phase-echo-smile"
            );

            await sleep(3000);


            overlay.classList.add(
                "phase-release"
            );

            await sleep(1000);
        }


        /* ==================================================
           LATER APPEARANCES
        ================================================== */

        else {

            overlay.classList.add(
                "phase-last-eye"
            );

            await sleep(1800);


            overlay.classList.add(
                "phase-last-eye-look"
            );

            await sleep(3000);


            overlay.classList.add(
                "phase-last-eye-close"
            );

            await sleep(1800);


            overlay.classList.add(
                "phase-release"
            );

            await sleep(900);
        }

    } finally {

        destroyControlledCursor();

        if (systemIntrusionController) {
            systemIntrusionController.destroy();
            systemIntrusionController = null;
        }

        document.body.classList.remove(
            "mrSmileInterfaceCollapse"
        );

        document.body.classList.remove(
            "mrSmileCursorControlled"
        );

        overlay.remove();

        manifestationRunning = false;

        console.log(
            `[MR.SMILE] FIRST CONTACT APPEARANCE #${appearance} ENDED`
        );
    }
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

    document.body.appendChild(cursor);


    const state = {

        x: window.innerWidth / 2,
        y: window.innerHeight / 2,

        targetX: window.innerWidth / 2,
        targetY: window.innerHeight / 2,

        controlled: false,

        destroyed: false,

        frame: 0
    };


    /* ------------------------------------------
       NORMAL MOUSE
    ------------------------------------------ */

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


    /* ------------------------------------------
       RENDER
    ------------------------------------------ */

    function render() {

        if (state.destroyed) return;

        const smoothing =
            state.controlled
                ? 0.075
                : 0.45;

        state.x +=
            (state.targetX - state.x)
            * smoothing;

        state.y +=
            (state.targetY - state.y)
            * smoothing;

        cursor.style.transform =
            `translate3d(${state.x}px, ${state.y}px, 0)`;


        state.frame =
            requestAnimationFrame(render);
    }


    state.frame =
        requestAnimationFrame(render);


    return {

        state,

        setControlled(value) {

            state.controlled =
                value;
        },

        setTarget(x, y) {

            state.targetX = x;
            state.targetY = y;
        },

        destroy() {

            state.destroyed = true;

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
   CURSOR CONTROL SEQUENCE
========================================================== */

async function runCursorControl(
    overlay,
    controller
) {

    if (!controller) return;

    const state =
        controller.state;


    /* ------------------------------------------
       Cursor initially normal
    ------------------------------------------ */

    controller.setControlled(false);

    await sleep(2200);


    /* ------------------------------------------
       TRANSFER
    ------------------------------------------ */

    overlay.classList.add(
        "cursor-transfer"
    );

    controller.setControlled(true);


    /*
       Keep current cursor position.
       It suddenly stops responding normally.
    */

    controller.setTarget(
        state.x,
        state.y
    );

    await sleep(1800);


    /* ------------------------------------------
       LOCK
    ------------------------------------------ */

    overlay.classList.add(
        "cursor-locked"
    );

    await sleep(2200);


    /* ------------------------------------------
       SELF MOVEMENT
    ------------------------------------------ */

    overlay.classList.add(
        "cursor-self-move"
    );


    const centerX =
        window.innerWidth * 0.50;

    const centerY =
        window.innerHeight * 0.49;


    /* Move left */

    controller.setTarget(
        centerX - 120,
        centerY - 20
    );

    await sleep(1500);


    /* Move right */

    controller.setTarget(
        centerX + 120,
        centerY - 15
    );

    await sleep(1300);


    /* Move toward center */

    controller.setTarget(
        centerX + 20,
        centerY + 10
    );

    await sleep(1300);


    /* ------------------------------------------
       CURSOR APPROACHES EYE
    ------------------------------------------ */

    overlay.classList.add(
        "cursor-at-eye"
    );


    controller.setTarget(
        centerX - 105,
        centerY - 35
    );

    await sleep(2400);


    /* ------------------------------------------
       MR.SMILE NOTICES IT
    ------------------------------------------ */

    overlay.classList.add(
        "cursor-noticed"
    );

    await sleep(1800);


    /* ------------------------------------------
       CURSOR ESCAPES
    ------------------------------------------ */

    controller.setTarget(
        window.innerWidth * 0.17,
        window.innerHeight * 0.80
    );

    await sleep(1200);


    /* ------------------------------------------
       CONTROL RETURN
    ------------------------------------------ */

    overlay.classList.add(
        "cursor-return"
    );

    controller.setControlled(false);


    state.x =
        state.targetX;

    state.y =
        state.targetY;


    await sleep(1200);


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

    if (!cursorController) return;

    cursorController.destroy();

    cursorController = null;
}


/* ==========================================================
   CREATE MANIFESTATION
========================================================== */

function createManifestation() {

    const existing =
        document.getElementById(
            "mrSmileManifestation"
        );

    if (existing) {
        existing.remove();
    }


    const overlay =
        document.createElement("div");

    overlay.id =
        "mrSmileManifestation";


    /* ======================================================
       IMPORTANT

       These are deliberately incomplete fragments.

       They are taken from the actual architecture of
       your OMEGA system rather than generic horror text.
    ====================================================== */

    overlay.innerHTML = `

        <div class="mrSmileUIFragments">

            <!-- ==========================================
                 TOP
            =========================================== -->

            <pre class="mrSmileFragment fragment-top"
data-code="top">
document.addEventListener("DOMContent...
            </pre>


            <!-- ==========================================
                 LEFT
            =========================================== -->

            <pre class="mrSmileFragment fragment-left"
data-code="left">
import { initMrSmileEvents } from "./mr...
            </pre>


            <!-- ==========================================
                 RIGHT
            =========================================== -->

            <pre class="mrSmileFragment fragment-right"
data-code="right">
window.MRSMILE = {
    start: forceEnable...
            </pre>


            <!-- ==========================================
                 BOTTOM
            =========================================== -->

            <pre class="mrSmileFragment fragment-bottom"
data-code="bottom">
applySettings();
initCamera();
initResearch();
...
            </pre>


            <!-- ==========================================
                 SMALL CODE 1
            =========================================== -->

            <pre class="mrSmileFragment fragment-code code-1"
data-code="code1">
const overlay = document.getElementById("...
            </pre>


            <!-- ==========================================
                 SMALL CODE 2
            =========================================== -->

            <pre class="mrSmileFragment fragment-code code-2"
data-code="code2">
document.body.classList.remove("hidden");
            </pre>


            <!-- ==========================================
                 SMALL CODE 3
            =========================================== -->

            <pre class="mrSmileFragment fragment-code code-3"
data-code="code3">
if (!manifestationRunning) {
    manifestation...
            </pre>


            <!-- ==========================================
                 SMALL CODE 4
            =========================================== -->

            <pre class="mrSmileFragment fragment-code code-4"
data-code="code4">
window.addEventListener("mousemove", onMove...
            </pre>


            <!-- ==========================================
                 SMALL CODE 5
            =========================================== -->

            <pre class="mrSmileFragment fragment-code code-5"
data-code="code5">
controller.setControlled(false);
            </pre>


            <!-- ==========================================
                 SYSTEM LINES
            =========================================== -->

            <div class="mrSmileFragment fragment-line line-1"></div>

            <div class="mrSmileFragment fragment-line line-2"></div>

            <div class="mrSmileFragment fragment-line line-3"></div>

            <div class="mrSmileFragment fragment-line line-4"></div>

            <div class="mrSmileFragment fragment-line line-5"></div>

        </div>


        <!-- =================================================
             FACE
        ================================================== -->

        <div class="mrSmileFace">

            <div class="mrSmileEye eye-left">

                <span class="eyeCore"></span>

            </div>


            <div class="mrSmileEye eye-right">

                <span class="eyeCore"></span>

            </div>


            <div class="mrSmileFaceFrame"></div>


            <div class="mrSmileMouth">

                <div class="mouthOuter"></div>

                <div class="mouthInner"></div>

                <div class="mouthBreak mouthBreak-1"></div>

                <div class="mouthBreak mouthBreak-2"></div>

            </div>


            <div class="mrSmileFaceScan"></div>

        </div>


        <!-- =================================================
             SIGNAL
        ================================================== -->

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
   CODE MUTATION SYSTEM
========================================================== */

function mutateCode(
    overlay,
    mode
) {

    if (!overlay) return;


    const fragments =
        overlay.querySelectorAll(
            ".mrSmileFragment"
        );


    const codeMap = {

        initial: {

            top:
`document.addEventListener("DOMContent...`,

            left:
`initMrSmileEvents();
initChatEvents();
...`,

            right:
`window.MRSMILE = {
    start: forceEnable...`,

            bottom:
`applySettings();
initCamera();
initResearch();
...`,

            code1:
`const overlay = document.getElementById("...`,

            code2:
`document.body.classList.remove("hidden");`,

            code3:
`if (!manifestationRunning) {
    manifestation...`,

            code4:
`window.addEventListener("mousemove", onMove...`,

            code5:
`controller.setControlled(false);`
        },


        corruption: {

            top:
`document.addEventListener("DOMContent...`,

            left:
`initMrSmileEvents();
initChatEvents();
...`,

            right:
`window.MRSMILE = {
    start: forceEnable...
    ...`,

            bottom:
`applySettings();
initCamera();
initResearch();
    ...`,

            code1:
`const overlay = document.getElementById("...`,

            code2:
`document.body.classList.remove("hid...`,

            code3:
`if (!manifestationRunning) {
    manifest...`,

            code4:
`window.addEventListener("mousemove", onMove...`,

            code5:
`controller.setControlled(false);`
        },


        presence: {

            top:
`document.addEventListener("DOMContent...`,

            left:
`initMrSmileEvents();
initChatEvents();
...`,

            right:
`window.MRSMILE = {
    start: forceEnable...
    ...`,

            bottom:
`applySettings();
initCamera();
initResearch();
...`,

            code1:
`const overlay = document.getElementById("...`,

            code2:
`document.body.classList.remove("hid...`,

            code3:
`if (!manifestationRunning) {
    manifestation...`,

            code4:
`window.addEventListener("mousemove", onMove...`,

            code5:
`controller.setControlled(false);`
        },


        intrusion: {

            top:
`document.addEventListener("DOMContent...`,

            left:
`initMrSmileEvents();
initChatEvents();
...`,

            right:
`window.MRSMILE = {
    start: forceEnable...
    ...`,

            bottom:
`applySettings();
initCamera();
initResearch();
...`,

            code1:
`const overlay = document.getElementById("...`,

            code2:
`document.body.classList.remove("hidden");`,

            code3:
`if (!manifestationRunning) {
    manifestation...`,

            code4:
`window.addEventListener("mousemove", onMove...`,

            code5:
`controller.setControlled(false);`
        },


        smile: {

            top:
`document.addEventListener("DOMContent...`,

            left:
`initMrSmileEvents();
initChatEvents();
...`,

            right:
`window.MRSMILE = {
    start: forceEnable...
    ...`,

            bottom:
`applySettings();
initCamera();
initResearch();
...`,

            code1:
`const overlay = document.getElementById("...`,

            code2:
`document.body.classList.remove("hidden");`,

            code3:
`if (!manifestationRunning) {
    manifestation...`,

            code4:
`window.addEventListener("mousemove", onMove...`,

            code5:
`controller.setControlled(false);`
        },


        control: {

            top:
`document.addEventListener("DOMContent...`,

            left:
`initMrSmileEvents();
initChatEvents();
...`,

            right:
`window.MRSMILE = {
    start: forceEnable...
    ...`,

            bottom:
`applySettings();
initCamera();
initResearch();
...`,

            code1:
`controller.setControlled(false);`,

            code2:
`controller.setTarget(state.x, state.y);`,

            code3:
`state.controlled = true;`,

            code4:
`controller.setControlled(true);`,

            code5:
`controller.setControlled(false);`
        },


        access: {

            top:
`document.addEventListener("DOMContent...`,

            left:
`initMrSmileEvents();
initChatEvents();
...`,

            right:
`window.MRSMILE = {
    start: forceEnable...
    ...`,

            bottom:
`applySettings();
initCamera();
initResearch();
...`,

            code1:
`securityDatabase.access();`,

            code2:
`archiveIndex.read();`,

            code3:
`restrictedChannel.open();`,

            code4:
`localAuthorization = ignored;`,

            code5:
`remoteAccess = "FULL";`
        },


        takeover: {

            top:
`document.addEventListener("DOMContent...`,

            left:
`initMrSmileEvents();
initChatEvents();
...`,

            right:
`window.MRSMILE = {
    start: forceEnable...
    ...`,

            bottom:
`applySettings();
initCamera();
initResearch();
...`,

            code1:
`controller.setControlled(true);`,

            code2:
`systemControl = "FULL";`,

            code3:
`omegaResponse = false;`,

            code4:
`terminationRequest = ignored;`,

            code5:
`remoteSession = "ACTIVE";`
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
        codeMap[mode];

    if (!selected) return;


    fragments.forEach(
        fragment => {

            const key =
                fragment.dataset.code;

            if (
                !key ||
                selected[key] === undefined
            ) {
                return;
            }


            fragment.textContent =
                selected[key];
        }
    );
}


/* ==========================================================
   SYSTEM INTRUSION
========================================================== */

function createSystemIntrusionController(
    overlay
) {

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


    /* ======================================================
       STATUS
    ====================================================== */

    function setStatus(
        label,
        value
    ) {

        const rows =
            activity.querySelectorAll(
                ".mrSmileActivityText"
            );


        rows.forEach(row => {

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
        });
    }


    /* ======================================================
       FLASH
    ====================================================== */

    function flash() {

        activity.classList.remove(
            "activityPulse"
        );

        void activity.offsetWidth;

        activity.classList.add(
            "activityPulse"
        );
    }


    /* ======================================================
       MESSAGE
    ====================================================== */

    function message(text) {

        if (
            typeof typeSystemMessage ===
            "function"
        ) {

            typeSystemMessage(text);
        }
    }


    return {

        /* ------------------------------------------
           PHASE 1
        ------------------------------------------ */

        phase1() {

            setStatus(
                "REMOTE ACCESS",
                "REQUEST"
            );

            setStatus(
                "UNKNOWN PROCESS",
                "1"
            );

            flash();

            message(
                "REMOTE ACCESS REQUESTED."
            );
        },


        /* ------------------------------------------
           PHASE 2
        ------------------------------------------ */

        phase2() {

            setStatus(
                "REMOTE ACCESS",
                "DENIED"
            );

            flash();

            message(
                "ACCESS REQUEST: DENIED."
            );


            setTimeout(() => {

                setStatus(
                    "REMOTE ACCESS",
                    "ACCEPTED"
                );

                flash();

                message(
                    "ACCESS REQUEST: ACCEPTED."
                );

            }, 1800);
        },


        /* ------------------------------------------
           PHASE 3
        ------------------------------------------ */

        phase3() {

            setStatus(
                "UNKNOWN PROCESS",
                "1"
            );

            flash();

            message(
                "UNKNOWN PROCESS DETECTED."
            );


            setTimeout(() => {

                message(
                    "PROCESS ORIGIN: UNKNOWN."
                );

            }, 1200);


            setTimeout(() => {

                message(
                    "PROCESS PERMISSIONS: ELEVATED."
                );

            }, 2600);
        },


        /* ------------------------------------------
           PHASE 4
        ------------------------------------------ */

        phase4() {

            setStatus(
                "REMOTE ACCESS",
                "ACTIVE"
            );

            flash();

            message(
                "REMOTE SESSION INITIALIZED."
            );


            setTimeout(() => {

                message(
                    "SECURITY CHANNEL: BYPASSED."
                );

            }, 1400);


            setTimeout(() => {

                message(
                    "LOCAL AUTHORIZATION: IGNORED."
                );

            }, 2900);
        },


        /* ------------------------------------------
           PHASE 5
        ------------------------------------------ */

        phase5() {

            flash();

            message(
                "SYSTEM CONTROL: PARTIAL."
            );


            setTimeout(() => {

                message(
                    "WINDOW CONTROL: REMOTE."
                );

            }, 1300);


            setTimeout(() => {

                message(
                    "INPUT MONITORING: ACTIVE."
                );

            }, 2700);
        },


        /* ------------------------------------------
           CURSOR
        ------------------------------------------ */

        phaseCursor() {

            setStatus(
                "REMOTE ACCESS",
                "FULL"
            );

            flash();

            message(
                "CURSOR CONTROL REQUESTED."
            );


            setTimeout(() => {

                message(
                    "CURSOR CONTROL: TRANSFERRED."
                );

            }, 1800);
        },


        /* ------------------------------------------
           PHASE 6
        ------------------------------------------ */

        phase6() {

            flash();

            message(
                "SECURITY DATABASE: ACCESSING."
            );


            setTimeout(() => {

                message(
                    "SECURITY DATABASE: ACCESS GRANTED."
                );

            }, 1500);


            setTimeout(() => {

                message(
                    "ARCHIVE INDEX: READING."
                );

            }, 3000);


            setTimeout(() => {

                message(
                    "RESTRICTED CHANNEL: OPEN."
                );

            }, 4700);
        },


        /* ------------------------------------------
           PHASE 7
        ------------------------------------------ */

        phase7() {

            setStatus(
                "UNKNOWN PROCESS",
                "1"
            );

            flash();

            message(
                "SYSTEM CONTROL: FULL."
            );


            setTimeout(() => {

                message(
                    "OMEGA RESPONSE: FAILED."
                );

            }, 1500);


            setTimeout(() => {

                message(
                    "TERMINATION REQUEST SENT."
                );

            }, 3200);


            setTimeout(() => {

                message(
                    "TERMINATION REQUEST: IGNORED."
                );

            }, 5200);
        },


        /* ------------------------------------------
           SILENCE
        ------------------------------------------ */

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


        /* ------------------------------------------
           FINAL
        ------------------------------------------ */

        phaseFinal() {

            message(
                "REMOTE SESSION: ACTIVE."
            );


            setTimeout(() => {

                message(
                    "REMOTE SESSION: CLOSED."
                );

            }, 1800);


            setTimeout(() => {

                setStatus(
                    "REMOTE ACCESS",
                    "NONE"
                );

            }, 2300);


            setTimeout(() => {

                activity.remove();

            }, 3500);
        },


        /* ------------------------------------------
           DESTROY
        ------------------------------------------ */

        destroy() {

            activity.remove();
        }
    };
}


/* ==========================================================
   SLEEP
========================================================== */

function sleep(ms) {

    return new Promise(
        resolve => setTimeout(
            resolve,
            ms
        )
    );
}
