/* ==========================================================
   OMEGA OPERATOR PROFILE
========================================================== */

import {
    getCurrentOperator
} from "./login.js";


/* ==========================================================
   FORMATTERS
========================================================== */

function formatDate(value) {

    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}


/* ==========================================================
   SAFE TEXT
========================================================== */

function setText(id, value) {

    const element = document.getElementById(id);

    if (!element) return;

    element.textContent =
        value === undefined ||
        value === null ||
        value === ""
            ? "—"
            : value;
}


/* ==========================================================
   LOAD PROFILE
========================================================== */

export function loadOperatorProfile() {

    const operator = getCurrentOperator();

    if (!operator) {

        console.warn(
            "[OMEGA OPERATOR] No authenticated operator."
        );

        return;
    }

    setText("operatorId", operator.operatorId);
    setText("operatorStatus", operator.status);
    setText("operatorRole", operator.role);
    setText("operatorClearance",
        `LEVEL ${operator.clearance}`
    );

    setText(
        "operatorDepartment",
        operator.department
    );

    setText(
        "operatorAccountType",
        operator.accountType
    );

    setText(
        "operatorRegistered",
        formatDate(operator.registeredAt)
    );

    setText(
        "operatorLastLogin",
        formatDate(operator.lastLogin)
    );

    setText(
        "operatorSessions",
        operator.sessionCount || 0
    );

    setText(
        "operatorActions",
        operator.totalActions || 0
    );


    const stats = operator.statistics || {};

    setText(
        "statFiles",
        stats.filesOpened || 0
    );

    setText(
        "statRestricted",
        stats.restrictedFilesOpened || 0
    );

    setText(
        "statWindows",
        stats.windowsOpened || 0
    );

    setText(
        "statConsole",
        stats.consoleCommands || 0
    );

    setText(
        "statCamera",
        stats.cameraVisits || 0
    );

    setText(
        "statChat",
        stats.chatMessages || 0
    );

    setText(
        "statSmile",
        stats.mrSmileInteractions || 0
    );

    setText(
        "statDenied",
        stats.deniedActions || 0
    );


    setText(
        "operatorFooterStatus",
        operator.status
    );

    setText(
        "operatorFooterId",
        operator.operatorId
    );
}


/* ==========================================================
   GLOBAL ACCESS
========================================================== */

window.loadOperatorProfile =
    loadOperatorProfile;
