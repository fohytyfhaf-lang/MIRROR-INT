
/* ==========================================================
   MR.SMILE — OMEGA INTRUSION APPEARANCE SYSTEM
   ----------------------------------------------------------
   VISUAL / PRESENTATION LAYER ONLY

   Назначение:
        ├── системные сообщения
        ├── intrusion dialogue
        ├── fake console activity
        ├── security failure
        ├── cursor takeover
        ├── subtle system distortion
        └── intrusion indicators

   НЕ содержит:
        - лица
        - глаз
        - носа
        - рта
        - старой manifestation-системы
        - jumpscare
        - глобального pointer-events блокирования
        - постоянного fullscreen overlay

   Архитектура:

        mrsmileBehavior
                ↓
        mrsmileActions
                ↓
        mrsmileIntrusionUI
                ↓
        mrsmileAppearance
                ↓
        реальный интерфейс OMEGA
========================================================== */


/* ==========================================================
   STATE
========================================================== */

let appearanceRunning = false;

let cursorVisual = null;
let cursorMouseHandler = null;

let appearanceTimers = [];

let intrusionLayer = null;
let intrusionConsole = null;
let intrusionDialogue = null;
let intrusionNotice = null;

let playerMouseX =
    window.innerWidth * 0.5;

let playerMouseY =
    window.innerHeight * 0.5;


/* ==========================================================
   CONSTANTS
========================================================== */

const DEFAULT_TIMING = {

    messageDuration: 2200,

    dialogueDuration: 2600,

    noticeDuration: 1800,

    commandCharacterDelay: 35,

    systemFailureDuration: 1700,

    distortionDuration: 700,

    cursorClickDuration: 150,

    cursorLostDuration: 500,

    recoveryDuration: 900

};


/* ==========================================================
   PUBLIC
========================================================== */

/**
 * Показывает короткое визуальное
 * вмешательство MR.SMILE.
 *
 * Это НЕ First Contact sequence.
 *
 * Используется другими системами,
 * когда уже принято решение:
 *
 *      observe
 *      interfere
 *      warn
 *      sabotage
 *      help
 */
export async function triggerMrSmileManifestation() {

    if (appearanceRunning) {
        return;
    }

    appearanceRunning = true;

    try {

        createIntrusionLayer();

        await showIntrusionNotice(
            "UNKNOWN PROCESS ACTIVE",
            "warning"
        );

    } catch (error) {

        console.error(
            "[MR.SMILE] Intrusion appearance failed:",
            error
        );

    } finally {

        cleanupAppearance();

        appearanceRunning = false;
    }
}


/* ==========================================================
   FIRST CONTACT
========================================================== */

/**
 * Замена старого showMrSmileFirstContactFace().
 *
 * Теперь никакого лица.
 *
 * First Contact визуально происходит
 * через саму систему OMEGA.
 *
 * Последовательность:
 *
 *      system anomaly
 *          ↓
 *      security detection
 *          ↓
 *      console intrusion
 *          ↓
 *      MR.SMILE message
 *          ↓
 *      OMEGA termination attempt
 *          ↓
 *      termination failure
 *
 * ВАЖНО:
 *
 * Функция заканчивает визуальную
 * последовательность сама.
 *
 * MR.SMILE после этого остаётся
 * в State / Presence.
 */
export async function showMrSmileFirstContactFace(
    mode = "presence"
) {

    console.warn(
        "[MR.SMILE] showMrSmileFirstContactFace() is deprecated. " +
        "Running system intrusion instead."
    );

    if (appearanceRunning) {
        return;
    }

    appearanceRunning = true;

    try {

        createIntrusionLayer();

        switch (mode) {

            case "echo":

                await runEchoIntrusion();

                break;


            case "silence":

                await runSilentIntrusion();

                break;


            case "presence":
            default:

                await runFirstContactIntrusion();

                break;
        }

    } catch (error) {

        console.error(
            "[MR.SMILE] First contact intrusion failed:",
            error
        );

    } finally {

        cleanupAppearance();

        appearanceRunning = false;
    }
}


/* ==========================================================
   FIRST CONTACT INTRUSION
========================================================== */

