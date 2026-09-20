import { plants } from "./plantsData.js";


let searchInitialized = false;



/* =========================================================
   PLANT DATABASE
========================================================= */

export function showPlants(
    filteredPlants = plants
) {

    const content =
        document.getElementById(
            "publicContent"
        );


    if (!content) return;


    /*
        Always render the complete database page.
        Home has its own completely separate DOM.
    */

    content.innerHTML = `

        <section
            class="plantsPage"
            id="plantDatabasePage"
        >


            <div class="plantDatabaseHeader">

                <div>

                    <div class="plantDatabaseLabel">
                        AMERICAN BOTANICAL INFORMATION CENTER
                    </div>

                    <h1>
                        Plant Database
                    </h1>

                    <p>
                        Search documented botanical
                        records maintained by ABIC.
                    </p>

                </div>

            </div>



            <!-- DATABASE SEARCH -->

            <div class="plantDatabaseSearchBox">

                <label
                    for="plantDatabaseSearch"
                >
                    SEARCH DATABASE
                </label>


                <input
                    id="plantDatabaseSearch"
                    type="text"
                    placeholder="Search by name, scientific name, region or category..."
                    autocomplete="off"
                >


                <div
                    id="plantDatabaseCount"
                    class="plantDatabaseCount"
                >
                    Showing
                    <b>
                        ${filteredPlants.length}
                    </b>
                    documented species.
                </div>

            </div>



            <!-- DATABASE GRID -->

            <div
                id="plantDatabaseGrid"
                class="plantDatabaseGrid"
            ></div>


        </section>

    `;


    const grid =
        document.getElementById(
            "plantDatabaseGrid"
        );


    renderPlantGrid(
        grid,
        filteredPlants
    );


    /*
        Initialize only this database input.
    */

    searchInitialized = false;

    initSearch();

}



/* =========================================================
   SEARCH
========================================================= */

function initSearch() {

    const input =
        document.getElementById(
            "plantDatabaseSearch"
        );


    if (!input) return;


    if (searchInitialized) {
        return;
    }


    searchInitialized = true;


    input.addEventListener(
        "input",
        () => {

            const query =
                input.value
                    .trim()
                    .toLowerCase();


            /*
                Empty search
            */

            if (!query) {

                updateDatabase(
                    plants
                );

                return;

            }


            const filtered =
                plants.filter(
                    plant => {

                        const name =
                            String(
                                plant.name || ""
                            )
                                .toLowerCase();


                        const latin =
                            String(
                                plant.latin || ""
                            )
                                .toLowerCase();


                        const region =
                            String(
                                plant.region || ""
                            )
                                .toLowerCase();


                        const category =
                            String(
                                plant.category || ""
                            )
                                .toLowerCase();


                        const description =
                            String(
                                plant.description || ""
                            )
                                .toLowerCase();


                        return (

                            name.includes(query) ||

                            latin.includes(query) ||

                            region.includes(query) ||

                            category.includes(query) ||

                            description.includes(query)

                        );

                    }
                );


            updateDatabase(
                filtered,
                query
            );

        }
    );

}



/* =========================================================
   UPDATE DATABASE
========================================================= */

function updateDatabase(
    filteredPlants,
    query = ""
) {

    const grid =
        document.getElementById(
            "plantDatabaseGrid"
        );


    const count =
        document.getElementById(
            "plantDatabaseCount"
        );


    if (!grid) return;


    if (count) {

        count.innerHTML = `

            Showing

            <b>
                ${filteredPlants.length}
            </b>

            documented species.

        `;

    }


    if (
        filteredPlants.length === 0
    ) {

        grid.innerHTML = `

            <div class="plantDatabaseEmpty">

                <strong>
                    No records found.
                </strong>

                ${
                    query
                        ? `
                            <span>
                                No plants match
                                "${escapeHTML(query)}".
                            </span>
                        `
                        : ""
                }

            </div>

        `;

        return;

    }


    renderPlantGrid(
        grid,
        filteredPlants
    );

}



/* =========================================================
   PLANT GRID
========================================================= */

