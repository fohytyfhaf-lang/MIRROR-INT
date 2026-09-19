/* ==========================================================
   OMEGA PERSONNEL DATABASE
   STAGE 5 — LIVE PERSONNEL / TASK MONITOR
========================================================== */

import {
    Storage
} from "./storage.js";

import {
    on
} from "./eventManager.js";

import {
    getPersonnelTasks
} from "./personnelEventSystem.js";

import {
    getPersonnelRelationships
} from "./personnelInteractions.js";


/* ==========================================================
   HELPERS
========================================================== */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

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


function formatTaskState(
    state
) {

    return String(
        state ||
        "UNKNOWN"
    )
        .replaceAll(
            "_",
            " "
        );

}


function taskStateClass(
    state
) {

    switch (
        state
    ) {

        case "ASSIGNED":
            return "assigned";

        case "IN_PROGRESS":
            return "progress";

        case "COMPLETED":
            return "completed";

        case "WAITING":
            return "waiting";

        default:
            return "unknown";

    }

}


function activeTasks() {

    return getPersonnelTasks()
        .filter(
            task =>
                task.state !==
                    "COMPLETED" &&
                task.state !==
                    "CANCELLED"
        )
        .sort(
            (
                a,
                b
            ) =>
                Number(
                    b.updatedAt ||
                    b.createdAt ||
                    0
                ) -
                Number(
                    a.updatedAt ||
                    a.createdAt ||
                    0
                )
        );

}


/* ==========================================================
   INITIAL STORAGE
========================================================== */

const defaultPersonnel = [

    {
        id: 1,
        name: "UNKNOWN UNIT-01",
        role: "SYSTEM ENTITY",
        status: "ACTIVE",
        clearance: 5,
        notes:
            "No additional data available."
    },

    {
        id: 2,
        name: "DR. K",
        role: "RESEARCHER",
        status: "UNKNOWN",
        clearance: 4,
        notes:
            "Connected to anomaly research division."
    },

    {
        id: 3,
        name: "MR.SMILE CORE",
        role: "UNKNOWN ENTITY",
        status: "UNSTABLE",
        clearance: 9,
        notes:
            "Do not interact without authorization."
    }

];


function initPersonnelData() {

    const data =
        Storage.get(
            "personnel"
        );

    if (
        !data
    ) {

        Storage.set(
            "personnel",
            defaultPersonnel
        );

    }

}


/* ==========================================================
   TASK MONITOR
========================================================== */

function renderTaskMonitor() {

    const tasks =
        activeTasks();

    const wrapper =
        document.createElement(
            "section"
        );

    wrapper.className =
        "personnelTaskMonitor";


    const header =
        document.createElement(
            "div"
        );

    header.className =
        "personnelTaskHeader";


    header.innerHTML = `
        <div>
            <span class="personnelTaskTitle">
                ACTIVE WORK ORDERS
            </span>

            <span class="personnelTaskSubtitle">
                INTERNAL OMEGA TASK SYSTEM
            </span>
        </div>

        <strong class="personnelTaskCount">
            ${String(
                tasks.length
            ).padStart(
                2,
                "0"
            )}
        </strong>
    `;


    wrapper.appendChild(
        header
    );


    if (
        tasks.length ===
        0
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "personnelTaskEmpty";

        empty.textContent =
            "NO ACTIVE PERSONNEL TASKS.";

        wrapper.appendChild(
            empty
        );

        return wrapper;

    }


    const list =
        document.createElement(
            "div"
        );

    list.className =
        "personnelTaskList";


    tasks
        .slice(
            0,
            8
        )
        .forEach(
            task => {

                const assignee =
                    task.assigneeId
                        ? getPerson(
                            task.assigneeId
                        )
                        : null;

                const requester =
                    task.requesterId
                        ? getPerson(
                            task.requesterId
                        )
                        : null;


                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "personnelTaskRow";


                row.dataset.state =
                    taskStateClass(
                        task.state
                    );


                row.innerHTML = `

                    <div
                        class="personnelTaskIdentity"
                    >

                        <strong>
                            ${escapeHtml(
                                task.title
                            )}
                        </strong>

                        <small>
                            ${escapeHtml(
                                task.type
                            )}
                        </small>

                    </div>


                    <div
                        class="personnelTaskTarget"
                    >

                        <span>
                            TARGET
                        </span>

                        <strong>
                            ${escapeHtml(
                                task.target ||
                                "—"
                            )}
                        </strong>

                    </div>


                    <div
                        class="personnelTaskPeople"
                    >

                        <span>
                            ${escapeHtml(
                                assignee?.name ||
                                "UNASSIGNED"
                            )}
                        </span>

                        ${
                            requester
                                ? `<small>
                                    REQUESTED BY
                                    ${escapeHtml(
                                        requester.name
                                    )}
                                </small>`
                                : ""
                        }

                    </div>


                    <div
                        class="personnelTaskState"
                    >
                        ${escapeHtml(
                            formatTaskState(
                                task.state
                            )
                        )}
                    </div>

                `;


                list.appendChild(
                    row
                );

            }
        );


    wrapper.appendChild(
        list
    );


    return wrapper;

}