async function runFirstContactIntrusion() {

    /*
     * 1.
     * OMEGA сначала сама замечает
     * неизвестную активность.
     */

    await showSystemStatus(
        "SECURITY EVENT",
        "UNAUTHORIZED PROCESS DETECTED",
        "warning"
    );


    await sleep(700);


    /*
     * 2.
     * Система пытается определить источник.
     */

    await showIntrusionNotice(
        "IDENTIFYING PROCESS...",
        "system"
    );


    await sleep(900);


    /*
     * 3.
     * Открываем Console.
     */

    openConsoleWindow();


    await sleep(650);


    /*
     * 4.
     * Самопроизвольный ввод.
     */

    await typeConsoleCommand(
        "process.scan --unknown"
    );


    await sleep(500);


    await typeConsoleOutput(
        "UNKNOWN PROCESS FOUND"
    );


    await typeConsoleOutput(
        "SOURCE: INTERNAL"
    );


    await typeConsoleOutput(
        "PRIVILEGE: UNKNOWN"
    );


    await sleep(800);


    /*
     * 5.
     * OMEGA пытается удалить процесс.
     */

    await typeConsoleCommand(
        "security.terminate --unknown"
    );


    await sleep(650);


    await typeConsoleOutput(
        "TERMINATION IN PROGRESS..."
    );


    await sleep(900);


    /*
     * 6.
     * Неудача.
     */

    await showSystemStatus(
        "SECURITY FAILURE",
        "PROCESS REFUSED TERMINATION",
        "error"
    );


    await sleep(700);


    /*
     * 7.
     * MR.SMILE впервые обращается
     * непосредственно к оператору.
     */

    await showMrSmileDialogue(
        "You noticed.",
        "MR.SMILE"
    );


    await sleep(1000);


    /*
     * 8.
     * Небольшое вмешательство.
     */

    await runMrSmileSubtleDistortion();


    /*
     * 9.
     * Последнее сообщение.
     */

    await showMrSmileDialogue(
        "I'm still here.",
        "MR.SMILE"
    );


    await sleep(1100);


    /*
     * 10.
     * OMEGA восстанавливает интерфейс.
     *
     * Сам процесс остаётся.
     */

    await showSystemStatus(
        "OMEGA",
        "SYSTEM RECOVERY COMPLETE",
        "system"
    );


    await sleep(
        DEFAULT_TIMING.recoveryDuration
    );
}


/* ==========================================================
   ECHO INTRUSION
========================================================== */

async function runEchoIntrusion() {

    await showIntrusionNotice(
        "UNUSUAL ACTIVITY DETECTED",
        "warning"
    );


    await sleep(700);


    openConsoleWindow();


    await sleep(600);


    await typeConsoleOutput(
        "SESSION MONITOR: ACTIVE"
    );


    await typeConsoleOutput(
        "EXTERNAL OBSERVER: PRESENT"
    );


    await sleep(800);


    await showMrSmileDialogue(
        "Keep looking.",
        "MR.SMILE"
    );


    await sleep(900);
}


/* ==========================================================
   SILENT INTRUSION
========================================================== */

async function runSilentIntrusion() {

    await showSystemStatus(
        "OMEGA",
        "INPUT ANOMALY DETECTED",
        "warning"
    );


    await sleep(900);


    openConsoleWindow();


    await sleep(700);


    await typeConsoleCommand(
        "whoami"
    );


    await sleep(350);


    await typeConsoleOutput(
        "operator"
    );


    await sleep(500);


    await typeConsoleCommand(
        "who.is.watching"
    );


    await sleep(700);


    await typeConsoleOutput(
        "..."
    );


    await sleep(900);


    await runMrSmileSubtleDistortion();
}


/* ==========================================================
   INTRUSION LAYER
========================================================== */

function createIntrusionLayer() {

    removeIntrusionElements();


    intrusionLayer =
        document.createElement("div");


    intrusionLayer.id =
        "mrSmileIntrusionLayer";


    intrusionLayer.className =
        "mrSmileIntrusionLayer";


    intrusionLayer.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
     * ВАЖНО:
     *
     * Layer не блокирует интерфейс.
     */

    intrusionLayer.style.pointerEvents =
        "none";


    document.body.appendChild(
        intrusionLayer
    );
}


/* ==========================================================
   SYSTEM STATUS
========================================================== */

