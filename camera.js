/* ==========================================================
   OMEGA CAMERA SYSTEM
   Camera System + MR.SMILE Context Integration
========================================================== */

import {
    trigger
} from "./eventManager.js";


/* ==========================================================
   STATE
========================================================== */

let currentCam = 0;
let clockTimer = null;


/* ==========================================================
   CAMERAS
========================================================== */

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
   MR.SMILE CONTEXT
========================================================== */

/*
    Camera only reports operator actions.

    It does NOT decide what MR.SMILE should do.

    Flow:

        Camera
           ↓
        operatorAction
           ↓
        mrsmileContext.js
           ↓
        mrsmileBehavior.js
           ↓
        Decision
           ↓
        mrsmileActions.js
*/


function reportMrSmileCameraAction(
    data = {}
) {

    try {

        trigger(
            "mrsmile:operatorAction",
            {

                source: "camera",

                page: "camera",

                operator:
                    data.operator ||
                    "operator",

                ...data

            }
        );


    } catch (error) {

        console.warn(
            "[OMEGA CAMERA] MR.SMILE context report failed:",
            error
        );

    }

}


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

    const view =
        document.getElementById(
            "cameraView"
        );


    if (!view) {

        console.warn(
            "[OMEGA CAMERA] cameraView NOT FOUND"
        );

        return;

    }


    const camera =
        cameras[currentCam];


    if (!camera) {

        console.error(
            "[OMEGA CAMERA] Camera does not exist:",
            currentCam
        );

        return;

    }


    view.innerHTML = `

        <div class="cameraScreen">

            <img
                class="cameraImage"
                src="${escapeAttribute(camera.image)}"
                alt="${escapeAttribute(camera.name)}"
            >

            <!-- EFFECTS -->

            <div class="cameraScanlines"></div>

            <div class="cameraNoise"></div>

            <div class="cameraVignette"></div>


            <!-- INTERFACE -->

            <div class="cameraOverlay">

                <div class="cameraTop">

                    <span>
                        ${escapeHtml(camera.id)}
                    </span>


                    <span class="cameraRec">

                        <span class="recDot">
                            ●
                        </span>

                        REC

                    </span>

                </div>


                <div class="cameraStatus">

                    OMEGA SECURITY NETWORK

                </div>


                <div class="cameraBottom">

                    <span>
                        ${escapeHtml(camera.name)}
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


    /* ======================================================
       IMAGE ERROR
    ====================================================== */

    const image =
        view.querySelector(
            ".cameraImage"
        );


    if (image) {

        image.addEventListener(
            "error",
            () => {

                image.style.display =
                    "none";


                const screen =
                    view.querySelector(
                        ".cameraScreen"
                    );


                if (!screen) {

                    return;

                }


                /*
                    Prevent duplicate
                    SIGNAL LOST elements.
                */

                if (
                    screen.querySelector(
                        ".cameraOffline"
                    )
                ) {

                    return;

                }


                screen.insertAdjacentHTML(
                    "beforeend",
                    `

                        <div class="cameraOffline">

                            SIGNAL LOST

                        </div>

                    `
                );

            }
        );

    }


    /* ======================================================
       CAMERA BOOT EFFECT
    ====================================================== */

    const screen =
        view.querySelector(
            ".cameraScreen"
        );


    if (screen) {

        screen.classList.add(
            "cameraBoot"
        );

    }

}


/* ==========================================================
   NEXT CAMERA
========================================================== */

export function nextCam() {

    const previousCamera =
        cameras[currentCam];


    currentCam++;


    if (
        currentCam >= cameras.length
    ) {

        currentCam = 0;

    }


    const newCamera =
        cameras[currentCam];


    console.log(
        "[OMEGA CAMERA] SWITCH:",
        previousCamera?.id,
        "→",
        newCamera?.id
    );


    /* ======================================================
       REPORT TO MR.SMILE
    ====================================================== */

    reportMrSmileCameraAction({

        type:
            "camera_switch",

        target:
            newCamera?.id ||
            null,

        action:
            "switch",

        reason:
            "operator_switched_camera",

        metadata: {

            previousCamera: {

                id:
                    previousCamera?.id ||
                    null,

                name:
                    previousCamera?.name ||
                    null

            },

            currentCamera: {

                id:
                    newCamera?.id ||
                    null,

                name:
                    newCamera?.name ||
                    null,

                signal:
                    newCamera?.signal ??
                    null

            },

            cameraIndex:
                currentCam

        }

    });


    showCamera();

}


/* ==========================================================
   PREVIOUS CAMERA
========================================================== */

export function previousCam() {

    const previousCamera =
        cameras[currentCam];


    currentCam--;


    if (
        currentCam < 0
    ) {

        currentCam =
            cameras.length - 1;

    }


    const newCamera =
        cameras[currentCam];


    console.log(
        "[OMEGA CAMERA] SWITCH:",
        previousCamera?.id,
        "→",
        newCamera?.id
    );


    reportMrSmileCameraAction({

        type:
            "camera_switch",

        target:
            newCamera?.id ||
            null,

        action:
            "switch",

        reason:
            "operator_switched_camera",

        metadata: {

            direction:
                "previous",

            previousCamera: {

                id:
                    previousCamera?.id ||
                    null,

                name:
                    previousCamera?.name ||
                    null

            },

            currentCamera: {

                id:
                    newCamera?.id ||
                    null,

                name:
                    newCamera?.name ||
                    null,

                signal:
                    newCamera?.signal ??
                    null

            },

            cameraIndex:
                currentCam

        }

    });


    showCamera();

}


/* ==========================================================
   GET CURRENT CAMERA
========================================================== */

export function getCurrentCamera() {

    return cameras[currentCam] ||
        null;

}


/* ==========================================================
   GET CAMERA INDEX
========================================================== */

export function getCurrentCameraIndex() {

    return currentCam;

}


/* ==========================================================
   GET ALL CAMERAS
========================================================== */

export function getCameras() {

    return [
        ...cameras
    ];

}


/* ==========================================================
   CAMERA OPEN
========================================================== */

export function reportCameraOpened() {

    const camera =
        cameras[currentCam];


    reportMrSmileCameraAction({

        type:
            "camera_open",

        target:
            camera?.id ||
            null,

        action:
            "open",

        reason:
            "operator_opened_camera",

        metadata: {

            camera: {

                id:
                    camera?.id ||
                    null,

                name:
                    camera?.name ||
                    null,

                signal:
                    camera?.signal ??
                    null

            },

            cameraIndex:
                currentCam

        }

    });

}


/* ==========================================================
   CAMERA CLOSE
========================================================== */

export function reportCameraClosed() {

    const camera =
        cameras[currentCam];


    reportMrSmileCameraAction({

        type:
            "camera_close",

        target:
            camera?.id ||
            null,

        action:
            "close",

        reason:
            "operator_closed_camera",

        metadata: {

            cameraId:
                camera?.id ||
                null,

            cameraName:
                camera?.name ||
                null

        }

    });

}


/* ==========================================================
   CLOCK
========================================================== */

function startClock() {

    if (clockTimer) {

        clearInterval(
            clockTimer
        );

    }


    clockTimer =
        setInterval(
            () => {

                const time =
                    document.querySelector(
                        ".cameraTime"
                    );


                if (!time) {

                    return;

                }


                time.textContent =
                    getCameraTime();

            },
            1000
        );

}


/* ==========================================================
   CAMERA TIME
========================================================== */

function getCameraTime() {

    const now =
        new Date();


    return now.toLocaleTimeString(
        "en-GB",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHtml(
    text
) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* ==========================================================
   ESCAPE ATTRIBUTE
========================================================== */

function escapeAttribute(
    text
) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        );

}


/* ==========================================================
   GLOBAL CAMERA API
========================================================== */

window.nextCam =
    nextCam;


window.previousCam =
    previousCam;


window.getCurrentCamera =
    getCurrentCamera;


window.getCurrentCameraIndex =
    getCurrentCameraIndex;


/* ==========================================================
   DEBUG CAMERA API
========================================================== */

window.OMEGA_CAMERA = {

    status() {

        return {

            index:
                currentCam,

            camera:
                getCurrentCamera(),

            total:
                cameras.length

        };

    },


    next() {

        return nextCam();

    },


    previous() {

        return previousCam();

    },


    open() {

        reportCameraOpened();

    },


    close() {

        reportCameraClosed();

    }

};