/* ==========================================================
   PERSON CARD
========================================================== */

function createPersonCard(
    person
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "personCard";


    const task =
        person.currentTask ||
        null;


    const taskText =
        task
            ? (
                task.title ||
                task.type ||
                "ACTIVE TASK"
            )
            : "NO ACTIVE TASK";


    card.innerHTML = `

        <div class="personHeader">

            <h3>
                ${escapeHtml(
                    person.name
                )}
            </h3>

            <span class="badge">
                ${escapeHtml(
                    person.status ||
                    "UNKNOWN"
                )}
            </span>

        </div>


        <div class="personInfo">

            <p>
                <b>ROLE:</b>
                ${escapeHtml(
                    person.role
                )}
            </p>

            <p>
                <b>DEPARTMENT:</b>
                ${escapeHtml(
                    person.department ||
                    "—"
                )}
            </p>

            <p>
                <b>LOCATION:</b>
                ${escapeHtml(
                    person.location ||
                    "—"
                )}
            </p>

            <p>
                <b>ACTIVITY:</b>
                ${escapeHtml(
                    person.activity ||
                    "—"
                )}
            </p>

        </div>


        <div class="personCurrentTask">

            <span>
                CURRENT TASK
            </span>

            <strong>
                ${escapeHtml(
                    taskText
                )}
            </strong>

        </div>

    `;


    card.addEventListener(
        "click",
        () =>
            openProfile(
                person.id
            )
    );


    return card;

}


/* ==========================================================
   RENDER PERSONNEL
========================================================== */

export function renderPersonnel() {

    const list =
        document.getElementById(
            "personnelList"
        );

    if (
        !list
    ) {

        return;

    }


    list.innerHTML =
        "";


    const monitor =
        renderTaskMonitor();


    list.appendChild(
        monitor
    );


    const data =
        getPersonnel();


    data.forEach(
        person => {

            list.appendChild(
                createPersonCard(
                    person
                )
            );

        }
    );

}


/* ==========================================================
   RELATIONSHIP LABEL
========================================================== */

function relationshipLabel(
    relationship
) {

    if (!relationship) {

        return "NO RECORDED INTERACTIONS";

    }


    const trust =
        Number(
            relationship.trust ||
            0
        );

    const familiarity =
        Number(
            relationship.familiarity ||
            0
        );

    const irritation =
        Number(
            relationship.irritation ||
            0
        );


    return (
        "TRUST " +
        trust +
        " / FAMILIARITY " +
        familiarity +
        " / IRRITATION " +
        irritation
    );

}


/* ==========================================================
   RELATIONSHIPS FOR PERSON
========================================================== */

function getPersonRelationships(
    personId
) {

    const relations =
        getPersonnelRelationships();


    const result = [];


    Object.values(
        relations
    )
        .forEach(
            relationship => {

                if (
                    !Array.isArray(
                        relationship.ids
                    )
                ) {

                    return;

                }


                if (
                    !relationship.ids.includes(
                        personId
                    )
                ) {

                    return;

                }


                const otherId =
                    relationship.ids.find(
                        id =>
                            id !==
                            personId
                    );


                const other =
                    getPerson(
                        otherId
                    );


                if (
                    !other
                ) {

                    return;

                }


                result.push({

                    person:
                        other,

                    relationship

                });

            }
        );


    return result
        .sort(
            (
                a,
                b
            ) =>
                Number(
                    b.relationship
                        .interactions ||
                    0
                ) -
                Number(
                    a.relationship
                        .interactions ||
                    0
                )
        )
        .slice(
            0,
            6
        );

}


/* ==========================================================
   PROFILE VIEW
========================================================== */

