let currentCam = 0;

const cameras = [
    {
        id: "CAM 01",
        name: "MAIN HALL",
        image: "./assets/cameras/cam01.jpg"
    },
    {
        id: "CAM 02",
        name: "SERVER ROOM",
        image: "./assets/cameras/cam02.jpg"
    },
    {
        id: "CAM 03",
        name: "OUTSIDE",
        image: "./assets/cameras/cam03.jpg"
    },
    {
        id: "CAM 04",
        name: "UNKNOWN",
        image: "./assets/cameras/cam04.jpg"
    },
    {
        id: "CAM 05",
        name: "RESEARCH HALL",
        image: "./assets/cameras/cam05.jpg"
    },
    {
        id: "CAM 06",
        name: "SECURITY",
        image: "./assets/cameras/cam06.jpg"
    },
    {
        id: "CAM 07",
        name: "UNKNOWN SIGNAL",
        image: "./assets/cameras/cam07.jpg"
    }
];

/* =========================
   INIT CAMERA
========================= */

export function initCamera() {
    showCamera();
}

/* =========================
   SHOW CAMERA
========================= */

function showCamera() {

    const view = document.getElementById("cameraView");

    if (!view) return;

    const camera = cameras[currentCam];

    view.innerHTML = `
        <div class="cameraScreen">

            <img
                class="cameraImage"
                src="${camera.image}"
                alt="${camera.name}"
            >

            <div class="cameraScanlines"></div>
            <div class="cameraNoise"></div>

            <div class="cameraTop">

                <span>
                    ${camera.id}
                </span>

                <span class="cameraRec">
                    ● REC
                </span>

            </div>

            <div class="cameraBottom">

                <span>
                    ${camera.name}
                </span>

                <span>
                    SIGNAL: 98%
                </span>

            </div>

            <div class="cameraTime">
                ${getCameraTime()}
            </div>

        </div>
    `;

    view.classList.remove("cameraGlitch");

    void view.offsetWidth;

    view.classList.add("cameraGlitch");
}

/* =========================
   NEXT CAMERA
========================= */

export function nextCam() {

    currentCam++;

    if (currentCam >= cameras.length) {
        currentCam = 0;
    }

    showCamera();

    if (Math.random() < 0.15) {
        triggerGlitch();
    }
}

/* =========================
   PREVIOUS CAMERA
========================= */

export function previousCam() {

    currentCam--;

    if (currentCam < 0) {
        currentCam = cameras.length - 1;
    }

    showCamera();

    if (Math.random() < 0.10) {
        triggerGlitch();
    }
}

/* =========================
   CAMERA TIME
========================= */

function getCameraTime() {

    const now = new Date();

    return now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

/* =========================
   GLITCH
========================= */

function triggerGlitch() {

    const view = document.getElementById("cameraView");

    if (!view) return;

    const screen = view.querySelector(".cameraScreen");

    if (!screen) return;

    screen.classList.add("cameraSignalLost");

    const oldHTML = screen.innerHTML;

    screen.innerHTML += `
        <div class="cameraLost">
            SIGNAL LOST
        </div>
    `;

    setTimeout(() => {

        screen.classList.remove("cameraSignalLost");

        const lost = screen.querySelector(".cameraLost");

        if (lost) {
            lost.remove();
        }

    }, 600);
}
