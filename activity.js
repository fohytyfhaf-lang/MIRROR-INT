/* ==========================================================
   OMEGA OPERATOR ACTIVITY
========================================================== */

import {
    getCurrentOperator,
    getUserHistory
} from "./login.js";

import {
    on
} from "./eventManager.js";

import {
    initOperatorActivityBridge
} from "./operatorActivityBridge.js";

import {
    initOmegaCodex
} from "./omegaCodeX.js";


let activityInitialized = false;
/* ==========================================================
   OMEGA EVENT CODES
========================================================== */

const EVENT_CODES = {

    "login.success": {
        code: "AUTH-OK",
        label: "AUTHORIZATION"
    },

    "logout": {
        code: "AUTH-END",
        label: "SESSION CLOSED"
    },


    /* WINDOWS */

    "window.open": {
        code: "WIN-OPN",
        label: "WINDOW OPEN"
    },

    "window.close": {
        code: "WIN-CLS",
        label: "WINDOW CLOSE"
    },

    "window.minimize": {
        code: "WIN-MIN",
        label: "WINDOW MINIMIZE"
    },

    "window.restore": {
        code: "WIN-RST",
        label: "WINDOW RESTORE"
    },

    "window.maximize": {
        code: "WIN-MAX",
        label: "WINDOW MAXIMIZE"
    },

    "window.focus": {
        code: "WIN-FCS",
        label: "WINDOW FOCUS"
    },

    "window.move": {
        code: "WIN-MOV",
        label: "WINDOW MOVE"
    },


    /* CAMERAS */

    "camera.open": {
        code: "CAM-IN",
        label: "CAMERA OPEN"
    },

    "camera.visit": {
        code: "CAM-SW",
        label: "CAMERA SWITCH"
    },

    "camera.close": {
        code: "CAM-OUT",
        label: "CAMERA CLOSE"
    },


    /* CONSOLE */

    "console.command": {
        code: "CON-CMD",
        label: "CONSOLE COMMAND"
    },

    "console.unknown": {
        code: "CON-UNK",
        label: "UNKNOWN COMMAND"
    },


    /* FILES */

    "file.open": {
        code: "FIL-OPN",
        label: "FILE OPEN"
    },

    "file.read": {
        code: "FIL-READ",
        label: "FILE READ"
    },

    "restricted.file.open": {
        code: "FIL-RES",
        label: "RESTRICTED FILE"
    },

    "folder.open": {
        code: "DIR-OPN",
        label: "DIRECTORY OPEN"
    },

    "file.open.failed": {
        code: "FIL-ERR",
        label: "FILE ERROR"
    },


    /* ACCESS */

    "access.denied": {
        code: "ACL-DEN",
        label: "ACCESS DENIED"
    },


    /* COMMUNICATION */

    "chat.message": {
        code: "MSG-SND",
        label: "MESSAGE SENT"
    },


    /* MR.SMILE */

    "mrsmile.message": {
        code: "MRX-MSG",
        label: "MR.SMILE MESSAGE"
    },

    "mrsmile.firstContact": {
        code: "MRX-FC",
        label: "MR.SMILE CONTACT"
    },


    /* SYSTEM */

    "settings.change": {
        code: "SYS-SET",
        label: "SYSTEM SETTINGS"
    },

    "error": {
        code: "SYS-ERR",
        label: "SYSTEM ERROR"
    }

};


/* ==========================================================
   HELPERS
========================================================== */

function get(id) {

    return document.getElementById(id);

}


