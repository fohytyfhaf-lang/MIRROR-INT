/* ==========================================================
   MR.SMILE — INTRUSION UI
   Visual execution layer for MR.SMILE actions
========================================================== */

import {
    on
} from "./eventManager.js";

/* ==========================================================
   STATE
========================================================== */

const state = {
    initialized: false,

    active: false,

    currentWindow: null,
    currentCursor: null,

    originalCursor: "",

    activeInterference: null,

    actionHistory: [],
    maxHistory: 50
};


/* ==========================================================
   TIMING
========================================================== */

const TIMING = {
    cursorMove: 450,
    windowMove: 500,
    windowOpen: 650,
    focusShift: 350,
    cameraSwitch: 900,
    explorerOpen: 750,
    consoleOpen: 700,
    interference: 1000,
    recovery: 1200
};


/* ==========================================================
   INIT
========================================================== */

export function initMrSmileIntrusionUI() {

    if (state.initialized) {
        return;
    }

    state.initialized = true;

    /*
        Actions
    */

    on("mrsmile:actionRequested", decision => {

        if (!decision) {
            return;
        }

        handleAction(decision);

    });


    /*
        Explicit UI events
    */

    on("mrsmile:cursorInterference", data => {

        handleCursorInterference(data);

    });


    on("mrsmile:windowInterference", data => {

        handleWindowInterference(data);

    });


    on("mrsmile:cameraInterference", data => {

        handleCameraInterference(data);

    });


    on("mrsmile:systemInterference", data => {

        handleSystemInterference(data);

    });


    console.log(
        "[MR.SMILE] Intrusion UI initialized."
    );
}


/* ==========================================================
   ACTION ROUTER
========================================================== */

function handleAction(decision) {

    if (!decision) {
        return;
    }

    const action = decision.action;

    switch (action) {

        case "help":
            performHelp(decision);
            break;

        case "refuse":
            performRefuse(decision);
            break;

        case "deny":
            performDeny(decision);
            break;

        case "delay":
            performDelay(decision);
            break;

        case "warn":
            performWarning(decision);
            break;

        case "observe":
            performObservation(decision);
            break;

        case "interfere":
            performInterference(decision);
            break;

        case "block":
            performBlock(decision);
            break;

        case "sabotage":
            performSabotage(decision);
            break;

        case "grant":
            performGrant(decision);
            break;

        default:
            break;
    }
}


/* ==========================================================
   HELP
========================================================== */

function performHelp(decision) {

    recordAction("help", decision);

    /*
        Helpful intrusion should feel intentional.

        MR.SMILE can:
        - open a relevant window
        - focus it
        - highlight information
        - move cursor toward it
    */

    if (decision.target === "archive") {

        openRelevantWindow([
            "#fileExplorer",
            "#explorerWindow",
            ".fileExplorer"
        ]);

    }

    else if (decision.target === "game") {

        openRelevantWindow([
            "#gameWindow",
            ".gameWindow"
        ]);

    }

    else if (decision.target === "truth") {

        openRelevantWindow([
            "#researchWindow",
            "#logWindow",
            "#fileExplorer"
        ]);

    }

    else {

        focusActiveWindow();

    }

    emit("mrsmile:uiHelpExecuted", {
        decision
    });
}


/* ==========================================================
   GRANT
========================================================== */

function performGrant(decision) {

    recordAction("grant", decision);

    /*
        Grant itself does not need a dramatic effect.
        The important part is that OMEGA visibly acknowledges
        that access changed.
    */

    showIntrusionMessage(
        "REMOTE ACCESS AUTHORIZED",
        1000
    );

    pulseInterface();

    emit("mrsmile:uiGrantExecuted", {
        decision
    });
}


/* ==========================================================
   REFUSE
========================================================== */

function performRefuse(decision) {

    recordAction("refuse", decision);

    showIntrusionMessage(
        "REQUEST REFUSED",
        1200
    );

    brieflyDistortInterface();

    emit("mrsmile:uiRefusalExecuted", {
        decision
    });
}


/* ==========================================================
   DENY
========================================================== */

function performDeny(decision) {

    recordAction("deny", decision);

    showIntrusionMessage(
        "ACCESS DENIED",
        1200
    );

    pulseInterface();

    emit("mrsmile:uiDenyExecuted", {
        decision
    });
}


