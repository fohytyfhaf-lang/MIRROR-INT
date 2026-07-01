import { Storage } from "./storage.js";

/* =========================
        RESEARCH ARCHIVE
========================= */

const database = {

    entities: {

        title: "🧬 ENTITIES",

        files: [

            {
                id: "ENTITY-001",
                name: "KITCH",
                clearance: "LEVEL II",
                image: "images/kitch.png",

                text: `
KITCH

STATUS
Stable

DANGER
LEVEL IV

DESCRIPTION

A calm biological organism.

Uses poisonous needle-like tentacles.

Shows no aggression until attacked.

LIKES

• Books
• Silence

ABILITIES

• Toxic needles
• High regeneration

NOTES

Do not provoke.
`
            },

            {
                id: "ENTITY-002",
                name: "MICH",
                clearance: "LEVEL IV",
                image: "images/mich.png",

                text: `
MICH

STATUS
Hostile

DANGER
LEVEL V

DESCRIPTION

Blind predator.

Tracks victims through sound.

Frequently imitates human voices.

Do not respond to unknown calls.
`
            },

            {
                id: "ENTITY-003",
                name: "GARDENER",
                clearance: "LEVEL III",
                image: "images/gardener.png",

                text: `
GARDENER

STATUS

Passive

Will attack only if flowers are damaged.

Protects biological zones.
`
            },

            {
                id: "ENTITY-004",
                name: "SURGEON",
                clearance: "LEVEL V",
                image: "images/surgeon.png",

                text: `
SURGEON

Former military unit.

Immortal.

Two heads.

Always hungry.

Extremely dangerous.
`
            },

            {
                id: "ENTITY-005",
                name: "TEN",
                clearance: "LEVEL V",
                image: "images/ten.png",

                text: `
TEN

Unknown anomaly.

Information incomplete.

Further research required.
`
            }

        ]

    },

    projects: {

        title: "⚙ PROJECTS",

        files: [

            {

                id: "PR-001",

                name: "Project Lazarus",

                clearance: "LEVEL IV",

                image: "",

                text: `
Experimental resurrection program.

STATUS

Suspended.
`
            }

        ]

    },

    incidents: {

        title: "📄 INCIDENTS",

        files: [

            {

                id: "INC-004",

                name: "Containment Failure",

                clearance: "LEVEL III",

                image: "",

                text: `
Containment breach.

Sector C locked.

Casualties:

12
`
            }

        ]

    },

    personnel: {

        title: "👤 PERSONNEL FILES",

        files: [

            {

                id: "EMP-001",

                name: "Director",

                clearance: "OMEGA",

                image: "",

                text: `
Director file.

ACCESS RESTRICTED.
`
            }

        ]

    },

    recovered: {

        title: "💾 RECOVERED FILES",

        files: [

            {

                id: "REC-001",

                name: "Unknown.txt",

                clearance: "UNKNOWN",

                image: "",

                text: `
██████████████

:)

██████████████
`
            }

        ]

    }

};

/* ========================= */

export function initResearch() {

    const categories = document.getElementById("researchCategories");

    if (!categories) return;

    categories.innerHTML = "";

    Object.keys(database).forEach(key => {

        const btn = document.createElement("button");

        btn.className = "researchCategory";

        btn.innerText = database[key].title;

        btn.onclick = () => loadCategory(key);

        categories.appendChild(btn);

    });

}

/* ========================= */

function loadCategory(key) {

    const list = document.getElementById("researchFileList");

    list.innerHTML = "";

    database[key].files.forEach(file => {

        const item = document.createElement("div");

        item.className = "researchFile";

        item.innerHTML = `
<b>${file.name}</b><br>
<small>${file.id}</small>
`;

        item.onclick = () => openDocument(file);

        list.appendChild(item);

    });

}

/* ========================= */

function openDocument(file) {

    document.getElementById("viewerTitle").innerText =
        file.name;

    document.getElementById("viewerLevel").innerText =
        file.clearance;

    const image = document.getElementById("viewerImage");

    if (file.image) {

        image.innerHTML =
        `<img src="${file.image}">`;

    } else {

        image.innerHTML = "";

    }

    document.getElementById("viewerContent").innerText =
        file.text;

}

/* ========================= */

window.openResearchDocument = openDocument;