export async function showSystemStatus(
    title,
    message,
    type = "system",
    duration =
        DEFAULT_TIMING.messageDuration
) {

    createIntrusionLayer();


    const panel =
        document.createElement("div");


    panel.className =
        "mrSmileSystemStatus " +
        `mrSmileSystemStatus-${type}`;


    panel.innerHTML = `

        <div class="mrSmileSystemStatusHeader">
            ${escapeHtml(title)}
        </div>

        <div class="mrSmileSystemStatusBody">
            ${escapeHtml(message)}
        </div>

    `;


    intrusionLayer.appendChild(
        panel
    );


    requestAnimationFrame(
        () => {

            panel.classList.add(
                "visible"
            );

        }
    );


    await sleep(duration);


    if (!panel.isConnected) {
        return;
    }


    panel.classList.add(
        "fade"
    );


    await sleep(350);


    if (panel.isConnected) {
        panel.remove();
    }
}


/* ==========================================================
   INTRUSION NOTICE
========================================================== */

export async function showIntrusionNotice(
    message,
    type = "system",
    duration =
        DEFAULT_TIMING.noticeDuration
) {

    createIntrusionLayer();


    if (intrusionNotice) {
        intrusionNotice.remove();
    }


    intrusionNotice =
        document.createElement("div");


    intrusionNotice.id =
        "mrSmileIntrusionNotice";


    intrusionNotice.className =
        "mrSmileIntrusionNotice " +
        `mrSmileIntrusionNotice-${type}`;


    intrusionNotice.textContent =
        message;


    intrusionLayer.appendChild(
        intrusionNotice
    );


    requestAnimationFrame(
        () => {

            intrusionNotice.classList.add(
                "visible"
            );

        }
    );


    await sleep(duration);


    if (!intrusionNotice) {
        return;
    }


    intrusionNotice.classList.add(
        "fade"
    );


    await sleep(300);


    if (intrusionNotice) {

        intrusionNotice.remove();

        intrusionNotice = null;
    }
}


/* ==========================================================
   MR.SMILE DIALOGUE
========================================================== */

export async function showMrSmileDialogue(
    message,
    sender = "MR.SMILE",
    duration =
        DEFAULT_TIMING.dialogueDuration
) {

    createIntrusionLayer();


    if (intrusionDialogue) {
        intrusionDialogue.remove();
    }


    intrusionDialogue =
        document.createElement("div");


    intrusionDialogue.id =
        "mrSmileIntrusionDialogue";


    intrusionDialogue.className =
        "mrSmileIntrusionDialogue";


    intrusionDialogue.innerHTML = `

        <div class="mrSmileDialogueHeader">
            ${escapeHtml(sender)}
        </div>

        <div class="mrSmileDialogueBody">
            ${escapeHtml(message)}
        </div>

    `;


    intrusionLayer.appendChild(
        intrusionDialogue
    );


    requestAnimationFrame(
        () => {

            intrusionDialogue.classList.add(
                "visible"
            );

        }
    );


    await sleep(duration);


    if (!intrusionDialogue) {
        return;
    }


    intrusionDialogue.classList.add(
        "fade"
    );


    await sleep(350);


    if (intrusionDialogue) {

        intrusionDialogue.remove();

        intrusionDialogue = null;
    }
}


/* ==========================================================
   CONSOLE WINDOW
========================================================== */

export function openConsoleWindow() {

    /*
     * Используем настоящий Window Manager,
     * если он доступен.
     */

    try {

        if (
            typeof window.openWindow ===
            "function"
        ) {

            window.openWindow(
                "console"
            );

            return;
        }

    } catch (error) {

        console.warn(
            "[MR.SMILE] Unable to open console:",
            error
        );
    }


    /*
     * Fallback.
     */

    const consoleWindow =
        document.querySelector(
            "#consoleWindow"
        ) ||
        document.querySelector(
            '[data-window="console"]'
        );


    if (!consoleWindow) {
        return;
    }


    consoleWindow.classList.remove(
        "hidden"
    );


    consoleWindow.style.display =
        "flex";
}


/* ==========================================================
   CONSOLE COMMAND
========================================================== */

