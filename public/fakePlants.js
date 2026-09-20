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


function renderPlantGrid(grid, list){

    if(!grid) return;


    grid.innerHTML = list
        .map(plant => `

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


                    <button class="plantButton">

                        View Details

                    </button>

                </div>

            </div>

        `)
        .join("");

}


function initSearch(){

    const input =
        document.getElementById("publicSearch");


    if(!input) return;


    /*
     * Prevent duplicate search listeners.
     */

    if(input.dataset.searchInitialized === "true"){
        return;
    }


    input.dataset.searchInitialized = "true";


    input.addEventListener("input", () => {

        const text =
            input.value
                .toLowerCase()
                .trim();


        const filtered =
            plants.filter(plant =>

                plant.name
                    .toLowerCase()
                    .includes(text)

                ||

                plant.latin
                    .toLowerCase()
                    .includes(text)

                ||

                plant.category
                    .toLowerCase()
                    .includes(text)

                ||

                plant.region
                    .toLowerCase()
                    .includes(text)

            );


        const grid =
            document.getElementById("plantGrid");


        if(grid){

            const isHome =
                document.getElementById("featuredPlants") !== null;


            renderPlantGrid(
                grid,
                isHome
                    ? filtered.slice(0, 6)
                    : filtered
            );

        }


        const count =
            document.querySelector(".plantCount");


        if(count){

            count.innerHTML = `
                Showing
                <b>${filtered.length}</b>
                documented species.
            `;

        }

    });

}
