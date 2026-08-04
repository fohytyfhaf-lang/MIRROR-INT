import { plants } from "./plantsData.js";

export function showPlants(filteredPlants = plants) {

    const content = document.getElementById("publicContent");

    content.innerHTML = `
        <section class="plantsPage">

            <h1>Plant Database</h1>

            <p class="plantCount">
                Showing <b>${filteredPlants.length}</b> documented species.
            </p>

            <div class="searchBox">

                <input
                    id="publicSearch"
                    type="text"
                    placeholder="Search by name, latin name, region or category..."
                    autocomplete="off"
                >

            </div>

            <div id="plantGrid" class="plantGrid">

                ${filteredPlants.map(plant => `

                    <div class="plantCard">

                        <img
                            class="plantImage"
                            src="${plant.image}"
                            alt="${plant.name}"
                            onerror="this.src='images/plants/placeholder.png'"
                        >

                        <div class="plantBody">

                            <h3>${plant.name}</h3>

                            <p class="latin">${plant.latin}</p>

                            <div class="plantMeta">

                                <span>${plant.category}</span>

                                <span>${plant.region}</span>

                            </div>

                            <p class="plantDescription">

                                ${plant.description}

                            </p>

                            <button class="plantButton">

                                View Details

                            </button>

                        </div>

                    </div>

                `).join("")}

            </div>

        </section>
    `;

    initSearch();
}

function initSearch() {

    const input = document.getElementById("publicSearch");

    if (!input) return;

    input.oninput = () => {

        const text = input.value.toLowerCase().trim();

        const filtered = plants.filter(plant =>

            plant.name.toLowerCase().includes(text) ||
            plant.latin.toLowerCase().includes(text) ||
            plant.category.toLowerCase().includes(text) ||
            plant.region.toLowerCase().includes(text)

        );

        showPlants(filtered);

        const newInput = document.getElementById("publicSearch");

        newInput.value = text;

        newInput.focus();

    };

}