export async function typeConsoleCommand(
    command
) {

    const consoleElement =
        getConsoleOutputElement();


    if (!consoleElement) {

        /*
         * Если настоящая Console не найдена,
         * показываем действие через
         * intrusion notice.
         */

        await showIntrusionNotice(
            `> ${command}`,
            "console"
        );

        return;
    }


    const line =
        document.createElement("div");


    line.className =
        "mrSmileConsoleLine mrSmileConsoleCommand";


    line.textContent =
        `> ${command}`;


    consoleElement.appendChild(
        line
    );


    scrollConsoleToBottom();


    /*
     * Небольшая задержка,
     * чтобы команда выглядела
     * введённой системой.
     */

    await sleep(250);
}


/* ==========================================================
   CONSOLE OUTPUT
========================================================== */

export async function typeConsoleOutput(
    text
) {

    const consoleElement =
        getConsoleOutputElement();


    if (!consoleElement) {

        await showIntrusionNotice(
            text,
            "console"
        );

        await sleep(250);

        return;
    }


    const line =
        document.createElement("div");


    line.className =
        "mrSmileConsoleLine mrSmileConsoleOutput";


    line.textContent =
        text;


    consoleElement.appendChild(
        line
    );


    scrollConsoleToBottom();


    await sleep(300);
}


/* ==========================================================
   FIND CONSOLE OUTPUT
========================================================== */

function getConsoleOutputElement() {

    const selectors = [

        "#consoleOutput",

        ".consoleOutput",

        "#consoleContent",

        ".consoleContent",

        "#terminalOutput",

        ".terminalOutput"

    ];


    for (
        const selector of selectors
    ) {

        const element =
            document.querySelector(
                selector
            );


        if (element) {
            return element;
        }
    }


    return null;
}


/* ==========================================================
   SCROLL CONSOLE
========================================================== */

function scrollConsoleToBottom() {

    const consoleElement =
        getConsoleOutputElement();


    if (!consoleElement) {
        return;
    }


    consoleElement.scrollTop =
        consoleElement.scrollHeight;
}


/* ==========================================================
   CURSOR
========================================================== */

/**
 * Создаёт визуальный курсор MR.SMILE.
 *
 * Это отдельный визуальный курсор.
 *
 * Настоящий cursor пользователя
 * не уничтожается.
 */
export function createMrSmileControlledCursor() {

    if (cursorVisual) {
        cursorVisual.remove();
    }


    cursorVisual =
        document.createElement("div");


    cursorVisual.id =
        "mrSmileControlledCursor";


    cursorVisual.className =
        "mrSmileControlledCursor";


    cursorVisual.innerHTML = `

        <div class="mrCursorArrow"></div>

        <div class="mrCursorCore"></div>

    `;


    document.body.appendChild(
        cursorVisual
    );


    cursorVisual.style.left =
        `${playerMouseX}px`;


    cursorVisual.style.top =
        `${playerMouseY}px`;


    document.body.classList.add(
        "mrSmileCursorControlled"
    );


    /*
     * Следим за настоящим курсором.
     */

    if (!cursorMouseHandler) {

        cursorMouseHandler =
            event => {

                playerMouseX =
                    event.clientX;

                playerMouseY =
                    event.clientY;

            };


        document.addEventListener(
            "mousemove",
            cursorMouseHandler,
            true
        );
    }


    return cursorVisual;
}


/* ==========================================================
   FOLLOW PLAYER CURSOR
========================================================== */

export function followPlayerCursor() {

    if (!cursorVisual) {
        createMrSmileControlledCursor();
    }


    if (!cursorVisual) {
        return;
    }


    cursorVisual.style.left =
        `${playerMouseX}px`;


    cursorVisual.style.top =
        `${playerMouseY}px`;
}


/* ==========================================================
   MOVE CURSOR
========================================================== */

