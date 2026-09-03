/* ==========================================================
   MR.SMILE — OMEGA INTERFACE MANIFESTATION
========================================================== */

let manifestationRunning = false;
let firstContactAppearanceCount = 0;
let cursorController = null;


/* ==========================================================
   NORMAL MANIFESTATION
   Для последующих коротких появлений MR.SMILE
========================================================== */

export async function triggerMrSmileManifestation() {

    if (manifestationRunning) return;

    manifestationRunning = true;

    const overlay = createManifestation();

    document.body.classList.add(
        "mrSmileInterfaceCollapse"
    );

    try {

        await sleep(500);

        overlay.classList.add("phase-1");

        await sleep(700);

        overlay.classList.add("phase-2");

        await sleep(900);

        overlay.classList.add("phase-3");

        await sleep(1100);

        overlay.classList.add("phase-4");

        await sleep(700);

        overlay.classList.add("phase-final");

        await sleep(350);

        overlay.classList.add("phase-release");

        await sleep(500);

    } finally {

        overlay.remove();

        document.body.classList.remove(
            "mrSmileInterfaceCollapse"
        );

        manifestationRunning = false;

    }
}


/* ==========================================================
   FIRST CONTACT
   Полная первая манифестация MR.SMILE
   ~3 минуты
========================================================== */

