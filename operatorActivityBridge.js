/* ==========================================================
   OMEGA OPERATOR ACTIVITY BRIDGE

   Converts existing operatorAction events into
   human-readable operator history entries.

   MR.SMILE still receives the original event.
   This bridge creates a separate OMEGA audit record.
========================================================== */

import {
    on
} from "./eventManager.js";

import {
    recordUserAction
} from "./login.js";


let initialized = false;


/* ==========================================================
   WINDOW ACTION MAP
========================================================== */

const WINDOW_ACTIONS = {

    window_open:
        "window.open",

    window_close:
        "window.close",

    window_minimize:
        "window.minimize",

    window_restore:
        "window.restore",

    window_maximize:
        "window.maximize",

    window_focus:
        "window.focus",

    window_move:
        "window.move"

};


/* ==========================================================
   WINDOW DATA
========================================================== */

function normalizeWindowData(data = {}) {

    const metadata =
        data.metadata || {};

    return {

        target:
            data.target ||
            metadata.windowName ||
            "unknown",

        windowId:
            metadata.windowId ||
            null,

        windowName:
            metadata.windowName ||
            data.target ||
            "unknown",

        position:
            metadata.position ||
            null,

        previousPosition:
            metadata.previousPosition ||
            null,

        previousState:
            metadata.previousState ||
            null,

        wasHidden:
            metadata.wasHidden ??
            null

    };

}


/* ==========================================================
   CAMERA DATA
========================================================== */

function normalizeCameraData(data = {}) {

    const metadata =
        data.metadata || {};

    const previous =
        metadata.previousCamera ||
        null;

    const current =
        metadata.currentCamera ||
        metadata.camera ||
        null;

    return {

        target:
            data.target ||
            current?.id ||
            null,

        previousCamera:
            previous
                ? {
                    id:
                        previous.id ||
                        null,

                    name:
                        previous.name ||
                        null
                }
                : null,

        currentCamera:
            current
                ? {
                    id:
                        current.id ||
                        null,

                    name:
                        current.name ||
                        null,

                    signal:
                        current.signal ??
                        null
                }
                : null,

        direction:
            metadata.direction ||
            null,

        cameraIndex:
            metadata.cameraIndex ??
            null

    };

}


/* ==========================================================
   HANDLE OPERATOR ACTION
========================================================== */

function handleOperatorAction(
    data = {}
) {

    if (
        !data ||
        typeof data !== "object"
    ) {
        return;
    }


    const type =
        String(
            data.type || ""
        );

    const source =
        String(
            data.source || ""
        );


    /* ======================================================
       WINDOWS
    ====================================================== */

    if (
        source ===
        "windowManager"
    ) {

        const activityType =
            WINDOW_ACTIONS[type];

        if (!activityType) {
            return;
        }


        recordUserAction(
            activityType,
            normalizeWindowData(
                data
            )
        );

        return;

    }


    /* ======================================================
       CAMERAS
    ====================================================== */

    if (
        source ===
        "camera"
    ) {

        if (
            type ===
            "camera_switch"
        ) {

            recordUserAction(
                "camera.visit",
                normalizeCameraData(
                    data
                )
            );

            return;

        }


        if (
            type ===
            "camera_open"
        ) {

            recordUserAction(
                "camera.open",
                normalizeCameraData(
                    data
                )
            );

            return;

        }


        if (
            type ===
            "camera_close"
        ) {

            recordUserAction(
                "camera.close",
                normalizeCameraData(
                    data
                )
            );

        }

    }

}


/* ==========================================================
   INITIALIZE
========================================================== */

export function initOperatorActivityBridge() {

    if (
        initialized
    ) {
        return;
    }


    initialized =
        true;


    on(
        "mrsmile:operatorAction",
        handleOperatorAction
    );


    console.log(
        "[OMEGA ACTIVITY BRIDGE] Operator action bridge initialized."
    );

}
