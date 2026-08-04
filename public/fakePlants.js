import { plants } from "./plantsData.js";

export function showPlants(filteredPlants = plants) {

    const content = document.getElementById("publicContent");

    content.innerHTML = `
        <h2>Plant Database</h2>

        <p>
            Showing <b>${filteredPlants.length}</b> documented species.
        </p>

        <div id="plantGrid" class="plantGrid">

            ${filteredPlants.map(plant => `

                <div class="plantCard">

                    <img
                        src="${plant.image}"
                        alt="${plant.name}"
                        class="plantImage"
                        onerror="this.src='images/plants/placeholder.jpg'"
                    >

                    <h3>${plant.name}</h3>

                    <i>${plant.latin}</i>

                    <div class="plantInfo">

                        <p><strong>Category:</strong> ${plant.category}</p>

                        <p><strong>Region:</strong> ${plant.region}</p>

                    </div>

                    <p class="plantDescription">

                        ${plant.description}

                    </p>

                    <button class="plantButton">
                        View Details
                    </button>

                </div>

            `).join("")}

        </div>
    `;
}
