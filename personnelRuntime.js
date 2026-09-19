
/* ==========================================================
   OMEGA PERSONNEL RUNTIME
   STAGE 1 — REAL PERSONNEL DATABASE
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

const VERSION =
    2;

const UPDATE_INTERVAL =
    30000;


/* ==========================================================
   STATE
========================================================== */

let initialized =
    false;

let intervalId =
    null;


/* ==========================================================
   PERSONNEL DEFINITIONS
   ----------------------------------------------------------
   Stage 1 contains stable personnel identity.

   Dynamic state:
       status
       location
       activity
       updatedAt
       lastMovement

   Static identity:
       id
       name
       role
       department
       clearance
       mood
       duties
       systemAccess
       capabilities
       schedule

   Later stages will use these fields for:
       - autonomous work
       - archive access
       - camera checks
       - console actions
       - messages
       - incidents
========================================================== */

const PERSONNEL = [

    {
        id:
            "P-001",

        name:
            "DR. KLINE",

        role:
            "RESEARCHER",

        department:
            "RESEARCH",

        clearance:
            4,

        mood:
            "FOCUSED",

        duties: [
            "experimental data review",
            "research documentation",
            "phase documentation checks"
        ],

        systemAccess: [
            "research",
            "files",
            "archive",
            "communications"
        ],

        capabilities: [
            "read_research_files",
            "review_experiments",
            "submit_research_notes",
            "read_internal_messages"
        ],

        schedule: [
            [0, 8, "OFF DUTY", "OFFSITE", "off duty"],
            [8, 12, "ON DUTY", "RESEARCH SECTOR", "reviewing experimental data"],
            [12, 13, "BREAK", "STAFF CAFETERIA", "staff break"],
            [13, 18, "ON DUTY", "RESEARCH SECTOR", "reviewing Phase 3 documentation"],
            [18, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]

    },


    {
        id:
            "P-002",

        name:
            "DR. MILLER",

        role:
            "CLINICAL RESEARCHER",

        department:
            "RESEARCH",

        clearance:
            3,

        mood:
            "UNEASY",

        duties: [
            "medical record review",
            "research comparison",
            "clinical data analysis"
        ],

        systemAccess: [
            "research",
            "medical",
            "files",
            "archive"
        ],

        capabilities: [
            "read_medical_records",
            "read_research_files",
            "compare_records",
            "submit_research_notes"
        ],

        schedule: [
            [0, 8, "OFF DUTY", "OFFSITE", "off duty"],
            [8, 13, "ON DUTY", "MEDICAL SECTOR", "reviewing patient records"],
            [13, 14, "BREAK", "STAFF CAFETERIA", "staff break"],
            [14, 18, "ON DUTY", "RESEARCH SECTOR", "comparing medical and research data"],
            [18, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]

    },


    {
        id:
            "P-003",

        name:
            "SECURITY_01",

        role:
            "SECURITY OFFICER",

        department:
            "SECURITY",

        clearance:
            2,

        mood:
            "ALERT",

        duties: [
            "checkpoint monitoring",
            "camera monitoring",
            "facility security checks"
        ],

        systemAccess: [
            "camera",
            "security",
            "communications"
        ],

        capabilities: [
            "check_cameras",
            "review_security_logs",
            "report_incident",
            "send_security_message"
            "repair_camera"
        ],

        schedule: [
            [0, 8, "ON DUTY", "SECURITY CHECKPOINT 3", "monitoring security checkpoints"],
            [8, 16, "ON DUTY", "CAMERA CONTROL", "monitoring security cameras"],
            [16, 24, "ON DUTY", "SECURITY CHECKPOINT 3", "monitoring security checkpoints"]
        ]

    },


    {
        id:
            "P-004",

        name:
            "SECURITY_03",

        role:
            "SECURITY ANALYST",

        department:
            "SECURITY",

        clearance:
            3,

        mood:
            "SUSPICIOUS",

        duties: [
            "access attempt review",
            "camera log review",
            "sector security investigation"
        ],

        systemAccess: [
            "camera",
            "security",
            "archive",
            "files",
            "communications"
        ],

        capabilities: [
            "check_cameras",
            "review_security_logs",
            "review_archive",
            "report_incident",
            "send_security_message"
            "repair_camera"
        ],

        schedule: [
            [0, 8, "OFF DUTY", "OFFSITE", "off duty"],
            [8, 12, "ON DUTY", "SECURITY ARCHIVE", "reviewing access attempts"],
            [12, 16, "ON DUTY", "SECTOR C CHECKPOINT", "investigating sector C activity"],
            [16, 20, "ON DUTY", "SECURITY ARCHIVE", "reviewing camera logs"],
            [20, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]

    },


    {
        id:
            "P-005",

        name:
            "MEDICAL_02",

        role:
            "MEDICAL TECHNICIAN",

        department:
            "MEDICAL",

        clearance:
            3,

        mood:
            "TIRED",

        duties: [
            "patient record review",
            "medical inventory checks",
            "clinical assistance"
        ],

        systemAccess: [
            "medical",
            "files",
            "archive",
            "communications"
        ],

        capabilities: [
            "read_medical_records",
            "update_medical_notes",
            "check_inventory",
            "send_medical_message"
        ],

        schedule: [
            [0, 8, "OFF DUTY", "OFFSITE", "off duty"],
            [8, 14, "ON DUTY", "MEDICAL SECTOR", "reviewing patient records"],
            [14, 15, "BREAK", "STAFF CAFETERIA", "staff break"],
            [15, 19, "ON DUTY", "MEDICAL SECTOR", "assisting medical staff"],
            [19, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]

    },


    {
        id:
            "P-006",

        name:
            "ADMIN",

        role:
            "ADMINISTRATOR",

        department:
            "ADMINISTRATION",

        clearance:
            5,

        mood:
            "NEUTRAL",

        duties: [
            "administrative review",
            "internal requests",
            "personnel documentation"
        ],

        systemAccess: [
            "administration",
            "files",
            "archive",
            "personnel",
            "communications"
        ],

        capabilities: [
            "review_requests",
            "update_internal_records",
            "review_personnel",
            "send_internal_message"
        ],

        schedule: [
            [0, 8, "OFF DUTY", "OFFSITE", "off duty"],
            [8, 12, "ON DUTY", "ADMINISTRATION", "reviewing administrative reports"],
            [12, 13, "BREAK", "STAFF CAFETERIA", "staff break"],
            [13, 17, "ON DUTY", "ADMINISTRATION", "processing internal requests"],
            [17, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]

    },


    {
        id:
            "P-007",

        name:
            "S. BRENNER",

        role:
            "ARCHIVIST",

        department:
            "ARCHIVE",

        clearance:
            4,

        mood:
            "METHODICAL",

        duties: [
            "archive indexing",
            "document verification",
            "records maintenance"
        ],

        systemAccess: [
            "files",
            "archive",
            "communications"
        ],

        capabilities: [
            "read_archive",
            "update_archive_index",
            "verify_documents",
            "send_archive_message"
        ],

        schedule: [
            [0, 7, "OFF DUTY", "OFFSITE", "off duty"],
            [7, 11, "ON DUTY", "ARCHIVE SECTOR", "checking archive indexes"],
            [11, 12, "BREAK", "STAFF CAFETERIA", "staff break"],
            [12, 16, "ON DUTY", "ARCHIVE SECTOR", "verifying archived documents"],
            [16, 17, "ON DUTY", "DOCUMENT CONTROL", "processing records"],
            [17, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]

    },


    {
        id:
            "P-008",

        name:
            "D. PRICE",

        role:
            "SYSTEMS ENGINEER",

        department:
            "SYSTEMS",

        clearance:
            4,

        mood:
            "CALM",

        duties: [
            "system checks",
            "terminal maintenance",
            "network diagnostics"
        ],

        systemAccess: [
            "console",
            "systems",
            "camera",
            "files",
            "communications"
        ],

        capabilities: [
            "run_system_diagnostics",
            "check_network",
            "review_system_logs",
            "send_system_message"
        ],

        schedule: [
            [0, 9, "OFF DUTY", "OFFSITE", "off duty"],
            [9, 12, "ON DUTY", "SYSTEMS CONTROL", "checking system services"],
            [12, 13, "BREAK", "STAFF CAFETERIA", "staff break"],
            [13, 17, "ON DUTY", "SERVER ROOM", "performing network diagnostics"],
            [17, 18, "ON DUTY", "SYSTEMS CONTROL", "reviewing system logs"],
            [18, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]

    },


    {
        id:
            "P-009",

        name:
            "N. COLE",

        role:
            "COMMUNICATIONS OFFICER",

        department:
            "COMMUNICATIONS",

        clearance:
            3,

        mood:
            "ATTENTIVE",

        duties: [
            "internal communications",
            "message routing",
            "communications monitoring"
        ],

        systemAccess: [
            "communications",
            "files",
            "personnel"
        ],

        capabilities: [
            "read_internal_messages",
            "send_internal_message",
            "route_messages",
            "review_communication_logs"
        ],

        schedule: [
            [0, 8, "OFF DUTY", "OFFSITE", "off duty"],
            [8, 12, "ON DUTY", "COMMUNICATIONS", "monitoring internal messages"],
            [12, 13, "BREAK", "STAFF CAFETERIA", "staff break"],
            [13, 17, "ON DUTY", "COMMUNICATIONS", "routing internal communications"],
            [17, 18, "ON DUTY", "COMMUNICATIONS", "reviewing message logs"],
            [18, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]

    },


    {
        id:
            "P-010",

        name:
            "E. WARD",

        role:
            "FACILITY TECHNICIAN",

        department:
            "MAINTENANCE",

        clearance:
            2,

        mood:
            "QUIET",

        duties: [
            "facility inspection",
            "equipment checks",
            "maintenance reports"
        ],

        systemAccess: [
            "files",
            "systems",
            "communications"
        ],

        capabilities: [
            "check_facility",
            "submit_maintenance_report",
            "read_internal_messages"
        ],

        schedule: [
            [0, 6, "OFF DUTY", "OFFSITE", "off duty"],
            [6, 10, "ON DUTY", "MAINTENANCE", "facility inspection"],
            [10, 11, "BREAK", "STAFF CAFETERIA", "staff break"],
            [11, 15, "ON DUTY", "UTILITY SECTOR", "equipment inspection"],
            [15, 16, "ON DUTY", "MAINTENANCE", "writing maintenance reports"],
            [16, 24, "OFF DUTY", "OFFSITE", "off duty"]
        ]

    }

];


/* ==========================================================
   DEFAULT DYNAMIC STATE
========================================================== */

function createInitialState(
    definition
) {

    return {

        id:
            definition.id,

        name:
            definition.name,

        role:
            definition.role,

        department:
            definition.department,

        clearance:
            definition.clearance,

        mood:
            definition.mood,

        duties:
            [
                ...definition.duties
            ],

        systemAccess:
            [
                ...definition.systemAccess
            ],

        capabilities:
            [
                ...definition.capabilities
            ],

        status:
            "OFF DUTY",

        location:
            "OFFSITE",

        activity:
            "off duty",

        updatedAt:
            Date.now(),

        lastMovement:
            null

    };

}


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
     * Remove old prototype / obsolete records.
     */

    const validIds =
        new Set(
            PERSONNEL.map(
                person =>
                    person.id
            )
        );


    const validNames =
        new Set(
            PERSONNEL.map(
                person =>
                    person.name
            )
        );


    data =
        data.filter(
            person => {

                if (!person) {
                    return false;
                }


                /*
                 * Old prototype records.
                 */

                if (
                    person.name ===
                        "MR.SMILE CORE" ||

                    person.name ===
                        "UNKNOWN UNIT-01"
                ) {

                    return false;

                }


                /*
                 * Preserve custom personnel
                 * records that may have been
                 * created later.
                 */

                if (
                    person.id &&
                    String(
                        person.id
                    ).startsWith(
                        "CUSTOM-"
                    )
                ) {

                    return true;

                }


                /*
                 * Remove old versions of
                 * the built-in staff.
                 */

                if (
                    person.id &&
                    String(
                        person.id
                    ).startsWith(
                        "P-"
                    ) &&
                    !validIds.has(
                        person.id
                    )
                ) {

                    return false;

                }


                if (
                    person.name &&
                    !validNames.has(
                        person.name
                    ) &&
                    person.role
                ) {

                    /*
                     * Keep non-prototype
                     * custom records.
                     */

                    return true;

                }


                return true;

            }
        );


    /*
     * Add or update built-in personnel.
     */

    for (
        const definition
        of PERSONNEL
    ) {

        let existing =
            data.find(
                person =>
                    person.id ===
                    definition.id
            );


        if (!existing) {

            existing =
                data.find(
                    person =>
                        person.name ===
                        definition.name
                );

        }


        if (!existing) {

            data.push(
                createInitialState(
                    definition
                )
            );

            continue;

        }


        /*
         * Update stable identity.
         */

        existing.id =
            definition.id;

        existing.name =
            definition.name;

        existing.role =
            definition.role;

        existing.department =
            definition.department;

        existing.clearance =
            definition.clearance;

        existing.mood =
            definition.mood;

        existing.duties =
            [
                ...definition.duties
            ];

        existing.systemAccess =
            [
                ...definition.systemAccess
            ];

        existing.capabilities =
            [
                ...definition.capabilities
            ];


        /*
         * Keep dynamic state.
         */

        if (!existing.status) {

            existing.status =
                "OFF DUTY";

        }


        if (!existing.location) {

            existing.location =
                "OFFSITE";

        }


        if (!existing.activity) {

            existing.activity =
                "off duty";

        }


        if (
            typeof existing.updatedAt !==
            "number"
        ) {

            existing.updatedAt =
                Date.now();

        }


        if (
            !Object.prototype.hasOwnProperty.call(
                existing,
                "lastMovement"
            )
        ) {

            existing.lastMovement =
                null;

        }

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


    let changed =
        false;


    for (
        const person
        of data
    ) {

        /*
         * Custom personnel will be
         * handled by later systems.
         */

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


        /*
         * Movement event.
         */

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

                    department:
                        person.department,

                    role:
                        person.role,

                    timestamp:
                        person.updatedAt

                }
            );

        }


        /*
         * General activity change.
         */

        trigger(
            "personnel:activityChanged",
            {

                id:
                    person.id,

                name:
                    person.name,

                department:
                    person.department,

                role:
                    person.role,

                previous,

                current:
                    next,

                timestamp:
                    person.updatedAt

            }
        );


        changed =
            true;

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
     * Refresh personnel UI.
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

        personnel:
            Array.isArray(
                data
            )
                ? data.map(
                    person => ({

                        id:
                            person.id,

                        name:
                            person.name,

                        role:
                            person.role,

                        department:
                            person.department,

                        clearance:
                            person.clearance,

                        mood:
                            person.mood,

                        status:
                            person.status,

                        location:
                            person.location,

                        activity:
                            person.activity

                    })
                )
                : []

    };

}


/* ==========================================================
   INIT
========================================================== */

export function initPersonnelRuntime() {

    if (initialized) {

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
        "user.login",
        () => {

            updatePersonnel();

        }
    );


    on(
        "user.logout",
        () => {

            /*
             * Personnel keep existing in the
             * background. Logout does not stop
             * facility operations.
             */

            updatePersonnel();

        }
    );


    console.log(
        "[PERSONNEL RUNTIME] Initialized.",
        {
            version:
                VERSION,

            personnel:
                PERSONNEL.length
        }
    );


    return getPersonnelRuntimeStatus();

}


/* ==========================================================
   PUBLIC API
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.PERSONNEL_RUNTIME = {

        status:
            getPersonnelRuntimeStatus,

        update:
            updatePersonnel,

        definitions:
            () =>
                PERSONNEL.map(
                    person => ({
                        ...person,
                        schedule:
                            [
                                ...person.schedule
                            ]
                    })
                )

    };

}