function renderPlantGrid(
    grid,
    list
) {

    if (!grid) return;


    grid.innerHTML =
        list
            .map(plant => {

                const originalIndex =
                    plants.indexOf(
                        plant
                    );


                return `

                    <article
                        class="plantDatabaseCard"
                    >


                        <div class="plantDatabaseImage">

                            <img
                                src="${plant.image}"
                                alt="${escapeHTML(
                                    plant.name
                                )}"
                                onerror="
                                    this.src='images/plants/placeholder.png'
                                "
                            >

                        </div>



                        <div class="plantDatabaseBody">


                            <div
                                class="plantDatabaseCategory"
                            >
                                ${escapeHTML(
                                    plant.category ||
                                    "BOTANY"
                                )}
                            </div>



                            <h3>
                                ${escapeHTML(
                                    plant.name
                                )}
                            </h3>



                            <p
                                class="plantDatabaseLatin"
                            >
                                ${escapeHTML(
                                    plant.latin
                                )}
                            </p>



                            <div
                                class="plantDatabaseMeta"
                            >

                                <span>
                                    ${escapeHTML(
                                        plant.region
                                    )}
                                </span>

                            </div>



                            <p
                                class="plantDatabaseDescription"
                            >
                                ${escapeHTML(
                                    plant.description
                                )}
                            </p>



                            <button
                                class="plantDatabaseButton"
                                data-plant-index="${originalIndex}"
                            >
                                View Details
                            </button>


                        </div>


                    </article>

                `;

            })
            .join("");


    /*
        Details buttons
    */

    grid
        .querySelectorAll(
            ".plantDatabaseButton"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset
                                .plantIndex
                        );


                    const plant =
                        plants[index];


                    if (!plant) return;


                    showPlantDetails(
                        plant
                    );

                }
            );

        });

}



/* =========================================================
   PLANT DETAILS
========================================================= */

function showPlantDetails(
    plant
) {

    const content =
        document.getElementById(
            "publicContent"
        );


    if (!content) return;


    const index =
        plants.indexOf(
            plant
        );


    const reference =
        `ABIC-BOT-${String(
            index + 1
        ).padStart(5, "0")}`;


    content.innerHTML = `

        <section
            class="plantDetails"
            id="plantDatabaseDetails"
        >


            <button
                id="backToPlantDatabase"
                class="plantDatabaseBackButton"
            >
                ← Back to Plant Database
            </button>



            <div
                class="plantDetailsHeader"
            >


                <div
                    class="plantDetailsImage"
                >

                    <img
                        src="${plant.image}"
                        alt="${escapeHTML(
                            plant.name
                        )}"
                        onerror="
                            this.src='images/plants/placeholder.png'
                        "
                    >

                </div>



                <div
                    class="plantDetailsTitle"
                >

                    <div
                        class="plantDatabaseLabel"
                    >
                        ABIC PLANT RECORD
                    </div>


                    <h1>
                        ${escapeHTML(
                            plant.name
                        )}
                    </h1>


                    <p class="latin">
                        ${escapeHTML(
                            plant.latin
                        )}
                    </p>

                </div>


            </div>



            <div
                class="plantDetailsInfo"
            >


                <div
                    class="plantInfoBlock"
                >

                    <span
                        class="infoLabel"
                    >
                        COMMON NAME
                    </span>

                    <strong>
                        ${escapeHTML(
                            plant.name
                        )}
                    </strong>

                </div>



                <div
                    class="plantInfoBlock"
                >

                    <span
                        class="infoLabel"
                    >
                        SCIENTIFIC NAME
                    </span>

                    <strong>
                        ${escapeHTML(
                            plant.latin
                        )}
                    </strong>

                </div>



                <div
                    class="plantInfoBlock"
                >

                    <span
                        class="infoLabel"
                    >
                        CATEGORY
                    </span>

                    <strong>
                        ${escapeHTML(
                            plant.category
                        )}
                    </strong>

                </div>



                <div
                    class="plantInfoBlock"
                >

                    <span
                        class="infoLabel"
                    >
                        DISTRIBUTION
                    </span>

                    <strong>
                        ${escapeHTML(
                            plant.region
                        )}
                    </strong>

                </div>



                <div
                    class="plantInfoBlock"
                >

                    <span
                        class="infoLabel"
                    >
                        ABIC STATUS
                    </span>

                    <strong>
                        Verified
                    </strong>

                </div>



                <div
                    class="plantInfoBlock"
                >

                    <span
                        class="infoLabel"
                    >
                        REFERENCE
                    </span>

                    <strong>
                        ${reference}
                    </strong>

                </div>


            </div>



            <div
                class="plantDescriptionFull"
            >

                <h2>
                    Description
                </h2>


                <p>
                    ${escapeHTML(
                        plant.description
                    )}
                </p>

            </div>


        </section>

    `;


    const back =
        document.getElementById(
            "backToPlantDatabase"
        );


    if (back) {

        back.addEventListener(
            "click",
            () => {

                showPlants();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}



/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(
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
