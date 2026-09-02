/* ==========================================================
   OMEGA SECURITY CAMERA SYSTEM
========================================================== */

let currentCam = 0;
let cameraClockTimer = null;
let glitchTimer = null;
let autoEventTimer = null;

const cameras = [
    {
        id: "CAM 01",
        name: "MAIN HALL",
        image: "./images/cam_hall.gif",
        signal: 98
    },

    {
        id: "CAM 02",
        name: "SERVER ROOM",
        image: "./images/cam_server.gif",
        signal: 96
    },

    {
        id: "CAM 03",
        name: "RESEARCH LAB",
        image: "./images/cam_lab.gif",
        signal: 94
    },

    {
        id: "CAM 04",
        name: "OFFICE",
        image: "./images/cam_office.gif",
        signal: 99
    },

    {
        id: "CAM 05",
        name: "STORAGE",
        image: "./images/cam_storage.gif",
        signal: 91
    },

    {
        id: "CAM 06",
        name: "RESTRICTED AREA",
        image: "./images/cam_secret.gif",
        signal: 87
    },

    {
        id: "CAM 07",
        name: "IDLE CHANNEL",
        image: "./images/cam_idle.gif",
        signal: 100
    },

    {
        id: "CAM 08",
        name: "UNKNOWN CAMERA",
        image: "./images/camera.png",
        signal: 73
    }
];


/* ==========================================================
   INIT
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

            <img
                class="cameraNoise"
                src="./images/noise.gif"
                alt=""
            >

            <div class="cameraTop">

                <span class="cameraID">
                    ${camera.id}
                </span>

                <span class="cameraRec">
                    ● REC
                </span>

            </div>

            <div class="cameraStatus">
                SECURITY NETWORK // OMEGA
            </div>

            <div class="cameraBottom">

                <span class="cameraName">
                    ${camera.name}
                </span>

                <span class="cameraSignal">
                    SIGNAL: <b>${camera.signal}%</b>
                </span>

            </div>

            <div class="cameraTime">
                ${getCameraTime()}
            </div>

        </div>
    `;


    /* ------------------------------------------------------
       IMAGE ERROR
    ------------------------------------------------------ */

    const image = view.querySelector(".cameraImage");

    if (image) {

        image.addEventListener("error", () => {

            image.style.display = "none";

            const screen = view.querySelector(".cameraScreen");

            if (!screen) return;

            const offline = document.createElement("div");

            offline.className = "cameraOffline";

            offline.innerHTML = `
                <div>
                    <div>SIGNAL ERROR</div>
                    <small>${camera.id}</small>
                </div>
            `;

            screen.appendChild(offline);
        });

    }


    /* ------------------------------------------------------
       INITIAL GLITCH
    ------------------------------------------------------ */

    const screen = view.querySelector(".cameraScreen");

    if (screen) {

        screen.classList.remove("cameraGlitch");

        void screen.offsetWidth;

        screen.classList.add("cameraGlitch");

    }
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

    randomCameraReaction();
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

    randomCameraReaction();
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
   RANDOM CAMERA REACTION
========================================================== */

function randomCameraReaction() {

    const roll = Math.random();

    /*
        15% chance:
        signal glitch
    */

    if (roll < 0.15) {

        setTimeout(() => {
            triggerGlitch();
        }, 250);

        return;
    }


    /*
        8% chance:
        alert
    */

    if (roll < 0.23) {

        setTimeout(() => {
            triggerAlert();
        }, 400);

    }

}


/* ==========================================================
   GLITCH
========================================================== */

export function triggerGlitch() {

    const view = document.getElementById("cameraView");

    if (!view) return;

    const screen = view.querySelector(".cameraScreen");

    if (!screen) return;


    if (glitchTimer) {
        clearTimeout(glitchTimer);
    }


    const effect = document.createElement("div");

    effect.className = "cameraEffect cameraGlitchEffect";

    effect.innerHTML = `
        <img
            src="./images/cam_glitch.gif"
            alt=""
        >

        <div class="cameraLostText">
            SIGNAL INTERFERENCE
        </div>
    `;

    screen.appendChild(effect);


    screen.classList.add("cameraSignalLost");


    glitchTimer = setTimeout(() => {

        screen.classList.remove("cameraSignalLost");

        effect.remove();

    }, 900);

}


/* ==========================================================
   ALERT
========================================================== */

export function triggerAlert() {

    const view = document.getElementById("cameraView");

    if (!view) return;

    const screen = view.querySelector(".cameraScreen");

    if (!screen) return;


    const alert = document.createElement("div");

    alert.className = "cameraEffect cameraAlertEffect";

    alert.innerHTML = `
        <img
            src="./images/cam_alert.gif"
            alt=""
        >

        <div class="cameraAlertText">
            MOTION DETECTED
        </div>
    `;

    screen.appendChild(alert);


    setTimeout(() => {

        alert.remove();

    }, 1500);

}


/* ==========================================================
   AUTOMATIC CAMERA EVENTS
========================================================== */

function startCameraEvents() {

    if (autoEventTimer) {
        clearInterval(autoEventTimer);
    }


    /*
        Every 15 seconds the system has a chance
        to react.

        Most of the time NOTHING happens.
        This keeps the cameras believable.
    */

    autoEventTimer = setInterval(() => {

        const view = document.getElementById("cameraView");

        if (!view) return;

        const cameraWindow = document.getElementById("cameraWindow");

        if (
            cameraWindow &&
            cameraWindow.classList.contains("hidden")
        ) {
            return;
        }


        const roll = Math.random();


        /*
            5% glitch
        */

        if (roll < 0.05) {

            triggerGlitch();

            return;
        }


        /*
            3% motion alert
        */

        if (roll < 0.08) {

            triggerAlert();

        }

    }, 15000);

}
