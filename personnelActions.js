/* ==========================================================
   OMEGA PERSONNEL ACTIONS
   STAGE 2 — AUTONOMOUS WORK
========================================================== */

import {
    on,
    trigger
} from "./eventManager.js";
import {
    Storage
} from "./storage.js";

import {
    listFiles,
    getFile
} from "./filesystem.js";

import {
    getCameras
} from "./camera.js";

import {
    addChatMessage
} from "./chats.js";


/* ==========================================================
   CONFIG
========================================================== */

const ACTION_TICK =
    15000;

const FIRST_MIN =
    5000;

const FIRST_MAX =
    15000;

const NEXT_MIN =
    25000;

const NEXT_MAX =
    90000;

const HISTORY_KEY =
    "personnel_action_history_v1";

const MAX_HISTORY =
    100;


/* ==========================================================
   STATE
========================================================== */

let initialized =
    false;

let timer =
    null;

const nextActionAt =
    new Map();


/* ==========================================================
   HELPERS
========================================================== */

function now() {

    return Date.now();

}


function randomBetween(
    min,
    max
) {

    return Math.floor(
        Math.random() *
        (
            max -
            min +
            1
        )
    ) + min;

}


function getPersonnel() {

    const data =
        Storage.get(
            "personnel",
            []
        );

    return Array.isArray(data)
        ? data
        : [];

}


/* ==========================================================
   ACTION TIMING
========================================================== */

function scheduleNext(
    personnelId,
    first = false
) {

    nextActionAt.set(
        personnelId,
        now() +
        (
            first
                ? randomBetween(
                    FIRST_MIN,
                    FIRST_MAX
                )
                : randomBetween(
                    NEXT_MIN,
                    NEXT_MAX
                )
        )
    );

}


/* ==========================================================
   HISTORY
========================================================== */

function getHistory() {

    const data =
        Storage.get(
            HISTORY_KEY,
            []
        );

    return Array.isArray(data)
        ? data
        : [];

}


function saveHistory(
    history
) {

    Storage.set(
        HISTORY_KEY,
        history.slice(
            -MAX_HISTORY
        )
    );

}


/* ==========================================================
   RECORD ACTION
========================================================== */

function recordAction(
    person,
    action
) {

    const timestamp =
        now();


    const entry = {

        id:
            "PA-" +
            timestamp.toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 7),

        timestamp,

        personnelId:
            person.id,

        personnel:
            person.name,

        role:
            person.role,

        department:
            person.department,

        action:
            action.type,

        target:
            action.target ||
            null,

        detail:
            action.detail ||
            "",

        success:
            action.success !== false,

        autonomous:
            true

    };


    const history =
        getHistory();


    history.push(
        entry
    );


    saveHistory(
        history
    );


    /*
     * Dashboard already listens
     * to personnel:action.
     */

    trigger(
        "personnel:action",
        {

            type:
                action.type,

            personnelId:
                person.id,

            person:
                person.name,

            name:
                person.name,

            role:
                person.role,

            department:
                person.department,

            target:
                action.target ||
                null,

            activity:
                action.detail ||
                action.type,

            message:
                action.detail ||
                action.type,

            success:
                action.success !== false,

            timestamp,

            autonomous:
                true

        }
    );


    /*
     * Future systems can listen
     * to this event separately.
     */

    trigger(
        "personnel:autonomousAction",
        entry
    );


    return entry;

}


/* ==========================================================
   UPDATE PERSONNEL RECORD
========================================================== */

