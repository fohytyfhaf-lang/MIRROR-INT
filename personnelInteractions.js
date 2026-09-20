/* ==========================================================
   OMEGA PERSONNEL INTERACTIONS
   STAGE 3 — INTERNAL COLLECTIVE / WORK RELATIONSHIPS
========================================================== */

import { on, trigger } from "./eventManager.js";
import { Storage } from "./storage.js";
import { getCameras, repairCamera } from "./camera.js";
import { addChatMessage } from "./chats.js";

const TICK = 5000;
const REL_KEY = "personnel_relationships_v1";
const DOC_KEY = "personnel_documents_v1";
const HISTORY_KEY = "personnel_interaction_history_v1";
const MAX_HISTORY = 200;

const CAMERA_MIN = 4000;
const CAMERA_MAX = 11000;
const SOCIAL_MIN = 90000;
const SOCIAL_MAX = 210000;
const DOC_FAULT_MIN = 180000;
const DOC_FAULT_MAX = 420000;

let initialized = false;
let timer = null;
let nextSocialAt = 0;
let nextDocumentFaultAt = 0;
let internalChat = false;

const cameraStates = new Map();
const cameraJobs = new Map();
const fileRequests = new Map();
const pairCooldowns = new Map();

const TALK = {
    "P-001": .45,
    "P-002": .55,
    "P-003": .55,
    "P-004": .35,
    "P-005": .35,
    "P-006": .25,
    "P-007": .20,
    "P-008": .25,
    "P-009": .65,
    "P-010": .15
};

const DOCS = [
    {
        id: "DOC-SEC-01",
        name: "sector_c_incident_report.txt",
        department: "SECURITY",
        version: 4,
        condition: "OK"
    },

    {
        id: "DOC-SEC-02",
        name: "camera_maintenance_log.txt",
        department: "SECURITY",
        version: 7,
        condition: "OK"
    },

    {
        id: "DOC-RES-01",
        name: "phase3_research_notes.txt",
        department: "RESEARCH",
        version: 12,
        condition: "OK"
    },

    {
        id: "DOC-RES-02",
        name: "ten_observation_log.txt",
        department: "RESEARCH",
        version: 9,
        condition: "OK"
    },

    {
        id: "DOC-MED-01",
        name: "medical_transfer_log.txt",
        department: "MEDICAL",
        version: 5,
        condition: "OK"
    },

    {
        id: "DOC-ADM-01",
        name: "internal_personnel_request.txt",
        department: "ADMINISTRATION",
        version: 3,
        condition: "OK"
    }
];

const SOCIAL = [
    {
        a: "P-001",
        b: "P-002",
        chance: .65,

        lines: [
            [
                "Did you get the revised phase notes?",
                "Yes. Still checking the last section."
            ],

            [
                "Miller, the archive copy is older than mine.",
                "Then use your copy. I'll compare them later."
            ],

            [
                "Are you staying late?",
                "Not unless something else breaks."
            ]
        ]
    },

    {
        a: "P-003",
        b: "P-004",
        chance: .75,

        lines: [
            [
                "CAM 05 is showing weak signal again.",
                "I saw it. Keep an eye on the feed."
            ],

            [
                "You checked the archive log?",
                "Already did. Nothing useful."
            ],

            [
                "Your side of the corridor is clear.",
                "Good. I'll keep the cameras running."
            ]
        ]
    },

    {
        a: "P-004",
        b: "P-007",
        chance: .35,

        lines: [
            [
                "Brenner, do you still have the old sector C log?",
                "I have the archived copy. Sending it."
            ],

            [
                "That report is older than the current index.",
                "Because the current index was updated twice."
            ]
        ]
    },

    {
        a: "P-002",
        b: "P-005",
        chance: .45,

        lines: [
            [
                "Need the latest transfer number?",
                "Yes, please."
            ],

            [
                "Medical notes from yesterday are incomplete.",
                "I'll check the original record."
            ]
        ]
    },

    {
        a: "P-008",
        b: "P-009",
        chance: .60,

        lines: [
            [
                "Network queue is building again.",
                "I'll route the low-priority messages away from it."
            ],

            [
                "Did the server diagnostics finish?",
                "Almost. One warning left."
            ]
        ]
    },

    {
        a: "P-006",
        b: "P-009",
        chance: .40,

        lines: [
            [
                "Cole, send me the revised internal request list.",
                "Give me a minute."
            ],

            [
                "Anything urgent in the queue?",
                "Two requests. Nothing critical."
            ]
        ]
    },

    {
        a: "P-010",
        b: "P-003",
        chance: .25,

        lines: [
            [
                "Checkpoint 3 light is flickering again.",
                "I'll add it to maintenance."
            ]
        ]
    }
];