/* ==========================================================
   DELAY
========================================================== */

function performDelay(decision) {

    recordAction("delay", decision);

    showIntrusionMessage(
        "REQUEST PENDING",
        1000
    );

    /*
        Do not resolve the request here.
        MR.SMILE may answer later.
    */

    emit("mrsmile:uiDelayExecuted", {
        decision
    });
}


/* ==========================================================
   WARNING
========================================================== */

function performWarning(decision) {

    recordAction("warn", decision);

    showIntrusionMessage(
        "WARNING: UNAUTHORIZED ACTION",
        1500
    );

    focusActiveWindow();

    emit("mrsmile:uiWarningExecuted", {
        decision
    });
}


/* ==========================================================
   OBSERVATION
========================================================== */

function performObservation(decision) {

    recordAction("observe", decision);

    showObservationMarker();

    emit("mrsmile:uiObservationExecuted", {
        decision
    });
}


/* ==========================================================
   INTERFERENCE
========================================================== */

function performInterference(decision) {

    recordAction("interfere", decision);

    const activeWindow =
        document.querySelector(".window.active");

    if (activeWindow) {

        activeWindow.classList.add(
            "mrSmileFocusInterference"
        );

        state.activeInterference = activeWindow;

        setTimeout(() => {

            if (activeWindow) {

                activeWindow.classList.remove(
                    "mrSmileFocusInterference"
                );

            }

            if (
                state.activeInterference === activeWindow
            ) {

                state.activeInterference = null;

            }

        }, TIMING.interference);
    }

    /*
        Cursor/input response delay
    */

    document.body.classList.add(
        "mrSmileInputInterference"
    );

    setTimeout(() => {

        document.body.classList.remove(
            "mrSmileInputInterference"
        );

    }, TIMING.interference);

    emit("mrsmile:uiInterferenceExecuted", {
        decision
    });
}


/* ==========================================================
   BLOCK
========================================================== */

function performBlock(decision) {

    recordAction("block", decision);

    document.body.classList.add(
        "mrSmileInteractionBlocked"
    );

    showIntrusionMessage(
        "INPUT CHANNEL BLOCKED",
        1000
    );

    setTimeout(() => {

        document.body.classList.remove(
            "mrSmileInteractionBlocked"
        );

    }, 900);

    emit("mrsmile:uiBlockExecuted", {
        decision
    });
}


/* ==========================================================
   SABOTAGE
========================================================== */

function performSabotage(decision) {

    recordAction("sabotage", decision);

    state.active = true;

    /*
        Global input distortion
    */

    document.body.classList.add(
        "mrSmileInputInterference"
    );


    /*
        Random window interference
    */

    const windows = [
        ...document.querySelectorAll(".window")
    ].filter(window => {

        return (
            window.id !== "mrSmileAuthorization" &&
            window.offsetParent !== null
        );

    });


    if (windows.length > 0) {

        const target =
            windows[
                Math.floor(
                    Math.random() * windows.length
                )
            ];

        target.classList.add(
            "mrSmileWindowInterference"
        );

        setTimeout(() => {

            target.classList.remove(
                "mrSmileWindowInterference"
            );

        }, TIMING.interference);

    }


    /*
        Small desktop disturbance
    */

    brieflyDistortInterface();


    /*
        Restore
    */

    setTimeout(() => {

        document.body.classList.remove(
            "mrSmileInputInterference"
        );

        state.active = false;

    }, TIMING.recovery);


    emit("mrsmile:uiSabotageExecuted", {
        decision
    });
}


/* ==========================================================
   EXPLICIT CURSOR INTERFERENCE
========================================================== */

function handleCursorInterference(data = {}) {

    const target =
        data.target ||
        data.element ||
        ".window.active";


    const element =
        typeof target === "string"
            ? document.querySelector(target)
            : target;


    if (!element) {
        return;
    }


    const rect =
        element.getBoundingClientRect();


    moveVirtualCursor(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
    );
}


/* ==========================================================
   WINDOW INTERFERENCE
========================================================== */

