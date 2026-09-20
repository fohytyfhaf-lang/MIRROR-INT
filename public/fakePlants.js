import { plants } from "./plantsData.js";


export function showPlants(filteredPlants = plants){

    /*
     * If #plantGrid already exists,
     * we are on the HOME page.
     *
     * Do not replace the whole publicContent.
     */

    const existingGrid =
        document.getElementById("plantGrid");


    if(existingGrid){

        renderPlantGrid(
            existingGrid,
            filteredPlants.slice(0, 6)
        );

        initSearch();

        return;

    }


    /*
     * Otherwise open the full Plant Database page.
     */

    const content =
        document.getElementById("publicContent");


    if(!content) return;


    content.innerHTML = `

        <section class="plantsPage">

            <h1>Plant Database</h1>

            <p class="plantCount">

                Showing
                <b>${filteredPlants.length}</b>
                documented species.

            </p>


            <div class="searchBox">

                <input
                    id="publicSearch"
                    type="text"
                    placeholder="Search by name, latin name, region or category..."
                    autocomplete="off"
                >

            </div>


            <div
                id="plantGrid"
                class="plantGrid"
            ></div>

        </section>

    `;


    const grid =
        document.getElementById("plantGrid");


    renderPlantGrid(
        grid,
        filteredPlants
    );


    initSearch();

}


/*
 * Render plant cards
 */

function renderPlantGrid(grid, list){

    if(!grid) return;


    grid.innerHTML = list
        .map((plant, index) => `

            <div class="plantCard">

                <img
                    class="plantImage"
                    src="${plant.image}"
                    alt="${plant.name}"
                    onerror="this.src='images/plants/placeholder.png'"
                >


                <div class="plantBody">

                    <h3>
                        ${plant.name}
                    </h3>


                    <p class="latin">
                        ${plant.latin}
                    </p>


                    <div class="plantMeta">

                        <span>
                            ${plant.category}
                        </span>

                        <span>
                            ${plant.region}
                        </span>

                    </div>


                    <p class="plantDescription">

                        ${plant.description}

                    </p>


                    <button
                        class="plantButton"
                        data-plant-index="${plants.indexOf(plant)}"
                    >

                        View Details

                    </button>

                </div>

            </div>

        `)
        .join("");


    /*
     * Activate View Details buttons
     */

    grid.querySelectorAll(".plantButton")
        .forEach(button => {

            button.addEventListener("click", () => {

                const index =
                    Number(
                        button.dataset.plantIndex
                    );


                const plant =
                    plants[index];


                if(!plant) return;


                showPlantDetails(plant);

            });

        });

}


/*
 * Plant Details page
 */

function showPlantDetails(plant){

    const content =
        document.getElementById("publicContent");


    if(!content) return;


    content.innerHTML = `

        <section class="plantDetails">

            <button
                id="backToPlants"
                class="backButton"
            >

                ← Back to Plant Database

            </button>


            <div class="plantDetailsHeader">

                <div class="plantDetailsImage">

                    <img
                        src="${plant.image}"
                        alt="${plant.name}"
                        onerror="this.src='images/plants/placeholder.png'"
                    >

                </div>


                <div class="plantDetailsTitle">

                    <p class="recordLabel">
                        ABIC PLANT RECORD
                    </p>

                    <h1>
                        ${plant.name}
                    </h1>

                    <p class="latin">
                        ${plant.latin}
                    </p>

                </div>

            </div>


            <div class="plantDetailsInfo">


                <div class="plantInfoBlock">

                    <span class="infoLabel">
                        COMMON NAME
                    </span>

                    <strong>
                        ${plant.name}
                    </strong>

                </div>


                <div class="plantInfoBlock">

                    <span class="infoLabel">
                        SCIENTIFIC NAME
                    </span>

                    <strong>
                        ${plant.latin}
                    </strong>

                </div>


                <div class="plantInfoBlock">

                    <span class="infoLabel">
                        CATEGORY
                    </span>

                    <strong>
                        ${plant.category}
                    </strong>

                </div>


                <div class="plantInfoBlock">

                    <span class="infoLabel">
                        DISTRIBUTION
                    </span>

                    <strong>
                        ${plant.region}
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
                        ABIC-BOT-${String(
                            plants.indexOf(plant) + 1
                        ).padStart(5, "0")}
                    </strong>

                </div>


            </div>


            <div class="plantDescriptionFull">

                <h2>
                    Description
                </h2>

                <p>
                    ${plant.description}
                </p>

            </div>


        </section>

    `;


    /*
     * Back button
     */

    const backButton =
        document.getElementById("backToPlants");


    if(backButton){

        backButton.addEventListener("click", () => {

            showPlants();

        });

    }

}
