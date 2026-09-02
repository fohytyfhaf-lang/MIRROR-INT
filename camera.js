/* ==========================================================
   OMEGA CAMERA SYSTEM
========================================================== */

let currentCam = 0;
let clockTimer = null;

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
   INIT
========================================================== */

export function initCamera() {

    showCamera();

    startClock();

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

            <div class="cameraOverlay">

                <div class="cameraTop">

                    <span>
                        ${camera.id}
                    </span>

                    <span class="cameraRec">
                        ● REC
                    </span>

                </div>


                <div class="cameraStatus">
                    OMEGA SECURITY NETWORK
                </div>


                <div class="cameraBottom">

                    <span>
                        ${camera.name}
                    </span>

                    <span>
                        SIGNAL:
                        <b>${camera.signal}%</b>
                    </span>

                </div>


                <div class="cameraTime">
                    ${getCameraTime()}
                </div>

            </div>

        </div>

    `;


    const image = view.querySelector(".cameraImage");


    if (image) {

        image.addEventListener("error", () => {

            image.style.display = "none";

            const screen =
                view.querySelector(".cameraScreen");

            if (!screen) return;


            screen.insertAdjacentHTML(
                "beforeend",
                `
                    <div class="cameraOffline">
                        SIGNAL LOST
                    </div>
                `
            );

        });

    }


    /*
        Небольшой эффект включения камеры
    */

    const screen =
        view.querySelector(".cameraScreen");

    if (screen) {

        screen.classList.add("cameraBoot");

    }

}


/* ==========================================================
   NEXT
========================================================== */

export function nextCam() {

    currentCam++;

    if (currentCam >= cameras.length) {

        currentCam = 0;

    }

    showCamera();

}


/* ==========================================================
   PREVIOUS
========================================================== */

export function previousCam() {

    currentCam--;

    if (currentCam < 0) {

        currentCam = cameras.length - 1;

    }

    showCamera();

}


/* ==========================================================
   CLOCK
========================================================== */

function startClock() {

    if (clockTimer) {

        clearInterval(clockTimer);

    }


    clockTimer = setInterval(() => {

        const time =
            document.querySelector(".cameraTime");

        if (!time) return;

        time.textContent =
            getCameraTime();

    }, 1000);

}


function getCameraTime() {

    const now = new Date();

    return now.toLocaleTimeString(
        "en-GB",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}
