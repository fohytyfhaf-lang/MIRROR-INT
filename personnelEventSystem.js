/* ==========================================================
   OMEGA PERSONNEL EVENT SYSTEM
   STAGE 4 — WORK REQUESTS / TASKS

   Central personnel task layer.

   It does NOT perform repairs itself.

   It records:
       problem
       request
       assignment
       progress
       completion
       participants

   Other systems perform the real work.

   Flow:

       OMEGA EVENT
            ↓
       CREATE TASK
            ↓
       ASSIGN PERSON
            ↓
       WORK
            ↓
       COMPLETION EVENT
            ↓
       TASK COMPLETED
========================================================== */

import {
    on,
    trigger
} from "./eventManager.js";

import {
    Storage
} from "./storage.js";


/* ==========================================================
   CONFIG
========================================================== */

const TASKS_KEY =
    "omega_personnel_tasks_v1";

const MAX_TASKS =
    300;

const TASK_TIMEOUT =
    10 * 60 * 1000;


/* ==========================================================
   STATE
========================================================== */

let initialized =
    false;

let timer =
    null;


/* ==========================================================
   HELPERS
========================================================== */

function now() {

    return Date.now();

}


function clean(
    value
) {

    return String(
        value ??
        ""
    ).trim();

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


function getPerson(
    id
) {

    return getPersonnel()
        .find(
            person =>
                person.id === id
        ) ||
        null;

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


function getTasks() {

    const data =
        Storage.get(
            TASKS_KEY,
            []
        );

    return Array.isArray(
        data
    )
        ? data
        : [];

}


function saveTasks(
    tasks
) {

    Storage.set(
        TASKS_KEY,
        tasks.slice(
            -MAX_TASKS
        )
    );

}


function makeTaskId() {

    return (
        "TASK-" +
        now().toString(
            36
        ) +
        "-" +
        Math.random()
            .toString(
                36
            )
            .slice(
                2,
                8
            )
            .toUpperCase()
    );

}


/* ==========================================================
   TASK DUPLICATE CHECK
========================================================== */

function findExistingTask(
    predicate
) {

    return getTasks()
        .find(
            task =>
                predicate(
                    task
                )
        ) ||
        null;

}


/* ==========================================================
   CREATE TASK
========================================================== */

export function createPersonnelTask(
    data = {}
) {

    const tasks =
        getTasks();

    const task = {

        id:
            makeTaskId(),

        type:
            clean(
                data.type
            ) ||
            "GENERAL",

        title:
            clean(
                data.title
            ) ||
            "Internal personnel task",

        state:
            clean(
                data.state
            ) ||
            "PENDING",

        priority:
            clean(
                data.priority
            ) ||
            "NORMAL",

        requesterId:
            data.requesterId ||
            null,

        assigneeId:
            data.assigneeId ||
            null,

        department:
            data.department ||
            null,

        target:
            data.target ||
            null,

        details:
            clean(
                data.details
            ),

        createdAt:
            now(),

        assignedAt:
            data.assigneeId
                ? now()
                : null,

        startedAt:
            null,

        completedAt:
            null,

        updatedAt:
            now(),

        source:
            data.source ||
            "OMEGA",

        notes:
            Array.isArray(
                data.notes
            )
                ? [
                    ...data.notes
                ]
                : []

    };


    tasks.push(
        task
    );

    saveTasks(
        tasks
    );


    if (
        task.assigneeId
    ) {

        updatePersonnelAssignment(
            task.assigneeId,
            task
        );

    }


    trigger(
        "personnel:taskCreated",
        {
            ...task
        }
    );


    console.log(
        "[PERSONNEL TASK CREATED]",
        task
    );


    return {
        ...task
    };

}


/* ==========================================================
   UPDATE TASK
========================================================== */

export function updatePersonnelTask(
    taskId,
    changes = {}
) {

    const tasks =
        getTasks();

    const task =
        tasks.find(
            item =>
                item.id ===
                taskId
        );

    if (
        !task
    ) {

        return null;

    }


    Object.assign(
        task,
        changes
    );


    task.updatedAt =
        now();


    if (
        changes.assigneeId &&
        !task.assignedAt
    ) {

        task.assignedAt =
            now();

    }


    if (
        changes.state ===
            "IN_PROGRESS" &&
        !task.startedAt
    ) {

        task.startedAt =
            now();

    }


    if (
        changes.state ===
            "COMPLETED"
    ) {

        task.completedAt =
            now();

    }


    saveTasks(
        tasks
    );


    if (
        task.assigneeId
    ) {

        updatePersonnelAssignment(
            task.assigneeId,
            task
        );

    }


    trigger(
        "personnel:taskUpdated",
        {
            ...task
        }
    );


    return {
        ...task
    };

}


/* ==========================================================
   ASSIGN TASK
========================================================== */

export function assignPersonnelTask(
    taskId,
    personnelId
) {

    const person =
        getPerson(
            personnelId
        );

    if (
        !person ||
        !isOnDuty(
            person
        )
    ) {

        return false;

    }


    return Boolean(
        updatePersonnelTask(
            taskId,
            {

                assigneeId:
                    personnelId,

                state:
                    "ASSIGNED",

                assignedAt:
                    now()

            }
        )
    );

}


/* ==========================================================
   START TASK
========================================================== */

export function startPersonnelTask(
    taskId,
    personnelId
) {

    const tasks =
        getTasks();

    const task =
        tasks.find(
            item =>
                item.id ===
                taskId
        );

    if (
        !task
    ) {

        return false;

    }


    if (
        task.assigneeId !==
        personnelId
    ) {

        return false;

    }


    const person =
        getPerson(
            personnelId
        );

    if (
        !isOnDuty(
            person
        )
    ) {

        return false;

    }


    updatePersonnelTask(
        taskId,
        {

            state:
                "IN_PROGRESS",

            startedAt:
                now()

        }
    );


    return true;

}


/* ==========================================================
   COMPLETE TASK
========================================================== */

export function completePersonnelTask(
    taskId,
    details = ""
) {

    const tasks =
        getTasks();

    const task =
        tasks.find(
            item =>
                item.id ===
                taskId
        );

    if (
        !task
    ) {

        return false;

    }


    task.state =
        "COMPLETED";

    task.completedAt =
        now();

    task.updatedAt =
        now();


    if (
        details
    ) {

        task.details =
            clean(
                details
            );

    }


    saveTasks(
        tasks
    );


    if (
        task.assigneeId
    ) {

        updatePersonnelAssignment(
            task.assigneeId,
            null
        );

    }


    trigger(
        "personnel:taskCompleted",
        {
            ...task
        }
    );


    return true;

}


/* ==========================================================
   TASK NOTES
========================================================== */

export function addPersonnelTaskNote(
    taskId,
    personnelId,
    text
) {

    const tasks =
        getTasks();

    const task =
        tasks.find(
            item =>
                item.id ===
                taskId
        );

    if (
        !task
    ) {

        return false;

    }


    const person =
        getPerson(
            personnelId
        );

    if (
        !person
    ) {

        return false;

    }


    const note = {

        personnelId,

        personnel:
            person.name,

        text:
            clean(
                text
            ),

        timestamp:
            now()

    };


    if (
        !note.text
    ) {

        return false;

    }


    task.notes =
        Array.isArray(
            task.notes
        )
            ? task.notes
            : [];


    task.notes.push(
        note
    );


    if (
        task.notes.length >
        30
    ) {

        task.notes =
            task.notes.slice(
                -30
            );

    }


    task.updatedAt =
        now();


    saveTasks(
        tasks
    );


    trigger(
        "personnel:taskNote",
        {

            taskId,
            note

        }
    );


    return true;

}


/* ==========================================================
   PERSONNEL ASSIGNMENT
   ----------------------------------------------------------
   This is stored separately from activity.

   Existing personnel runtime can continue
   controlling schedule/location.
========================================================== */

function updatePersonnelAssignment(
    personnelId,
    task
) {

    const data =
        getPersonnel();

    const person =
        data.find(
            item =>
                item.id ===
                personnelId
        );

    if (
        !person
    ) {

        return;

    }


    if (
        task
    ) {

        person.currentTask = {

            taskId:
                task.id,

            type:
                task.type,

            title:
                task.title,

            state:
                task.state,

            target:
                task.target,

            updatedAt:
                now()

        };

    } else {

        person.currentTask =
            null;

    }


    person.updatedAt =
        now();


    Storage.set(
        "personnel",
        data
    );


    trigger(
        "personnel:assignmentChanged",
        {

            personnelId,

            task:
                task
                    ? {
                        id:
                            task.id,

                        type:
                            task.type,

                        title:
                            task.title,

                        state:
                            task.state,

                        target:
                            task.target

                    }
                    : null,

            timestamp:
                now()

        }
    );

}


/* ==========================================================
   CAMERA EVENTS
========================================================== */

function handleCameraAssigned(
    data = {}
) {

    const existing =
        findExistingTask(
            task =>
                task.type ===
                    "CAMERA_REPAIR" &&
                task.target ===
                    data.cameraId &&
                (
                    task.state ===
                        "ASSIGNED" ||
                    task.state ===
                        "IN_PROGRESS"
                )
        );


    if (
        existing
    ) {

        return;

    }


    createPersonnelTask({

        type:
            "CAMERA_REPAIR",

        title:
            "Repair camera " +
            (
                data.cameraId ||
                "UNKNOWN"
            ),

        state:
            "ASSIGNED",

        priority:
            "NORMAL",

        assigneeId:
            data.repairerId ||
            null,

        department:
            "SECURITY",

        target:
            data.cameraId ||
            null,

        details:
            "Security camera requires repair.",

        source:
            "camera"

    });

}


function handleCameraRepaired(
    data = {}
) {

    const task =
        findExistingTask(
            item =>
                item.type ===
                    "CAMERA_REPAIR" &&
                item.target ===
                    data.cameraId &&
                item.state !==
                    "COMPLETED"
        );


    if (
        !task
    ) {

        return;

    }


    completePersonnelTask(
        task.id,
        "Camera restored to operational state."
    );

}


/* ==========================================================
   FILE EVENTS
========================================================== */

function handleFileRequest(
    data = {}
) {

    const existing =
        findExistingTask(
            task =>
                task.type ===
                    "FILE_TRANSFER" &&
                task.target ===
                    data.documentId &&
                task.requesterId ===
                    data.requesterId &&
                task.state !==
                    "COMPLETED"
        );


    if (
        existing
    ) {

        return;

    }


    const task =
        createPersonnelTask({

            type:
                "FILE_TRANSFER",

            title:
                "Replace damaged document",

            state:
                data.providerId
                    ? "ASSIGNED"
                    : "WAITING",

            priority:
                "NORMAL",

            requesterId:
                data.requesterId ||
                null,

            assigneeId:
                data.providerId ||
                null,

            department:
                "FILES",

            target:
                data.documentId ||
                data.document ||
                null,

            details:
                "Requester requires a clean copy of " +
                (
                    data.document ||
                    "the damaged document"
                ) +
                ".",

            source:
                "personnel"

        });


    if (
        task.assigneeId
    ) {

        trigger(
            "personnel:taskAssigned",
            {
                ...task
            }
        );

    }

}


function handleFileTransferred(
    data = {}
) {

    const task =
        findExistingTask(
            item =>
                item.type ===
                    "FILE_TRANSFER" &&
                (
                    item.target ===
                        data.documentId ||
                    item.target ===
                        data.document
                ) &&
                item.state !==
                    "COMPLETED"
        );


    if (
        !task
    ) {

        return;

    }


    updatePersonnelTask(
        task.id,
        {

            state:
                "IN_PROGRESS",

            assigneeId:
                data.providerId ||
                task.assigneeId,

            details:
                "Clean copy transferred to requester."

        }
    );

}


function handleFileRepaired(
    data = {}
) {

    const task =
        findExistingTask(
            item =>
                item.type ===
                    "FILE_TRANSFER" &&
                (
                    item.target ===
                        data.documentId ||
                    item.target ===
                        data.document
                ) &&
                item.state !==
                    "COMPLETED"
        );


    if (
        !task
    ) {

        return;

    }


    completePersonnelTask(
        task.id,
        "Damaged document replaced with clean copy."
    );

}


/* ==========================================================
   WAITING TASKS
========================================================== */

function tryAssignWaitingTasks() {

    const tasks =
        getTasks();

    let changed =
        false;


    for (
        const task
        of tasks
    ) {

        if (
            task.state !==
                "WAITING"
        ) {

            continue;

        }


        if (
            !task.department
        ) {

            continue;

        }


        const candidates =
            getPersonnel()
                .filter(
                    person =>
                        isOnDuty(
                            person
                        ) &&
                        person.department ===
                            task.department
                );


        const candidate =
            candidates[0];


        if (
            !candidate
        ) {

            continue;

        }


        task.assigneeId =
            candidate.id;

        task.state =
            "ASSIGNED";

        task.assignedAt =
            now();

        task.updatedAt =
            now();

        changed =
            true;


        updatePersonnelAssignment(
            candidate.id,
            task
        );


        trigger(
            "personnel:taskAssigned",
            {
                ...task
            }
        );

    }


    if (
        changed
    ) {

        saveTasks(
            tasks
        );

    }

}


/* ==========================================================
   STALE TASKS
========================================================== */

function processStaleTasks() {

    const tasks =
        getTasks();

    const timestamp =
        now();

    let changed =
        false;


    for (
        const task
        of tasks
    ) {

        if (
            task.state ===
                "COMPLETED" ||
            task.state ===
                "CANCELLED"
        ) {

            continue;

        }


        if (
            timestamp -
                task.createdAt <
            TASK_TIMEOUT
        ) {

            continue;

        }


        if (
            task.state ===
                "WAITING"
        ) {

            if (
                task.priority !==
                    "HIGH"
            ) {

                task.priority =
                    "HIGH";

            }

            trigger(
                "personnel:taskEscalated",
                {
                    ...task,

                    reason:
                        "task_waiting_too_long",

                    timestamp
                }
            );

            changed =
                true;

            continue;

        }


        if (
            task.state ===
                "ASSIGNED"
        ) {

            trigger(
                "personnel:taskEscalated",
                {
                    ...task,

                    reason:
                        "assigned_task_taking_too_long",

                    timestamp
                }
            );

        }

    }


    if (
        changed
    ) {

        saveTasks(
            tasks
        );

    }

}


/* ==========================================================
   EVENTS
========================================================== */

function bindEvents() {

    on(
        "personnel:cameraRepairAssigned",
        handleCameraAssigned
    );


    on(
        "personnel:cameraRepaired",
        handleCameraRepaired
    );


    on(
        "personnel:fileRequest",
        handleFileRequest
    );


    on(
        "personnel:fileTransferred",
        handleFileTransferred
    );


    on(
        "personnel:fileRepaired",
        handleFileRepaired
    );


    on(
        "personnel:updated",
        tryAssignWaitingTasks
    );

}


/* ==========================================================
   TICK
========================================================== */

function tick() {

    tryAssignWaitingTasks();

    processStaleTasks();

}


/* ==========================================================
   PUBLIC API
========================================================== */

export function getPersonnelTasks() {

    return getTasks()
        .map(
            task => ({
                ...task,

                notes:
                    Array.isArray(
                        task.notes
                    )
                        ? [
                            ...task.notes
                        ]
                        : []

            })
        );

}


export function getPendingPersonnelTasks() {

    return getTasks()
        .filter(
            task =>
                task.state !==
                    "COMPLETED" &&
                task.state !==
                    "CANCELLED"
        )
        .map(
            task => ({
                ...task
            })
        );

}


export function resetPersonnelTasks() {

    Storage.remove(
        TASKS_KEY
    );

}


export function initPersonnelEventSystem() {

    if (
        initialized
    ) {

        return;

    }


    initialized =
        true;


    bindEvents();


    timer =
        setInterval(
            tick,
            5000
        );


    console.log(
        "[PERSONNEL EVENT SYSTEM] Initialized.",
        {
            tasks:
                getTasks().length
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

    window.PERSONNEL_EVENTS = {

        tasks:
            getPersonnelTasks,

        pending:
            getPendingPersonnelTasks,

        create:
            createPersonnelTask,

        assign:
            assignPersonnelTask,

        start:
            startPersonnelTask,

        complete:
            completePersonnelTask,

        note:
            addPersonnelTaskNote,

        reset:
            resetPersonnelTasks

    };

}