export async function moveMrSmileCursor(
    x,
    y,
    duration = 700
) {

    if (!cursorVisual) {
        createMrSmileControlledCursor();
    }


    if (!cursorVisual) {
        return;
    }


    const startX =
        parseFloat(
            cursorVisual.style.left
        ) ||
        playerMouseX;


    const startY =
        parseFloat(
            cursorVisual.style.top
        ) ||
        playerMouseY;


    const startTime =
        performance.now();


    return new Promise(
        resolve => {

            function animate(
                currentTime
            ) {

                if (!cursorVisual) {

                    resolve();

                    return;
                }


                const elapsed =
                    currentTime -
                    startTime;


                const progress =
                    Math.min(
                        1,
                        elapsed /
                        Math.max(
                            duration,
                            1
                        )
                    );


                const eased =
                    progress *
                    progress *
                    (
                        3 -
                        2 *
                        progress
                    );


                const currentX =
                    startX +
                    (
                        x -
                        startX
                    ) *
                    eased;


                const currentY =
                    startY +
                    (
                        y -
                        startY
                    ) *
                    eased;


                cursorVisual.style.left =
                    `${currentX}px`;


                cursorVisual.style.top =
                    `${currentY}px`;


                if (
                    progress <
                    1
                ) {

                    requestAnimationFrame(
                        animate
                    );

                } else {

                    resolve();

                }
            }


            requestAnimationFrame(
                animate
            );
        }
    );
}


/* ==========================================================
   CURSOR CLICK
========================================================== */

export async function clickMrSmileCursor() {

    if (!cursorVisual) {
        return;
    }


    cursorVisual.classList.add(
        "mrSmileCursorClick"
    );


    await sleep(
        DEFAULT_TIMING.cursorClickDuration
    );


    if (!cursorVisual) {
        return;
    }


    cursorVisual.classList.remove(
        "mrSmileCursorClick"
    );
}


/* ==========================================================
   CURSOR LOST
========================================================== */

export async function loseMrSmileCursor() {

    if (!cursorVisual) {
        return;
    }


    cursorVisual.classList.add(
        "mrSmileCursorLost"
    );


    await sleep(
        DEFAULT_TIMING.cursorLostDuration
    );


    if (!cursorVisual) {
        return;
    }


    cursorVisual.remove();

    cursorVisual = null;


    document.body.classList.remove(
        "mrSmileCursorControlled"
    );
}


/* ==========================================================
   CURSOR CLEANUP
========================================================== */

export function destroyMrSmileControlledCursor() {

    if (cursorVisual) {

        cursorVisual.remove();

        cursorVisual = null;
    }


    document.body.classList.remove(
        "mrSmileCursorControlled"
    );
}


/* ==========================================================
   SUBTLE SYSTEM DISTORTION
========================================================== */

/**
 * Небольшое временное искажение.
 *
 * НЕ является RGB glitch.
 * НЕ трясёт весь экран.
 */
export async function runMrSmileSubtleDistortion() {

    document.body.classList.add(
        "mrSmileGeometryDistortion"
    );


    await sleep(350);


    document.body.classList.add(
        "mrSmileGeometryDistortionSoft"
    );


    await sleep(350);


    document.body.classList.remove(
        "mrSmileGeometryDistortionSoft"
    );


    await sleep(250);


    document.body.classList.remove(
        "mrSmileGeometryDistortion"
    );
}


/* ==========================================================
   SYSTEM OVERRIDE
========================================================== */

export async function showMrSmileSystemOverride(
    message =
        "SYSTEM CONTROL OVERRIDDEN"
) {

    await showSystemStatus(
        "OMEGA",
        message,
        "override",
        1900
    );
}


/* ==========================================================
   SECURITY FAILURE
========================================================== */

export async function showMrSmileSecurityFailure(
    message =
        "SECURITY RESPONSE FAILED"
) {

    await showSystemStatus(
        "SECURITY FAILURE",
        message,
        "error",
        2100
    );
}


/* ==========================================================
   RECOVERY
========================================================== */

export async function showMrSmileRecovery() {

    await showSystemStatus(
        "OMEGA",
        "SYSTEM RECOVERY COMPLETE",
        "system",
        DEFAULT_TIMING.recoveryDuration
    );
}


/* ==========================================================
   PRESENCE TRACE
========================================================== */

/**
 * Маленький системный индикатор.
 *
 * Это не декоративный horror overlay.
 *
 * Он показывает, что неизвестный
 * процесс всё ещё существует.
 */
export function createMrSmilePresenceTrace() {

    if (
        document.querySelector(
            "#mrSmilePresenceTrace"
        )
    ) {
        return;
    }


    const trace =
        document.createElement("div");


    trace.id =
        "mrSmilePresenceTrace";


    trace.className =
        "mrSmilePresenceTrace";


    trace.innerHTML = `

        <span>
            UNKNOWN PROCESS
        </span>

        <span>
            ACTIVE
        </span>

    `;


    document.body.appendChild(
        trace
    );


    requestAnimationFrame(
        () => {

            trace.classList.add(
                "visible"
            );

        }
    );
}