function updatePersonnelRecord(
    person,
    action
) {

    const data =
        getPersonnel();


    const current =
        data.find(
            item =>
                item.id ===
                person.id
        );


    if (!current) {
        return;
    }


    current.lastAction = {

        type:
            action.type,

        target:
            action.target ||
            null,

        detail:
            action.detail ||
            "",

        timestamp:
            now(),

        autonomous:
            true

    };


    current.updatedAt =
        now();


    Storage.set(
        "personnel",
        data
    );


    trigger(
        "personnel:updated",
        {

            version:
                2,

            source:
                "personnelActions",

            personnelId:
                person.id,

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   ARCHIVE
========================================================== */

function actionArchiveCheck(
    person
) {

    const files =
        listFiles(
            "/files"
        );


    if (
        !Array.isArray(files) ||
        files.length === 0
    ) {

        return {

            type:
                "archive_check",

            target:
                "/files",

            detail:
                "checked archive index: no visible records",

            success:
                true

        };

    }


    let pool =
        files;


    if (
        person.department ===
        "RESEARCH"
    ) {

        const researchFiles =
            files.filter(
                file =>
                    /experiment|memo/i.test(
                        file
                    )
            );


        if (
            researchFiles.length > 0
        ) {

            pool =
                researchFiles;

        }

    }


    const target =
        pool[
            randomBetween(
                0,
                pool.length - 1
            )
        ];


    const node =
        getFile(
            "/files/" +
            target
        );


    const restricted =
        !node ||
        node.type ===
            "denied";


    return {

        type:
            "archive_check",

        target:

            target,

        detail:

            restricted

                ? (
                    "checked archive entry: " +
                    target +
                    " (access restricted)"
                )

                : (
                    "checked archive record: " +
                    target
                ),

        success:
            true

    };

}


/* ==========================================================
   CAMERA
========================================================== */

function actionCameraCheck(
    person
) {

    const cameras =
        getCameras();


    if (
        !Array.isArray(cameras) ||
        cameras.length === 0
    ) {

        return {

            type:
                "camera_check",

            target:
                "CAMERA NETWORK",

            detail:
                "checked camera network: no channels available",

            success:
                false

        };

    }


    const available =
        cameras.filter(
            camera =>
                camera.status !==
                    "OFFLINE" &&
                camera.status !==
                    "MAINTENANCE"
        );


    const pool =
        available.length > 0
            ? available
            : cameras;


    const camera =
        pool[
            randomBetween(
                0,
                pool.length - 1
            )
        ];


    return {

        type:
            "camera_check",

        target:
            camera.id,

        detail:
            camera.id +
            " inspection completed: " +
            camera.status +
            ", signal " +
            camera.signal +
            "%",

        success:
            camera.status !==
            "OFFLINE"

    };

}


/* ==========================================================
   SYSTEM
========================================================== */

function actionSystemCheck(
    person
) {

    const personnel =
        getPersonnel();


    const active =
        personnel.filter(
            entry =>
                entry.status ===
                    "ON DUTY" ||
                entry.status ===
                    "BREAK"
        ).length;


    return {

        type:
            "system_check",

        target:
            "OMEGA CORE",

        detail:
            "system check completed: " +
            active +
            " personnel currently active",

        success:
            true

    };

}


/* ==========================================================
   MEDICAL
========================================================== */

function actionMedicalCheck(
    person
) {

    const personnel =
        getPersonnel();


    const medical =
        personnel.filter(
            entry =>
                String(
                    entry.department ||
                    ""
                ).toUpperCase() ===
                "MEDICAL"
        ).length;


    return {

        type:
            "medical_check",

        target:
            "MEDICAL RECORDS",

        detail:
            "medical workload checked: " +
            medical +
            " medical personnel registered",

        success:
            true

    };

}


/* ==========================================================
   PERSONNEL REVIEW
========================================================== */

function actionPersonnelReview(
    person
) {

    const personnel =
        getPersonnel();


    const active =
        personnel.filter(
            entry =>
                entry.status ===
                "ON DUTY"
        ).length;


    return {

        type:
            "personnel_review",

        target:
            "PERSONNEL STATUS",

        detail:
            "personnel status review completed: " +
            active +
            " staff on duty",

        success:
            true

    };

}


/* ==========================================================
   MAINTENANCE
========================================================== */

function actionMaintenanceCheck(
    person
) {

    return {

        type:
            "maintenance_check",

        target:
            "FACILITY SYSTEMS",

        detail:
            "facility inspection completed",

        success:
            true

    };

}


/* ==========================================================
   INTERNAL MESSAGE
========================================================== */

function actionSendMessage(
    person
) {

    const channels = {

        SECURITY:
            "security",

        RESEARCH:
            "research",

        MEDICAL:
            "medical",

        ADMINISTRATION:
            "general",

        ARCHIVE:
            "general",

        SYSTEMS:
            "general",

        COMMUNICATIONS:
            "general",

        MAINTENANCE:
            "general"

    };


    const chatId =
        channels[
            person.department
        ] ||
        "general";


    const messages = {

        SECURITY: [
            "Security checkpoint review completed.",
            "Camera network checked. No immediate issue detected.",
            "Archive access attempts reviewed."
        ],

        RESEARCH: [
            "Research records reviewed.",
            "Experimental documentation check completed.",
            "Research archive index verified."
        ],

        MEDICAL: [
            "Medical records review completed.",
            "Current medical workload checked.",
            "No critical medical update at this time."
        ],

        ADMINISTRATION: [
            "Administrative requests reviewed.",
            "Internal personnel records checked.",
            "Daily administrative review completed."
        ],

        ARCHIVE: [
            "Archive index verification completed.",
            "Document records checked.",
            "Archive maintenance pass completed."
        ],

        SYSTEMS: [
            "System diagnostics completed.",
            "Network service check completed.",
            "Core system logs reviewed."
        ],

        COMMUNICATIONS: [
            "Internal communication queue reviewed.",
            "Message routing check completed.",
            "Communications status verified."
        ],

        MAINTENANCE: [
            "Facility inspection completed.",
            "Utility sector check completed.",
            "Maintenance report review completed."
        ]

    };


    const pool =
        messages[
            person.department
        ] ||
        messages.ADMINISTRATION;


    const message =
        pool[
            randomBetween(
                0,
                pool.length - 1
            )
        ];


    const added =
        addChatMessage(
            chatId,
            {

                user:
                    person.name,

                text:
                    message

            }
        );


    return {

        type:
            "internal_message",

        target:
            chatId,

        detail:
            added

                ? (
                    "posted internal message to " +
                    chatId.toUpperCase() +
                    ": " +
                    message
                )

                : (
                    "message delivery failed for " +
                    chatId.toUpperCase()
                ),

        success:
            Boolean(
                added
            )

    };

}


/* ==========================================================
   CHOOSE ACTION
========================================================== */

function chooseAction(
    person
) {

    const capabilities =
        Array.isArray(
            person.capabilities
        )
            ? person.capabilities
            : [];


    const candidates =
        [];


    if (
        capabilities.includes(
            "check_cameras"
        )
    ) {

        candidates.push({

            weight:
                5,

            run:
                actionCameraCheck

        });

    }


    if (
        capabilities.includes(
            "review_security_logs"
        ) ||
        capabilities.includes(
            "read_archive"
        ) ||
        capabilities.includes(
            "update_archive_index"
        ) ||
        capabilities.includes(
            "read_research_files"
        )
    ) {

        candidates.push({

            weight:
                5,

            run:
                actionArchiveCheck

        });

    }


    if (
        capabilities.includes(
            "run_system_diagnostics"
        ) ||
        capabilities.includes(
            "check_network"
        )
    ) {

        candidates.push({

            weight:
                5,

            run:
                actionSystemCheck

        });

    }


    if (
        capabilities.includes(
            "read_medical_records"
        ) ||
        capabilities.includes(
            "check_inventory"
        )
    ) {

        candidates.push({

            weight:
                5,

            run:
                actionMedicalCheck

        });

    }


    if (
        capabilities.includes(
            "review_personnel"
        )
    ) {

        candidates.push({

            weight:
                4,

            run:
                actionPersonnelReview

        });

    }


    if (
        capabilities.includes(
            "check_facility"
        ) ||
        capabilities.includes(
            "submit_maintenance_report"
        )
    ) {

        candidates.push({

            weight:
                5,

            run:
                actionMaintenanceCheck

        });

    }


    if (
        capabilities.includes(
            "send_internal_message"
        ) ||
        capabilities.includes(
            "send_security_message"
        ) ||
        capabilities.includes(
            "send_medical_message"
        ) ||
        capabilities.includes(
            "send_archive_message"
        ) ||
        capabilities.includes(
            "send_system_message"
        )
    ) {

        candidates.push({

            weight:
                2,

            run:
                actionSendMessage

        });

    }


    if (
        candidates.length ===
        0
    ) {

        return null;

    }


    const totalWeight =
        candidates.reduce(
            (
                total,
                candidate
            ) =>
                total +
                candidate.weight,
            0
        );


    let roll =
        Math.random() *
        totalWeight;


    for (
        const candidate
        of candidates
    ) {

        roll -=
            candidate.weight;


        if (
            roll <=
            0
        ) {

            return candidate.run(
                person
            );

        }

    }


    return candidates[
        candidates.length - 1
    ].run(
        person
    );

}


/* ==========================================================
   RUN
========================================================== */

function runForPerson(
    person
) {

    if (
        !person ||
        person.status !==
            "ON DUTY"
    ) {

        return;

    }


    const dueAt =
        nextActionAt.get(
            person.id
        );


    if (
        typeof dueAt !==
            "number"
    ) {

        scheduleNext(
            person.id,
            true
        );

        return;

    }


    if (
        now() <
        dueAt
    ) {

        return;

    }


    const action =
        chooseAction(
            person
        );


    if (!action) {

        scheduleNext(
            person.id
        );

        return;

    }


    const entry =
        recordAction(
            person,
            action
        );


    updatePersonnelRecord(
        person,
        action
    );


    console.log(
        "[PERSONNEL ACTION]",
        entry
    );


    scheduleNext(
        person.id
    );

}


/* ==========================================================
   TICK
========================================================== */

function tick() {

    const personnel =
        getPersonnel();


    const ids =
        new Set(
            personnel.map(
                person =>
                    person.id
            )
        );


    for (
        const id
        of nextActionAt.keys()
    ) {

        if (
            !ids.has(id)
        ) {

            nextActionAt.delete(
                id
            );

        }

    }


    for (
        const person
        of personnel
    ) {

        if (
            !nextActionAt.has(
                person.id
            )
        ) {

            scheduleNext(
                person.id,
                true
            );

        }


        runForPerson(
            person
        );

    }

}


/* ==========================================================
   PUBLIC API
========================================================== */

export function getPersonnelActionHistory() {

    return [
        ...getHistory()
    ];

}


export function resetPersonnelActionHistory() {

    Storage.remove(
        HISTORY_KEY
    );

    nextActionAt.clear();

}


export function runPersonnelActionNow(
    personnelId
) {

    const personnel =
        getPersonnel();


    const person =
        personnel.find(
            entry =>
                entry.id ===
                personnelId
        );


    if (
        !person ||
        person.status !==
            "ON DUTY"
    ) {

        return false;

    }


    const action =
        chooseAction(
            person
        );


    if (!action) {
        return false;
    }


    const entry =
        recordAction(
            person,
            action
        );


    updatePersonnelRecord(
        person,
        action
    );


    scheduleNext(
        person.id
    );


    return entry;

}


/* ==========================================================
   INIT
========================================================== */

export function initPersonnelActions() {

    if (initialized) {
        return;
    }


    initialized =
        true;


    const personnel =
        getPersonnel();


    personnel.forEach(
        person =>
            scheduleNext(
                person.id,
                true
            )
    );


    timer =
        setInterval(
            tick,
            ACTION_TICK
        );


    onPersonnelUpdated();


    console.log(
        "[PERSONNEL ACTIONS] Initialized.",
        {
            personnel:
                personnel.length
        }
    );

}


function onPersonnelUpdated() {

    /*
     * This function only repairs
     * missing timers. It does not
     * create duplicate actions.
     */

    on(
        "personnel:updated",
        () => {

            const personnel =
                getPersonnel();


            personnel.forEach(
                person => {

                    if (
                        !nextActionAt.has(
                            person.id
                        )
                    ) {

                        scheduleNext(
                            person.id,
                            true
                        );

                    }

                }
            );

        }
    );

}


/* ==========================================================
   DEBUG API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.PERSONNEL_ACTIONS = {

        history:
            getPersonnelActionHistory,

        reset:
            resetPersonnelActionHistory,

        run:
            runPersonnelActionNow

    };

}
