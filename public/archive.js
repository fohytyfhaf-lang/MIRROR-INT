
/* =========================================================
   ABIC ARCHIVE
========================================================= */

import { recordArchiveOpen } from "./memberAccess.js";


const ARCHIVE_RECORDS = [

    {
        id: "ARCH-012",
        year: "2018",
        type: "Botanical Survey",
        status: "PUBLIC",
        title: "Northern Flora Survey",
        description:
            "A regional survey documenting plant species observed across northern forest environments.",
        text:
            "This record contains field observations, specimen references and regional distribution notes collected during the Northern Flora Survey."
    },


    {
        id: "ARCH-031",
        year: "2019",
        type: "Collection Index",
        status: "PUBLIC",
        title: "Forest Collection Index",
        description:
            "Index of botanical specimens catalogued from temperate forest collections.",
        text:
            "The collection index contains specimen identifiers, collection dates and general geographic information."
    },


    {
        id: "ARCH-044",
        year: "2020",
        type: "Correspondence",
        status: "PUBLIC",
        title: "Research Correspondence",
        description:
            "Selected correspondence concerning botanical research and collection management.",
        text:
            "This archive contains correspondence between researchers regarding specimen verification, collection storage and field documentation."
    },


    {
        id: "ARCH-047",
        year: "UNKNOWN",
        type: "Restricted Record",
        status: "RESTRICTED",
        title: "Archive Record 047",
        description:
            "Document unavailable through normal public archive access.",
        text:
            "This document is not available through the public archive service.\n\nAccess to the referenced material is restricted."
    },


    {
        id: "ARCH-052",
        year: "2021",
        type: "Field Notes",
        status: "PUBLIC",
        title: "Desert Collection Notes",
        description:
            "Field documentation from botanical collections conducted in arid environments.",
        text:
            "The record contains observations concerning drought-resistant plant species and regional collection conditions."
    },


    {
        id: "ARCH-063",
        year: "2022",
        type: "Revision Log",
        status: "PUBLIC",
        title: "Herbarium Revision Log",
        description:
            "Revision history for selected ABIC herbarium records.",
        text:
            "This document records taxonomic corrections, specimen updates and changes made to selected herbarium entries."
    }

];



/* =========================================================
   PUBLIC API
========================================================= */

export function showArchive() {

    const content =
        document.getElementById("publicContent");


    if (!content) return;


    content.innerHTML = `

        <section class="abicArchivePage">

            <header class="abicArchiveHeader">

                <div class="abicSimpleLabel">
                    ABIC DOCUMENT ARCHIVE
                </div>

                <h1>
                    Archive
                </h1>

                <p>
                    Historical records, research
                    documentation and selected
                    institutional materials.
                </p>

            </header>


            <div
                id="abicArchiveGrid"
                class="abicArchiveGrid"
            ></div>


            <div
                id="abicArchiveViewer"
                class="abicArchiveViewer hidden"
            ></div>

        </section>

    `;


    renderArchive();
}



/* =========================================================
   RENDER ARCHIVE
========================================================= */

function renderArchive() {

    const grid =
        document.getElementById(
            "abicArchiveGrid"
        );


    if (!grid) return;


    grid.innerHTML =
        ARCHIVE_RECORDS
            .map(record => {

                const restricted =
                    record.status === "RESTRICTED";


                return `

                    <article
                        class="abicArchiveCard"
                        data-record-id="${escapeAttribute(
                            record.id
                        )}"
                    >

                        <div class="abicArchiveMeta">

                            <span>
                                ${escapeHTML(record.id)}
                            </span>

                            <span
                                class="${
                                    restricted
                                        ? "abicArchiveRestricted"
                                        : ""
                                }"
                            >
                                ${escapeHTML(record.status)}
                            </span>

                        </div>


                        <h2>
                            ${escapeHTML(record.title)}
                        </h2>


                        <p>
                            ${escapeHTML(record.description)}
                        </p>


                        <button
                            class="abicArchiveButton"
                            data-record-id="${escapeAttribute(
                                record.id
                            )}"
                        >
                            ${
                                restricted
                                    ? "View record"
                                    : "Open record"
                            }
                        </button>

                    </article>

                `;

            })
            .join("");


    grid
        .querySelectorAll(
            ".abicArchiveButton"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const recordId =
                        button.dataset.recordId;


                    openArchiveRecord(
                        recordId
                    );

                }
            );

        });

}



/* =========================================================
   OPEN RECORD
========================================================= */

function openArchiveRecord(recordId) {

    const record =
        ARCHIVE_RECORDS.find(
            item =>
                item.id === recordId
        );


    if (!record) return;


    const viewer =
        document.getElementById(
            "abicArchiveViewer"
        );


    if (!viewer) return;


    const restricted =
        record.status === "RESTRICTED";


    /*
        Notify the ABIC member progression
        system.

        Opening the same record repeatedly
        will not increase the archive counter.
    */

    recordArchiveOpen(
        record.id,
        restricted
    );


    viewer.classList.remove(
        "hidden"
    );


    viewer.innerHTML = `

        <div class="abicArchiveMeta">

            <span>
                ${escapeHTML(record.id)}
            </span>

            <span
                class="${
                    restricted
                        ? "abicArchiveRestricted"
                        : ""
                }"
            >
                ${escapeHTML(record.status)}
            </span>

        </div>


        <h2>
            ${escapeHTML(record.title)}
        </h2>


        <p>
            ${escapeHTML(record.text)}
        </p>

    `;


    viewer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    /*
        Optional public event.
        Other ABIC systems can listen to
        archive openings without directly
        depending on this module.
    */

    window.dispatchEvent(
        new CustomEvent(
            "abic:archiveOpened",
            {
                detail: {
                    recordId: record.id,
                    restricted
                }
            }
        )
    );

}



/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}
