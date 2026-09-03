/* ==========================================================
   MR.SMILE — OMEGA INTERFACE MANIFESTATION
========================================================== */

let manifestationRunning = false;

export async function triggerMrSmileManifestation() {
    if (manifestationRunning) return;
    manifestationRunning = true;

    console.log("[MR.SMILE] Interface manifestation started.");

    const overlay = createManifestation();

    document.body.classList.add("mrSmileInterfaceCollapse");

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

    document.body.classList.remove("mrSmileInterfaceCollapse");

    overlay.classList.add("phase-release");

    await sleep(500);

    overlay.remove();

    console.log("[MR.SMILE] Interface manifestation ended.");

    manifestationRunning = false;
}


function createManifestation() {

    const existing = document.getElementById("mrSmileManifestation");

    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement("div");

    overlay.id = "mrSmileManifestation";

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

    document.body.appendChild(overlay);

    return overlay;
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
