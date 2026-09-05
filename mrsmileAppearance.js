/* ==========================================================
   MR.SMILE — OMEGA INTERFACE MANIFESTATION
   VISUAL EVENT SYSTEM
   ----------------------------------------------------------
   FIRST CONTACT / SYSTEM TAKEOVER

   Основной принцип:

   OMEGA → нормальная система
       ↓
   наблюдение
       ↓
   лицо
       ↓
   игрок замечает MR.SMILE
       ↓
   курсор замечен
       ↓
   MR.SMILE получает управление
       ↓
   системное окно
       ↓
   краткое искажение
       ↓
   освобождение
========================================================== */


/* ==========================================================
   STATE
========================================================== */

let manifestationRunning = false;

let faceRunning = false;

let cursorController = null;

let systemIntrusionController = null;


/* ==========================================================
   PUBLIC
   FULL MANIFESTATION / CURSOR TAKEOVER
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
        "[MR.SMILE APPEARANCE] SYSTEM TAKEOVER STARTED."
    );


    const overlay =
        createManifestation();


    systemIntrusionController =
        createSystemIntrusionController();


    try {

        /* ==================================================
           PREPARATION
        ================================================== */

        document.body.classList.add(
            "mrSmileInterfaceCollapse"
        );


        overlay.classList.add(
            "phase-control"
        );


        mutateCode(
            overlay,
            "control"
        );


        systemIntrusionController.phaseCursor();


        await sleep(900);


        /* ==================================================
           CREATE VISUAL CURSOR
        ================================================== */

        cursorController =
            createControlledCursor();


        if (!cursorController) {
            return;
        }


        document.body.classList.add(
            "mrSmileCursorControlled"
        );


        overlay.classList.add(
            "phase-cursor"
        );


        await runCursorControl(
            overlay,
            cursorController
        );


        /* ==================================================
           TAKEOVER
        ================================================== */

        overlay.classList.add(
            "phase-takeover"
        );


        mutateCode(
            overlay,
            "takeover"
        );


        systemIntrusionController.phase7();


        await sleep(900);


        /* ==================================================
           SYSTEM WINDOW
        ================================================== */

        overlay.classList.add(
            "phase-intrusion"
        );


        mutateCode(
            overlay,
            "intrusion"
        );


        await showIntrusionWindow();


        /* ==================================================
           SMALL GEOMETRY FAILURE
        ================================================== */

        document.body.classList.add(
            "mrSmileGeometryDistortion"
        );


        systemIntrusionController.phase7();


        await sleep(850);


        document.body.classList.remove(
            "mrSmileGeometryDistortion"
        );


        await sleep(600);


        /* ==================================================
           SILENCE
        ================================================== */

        overlay.classList.add(
            "phase-silence"
        );


        mutateCode(
            overlay,
            "silence"
        );


        systemIntrusionController.phaseSilence();


        await sleep(1000);


        /* ==================================================
           RELEASE
        ================================================== */

        overlay.classList.add(
            "phase-release"
        );


        await sleep(700);


    } catch (error) {

        console.error(
            "[MR.SMILE APPEARANCE] System takeover failed:",
            error
        );

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


        document.body.classList.remove(
            "mrSmileGeometryDistortion"
        );


        const intrusion =
            document.querySelector(
                ".mrSmileIntrusionWindow"
            );


        if (intrusion) {

            intrusion.classList.add(
                "mrSmileIntrusionClosing"
            );


            setTimeout(
                () => {

                    if (
                        intrusion &&
                        intrusion.parentNode
                    ) {

                        intrusion.remove();
                    }

                },
                500
            );
        }


        overlay.remove();


        manifestationRunning = false;


        console.log(
            "[MR.SMILE APPEARANCE] SYSTEM TAKEOVER ENDED."
        );
    }
}


/* ==========================================================
   PUBLIC
   FIRST CONTACT FACE
========================================================== */