function openProfile(
    id
) {

    const person =
        getPerson(
            id
        );


    if (
        !person
    ) {

        return;

    }


    const list =
        document.getElementById(
            "personnelList"
        );


    if (
        !list
    ) {

        return;

    }


    const task =
        person.currentTask ||
        null;


    const relationships =
        getPersonRelationships(
            person.id
        );


    list.innerHTML = `

        <div class="personProfile">

            <button
                id="backBtn"
                type="button"
            >
                ⬅ BACK
            </button>


            <h2>
                ${escapeHtml(
                    person.name
                )}
            </h2>


            <div class="profileBlock">

                <p>
                    <b>ID</b>
                    ${escapeHtml(
                        person.id
                    )}
                </p>

                <p>
                    <b>ROLE</b>
                    ${escapeHtml(
                        person.role
                    )}
                </p>

                <p>
                    <b>DEPARTMENT</b>
                    ${escapeHtml(
                        person.department ||
                        "—"
                    )}
                </p>

                <p>
                    <b>STATUS</b>
                    ${escapeHtml(
                        person.status ||
                        "—"
                    )}
                </p>

                <p>
                    <b>LOCATION</b>
                    ${escapeHtml(
                        person.location ||
                        "—"
                    )}
                </p>

                <p>
                    <b>CLEARANCE</b>
                    LVL ${escapeHtml(
                        person.clearance
                    )}
                </p>

            </div>


            <section
                class="personnelProfileTask"
            >

                <div class="personnelProfileSectionTitle">
                    CURRENT TASK
                </div>

                ${
                    task
                        ? `

                            <div
                                class="personnelProfileTaskBox"
                            >

                                <strong>
                                    ${escapeHtml(
                                        task.title ||
                                        task.type
                                    )}
                                </strong>

                                <span>
                                    STATE:
                                    ${escapeHtml(
                                        formatTaskState(
                                            task.state
                                        )
                                    )}
                                </span>

                                <span>
                                    TARGET:
                                    ${escapeHtml(
                                        task.target ||
                                        "—"
                                    )}
                                </span>

                                <span>
                                    TASK ID:
                                    ${escapeHtml(
                                        task.taskId ||
                                        task.id ||
                                        "—"
                                    )}
                                </span>

                            </div>

                        `
                        : `

                            <div
                                class="personnelProfileTaskBox empty"
                            >
                                NO ACTIVE TASK.
                            </div>

                        `
                }

            </section>


            <section
                class="personnelProfileSection"
            >

                <div class="personnelProfileSectionTitle">
                    DUTIES
                </div>

                <div class="personnelProfileList">

                    ${
                        Array.isArray(
                            person.duties
                        )
                            ? person.duties
                                .map(
                                    duty =>
                                        `<div>
                                            ${escapeHtml(
                                                duty
                                            )}
                                        </div>`
                                )
                                .join("")
                            : "<div>NO DATA</div>"
                    }

                </div>

            </section>


            <section
                class="personnelProfileSection"
            >

                <div class="personnelProfileSectionTitle">
                    SYSTEM ACCESS
                </div>

                <div class="personnelProfileList">

                    ${
                        Array.isArray(
                            person.systemAccess
                        )
                            ? person.systemAccess
                                .map(
                                    item =>
                                        `<div>
                                            ${escapeHtml(
                                                item
                                            )}
                                        </div>`
                                )
                                .join("")
                            : "<div>NO DATA</div>"
                    }

                </div>

            </section>


            <section
                class="personnelProfileSection"
            >

                <div class="personnelProfileSectionTitle">
                    CAPABILITIES
                </div>

                <div class="personnelProfileList">

                    ${
                        Array.isArray(
                            person.capabilities
                        )
                            ? person.capabilities
                                .map(
                                    item =>
                                        `<div>
                                            ${escapeHtml(
                                                item
                                            )}
                                        </div>`
                                )
                                .join("")
                            : "<div>NO DATA</div>"
                    }

                </div>

            </section>


            <section
                class="personnelProfileSection"
            >

                <div class="personnelProfileSectionTitle">
                    COWORKER RELATIONSHIPS
                </div>

                <div
                    class="personnelRelationshipList"
                >

                    ${
                        relationships.length
                            ? relationships
                                .map(
                                    item => `

                                        <div
                                            class="
                                                personnelRelationshipRow
                                            "
                                        >

                                            <strong>
                                                ${escapeHtml(
                                                    item.person.name
                                                )}
                                            </strong>

                                            <span>
                                                ${escapeHtml(
                                                    relationshipLabel(
                                                        item.relationship
                                                    )
                                                )}
                                            </span>

                                        </div>

                                    `
                                )
                                .join("")
                            : `
                                <div
                                    class="personnelRelationshipEmpty"
                                >
                                    NO RECORDED COWORKER INTERACTIONS.
                                </div>
                            `
                    }

                </div>

            </section>


            <div class="profileNotes">

                <p>
                    ${escapeHtml(
                        person.notes ||
                        "No additional personnel notes."
                    )}
                </p>

            </div>

        </div>

    `;


    const back =
        document.getElementById(
            "backBtn"
        );


    if (
        back
    ) {

        back.onclick =
            renderPersonnel;

    }

}


/* ==========================================================
   ADD PERSON API
========================================================== */

export function addPersonnel(
    person
) {

    const data =
        getPersonnel();


    data.push({

        id:
            "CUSTOM-" +
            Date.now(),

        ...person

    });


    Storage.set(
        "personnel",
        data
    );


    renderPersonnel();

}


/* ==========================================================
   LIVE EVENTS
========================================================== */

function bindLiveEvents() {

    const events = [

        "personnel:updated",

        "personnel:taskCreated",

        "personnel:taskUpdated",

        "personnel:taskAssigned",

        "personnel:taskCompleted",

        "personnel:taskEscalated",

        "personnel:assignmentChanged",

        "personnel:fileRepaired",

        "personnel:fileTransferred",

        "personnel:cameraRepaired",

        "personnel:relationshipChanged"

    ];


    events.forEach(
        eventName => {

            on(
                eventName,
                () => {

                    renderPersonnel();

                }
            );

        }
    );

}


/* ==========================================================
   INIT
========================================================== */

export function initPersonnel() {

    initPersonnelData();

    renderPersonnel();

    bindLiveEvents();


    if (
        typeof window !==
        "undefined"
    ) {

        window.renderPersonnel =
            renderPersonnel;

    }

}
