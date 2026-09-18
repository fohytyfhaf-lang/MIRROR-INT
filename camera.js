/* ==========================================================
   OMEGA SECURITY SURVEILLANCE SYSTEM
   MIRROR-INT / OMEGA

   CCTV module

   PURPOSE
   ----------------------------------------------------------
   - camera channel management
   - live feed rendering
   - technical diagnostics
   - event monitoring
   - equipment faults
   - personnel / system event integration
   - OMEGA time integration
   - workspace surveillance mode
   - MR.SMILE context reporting

   DESIGN PRINCIPLE
   ----------------------------------------------------------
   This is an internal surveillance system.

   It does not behave like a game HUD.

   Faults are operational.
   Events are procedural.
   Anomalies are subtle.
========================================================== */

import {
    trigger,
    on
} from "./eventManager.js";

import {
    formatOmegaTime
} from "./omegaTime.js";

import {
    Storage
} from "./storage.js";


/* ==========================================================
   CONSTANTS
========================================================== */

const CAMERA_STATE_KEY =
    "omega_camera_state_v1";

const CAMERA_EVENTS_KEY =
    "omega_camera_events_v1";

const MAX_EVENTS =
    40;


/* ==========================================================
   SIMULATION CONFIG
========================================================== */

const SIMULATION = {

    /*
     * Do not break anything immediately
     * after system startup.
     */

    earliestFault:
        45000,

    tick:
        15000,

    faultChance:
        0.035,

    minimumFaultGap:
        90000,

    minimumRecovery:
        18000,

    maximumRecovery:
        50000

};


/* ==========================================================
   STATE
========================================================== */

let currentCam = 0;

let initialized = false;

let clockTimer = null;

let simulationTimer = null;

let simulationStartedAt =
    Date.now();

let lastFaultAt =
    0;

let activeFault =
    null;

let cameraEvents = [];

let workspaceMode =
    false;

let cameraVisible =
    false;


/* ==========================================================
   CAMERA DATABASE
========================================================== */

const cameras = [

    {
        id: "CAM 01",
        name: "BASE AREA",

        zone:
            "A-01",

        image:
            "./images/cam_ba.jpg",

        signal:
            98,

        resolution:
            "1920×1080",

        fps:
            25,

        codec:
            "H.264",

        status:
            "ONLINE",

        recording:
            true,

        storage:
            78

    },


    {
        id: "CAM 02",
        name: "CORRIDOR",

        zone:
            "A-02",

        image:
            "./images/cam_cor.jpg",

        signal:
            97,

        resolution:
            "1920×1080",

        fps:
            25,

        codec:
            "H.264",

        status:
            "ONLINE",

        recording:
            true,

        storage:
            74

    },


    {
        id: "CAM 03",
        name: "SERVER ROOM",

        zone:
            "B-01",

        image:
            "./images/cam_server.jpg",

        signal:
            99,

        resolution:
            "1920×1080",

        fps:
            25,

        codec:
            "H.264",

        status:
            "ONLINE",

        recording:
            true,

        storage:
            81

    },


    {
        id: "CAM 04",
        name: "EXIT",

        zone:
            "A-EXIT",

        image:
            "./images/cam_exit.jpg",

        signal:
            96,

        resolution:
            "1920×1080",

        fps:
            25,

        codec:
            "H.264",

        status:
            "ONLINE",

        recording:
            true,

        storage:
            69

    },


    {
        id: "CAM 05",
        name: "BLACK ZONE",

        zone:
            "C-05",

        image:
            "./images/cam_black.jpg",

        signal:
            72,

        resolution:
            "1280×720",

        fps:
            20,

        codec:
            "H.264",

        status:
            "ONLINE",

        recording:
            true,

        storage:
            84

    },


    {
        id: "CAM 06",
        name: "UNKNOWN AREA",

        zone:
            "C-06",

        image:
            "./images/ooooo.jpg",

        signal:
            84,

        resolution:
            "1920×1080",

        fps:
            24,

        codec:
            "H.264",

        status:
            "ONLINE",

        recording:
            true,

        storage:
            91

    },


    {
        id: "CAM 07",
        name: "RESTRICTED AREA",

        zone:
            "R-07",

        image:
            "./images/cam_secret.gif",

        signal:
            91,

        resolution:
            "1920×1080",

        fps:
            25,

        codec:
            "H.264",

        status:
            "RESTRICTED",

        recording:
            true,

        storage:
            88

    }

];


