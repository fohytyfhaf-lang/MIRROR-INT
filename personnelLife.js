/* ==========================================================
   OMEGA PERSONNEL LIFE
   MIRROR-INT / OMEGA

   Autonomous employee behavior layer.

   This module handles:
   - work actions
   - internal conversations
   - workplace events
   - requests
   - minor mistakes
   - reactions to OMEGA events

   personnelRuntime.js remains responsible for:
   - schedule
   - status
   - location
========================================================== */


/* ==========================================================
   IMPORTS
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

const CONFIG = {

    tickInterval:
        12000,

    actionChance:
        0.55,

    conversationChance:
        0.20,

    incidentChance:
        0.08,

    minimumConversationGap:
        45000,

    minimumIncidentGap:
        30000,

    maxLogEntries:
        100

};


/* ==========================================================
   STATE
========================================================== */

let initialized =
    false;

let tickTimer =
    null;

let lastConversation =
    0;

let lastIncident =
    0;

let recentActions =
    [];


/* ==========================================================
   EMPLOYEE ACTIONS
========================================================== */

const ACTIONS = {

    "DR. KLINE": [

        {
            type:
                "document_review",

            activity:
                "reviewing experimental documentation"
        },

        {
            type:
                "experiment_analysis",

            activity:
                "comparing experimental results"
        },

        {
            type:
                "terminal_use",

            activity:
                "working at a research terminal"
        },

        {
            type:
                "archive_review",

            activity:
                "reviewing archived research records"
        },

        {
            type:
                "report_writing",

            activity:
                "writing a research report"
        },

        {
            type:
                "data_check",

            activity:
                "checking experimental data"
        }

    ],


    "DR. MILLER": [

        {
            type:
                "patient_review",

            activity:
                "reviewing patient records"
        },

        {
            type:
                "medical_report",

            activity:
                "updating medical documentation"
        },

        {
            type:
                "data_comparison",

            activity:
                "comparing medical and research records"
        },

        {
            type:
                "patient_transfer",

            activity:
                "checking transfer documentation"
        },

        {
            type:
                "terminal_use",

            activity:
                "working at a medical terminal"
        }

    ],


    "SECURITY_01": [

        {
            type:
                "checkpoint_check",

            activity:
                "checking security checkpoint"
        },

        {
            type:
                "camera_monitor",

            activity:
                "monitoring security cameras"
        },

        {
            type:
                "access_log",

            activity:
                "reviewing access logs"
        },

        {
            type:
                "patrol",

            activity:
                "performing routine security patrol"
        },

        {
            type:
                "perimeter_check",

            activity:
                "checking perimeter status"
        }

    ],


    "SECURITY_03": [

        {
            type:
                "access_review",

            activity:
                "reviewing unauthorized access attempts"
        },

        {
            type:
                "camera_review",

            activity:
                "reviewing camera logs"
        },

        {
            type:
                "sector_investigation",

            activity:
                "investigating Sector C activity"
        },

        {
            type:
                "archive_security",

            activity:
                "checking restricted archive access"
        },

        {
            type:
                "incident_review",

            activity:
                "reviewing recent security incidents"
        }

    ],


    "MEDICAL_02": [

        {
            type:
                "patient_review",

            activity:
                "reviewing patient records"
        },

        {
            type:
                "medical_check",

            activity:
                "checking medical reports"
        },

        {
            type:
                "treatment_review",

            activity:
                "reviewing treatment schedules"
        },

        {
            type:
                "transfer_review",

            activity:
                "checking patient transfer records"
        }

    ],


    "ADMIN": [

        {
            type:
                "report_review",

            activity:
                "reviewing administrative reports"
        },

        {
            type:
                "personnel_review",

            activity:
                "reviewing personnel records"
        },

        {
            type:
                "request_processing",

            activity:
                "processing internal requests"
        },

        {
            type:
                "approval_review",

            activity:
                "reviewing approval requests"
        },

        {
            type:
                "department_report",

            activity:
                "checking departmental reports"
        }

    ]

};


/* ==========================================================
   INTERNAL CONVERSATIONS
========================================================== */