function formatTime(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


function formatDetails(
    entry
) {

    const type =
        entry?.type || "";

    const data =
        entry?.data || {};


    if (
        type === "window.open" ||
        type === "window.close" ||
        type === "window.minimize" ||
        type === "window.restore" ||
        type === "window.maximize" ||
        type === "window.focus"
    ) {

        return (
            "TARGET: " +
            String(
                data.windowName ||
                data.target ||
                "UNKNOWN WINDOW"
            )
        );

    }


    if (
        type === "window.move"
    ) {

        const position =
            data.position;

        if (
            position &&
            typeof position === "object"
        ) {

            return (
                `TARGET: ${
                    data.windowName ||
                    data.target ||
                    "UNKNOWN WINDOW"
                } | POSITION: ${
                    position.left ??
                    "?"
                }, ${
                    position.top ??
                    "?"
                }`
            );

        }

        return (
            "TARGET: " +
            String(
                data.windowName ||
                data.target ||
                "UNKNOWN WINDOW"
            )
        );

    }


    if (
        type === "camera.visit"
    ) {

        const previous =
            data.previousCamera;

        const current =
            data.currentCamera;

        if (
            previous?.id &&
            current?.id
        ) {

            return (
                `${previous.id} > ${current.id}` +
                (
                    current.name
                        ? ` — ${current.name}`
                        : ""
                )
            );

        }

        return (
            data.target ||
            "CAMERA CHANNEL"
        );

    }


    if (
        type === "camera.open" ||
        type === "camera.close"
    ) {

        return (
            data.target ||
            data.currentCamera?.id ||
            data.camera?.id ||
            "CAMERA CHANNEL"
        );

    }


    if (
        type === "console.command" ||
        type === "console.unknown"
    ) {

        return (
            data.command
                ? `COMMAND: ${data.command}`
                : "COMMAND EXECUTED"
        );

    }


    if (
        type === "file.open" ||
        type === "file.read" ||
        type === "restricted.file.open" ||
        type === "folder.open" ||
        type === "file.open.failed"
    ) {

        return (
            `RESOURCE: ${
                data.name ||
                data.target ||
                data.path ||
                "UNKNOWN"
            }`
        );

    }


    if (
        type === "access.denied"
    ) {

        return (
            `RESOURCE: ${
                data.target ||
                data.path ||
                data.resource ||
                "UNKNOWN"
            }`
        );

    }


    if (
        type === "login.success"
    ) {

        return (
            `ROLE: ${
                data.role ||
                "UNKNOWN"
            } | CLEARANCE: ${
                data.clearance ??
                "?"
            }`
        );

    }


    if (
        type === "chat.message"
    ) {

        return "OUTBOUND MESSAGE";

    }


    if (
        type === "mrsmile.message"
    ) {

        return "PRIVATE CHANNEL EVENT";

    }


    if (
        type === "mrsmile.firstContact"
    ) {

        return "PRIVATE CHANNEL ESTABLISHED";

    }


    if (
        type === "settings.change"
    ) {

        return "OPERATOR SETTINGS UPDATED";

    }


    if (
        type === "error"
    ) {

        return (
            data.message ||
            "SYSTEM ERROR REPORTED"
        );

    }


    return "—";

}

/* ==========================================================
   EVENT CODE HELPERS
========================================================== */

function getEventDefinition(type) {

    return (
        EVENT_CODES[type] || {
            code: "SYS-UNK",
            label: "UNCLASSIFIED EVENT"
        }
    );

}


/* ==========================================================
   LOAD ACTIVITY
========================================================== */

export function loadOperatorActivity() {

    const operator =
        getCurrentOperator();


    const container =
        get("operatorActivityLog");


    if (!container) {
        return;
    }


    if (!operator) {

        container.innerHTML =
            `
            <div class="activityEmpty">
                NO ACTIVE OPERATOR.
            </div>
            `;

        return;

    }


    const history =
        getUserHistory(
            operator.username
        );


    const name =
        get("activityOperator");

    const count =
        get("activityCount");

    const status =
        get("activityStatus");


    if (name) {

        name.textContent =
            operator.operatorId ||
            operator.username ||
            "UNKNOWN";

    }


    if (count) {

        count.textContent =
            Array.isArray(history)
                ? history.length
                : 0;

    }


    if (
        !Array.isArray(history) ||
        history.length === 0
    ) {

        container.innerHTML =
            `
            <div class="activityEmpty">
                NO ACTIVITY RECORDED.
            </div>
            `;

        if (status) {
            status.textContent =
                "NO ENTRIES";
        }

        return;

    }


    /*
     * Newest first.
     */
    const entries =
        [...history]
            .reverse()
            .filter(
                entry =>
                    entry?.type !==
                    "mrsmile.interaction"
            );
  


    container.innerHTML =
      const details =
         formatDetails(
             entry
         );

                    const type =
                        entry?.type ||
                        "unknown";


                    const details =
                        formatDetails(
                            entry?.data
                        );


                    const session =
                        entry?.sessionId
                            ? entry.sessionId
                            : "";


                    return `
                        <div class="activityEntry">

                            <div class="activityTime">

                                ${formatTime(
                                    entry?.timestamp
                                )}

                            </div>


                            <div
                                class="activityType"
                                data-type="${escapeHtml(type)}"
                            >

                                ${escapeHtml(
                                    type
                                )}

                            </div>


                            <div class="activityDetails">

                                ${escapeHtml(
                                    details || "—"
                                )}

                                ${
                                    session
                                        ? `
                                        <span class="activitySession">
                                            SESSION:
                                            ${escapeHtml(session)}
                                        </span>
                                        `
                                        : ""
                                }

                            </div>

                        </div>
                    `;

                }
            )
            .join("");


    if (status) {

        status.textContent =
            "MONITORING";

    }

}


/* ==========================================================
   HTML SAFETY
========================================================== */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==========================================================
   ACTIVITY EVENT
========================================================== */

function handleActivityRecorded() {

    loadOperatorActivity();

}


/* ==========================================================
   INITIALIZATION
========================================================== */

function initActivity() {

    if (
        activityInitialized
    ) {
        return;
    }


    activityInitialized =
        true;

       initOperatorActivityBridge();
       initOmegaCodex();


    on(
        "user.activityRecorded",
        handleActivityRecorded
    );


    on(
        "user.login",
        () => {

            loadOperatorActivity();

        }
    );


    loadOperatorActivity();


    console.log(
        "[OMEGA ACTIVITY] Activity monitor initialized."
    );

}


window.addEventListener(
    "DOMContentLoaded",
    initActivity
);


window.loadOperatorActivity =
    loadOperatorActivity;
