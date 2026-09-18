/* ==========================================================
   OMEGA SECURITY SURVEILLANCE SYSTEM
   MIRROR-INT / OMEGA

   Responsibilities:
   - camera channel management
   - live feed rendering
   - channel selection
   - surveillance UI state
   - OMEGA time integration
   - operator action reporting
   - MR.SMILE context integration

   Does NOT:
   - create anomaly events
   - control MR.SMILE behavior
   - create horror effects
========================================================== */

import {
    trigger
} from "./eventManager.js";

import {
    formatOmegaTime
} from "./omegaTime.js";


/* ==========================================================
   STATE
========================================================== */

let currentCam = 0;

let clockTimer = null;


/* ==========================================================
   CAMERA DATABASE
========================================================== */

const cameras = [

    {
        id: "CAM 01",
        name: "BASE AREA",
        image: "./images/cam_ba.jpg",
        signal: 98,
        status: "ONLINE"
    },

    {
        id: "CAM 02",
        name: "CORRIDOR",
        image: "./images/cam_cor.jpg",
        signal: 97,
        status: "ONLINE"
    },

    {
        id: "CAM 03",
        name: "SERVER ROOM",
        image: "./images/cam_server.jpg",
        signal: 99,
        status: "ONLINE"
    },

    {
        id: "CAM 04",
        name: "EXIT",
        image: "./images/cam_exit.jpg",
        signal: 96,
        status: "ONLINE"
    },

    {
        id: "CAM 05",
        name: "BLACK ZONE",
        image: "./images/cam_black.jpg",
        signal: 72,
        status: "DEGRADED"
    },

    {
        id: "CAM 06",
        name: "UNKNOWN AREA",
        image: "./images/ooooo.jpg",
        signal: 84,
        status: "ONLINE"
    },

    {
        id: "CAM 07",
        name: "RESTRICTED AREA",
        image: "./images/cam_secret.gif",
        signal: 91,
        status: "RESTRICTED"
    }

];


/* ==========================================================
   HELPERS
========================================================== */

function getCurrentCameraData() {

    return (
        cameras[currentCam] ||
        null
    );

}


function getCameraNumber(
    camera
) {

    if (!camera) {

        return "--";

    }

    return String(
        cameras.indexOf(
            camera
        ) + 1
    ).padStart(
        2,
        "0"
    );

}


function safeText(
    value,
    fallback = ""
) {

    const text =
        String(
            value ??
            ""
        ).trim();

    return (
        text ||
        fallback
    );

}


/* ==========================================================
   MR.SMILE CONTEXT
========================================================== */

/*
    Camera system only reports
    operator actions.

    Flow:

        Camera
           ↓
        operatorAction
           ↓
        MR.SMILE context
           ↓
        MR.SMILE behavior
           ↓
        decision
*/

