import { plants } from "./plantsData.js";


let searchInitialized = false;


/* =========================================================
   PLANT DATABASE
========================================================= */

export function showPlants(filteredPlants = plants) {

    const content =
        document.getElementById("publicContent");

    if (!content) return;


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
                        Search and browse documented
                        botanical records maintained by ABIC.
                    </p>

                </div>

            </div>


            <!-- =================================================
                 CONTROLS
            ================================================= -->

            <div class="plantDatabaseControls">

                <div class="plantDatabaseSearchField">

                    <label for="plantDatabaseSearch">
                        SEARCH DATABASE
                    </label>

                    <input
                        id="plantDatabaseSearch"
                        type="text"
                        placeholder="Search by name, scientific name, region or category..."
                        autocomplete="off"
                    >

                </div>


                <div class="plantDatabaseFilterField">

                    <label for="plantCategoryFilter">
                        CATEGORY
                    </label>

                    <select id="plantCategoryFilter">

                        <option value="all">
                            All categories
                        </option>

                    </select>

                </div>


                <div class="plantDatabaseFilterField">

                    <label for="plantRegionFilter">
                        REGION
                    </label>

                    <select id="plantRegionFilter">

                        <option value="all">
                            All regions
                        </option>

                    </select>

                </div>


                <div class="plantDatabaseFilterField">

                    <label for="plantSort">
                        SORT
                    </label>

                    <select id="plantSort">

                        <option value="default">
                            Default
                        </option>

                        <option value="name-asc">
                            Name A–Z
                        </option>

                        <option value="name-desc">
                            Name Z–A
                        </option>

                        <option value="latin-asc">
                            Scientific Name A–Z
                        </option>

                    </select>

                </div>

            </div>


            <div class="plantDatabaseStatus">

                <span id="plantDatabaseCount">
                    Showing
                    <b>${filteredPlants.length}</b>
                    documented species.
                </span>

                <button
                    id="plantDatabaseReset"
                    class="plantDatabaseReset"
                >
                    Reset filters
                </button>

            </div>


            <!-- =================================================
                 GRID
            ================================================= -->

            <div
                id="plantDatabaseGrid"
                class="plantDatabaseGrid"
            ></div>

        </section>

    `;


    initializeFilters();

    updateDatabase(
        filteredPlants
    );

}



/* =========================================================
   INITIALIZE FILTERS
========================================================= */

function initializeFilters() {

    const search =
        document.getElementById(
            "plantDatabaseSearch"
        );

    const category =
        document.getElementById(
            "plantCategoryFilter"
        );

    const region =
        document.getElementById(
            "plantRegionFilter"
        );

    const sort =
        document.getElementById(
            "plantSort"
        );

    const reset =
        document.getElementById(
            "plantDatabaseReset"
        );


    if (
        !search ||
        !category ||
        !region ||
        !sort ||
        !reset
    ) {
        return;
    }


    populateFilters(
        category,
        region
    );


    const update =
        () => {

            const query =
                search.value
                    .trim()
                    .toLowerCase();


            const categoryValue =
                category.value;


            const regionValue =
                region.value;


            const sortValue =
                sort.value;


            let result =
                plants.filter(
                    plant => {

                        const name =
                            String(
                                plant.name || ""
                            ).toLowerCase();


                        const latin =
                            String(
                                plant.latin || ""
                            ).toLowerCase();


                        const plantRegion =
                            String(
                                plant.region || ""
                            );


                        const plantCategory =
                            String(
                                plant.category || ""
                            );


                        const description =
                            String(
                                plant.description || ""
                            ).toLowerCase();


                        const matchesSearch =
                            !query ||
                            name.includes(query) ||
                            latin.includes(query) ||
                            plantRegion
                                .toLowerCase()
                                .includes(query) ||
                            plantCategory
                                .toLowerCase()
                                .includes(query) ||
                            description.includes(query);


                        const matchesCategory =
                            categoryValue === "all" ||
                            plantCategory === categoryValue;


                        const matchesRegion =
                            regionValue === "all" ||
                            plantRegion === regionValue;


                        return (
                            matchesSearch &&
                            matchesCategory &&
                            matchesRegion
                        );

                    }
                );


            result =
                sortPlants(
                    result,
                    sortValue
                );


            updateDatabase(
                result,
                query
            );

        };


    search.addEventListener(
        "input",
        update
    );


    category.addEventListener(
        "change",
        update
    );


    region.addEventListener(
        "change",
        update
    );


    sort.addEventListener(
        "change",
        update
    );


    reset.addEventListener(
        "click",
        () => {

            search.value = "";

            category.value = "all";

            region.value = "all";

            sort.value = "default";

            update();

        }
    );

}



/* =========================================================
   FILTER OPTIONS
========================================================= */

function populateFilters(
    categorySelect,
    regionSelect
) {

    const categories =
        [
            ...new Set(
                plants
                    .map(
                        plant =>
                            plant.category
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                String(a)
                    .localeCompare(
                        String(b)
                    )
        );


    const regions =
        [
            ...new Set(
                plants
                    .map(
                        plant =>
                            plant.region
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                String(a)
                    .localeCompare(
                        String(b)
                    )
        );


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            categorySelect.appendChild(
                option
            );

        }
    );


    regions.forEach(
        region => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                region;

            option.textContent =
                region;

            regionSelect.appendChild(
                option
            );

        }
    );

}



/* =========================================================
   SORT
========================================================= */

function sortPlants(
    list,
    mode
) {

    const result =
        [...list];


    switch (mode) {

        case "name-asc":

            result.sort(
                (a, b) =>
                    String(a.name || "")
                        .localeCompare(
                            String(b.name || "")
                        )
            );

            break;


        case "name-desc":

            result.sort(
                (a, b) =>
                    String(b.name || "")
                        .localeCompare(
                            String(a.name || "")
                        )
            );

            break;


        case "latin-asc":

            result.sort(
                (a, b) =>
                    String(a.latin || "")
                        .localeCompare(
                            String(b.latin || "")
                        )
            );

            break;

    }


    return result;

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
                        : `
                            <span>
                                Try changing the selected filters.
                            </span>
                        `
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

                        <div
                            class="plantDatabaseImage"
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
                            class="plantDatabaseBody"
                        >

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

                <div class="plantInfoBlock">

                    <span class="infoLabel">
                        COMMON NAME
                    </span>

                    <strong>
                        ${escapeHTML(
                            plant.name
                        )}
                    </strong>

                </div>


                <div class="plantInfoBlock">

                    <span class="infoLabel">
                        SCIENTIFIC NAME
                    </span>

                    <strong>
                        ${escapeHTML(
                            plant.latin
                        )}
                    </strong>

                </div>


                <div class="plantInfoBlock">

                    <span class="infoLabel">
                        CATEGORY
                    </span>

                    <strong>
                        ${escapeHTML(
                            plant.category
                        )}
                    </strong>

                </div>


                <div class="plantInfoBlock">

                    <span class="infoLabel">
                        DISTRIBUTION
                    </span>

                    <strong>
                        ${escapeHTML(
                            plant.region
                        )}
                    </strong>

                </div>


                <div class="plantInfoBlock">

                    <span class="infoLabel">
                        ABIC STATUS
                    </span>

                    <strong>
                        Verified
                    </strong>

                </div>


                <div class="plantInfoBlock">

                    <span class="infoLabel">
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

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
