/* ==========================================================
   MR.SMILE — OMEGA APPEARANCE SYSTEM
   ----------------------------------------------------------
   VISUAL LAYER ONLY

   mrsmileEvents.js:
        └── управляет последовательностью

   mrsmileAppearance.js:
        ├── глаза
        ├── лицо
        ├── взгляд
        ├── cursor visual
        ├── subtle presence
        └── disappearance

   Никакого:
        - screen shake spam
        - random RGB glitch
        - giant horror overlays
        - повторного first-contact sequence
        - глобального блокирования pointer-events
========================================================== */


/* ==========================================================
   STATE
========================================================== */

let manifestationRunning = false;

let manifestationRoot = null;
let faceElement = null;
let eyesLayer = null;

let cursorVisual = null;
let cursorMouseHandler = null;

let appearanceTimers = [];

let firstContactAppearance = false;

let playerMouseX =
    window.innerWidth * 0.5;

let playerMouseY =
    window.innerHeight * 0.5;


/* ==========================================================
   PUBLIC
========================================================== */

/**
 * Обычная manifestation.
 *
 * Используется другими системами OMEGA,
 * когда MR.SMILE должен самостоятельно
 * появиться и исчезнуть.
 */
export async function triggerMrSmileManifestation() {

    if (manifestationRunning) {
        return;
    }

    manifestationRunning = true;
    firstContactAppearance = false;

    try {

        createManifestation();

        await runPresenceAppearance();

    } catch (error) {

        console.error(
            "[MR.SMILE] Manifestation failed:",
            error
        );

    } finally {

        cleanupAppearance();

        manifestationRunning = false;
        firstContactAppearance = false;
    }
}


/* ==========================================================
   FIRST CONTACT FACE
========================================================== */

/**
 * Используется mrsmileEvents.js.
 *
 * ВАЖНО:
 *
 * presence теперь НЕ ждёт полного disappearance.
 *
 * Последовательность:
 *
 *      create
 *        ↓
 *      eyes
 *        ↓
 *      face
 *        ↓
 *      return
 *
 * После return лицо остаётся на экране.
 *
 * mrsmileEvents.js продолжает:
 *
 *      player interaction
 *        ↓
 *      cursor takeover
 *        ↓
 *      intrusion
 *        ↓
 *      release
 *
 * И только releaseMrSmileFirstContactFace()
 * убирает лицо.
 */
export async function showMrSmileFirstContactFace(
    mode = "presence"
) {

    if (manifestationRunning) {
        return;
    }

    manifestationRunning = true;
    firstContactAppearance = true;

    try {

        createManifestation();

        switch (mode) {

            case "echo":

                await runEchoAppearance();

                cleanupAppearance();

                manifestationRunning = false;
                firstContactAppearance = false;

                break;


            case "silence":

                await runSilenceAppearance();

                cleanupAppearance();

                manifestationRunning = false;
                firstContactAppearance = false;

                break;


            case "presence":
            default:

                /*
                 * Специальный first-contact режим.
                 *
                 * Здесь НЕТ fade-out.
                 */

                await runFirstContactPresence();

                /*
                 * Ничего не чистим.
                 *
                 * Лицо должно остаться.
                 */

                break;
        }

    } catch (error) {

        console.error(
            "[MR.SMILE] First contact appearance failed:",
            error
        );

        cleanupAppearance();

        manifestationRunning = false;
        firstContactAppearance = false;
    }
}


/* ==========================================================
   FIRST CONTACT PRESENCE
========================================================== */

/**
 * Только появление лица.
 *
 * Никакого исчезновения.
 */
async function runFirstContactPresence() {

    if (!manifestationRoot) {
        return;
    }


    /*
     * Изначально ничего нет.
     */

    manifestationRoot.classList.add(
        "mrSmileAppearanceInitial"
    );


    await sleep(500);


    if (!manifestationRoot) {
        return;
    }


    /*
     * Очень слабое присутствие.
     */

    manifestationRoot.classList.remove(
        "mrSmileAppearanceInitial"
    );

    manifestationRoot.classList.add(
        "mrSmilePresence"
    );


    await sleep(700);


    if (!manifestationRoot) {
        return;
    }


    /*
     * Глаза.
     */

    revealEyes();


    await sleep(1300);


    if (!manifestationRoot) {
        return;
    }


    /*
     * Лицо начинает проявляться.
     */

    revealFace();


    await sleep(900);


    if (!manifestationRoot) {
        return;
    }


    /*
     * Улыбка здесь НЕ обязана
     * появляться мгновенно.
     *
     * Оставляем лицо спокойным.
     *
     * Небольшая задержка создаёт
     * ощущение наблюдения.
     */

    await sleep(700);


    if (!manifestationRoot) {
        return;
    }


    revealSmile();


    /*
     * ВАЖНО:
     *
     * Никакого fadeOutManifestation().
     *
     * Лицо остаётся.
     */

    manifestationRoot.classList.add(
        "mrSmileFirstContactPersistent"
    );
}


