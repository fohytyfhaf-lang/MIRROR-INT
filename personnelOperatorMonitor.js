/* ==========================================================
   OMEGA PERSONNEL OPERATOR MONITOR
   STAGE 6 — PERSONNEL REACTION TO OPERATOR ACTIVITY

   Employees can notice what the operator is doing.

   They do NOT automatically chat here.

   Examples:

       OPERATOR opens restricted file
              ↓
       SECURITY notices
              ↓
       review task created
              ↓
       employee performs review
              ↓
       task completed
              ↓
       Dashboard / Personnel records activity

       OPERATOR opens camera
              ↓
       SECURITY performs surveillance check

       OPERATOR executes unknown console command
              ↓
       SYSTEMS reviews command activity

   This module reacts to operator activity only.
========================================================== */

import {
    on,
    trigger
} from "./eventManager.js";

import {
    Storage
} from "./storage.js";

import {
    createPersonnelTask,
    startPersonnelTask,
    completePersonnelTask
} from "./personnelEventSystem.js";


/* ==========================================================
   CONFIG
========================================================== */

const OPERATOR_COOLDOWN =
    45000;

const TASK_MIN_DELAY =
    4000;

const TASK_MAX_DELAY =
    12000;

const REPEAT_WINDOW =
    3 * 60 * 1000;

const RESTRICTED_REPEAT_LIMIT =
    3;


/* ==========================================================
   STATE
========================================================== */

let initialized =
    false;

let timer =
    null;

const pendingReactions =
    new Map();

const recentOperatorEvents =
    [];

const cooldowns =
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

    return Array.isArray(
        data
    )
        ? data
        : [];

}


function isOnDuty(
    person
) {

    return Boolean(
        person &&
        person.status ===
            "ON DUTY"
    );

}


function getOnDutyByDepartment(
    department
) {

    return getPersonnel()
        .filter(
            person =>
                isOnDuty(
                    person
                ) &&
                person.department ===
                    department
        );

}


function pick(
    array
) {

    if (
        !Array.isArray(array) ||
        array.length === 0
    ) {

        return null;

    }

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];

}


/* ==========================================================
   PERSONNEL SELECTION
========================================================== */

function chooseEmployee(
    type
) {

    let pool = [];


    switch (
        type
    ) {

        case "RESTRICTED_FILE":

            pool =
                getOnDutyByDepartment(
                    "SECURITY"
                );

            break;


        case "CAMERA":

            pool =
                getOnDutyByDepartment(
                    "SECURITY"
                );

            break;


        case "CONSOLE":

            pool =
                getOnDutyByDepartment(
                    "SYSTEMS"
                );

            break;


        case "RESEARCH_FILE":

            pool =
                getOnDutyByDepartment(
                    "RESEARCH"
                );

            break;


        case "ARCHIVE":

            pool =
                getOnDutyByDepartment(
                    "ARCHIVE"
                );

            break;


        case "COMMUNICATION":

            pool =
                getOnDutyByDepartment(
                    "COMMUNICATIONS"
                );

            break;


        default:

            pool =
                getPersonnel()
                    .filter(
                        isOnDuty
                    );

            break;

    }


    return pick(
        pool
    );

}


/* ==========================================================
   COOLDOWN
========================================================== */

function cooldownKey(
    type,
    target
) {

    return (
        type +
        "::" +
        String(
            target ||
            ""
        )
    );

}


function isCoolingDown(
    type,
    target
) {

    const key =
        cooldownKey(
            type,
            target
        );

    const timestamp =
        cooldowns.get(
            key
        );


    if (
        typeof timestamp !==
        "number"
    ) {

        return false;

    }


    return (
        now() -
        timestamp <
        OPERATOR_COOLDOWN
    );

}


function setCooldown(
    type,
    target
) {

    cooldowns.set(
        cooldownKey(
            type,
            target
        ),
        now()
    );

}


/* ==========================================================
   OPERATOR EVENT HISTORY
========================================================== */

