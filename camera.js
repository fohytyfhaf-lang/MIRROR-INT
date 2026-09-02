/* ==========================================================
   OMEGA SECURITY CAMERA SYSTEM
========================================================== */

let currentCam = 0;
let cameraClockTimer = null;
let cameraEventTimer = null;

const cameras = [
    {
        id: "CAM 01",
        name: "BASE AREA",
        image: "./images/cam_ba.jpg",
        signal: 98
    },

    {
        id: "CAM 02",
        name: "CORRIDOR",
        image: "./images/cam_cor.jpg",
        signal: 97
    },

    {
        id: "CAM 03",
        name: "SERVER ROOM",
        image: "./images/cam_server.jpg",
        signal: 99
    },

    {
        id: "CAM 04",
        name: "EXIT",
        image: "./images/cam_exit.jpg",
        signal: 96
    },

    {
        id: "CAM 05",
        name: "BLACK ZONE",
        image: "./images/cam_black.jpg",
        signal: 72
    },

    {
        id: "CAM 06",
        name: "UNKNOWN AREA",
        image: "./images/ooooo.jpg",
        signal: 84
    },

    {
        id: "CAM 07",
        name: "RESTRICTED AREA",
        image: "./images/cam_secret.gif",
        signal: 91
    }
];


/* ==========================================================
   INITIALIZATION
========================================================== */

export function initCamera() {

    showCamera();

    startCameraClock();

    startCameraEvents();
}


/* ==========================================================
   SHOW CAMERA
========================================================== */

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

            <div class="cameraVignette"></div>

            <div class="cameraTop">

                <span class="cameraID">
                    ${camera.id}
                </span>

                <span class="cameraRec">
                    <span class="recDot">●</span> REC
                </span>

            </div>

            <div class="cameraStatus">
                OMEGA SECURITY NETWORK
            </div>

            <div class="cameraBottom">

                <span class="cameraName">
                    ${camera.name}
                </span>

                <span class="cameraSignal">
                    SIGNAL:
                    <b>${camera.signal}%</b>
                </span>

            </div>

            <div class="cameraTime">
                ${getCameraTime()}
            </div>

        </div>
    `;


    const image = view.querySelector(".cameraImage");

    if (image) {

        image.addEventListener("error", () => {

            showCameraOffline();

        });

    }


    const screen = view.querySelector(".cameraScreen");

    if (screen) {

        screen.classList.remove("cameraStartup");

        void screen.offsetWidth;

        screen.classList.add("cameraStartup");

    }
}


/* ==========================================================
   CAMERA IMAGE ERROR
========================================================== */

function showCameraOffline() {

    const view = document.getElementById("cameraView");

    if (!view) return;

    const screen = view.querySelector(".cameraScreen");

    if (!screen) return;

    const image = screen.querySelector(".cameraImage");

    if (image) {
        image.style.display = "none";
    }

    const offline = document.createElement("div");

    offline.className = "cameraOffline";

    offline.innerHTML = `
        <div class="offlineContent">

            <div class="offlineTitle">
                SIGNAL ERROR
            </div>

            <div class="offlineSub">
                CAMERA ${String(currentCam + 1).padStart(2, "0")}
            </div>

            <div class="offlineText">
                CONNECTION LOST
            </div>

        </div>
    `;

    screen.appendChild(offline);
}


/* ==========================================================
   NEXT CAMERA
========================================================== */

export function nextCam() {

    currentCam++;

    if (currentCam >= cameras.length) {
        currentCam = 0;
    }

    showCamera();

    cameraSwitchEffect();
}


/* ==========================================================
   PREVIOUS CAMERA
========================================================== */

export function previousCam() {

    currentCam--;

    if (currentCam < 0) {
        currentCam = cameras.length - 1;
    }

    showCamera();

    cameraSwitchEffect();
}


/* ==========================================================
   CAMERA SWITCH EFFECT
========================================================== */

function cameraSwitchEffect() {

    const view = document.getElementById("cameraView");

    if (!view) return;

    const screen = view.querySelector(".cameraScreen");

    if (!screen) return;

    screen.classList.add("cameraSwitch");

    setTimeout(() => {

        screen.classList.remove("cameraSwitch");

    }, 350);
}


/* ==========================================================
   CAMERA CLOCK
========================================================== */

function startCameraClock() {

    if (cameraClockTimer) {

        clearInterval(cameraClockTimer);

    }

    cameraClockTimer = setInterval(() => {

        const time = document.querySelector(".cameraTime");

        if (!time) return;

        time.textContent = getCameraTime();

    }, 1000);
}


function getCameraTime() {

    const now = new Date();

    return now.toLocaleTimeString("en-GB", {

        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"

    });

}


/* ==========================================================
   RANDOM CAMERA EVENTS
========================================================== */

function startCameraEvents() {

    if (cameraEventTimer) {

        clearInterval(cameraEventTimer);

    }

    /*
       Камеры большую часть времени
       работают нормально.

       События редкие.
    */

    cameraEventTimer = setInterval(() => {

        const cameraWindow =
            document.getElementById("cameraWindow");

        if (!cameraWindow) return;

        if (cameraWindow.classList.contains("hidden")) {
            return;
        }

        const roll = Math.random();


        /*
           5% — краткая потеря сигнала
        */

        if (roll < 0.05) {

            signalInterference();

            return;
        }


        /*
           3% — короткое мигание камеры
        */

        if (roll < 0.08) {

            cameraFlicker();

        }

    }, 15000);
}


/* ==========================================================
   SIGNAL INTERFERENCE
========================================================== */

function signalInterference() {

    const view = document.getElementById("cameraView");

    if (!view) return;

    const screen = view.querySelector(".cameraScreen");

    if (!screen) return;

    screen.classList.add("cameraInterference");

    setTimeout(() => {

        screen.classList.remove("cameraInterference");

    }, 700);
}


/* ==========================================================
   CAMERA FLICKER
========================================================== */

function cameraFlicker() {

    const view = document.getElementById("cameraView");

    if (!view) return;

    const screen = view.querySelector(".cameraScreen");

    if (!screen) return;

    screen.classList.add("cameraFlicker");

    setTimeout(() => {

        screen.classList.remove("cameraFlicker");

    }, 500);
}


/* ==========================================================
   CLEANUP
========================================================== */

export function destroyCamera() {

    if (cameraClockTimer) {

        clearInterval(cameraClockTimer);

        cameraClockTimer = null;

    }

    if (cameraEventTimer) {

        clearInterval(cameraEventTimer);

        cameraEventTimer = null;

    }

}