export async function showMrSmileFirstContactFace() {

    if (manifestationRunning) return;

    manifestationRunning = true;

    firstContactAppearanceCount++;

    const appearance =
        firstContactAppearanceCount;

    const overlay =
        createManifestation();

    document.body.classList.add(
        "mrSmileInterfaceCollapse"
    );

    document.body.classList.add(
        "mrSmileCursorControlled"
    );


    try {

        /* ==================================================
           ПЕРВАЯ МАНИФЕСТАЦИЯ
        ================================================== */

        if (appearance === 1) {

            /*
             * 00:00 — 00:20
             *
             * Ничего.
             *
             * Пользователь должен успеть подумать,
             * что событие закончилось.
             */

            await sleep(18000);


            /*
             * 00:20
             *
             * Первые признаки.
             */

            overlay.classList.add(
                "phase-1"
            );

            await sleep(2000);


            /*
             * 00:20 — 00:45
             *
             * Интерфейс начинает собираться.
             */

            overlay.classList.add(
                "phase-2"
            );

            await sleep(25000);


            /*
             * 00:45 — 01:10
             *
             * Появляются глаза.
             */

            overlay.classList.add(
                "phase-3"
            );

            await sleep(25000);


            /*
             * 01:10 — 01:30
             *
             * Пользователь уже понимает,
             * что перед ним лицо.
             */

            overlay.classList.add(
                "phase-4"
            );

            await sleep(20000);


            /*
             * 01:30 — 01:50
             *
             * Формируется улыбка.
             *
             * Очень медленно.
             */

            overlay.classList.add(
                "phase-5"
            );

            await sleep(20000);


            /*
             * =============================================
             * 01:50 — 02:10
             *
             * MR.SMILE получает контроль над
             * визуальным курсором.
             * =============================================
             */

            overlay.classList.add(
                "phase-cursor"
            );

            cursorController =
                createControlledCursor();

            await runCursorControl(
                overlay,
                cursorController
            );

            destroyControlledCursor();


            /*
             * =============================================
             * 02:10 — 02:30
             *
             * MR.SMILE понимает,
             * где находится оператор.
             * =============================================
             */

            overlay.classList.add(
                "phase-6"
            );

            await sleep(20000);


            /*
             * =============================================
             * 02:30 — 02:45
             *
             * Интерфейс начинает проходить
             * через само лицо.
             * =============================================
             */

            overlay.classList.add(
                "phase-7"
            );

            await sleep(15000);


            /*
             * =============================================
             * 02:45 — 02:55
             *
             * Почти полная тишина.
             *
             * Остаётся один глаз.
             * =============================================
             */

            overlay.classList.add(
                "phase-silence"
            );

            await sleep(10000);


            /*
             * =============================================
             * 02:55 — 03:00
             *
             * Лицо распадается.
             * =============================================
             */

            overlay.classList.add(
                "phase-final"
            );

            await sleep(5000);

            overlay.classList.add(
                "phase-release"
            );

            await sleep(1200);

        }


        /* ==================================================
           ВТОРОЕ ПОЯВЛЕНИЕ
           Уже не полноценный контакт.
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
           ПОСЛЕДУЮЩИЕ ПОЯВЛЕНИЯ
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

    }

    finally {

        destroyControlledCursor();

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

    document.body.appendChild(
        cursor
    );


    const state = {

        x: window.innerWidth / 2,

        y: window.innerHeight / 2,

        targetX: window.innerWidth / 2,

        targetY: window.innerHeight / 2,

        controlled: false,

        destroyed: false,

        frame: 0

    };


    /*
     * Реальная мышь продолжает работать.
     *
     * Но когда controlled === true,
     * визуальный курсор OMEGA перестаёт
     * следовать за ней.
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
            `translate3d(
                ${state.x}px,
                ${state.y}px,
                0
            )`;


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

            state.targetX = x;

            state.targetY = y;

        },


        destroy() {

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
   MR.SMILE CONTROLS THE CURSOR
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
     * 1.
     *
     * Пока пользователь ещё контролирует
     * курсор.
     */

    controller.setControlled(
        false
    );

    await sleep(2200);


    /*
     * 2.
     *
     * Передача контроля.
     */

    overlay.classList.add(
        "cursor-transfer"
    );

    controller.setControlled(
        true
    );

    controller.setTarget(
        state.x,
        state.y
    );

    await sleep(1800);


    /*
     * 3.
     *
     * Пользователь двигает мышью,
     * но визуальный курсор больше
     * не двигается.
     */

    overlay.classList.add(
        "cursor-locked"
    );

    await sleep(2200);


    /*
     * 4.
     *
     * Теперь MR.SMILE двигает курсор.
     */

    overlay.classList.add(
        "cursor-self-move"
    );


    const centerX =
        window.innerWidth * 0.50;

    const centerY =
        window.innerHeight * 0.49;


    /*
     * Курсор идёт влево.
     */

    controller.setTarget(
        centerX - 120,
        centerY - 20
    );

    await sleep(1500);


    /*
     * Затем вправо.
     */

    controller.setTarget(
        centerX + 120,
        centerY - 15
    );

    await sleep(1300);


    /*
     * Возвращается к центру.
     */

    controller.setTarget(
        centerX + 20,
        centerY + 10
    );

    await sleep(1300);


    /*
     * 5.
     *
     * MR.SMILE подводит курсор
     * к собственному левому глазу.
     */

    overlay.classList.add(
        "cursor-at-eye"
    );

    controller.setTarget(
        centerX - 105,
        centerY - 35
    );

    await sleep(2400);


    /*
     * 6.
     *
     * Глаз замечает курсор.
     */

    overlay.classList.add(
        "cursor-noticed"
    );

    await sleep(1800);


    /*
     * 7.
     *
     * Внезапно бросает курсор
     * в нижний левый угол.
     */

    controller.setTarget(
        window.innerWidth * 0.17,
        window.innerHeight * 0.80
    );

    await sleep(1200);


    /*
     * 8.
     *
     * Возвращает контроль.
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

    if (!cursorController)
        return;


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


    if (existing)
        existing.remove();


    const overlay =
        document.createElement("div");


    overlay.id =
        "mrSmileManifestation";


    overlay.innerHTML = `

        <!-- =============================================
             INTERFACE FRAGMENTS
        ============================================== -->

        <div class="mrSmileUIFragments">

            <div class="
                mrSmileFragment
                fragment-top
            ">
                OMEGA
            </div>


            <div class="
                mrSmileFragment
                fragment-left
            ">
                SYSTEM
            </div>


            <div class="
                mrSmileFragment
                fragment-right
            ">
                ONLINE
            </div>


            <div class="
                mrSmileFragment
                fragment-bottom
            ">
                STATUS
            </div>


            <div class="
                mrSmileFragment
                fragment-code
                code-1
            ">
                0x00A1
            </div>


            <div class="
                mrSmileFragment
                fragment-code
                code-2
            ">
                PROCESS
            </div>


            <div class="
                mrSmileFragment
                fragment-code
                code-3
            ">
                OBSERVER
            </div>


            <div class="
                mrSmileFragment
                fragment-code
                code-4
            ">
                CAMERA_04
            </div>


            <div class="
                mrSmileFragment
                fragment-code
                code-5
            ">
                ACTIVE
            </div>


            <div class="
                mrSmileFragment
                fragment-line
                line-1
            "></div>


            <div class="
                mrSmileFragment
                fragment-line
                line-2
            "></div>


            <div class="
                mrSmileFragment
                fragment-line
                line-3
            "></div>


            <div class="
                mrSmileFragment
                fragment-line
                line-4
            "></div>


            <div class="
                mrSmileFragment
                fragment-line
                line-5
            "></div>

        </div>


        <!-- =============================================
             FACE
        ============================================== -->

        <div class="mrSmileFace">


            <div class="
                mrSmileEye
                eye-left
            ">

                <span class="
                    eyeCore
                "></span>

            </div>


            <div class="
                mrSmileEye
                eye-right
            ">

                <span class="
                    eyeCore
                "></span>

            </div>


            <div class="
                mrSmileFaceFrame
            "></div>


            <div class="
                mrSmileMouth
            ">

                <div class="
                    mouthOuter
                "></div>


                <div class="
                    mouthInner
                "></div>


                <div class="
                    mouthBreak
                    mouthBreak-1
                "></div>


                <div class="
                    mouthBreak
                    mouthBreak-2
                "></div>

            </div>


            <div class="
                mrSmileFaceScan
            "></div>

        </div>


        <!-- =============================================
             SIGNAL
        ============================================== -->

        <div class="
            mrSmileSignal
        ">

            <span class="
                signalNormal
            ">
                CONNECTION: ACTIVE
            </span>


            <span class="
                signalControl
            ">
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
