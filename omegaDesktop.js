/* ==========================================================
   OMEGA DESKTOP HOME
   MIRROR-INT / OMEGA

   Purpose:
   - persistent internal system overview
   - live personnel status
   - recent system activity
   - facility / network status
   - subtle system notices

   This module does NOT create horror effects.
   It only visualizes data already produced by OMEGA systems.
========================================================== */

import {
    on
} from "./eventManager.js";

import {
    Storage
} from "./storage.js";

import {
    getCurrentOperator
} from "./login.js";

import {
    getCameras
} from "./camera.js";

import {
    getOmegaTimeStatus,
    formatOmegaTime
} from "./omegaTime.js";


/* ==========================================================
   CONFIG
========================================================== */

const STORAGE_KEY =
    "omega_desktop_activity_v1";

const MAX_ACTIVITY =
    16;

const MODULE_COUNT =
    14;


/* ==========================================================
   STATE
========================================================== */

let initialized =
    false;

let timer =
    null;

let activity =
    [];

let lastNotice =
    "";


/* ==========================================================
   HELPERS
========================================================== */

function el(id) {

    return document.getElementById(
        id
    );

}


function now() {

    return Date.now();

}


function safeText(
    value,
    fallback = "—"
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


function escapeHtml(
    value
) {

    return String(
        value ??
        ""
    )
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


function getPersonnel() {

    const data =
        Storage.get(
            "personnel",
            []
        );

    return (
        Array.isArray(data)
            ? data
            : []
    );

}


function getActivePersonnel() {

    return getPersonnel().filter(
        person =>
            person &&
            (
                person.status ===
                "ON DUTY" ||

                person.status ===
                "BREAK"
            )
    );

}


function formatTime(
    timestamp
) {

    const value =
        Number(
            timestamp
        );

    if (
        !Number.isFinite(
            value
        )
    ) {

        return "--:--";

    }

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "--:--";

    }

    return date.toLocaleTimeString(
        [],
        {
            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


/* ==========================================================
   ACTIVITY STORAGE
========================================================== */

function saveActivity() {

    Storage.set(
        STORAGE_KEY,
        activity.slice(
            -MAX_ACTIVITY
        )
    );

}


function loadActivity() {

    const saved =
        Storage.get(
            STORAGE_KEY,
            []
        );

    activity =
        Array.isArray(
            saved
        )
            ? saved.slice(
                -MAX_ACTIVITY
            )
            : [];

}


/* ==========================================================
   ADD ACTIVITY
========================================================== */

function addActivity(
    category,
    actor,
    detail,
    timestamp = now()
) {

    const cleanCategory =
        safeText(
            category,
            "SYSTEM"
        );

    const cleanActor =
        safeText(
            actor,
            "SYSTEM"
        );

    const cleanDetail =
        safeText(
            detail,
            "System event recorded."
        );

    const cleanTimestamp =
        Number(
            timestamp
        ) ||
        now();


    const last =
        activity[
            activity.length - 1
        ];


    /*
     * Prevent duplicate events.
     */

    if (
        last &&

        last.category ===
        cleanCategory &&

        last.actor ===
        cleanActor &&

        last.detail ===
        cleanDetail &&

        cleanTimestamp -
        Number(
            last.timestamp
        ) < 4000
    ) {

        return;

    }


    activity.push({

        category:
            cleanCategory,

        actor:
            cleanActor,

        detail:
            cleanDetail,

        timestamp:
            cleanTimestamp

    });


    if (
        activity.length >
        MAX_ACTIVITY
    ) {

        activity =
            activity.slice(
                -MAX_ACTIVITY
            );

    }


    saveActivity();

    render();

}


/* ==========================================================
   DEPARTMENT STATUS
========================================================== */

function getDepartmentStatus(
    department
) {

    const active =
        getActivePersonnel().some(
            person =>
                String(
                    person.department ||
                    ""
                ).toUpperCase() ===
                department
        );


    return (
        active
            ? "ACTIVE"
            : "OFFLINE"
    );

}


/* ==========================================================
   INCIDENT COUNT
========================================================== */

function getRecentIncidentCount() {

    const cutoff =
        now() -
        (
            24 *
            60 *
            60 *
            1000
        );


    return activity.filter(
        entry =>
            entry.category ===
            "INCIDENT" &&

            Number(
                entry.timestamp
            ) >=
            cutoff

    ).length;

}


/* ==========================================================
   OMEGA TIME
========================================================== */

function getTimeState() {

    try {

        const status =
            getOmegaTimeStatus();


        if (
            status &&
            status.lastConflict
        ) {

            return "REVIEW";

        }


        return "SYNCED";

    } catch {

        return "LOCAL";

    }

}


/* ==========================================================
   OPERATOR
========================================================== */

function getOperatorLabel() {

    const operator =
        getCurrentOperator();


    if (!operator) {

        return "NO ACTIVE OPERATOR";

    }


    return (
        operator.operatorId ||
        operator.username ||
        "OPERATOR"
    );

}


/* ==========================================================
   RENDER OVERVIEW
========================================================== */

function renderOverview() {

    const activePersonnel =
        getActivePersonnel().length;


    const incidentCount =
        getRecentIncidentCount();


    let cameraCount =
        0;


    try {

        const cameras =
            getCameras();


        cameraCount =
            Array.isArray(
                cameras
            )
                ? cameras.length
                : 0;

    } catch {

        cameraCount =
            0;

    }


    const timeState =
        getTimeState();


    const moduleCount =
        el(
            "omegaDesktopModuleCount"
        );

    if (
        moduleCount
    ) {

        moduleCount.textContent =
            MODULE_COUNT;

    }


    const personnelCount =
        el(
            "omegaDesktopPersonnelCount"
        );

    if (
        personnelCount
    ) {

        personnelCount.textContent =
            String(
                activePersonnel
            ).padStart(
                2,
                "0"
            );

    }


    const incidents =
        el(
            "omegaDesktopIncidentCount"
        );

    if (
        incidents
    ) {

        incidents.textContent =
            String(
                incidentCount
            ).padStart(
                2,
                "0"
            );

    }


    const timeStatus =
        el(
            "omegaDesktopTimeStatus"
        );

    if (
        timeStatus
    ) {

        timeStatus.textContent =
            timeState;

        timeStatus.dataset.state =
            timeState.toLowerCase();

    }


    const operator =
        el(
            "omegaDesktopOperator"
        );

    if (
        operator
    ) {

        operator.textContent =
            getOperatorLabel();

    }


    const cameraStatus =
        el(
            "omegaDesktopCameraStatus"
        );

    if (
        cameraStatus
    ) {

        cameraStatus.textContent =
            cameraCount > 0
                ? (
                    cameraCount +
                    " CHANNELS"
                )
                : "UNAVAILABLE";

    }


    const archive =
        el(
            "omegaDesktopArchiveStatus"
        );

    if (
        archive
    ) {

        archive.textContent =
            "ONLINE";

    }


    const departments = [
        "SECURITY",
        "RESEARCH",
        "MEDICAL",
        "ADMINISTRATION"
    ];


    departments.forEach(
        department => {

            const node =
                el(
                    "omegaDesktopDepartment-" +
                    department
                );


            if (!node) {
                return;
            }


            const state =
                getDepartmentStatus(
                    department
                );


            node.textContent =
                state;

            node.dataset.state =
                state.toLowerCase();

        }
    );

}


/* ==========================================================
   PERSONNEL PANEL
========================================================== */

function renderPersonnel() {

    const root =
        el(
            "omegaDesktopPersonnel"
        );


    if (!root) {
        return;
    }


    const people =
        getActivePersonnel()
            .slice(
                0,
                5
            );


    if (
        people.length === 0
    ) {

        root.innerHTML =
            `
            <div class="omegaDesktopEmpty">
                NO ACTIVE PERSONNEL
            </div>
            `;

        return;

    }


    root.innerHTML =
        people
            .map(
                person => `

                    <div class="omegaDesktopPersonnelRow">

                        <div
                            class="omegaDesktopPersonName"
                        >
                            ${escapeHtml(
                                person.name
                            )}
                        </div>

                        <div
                            class="omegaDesktopPersonLocation"
                        >
                            ${escapeHtml(
                                person.location ||
                                "LOCATION UNAVAILABLE"
                            )}
                        </div>

                        <div
                            class="omegaDesktopPersonStatus"
                            data-state="${escapeHtml(
                                String(
                                    person.status ||
                                    ""
                                ).toLowerCase()
                            )}"
                        >
                            ${escapeHtml(
                                person.status ||
                                "UNKNOWN"
                            )}
                        </div>

                    </div>

                `
            )
            .join("");

}


/* ==========================================================
   SYSTEM ACTIVITY
========================================================== */

function renderActivity() {

    const root =
        el(
            "omegaDesktopActivity"
        );


    if (!root) {
        return;
    }


    const entries =
        [
            ...activity
        ]
            .reverse()
            .slice(
                0,
                7
            );


    if (
        entries.length === 0
    ) {

        root.innerHTML =
            `
            <div class="omegaDesktopEmpty">
                NO SYSTEM ACTIVITY RECORDED.
            </div>
            `;

        return;

    }


    root.innerHTML =
        entries
            .map(
                entry => `

                    <div
                        class="omegaDesktopActivityRow"
                    >

                        <span
                            class="omegaDesktopActivityTime"
                        >
                            ${escapeHtml(
                                formatTime(
                                    entry.timestamp
                                )
                            )}
                        </span>

                        <span
                            class="omegaDesktopActivityCategory"
                        >
                            ${escapeHtml(
                                entry.category
                            )}
                        </span>

                        <span
                            class="omegaDesktopActivityActor"
                        >
                            ${escapeHtml(
                                entry.actor
                            )}
                        </span>

                        <span
                            class="omegaDesktopActivityDetail"
                        >
                            ${escapeHtml(
                                entry.detail
                            )}
                        </span>

                    </div>

                `
            )
            .join("");

}


/* ==========================================================
   NOTICE
========================================================== */

function renderNotice() {

    const node =
        el(
            "omegaDesktopNotice"
        );


    if (!node) {
        return;
    }


    const timeState =
        getTimeState();


    const incidents =
        getRecentIncidentCount();


    let message =
        "NO ACTIVE SYSTEM NOTICES.";

    let state =
        "normal";


    if (
        timeState ===
        "REVIEW"
    ) {

        message =
            "TIME SYNCHRONIZATION REQUIRES REVIEW.";

        state =
            "warning";

    } else if (
        incidents > 0
    ) {

        message =
            "RECENT PERSONNEL INCIDENT RECORDED.";

        state =
            "notice";

    }


    lastNotice =
        message;


    node.textContent =
        message;

    node.dataset.state =
        state;

}


/* ==========================================================
   NETWORK
========================================================== */

function renderNetwork() {

    const network =
        el(
            "omegaDesktopNetworkStatus"
        );


    if (
        network
    ) {

        const state =
            getTimeState();


        network.textContent =
            state ===
            "REVIEW"
                ? "SYNC REVIEW"
                : "LOCAL NODE ACTIVE";


        network.dataset.state =
            state ===
            "REVIEW"
                ? "warning"
                : "normal";

    }


    const sync =
        el(
            "omegaDesktopLastSync"
        );


    if (
        sync
    ) {

        try {

            sync.textContent =
                formatOmegaTime(
                    false
                );

        } catch {

            sync.textContent =
                "--:--";

        }

    }

}


/* ==========================================================
   CLOCK
========================================================== */

function renderClock() {

    const normal =
        el(
            "omegaDesktopClock"
        );


    if (
        normal
    ) {

        normal.textContent =
            formatOmegaTime(
                false
            );

    }


    const precise =
        el(
            "omegaDesktopClockPrecise"
        );


    if (
        precise
    ) {

        precise.textContent =
            formatOmegaTime(
                true
            );

    }

}


/* ==========================================================
   MAIN RENDER
========================================================== */

function render() {

    renderOverview();

    renderPersonnel();

    renderActivity();

    renderNotice();

    renderNetwork();

    renderClock();

}


/* ==========================================================
   PERSONNEL EVENTS
========================================================== */

function handlePersonnelAction(
    data = {}
) {

    addActivity(

        data.type ===
            "incident"

            ? "INCIDENT"
            : "PERSONNEL",

        data.person ||
            data.name ||
            "PERSONNEL",

        data.type ===
            "conversation_message"

            ? "internal communication"

            : data.activity ||
              data.message ||
              data.type ||
              "work activity",

        data.timestamp

    );

}


/* ==========================================================
   PERSONNEL MOVEMENT
========================================================== */

function handlePersonnelMovement(
    data = {}
) {

    addActivity(

        "PERSONNEL",

        data.name ||
            "PERSONNEL",

        `${safeText(
            data.from,
            "UNKNOWN"
        )} → ${safeText(
            data.to,
            "UNKNOWN"
        )}`,

        data.timestamp

    );

}


/* ==========================================================
   PERSONNEL STATUS CHANGE
========================================================== */

function handlePersonnelActivityChanged(
    data = {}
) {

    const current =
        data.current ||
        {};

    const previous =
        data.previous ||
        {};


    /*
     * Ignore simple activity changes.
     * Only show meaningful shift/location changes.
     */

    if (
        current.status ===
        previous.status &&

        current.location ===
        previous.location
    ) {

        return;

    }


    addActivity(

        "SHIFT",

        data.name ||
            "PERSONNEL",

        `${safeText(
            current.status,
            "STATUS UNKNOWN"
        )} / ${safeText(
            current.location,
            "LOCATION UNKNOWN"
        )}`,

        data.timestamp

    );

}


/* ==========================================================
   PERSONNEL INCIDENT
========================================================== */

function handlePersonnelIncident(
    data = {}
) {

    addActivity(

        "INCIDENT",

        data.person ||
            "PERSONNEL",

        safeText(
            data.message,
            data.type ||
            "Personnel incident reported."
        ),

        data.timestamp

    );

}


/* ==========================================================
   OPERATOR ACTIVITY
========================================================== */

function handleOperatorActivity(
    data = {}
) {

    const type =
        safeText(
            data.type,
            ""
        );


    let category =
        null;

    let detail =
        null;


    if (
        [
            "file.open",
            "file.read",
            "restricted.file.open",
            "folder.open"
        ].includes(
            type
        )
    ) {

        category =
            "ARCHIVE";

        detail =
            data.target ||
            data.path ||
            data.name ||
            "archive activity";

    }


    else if (
        [
            "camera.open",
            "camera.visit",
            "camera.close"
        ].includes(
            type
        )
    ) {

        category =
            "CAMERA";

        detail =
            data.target ||
            "camera activity";

    }


    else if (
        [
            "console.command",
            "console.unknown"
        ].includes(
            type
        )
    ) {

        category =
            "CONSOLE";

        detail =
            data.command ||

            (
                type ===
                "console.unknown"

                    ? "unknown command"

                    : "command executed"
            );

    }


    else if (
        type ===
        "chat.message"
    ) {

        category =
            "COMMUNICATIONS";

        detail =
            "operator message sent";

    }


    if (!category) {
        return;
    }


    addActivity(

        category,

        "OPERATOR",

        detail,

        data.timestamp

    );

}


/* ==========================================================
   CHAT EVENTS
========================================================== */

function handleChatMessage(
    data = {}
) {

    const message =
        data.message ||
        {};


    const user =
        safeText(
            message.user,
            ""
        );


    if (!user) {
        return;
    }


    const personnelNames =
        new Set(
            getPersonnel()
                .map(
                    person =>
                        person?.name
                )
                .filter(
                    Boolean
                )
        );


    /*
     * Only internal personnel messages
     * become desktop system activity.
     */

    if (
        !personnelNames.has(
            user
        )
    ) {

        return;

    }


    addActivity(

        "COMMUNICATIONS",

        user,

        "internal message posted",

        now()

    );

}


/* ==========================================================
   OMEGA TIME CONFLICT
========================================================== */

function handleTimeConflict(
    data = {}
) {

    addActivity(

        "TIME",

        "OMEGA TIME",

        safeText(
            data.reason,
            "time synchronization conflict"
        ),

        data.timestamp

    );


    render();

}


/* ==========================================================
   OMEGA TIME RESET
========================================================== */

function handleTimeReset(
    data = {}
) {

    addActivity(

        "SYSTEM",

        "OMEGA TIME",

        "time service initialized",

        data.timestamp

    );


    render();

}


/* ==========================================================
   INIT
========================================================== */

export function initOmegaDesktop() {

    if (
        initialized
    ) {

        render();

        return getOmegaDesktopStatus();

    }


    const root =
        el(
            "omegaDesktopHome"
        );


    if (!root) {

        console.warn(
            "[OMEGA DESKTOP] Home container not found."
        );

        return null;

    }


    initialized =
        true;


    loadActivity();


    addActivity(

        "SYSTEM",

        "OMEGA CORE",

        "internal desktop initialized"

    );


    /*
     * Personnel
     */

    on(
        "personnel:action",
        handlePersonnelAction
    );


    on(
        "personnel:movement",
        handlePersonnelMovement
    );


    on(
        "personnel:activityChanged",
        handlePersonnelActivityChanged
    );


    on(
        "personnel:incident",
        handlePersonnelIncident
    );


    /*
     * Operator
     */

    on(
        "user.activityRecorded",
        handleOperatorActivity
    );


    /*
     * Communication
     */

    on(
        "chat:messageAdded",
        handleChatMessage
    );


    /*
     * OMEGA Time
     */

    on(
        "omega:timeConflict",
        handleTimeConflict
    );


    on(
        "omega:timeReset",
        handleTimeReset
    );


    render();


    timer =
        setInterval(
            render,
            1000
        );


    console.log(
        "[OMEGA DESKTOP] Internal desktop overview initialized."
    );


    return getOmegaDesktopStatus();

}


/* ==========================================================
   STATUS
========================================================== */

export function getOmegaDesktopStatus() {

    return {

        initialized,

        activity:
            [
                ...activity
            ],

        activePersonnel:
            getActivePersonnel().length,

        incidents:
            getRecentIncidentCount(),

        modules:
            MODULE_COUNT,

        time:
            getTimeState()

    };

}


/* ==========================================================
   RESET ACTIVITY
========================================================== */

export function resetOmegaDesktopActivity() {

    activity =
        [];


    Storage.remove(
        STORAGE_KEY
    );


    addActivity(

        "SYSTEM",

        "OMEGA CORE",

        "desktop activity log reset"

    );


    render();


    return true;

}


/* ==========================================================
   GLOBAL API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.OMEGA_DESKTOP = {

        init:
            initOmegaDesktop,

        status:
            getOmegaDesktopStatus,

        refresh:
            render,

        resetActivity:
            resetOmegaDesktopActivity

    };

}