/* ==========================================================
   NORMAL PRESENCE
========================================================== */

async function runPresenceAppearance() {

    if (!manifestationRoot) {
        return;
    }


    manifestationRoot.classList.add(
        "mrSmileAppearanceInitial"
    );


    await sleep(500);


    if (!manifestationRoot) {
        return;
    }


    manifestationRoot.classList.remove(
        "mrSmileAppearanceInitial"
    );

    manifestationRoot.classList.add(
        "mrSmilePresence"
    );


    await sleep(700);


    revealEyes();


    await sleep(1300);


    revealFace();


    await sleep(1500);


    await sleep(1000);


    revealSmile();


    await sleep(1600);


    await fadeOutManifestation();
}


/* ==========================================================
   ECHO APPEARANCE
========================================================== */

async function runEchoAppearance() {

    if (!manifestationRoot) {
        return;
    }


    manifestationRoot.classList.add(
        "mrSmilePresence"
    );


    await sleep(500);


    revealEyes();


    await sleep(1100);


    lookAtPlayer();


    await sleep(800);


    revealFace();


    await sleep(900);


    revealSmile();


    await sleep(900);


    await fadeOutManifestation();
}


/* ==========================================================
   SILENCE APPEARANCE
========================================================== */

async function runSilenceAppearance() {

    if (!manifestationRoot) {
        return;
    }


    manifestationRoot.classList.add(
        "mrSmilePresence"
    );


    await sleep(900);


    revealEyes();


    await sleep(1200);


    lookAtPlayer();


    await sleep(1000);


    blinkEyes();


    await sleep(700);


    revealFace();


    await sleep(900);


    revealSmile();


    await sleep(1100);


    await fadeOutManifestation();
}


/* ==========================================================
   CREATE MANIFESTATION
========================================================== */

function createManifestation() {

    cleanupAppearance();


    manifestationRoot =
        document.createElement("div");


    manifestationRoot.id =
        "mrSmileManifestation";


    manifestationRoot.className =
        "mrSmileManifestation";


    manifestationRoot.innerHTML = `

        <div
            class="mrSmileFace"
            aria-hidden="true"
        >

            <div class="mrSmileFaceTrace"></div>


            <div
                class="mrSmileEye mrSmileEyeLeft"
            >

                <div class="mrSmileEyeIris">

                    <div
                        class="mrSmileEyePupil"
                    ></div>

                </div>

            </div>


            <div
                class="mrSmileEye mrSmileEyeRight"
            >

                <div class="mrSmileEyeIris">

                    <div
                        class="mrSmileEyePupil"
                    ></div>

                </div>

            </div>


            <div class="mrSmileNose"></div>


            <div class="mrSmileMouth">

                <div
                    class="mrSmileMouthLine"
                ></div>


                <div class="mrSmileTeeth">

                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>

                </div>

            </div>


            <div
                class="mrSmileFaceScan"
            ></div>

        </div>

    `;


    document.body.appendChild(
        manifestationRoot
    );


    faceElement =
        manifestationRoot.querySelector(
            ".mrSmileFace"
        );


    eyesLayer =
        manifestationRoot.querySelectorAll(
            ".mrSmileEye"
        );


    /*
     * Следим за мышью.
     *
     * Пока MR.SMILE только наблюдает,
     * взгляд следует за движением пользователя.
     */

    cursorMouseHandler =
        event => {

            playerMouseX =
                event.clientX;

            playerMouseY =
                event.clientY;


            if (
                manifestationRoot &&
                manifestationRoot.classList.contains(
                    "mrSmileTrackingCursor"
                )
            ) {

                updateEyeDirection(
                    playerMouseX,
                    playerMouseY
                );

            }

        };


    document.addEventListener(
        "mousemove",
        cursorMouseHandler,
        true
    );
}


/* ==========================================================
   REVEAL EYES
========================================================== */

function revealEyes() {

    if (!manifestationRoot) {
        return;
    }


    manifestationRoot.classList.add(
        "mrSmileEyesVisible"
    );


    manifestationRoot.classList.add(
        "mrSmileTrackingCursor"
    );


    updateEyeDirection(
        playerMouseX,
        playerMouseY
    );
}


/* ==========================================================
   REVEAL FACE
========================================================== */

function revealFace() {

    if (!manifestationRoot) {
        return;
    }


    manifestationRoot.classList.add(
        "mrSmileFaceVisible"
    );
}