const CONVERSATIONS = [

    {
        chat:
            "research",

        participants: [
            "DR. KLINE",
            "DR. MILLER"
        ],

        messages: [

            [
                "DR. KLINE",
                "Did you finish the Phase 3 report?"
            ],

            [
                "DR. MILLER",
                "Almost. I'm checking the medical section."
            ],

            [
                "DR. KLINE",
                "Send it when you're done."
            ]

        ]

    },


    {
        chat:
            "research",

        participants: [
            "DR. MILLER",
            "DR. KLINE"
        ],

        messages: [

            [
                "DR. MILLER",
                "Kline, the patient records don't match the research notes."
            ],

            [
                "DR. KLINE",
                "Which record?"
            ],

            [
                "DR. MILLER",
                "The latest transfer."
            ]

        ]

    },


    {
        chat:
            "security",

        participants: [
            "SECURITY_01",
            "SECURITY_03"
        ],

        messages: [

            [
                "SECURITY_01",
                "Checkpoint 3 is clear."
            ],

            [
                "SECURITY_03",
                "Keep watching Sector C."
            ],

            [
                "SECURITY_01",
                "Already doing it."
            ]

        ]

    },


    {
        chat:
            "security",

        participants: [
            "SECURITY_03",
            "SECURITY_01"
        ],

        messages: [

            [
                "SECURITY_03",
                "I found another access attempt."
            ],

            [
                "SECURITY_01",
                "Same source?"
            ],

            [
                "SECURITY_03",
                "Unknown. Still checking."
            ]

        ]

    },


    {
        chat:
            "medical",

        participants: [
            "MEDICAL_02"
        ],

        messages: [

            [
                "MEDICAL_02",
                "Transfer paperwork is still incomplete."
            ],

            [
                "MEDICAL_02",
                "I'll finish it before the next review."
            ]

        ]

    },


    {
        chat:
            "admin",

        participants: [
            "ADMIN"
        ],

        messages: [

            [
                "ADMIN",
                "Several personnel reports are still awaiting approval."
            ]

        ]

    }

];


/* ==========================================================
   WORKPLACE EVENTS
========================================================== */

const INCIDENTS = [

    {
        id:
            "STAFF-001",

        type:
            "terminal_problem",

        message:
            "Employee workstation temporarily lost connection to OMEGA.",

        people: [
            "DR. KLINE",
            "DR. MILLER",
            "ADMIN"
        ]

    },


    {
        id:
            "STAFF-002",

        type:
            "document_problem",

        message:
            "Employee reported inconsistent documentation.",

        people: [
            "DR. KLINE",
            "DR. MILLER",
            "ADMIN"
        ]

    },


    {
        id:
            "STAFF-003",

        type:
            "security_problem",

        message:
            "Security personnel reported an unidentified access attempt.",

        people: [
            "SECURITY_01",
            "SECURITY_03"
        ]

    },


    {
        id:
            "STAFF-004",

        type:
            "delay",

        message:
            "Employee reported a delay in completing the assigned task.",

        people: [
            "DR. KLINE",
            "DR. MILLER",
            "MEDICAL_02",
            "ADMIN"
        ]

    }

];


/* ==========================================================
   HELPERS
========================================================== */