function reportMrSmileCameraAction(
    data = {}
) {

    try {

        trigger(
            "mrsmile:operatorAction",
            {

                source:
                    "camera",

                page:
                    "camera",

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
   UI HELPERS
========================================================== */

function updateCameraChannelUI() {

    const channels =
        document.querySelectorAll(
            ".cameraChannel"
        );


    channels.forEach(
        (
            button,
            index
        ) => {

            button.classList.toggle(
                "active",
                index === currentCam
            );

        }
    );


    const camera =
        getCurrentCameraData();


    if (!camera) {

        return;

    }


    const signal =
        document.getElementById(
            "cameraSignalValue"
        );


    if (signal) {

        signal.textContent =
            `${camera.signal}%`;

    }


    const connection =
        document.getElementById(
            "cameraConnectionStatus"
        );


    if (connection) {

        connection.textContent =
            camera.status;

        connection.dataset.state =
            camera.status.toLowerCase();

    }


    /*
     * Update optional
     * current-channel elements.
     */

    const currentId =
        document.getElementById(
            "cameraCurrentId"
        );


    if (currentId) {

        currentId.textContent =
            camera.id;

    }


    const currentName =
        document.getElementById(
            "cameraCurrentName"
        );


    if (currentName) {

        currentName.textContent =
            camera.name;

    }


    const currentChannel =
        document.getElementById(
            "cameraCurrentChannel"
        );


    if (currentChannel) {

        currentChannel.textContent =
            `CH ${getCameraNumber(camera)}`;

    }

}


/* ==========================================================
   CHANNEL LIST
========================================================== */

/*
    The HTML already contains the
    cameraChannel buttons.

    This function can also repair
    the list if they are missing.
*/

function ensureCameraChannelUI() {

    const root =
        document.getElementById(
            "cameraChannelList"
        );


    if (!root) {

        return;

    }


    const existing =
        root.querySelectorAll(
            ".cameraChannel"
        );


    if (
        existing.length ===
        cameras.length
    ) {

        updateCameraChannelUI();

        return;

    }


    root.innerHTML =
        cameras
            .map(
                (
                    camera,
                    index
                ) => `

                    <button
                        class="cameraChannel"
                        type="button"
                        onclick="selectCamera(${index})"
                        data-camera-index="${index}"
                    >

                        <span
                            class="cameraChannelDot"
                        ></span>


                        <span
                            class="cameraChannelInfo"
                        >

                            <strong>
                                ${escapeHtml(
                                    camera.id
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    camera.name
                                )}
                            </small>

                        </span>

                    </button>

                `
            )
            .join("");


    updateCameraChannelUI();

}


/* ==========================================================
   INIT
========================================================== */

export function initCamera() {

    ensureCameraChannelUI();

    showCamera();

    startClock();

    console.log(
        "[OMEGA CAMERA] Surveillance system initialized.",
        {
            cameras:
                cameras.length
        }
    );

}


/* ==========================================================
   LIVE CAMERA VIEW
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
        getCurrentCameraData();


    if (!camera) {

        console.error(
            "[OMEGA CAMERA] Camera does not exist:",
            currentCam
        );

        return;

    }


    const channelNumber =
        getCameraNumber(
            camera
        );


    view.innerHTML = `

        <div
            class="cameraScreen"
            data-camera="${escapeAttribute(
                camera.id
            )}"
        >


            <!-- ======================================
                 VIDEO
            ======================================= -->

            <img
                class="cameraImage"
                src="${escapeAttribute(
                    camera.image
                )}"
                alt="${escapeAttribute(
                    camera.name
                )}"
                draggable="false"
            >


            <!-- ======================================
                 EFFECTS
            ======================================= -->

            <div
                class="cameraScanlines"
            ></div>

            <div
                class="cameraNoise"
            ></div>

            <div
                class="cameraVignette"
            ></div>


            <!-- ======================================
                 CAMERA UI
            ======================================= -->

            <div
                class="cameraOverlay"
            >


                <!-- TOP LEFT -->

                <div
                    class="cameraTop"
                >

                    <span
                        class="cameraFeedIdentity"
                    >

                        ${escapeHtml(
                            camera.id
                        )}

                        <span
                            class="cameraFeedSeparator"
                        >
                            /
                        </span>

                        ${escapeHtml(
                            camera.name
                        )}

                    </span>


                    <!-- TOP RIGHT -->

                    <span
                        class="cameraRec"
                    >

                        <span
                            class="recDot"
                        >
                            ●
                        </span>

                        REC

                    </span>

                </div>


                <!-- SYSTEM LABEL -->

                <div
                    class="cameraStatus"
                >

                    OMEGA SECURITY NETWORK

                    <span
                        class="cameraStatusDivider"
                    >
                        //
                    </span>

                    DIGITAL SURVEILLANCE

                </div>


                <!-- CHANNEL MARKER -->

                <div
                    class="cameraChannelMarker"
                >

                    CH-${channelNumber}

                </div>


                <!-- FRAME CORNERS -->

                <div
                    class="cameraFrame cameraFrameTL"
                ></div>

                <div
                    class="cameraFrame cameraFrameTR"
                ></div>

                <div
                    class="cameraFrame cameraFrameBL"
                ></div>

                <div
                    class="cameraFrame cameraFrameBR"
                ></div>


                <!-- CENTER RETICLE -->

                <div
                    class="cameraReticle"
                ></div>


                <!-- BOTTOM INFO -->

                <div
                    class="cameraBottom"
                >


                    <span
                        class="cameraLocation"
                    >
                        ${escapeHtml(
                            camera.name
                        )}
                    </span>


                    <span
                        class="cameraFeedMeta"
                    >

                        SIGNAL
                        <b>
                            ${camera.signal}%
                        </b>

                        <span
                            class="cameraMetaDivider"
                        >
                            |
                        </span>

                        ${escapeHtml(
                            camera.status
                        )}

                    </span>

                </div>


                <!-- TIME -->

                <div
                    class="cameraTime"
                >
                    ${getCameraTime()}
                </div>


                <!-- CAMERA NUMBER -->

                <div
                    class="cameraIndex"
                >

                    ${channelNumber}
                    /
                    ${String(
                        cameras.length
                    ).padStart(
                        2,
                        "0"
                    )}

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

                        <div
                            class="cameraOffline"
                        >

                            <div
                                class="cameraOfflineInner"
                            >

                                <strong>
                                    SIGNAL LOST
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        camera.id
                                    )}
                                </span>

                                <small>
                                    VIDEO SOURCE UNAVAILABLE
                                </small>

                            </div>

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

        screen.classList.remove(
            "cameraSwitch"
        );

        void screen.offsetWidth;

        screen.classList.add(
            "cameraBoot"
        );

    }


    /*
     * Refresh the channel panel
     * after the new feed exists.
     */

    updateCameraChannelUI();

}


/* ==========================================================
   NEXT CAMERA
========================================================== */

export function nextCam() {

    const previousCamera =
        getCurrentCameraData();


    currentCam++;

    if (
        currentCam >=
        cameras.length
    ) {

        currentCam = 0;

    }


    const newCamera =
        getCurrentCameraData();


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
                "next",

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
                    null,

                status:
                    newCamera?.status ||
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
        getCurrentCameraData();


    currentCam--;


    if (
        currentCam < 0
    ) {

        currentCam =
            cameras.length - 1;

    }


    const newCamera =
        getCurrentCameraData();


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
                    null,

                status:
                    newCamera?.status ||
                    null

            },

            cameraIndex:
                currentCam

        }

    });


    showCamera();

}