function handleWindowInterference(data = {}) {

    let windowElement = null;


    if (data.window instanceof HTMLElement) {

        windowElement = data.window;

    }

    else if (data.selector) {

        windowElement =
            document.querySelector(data.selector);

    }

    else {

        windowElement =
            document.querySelector(".window.active");

    }


    if (!windowElement) {
        return;
    }


    windowElement.classList.add(
        "mrSmileWindowInterference"
    );


    setTimeout(() => {

        windowElement.classList.remove(
            "mrSmileWindowInterference"
        );

    }, data.duration || TIMING.interference);
}


/* ==========================================================
   CAMERA INTERFERENCE
========================================================== */

function handleCameraInterference(data = {}) {

    /*
        We intentionally do not assume a specific
        camera implementation.

        If nextCam() exists globally, use it.
        Otherwise only create the visual disturbance.
    */

    try {

        if (
            typeof window.nextCam === "function"
        ) {

            window.nextCam();

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE] Camera switch failed:",
            error
        );

    }


    showIntrusionMessage(
        data.message ||
        "CAMERA CHANNEL SWITCHED",
        900
    );


    emit("mrsmile:cameraSwitchedByIntrusion", {
        data
    });
}


/* ==========================================================
   SYSTEM INTERFERENCE
========================================================== */

function handleSystemInterference(data = {}) {

    brieflyDistortInterface();

    if (data.message) {

        showIntrusionMessage(
            data.message,
            1200
        );

    }
}


/* ==========================================================
   WINDOW OPENING
========================================================== */

function openRelevantWindow(selectors = []) {

    let element = null;

    for (const selector of selectors) {

        element =
            document.querySelector(selector);

        if (element) {
            break;
        }

    }


    if (!element) {

        /*
            Fallback:
            focus whatever window currently exists.
        */

        focusActiveWindow();

        return;
    }


    /*
        Already visible
    */

    element.classList.add("active");


    /*
        Bring to front if possible
    */

    try {

        if (
            typeof window.bringToFront ===
            "function"
        ) {

            window.bringToFront(element);

        }

    } catch (error) {

        console.warn(
            "[MR.SMILE] bringToFront failed:",
            error
        );

    }


    emit("mrsmile:windowOpened", {
        element
    });
}


/* ==========================================================
   FOCUS
========================================================== */

function focusActiveWindow() {

    const windows =
        document.querySelectorAll(".window");

    if (!windows.length) {
        return;
    }


    let target =
        document.querySelector(".window.active");


    if (!target) {
        target = windows[0];
    }


    /*
        Remove active state from other windows
    */

    windows.forEach(windowElement => {

        if (windowElement !== target) {

            windowElement.classList.remove(
                "active"
            );

        }

    });


    target.classList.add("active");


    emit("mrsmile:focusChanged", {
        element: target
    });
}


/* ==========================================================
   VIRTUAL CURSOR
========================================================== */

function createVirtualCursor() {

    if (state.currentCursor) {

        return state.currentCursor;

    }


    const cursor =
        document.createElement("div");


    cursor.id =
        "mrSmileIntrusionCursor";


    cursor.className =
        "mrSmileIntrusionCursor";


    cursor.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.appendChild(cursor);

    state.currentCursor = cursor;

    return cursor;
}


function moveVirtualCursor(x, y) {

    const cursor =
        createVirtualCursor();


    cursor.style.left =
        `${x}px`;

    cursor.style.top =
        `${y}px`;

    cursor.classList.add("active");


    setTimeout(() => {

        if (cursor) {

            cursor.classList.remove(
                "active"
            );

        }

    }, TIMING.cursorMove);
}


/* ==========================================================
   OBSERVATION MARKER
========================================================== */

function showObservationMarker() {

    let marker =
        document.getElementById(
            "mrSmileAmbientObservation"
        );


    if (marker) {

        marker.remove();

    }


    marker =
        document.createElement("div");


    marker.id =
        "mrSmileAmbientObservation";


    marker.className =
        "mrSmileAmbientObservation";


    marker.textContent =
        "OBSERVED";


    const notificationArea =
        document.getElementById(
            "notificationArea"
        );


    if (notificationArea) {

        notificationArea.appendChild(marker);

    }

    else {

        document.body.appendChild(marker);

    }


    requestAnimationFrame(() => {

        marker.classList.add("visible");

    });


    setTimeout(() => {

        marker.classList.remove("visible");

        setTimeout(() => {

            marker.remove();

        }, 400);

    }, 1000);
}


