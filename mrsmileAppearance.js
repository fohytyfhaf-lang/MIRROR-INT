/* ==========================================================
   MR.SMILE — OMEGA INTERFACE MANIFESTATION
========================================================== */

let manifestationRunning = false;


/* ==========================================================
   NORMAL MANIFESTATION
========================================================== */

export async function triggerMrSmileManifestation() {

    if (manifestationRunning) return;

    manifestationRunning = true;

    console.log(
        "[MR.SMILE] Interface manifestation started."
    );

    const overlay =
        createManifestation();

    document.body.classList.add(
        "mrSmileInterfaceCollapse"
    );

    await sleep(500);

    overlay.classList.add(
        "phase-1"
    );

    await sleep(700);

    overlay.classList.add(
        "phase-2"
    );

    await sleep(900);

    overlay.classList.add(
        "phase-3"
    );

    await sleep(1100);

    overlay.classList.add(
        "phase-4"
    );

    await sleep(700);

    overlay.classList.add(
        "phase-final"
    );

    await sleep(350);

    document.body.classList.remove(
        "mrSmileInterfaceCollapse"
    );

    overlay.classList.add(
        "phase-release"
    );

    await sleep(500);

    overlay.remove();

    console.log(
        "[MR.SMILE] Interface manifestation ended."
    );

    manifestationRunning = false;
}


/* ==========================================================
   FIRST CONTACT — INTERFACE FACE
========================================================== */

export async function showMrSmileFirstContactFace() {

    if (manifestationRunning) return;

    manifestationRunning = true;

    console.log(
        "[MR.SMILE] FIRST CONTACT — INTERFACE FACE"
    );

    const overlay =
        createManifestation();

    /*
       FIRST CONTACT уже находится
       на чёрном фоне.

       Поэтому здесь мы НЕ создаём отдельный
       смайлик. Мы собираем лицо прямо
       из OMEGA-интерфейса.
    */

    await sleep(150);

    /*
       Элементы интерфейса начинают появляться.
    */

    overlay.classList.add(
        "phase-1"
    );

    await sleep(500);

    /*
       Интерфейс начинает сходиться
       к центру.
    */

    overlay.classList.add(
        "phase-2"
    );

    await sleep(650);

    /*
       Формируется лицо.
    */

    overlay.classList.add(
        "phase-3"
    );

    await sleep(900);

    /*
       Лицо начинает ломаться.
    */

    overlay.classList.add(
        "phase-4"
    );

    await sleep(700);

    /*
       Сильное искажение.
    */

    overlay.classList.add(
        "phase-final"
    );

    await sleep(500);

    /*
       Резкое исчезновение.
    */

    overlay.classList.add(
        "phase-release"
    );

    await sleep(600);

    overlay.remove();

    console.log(
        "[MR.SMILE] FIRST CONTACT — INTERFACE FACE ENDED"
    );

    manifestationRunning = false;
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

        <div class="mrSmileUIFragments">

            <div class="mrSmileFragment fragment-top">
                OMEGA
            </div>

            <div class="mrSmileFragment fragment-left">
                SYSTEM
            </div>

            <div class="mrSmileFragment fragment-right">
                ONLINE
            </div>

            <div class="mrSmileFragment fragment-bottom">
                STATUS
            </div>

            <div class="mrSmileFragment fragment-line line-1"></div>

            <div class="mrSmileFragment fragment-line line-2"></div>

            <div class="mrSmileFragment fragment-line line-3"></div>

        </div>


        <div class="mrSmileFace">

            <div class="mrSmileEye eye-left"></div>

            <div class="mrSmileEye eye-right"></div>

            <div class="mrSmileMouth">

                <div class="mouthOuter"></div>

                <div class="mouthInner"></div>

            </div>

        </div>


        <div class="mrSmileSignal">
            CONNECTION: ACTIVE
        </div>

    `;


    document.body.appendChild(
        overlay
    );


    return overlay;
}


/* ==========================================================
   HELPER
========================================================== */

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );

}