/* ==========================================================
   HELPERS
========================================================== */

function getCurrentCamera() {

    return (
        cameras[currentCam] ||
        null
    );

}


function now() {

    return Date.now();

}


function escapeHtml(
    value
) {

    return String(
        value ??
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


function getCameraNumber(
    camera
) {

    const index =
        cameras.indexOf(
            camera
        );

    if (
        index < 0
    ) {

        return "--";

    }

    return String(
        index + 1
    ).padStart(
        2,
        "0"
    );

}


function formatEventTime(
    timestamp
) {

    const value =
        Number(timestamp);


    if (
        !Number.isFinite(
            value
        )
    ) {

        return "--:--:--";

    }


    try {

        return new Date(
            value
        ).toLocaleTimeString(
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

    } catch {

        return "--:--:--";

    }

}


/* ==========================================================
   MR.SMILE CONTEXT
========================================================== */

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

    } catch (
        error
    ) {

        console.warn(
            "[OMEGA CAMERA] MR.SMILE context error:",
            error
        );

    }

}


/* ==========================================================
   EVENT STORAGE
========================================================== */

function loadCameraEvents() {

    const saved =
        Storage.get(
            CAMERA_EVENTS_KEY,
            []
        );


    cameraEvents =
        Array.isArray(
            saved
        )
            ? saved.slice(
                -MAX_EVENTS
            )
            : [];

}


function saveCameraEvents() {

    Storage.set(
        CAMERA_EVENTS_KEY,
        cameraEvents.slice(
            -MAX_EVENTS
        )
    );

}


/* ==========================================================
   CAMERA STATE
========================================================== */

function saveCameraState() {

    const state = {

        currentCam,

        updatedAt:
            now(),

        cameras:
            cameras.map(
                camera => ({

                    id:
                        camera.id,

                    status:
                        camera.status,

                    signal:
                        camera.signal,

                    recording:
                        camera.recording,

                    lastFault:
                        camera.lastFault ||
                        null

                })
            )

    };


    Storage.set(
        CAMERA_STATE_KEY,
        state
    );

}


/* ==========================================================
   EVENT MONITOR
========================================================== */

function addCameraEvent(
    event = {}
) {

    const entry = {

        timestamp:
            Number(
                event.timestamp
            ) ||
            now(),

        channel:
            event.channel ||
            null,

        type:
            event.type ||
            "SYSTEM",

        message:
            event.message ||
            "System event recorded.",

        severity:
            event.severity ||
            "normal"

    };


    cameraEvents.push(
        entry
    );


    if (
        cameraEvents.length >
        MAX_EVENTS
    ) {

        cameraEvents =
            cameraEvents.slice(
                -MAX_EVENTS
            );

    }


    saveCameraEvents();

    renderEventMonitor();

}


/* ==========================================================
   RENDER CHANNEL LIST
========================================================== */

function renderChannelList() {

    const root =
        document.getElementById(
            "cameraChannelList"
        );


    if (!root) {

        return;

    }


    root.innerHTML =
        cameras
            .map(
                (
                    camera,
                    index
                ) => {

                    const active =
                        index ===
                        currentCam;


                    const state =
                        String(
                            camera.status
                        )
                            .toLowerCase();


                    return `

                        <button
                            type="button"
                            class="
                                cameraChannel
                                ${active ? "active" : ""}
                            "
                            data-camera-index="${index}"
                            onclick="
                                selectCamera(
                                    ${index}
                                )
                            "
                        >

                            <span
                                class="cameraChannelDot"
                                data-state="${state}"
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


                            <span
                                class="cameraChannelState"
                                data-state="${state}"
                            >
                                ${escapeHtml(
                                    camera.status
                                )}
                            </span>

                        </button>

                    `;

                }
            )
            .join("");


    const count =
        document.getElementById(
            "cameraChannelCount"
        );


    if (count) {

        count.textContent =
            String(
                cameras.length
            ).padStart(
                2,
                "0"
            );

    }

}


/* ==========================================================
   AVAILABLE COUNT
========================================================== */

function updateNetworkStatus() {

    const available =
        cameras.filter(
            camera =>
                camera.status !==
                    "OFFLINE"
                &&
                camera.status !==
                    "MAINTENANCE"
        ).length;


    const availableNode =
        document.getElementById(
            "cameraAvailableCount"
        );


    if (availableNode) {

        availableNode.textContent =
            `${available} / ${cameras.length}`;

    }


    const network =
        document.getElementById(
            "cameraNetworkStatus"
        );


    if (!network) {

        return;

    }


    let state =
        "online";

    let value =
        "ONLINE";


    if (
        available === 0
    ) {

        state =
            "offline";

        value =
            "OFFLINE";

    } else if (
        available <
        cameras.length
    ) {

        state =
            "degraded";

        value =
            "DEGRADED";

    }


    network.textContent =
        value;

    network.dataset.state =
        state;

}


/* ==========================================================
   FEED
========================================================== */

function renderFeed() {

    const view =
        document.getElementById(
            "cameraView"
        );


    if (!view) {

        return;

    }


    const camera =
        getCurrentCamera();


    if (!camera) {

        return;

    }


    const channel =
        getCameraNumber(
            camera
        );


    /*
     * OFFLINE
     */

    if (
        camera.status ===
        "OFFLINE"
    ) {

        view.innerHTML = `

            <div
                class="cameraStatusScreen"
            >

                <div
                    class="cameraStatusBox"
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

        `;

        return;

    }


    /*
     * MAINTENANCE
     */

    if (
        camera.status ===
        "MAINTENANCE"
    ) {

        view.innerHTML = `

            <div
                class="cameraStatusScreen"
            >

                <div
                    class="cameraStatusBox"
                >

                    <strong>
                        MAINTENANCE
                    </strong>

                    <span>
                        ${escapeHtml(
                            camera.id
                        )}
                    </span>

                    <small>
                        CHANNEL TEMPORARILY UNAVAILABLE
                    </small>

                </div>

            </div>

        `;

        return;

    }


    view.innerHTML = `

        <div
            class="cameraScreen"
            data-channel="${escapeHtml(
                camera.id
            )}"
        >


            <img
                class="cameraImage"
                src="${escapeHtml(
                    camera.image
                )}"
                alt="${escapeHtml(
                    camera.name
                )}"
                draggable="false"
            >


            <!-- EFFECTS -->

            <div
                class="cameraScanlines"
            ></div>

            <div
                class="cameraNoise"
            ></div>

            <div
                class="cameraVignette"
            ></div>


            <!-- UI -->

            <div
                class="cameraOverlay"
            >


                <!-- TOP -->

                <div
                    class="cameraTop"
                >

                    <span
                        class="cameraIdentity"
                    >

                        ${escapeHtml(
                            camera.id
                        )}

                        <span>
                            /
                        </span>

                        ${escapeHtml(
                            camera.name
                        )}

                    </span>


                    <span
                        class="cameraRecording"
                        data-state="${
                            camera.recording
                                ? "active"
                                : "error"
                        }"
                    >

                        <span>
                            ●
                        </span>

                        ${
                            camera.recording
                                ? "REC"
                                : "REC ERROR"
                        }

                    </span>

                </div>


                <!-- SYSTEM -->

                <div
                    class="cameraSystemLabel"
                >

                    OMEGA SECURITY NETWORK

                </div>


                <!-- ZONE -->

                <div
                    class="cameraZone"
                >

                    ZONE
                    ${escapeHtml(
                        camera.zone
                    )}

                </div>


                <!-- FRAME -->

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


                <!-- CENTER -->

                <div
                    class="cameraReticle"
                ></div>


                <!-- BOTTOM -->

                <div
                    class="cameraBottom"
                >

                    <span>
                        ${escapeHtml(
                            camera.name
                        )}
                    </span>


                    <span>

                        SIGNAL
                        <b>
                            ${camera.signal}%
                        </b>

                        <i>
                            |
                        </i>

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


                <!-- INDEX -->

                <div
                    class="cameraIndex"
                >
                    CH ${channel}
                </div>

            </div>

        </div>

    `;


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

                            <div>

                                <strong>
                                    SIGNAL LOST
                                </strong>

                                <span>
                                    VIDEO SOURCE UNAVAILABLE
                                </span>

                            </div>

                        </div>

                    `

                );


                addCameraEvent({

                    channel:
                        camera.id,

                    type:
                        "VIDEO",

                    message:
                        "Video source unavailable.",

                    severity:
                        "warning"

                });

            }
        );

    }


    updateTechnicalInfo();

}


/* ==========================================================
   TECHNICAL INFORMATION
========================================================== */

function updateTechnicalInfo() {

    const camera =
        getCurrentCamera();


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

        signal.dataset.state =
            camera.signal < 80
                ? "warning"
                : "normal";

    }


    const resolution =
        document.getElementById(
            "cameraResolution"
        );


    if (resolution) {

        resolution.textContent =
            camera.resolution;

    }


    const fps =
        document.getElementById(
            "cameraFrameRate"
        );


    if (fps) {

        fps.textContent =
            `${camera.fps} FPS`;

    }


    const codec =
        document.getElementById(
            "cameraCodec"
        );


    if (codec) {

        codec.textContent =
            camera.codec;

    }


    const recording =
        document.getElementById(
            "cameraRecordingStatus"
        );


    if (recording) {

        recording.textContent =
            camera.recording
                ? "ACTIVE"
                : "ERROR";

        recording.dataset.state =
            camera.recording
                ? "active"
                : "error";

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


    const currentChannel =
        document.getElementById(
            "cameraCurrentChannel"
        );


    if (currentChannel) {

        currentChannel.textContent =
            `CH ${getCameraNumber(
                camera
            )}`;

    }


    const eventChannel =
        document.getElementById(
            "cameraEventChannel"
        );


    if (eventChannel) {

        eventChannel.textContent =
            camera.id;

    }


    updateNetworkStatus();

}


/* ==========================================================
   EVENT MONITOR RENDER
========================================================== */

function renderEventMonitor() {

    const root =
        document.getElementById(
            "cameraEventList"
        );


    if (!root) {

        return;

    }


    const events =
        cameraEvents
            .slice()
            .reverse()
            .slice(
                0,
                8
            );


    if (
        events.length === 0
    ) {

        root.innerHTML = `

            <div
                class="cameraEventEmpty"
            >
                NO RECENT EVENTS.
            </div>

        `;

        return;

    }


    root.innerHTML =
        events
            .map(
                event => `

                    <div
                        class="cameraEventRow"
                        data-severity="${
                            escapeHtml(
                                event.severity
                            )
                        }"
                    >

                        <span
                            class="cameraEventTime"
                        >
                            ${escapeHtml(
                                formatEventTime(
                                    event.timestamp
                                )
                            )}
                        </span>


                        <span
                            class="cameraEventChannel"
                        >
                            ${escapeHtml(
                                event.channel ||
                                "SYSTEM"
                            )}
                        </span>


                        <span
                            class="cameraEventType"
                        >
                            ${escapeHtml(
                                event.type
                            )}
                        </span>


                        <span
                            class="cameraEventMessage"
                        >
                            ${escapeHtml(
                                event.message
                            )}
                        </span>

                    </div>

                `
            )
            .join("");

}


/* ==========================================================
   TIME
========================================================== */

function getCameraTime() {

    try {

        return formatOmegaTime(
            true
        );

    } catch {

        return new Date()
            .toLocaleTimeString(
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


function startClock() {

    if (clockTimer) {

        clearInterval(
            clockTimer
        );

    }


    clockTimer =
        setInterval(
            () => {

                const node =
                    document.querySelector(
                        "#cameraWindow .cameraTime"
                    );


                if (!node) {

                    return;

                }


                node.textContent =
                    getCameraTime();

            },
            1000
        );

}


/* ==========================================================
   CAMERA SELECTION
========================================================== */

export function selectCamera(
    index
) {

    const parsed =
        Number(index);


    if (
        !Number.isInteger(
            parsed
        )
    ) {

        return;

    }


    if (
        parsed < 0 ||
        parsed >=
        cameras.length
    ) {

        return;

    }


    const previous =
        getCurrentCamera();


    currentCam =
        parsed;


    const camera =
        getCurrentCamera();


    renderChannelList();

    renderFeed();

    updateTechnicalInfo();


    addCameraEvent({

        channel:
            camera?.id,

        type:
            "CHANNEL",

        message:
            `Channel selected: ${camera?.name || "UNKNOWN"}.`

    });


    if (
        previous?.id !==
        camera?.id
    ) {

        reportMrSmileCameraAction({

            type:
                "camera_switch",

            target:
                camera?.id ||
                null,

            action:
                "select",

            reason:
                "operator_selected_camera",

            metadata: {

                previousCamera:
                    previous?.id ||
                    null,

                currentCamera:
                    camera?.id ||
                    null,

                cameraIndex:
                    currentCam

            }

        });

    }


    saveCameraState();

}


/* ==========================================================
   NEXT
========================================================== */

export function nextCam() {

    const next =
        (
            currentCam + 1
        ) %
        cameras.length;


    selectCamera(
        next
    );


    reportMrSmileCameraAction({

        type:
            "camera_switch",

        target:
            getCurrentCamera()?.id ||
            null,

        action:
            "next",

        reason:
            "operator_switched_camera"

    });

}


/* ==========================================================
   PREVIOUS
========================================================== */

export function previousCam() {

    const previous =
        (
            currentCam -
            1 +
            cameras.length
        ) %
        cameras.length;


    selectCamera(
        previous
    );


    reportMrSmileCameraAction({

        type:
            "camera_switch",

        target:
            getCurrentCamera()?.id ||
            null,

        action:
            "previous",

        reason:
            "operator_switched_camera"

    });

}


/* ==========================================================
   OPERATOR OPEN
========================================================== */

function cameraOpened() {

    const camera =
        getCurrentCamera();


    addCameraEvent({

        channel:
            camera?.id,

        type:
            "SYSTEM",

        message:
            "Surveillance channel access established."

    });


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

            cameraIndex:
                currentCam

        }

    });


    enterWorkspaceMode();

}


/* ==========================================================
   OPERATOR CLOSE
========================================================== */

function cameraClosed() {

    const camera =
        getCurrentCamera();


    addCameraEvent({

        channel:
            camera?.id,

        type:
            "SYSTEM",

        message:
            "Surveillance interface closed."

    });


    reportMrSmileCameraAction({

        type:
            "camera_close",

        target:
            camera?.id ||
            null,

        action:
            "close",

        reason:
            "operator_closed_camera"

    });


    leaveWorkspaceMode();

}


/* ==========================================================
   WORKSPACE MODE
========================================================== */

export function toggleCameraWorkspace() {

    workspaceMode =
        !workspaceMode;


    const workspace =
        document.getElementById(
            "workspace"
        );


    const home =
        document.getElementById(
            "omegaDesktopHome"
        );


    const cameraWindow =
        document.getElementById(
            "cameraWindow"
        );


    if (!workspace ||
        !cameraWindow
    ) {

        return;

    }


    if (
        workspaceMode
    ) {

        workspace.classList.add(
            "cameraWorkspaceActive"
        );

        cameraWindow.classList.add(
            "cameraWorkspaceMode"
        );


        if (home) {

            home.classList.add(
                "hidden"
            );

        }

    } else {

        workspace.classList.remove(
            "cameraWorkspaceActive"
        );

        cameraWindow.classList.remove(
            "cameraWorkspaceMode"
        );


        if (home) {

            home.classList.remove(
                "hidden"
            );

        }

    }

}


function enterWorkspaceMode() {

    workspaceMode =
        true;

    const workspace =
        document.getElementById(
            "workspace"
        );


    const cameraWindow =
        document.getElementById(
            "cameraWindow"
        );


    const home =
        document.getElementById(
            "omegaDesktopHome"
        );


    workspace?.classList.add(
        "cameraWorkspaceActive"
    );

    cameraWindow?.classList.add(
        "cameraWorkspaceMode"
    );

    home?.classList.add(
        "hidden"
    );

}


function leaveWorkspaceMode() {

    workspaceMode =
        false;


    const workspace =
        document.getElementById(
            "workspace"
        );


    const cameraWindow =
        document.getElementById(
            "cameraWindow"
        );


    const home =
        document.getElementById(
            "omegaDesktopHome"
        );


    workspace?.classList.remove(
        "cameraWorkspaceActive"
    );

    cameraWindow?.classList.remove(
        "cameraWorkspaceMode"
    );


    home?.classList.remove(
        "hidden"
    );

}


/* ==========================================================
   FAULT SIMULATION
========================================================== */

function chooseFaultCamera() {

    const candidates =
        cameras.filter(
            camera =>
                camera.status ===
                "ONLINE"
                &&
                camera.id !==
                "CAM 07"
        );


    if (
        candidates.length === 0
    ) {

        return null;

    }


    /*
     * Slightly higher chance for
     * weaker / less stable channels.
     */

    const weighted = [];

    candidates.forEach(
        camera => {

            const weight =
                camera.signal <
                85
                    ? 4
                    : 1;

            for (
                let i = 0;
                i < weight;
                i++
            ) {

                weighted.push(
                    camera
                );

            }

        }
    );


    return (
        weighted[
            Math.floor(
                Math.random() *
                weighted.length
            )
        ] ||
        null
    );

}


function chooseFaultType(
    camera
) {

    if (
        camera.signal < 80
    ) {

        return (
            Math.random() <
            .55
        )
            ? "signal_degraded"
            : "offline";

    }


    const value =
        Math.random();


    if (
        value < .45
    ) {

        return "signal_degraded";

    }


    if (
        value < .75
    ) {

        return "recording_error";

    }


    return "offline";

}


function startFault(
    camera,
    type
) {

    if (
        !camera ||
        activeFault
    ) {

        return;

    }

   if (
    !Number.isFinite(
        camera.baseSignal
    )
) {

    camera.baseSignal =
        camera.signal;

}


if (
    !camera.baseStatus
) {

    camera.baseStatus =
        camera.status;

}


if (
    typeof camera.baseRecording !==
    "boolean"
) {

    camera.baseRecording =
        camera.recording;

}


    lastFaultAt =
        now();


    activeFault = {

        cameraId:
            camera.id,

        type,

        startedAt:
            now(),

        duration:
            SIMULATION.minimumRecovery +
            Math.floor(
                Math.random() *
                (
                    SIMULATION.maximumRecovery -
                    SIMULATION.minimumRecovery
                )
            )

    };


    camera.lastFault = {

        type,

        startedAt:
            activeFault.startedAt

    };


    switch (
        type
    ) {

        case "signal_degraded":

            camera.status =
                "DEGRADED";

            camera.signal =
                Math.max(
                    35,
                    camera.signal -
                    (
                        12 +
                        Math.floor(
                            Math.random() *
                            21
                        )
                    )
                );

            addCameraEvent({

                channel:
                    camera.id,

                type:
                    "NETWORK",

                message:
                    "Signal quality degraded.",

                severity:
                    "warning"

            });

            break;


        case "recording_error":

            camera.recording =
                false;

            addCameraEvent({

                channel:
                    camera.id,

                type:
                    "RECORDING",

                message:
                    "Local recording write error.",

                severity:
                    "warning"

            });

            break;


        case "offline":

            camera.status =
                "OFFLINE";

            camera.signal =
                0;

            camera.recording =
                false;

            addCameraEvent({

                channel:
                    camera.id,

                type:
                    "NETWORK",

                message:
                    "Camera connection lost.",

                severity:
                    "warning"

            });

            break;

    }


    saveCameraState();

    renderChannelList();

    updateNetworkStatus();


    if (
        getCurrentCamera() ===
        camera
    ) {

        renderFeed();

        updateTechnicalInfo();

    }

}


/* ==========================================================
   RECOVERY
========================================================== */

function recoverFault() {

    if (
        !activeFault
    ) {

        return;

    }


    const camera =
        cameras.find(
            item =>
                item.id ===
                activeFault.cameraId
        );


    if (!camera) {

        activeFault =
            null;

        return;

    }


    const faultType =
        activeFault.type;


    /*
     * Restore baseline values.
     */

    const baseline =
        cameras[
            cameras.indexOf(
                camera
            )
        ];


    if (
        faultType ===
        "signal_degraded"
    ) {

        if (
            camera.id ===
            "CAM 05"
        ) {

            camera.signal =
                72;

        } else if (
            camera.id ===
            "CAM 06"
        ) {

            camera.signal =
                84;

        } else {

            camera.signal =
                96;

        }


        camera.status =
            "ONLINE";


        addCameraEvent({

            channel:
                camera.id,

            type:
                "NETWORK",

            message:
                "Signal restored.",

            severity:
                "normal"

        });

    }


    if (
        faultType ===
        "recording_error"
    ) {

        camera.recording =
            true;


        addCameraEvent({

            channel:
                camera.id,

            type:
                "RECORDING",

            message:
                "Recording service restored.",

            severity:
                "normal"

        });

    }


    if (
        faultType ===
        "offline"
    ) {

        camera.status =
            "ONLINE";


        camera.recording =
            true;


        if (
            camera.id ===
            "CAM 05"
        ) {

            camera.signal =
                72;

        } else if (
            camera.id ===
            "CAM 06"
        ) {

            camera.signal =
                84;

        } else {

            camera.signal =
                96;

        }


        addCameraEvent({

            channel:
                camera.id,

            type:
                "NETWORK",

            message:
                "Camera connection restored.",

            severity:
                "normal"

        });

    }


    camera.lastFault =
        null;


    activeFault =
        null;


    saveCameraState();

    renderChannelList();

    updateNetworkStatus();


    if (
        getCurrentCamera() ===
        camera
    ) {

        renderFeed();

        updateTechnicalInfo();

    }

}


/* ==========================================================
   SIMULATION TICK
========================================================== */

function simulationTick() {

    const elapsed =
        now() -
        simulationStartedAt;


    /*
     * Recover an active fault first.
     */

    if (
        activeFault
    ) {

        if (
            now() -
            activeFault.startedAt >=
            activeFault.duration
        ) {

            recoverFault();

        }

        return;

    }


    /*
     * No immediate faults.
     */

    if (
        elapsed <
        SIMULATION.earliestFault
    ) {

        return;

    }


    if (
        now() -
        lastFaultAt <
        SIMULATION.minimumFaultGap
    ) {

        return;

    }


    if (
        Math.random() >
        SIMULATION.faultChance
    ) {

        return;

    }


    const camera =
        chooseFaultCamera();


    if (!camera) {

        return;

    }


    const type =
        chooseFaultType(
            camera
        );


    startFault(
        camera,
        type
    );

}


/* ==========================================================
   PERSONNEL EVENTS
========================================================== */

function handlePersonnelMovement(
    data = {}
) {

    addCameraEvent({

        channel:
            data.camera ||
            getCurrentCamera()?.id ||
            "SYSTEM",

        type:
            "PERSONNEL",

        message:
            `${data.name || "Personnel"} movement recorded.`,

        severity:
            "normal",

        timestamp:
            data.timestamp

    });

}


function handlePersonnelIncident(
    data = {}
) {

    addCameraEvent({

        channel:
            "SYSTEM",

        type:
            "INCIDENT",

        message:
            data.message ||
            "Personnel incident recorded.",

        severity:
            "warning",

        timestamp:
            data.timestamp

    });

}


/* ==========================================================
   OMEGA TIME EVENTS
========================================================== */

function handleOmegaTimeConflict(
    data = {}
) {

    let message =
        "System time requires review.";


    switch (
        data.reason
    ) {

        case "time_backward":

            message =
                "System clock moved backwards.";

            break;

        case "time_future_event":

            message =
                "Future-dated event detected.";

            break;

        case "time_old_event":

            message =
                "Archive event predates operator session.";

            break;

    }


    addCameraEvent({

        channel:
            "SYSTEM",

        type:
            "TIME",

        message,

        severity:
            "warning",

        timestamp:
            data.timestamp

    });

}


/* ==========================================================
   VISIBILITY OBSERVER
========================================================== */
function startVisibilityObserver() {

    const cameraWindow =
        document.getElementById(
            "cameraWindow"
        );


    if (!cameraWindow) {

        return;

    }


    const syncVisibility = () => {

        const hiddenByClass =
            cameraWindow.classList.contains(
                "hidden"
            );


        const hiddenByStyle =
            getComputedStyle(
                cameraWindow
            ).display ===
            "none";


        const visible =
            !hiddenByClass &&
            !hiddenByStyle;


        /*
         * OPEN
         */

        if (
            visible &&
            !cameraVisible
        ) {

            cameraVisible =
                true;

            cameraOpened();

            return;

        }


        /*
         * CLOSE / MINIMIZE
         */

        if (
            !visible &&
            cameraVisible
        ) {

            cameraVisible =
                false;

            cameraClosed();

        }

    };


    const observer =
        new MutationObserver(
            syncVisibility
        );


    observer.observe(
        cameraWindow,
        {

            attributes:
                true,

            attributeFilter: [
                "class",
                "style"
            ]

        }
    );


    syncVisibility();

}


/* ==========================================================
   INIT
========================================================== */

export function initCamera() {

    if (
        initialized
    ) {

        return;

    }


    initialized =
        true;


    loadCameraEvents();


    renderChannelList();

    renderFeed();

    updateTechnicalInfo();

    renderEventMonitor();

    updateNetworkStatus();


    startClock();

    startVisibilityObserver();


    if (
        typeof window !==
        "undefined"
    ) {

        simulationTimer =
            setInterval(
                simulationTick,
                SIMULATION.tick
            );

    }


    on(
        "personnel:movement",
        handlePersonnelMovement
    );


    on(
        "personnel:incident",
        handlePersonnelIncident
    );


    on(
        "omega:timeConflict",
        handleOmegaTimeConflict
    );


    addCameraEvent({

        channel:
            "SYSTEM",

        type:
            "SYSTEM",

        message:
            "Surveillance network initialized.",

        severity:
            "normal"

    });


    console.log(
        "[OMEGA CAMERA] Surveillance system initialized.",
        {
            channels:
                cameras.length
        }
    );

}


/* ==========================================================
   PUBLIC API
========================================================== */

export function getCurrentCameraIndex() {

    return currentCam;

}


export function getCameras() {

    return [
        ...cameras
    ];

}


export function reportCameraOpened() {

    cameraOpened();

}


export function reportCameraClosed() {

    cameraClosed();

}


/* ==========================================================
   DEBUG API
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


    window.toggleCameraWorkspace =
        toggleCameraWorkspace;


    window.getCurrentCamera =
        getCurrentCamera;


    window.getCurrentCameraIndex =
        getCurrentCameraIndex;


    window.OMEGA_CAMERA = {

        status() {

            return {

                index:
                    currentCam,

                camera:
                    getCurrentCamera(),

                total:
                    cameras.length,

                events:
                    cameraEvents.length,

                workspaceMode

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


        events() {

            return [
                ...cameraEvents
            ];

        },


        fault(
            cameraId,
            type = "offline"
        ) {

            const camera =
                cameras.find(
                    item =>
                        item.id ===
                        cameraId
                );


            if (!camera) {

                return false;

            }


            startFault(
                camera,
                type
            );


            return true;

        },


        recover() {

            recoverFault();

            return true;

        }

    };

}