function recordOperatorEvent(
    type,
    target
) {

    const timestamp =
        now();


    recentOperatorEvents.push({

        type,

        target:
            target ||
            null,

        timestamp

    });


    const cutoff =
        timestamp -
        REPEAT_WINDOW;


    while (
        recentOperatorEvents.length > 0 &&
        recentOperatorEvents[0].timestamp <
            cutoff
    ) {

        recentOperatorEvents.shift();

    }

}


function countRecentEvents(
    type
) {

    const cutoff =
        now() -
        REPEAT_WINDOW;


    return recentOperatorEvents
        .filter(
            event =>
                event.type ===
                    type &&
                event.timestamp >=
                    cutoff
        )
        .length;

}


/* ==========================================================
   PERSONNEL ACTION RECORD
========================================================== */

function recordPersonnelReaction(
    person,
    data
) {

    const personnel =
        getPersonnel();


    const current =
        personnel.find(
            entry =>
                entry.id ===
                person.id
        );


    if (
        !current
    ) {

        return;

    }


    current.lastAction = {

        type:
            data.type,

        target:
            data.target ||
            null,

        detail:
            data.detail ||
            "",

        timestamp:
            now(),

        autonomous:
            true,

        causedByOperator:
            true

    };


    current.updatedAt =
        now();


    Storage.set(
        "personnel",
        personnel
    );


    trigger(
        "personnel:updated",
        {

            version:
                3,

            source:
                "personnelOperatorMonitor",

            personnelId:
                person.id,

            timestamp:
                now()

        }
    );


    trigger(
        "personnel:operatorResponse",
        {

            personnelId:
                person.id,

            personnel:
                person.name,

            department:
                person.department,

            role:
                person.role,

            action:
                data.type,

            target:
                data.target ||
                null,

            detail:
                data.detail ||
                "",

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   CREATE REACTION TASK
========================================================== */

function createReaction(
    employeeType,
    taskData,
    reactionData
) {

    const employee =
        chooseEmployee(
            employeeType
        );


    if (
        !employee
    ) {

        trigger(
            "personnel:operatorObserved",
            {

                employee: null,

                employeeType,

                ...reactionData,

                timestamp:
                    now()

            }
        );

        return null;

    }


    const task =
        createPersonnelTask({

            type:
                taskData.type,

            title:
                taskData.title,

            state:
                "ASSIGNED",

            priority:
                taskData.priority ||
                "NORMAL",

            assigneeId:
                employee.id,

            department:
                employee.department,

            target:
                taskData.target ||
                null,

            details:
                taskData.details ||
                "",

            source:
                "operator"

        });


    const completeAt =
        now() +
        randomBetween(
            TASK_MIN_DELAY,
            TASK_MAX_DELAY
        );


    pendingReactions.set(
        task.id,
        {

            taskId:
                task.id,

            employeeId:
                employee.id,

            completeAt,

            reaction:
                reactionData

        }
    );


    trigger(
        "personnel:operatorObserved",
        {

            employee:
                employee.name,

            employeeId:
                employee.id,

            department:
                employee.department,

            role:
                employee.role,

            taskId:
                task.id,

            ...reactionData,

            timestamp:
                now()

        }
    );


    return task;

}


/* ==========================================================
   FINISH REACTION
========================================================== */

function completeReaction(
    reaction
) {

    const personnel =
        getPersonnel();


    const employee =
        personnel.find(
            person =>
                person.id ===
                    reaction.employeeId
        );


    if (
        !employee
    ) {

        pendingReactions.delete(
            reaction.taskId
        );

        return;

    }


    const started =
        startPersonnelTask(
            reaction.taskId,
            employee.id
        );


    if (
        !started
    ) {

        /*
         * The task may already have been
         * changed by another subsystem.
         */

        pendingReactions.delete(
            reaction.taskId
        );

        return;

    }


    const detail =
        reaction.reaction.detail ||
        "operator activity reviewed";


    recordPersonnelReaction(
        employee,
        {

            type:
                reaction.reaction.action,

            target:
                reaction.reaction.target,

            detail

        }
    );


    completePersonnelTask(
        reaction.taskId,
        detail
    );


    pendingReactions.delete(
        reaction.taskId
    );


    trigger(
        "personnel:operatorResponseCompleted",
        {

            personnelId:
                employee.id,

            personnel:
                employee.name,

            taskId:
                reaction.taskId,

            action:
                reaction.reaction.action,

            target:
                reaction.reaction.target,

            detail,

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   RESTRICTED FILE
========================================================== */

function handleRestrictedFile(
    data
) {

    const target =
        data.target ||
        data.path ||
        data.name ||
        "RESTRICTED FILE";


    if (
        isCoolingDown(
            "RESTRICTED_FILE",
            target
        )
    ) {

        return;

    }


    setCooldown(
        "RESTRICTED_FILE",
        target
    );


    recordOperatorEvent(
        "RESTRICTED_FILE",
        target
    );


    createReaction(
        "RESTRICTED_FILE",
        {

            type:
                "OPERATOR_ACCESS_REVIEW",

            title:
                "Review operator restricted access",

            priority:
                "HIGH",

            target,

            details:
                "Operator accessed restricted archive data."

        },
        {

            action:
                "operator_access_review",

            target,

            detail:
                "reviewed operator access to restricted record " +
                target

        }
    );


    if (
        countRecentEvents(
            "RESTRICTED_FILE"
        ) >=
        RESTRICTED_REPEAT_LIMIT
    ) {

        trigger(
            "personnel:incident",
            {

                type:
                    "repeated_operator_restricted_access",

                severity:
                    "warning",

                message:
                    "Repeated operator access to restricted archive data.",

                target,

                timestamp:
                    now()

            }
        );

    }

}


/* ==========================================================
   CAMERA
========================================================== */

function handleCamera(
    data
) {

    const target =
        data.target ||
        data.camera ||
        "CAMERA NETWORK";


    if (
        isCoolingDown(
            "CAMERA",
            target
        )
    ) {

        return;

    }


    setCooldown(
        "CAMERA",
        target
    );


    recordOperatorEvent(
        "CAMERA",
        target
    );


    createReaction(
        "CAMERA",
        {

            type:
                "OPERATOR_CAMERA_REVIEW",

            title:
                "Review operator camera access",

            target,

            details:
                "Operator accessed camera channel " +
                target +
                "."

        },
        {

            action:
                "camera_surveillance",

            target,

            detail:
                "security reviewed operator activity on " +
                target

        }
    );

}


/* ==========================================================
   CONSOLE
========================================================== */

function handleConsole(
    data
) {

    const command =
        data.command ||
        data.target ||
        "UNKNOWN COMMAND";


    if (
        isCoolingDown(
            "CONSOLE",
            command
        )
    ) {

        return;

    }


    setCooldown(
        "CONSOLE",
        command
    );


    recordOperatorEvent(
        "CONSOLE",
        command
    );


    const unknown =
        data.type ===
            "console.unknown";


    createReaction(
        "CONSOLE",
        {

            type:
                unknown
                    ? "UNKNOWN_COMMAND_REVIEW"
                    : "OPERATOR_CONSOLE_REVIEW",

            title:
                unknown
                    ? "Review unknown console command"
                    : "Review operator console activity",

            priority:
                unknown
                    ? "HIGH"
                    : "NORMAL",

            target:
                command,

            details:
                unknown
                    ? "Unknown console command executed by operator."
                    : "Operator console activity requires routine review."

        },
        {

            action:
                unknown
                    ? "unknown_command_review"
                    : "console_activity_review",

            target:
                command,

            detail:
                unknown
                    ? "systems reviewed unknown operator command " +
                      command
                    : "systems reviewed operator console activity"

        }
    );

}


/* ==========================================================
   ARCHIVE / FILE
========================================================== */

function handleFile(
    data
) {

    const target =
        data.target ||
        data.path ||
        data.name ||
        "ARCHIVE";


    const restricted =
        data.type ===
            "restricted.file.open";


    if (
        restricted
    ) {

        handleRestrictedFile(
            data
        );

        return;

    }


    if (
        isCoolingDown(
            "ARCHIVE",
            target
        )
    ) {

        return;

    }


    setCooldown(
        "ARCHIVE",
        target
    );


    recordOperatorEvent(
        "ARCHIVE",
        target
    );


    const isResearch =
        /experiment|research|ten|alexey|phase/i.test(
            target
        );


    createReaction(
        isResearch
            ? "RESEARCH"
            : "ARCHIVE",
        {

            type:
                isResearch
                    ? "OPERATOR_RESEARCH_REVIEW"
                    : "OPERATOR_ARCHIVE_REVIEW",

            title:
                isResearch
                    ? "Review operator research access"
                    : "Review operator archive access",

            target,

            details:
                "Operator accessed archive record " +
                target +
                "."

        },
        {

            action:
                isResearch
                    ? "research_access_review"
                    : "archive_access_review",

            target,

            detail:
                isResearch
                    ? "research staff reviewed operator access to " +
                      target
                    : "archivist reviewed operator access to " +
                      target

        }
    );

}


/* ==========================================================
   COMMUNICATION
========================================================== */

function handleCommunication(
    data
) {

    if (
        isCoolingDown(
            "COMMUNICATION",
            "operator"
        )
    ) {

        return;

    }


    setCooldown(
        "COMMUNICATION",
        "operator"
    );


    createReaction(
        "COMMUNICATION",
        {

            type:
                "OPERATOR_COMMUNICATION_REVIEW",

            title:
                "Review operator communication activity",

            target:
                "INTERNAL COMMUNICATIONS",

            details:
                "Operator communication activity recorded."

        },
        {

            action:
                "communication_review",

            target:
                "INTERNAL COMMUNICATIONS",

            detail:
                "communications activity reviewed"

        }
    );

}


/* ==========================================================
   ROUTER
========================================================== */

function handleOperatorActivity(
    data = {}
) {

    const type =
        String(
            data.type ||
            ""
        );


    if (
        type ===
            "restricted.file.open"
    ) {

        handleRestrictedFile(
            data
        );

        return;

    }


    if (
        [
            "file.open",
            "file.read",
            "folder.open"
        ].includes(
            type
        )
    ) {

        handleFile(
            data
        );

        return;

    }


    if (
        [
            "camera.open",
            "camera.visit"
        ].includes(
            type
        )
    ) {

        handleCamera(
            data
        );

        return;

    }


    if (
        [
            "console.command",
            "console.unknown"
        ].includes(
            type
        )
    ) {

        handleConsole(
            data
        );

        return;

    }


    if (
        type ===
        "chat.message"
    ) {

        handleCommunication(
            data
        );

    }

}


/* ==========================================================
   PROCESS PENDING REACTIONS
========================================================== */

function processReactions() {

    const timestamp =
        now();


    for (
        const reaction
        of pendingReactions.values()
    ) {

        if (
            timestamp <
            reaction.completeAt
        ) {

            continue;

        }


        completeReaction(
            reaction
        );

    }

}


/* ==========================================================
   INIT
========================================================== */

export function initPersonnelOperatorMonitor() {

    if (
        initialized
    ) {

        return;

    }


    initialized =
        true;


    on(
        "user.activityRecorded",
        handleOperatorActivity
    );


    timer =
        setInterval(
            processReactions,
            1000
        );


    console.log(
        "[PERSONNEL OPERATOR MONITOR] Initialized."
    );

}


/* ==========================================================
   DEBUG API
========================================================== */

export function getPersonnelOperatorMonitorStatus() {

    return {

        initialized,

        pending:
            [
                ...pendingReactions.values()
            ],

        recentEvents:
            [
                ...recentOperatorEvents
            ],

        cooldowns:
            cooldowns.size

    };

}


if (
    typeof window !==
    "undefined"
) {

    window.PERSONNEL_OPERATOR =
        {

            init:
                initPersonnelOperatorMonitor,

            status:
                getPersonnelOperatorMonitorStatus,

            clear:
                () => {

                    pendingReactions.clear();

                    recentOperatorEvents.length =
                        0;

                    cooldowns.clear();

                    return true;

                }

        };

}