/* ==========================================================
   HELPERS
========================================================== */

function now() {
    return Date.now();
}


function rand(
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


function pick(
    list
) {

    return Array.isArray(
        list
    ) && list.length
        ? list[
            Math.floor(
                Math.random() *
                list.length
            )
        ]
        : null;

}


function schedule(
    min,
    max
) {

    return now() +
        rand(
            min,
            max
        );

}


function personnel() {

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


function person(
    id
) {

    return personnel().find(
        p =>
            p.id === id
    ) || null;

}


function onDuty(
    p
) {

    return Boolean(
        p &&
        p.status ===
            "ON DUTY"
    );

}


function talkative(
    p
) {

    return Math.random() <
        (
            TALK[
                p?.id
            ] ??
            .35
        );

}


function pairKey(
    a,
    b
) {

    return [
        String(a || ""),
        String(b || "")
    ]
        .filter(Boolean)
        .sort()
        .join("::");

}


/* ==========================================================
   RELATIONSHIPS
========================================================== */

function getRelations() {

    const data =
        Storage.get(
            REL_KEY,
            {}
        );

    return (
        data &&
        typeof data ===
            "object" &&
        !Array.isArray(
            data
        )
    )
        ? data
        : {};

}


function changeRelation(
    a,
    b,
    delta = {},
    reason = ""
) {

    if (
        !a ||
        !b ||
        a === b
    ) {

        return null;

    }

    const data =
        getRelations();

    const key =
        pairKey(
            a,
            b
        );

    const r =
        data[key] || {

            ids: [
                a,
                b
            ]
                .sort(),

            familiarity:
                0,

            trust:
                0,

            irritation:
                0,

            interactions:
                0

        };


    r.familiarity =
        Math.max(
            0,
            Math.min(
                100,
                r.familiarity +
                Number(
                    delta.familiarity ||
                    0
                )
            )
        );


    r.trust =
        Math.max(
            -100,
            Math.min(
                100,
                r.trust +
                Number(
                    delta.trust ||
                    0
                )
            )
        );


    r.irritation =
        Math.max(
            0,
            Math.min(
                100,
                r.irritation +
                Number(
                    delta.irritation ||
                    0
                )
            )
        );


    r.interactions += 1;

    r.updatedAt =
        now();


    data[key] =
        r;

    Storage.set(
        REL_KEY,
        data
    );


    trigger(
        "personnel:relationshipChanged",
        {
            key,

            a,

            b,

            relationship:
                {
                    ...r
                },

            reason,

            timestamp:
                now()
        }
    );


    return r;

}


/* ==========================================================
   INTERACTION HISTORY
========================================================== */

function history(
    entry
) {

    const data =
        Storage.get(
            HISTORY_KEY,
            []
        );

    const list =
        Array.isArray(
            data
        )
            ? data
            : [];


    list.push({

        id:
            "PI-" +
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
                    7
                ),

        timestamp:
            now(),

        ...entry

    });


    Storage.set(
        HISTORY_KEY,
        list.slice(
            -MAX_HISTORY
        )
    );

}


/* ==========================================================
   INTERNAL CHAT
========================================================== */

function say(
    p,
    text,
    options = {}
) {

    if (
        !p ||
        !text ||
        internalChat
    ) {

        return false;

    }


    const channel =
        options.channel ||
        {
            SECURITY:
                "security",

            RESEARCH:
                "research",

            MEDICAL:
                "medical",

            ADMINISTRATION:
                "admin"

        }[
            p.department
        ] ||
        "general";


    internalChat =
        true;


    let added =
        false;


    try {

        added =
            addChatMessage(
                channel,
                {
                    user:
                        p.name,

                    text:
                        String(
                            text
                        )
                }
            );

    } finally {

        internalChat =
            false;

    }


    if (
        !added
    ) {

        return false;

    }


    trigger(
        "personnel:socialMessage",
        {

            personnelId:
                p.id,

            name:
                p.name,

            channel,

            text:
                String(
                    text
                ),

            reason:
                options.reason ||
                "social",

            autonomous:
                true,

            timestamp:
                now()

        }
    );


    return true;

}


/* ==========================================================
   INTERNAL WORK DOCUMENTS
========================================================== */

function documents() {

    const saved =
        Storage.get(
            DOC_KEY,
            null
        );


    if (
        Array.isArray(
            saved
        ) &&
        saved.length
    ) {

        return saved;

    }


    const fresh =
        DOCS.map(
            d => ({
                ...d
            })
        );


    Storage.set(
        DOC_KEY,
        fresh
    );


    return fresh;

}


function saveDocuments(
    data
) {

    Storage.set(
        DOC_KEY,
        data
    );

}


function canProvide(
    p,
    doc
) {

    if (
        !onDuty(p) ||
        !doc
    ) {

        return false;

    }


    if (
        p.department ===
        doc.department
    ) {

        return true;

    }


    return (
        Array.isArray(
            p.systemAccess
        ) &&
        p.systemAccess.includes(
            "files"
        ) &&
        Number(
            p.clearance ||
            0
        ) >= 3
    );

}


function chooseProvider(
    requester,
    doc
) {

    const list =
        personnel().filter(
            p =>
                p.id !==
                    requester.id &&
                canProvide(
                    p,
                    doc
                )
        );


    list.sort(
        (
            a,
            b
        ) =>
            Number(
                b.department ===
                requester.department
            ) -
            Number(
                a.department ===
                requester.department
            )
    );


    return list[0] ||
        null;

}


/* ==========================================================
   DAMAGE DOCUMENT
========================================================== */

function damageDocument(
    doc
) {

    const data =
        documents();


    const current =
        data.find(
            d =>
                d.id ===
                doc?.id
        );


    if (
        !current ||
        current.condition ===
            "DAMAGED"
    ) {

        return current ||
            null;

    }


    current.condition =
        "DAMAGED";


    current.damageTime =
        now();


    current.damageReason =
        pick(
            [
                "checksum mismatch",
                "incomplete write",
                "storage sector error",
                "corrupted local copy",
                "unexpected document termination"
            ]
        );


    current.updatedAt =
        now();


    saveDocuments(
        data
    );


    trigger(
        "personnel:documentDamaged",
        {
            ...current
        }
    );


    history({

        type:
            "document_damage",

        documentId:
            current.id,

        document:
            current.name,

        reason:
            current.damageReason,

        autonomous:
            true

    });


    return current;

}


function chooseRequester(
    doc
) {

    return pick(
        personnel().filter(
            p =>
                onDuty(
                    p
                ) &&
                p.department ===
                    doc.department
        )
    );

}


/* ==========================================================
   REQUEST DOCUMENT
========================================================== */

function requestDocument(
    requester,
    doc
) {

    if (
        !requester ||
        !doc ||
        doc.condition !==
            "DAMAGED"
    ) {

        return null;

    }


    if (
        fileRequests.has(
            doc.id
        )
    ) {

        return fileRequests.get(
            doc.id
        );

    }


    const provider =
        chooseProvider(
            requester,
            doc
        );


    const request = {

        documentId:
            doc.id,

        requesterId:
            requester.id,

        providerId:
            provider?.id ||
            null,

        state:
            provider
                ? "PENDING_TRANSFER"
                : "WAITING_FOR_PERSONNEL",

        createdAt:
            now(),

        deliverAt:
            provider
                ? now() +
                    rand(
                        3500,
                        9000
                    )
                : null

    };


    fileRequests.set(
        doc.id,
        request
    );


    trigger(
        "personnel:fileRequest",
        {

            ...request,

            document:
                doc.name,

            requester:
                requester.name,

            provider:
                provider?.name ||
                null,

            timestamp:
                now()

        }
    );


    if (
        talkative(
            requester
        )
    ) {

        say(
            requester,

            "I need " +
                doc.name +
                ". My local copy is damaged.",

            {
                reason:
                    "file_request"
            }
        );

    }


    if (
        provider &&
        talkative(
            provider
        )
    ) {

        say(
            provider,

            "I have a clean copy of " +
                doc.name +
                ". I'll send it.",

            {
                reason:
                    "file_provider_response"
            }
        );

    }


    return request;

}


/* ==========================================================
   COMPLETE FILE REQUEST
========================================================== */

function completeFileRequest(
    request
) {

    const requester =
        person(
            request.requesterId
        );

    const provider =
        person(
            request.providerId
        );


    if (
        !onDuty(
            requester
        ) ||
        !onDuty(
            provider
        )
    ) {

        return false;

    }


    const data =
        documents();


    const doc =
        data.find(
            d =>
                d.id ===
                request.documentId
        );


    if (
        !doc ||
        doc.condition !==
            "DAMAGED" ||
        !canProvide(
            provider,
            doc
        )
    ) {

        return false;

    }


    doc.version += 1;


    doc.condition =
        "OK";


    doc.replacedAt =
        now();


    doc.replacedBy =
        provider.id;


    doc.replacedByName =
        provider.name;


    doc.replacedFor =
        requester.id;


    doc.damageReason =
        null;


    doc.updatedAt =
        now();


    saveDocuments(
        data
    );


    changeRelation(
        requester.id,
        provider.id,

        {

            familiarity:
                4,

            trust:
                5,

            irritation:
                -2

        },

        "file_help"
    );


    trigger(
        "personnel:fileTransferred",
        {

            document:
                {
                    ...doc
                },

            requester:
                requester.name,

            requesterId:
                requester.id,

            provider:
                provider.name,

            providerId:
                provider.id,

            timestamp:
                now()

        }
    );


    history({

        type:
            "file_repaired",

        documentId:
            doc.id,

        requesterId:
            requester.id,

        providerId:
            provider.id,

        version:
            doc.version

    });


    if (
        talkative(
            requester
        )
    ) {

        setTimeout(
            () => {

                const currentRequester =
                    person(
                        requester.id
                    );


                if (
                    onDuty(
                        currentRequester
                    )
                ) {

                    say(
                        currentRequester,

                        "Got it. Replaced the damaged copy. Thanks.",

                        {
                            reason:
                                "file_repaired"
                        }
                    );

                }

            },

            rand(
                1200,
                3200
            )
        );

    }


    trigger(
        "personnel:fileRepaired",
        {

            document:
                {
                    ...doc
                },

            requester:
                requester.name,

            provider:
                provider.name,

            timestamp:
                now()

        }
    );


    fileRequests.delete(
        doc.id
    );


    return true;

}


/* ==========================================================
   PROCESS FILE REQUESTS
========================================================== */

function processFileRequests() {

    for (
        const [
            id,
            request
        ]
        of fileRequests
    ) {

        const requester =
            person(
                request.requesterId
            );


        const doc =
            documents()
                .find(
                    d =>
                        d.id ===
                        id
                );


        if (
            !requester ||
            !doc
        ) {

            continue;

        }


        let provider =
            request.providerId
                ? person(
                    request.providerId
                )
                : chooseProvider(
                    requester,
                    doc
                );


        if (
            !provider ||
            !onDuty(
                provider
            )
        ) {

            request.providerId =
                null;

            request.state =
                "WAITING_FOR_PERSONNEL";

            continue;

        }


        request.providerId =
            provider.id;


        request.state =
            "PENDING_TRANSFER";


        if (
            !request.deliverAt
        ) {

            request.deliverAt =
                now() +
                rand(
                    3500,
                    9000
                );

        }


        if (
            now() >=
            request.deliverAt
        ) {

            completeFileRequest(
                request
            );

        }

    }

}


/* ==========================================================
   CAMERA REPAIR JOB
========================================================== */

function createCameraJob(
    camera
) {

    if (
        !camera ||
        cameraJobs.has(
            camera.id
        )
    ) {

        return null;

    }


    const candidates =
        personnel().filter(
            p =>
                onDuty(
                    p
                ) &&

                p.department ===
                    "SECURITY" &&

                (
                    (
                        Array.isArray(
                            p.capabilities
                        ) &&
                        p.capabilities.includes(
                            "repair_camera"
                        )
                    ) ||

                    p.role ===
                        "SECURITY OFFICER" ||

                    p.role ===
                        "SECURITY ANALYST"
                )
        );


    const repairer =
        pick(
            candidates
        );


    if (
        !repairer
    ) {

        return null;

    }


    const job = {

        cameraId:
            camera.id,

        repairerId:
            repairer.id,

        createdAt:
            now(),

        repairAt:
            now() +
            rand(
                CAMERA_MIN,
                CAMERA_MAX
            ),

        state:
            "ASSIGNED"

    };


    cameraJobs.set(
        camera.id,
        job
    );


    trigger(
        "personnel:cameraRepairAssigned",
        {

            ...job,

            repairer:
                repairer.name,

            timestamp:
                now()

        }
    );


    history({

        type:
            "camera_repair_assigned",

        cameraId:
            camera.id,

        repairerId:
            repairer.id

    });


    return job;

}


/* ==========================================================
   COMPLETE CAMERA REPAIR
========================================================== */

function completeCameraJob(
    job
) {

    const repairer =
        person(
            job.repairerId
        );


    if (
        !onDuty(
            repairer
        )
    ) {

        return false;

    }


    const ok =
        repairCamera(
            job.cameraId,
            repairer.id
        );


    if (
        !ok
    ) {

        return false;

    }


    const data =
        personnel();


    const current =
        data.find(
            p =>
                p.id ===
                repairer.id
        );


    if (
        current
    ) {

        current.lastAction = {

            type:
                "camera_repair",

            target:
                job.cameraId,

            detail:
                "repaired " +
                job.cameraId,

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

    }


    if (
        talkative(
            repairer
        )
    ) {

        say(
            repairer,

            pick(
                [
                    job.cameraId +
                        " is back. I swear these cameras are trying to ruin my shift.",

                    job.cameraId +
                        " is fixed. I am seriously tired of repairing these things.",

                    "Fixed " +
                        job.cameraId +
                        ". Why do these cameras always decide to die on my shift?",

                    job.cameraId +
                        " is online again. I really hate these cameras."
                ]
            ),

            {
                reason:
                    "camera_repair"
            }
        );

    }


    trigger(
        "personnel:cameraRepaired",
        {

            cameraId:
                job.cameraId,

            repairer:
                repairer.name,

            repairerId:
                repairer.id,

            timestamp:
                now()

        }
    );


    history({

        type:
            "camera_repair",

        cameraId:
            job.cameraId,

        repairerId:
            repairer.id

    });


    cameraJobs.delete(
        job.cameraId
    );


    return true;

}


/* ==========================================================
   PROCESS CAMERA JOBS
========================================================== */

function processCameraJobs() {

    for (
        const job
        of cameraJobs.values()
    ) {

        if (
            now() >=
            job.repairAt
        ) {

            completeCameraJob(
                job
            );

        }

    }

}


/* ==========================================================
   CAMERA STATE WATCHER
========================================================== */

function updateCameraStates() {

    const cameras =
        getCameras();


    if (
        !Array.isArray(
            cameras
        )
    ) {

        return;

    }


    for (
        const camera
        of cameras
    ) {

        const previous =
            cameraStates.get(
                camera.id
            );


        const fault =

            camera.status ===
                "OFFLINE" ||

            camera.status ===
                "DEGRADED" ||

            camera.status ===
                "MAINTENANCE" ||

            camera.recording ===
                false ||

            camera.signal < 70;


        const previousFault =

            previous &&

            (
                previous.status ===
                    "OFFLINE" ||

                previous.status ===
                    "DEGRADED" ||

                previous.status ===
                    "MAINTENANCE" ||

                previous.recording ===
                    false ||

                previous.signal < 70
            );


        if (
            fault &&
            !previousFault
        ) {

            const job =
                createCameraJob(
                    camera
                );


            trigger(
                "personnel:cameraFaultObserved",
                {

                    cameraId:
                        camera.id,

                    status:
                        camera.status,

                    signal:
                        camera.signal,

                    recording:
                        camera.recording,

                    assigned:
                        Boolean(
                            job
                        ),

                    repairer:
                        job
                            ? person(
                                job.repairerId
                              )
                                ?.name ||
                              null
                            : null,

                    timestamp:
                        now()

                }
            );

        }


        cameraStates.set(
            camera.id,
            {

                status:
                    camera.status,

                signal:
                    camera.signal,

                recording:
                    camera.recording

            }
        );

    }

}


/* ==========================================================
   COWORKER SOCIAL LIFE
========================================================== */

function socialPair(
    pair
) {

    const a =
        person(
            pair.a
        );


    const b =
        person(
            pair.b
        );


    const key =
        pairKey(
            pair.a,
            pair.b
        );


    if (
        !onDuty(a) ||
        !onDuty(b)
    ) {

        return false;

    }


    if (
        (
            pairCooldowns.get(
                key
            ) ||
            0
        ) > now()
    ) {

        return false;

    }


    if (
        Math.random() >
        pair.chance
    ) {

        pairCooldowns.set(
            key,
            schedule(
                120000,
                300000
            )
        );

        return false;

    }


    const sequence =
        pick(
            pair.lines
        );


    if (
        !sequence
    ) {

        return false;

    }


    let delay =
        0;


    sequence.forEach(
        (
            line,
            index
        ) => {

            setTimeout(
                () => {

                    const speaker =
                        index % 2 === 0
                            ? person(pair.a)
                            : person(pair.b);


                    const listener =
                        speaker?.id ===
                            pair.a
                            ? person(pair.b)
                            : person(pair.a);


                    if (
                        !onDuty(
                            speaker
                        )
                    ) {

                        return;

                    }


                    say(
                        speaker,
                        line,
                        {
                            reason:
                                "coworker_conversation"
                        }
                    );


                    if (
                        listener
                    ) {

                        changeRelation(
                            speaker.id,
                            listener.id,
                            {

                                familiarity:
                                    1,

                                trust:
                                    1

                            },

                            "coworker_conversation"
                        );

                    }

                },

                delay
            );


            delay +=
                rand(
                    1200,
                    2800
                );

        }
    );


    pairCooldowns.set(
        key,
        schedule(
            SOCIAL_MIN,
            SOCIAL_MAX
        )
    );


    return true;

}

function processSocial() {

    if (
        now() <
        nextSocialAt
    ) {

        return;

    }


    nextSocialAt =
        schedule(
            SOCIAL_MIN,
            SOCIAL_MAX
        );


    /*
     * New personnel get a chance first.
     */

    const dynamicPair =
        getDynamicSocialPair();


    if (
        dynamicPair &&
        socialPair(
            dynamicPair
        )
    ) {

        return;

    }


    /*
     * Original authored relationships
     * continue to work as before.
     */

    const pairs =
        SOCIAL
            .slice()
            .sort(
                () =>
                    Math.random() -
                    0.5
            );


    for (
        const pair
        of pairs
    ) {

        if (
            socialPair(
                pair
            )
        ) {

            break;

        }

    }

}



/* ==========================================================
   DYNAMIC COWORKER SOCIAL LIFE
   ----------------------------------------------------------
   New personnel are not limited to the static SOCIAL table.
   They can form temporary conversations with coworkers.
========================================================== */

function getDynamicConversationLines(
    a,
    b
) {

    const department =
        String(
            a?.department ||
            b?.department ||
            ""
        );


    const activityB =
        b?.activity ||
        "your current work";


    switch (
        department
    ) {

        case "SECURITY":

            return [

                [
                    "How's your sector looking?",
                    "Quiet so far. I'm keeping an eye on " +
                        (
                            b?.location ||
                            "the area"
                        )
                ],

                [
                    "Any issues on the cameras?",
                    "Nothing serious right now."
                ],

                [
                    "You taking the next check?",
                    "Yeah. I'll handle it."
                ]

            ];


        case "RESEARCH":

            return [

                [
                    "Anything unusual in the current queue?",
                    "Nothing I can't handle so far."
                ],

                [
                    "Did you finish your review?",
                    "Almost. I'm still checking the last section."
                ],

                [
                    "What are you working on?",
                    activityB + "."
                ]

            ];


        case "MEDICAL":

            return [

                [
                    "How's the medical queue?",
                    "Busy, but nothing critical."
                ],

                [
                    "Any new transfers?",
                    "Not since the last update."
                ],

                [
                    "You need help with the records?",
                    "I might. Give me a minute."
                ]

            ];


        case "ADMINISTRATION":

            return [

                [
                    "How's the request queue?",
                    "A few pending items. Nothing urgent."
                ],

                [
                    "Did that personnel request come through?",
                    "Yes. I'm reviewing it now."
                ],

                [
                    "Still working on those reports?",
                    "Unfortunately, yes."
                ]

            ];


        case "ARCHIVE":

            return [

                [
                    "Archive index behaving today?",
                    "Mostly. I'm checking a few old entries."
                ],

                [
                    "You found the missing record?",
                    "Not yet. I'm still searching."
                ],

                [
                    "Need another pair of eyes?",
                    "Actually, yes."
                ]

            ];


        case "SYSTEMS":

            return [

                [
                    "How's the network looking?",
                    "Stable for the moment."
                ],

                [
                    "Any warnings in the logs?",
                    "One minor warning. I'm checking it."
                ],

                [
                    "Server room still quiet?",
                    "For now."
                ]

            ];


        case "COMMUNICATIONS":

            return [

                [
                    "How's message traffic?",
                    "Steady. Nothing unusual."
                ],

                [
                    "Any routing problems?",
                    "A small queue, but it's under control."
                ],

                [
                    "Need help with the incoming requests?",
                    "I can handle most of them."
                ]

            ];


        case "MAINTENANCE":

            return [

                [
                    "Anything broken today?",
                    "A couple of minor issues."
                ],

                [
                    "How's the maintenance queue?",
                    "Moving along."
                ],

                [
                    "Need another person on that job?",
                    "Not yet. I'll call if I do."
                ]

            ];


        default:

            return [

                [
                    "How's your shift going?",
                    "Pretty normal so far."
                ],

                [
                    "Everything alright on your side?",
                    "Yeah. Just keeping busy."
                ],

                [
                    "You need anything?",
                    "Not right now, thanks."
                ]

            ];

    }

}


/* ==========================================================
   FIND DYNAMIC COWORKER PAIR
========================================================== */

function getDynamicSocialPair() {

    const active =
        personnel().filter(
            p =>
                onDuty(p) &&
                p.id
        );


    if (
        active.length <
        2
    ) {

        return null;

    }


    const shuffled =
        active
            .slice()
            .sort(
                () =>
                    Math.random() -
                    0.5
            );


    for (
        const a
        of shuffled
    ) {

        /*
         * Prefer someone from the same department.
         */

        const sameDepartment =
            shuffled.filter(
                b =>
                    b.id !==
                        a.id &&
                    b.department ===
                        a.department
            );


        const pool =
            sameDepartment.length &&
            Math.random() < 0.75

                ? sameDepartment

                : shuffled.filter(
                    b =>
                        b.id !==
                            a.id
                );


        const b =
            pick(pool);


        if (
            !b
        ) {

            continue;

        }


        const key =
            pairKey(
                a.id,
                b.id
            );


        /*
         * Do not make the same two people
         * talk again immediately.
         */

        if (
            (
                pairCooldowns.get(
                    key
                ) ||
                0
            ) > now()
        ) {

            continue;

        }


        return {

            a:
                a.id,

            b:
                b.id,

            chance:
                0.60,

            lines:
                getDynamicConversationLines(
                    a,
                    b
                )

        };

    }


    return null;

}


/* ==========================================================
   DOCUMENT FAULTS
========================================================== */

function processDocumentFaults() {

    if (
        now() <
        nextDocumentFaultAt
    ) {

        return;

    }


    nextDocumentFaultAt =
        schedule(
            DOC_FAULT_MIN,
            DOC_FAULT_MAX
        );


    if (
        Math.random() >
        0.45
    ) {

        return;

    }


    const doc =
        pick(
            documents()
                .filter(
                    d =>
                        d.condition ===
                        "OK"
                )
        );


    if (
        !doc
    ) {

        return;

    }


    const damaged =
        damageDocument(
            doc
        );


    const requester =
        chooseRequester(
            damaged
        );


    if (
        requester
    ) {

        requestDocument(
            requester,
            damaged
        );

    }

}


/* ==========================================================
   WAITING REQUESTS
========================================================== */

function retryRequests() {

    for (
        const request
        of fileRequests.values()
    ) {

        if (
            request.providerId
        ) {

            continue;

        }


        const requester =
            person(
                request.requesterId
            );


        const doc =
            documents()
                .find(
                    d =>
                        d.id ===
                        request.documentId
                );


        if (
            !requester ||
            !doc
        ) {

            continue;

        }


        const provider =
            chooseProvider(
                requester,
                doc
            );


        if (
            !provider
        ) {

            continue;

        }


        request.providerId =
            provider.id;


        request.state =
            "PENDING_TRANSFER";


        request.deliverAt =
            now() +
            rand(
                3500,
                9000
            );


        if (
            talkative(
                provider
            )
        ) {

            say(
                provider,

                "I found a clean copy of " +
                    doc.name +
                    ". Sending it.",

                {
                    reason:
                        "file_provider_response"
                }
            );

        }

    }

}


/* ==========================================================
   MAIN TICK
========================================================== */

function tick() {

    updateCameraStates();

    processCameraJobs();

    processFileRequests();

    processDocumentFaults();

    processSocial();

}


/* ==========================================================
   PUBLIC API
========================================================== */

export function getPersonnelRelationships() {

    return {
        ...getRelations()
    };

}


export function getPersonnelDocuments() {

    return documents()
        .map(
            d => ({
                ...d
            })
        );

}


export function getPersonnelInteractionHistory() {

    const data =
        Storage.get(
            HISTORY_KEY,
            []
        );


    return Array.isArray(
        data
    )
        ? [
            ...data
        ]
        : [];

}


export function damagePersonnelDocumentNow(
    documentId
) {

    const doc =
        documents()
            .find(
                d =>
                    d.id ===
                    documentId
            );


    if (
        !doc
    ) {

        return false;

    }


    const damaged =
        damageDocument(
            doc
        );


    const requester =
        chooseRequester(
            damaged
        );


    if (
        requester
    ) {

        requestDocument(
            requester,
            damaged
        );

    }


    return true;

}


export function runPersonnelInteractionNow() {

    updateCameraStates();

    processCameraJobs();

    processFileRequests();

    processDocumentFaults();

    processSocial();

    return true;

}


export function resetPersonnelInteractions() {

    Storage.remove(
        REL_KEY
    );

    Storage.remove(
        DOC_KEY
    );

    Storage.remove(
        HISTORY_KEY
    );


    cameraStates.clear();

    cameraJobs.clear();

    fileRequests.clear();

    pairCooldowns.clear();


    nextSocialAt =
        schedule(
            SOCIAL_MIN,
            SOCIAL_MAX
        );


    nextDocumentFaultAt =
        schedule(
            60000,
            120000
        );

}


/* ==========================================================
   INIT
========================================================== */

export function initPersonnelInteractions() {

    if (
        initialized
    ) {

        return;

    }


    initialized =
        true;


    documents();


    nextSocialAt =
        schedule(
            SOCIAL_MIN,
            SOCIAL_MAX
        );


    nextDocumentFaultAt =
        schedule(
            60000,
            120000
        );


    getCameras()
        .forEach(
            camera => {

                cameraStates.set(
                    camera.id,
                    {

                        status:
                            camera.status,

                        signal:
                            camera.signal,

                        recording:
                            camera.recording

                    }
                );

            }
        );


    timer =
        setInterval(
            tick,
            TICK
        );


    on(
        "personnel:updated",
        retryRequests
    );


    console.log(
        "[PERSONNEL INTERACTIONS] Initialized.",
        {
            documents:
                documents().length
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

    window.PERSONNEL_INTERACTIONS = {

        relationships:
            getPersonnelRelationships,

        documents:
            getPersonnelDocuments,

        history:
            getPersonnelInteractionHistory,

        damageDocument:
            damagePersonnelDocumentNow,

        runNow:
            runPersonnelInteractionNow,

        reset:
            resetPersonnelInteractions

    };

}