/* ==========================================================
   REVEAL SMILE
========================================================== */

function revealSmile() {

    if (!manifestationRoot) {
        return;
    }


    manifestationRoot.classList.add(
        "mrSmileSmileVisible"
    );
}


/* ==========================================================
   LOOK AT PLAYER
========================================================== */

function lookAtPlayer() {

    if (!faceElement) {
        return;
    }


    manifestationRoot.classList.add(
        "mrSmileLookingAtPlayer"
    );


    updateEyeDirection(
        playerMouseX,
        playerMouseY
    );
}


/* ==========================================================
   EYE DIRECTION
========================================================== */

function updateEyeDirection(
    x,
    y
) {

    if (!eyesLayer) {
        return;
    }


    const centerX =
        window.innerWidth * 0.5;

    const centerY =
        window.innerHeight * 0.5;


    const dx =
        x - centerX;

    const dy =
        y - centerY;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance <= 1) {
        return;
    }


    /*
     * Очень ограниченное движение.
     *
     * Глаза не должны выглядеть
     * как два шарика, следящие
     * за мышью.
     */

    const maxX = 5;
    const maxY = 4;


    const normalizedX =
        Math.max(
            -1,
            Math.min(
                1,
                dx /
                Math.max(
                    window.innerWidth * 0.35,
                    1
                )
            )
        );


    const normalizedY =
        Math.max(
            -1,
            Math.min(
                1,
                dy /
                Math.max(
                    window.innerHeight * 0.35,
                    1
                )
            )
        );


    const offsetX =
        normalizedX * maxX;

    const offsetY =
        normalizedY * maxY;


    eyesLayer.forEach(
        eye => {

            eye.style.setProperty(
                "--mr-eye-x",
                `${offsetX}px`
            );

            eye.style.setProperty(
                "--mr-eye-y",
                `${offsetY}px`
            );

        }
    );
}


/* ==========================================================
   BLINK
========================================================== */

async function blinkEyes() {

    if (!manifestationRoot) {
        return;
    }


    manifestationRoot.classList.add(
        "mrSmileEyesClosed"
    );


    await sleep(180);


    if (!manifestationRoot) {
        return;
    }


    manifestationRoot.classList.remove(
        "mrSmileEyesClosed"
    );
}


/* ==========================================================
   FADE OUT
========================================================== */

async function fadeOutManifestation() {

    if (!manifestationRoot) {
        return;
    }


    manifestationRoot.classList.add(
        "mrSmileManifestationLeaving"
    );


    await sleep(700);


    if (!manifestationRoot) {
        return;
    }


    manifestationRoot.classList.add(
        "mrSmileManifestationGone"
    );


    await sleep(350);
}


/* ==========================================================
   RELEASE FIRST CONTACT FACE
========================================================== */

/**
 * Вызывается mrsmileEvents.js
 * во время финального release.
 *
 * Именно здесь заканчивается
 * persistent first-contact appearance.
 */
export async function releaseMrSmileFirstContactFace() {

    if (!firstContactAppearance) {
        return;
    }


    if (!manifestationRoot) {

        manifestationRunning = false;
        firstContactAppearance = false;

        return;
    }


    try {

        await fadeOutManifestation();

    } finally {

        cleanupAppearance();

        manifestationRunning = false;
        firstContactAppearance = false;

    }
}


/* ==========================================================
   CONTROLLED CURSOR
========================================================== */

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


    return cursorVisual;
}


/* ==========================================================
   CURSOR FOLLOW PLAYER
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

                const elapsed =
                    currentTime -
                    startTime;


                const progress =
                    Math.min(
                        1,
                        elapsed /
                        duration
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


    await sleep(150);


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


    await sleep(500);


    if (!cursorVisual) {
        return;
    }


    cursorVisual.remove();

    cursorVisual = null;
}


/* ==========================================================
   PUBLIC CURSOR CLEANUP
========================================================== */

export function destroyMrSmileControlledCursor() {

    if (cursorVisual) {

        cursorVisual.remove();

        cursorVisual = null;

    }
}


/* ==========================================================
   SUBTLE SYSTEM DISTORTION
========================================================== */

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
   PRESENCE TRACE
========================================================== */

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
            OBSERVER
        </span>

        <span>
            01
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


    trace.remove();
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


    if (manifestationRoot) {

        manifestationRoot.remove();

        manifestationRoot = null;
    }


    faceElement = null;
    eyesLayer = null;


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
   DEBUG
========================================================== */

export function isMrSmileManifestationActive() {

    return manifestationRunning;
}


/* ==========================================================
   END
========================================================== */