/* ==========================================================
   SYSTEM MESSAGE
========================================================== */

function showIntrusionMessage(
    text,
    duration = 1000
) {

    const area =
        document.getElementById(
            "notificationArea"
        );


    if (!area) {

        console.warn(
            "[MR.SMILE] notificationArea not found:",
            text
        );

        return;
    }


    const message =
        document.createElement("div");


    message.className =
        "mrSmileActionNotice";


    message.textContent =
        text;


    area.appendChild(message);


    requestAnimationFrame(() => {

        message.classList.add(
            "visible"
        );

    });


    setTimeout(() => {

        message.classList.remove(
            "visible"
        );

        setTimeout(() => {

            message.remove();

        }, 300);

    }, duration);
}


/* ==========================================================
   INTERFACE PULSE
========================================================== */

function pulseInterface() {

    document.body.classList.add(
        "mrSmileInterfacePulse"
    );


    setTimeout(() => {

        document.body.classList.remove(
            "mrSmileInterfacePulse"
        );

    }, 450);
}


/* ==========================================================
   DISTORTION
========================================================== */

function brieflyDistortInterface() {

    document.body.classList.add(
        "mrSmileInterfaceDistortion"
    );


    setTimeout(() => {

        document.body.classList.remove(
            "mrSmileInterfaceDistortion"
        );

    }, 250 + Math.random() * 450);
}


/* ==========================================================
   ACTION HISTORY
========================================================== */

function recordAction(type, decision) {

    state.actionHistory.push({

        type,

        action:
            decision?.action || null,

        target:
            decision?.target || null,

        timestamp:
            Date.now()

    });


    if (
        state.actionHistory.length >
        state.maxHistory
    ) {

        state.actionHistory.shift();

    }
}


/* ==========================================================
   EVENT EMITTER
========================================================== */

function emit(eventName, data = null) {

    /*
        Importing trigger here would create no issue,
        but this module is primarily a listener/executor.

        Custom DOM event gives other UI systems a way
        to observe this layer without creating coupling.
    */

    try {

        window.dispatchEvent(
            new CustomEvent(
                eventName,
                {
                    detail: data
                }
            )
        );

    } catch (error) {

        console.warn(
            "[MR.SMILE] UI event failed:",
            eventName,
            error
        );

    }
}


/* ==========================================================
   PUBLIC API
========================================================== */

export function getMrSmileIntrusionUIState() {

    return {

        initialized:
            state.initialized,

        active:
            state.active,

        activeInterference:
            !!state.activeInterference,

        cursorActive:
            !!state.currentCursor,

        history:
            [...state.actionHistory]

    };
}


export function getMrSmileIntrusionHistory() {

    return [...state.actionHistory];

}


export function isMrSmileIntrusionActive() {

    return state.active;

}


/* ==========================================================
   RESET
========================================================== */

export function resetMrSmileIntrusionUI() {

    state.active = false;

    state.activeInterference = null;


    /*
        Remove temporary body states
    */

    document.body.classList.remove(
        "mrSmileInputInterference"
    );

    document.body.classList.remove(
        "mrSmileInteractionBlocked"
    );

    document.body.classList.remove(
        "mrSmileInterfacePulse"
    );

    document.body.classList.remove(
        "mrSmileInterfaceDistortion"
    );


    /*
        Remove window states
    */

    document
        .querySelectorAll(".window")
        .forEach(windowElement => {

            windowElement.classList.remove(
                "mrSmileFocusInterference"
            );

            windowElement.classList.remove(
                "mrSmileWindowInterference"
            );

        });


    /*
        Remove cursor
    */

    if (state.currentCursor) {

        state.currentCursor.remove();

        state.currentCursor = null;

    }


    /*
        Remove temporary notices
    */

    document
        .querySelectorAll(
            ".mrSmileActionNotice"
        )
        .forEach(element => {

            element.remove();

        });


    state.actionHistory = [];

}


/* ==========================================================
   AUTO INIT
========================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initMrSmileIntrusionUI,
        {
            once: true
        }
    );

}

else {

    initMrSmileIntrusionUI();

}