/* ==========================================================
   SELECT SPECIFIC CAMERA
========================================================== */

export function selectCamera(
    index
) {

    const parsedIndex =
        Number(index);


    if (
        !Number.isInteger(
            parsedIndex
        )
    ) {

        return;

    }


    if (
        parsedIndex < 0 ||
        parsedIndex >=
        cameras.length
    ) {

        return;

    }


    const previousCamera =
        getCurrentCameraData();


    currentCam =
        parsedIndex;


    const newCamera =
        getCurrentCameraData();


    if (
        previousCamera?.id !==
        newCamera?.id
    ) {

        console.log(
            "[OMEGA CAMERA] SELECT:",
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
                "select",

            reason:
                "operator_selected_camera",

            metadata: {

                previousCamera:
                    previousCamera?.id ||
                    null,

                currentCamera:
                    newCamera?.id ||
                    null,

                cameraIndex:
                    currentCam

            }

        });

    }


    showCamera();

}


/* ==========================================================
   CURRENT CAMERA
========================================================== */

export function getCurrentCamera() {

    return (
        cameras[currentCam] ||
        null
    );

}


/* ==========================================================
   CURRENT CAMERA INDEX
========================================================== */

export function getCurrentCameraIndex() {

    return currentCam;

}


/* ==========================================================
   ALL CAMERAS
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
        getCurrentCameraData();


    if (!camera) {

        return;

    }


    reportMrSmileCameraAction({

        type:
            "camera_open",

        target:
            camera.id,

        action:
            "open",

        reason:
            "operator_opened_camera",

        metadata: {

            camera: {

                id:
                    camera.id,

                name:
                    camera.name,

                signal:
                    camera.signal,

                status:
                    camera.status

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
        getCurrentCameraData();


    if (!camera) {

        return;

    }


    reportMrSmileCameraAction({

        type:
            "camera_close",

        target:
            camera.id,

        action:
            "close",

        reason:
            "operator_closed_camera",

        metadata: {

            cameraId:
                camera.id,

            cameraName:
                camera.name,

            cameraIndex:
                currentCam

        }

    });

}


/* ==========================================================
   CAMERA CLOCK
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

    try {

        return formatOmegaTime(
            true
        );

    } catch {

        const now =
            new Date();


        return now.toLocaleTimeString(
            "en-GB",
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit"
            }
        );

    }

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHtml(
    text
) {

    return String(
        text ??
        ""
    )

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
   ATTRIBUTE ESCAPE
========================================================== */

function escapeAttribute(
    text
) {

    return String(
        text ??
        ""
    )

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
   GLOBAL API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.nextCam =
        nextCam;


    window.previousCam =
        previousCam;


    window.selectCamera =
        selectCamera;


    window.getCurrentCamera =
        getCurrentCamera;


    window.getCurrentCameraIndex =
        getCurrentCameraIndex;

}


/* ==========================================================
   DEBUG CAMERA API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.OMEGA_CAMERA = {

        status() {

            const camera =
                getCurrentCameraData();


            return {

                index:
                    currentCam,

                camera,

                total:
                    cameras.length,

                time:
                    getCameraTime()

            };

        },


        next() {

            return nextCam();

        },


        previous() {

            return previousCam();

        },


        select(
            index
        ) {

            return selectCamera(
                index
            );

        },


        open() {

            return reportCameraOpened();

        },


        close() {

            return reportCameraClosed();

        }

    };

}
