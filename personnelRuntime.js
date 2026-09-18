/* ==========================================================
   OMEGA PERSONNEL RUNTIME
========================================================== */

import {
    on,
    trigger
} from "./eventManager.js";

import {
    Storage
} from "./storage.js";


const VERSION = 1;
const UPDATE_INTERVAL = 30000;

let initialized = false;
let intervalId = null;


/* ==========================================================
   PERSONNEL DEFINITIONS
========================================================== */

const PERSONNEL = [

    {
        id: "P-001",
        name: "DR. KLINE",
        role: "RESEARCHER",
        department: "RESEARCH",
        clearance: 4,
        mood: "FOCUSED",

        schedule: [
            [0, 8, "OFF DUTY", "OFFSITE", "off duty"],
            [8, 12, "ON DUTY", "RESEARCH SECTOR", "reviewing experimental data"],
            [12, 13, "BREAK", "STAFF CAFETERIA", "staff break"],
            [13, 18, "ON DUTY", "RESEARCH SECTOR", "reviewing Phase 3 documentation"],
            [18, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]
    },

    {
        id: "P-002",
        name: "DR. MILLER",
        role: "RESEARCHER",
        department: "RESEARCH",
        clearance: 3,
        mood: "UNEASY",

        schedule: [
            [0, 8, "OFF DUTY", "OFFSITE", "off duty"],
            [8, 13, "ON DUTY", "MEDICAL SECTOR", "reviewing patient records"],
            [13, 14, "BREAK", "STAFF CAFETERIA", "staff break"],
            [14, 18, "ON DUTY", "RESEARCH SECTOR", "comparing medical and research data"],
            [18, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]
    },

    {
        id: "P-003",
        name: "SECURITY_01",
        role: "SECURITY",
        department: "SECURITY",
        clearance: 2,
        mood: "ALERT",

        schedule: [
            [0, 8, "ON DUTY", "SECURITY CHECKPOINT 3", "monitoring security checkpoints"],
            [8, 16, "ON DUTY", "CAMERA CONTROL", "monitoring security cameras"],
            [16, 24, "ON DUTY", "SECURITY CHECKPOINT 3", "monitoring security checkpoints"]
        ]
    },

    {
        id: "P-004",
        name: "SECURITY_03",
        role: "SECURITY",
        department: "SECURITY",
        clearance: 3,
        mood: "SUSPICIOUS",

        schedule: [
            [0, 8, "OFF DUTY", "OFFSITE", "off duty"],
            [8, 12, "ON DUTY", "SECURITY ARCHIVE", "reviewing access attempts"],
            [12, 16, "ON DUTY", "SECTOR C CHECKPOINT", "investigating sector C activity"],
            [16, 20, "ON DUTY", "SECURITY ARCHIVE", "reviewing camera logs"],
            [20, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]
    },

    {
        id: "P-005",
        name: "MEDICAL_02",
        role: "MEDICAL",
        department: "MEDICAL",
        clearance: 3,
        mood: "TIRED",

        schedule: [
            [0, 8, "OFF DUTY", "OFFSITE", "off duty"],
            [8, 14, "ON DUTY", "MEDICAL SECTOR", "reviewing patient records"],
            [14, 15, "BREAK", "STAFF CAFETERIA", "staff break"],
            [15, 19, "ON DUTY", "MEDICAL SECTOR", "assisting medical staff"],
            [19, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]
    },

    {
        id: "P-006",
        name: "ADMIN",
        role: "ADMINISTRATION",
        department: "ADMINISTRATION",
        clearance: 5,
        mood: "NEUTRAL",

        schedule: [
            [0, 8, "OFF DUTY", "OFFSITE", "off duty"],
            [8, 12, "ON DUTY", "ADMINISTRATION", "reviewing administrative reports"],
            [12, 13, "BREAK", "STAFF CAFETERIA", "staff break"],
            [13, 17, "ON DUTY", "ADMINISTRATION", "processing internal requests"],
            [17, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]
    }

];


/* ==========================================================
   STORAGE
========================================================== */

function preparePersonnel() {

    let data =
        Storage.get(
            "personnel",
            []
        );

    if (
        !Array.isArray(data)
    ) {

        data = [];

    }


    /*
     * Remove old prototype entities.
     */

    data =
        data.filter(
            person =>
                person &&
                person.name !== "MR.SMILE CORE" &&
                person.name !== "UNKNOWN UNIT-01"
        );


    /*
     * Add missing personnel.
     */

    for (
        const definition of PERSONNEL
    ) {

        const existing =
            data.find(
                person =>
                    person.name ===
                    definition.name
            );

        if (existing) {
            continue;
        }

        data.push({

            id:
                definition.id,

            name:
                definition.name,

            role:
                definition.role,

            department:
                definition.department,

            status:
                "OFF DUTY",

            clearance:
                definition.clearance,

            location:
                "OFFSITE",

            activity:
                "off duty",

            mood:
                definition.mood,

            notes:
                "OMEGA internal personnel record.",

            updatedAt:
                Date.now(),

            lastMovement:
                null

        });

    }


    Storage.set(
        "personnel",
        data
    );

    Storage.set(
        "personnelVersion",
        VERSION
    );

    return data;

}


/* ==========================================================
   SCHEDULE
========================================================== */

function getSchedule(
    name,
    hour
) {

    const person =
        PERSONNEL.find(
            entry =>
                entry.name ===
                name
        );

    if (!person) {
        return null;
    }

    return (
        person.schedule.find(
            row =>
                hour >= row[0] &&
                hour < row[1]
        ) ||
        null
    );

}


/* ==========================================================
   UPDATE
========================================================== */

function updatePersonnel() {

    const data =
        preparePersonnel();

    const hour =
        new Date().getHours();

    let changed = false;


    for (
        const person of data
    ) {

        const schedule =
            getSchedule(
                person.name,
                hour
            );

        if (!schedule) {
            continue;
        }


        const next = {

            status:
                schedule[2],

            location:
                schedule[3],

            activity:
                schedule[4]

        };


        const previous = {

            status:
                person.status,

            location:
                person.location,

            activity:
                person.activity

        };


        if (
            previous.status ===
            next.status &&
            previous.location ===
            next.location &&
            previous.activity ===
            next.activity
        ) {

            continue;

        }


        person.status =
            next.status;

        person.location =
            next.location;

        person.activity =
            next.activity;

        person.updatedAt =
            Date.now();


        if (
            previous.location !==
            next.location
        ) {

            person.lastMovement = {

                from:
                    previous.location,

                to:
                    next.location,

                timestamp:
                    person.updatedAt

            };


            trigger(
                "personnel:movement",
                {

                    id:
                        person.id,

                    name:
                        person.name,

                    from:
                        previous.location,

                    to:
                        next.location,

                    status:
                        next.status,

                    activity:
                        next.activity,

                    timestamp:
                        person.updatedAt

                }
            );

        }


        trigger(
            "personnel:activityChanged",
            {

                id:
                    person.id,

                name:
                    person.name,

                previous,

                current:
                    next,

                timestamp:
                    person.updatedAt

            }
        );


        changed = true;

    }


    if (!changed) {
        return false;
    }


    Storage.set(
        "personnel",
        data
    );


    trigger(
        "personnel:updated",
        {

            version:
                VERSION,

            timestamp:
                Date.now()

        }
    );


    /*
     * Tell the personnel UI to refresh.
     */

    if (
        typeof window !==
        "undefined" &&
        typeof window.renderPersonnel ===
        "function"
    ) {

        window.renderPersonnel();

    }


    return true;

}


/* ==========================================================
   STATUS
========================================================== */

export function getPersonnelRuntimeStatus() {

    const data =
        Storage.get(
            "personnel",
            []
        );

    return {

        initialized,

        version:
            VERSION,

        currentHour:
            new Date().getHours(),

        personnel:
            data.map(
                person => ({

                    id:
                        person.id,

                    name:
                        person.name,

                    status:
                        person.status,

                    location:
                        person.location,

                    activity:
                        person.activity,

                    updatedAt:
                        person.updatedAt

                })
            )

    };

}


/* ==========================================================
   INIT
========================================================== */

export function initPersonnelRuntime() {

    if (
        initialized
    ) {

        return getPersonnelRuntimeStatus();

    }


    initialized =
        true;


    preparePersonnel();

    updatePersonnel();


    intervalId =
        setInterval(
            updatePersonnel,
            UPDATE_INTERVAL
        );


    on(
        "system.boot",
        updatePersonnel
    );


    console.log(
        "[PERSONNEL RUNTIME] Initialized."
    );


    return getPersonnelRuntimeStatus();

}


/* ==========================================================
   DEBUG
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.PERSONNEL_RUNTIME = {

        status:
            getPersonnelRuntimeStatus,

        refresh:
            updatePersonnel

    };

}
