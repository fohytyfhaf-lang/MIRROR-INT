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


function formatDetails(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {
        return "";
    }

    const parts = [];


    for (
        const [key, value]
        of Object.entries(data)
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            continue;
        }


        let displayValue;


        if (
            typeof value === "object"
        ) {

            try {

                displayValue =
                    JSON.stringify(
                        value
                    );

            } catch {

                displayValue =
                    String(value);

            }

        } else {

            displayValue =
                String(value);

        }


        parts.push(
            `${key}: ${displayValue}`
        );

    }


    return parts.join(
        "  |  "
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
        entries
            .map(
                entry => {

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