function random(
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


function now() {

    return Date.now();

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


function findPerson(
    name
) {

    return getPersonnel().find(
        person =>
            person.name ===
            name
    ) || null;

}


/* ==========================================================
   LOG
========================================================== */

function recordAction(
    data
) {

    const entry = {

        ...data,

        autonomous:
            true,

        timestamp:
            now()

    };


    recentActions.push(
        entry
    );


    if (
        recentActions.length >
        CONFIG.maxLogEntries
    ) {

        recentActions =
            recentActions.slice(
                -CONFIG.maxLogEntries
            );

    }


    trigger(
        "personnel:action",
        entry
    );


    trigger(
        "omega:personnelAction",
        entry
    );


    Storage.set(
        "personnelLifeLog",
        recentActions
    );

}


/* ==========================================================
   CHANGE EMPLOYEE ACTIVITY
========================================================== */

function performWorkAction() {

    const personnel =
        getPersonnel();


    const workers =
        personnel.filter(
            person =>
                person.status ===
                "ON DUTY"
        );


    if (
        workers.length === 0
    ) {

        return false;

    }


    if (
        Math.random() >
        CONFIG.actionChance
    ) {

        return false;

    }


    const person =
        random(
            workers
        );


    if (!person) {

        return false;

    }


    const actions =
        ACTIONS[
            person.name
        ];


    if (
        !actions ||
        actions.length === 0
    ) {

        return false;

    }


    const action =
        random(
            actions
        );


    if (!action) {

        return false;

    }


    const previousActivity =
        person.activity;


    person.activity =
        action.activity;


    person.lastAction = {

        type:
            action.type,

        activity:
            action.activity,

        timestamp:
            now()

    };


    person.updatedAt =
        now();


    Storage.set(
        "personnel",
        personnel
    );


    recordAction({

        type:
            action.type,

        person:
            person.name,

        location:
            person.location,

        previousActivity,

        activity:
            action.activity

    });


    refreshUI();


    return true;

}


/* ==========================================================
   CONVERSATION
========================================================== */

function canStartConversation() {

    return (
        now() -
        lastConversation >=
        CONFIG.minimumConversationGap
    );

}


function startConversation() {

    if (
        !canStartConversation()
    ) {

        return false;

    }


    if (
        Math.random() >
        CONFIG.conversationChance
    ) {

        return false;

    }


    const conversation =
        random(
            CONVERSATIONS
        );


    if (!conversation) {

        return false;

    }


    const participants =
        conversation.participants.filter(
            name => {

                const person =
                    findPerson(name);

                return (
                    person &&
                    (
                        person.status ===
                        "ON DUTY" ||
                        person.status ===
                        "BREAK"
                    )
                );

            }
        );


    if (
        participants.length === 0
    ) {

        return false;

    }


    lastConversation =
        now();


    conversation.messages.forEach(
        (
            message,
            index
        ) => {

            setTimeout(
                () => {

                    if (
                        typeof window !==
                        "undefined" &&
                        typeof window.addChatMessage ===
                        "function"
                    ) {

                        window.addChatMessage(
                            conversation.chat,
                            {

                                user:
                                    message[0],

                                time:
                                    new Date()
                                        .toLocaleTimeString(
                                            [],
                                            {
                                                hour:
                                                    "2-digit",

                                                minute:
                                                    "2-digit"
                                            }
                                        ),

                                text:
                                    message[1]

                            }
                        );

                    }


                    recordAction({

                        type:
                            "conversation_message",

                        person:
                            message[0],

                        chat:
                            conversation.chat,

                        text:
                            message[1]

                    });

                },

                index *
                1800
            );

        }
    );


    trigger(
        "personnel:conversationStarted",
        {

            chat:
                conversation.chat,

            participants,
            
            timestamp:
                now(),

            autonomous:
                true

        }
    );


    return true;

}


/* ==========================================================
   INCIDENT
========================================================== */

function generateIncident() {

    if (
        now() -
        lastIncident <
        CONFIG.minimumIncidentGap
    ) {

        return false;

    }


    if (
        Math.random() >
        CONFIG.incidentChance
    ) {

        return false;

    }


    const incident =
        random(
            INCIDENTS
        );


    if (!incident) {

        return false;

    }


    const person =
        random(
            incident.people
        );


    lastIncident =
        now();


    recordAction({

        type:
            "incident",

        incidentId:
            incident.id,

        incidentType:
            incident.type,

        person,

        message:
            incident.message

    });


    trigger(
        "personnel:incident",
        {

            id:
                incident.id,

            type:
                incident.type,

            person,

            message:
                incident.message,

            timestamp:
                now(),

            autonomous:
                true

        }
    );


    /*
     * Send relevant incidents into chats.
     */

    let chat =
        null;


    if (
        incident.type ===
        "security_problem"
    ) {

        chat =
            "security";

    }


    if (
        incident.type ===
        "document_problem"
    ) {

        chat =
            "research";

    }


    if (
        incident.type ===
        "terminal_problem"
    ) {

        chat =
            "admin";

    }


    if (
        incident.type ===
        "delay"
    ) {

        chat =
            "admin";

    }


    if (
        chat &&
        typeof window !==
        "undefined" &&
        typeof window.addChatMessage ===
        "function"
    ) {

        window.addChatMessage(
            chat,
            {

                user:
                    person,

                time:
                    new Date()
                        .toLocaleTimeString(
                            [],
                            {
                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"
                            }
                        ),

                text:
                    incident.message

            }
        );

    }


    return true;

}


/* ==========================================================
   REACTION TO OMEGA
========================================================== */

function reactToOmegaEvent(
    data = {}
) {

    const personnel =
        getPersonnel().filter(
            person =>
                person.status ===
                "ON DUTY"
        );


    if (
        personnel.length === 0
    ) {

        return;

    }


    /*
     * Security reacts to time/system anomalies.
     */

    if (
        data.reason ===
        "time_backward" ||
        data.reason ===
        "time_future_event" ||
        data.reason ===
        "time_old_event"
    ) {

        const security =
            personnel.find(
                person =>
                    person.department ===
                    "SECURITY"
            );


        if (security) {

            recordAction({

                type:
                    "omega_time_review",

                person:
                    security.name,

                message:
                    "Reviewing system time discrepancy."

            });

        }

    }

}


/* ==========================================================
   UI
========================================================== */

function refreshUI() {

    if (
        typeof window !==
        "undefined" &&
        typeof window.renderPersonnel ===
        "function"
    ) {

        window.renderPersonnel();

    }

}


/* ==========================================================
   TICK
========================================================== */

function tick() {

    performWorkAction();

    startConversation();

    generateIncident();

}


/* ==========================================================
   STATUS
========================================================== */

export function getPersonnelLifeStatus() {

    return {

        initialized,

        recentActions:
            [
                ...recentActions
            ],

        lastConversation,

        lastIncident

    };

}


/* ==========================================================
   INIT
========================================================== */

export function initPersonnelLife() {

    if (
        initialized
    ) {

        return getPersonnelLifeStatus();

    }


    initialized =
        true;


    const saved =
        Storage.get(
            "personnelLifeLog",
            []
        );


    if (
        Array.isArray(saved)
    ) {

        recentActions =
            saved.slice(
                -CONFIG.maxLogEntries
            );

    }


    on(
        "omega:timeConflict",
        reactToOmegaEvent
    );


    tick();


    tickTimer =
        setInterval(
            tick,
            CONFIG.tickInterval
        );


    console.log(
        "[PERSONNEL LIFE] Autonomous personnel behavior initialized."
    );


    return getPersonnelLifeStatus();

}


/* ==========================================================
   DEBUG
========================================================== */

if (
    typeof window !==
    "undefined"
) {

    window.PERSONNEL_LIFE = {

        status:
            getPersonnelLifeStatus,

        tick

    };

}