export async function showMrSmileFirstContactFace(
    mode = "presence"
) {

    /*
     * Важное отличие от старой версии:
     *
     * Появление лица НЕ считается полной
     * manifestation.
     *
     * Поэтому после него можно отдельно
     * запустить triggerMrSmileManifestation().
     */

    if (faceRunning) {

        console.log(
            "[MR.SMILE APPEARANCE] Face appearance already running."
        );

        return;
    }


    faceRunning = true;


    console.log(
        `[MR.SMILE APPEARANCE] Face appearance: ${mode}`
    );


    const overlay =
        createManifestation();


    try {

        switch (mode) {

            case "presence":

                await runPresenceAppearance(
                    overlay
                );

                break;


            case "echo":

                await runEchoAppearance(
                    overlay
                );

                break;


            case "silence":

                await runSilenceAppearance(
                    overlay
                );

                break;


            default:

                await runPresenceAppearance(
                    overlay
                );

                break;
        }


    } catch (error) {

        console.error(
            "[MR.SMILE APPEARANCE] Face appearance failed:",
            error
        );

    } finally {

        overlay.classList.add(
            "phase-release"
        );


        await sleep(450);


        overlay.remove();


        faceRunning = false;


        console.log(
            `[MR.SMILE APPEARANCE] Face appearance ended: ${mode}`
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
     * Никакой резкой морды.
     *
     * Последовательность:
     *
     * darkness
     * ↓
     * barely visible eyes
     * ↓
     * eyes become readable
     * ↓
     * face structure
     * ↓
     * human smile
     */


    mutateCode(
        overlay,
        "presence"
    );


    overlay.classList.add(
        "phase-presence"
    );


    await sleep(700);


    /* ----------------------------------------------
       EYES
    ---------------------------------------------- */

    overlay.classList.add(
        "phase-eyes"
    );


    await sleep(1500);


    /* ----------------------------------------------
       FACE
    ---------------------------------------------- */

    overlay.classList.add(
        "phase-face"
    );


    await sleep(1300);


    /* ----------------------------------------------
       SMILE
    ---------------------------------------------- */

    mutateCode(
        overlay,
        "smile"
    );


    overlay.classList.add(
        "phase-smile"
    );


    await sleep(1500);


    /*
     * Очень короткая пауза.
     *
     * Он не делает ничего.
     *
     * Именно это создаёт ощущение,
     * что он просто смотрит.
     */

    await sleep(700);


    overlay.classList.add(
        "phase-release"
    );


    await sleep(550);
}


/* ==========================================================
   ECHO
========================================================== */

async function runEchoAppearance(
    overlay
) {

    /*
     * Короткое повторное появление.
     *
     * "Я это действительно видел?"
     */


    mutateCode(
        overlay,
        "presence"
    );


    overlay.classList.add(
        "phase-echo"
    );


    await sleep(650);


    overlay.classList.add(
        "phase-echo-look"
    );


    await sleep(1300);


    mutateCode(
        overlay,
        "smile"
    );


    overlay.classList.add(
        "phase-echo-smile"
    );


    await sleep(1100);


    overlay.classList.add(
        "phase-release"
    );


    await sleep(450);
}


/* ==========================================================
   SILENCE
========================================================== */

async function runSilenceAppearance(
    overlay
) {

    /*
     * Очень редкое и тихое появление.
     */


    mutateCode(
        overlay,
        "silence"
    );


    overlay.classList.add(
        "phase-silence"
    );


    await sleep(850);


    overlay.classList.add(
        "phase-last-eye"
    );


    await sleep(1600);


    overlay.classList.add(
        "phase-last-eye-look"
    );


    await sleep(1400);


    mutateCode(
        overlay,
        "smile"
    );


    overlay.classList.add(
        "phase-last-smile"
    );


    await sleep(1000);


    overlay.classList.add(
        "phase-release"
    );


    await sleep(600);
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
            0,

        lastPlayerX:
            window.innerWidth / 2,

        lastPlayerY:
            window.innerHeight / 2
    };


    /* ======================================================
       PLAYER MOUSE
    ====================================================== */

    const onMove = event => {

        state.lastPlayerX =
            event.clientX;

        state.lastPlayerY =
            event.clientY;


        /*
         * Пока MR.SMILE не получил контроль,
         * визуальный курсор повторяет реальный.
         */

        if (!state.controlled) {

            state.targetX =
                event.clientX;

            state.targetY =
                event.clientY;
        }
    };


    window.addEventListener(
        "mousemove",
        onMove,
        true
    );


    /* ======================================================
       RENDER
    ====================================================== */

    function render() {

        if (state.destroyed) {
            return;
        }


        const smoothing =
            state.controlled
                ? 0.065
                : 0.65;


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
                Boolean(value);
        },


        setTarget(x, y) {

            state.targetX =
                x;

            state.targetY =
                y;
        },


        getPlayerPosition() {

            return {

                x:
                    state.lastPlayerX,

                y:
                    state.lastPlayerY
            };
        },


        destroy() {

            if (state.destroyed) {
                return;
            }


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
   CURSOR CONTROL
========================================================== */

async function runCursorControl(
    overlay,
    controller
) {

    if (!controller) {
        return;
    }


    const state =
        controller.state;


    /*
     * ------------------------------------------------------
     * PLAYER STILL HAS CONTROL
     * ------------------------------------------------------
     */

    controller.setControlled(
        false
    );


    await sleep(1200);


    /*
     * ------------------------------------------------------
     * MR.SMILE NOTICES CURSOR
     * ------------------------------------------------------
     */

    overlay.classList.add(
        "cursor-observed"
    );


    await sleep(900);


    /*
     * ------------------------------------------------------
     * TRANSFER
     * ------------------------------------------------------
     */

    overlay.classList.add(
        "cursor-transfer"
    );


    /*
     * Замораживаем визуальный курсор
     * именно там, где его оставил игрок.
     */

    controller.setTarget(
        state.x,
        state.y
    );


    await sleep(500);


    controller.setControlled(
        true
    );


    await sleep(850);


    /*
     * ------------------------------------------------------
     * CURSOR MOVES BY ITSELF
     * ------------------------------------------------------
     */

    overlay.classList.add(
        "cursor-self-move"
    );


    const centerX =
        window.innerWidth * 0.5;

    const centerY =
        window.innerHeight * 0.5;


    /*
     * Небольшое движение.
     *
     * Не надо водить курсором по всему экрану.
     */

    controller.setTarget(
        centerX - 80,
        centerY + 10
    );


    await sleep(850);


    controller.setTarget(
        centerX + 70,
        centerY + 5
    );


    await sleep(850);


    /*
     * ------------------------------------------------------
     * CURSOR LOOKS AT MR.SMILE
     * ------------------------------------------------------
     */

    overlay.classList.add(
        "cursor-at-face"
    );


    controller.setTarget(
        centerX - 105,
        centerY - 35
    );


    await sleep(1300);


    /*
     * MR.SMILE notices.
     */

    overlay.classList.add(
        "cursor-noticed"
    );


    await sleep(1000);


    /*
     * Небольшое движение вниз.
     *
     * Как будто он понял,
     * что игрок пытается сделать.
     */

    controller.setTarget(
        centerX - 70,
        centerY + 100
    );


    await sleep(800);


    /*
     * ------------------------------------------------------
     * CURSOR RELEASE
     * ------------------------------------------------------
     *
     * ВАЖНО:
     * Полный контроль возвращается игроку
     * после основной сцены takeover.
     *
     * Здесь только визуально подготавливаем
     * состояние.
     */

    overlay.classList.add(
        "cursor-held"
    );


    await sleep(500);
}


/* ==========================================================
   DESTROY CURSOR
========================================================== */

function destroyControlledCursor() {

    if (!cursorController) {
        return;
    }


    cursorController.destroy();


    cursorController =
        null;
}


/* ==========================================================
   SYSTEM INTRUSION WINDOW
========================================================== */

async function showIntrusionWindow() {

    let target =
        document.querySelector(
            "#consoleWindow"
        );


    /*
     * Если Console уже существует —
     * используем реальное окно.
     */

    if (target) {

        target.classList.add(
            "mrSmileIntrusionTarget"
        );


        await sleep(700);


        return;
    }


    /*
     * Если Console не открыта,
     * создаём окно в стиле OMEGA.
     */

    target =
        createIntrusionWindow();


    document.body.appendChild(
        target
    );


    await sleep(900);


    target.classList.add(
        "mrSmileIntrusionTarget"
    );


    await sleep(700);
}


/* ==========================================================
   CREATE INTRUSION WINDOW
========================================================== */

function createIntrusionWindow() {

    const windowElement =
        document.createElement("div");


    windowElement.id =
        "mrSmileIntrusionWindow";


    windowElement.className =
        "window mrSmileIntrusionWindow";


    windowElement.innerHTML = `

        <div class="windowHeader">

            <div class="windowTitle">

                <span class="windowIcon">
                    ▣
                </span>

                <span>
                    SYSTEM CONSOLE
                </span>

            </div>


            <div class="windowControls">

                <button
                    type="button"
                    disabled
                >
                    —
                </button>

                <button
                    type="button"
                    disabled
                >
                    ×
                </button>

            </div>

        </div>


        <div class="windowBody">

            <div class="mrSmileIntrusionContent">

                <div>
                    OMEGA SYSTEM CONSOLE
                </div>

                <div>
                    INPUT CHANNEL: LOCAL
                </div>

                <div>
                    REMOTE PROCESS: ACTIVE
                </div>

                <div>
                    CONTROL OWNER: UNKNOWN
                </div>

                <div>
                    RESPONSE: DELAYED
                </div>

            </div>

        </div>


        <div class="windowStatus">

            <span>
                CONNECTION: ACTIVE
            </span>

            <span>
                INPUT: REMOTE
            </span>

        </div>

    `;


    /*
     * Ставим его туда, где обычно
     * находится рабочая область.
     */

    const workspace =
        document.querySelector(
            "#workspace"
        );


    if (workspace) {

        const rect =
            workspace.getBoundingClientRect();


        windowElement.style.left =
            `${rect.width * 0.5}px`;


        windowElement.style.top =
            `${rect.height * 0.5}px`;


        windowElement.style.transform =
            "translate(-50%, -50%)";

    } else {

        windowElement.style.left =
            "50%";

        windowElement.style.top =
            "50%";

        windowElement.style.transform =
            "translate(-50%, -50%)";
    }


    return windowElement;
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


    overlay.innerHTML = `

        <!-- =================================================
             OMEGA SYSTEM FRAGMENTS
        ================================================== -->

        <div class="mrSmileUIFragments">


            <pre
                class="mrSmileFragment fragment-top"
                data-code="top"
            >OMEGA SYSTEM
AUTHENTICATION CHANNEL</pre>


            <pre
                class="mrSmileFragment fragment-left"
                data-code="left"
            >REMOTE SESSION
SOURCE: UNKNOWN</pre>


            <pre
                class="mrSmileFragment fragment-right"
                data-code="right"
            >PROCESS:
UNKNOWN</pre>


            <pre
                class="mrSmileFragment fragment-bottom"
                data-code="bottom"
            >INPUT CHANNEL:
LOCAL</pre>


            <pre
                class="mrSmileFragment fragment-code code-1"
                data-code="code1"
            >SYSTEM CONTROL:
LOCAL</pre>


            <pre
                class="mrSmileFragment fragment-code code-2"
                data-code="code2"
            >REMOTE ACCESS:
NONE</pre>


            <pre
                class="mrSmileFragment fragment-code code-3"
                data-code="code3"
            >OBSERVER:
UNKNOWN</pre>


            <pre
                class="mrSmileFragment fragment-code code-4"
                data-code="code4"
            >INPUT:
AVAILABLE</pre>


            <pre
                class="mrSmileFragment fragment-code code-5"
                data-code="code5"
            >SESSION:
LOCAL</pre>


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


        <!-- =================================================
             MR.SMILE FACE
        ================================================== -->

        <div class="mrSmileFace">

            <div class="mrSmileFaceStructure">

                <span
                    class="faceTrace trace-1"
                ></span>

                <span
                    class="faceTrace trace-2"
                ></span>

                <span
                    class="faceTrace trace-3"
                ></span>

                <span
                    class="faceTrace trace-4"
                ></span>

            </div>


            <div class="mrSmileEye eye-left">

                <div class="eyeGlow"></div>

                <div class="eyeCore">

                    <span
                        class="eyePupil"
                    ></span>

                </div>

            </div>


            <div class="mrSmileEye eye-right">

                <div class="eyeGlow"></div>

                <div class="eyeCore">

                    <span
                        class="eyePupil"
                    ></span>

                </div>

            </div>


            <div class="mrSmileMouth">

                <div class="mouthOuter"></div>


                <div class="mouthInner">

                    <div class="mouthTeeth">

                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>

                    </div>

                </div>


                <div
                    class="mouthLine mouthLineLeft"
                ></div>

                <div
                    class="mouthLine mouthLineRight"
                ></div>

            </div>


            <div class="mrSmileFaceScan"></div>

        </div>


        <!-- =================================================
             SYSTEM SIGNAL
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
   CODE MUTATION
========================================================== */

function mutateCode(
    overlay,
    mode
) {

    if (!overlay) {
        return;
    }


    const fragments =
        overlay.querySelectorAll(
            ".mrSmileFragment[data-code]"
        );


    const codeMap = {

        /* ==================================================
           PRESENCE
        ================================================== */

        presence: {

            top:
`OMEGA SYSTEM
AUTHENTICATION CHANNEL
STATUS: ACTIVE`,

            left:
`REMOTE SESSION
SOURCE: UNKNOWN
IDENTIFIER: —`,

            right:
`PROCESS:
UNKNOWN
STATE: WAITING`,

            bottom:
`INPUT CHANNEL:
LOCAL
OPERATOR: ACTIVE`,

            code1:
`SYSTEM CONTROL:
LOCAL`,

            code2:
`REMOTE ACCESS:
NONE`,

            code3:
`OBSERVER:
UNKNOWN`,

            code4:
`INPUT:
AVAILABLE`,

            code5:
`SESSION:
LOCAL`
        },


        /* ==================================================
           SMILE
        ================================================== */

        smile: {

            top:
`OMEGA SYSTEM
AUTHENTICATION CHANNEL
STATUS: ACTIVE`,

            left:
`REMOTE SESSION
SOURCE: UNKNOWN
IDENTIFIER: MR_SMILE`,

            right:
`PROCESS:
ACTIVE
STATE: OBSERVING`,

            bottom:
`INPUT CHANNEL:
LOCAL
OPERATOR: OBSERVED`,

            code1:
`SYSTEM CONTROL:
LOCAL`,

            code2:
`REMOTE ACCESS:
ACTIVE`,

            code3:
`OBSERVER:
PRESENT`,

            code4:
`INPUT:
MONITORED`,

            code5:
`SESSION:
SHARED`
        },


        /* ==================================================
           CONTROL
        ================================================== */

        control: {

            top:
`OMEGA SYSTEM
CONTROL CHANNEL
STATUS: CHANGING`,

            left:
`REMOTE SESSION
SOURCE: MR_SMILE
IDENTIFIER: ACTIVE`,

            right:
`PROCESS:
ACTIVE
STATE: CONTROL`,

            bottom:
`INPUT CHANNEL:
REMOTE
OPERATOR: OBSERVED`,

            code1:
`SYSTEM CONTROL:
PARTIAL`,

            code2:
`REMOTE ACCESS:
FULL`,

            code3:
`OBSERVER:
PRESENT`,

            code4:
`INPUT:
TRANSFERRED`,

            code5:
`SESSION:
REMOTE`
        },


        /* ==================================================
           INTRUSION
        ================================================== */

        intrusion: {

            top:
`OMEGA SYSTEM
CONTROL CHANNEL
STATUS: REMOTE`,

            left:
`REMOTE SESSION
SOURCE: MR_SMILE
ACCESS: ELEVATED`,

            right:
`PROCESS:
UNKNOWN
STATE: ACTIVE`,

            bottom:
`INPUT CHANNEL:
REMOTE
RESPONSE: DELAYED`,

            code1:
`SYSTEM CONTROL:
FULL`,

            code2:
`OMEGA RESPONSE:
FAILED`,

            code3:
`OBSERVER:
ACTIVE`,

            code4:
`INPUT:
REMOTE`,

            code5:
`SESSION:
UNAUTHORIZED`
        },


        /* ==================================================
           TAKEOVER
        ================================================== */

        takeover: {

            top:
`OMEGA SYSTEM
CONTROL CHANNEL
OWNER: UNKNOWN`,

            left:
`REMOTE SESSION
SOURCE: MR_SMILE
ACCESS: SYSTEM`,

            right:
`PROCESS:
ACTIVE
STATE: CONTROL`,

            bottom:
`INPUT CHANNEL:
REMOTE
OPERATOR: LOCKED`,

            code1:
`SYSTEM CONTROL:
FULL`,

            code2:
`OMEGA RESPONSE:
FAILED`,

            code3:
`OBSERVER:
01`,

            code4:
`INPUT:
CONTROLLED`,

            code5:
`SESSION:
REMOTE`
        },


        /* ==================================================
           SILENCE
        ================================================== */

        silence: {

            top:
`OMEGA CORE`,

            left:
`REMOTE SESSION
ACTIVE`,

            right:
`PROCESS:
—`,

            bottom:
`INPUT:
—`,

            code1:
`SYSTEM:
—`,

            code2:
`REMOTE:
—`,

            code3:
`OBSERVER:
01`,

            code4:
`INPUT:
—`,

            code5:
`SESSION:
—`
        }
    };


    const selected =
        codeMap[mode] ||
        codeMap.presence;


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


    /*
     * Все внутренние таймеры старой версии
     * убраны.
     *
     * Это важно:
     * никаких сообщений, которые продолжают
     * появляться после того, как сцена закончилась.
     */


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
         * Используем глобальный typeSystemMessage,
         * если он был экспортирован в window.
         */

        if (
            typeof window.typeSystemMessage ===
            "function"
        ) {

            window.typeSystemMessage(
                text
            );

            return;
        }


        console.log(
            "[MR.SMILE SYSTEM]",
            text
        );
    }


    return {

        phaseCursor() {

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
                "CURSOR CONTROL REQUESTED."
            );
        },


        phase7() {

            setStatus(
                "SYSTEM",
                "REMOTE"
            );


            setStatus(
                "REMOTE ACCESS",
                "FULL"
            );


            setStatus(
                "UNKNOWN PROCESS",
                "1"
            );


            flashActivity();


            message(
                "SYSTEM CONTROL: FULL."
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


            setStatus(
                "SYSTEM",
                "—"
            );
        },


        phaseFinal() {

            setStatus(
                "REMOTE ACCESS",
                "NONE"
            );


            setStatus(
                "UNKNOWN PROCESS",
                "0"
            );


            setStatus(
                "SYSTEM",
                "NORMAL"
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