/* ==========================================================
   REMOVE PRESENCE TRACE
========================================================== */

export async function removeMrSmilePresenceTrace() {

    const trace =
        document.querySelector(
            "#mrSmilePresenceTrace"
        );


    if (!trace) {
        return;
    }


    trace.classList.add(
        "fade"
    );


    await sleep(650);


    if (trace.isConnected) {
        trace.remove();
    }
}


/* ==========================================================
   CLEAR INTRUSION ELEMENTS
========================================================== */

function removeIntrusionElements() {

    const selectors = [

        "#mrSmileIntrusionLayer",

        "#mrSmileIntrusionNotice",

        "#mrSmileIntrusionDialogue",

        "#mrSmilePresenceTrace"

    ];


    selectors.forEach(
        selector => {

            document
                .querySelectorAll(selector)
                .forEach(
                    element => element.remove()
                );

        }
    );


    intrusionLayer = null;
    intrusionConsole = null;
    intrusionDialogue = null;
    intrusionNotice = null;
}


/* ==========================================================
   CLEANUP
========================================================== */

function cleanupAppearance() {

    clearAppearanceTimers();


    if (cursorMouseHandler) {

        document.removeEventListener(
            "mousemove",
            cursorMouseHandler,
            true
        );

        cursorMouseHandler = null;
    }


    destroyMrSmileControlledCursor();


    removeIntrusionElements();


    document.body.classList.remove(
        "mrSmileGeometryDistortion"
    );


    document.body.classList.remove(
        "mrSmileGeometryDistortionSoft"
    );


    document.body.classList.remove(
        "mrSmileCursorControlled"
    );


    document.body.classList.remove(
        "mrSmileCursorObserved"
    );
}


/* ==========================================================
   CLEAR TIMERS
========================================================== */

function clearAppearanceTimers() {

    appearanceTimers.forEach(
        timer => {

            clearTimeout(timer);

        }
    );


    appearanceTimers = [];
}


/* ==========================================================
   SLEEP
========================================================== */

function sleep(
    ms
) {

    return new Promise(
        resolve => {

            const timer =
                setTimeout(
                    () => {

                        appearanceTimers =
                            appearanceTimers.filter(
                                item =>
                                    item !== timer
                            );

                        resolve();

                    },
                    ms
                );


            appearanceTimers.push(
                timer
            );
        }
    );
}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHtml(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* ==========================================================
   DEBUG
========================================================== */

export function isMrSmileManifestationActive() {

    return appearanceRunning;
}


/* ==========================================================
   DEBUG API
========================================================== */

if (!window.MRSMILE_APPEARANCE) {

    window.MRSMILE_APPEARANCE = {

        status() {

            return {

                running:
                    appearanceRunning,

                cursor:
                    !!cursorVisual,

                layer:
                    !!intrusionLayer,

                dialogue:
                    !!intrusionDialogue,

                notice:
                    !!intrusionNotice

            };
        },


        notice(
            message,
            type = "system"
        ) {

            return showIntrusionNotice(
                message,
                type
            );
        },


        dialogue(
            message,
            sender = "MR.SMILE"
        ) {

            return showMrSmileDialogue(
                message,
                sender
            );
        },


        system(
            title,
            message,
            type = "system"
        ) {

            return showSystemStatus(
                title,
                message,
                type
            );
        },


        command(
            command
        ) {

            return typeConsoleCommand(
                command
            );
        },


        output(
            text
        ) {

            return typeConsoleOutput(
                text
            );
        },


        distortion() {

            return runMrSmileSubtleDistortion();
        },


        cursor() {

            return createMrSmileControlledCursor();
        },


        moveCursor(
            x,
            y,
            duration = 700
        ) {

            return moveMrSmileCursor(
                x,
                y,
                duration
            );
        },


        clickCursor() {

            return clickMrSmileCursor();
        },


        loseCursor() {

            return loseMrSmileCursor();
        },


        firstContact(
            mode = "presence"
        ) {

            return showMrSmileFirstContactFace(
                mode
            );
        },


        cleanup() {

            cleanupAppearance();

            appearanceRunning = false;
        }

    };
}


/* ==========================================================
   END
========================================================== */
